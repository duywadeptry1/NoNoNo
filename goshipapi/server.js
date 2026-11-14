require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const OrderSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    trackingNumber: { type: String, index: true },
    senderName: String,
    senderAddress: String,
    recipientName: String,
    recipientAddress: String,
    status: { type: String, default: 'PENDING', index: true },
    statusName: { type: String, default: 'PENDING' },
    serviceType: String,
    feeVnd: Number,
    codVnd: Number,
    createdAt: String,
    estimatedDelivery: String,
    weightKg: Number,
    timestampMillis: { type: Number, index: true },
  },
  { versionKey: false, collection: 'orders' }
);

const CheckInSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    userName: String,
    branchName: String,
    coordinates: String,
    checkedInAt: String,
    dateKey: { type: String, index: true },
    timestampMillis: { type: Number, index: true },
  },
  { versionKey: false, collection: 'checkins' }
);

const ActivitySchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    type: String,
    title: String,
    description: String,
    timestamp: String,
    timestampMillis: { type: Number, index: true },
  },
  { versionKey: false, collection: 'activities' }
);

const Order = mongoose.model('Order', OrderSchema);
const CheckIn = mongoose.model('CheckIn', CheckInSchema);
const Activity = mongoose.model('Activity', ActivitySchema);

const app = express();
app.use(cors(), express.json());

const memoryOrders = new Map();
const memoryCheckIns = [];
const memoryActivities = [];
let mongoConnected = false;

const toDto = (o) => {
  const obj = typeof o.toObject === 'function' ? o.toObject() : o;
  const { _id, ...r } = obj;
  return { id: _id || obj.id, status: r.status || r.statusName || 'PENDING', ...r };
};

const todayDateKey = () => new Date().toISOString().slice(0, 10);
const shortTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

async function logActivity(type, title, description) {
  const now = Date.now();
  const doc = {
    _id: `ACT-${now}-${Math.floor(Math.random() * 1000)}`,
    type,
    title,
    description,
    timestamp: shortTime(),
    timestampMillis: now,
  };
  if (mongoConnected) {
    await Activity.create(doc);
  } else {
    memoryActivities.unshift({ id: doc._id, ...doc });
  }
}

app.get(['/health', '/api/health'], async (_req, res) => {
  const ordersCount = mongoConnected ? await Order.countDocuments() : memoryOrders.size;
  res.json({
    ok: true,
    service: 'business-manage-api',
    database: mongoConnected ? 'mongodb' : 'memory-fallback',
    ordersCount,
  });
});

app.get(['/workspace', '/api/workspace'], async (_req, res) => {
  const dateKey = todayDateKey();
  const orders = mongoConnected
    ? (await Order.find().sort({ timestampMillis: -1 })).map(toDto)
    : Array.from(memoryOrders.values()).sort((a, b) => b.timestampMillis - a.timestampMillis);

  const activities = mongoConnected
    ? (await Activity.find().sort({ timestampMillis: -1 }).limit(20)).map(toDto)
    : memoryActivities.slice(0, 20);

  const todayCheckIns = mongoConnected
    ? (await CheckIn.find({ dateKey }).sort({ timestampMillis: -1 })).map(toDto)
    : memoryCheckIns.filter((c) => c.dateKey === dateKey);

  res.json({
    orders,
    activities,
    latestCheckIn: todayCheckIns[0] || null,
    isCheckedInToday: todayCheckIns.length > 0,
    attendanceCount: 124 + todayCheckIns.length,
    activeBranch: todayCheckIns[0]?.branchName || 'Trụ sở Hà Nội',
    databaseMode: mongoConnected ? 'mongodb' : 'memory-fallback',
  });
});

app.get(['/orders', '/api/orders'], async (_req, res) => {
  if (mongoConnected) {
    const docs = await Order.find().sort({ timestampMillis: -1 });
    return res.json(docs.map(toDto));
  }
  const list = Array.from(memoryOrders.values()).sort((a, b) => b.timestampMillis - a.timestampMillis);
  return res.json(list);
});

