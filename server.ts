import 'dotenv/config';
import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BusinessMongoRepository } from './server/db/mongoRepository';
import { MOCK_ACCOUNTS } from './src/data/seedData';
import {
  generateDailyActivitiesCsvReport,
  getDailyActivitiesReportFilename,
  getTodayDateKey,
  normalizeOrderStatus,
} from './src/utils/businessLogic';
import type { BusinessOrder } from './src/types/business';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toAndroidOrderDto(o: BusinessOrder) {
  return {
    id: o.id,
    trackingNumber: o.trackingNumber,
    senderName: o.senderName,
    senderAddress: o.senderAddress,
    recipientName: o.recipientName,
    recipientAddress: o.recipientAddress,
    statusName: o.status,
    status: o.status,
    serviceType: o.serviceType,
    feeVnd: o.feeVnd,
    codVnd: o.codVnd,
    createdAt: o.createdAt,
    estimatedDelivery: o.estimatedDelivery,
    weightKg: o.weightKg,
    timestampMillis: o.timestampMillis ?? Date.now(),
  };
}

function fromAndroidOrWebOrder(raw: Record<string, unknown>): BusinessOrder {
  const now = Date.now();
  return {
    id: String(raw.id || `ORD-${now}`),
    trackingNumber: String(
      raw.trackingNumber || `OPS-${Math.floor(10000 + Math.random() * 90000)}`
    ),
    senderName: String(raw.senderName || 'Phòng Vận Hành Chi nhánh'),
    senderAddress: String(raw.senderAddress || 'Công việc mới tạo trên ứng dụng'),
    recipientName: String(raw.recipientName || 'Nhân sự phụ trách'),
    recipientAddress: String(raw.recipientAddress || 'Trụ sở Hà Nội'),
    status: normalizeOrderStatus(String(raw.status ?? raw.statusName ?? 'PENDING')),
    serviceType: String(raw.serviceType || 'Vận hành'),
    feeVnd: Number(raw.feeVnd ?? 0),
    codVnd: Number(raw.codVnd ?? 0),
    createdAt: String(raw.createdAt || 'Vừa khởi tạo'),
    estimatedDelivery: String(raw.estimatedDelivery || 'Hạn hôm nay'),
    weightKg: Number(raw.weightKg ?? 1),
    timestampMillis: Number(raw.timestampMillis ?? now),
  };
}

