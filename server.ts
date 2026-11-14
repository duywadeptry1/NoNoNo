import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getDefaultDriver,
  getDefaultOrders,
  getDefaultPaymentShares,
  getDefaultRevenues,
  getDefaultServices,
  getDefaultTrackingSteps,
  getDefaultWeeklySchedule,
} from './src/data/seedData';
import {
  mergeOrdersUpsert,
  normalizeOrderStatus,
  parseImportCsvPayload,
  parseImportJsonPayload,
} from './src/utils/businessLogic';
import type { BusinessOrder, WorkspaceSnapshot } from './src/types/business';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createInitialState(): WorkspaceSnapshot {
  return {
    orders: getDefaultOrders(),
    services: getDefaultServices(),
    dailyRevenues: getDefaultRevenues(),
    paymentShares: getDefaultPaymentShares(),
    activeDriver: getDefaultDriver(),
    trackingSteps: getDefaultTrackingSteps(),
    weeklySchedule: getDefaultWeeklySchedule(),
    isCheckedInToday: false,
    attendanceCount: 124,
  };
}

let state: WorkspaceSnapshot = createInitialState();

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
  return {
    id: String(raw.id || `ORD-${Date.now()}`),
    trackingNumber: String(raw.trackingNumber || `PRJ-${Math.floor(10000 + Math.random() * 90000)}-BM`),
    senderName: String(raw.senderName || 'Phòng Kinh Doanh B2B'),
    senderAddress: String(raw.senderAddress || 'Dự án Triển khai Giải pháp Doanh nghiệp'),
    recipientName: String(raw.recipientName || 'Khách Hàng Mới'),
    recipientAddress: String(raw.recipientAddress || 'Trụ sở Chính'),
    status: normalizeOrderStatus(String(raw.status ?? raw.statusName ?? 'PENDING')),
    serviceType: String(raw.serviceType || 'Kinh Doanh B2B'),
    feeVnd: Number(raw.feeVnd ?? 0),
    codVnd: Number(raw.codVnd ?? 0),
    createdAt: String(raw.createdAt || 'Vừa khởi tạo'),
    estimatedDelivery: String(raw.estimatedDelivery || 'Hạn duyệt hôm nay'),
    weightKg: Number(raw.weightKg ?? 1),
    timestampMillis: Number(raw.timestampMillis ?? Date.now()),
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

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

  // Health endpoints (Web + Android)
  app.get(['/api/health', '/health'], (_req, res) => {
    res.json({
      ok: true,
      service: 'business-manage-api',
      storage: process.env.MONGODB_URI ? 'mongodb-configured' : 'in-memory-seeded',
      ordersCount: state.orders.length,
    });
  });

  // Full workspace snapshot for Web client
  app.get('/api/workspace', (_req, res) => {
    res.json(state);
  });

  // Orders REST API (shared between Web UI and Android Studio OrderApi.kt)
  app.get(['/orders', '/api/orders'], (_req, res) => {
    const sorted = [...state.orders].sort(
      (a, b) => (b.timestampMillis ?? 0) - (a.timestampMillis ?? 0)
    );
    res.json(sorted.map(toAndroidOrderDto));
  });

  app.post(['/orders', '/api/orders'], (req, res) => {
    const body = req.body as Record<string, unknown>;
    if (!body || !body.id) {
      res.status(400).json({ error: 'Missing order id' });
      return;
    }
    const order = fromAndroidOrWebOrder(body);
    state.orders = mergeOrdersUpsert(state.orders, [order]);
    res.status(201).json(toAndroidOrderDto(order));
  });

  app.post(['/orders/bulk', '/api/orders/bulk'], (req, res) => {
    const items = Array.isArray(req.body) ? req.body : [];
    const incoming = items
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map(fromAndroidOrWebOrder);
    state.orders = mergeOrdersUpsert(state.orders, incoming);
    res.status(201).json({ imported: incoming.length, total: state.orders.length });
  });

  app.patch(['/orders/:id/status', '/api/orders/:id/status'], (req, res) => {
    const { id } = req.params;
    const rawStatus = String(req.body?.status ?? req.body?.statusName ?? '');
    if (!rawStatus) {
      res.status(400).json({ error: 'Missing statusName' });
      return;
    }
    const nextStatus = normalizeOrderStatus(rawStatus);
    state.orders = state.orders.map((o) => (o.id === id ? { ...o, status: nextStatus } : o));
    res.status(200).json({ id, status: nextStatus });
  });

  app.delete(['/orders/:id', '/api/orders/:id'], (req, res) => {
    const { id } = req.params;
    state.orders = state.orders.filter((o) => o.id !== id);
    res.status(200).json({ deleted: id });
  });

  // GPS Check-in
  app.post('/api/checkin', (_req, res) => {
    if (!state.isCheckedInToday) {
      state.isCheckedInToday = true;
      state.attendanceCount += 1;
      state.activeDriver = {
        ...state.activeDriver,
        licensePlate: `HQ-HANOI-01 • ${state.attendanceCount}/130 Nhân sự có mặt`,
        etaMinutes: state.activeDriver.etaMinutes + 1,
      };
    }
    res.json({
      isCheckedInToday: state.isCheckedInToday,
      attendanceCount: state.attendanceCount,
      activeDriver: state.activeDriver,
    });
  });

  // Database JSON/CSV Import & Reset
  app.post('/api/workspace/import-json', (req, res) => {
    const payload = String(req.body?.payload ?? '');
    const parsed = parseImportJsonPayload(payload);
    if (parsed.summary.errorMessage) {
      res.status(400).json({ summary: parsed.summary });
      return;
    }
    if (parsed.orders.length > 0) {
      state.orders = mergeOrdersUpsert(state.orders, parsed.orders);
    }
    if (parsed.services.length > 0) {
      const map = new Map(state.services.map((s) => [s.id, s]));
      for (const s of parsed.services) map.set(s.id, s);
      state.services = Array.from(map.values());
    }
    if (parsed.revenues.length > 0) {
      state.dailyRevenues = parsed.revenues;
    }
    if (parsed.paymentShares.length > 0) {
      state.paymentShares = parsed.paymentShares;
    }
    res.json({ summary: parsed.summary, workspace: state });
  });

  app.post('/api/workspace/import-csv', (req, res) => {
    const payload = String(req.body?.payload ?? '');
    const parsed = parseImportCsvPayload(payload);
    if (parsed.summary.errorMessage) {
      res.status(400).json({ summary: parsed.summary });
      return;
    }
    state.orders = mergeOrdersUpsert(state.orders, parsed.orders);
    res.json({ summary: parsed.summary, workspace: state });
  });

  app.post('/api/workspace/reset', (_req, res) => {
    state = createInitialState();
    res.json(state);
  });

  // Vite dev middleware vs Production static serving
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
  app.listen(port, '0.0.0.0', () => {
    console.log(`Business Manage server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