app.post(['/orders', '/api/orders'], async (req, res) => {
  const { id, ...rest } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const statusName = rest.statusName || rest.status || 'PENDING';
  const doc = { _id: id, ...rest, status: statusName, statusName };
  if (mongoConnected) {
    await Order.findByIdAndUpdate(id, doc, { upsert: true });
  } else {
    memoryOrders.set(id, { id, ...rest, status: statusName, statusName });
  }
  await logActivity('ORDER_CREATED', `Tạo đầu việc ${rest.trackingNumber || id}`, rest.senderAddress || '');
  return res.sendStatus(201);
});

app.post(['/orders/bulk', '/api/orders/bulk'], async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [];
  if (mongoConnected) {
    for (const item of items) {
      const { id, ...rest } = item;
      if (id) {
        const statusName = rest.statusName || rest.status || 'PENDING';
        await Order.findByIdAndUpdate(id, { _id: id, ...rest, status: statusName, statusName }, { upsert: true });
      }
    }
  } else {
    for (const item of items) {
      if (item && item.id) memoryOrders.set(item.id, item);
    }
  }
  return res.status(201).json({ imported: items.length });
});

app.patch(['/orders/:id/status', '/api/orders/:id/status'], async (req, res) => {
  const { id } = req.params;
  const statusName = req.body.statusName || req.body.status;
  if (!statusName) return res.status(400).json({ error: 'Missing statusName' });
  if (mongoConnected) {
    await Order.findByIdAndUpdate(id, { statusName, status: statusName });
  } else if (memoryOrders.has(id)) {
    memoryOrders.set(id, { ...memoryOrders.get(id), statusName, status: statusName });
  }
  await logActivity('STATUS_UPDATED', `Cập nhật ${id} -> ${statusName}`, 'Cập nhật trên MongoDB');
  return res.sendStatus(204);
});

app.delete(['/orders/:id', '/api/orders/:id'], async (req, res) => {
  const { id } = req.params;
  if (mongoConnected) {
    await Order.findByIdAndDelete(id);
  } else {
    memoryOrders.delete(id);
  }
  return res.sendStatus(204);
});

app.post(['/checkin', '/api/checkin'], async (req, res) => {
  const now = Date.now();
  const dateKey = todayDateKey();
  const branchName = req.body?.branchName || 'Trụ sở Hà Nội';
  const userName = req.body?.userName || 'Alex Nguyễn';
  const coordinates = req.body?.coordinates || '21.0358° N, 105.8188° E';
  const doc = {
    _id: `CHK-${now}`,
    userName,
    branchName,
    coordinates,
    checkedInAt: `${shortTime()} · Hôm nay`,
    dateKey,
    timestampMillis: now,
  };
  if (mongoConnected) {
    await CheckIn.create(doc);
  } else {
    memoryCheckIns.unshift({ id: doc._id, ...doc });
  }
  await logActivity('CHECK_IN', `Chấm công GPS tại ${branchName}`, `${userName} (${coordinates})`);
  res.json({
    isCheckedInToday: true,
    latestCheckIn: toDto(doc),
    activeBranch: branchName,
  });
});

const port = Number(process.env.PORT || 3000);
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose
    .connect(mongoUri, { serverSelectionTimeoutMS: 3000 })
    .then(() => {
      mongoConnected = true;
      app.listen(port, '0.0.0.0', () => console.log(`GoShip MongoDB API running on port ${port}`));
    })
    .catch((err) => {
      console.warn('MongoDB connection failed, falling back to memory:', err.message);
      app.listen(port, '0.0.0.0', () => console.log(`API running on port ${port} (Memory Fallback)`));
    });
} else {
  app.listen(port, '0.0.0.0', () => console.log(`API running on port ${port} (Memory Fallback)`));
}