async function startServer() {
  const repo = new BusinessMongoRepository();
  const dbMode = await repo.connectAndSeed(process.env.MONGODB_URI);
  console.log(`Database initialized in mode: ${dbMode}`);

  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (_req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Health endpoint (Web + Android Studio)
  app.get(['/api/health', '/health'], async (_req, res) => {
    const health = await repo.getHealth();
    res.json(health);
  });

  // Streamlined workspace snapshot for Web & Android companion app
  app.get(['/api/workspace', '/workspace'], async (_req, res) => {
    const snapshot = await repo.getWorkspaceSnapshot();
    res.json(snapshot);
  });

  // Orders / Tasks REST API (shared between Web UI and Android Studio OrderApi.kt)
  app.get(['/orders', '/api/orders'], async (_req, res) => {
    const orders = await repo.listOrders();
    res.json(orders.map(toAndroidOrderDto));
  });

  app.post(['/orders', '/api/orders'], async (req, res) => {
    const body = req.body as Record<string, unknown>;
    if (!body || !body.id) {
      res.status(400).json({ error: 'Missing order id' });
      return;
    }
    const order = await repo.upsertOrder(fromAndroidOrWebOrder(body));
    res.status(201).json(toAndroidOrderDto(order));
  });

  app.post(['/orders/bulk', '/api/orders/bulk'], async (req, res) => {
    const items = Array.isArray(req.body) ? req.body : [];
    const incoming = items
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map(fromAndroidOrWebOrder);
    const imported = await repo.bulkUpsertOrders(incoming);
    const total = (await repo.listOrders()).length;
    res.status(201).json({ imported, total });
  });

  app.patch(['/orders/:id/status', '/api/orders/:id/status'], async (req, res) => {
    const { id } = req.params;
    const rawStatus = String(req.body?.status ?? req.body?.statusName ?? '');
    if (!rawStatus) {
      res.status(400).json({ error: 'Missing statusName' });
      return;
    }
    const nextStatus = await repo.updateOrderStatus(id, rawStatus);
    if (!nextStatus) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.status(200).json({ id, status: nextStatus });
  });

  app.delete(['/orders/:id', '/api/orders/:id'], async (req, res) => {
    const { id } = req.params;
    await repo.deleteOrder(id);
    res.status(200).json({ deleted: id });
  });

  // GPS Check-in persisted in MongoDB
  app.post(['/api/checkin', '/checkin'], async (req, res) => {
    const branchName = typeof req.body?.branchName === 'string' ? req.body.branchName : undefined;
    const userName = typeof req.body?.userName === 'string' ? req.body.userName : undefined;
    const coordinates =
      typeof req.body?.coordinates === 'string' ? req.body.coordinates : undefined;
    const result = await repo.performCheckIn({ branchName, userName, coordinates });
    res.json(result);
  });

  // Reset sample operational data
  app.post(['/api/workspace/reset', '/workspace/reset'], async (_req, res) => {
    const snapshot = await repo.resetWorkspace();
    res.json(snapshot);
  });

  // Downloadable daily activities summary CSV report for enterprise reporting
  app.get(['/api/reports/daily-activities.csv', '/reports/daily-activities.csv'], async (_req, res) => {
    const snapshot = await repo.getWorkspaceSnapshot();
    const reportDate = getTodayDateKey();
    const csv = generateDailyActivitiesCsvReport({
      activities: snapshot.activities,
      orders: snapshot.orders,
      activeBranch: snapshot.activeBranch,
      attendanceCount: snapshot.attendanceCount,
      isCheckedInToday: snapshot.isCheckedInToday,
      latestCheckIn: snapshot.latestCheckIn,
      reportDate,
    });
    const filename = getDailyActivitiesReportFilename(reportDate);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  });

  // Company notifications REST API (Supervisor broadcast + Employee inbox)
  app.get(['/api/notifications', '/notifications'], async (_req, res) => {
    const notifications = await repo.listNotifications();
    res.json(notifications);
  });

  app.post(['/api/notifications', '/notifications'], async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const senderId = typeof body?.senderId === 'string' ? body.senderId : 'ACC-SUP-01';
    const sender = MOCK_ACCOUNTS.find((a) => a.id === senderId);

    if (sender && sender.role !== 'SUPERVISOR') {
      res.status(403).json({ error: 'Chỉ tài khoản Cấp trên mới có quyền gửi thông báo công ty.' });
      return;
    }
    if (!title || !message) {
      res.status(400).json({ error: 'Thiếu tiêu đề hoặc nội dung thông báo.' });
      return;
    }

    const priorityRaw = String(body?.priority ?? 'NORMAL').toUpperCase();
    const priority =
      priorityRaw === 'URGENT' || priorityRaw === 'IMPORTANT' ? priorityRaw : 'NORMAL';
    const audienceRaw = String(body?.audience ?? 'ALL_STAFF').toUpperCase();
    const validAudiences = ['ALL_STAFF', 'SUBORDINATES', 'SUPERVISORS', 'BRANCH', 'INDIVIDUAL'];
    const audience = validAudiences.includes(audienceRaw)
      ? (audienceRaw as 'ALL_STAFF' | 'SUBORDINATES' | 'SUPERVISORS' | 'BRANCH' | 'INDIVIDUAL')
      : 'ALL_STAFF';

    const notification = await repo.sendNotification({
      title,
      message,
      priority,
      audience,
      targetBranch: typeof body?.targetBranch === 'string' ? body.targetBranch : undefined,
      targetAccountId:
        typeof body?.targetAccountId === 'string' ? body.targetAccountId : undefined,
      senderId,
    });
    res.status(201).json(notification);
  });

  app.post(['/api/notifications/:id/read', '/notifications/:id/read'], async (req, res) => {
    const { id } = req.params;
    const accountId =
      typeof req.body?.accountId === 'string' ? req.body.accountId : 'ACC-SUP-01';
    const updated = await repo.markNotificationRead(id, accountId);
    if (!updated) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json(updated);
  });

  app.post(['/api/notifications/read-all', '/notifications/read-all'], async (req, res) => {
    const accountId =
      typeof req.body?.accountId === 'string' ? req.body.accountId : 'ACC-SUP-01';
    const notifications = await repo.markAllNotificationsRead(accountId);
    res.json(notifications);
  });

  const httpServer = http.createServer(app);

  // Vite dev middleware vs Production static serving
  const isProd = process.env.NODE_ENV === 'production';
  const disableHmr = process.env.DISABLE_HMR === 'true';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: disableHmr ? false : { server: httpServer },
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Business Manage server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
