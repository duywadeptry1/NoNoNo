require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const OrderSchema = new mongoose.Schema({
  _id: String,
  trackingNumber: String,
  senderName: String,
  senderAddress: String,
  recipientName: String,
  recipientAddress: String,
  statusName: String,
  serviceType: String,
  feeVnd: Number,
  codVnd: Number,
  createdAt: String,
  estimatedDelivery: String,
  weightKg: Number,
  timestampMillis: Number,
}, { versionKey: false });

const Order = mongoose.model('Order', OrderSchema);

const app = express();
app.use(cors(), express.json());

const memoryOrders = new Map();
let mongoConnected = false;

const toDto = (o) => {
  const obj = typeof o.toObject === 'function' ? o.toObject() : o;
  const { _id, ...r } = obj;
  return { id: _id || obj.id, ...r };
};

app.get('/health', (_req, res) => {
  res.json({ ok: true, database: mongoConnected ? 'mongodb' : 'memory' });
});

app.get('/orders', async (_req, res) => {
  if (mongoConnected) {
    const docs = await Order.find().sort({ timestampMillis: -1 });
    return res.json(docs.map(toDto));
  }
  const list = Array.from(memoryOrders.values()).sort((a, b) => b.timestampMillis - a.timestampMillis);
  return res.json(list);
});

app.post('/orders', async (req, res) => {
  const { id, ...rest } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing id' });
  if (mongoConnected) {
    await Order.findByIdAndUpdate(id, { _id: id, ...rest }, { upsert: true });
  } else {
    memoryOrders.set(id, { id, ...rest });
  }
  return res.sendStatus(201);
});

app.post('/orders/bulk', async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [];
  if (mongoConnected) {
    for (const item of items) {
      const { id, ...rest } = item;
      if (id) await Order.findByIdAndUpdate(id, { _id: id, ...rest }, { upsert: true });
    }
  } else {
    for (const item of items) {
      if (item && item.id) memoryOrders.set(item.id, item);
    }
  }
  return res.status(201).json({ imported: items.length });
});

app.patch('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { statusName } = req.body;
  if (mongoConnected) {
    await Order.findByIdAndUpdate(id, { statusName });
  } else if (memoryOrders.has(id)) {
    memoryOrders.set(id, { ...memoryOrders.get(id), statusName });
  }
  return res.sendStatus(204);
});

app.delete('/orders/:id', async (req, res) => {
  const { id } = req.params;
  if (mongoConnected) {
    await Order.findByIdAndDelete(id);
  } else {
    memoryOrders.delete(id);
  }
  return res.sendStatus(204);
});

const port = Number(process.env.PORT || 3000);
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      mongoConnected = true;
      app.listen(port, '0.0.0.0', () => console.log(`API running on port ${port} (MongoDB)`));
    })
    .catch((err) => {
      console.warn('MongoDB connection failed, falling back to in-memory store:', err.message);
      app.listen(port, '0.0.0.0', () => console.log(`API running on port ${port} (In-Memory)`));
    });
} else {
  app.listen(port, '0.0.0.0', () => console.log(`API running on port ${port} (In-Memory)`));
}