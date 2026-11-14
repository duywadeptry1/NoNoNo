import mongoose from 'mongoose';
import {
  getDefaultActivities,
  getDefaultNotifications,
  getDefaultOrders,
  MOCK_ACCOUNTS,
} from '../../src/data/seedData';
import {
  buildCompanyNotification,
  formatTimeShort,
  getNotificationAudienceLabel,
  getTodayDateKey,
  mergeOrdersUpsert,
  normalizeOrderStatus,
} from '../../src/utils/businessLogic';
import {
  ORDER_STATUS_META,
  type ActivityLogItem,
  type BusinessOrder,
  type CheckInRecord,
  type CompanyNotification,
  type MockAccount,
  type NotificationAudience,
  type NotificationPriority,
  type OrderStatus,
  type WorkspaceSnapshot,
} from '../../src/types/business';
import {
  ActivityModel,
  CheckInModel,
  NotificationModel,
  OrderModel,
  type ActivityDocument,
  type CheckInDocument,
  type NotificationDocument,
  type OrderDocument,
} from './mongo';

const BASE_ATTENDANCE_COUNT = 124;

function toOrder(doc: OrderDocument): BusinessOrder {
  return {
    id: doc._id,
    trackingNumber: doc.trackingNumber,
    senderName: doc.senderName,
    senderAddress: doc.senderAddress,
    recipientName: doc.recipientName,
    recipientAddress: doc.recipientAddress,
    status: normalizeOrderStatus(doc.status ?? doc.statusName),
    serviceType: doc.serviceType,
    feeVnd: doc.feeVnd,
    codVnd: doc.codVnd,
    createdAt: doc.createdAt,
    estimatedDelivery: doc.estimatedDelivery,
    weightKg: doc.weightKg,
    timestampMillis: doc.timestampMillis,
  };
}

function toOrderDoc(order: BusinessOrder): OrderDocument {
  const status = normalizeOrderStatus(order.status);
  return {
    _id: order.id,
    trackingNumber: order.trackingNumber,
    senderName: order.senderName,
    senderAddress: order.senderAddress,
    recipientName: order.recipientName,
    recipientAddress: order.recipientAddress,
    status,
    statusName: status,
    serviceType: order.serviceType,
    feeVnd: order.feeVnd,
    codVnd: order.codVnd,
    createdAt: order.createdAt,
    estimatedDelivery: order.estimatedDelivery,
    weightKg: order.weightKg,
    timestampMillis: order.timestampMillis ?? Date.now(),
  };
}

function toActivity(doc: ActivityDocument): ActivityLogItem {
  return {
    id: doc._id,
    type: doc.type,
    title: doc.title,
    description: doc.description,
    timestamp: doc.timestamp,
    timestampMillis: doc.timestampMillis,
  };
}

function toCheckIn(doc: CheckInDocument): CheckInRecord {
  return {
    id: doc._id,
    userName: doc.userName,
    branchName: doc.branchName,
    coordinates: doc.coordinates,
    checkedInAt: doc.checkedInAt,
    dateKey: doc.dateKey,
    timestampMillis: doc.timestampMillis,
  };
}

function toNotification(doc: NotificationDocument): CompanyNotification {
  return {
    id: doc._id,
    title: doc.title,
    message: doc.message,
    priority: doc.priority,
    audience: doc.audience,
    targetBranch: doc.targetBranch,
    targetAccountId: doc.targetAccountId,
    targetAccountName: doc.targetAccountName,
    senderId: doc.senderId,
    senderName: doc.senderName,
    senderRole: doc.senderRole,
    createdAt: doc.createdAt,
    timestampMillis: doc.timestampMillis,
    readByAccountIds: Array.isArray(doc.readByAccountIds) ? doc.readByAccountIds : [],
  };
}

function toNotificationDoc(n: CompanyNotification): NotificationDocument {
  return {
    _id: n.id,
    title: n.title,
    message: n.message,
    priority: n.priority,
    audience: n.audience,
    targetBranch: n.targetBranch,
    targetAccountId: n.targetAccountId,
    targetAccountName: n.targetAccountName,
    senderId: n.senderId,
    senderName: n.senderName,
    senderRole: n.senderRole,
    createdAt: n.createdAt,
    timestampMillis: n.timestampMillis,
    readByAccountIds: n.readByAccountIds,
  };
}

export class BusinessMongoRepository {
  private mongoConnected = false;
  private ordersMem: BusinessOrder[] = [];
  private activitiesMem: ActivityLogItem[] = [];
  private checkInsMem: CheckInRecord[] = [];
  private notificationsMem: CompanyNotification[] = [];
  private activeBranch = 'Trụ sở Hà Nội';

  constructor() {
    this.seedMemory();
  }

  private seedMemory() {
    const now = Date.now();
    this.ordersMem = getDefaultOrders(now);
    this.activitiesMem = getDefaultActivities(now);
    this.notificationsMem = getDefaultNotifications(now);
    this.checkInsMem = [];
    this.activeBranch = 'Trụ sở Hà Nội';
  }

  isMongoConnected(): boolean {
    return this.mongoConnected;
  }

  async connectAndSeed(mongoUri?: string): Promise<'mongodb' | 'memory-fallback'> {
    const uri = mongoUri?.trim();
    if (!uri) {
      this.mongoConnected = false;
      return 'memory-fallback';
    }

    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      this.mongoConnected = true;

      const existingCount = await OrderModel.countDocuments();
      if (existingCount === 0) {
        const now = Date.now();
        await OrderModel.insertMany(getDefaultOrders(now).map(toOrderDoc));
        await ActivityModel.insertMany(
          getDefaultActivities(now).map((a) => ({
            _id: a.id,
            type: a.type,
            title: a.title,
            description: a.description,
            timestamp: a.timestamp,
            timestampMillis: a.timestampMillis,
          }))
        );
      }

      const existingNotifCount = await NotificationModel.countDocuments();
      if (existingNotifCount === 0) {
        const now = Date.now();
        await NotificationModel.insertMany(
          getDefaultNotifications(now).map(toNotificationDoc)
        );
      }

      return 'mongodb';
    } catch (error) {
      console.warn(
        'MongoDB unavailable, running with memory fallback:',
        error instanceof Error ? error.message : String(error)
      );
      this.mongoConnected = false;
      return 'memory-fallback';
    }
  }

  private async appendActivity(item: ActivityLogItem): Promise<void> {
    if (this.mongoConnected) {
      await ActivityModel.create({
        _id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        timestamp: item.timestamp,
        timestampMillis: item.timestampMillis,
      });
      return;
    }
    this.activitiesMem = [item, ...this.activitiesMem].slice(0, 25);
  }

  async listOrders(): Promise<BusinessOrder[]> {
    if (this.mongoConnected) {
      const docs = await OrderModel.find().sort({ timestampMillis: -1 }).lean<OrderDocument[]>();
      return docs.map(toOrder);
    }
    return [...this.ordersMem].sort(
      (a, b) => (b.timestampMillis ?? 0) - (a.timestampMillis ?? 0)
    );
  }

  async listNotifications(): Promise<CompanyNotification[]> {
    if (this.mongoConnected) {
      const docs = await NotificationModel.find()
        .sort({ timestampMillis: -1 })
        .limit(50)
        .lean<NotificationDocument[]>();
      return docs.map(toNotification);
    }
    return [...this.notificationsMem].sort((a, b) => b.timestampMillis - a.timestampMillis);
  }

  async sendNotification(params: {
    title: string;
    message: string;
    priority: NotificationPriority;
    audience: NotificationAudience;
    targetBranch?: string;
    targetAccountId?: string;
    senderId?: string;
  }): Promise<CompanyNotification> {
    const sender: MockAccount =
      MOCK_ACCOUNTS.find((a) => a.id === params.senderId) ?? MOCK_ACCOUNTS[0];
    const now = Date.now();
    const notification = buildCompanyNotification({
      title: params.title,
      message: params.message,
      priority: params.priority,
      audience: params.audience,
      targetBranch: params.targetBranch,
      targetAccountId: params.targetAccountId,
      sender,
      accounts: MOCK_ACCOUNTS,
      now,
    });

    if (this.mongoConnected) {
      await NotificationModel.create(toNotificationDoc(notification));
    } else {
      this.notificationsMem = [notification, ...this.notificationsMem].slice(0, 50);
    }

    const audienceLabel = getNotificationAudienceLabel(notification);
    await this.appendActivity({
      id: `ACT-${now}-${Math.floor(Math.random() * 1000)}`,
      type: 'NOTIFICATION_SENT',
      title: `Thông báo: ${notification.title}`,
      description: `${sender.name} gửi tới ${audienceLabel}.`,
      timestamp: formatTimeShort(now),
      timestampMillis: now,
    });

    return notification;
  }

  async markNotificationRead(notificationId: string, accountId: string): Promise<CompanyNotification | null> {
    if (this.mongoConnected) {
      const updated = await NotificationModel.findByIdAndUpdate(
        notificationId,
        { $addToSet: { readByAccountIds: accountId } },
        { new: true }
      ).lean<NotificationDocument | null>();
      return updated ? toNotification(updated) : null;
    }
    let found: CompanyNotification | null = null;
    this.notificationsMem = this.notificationsMem.map((n) => {
      if (n.id !== notificationId) return n;
      const readBy = n.readByAccountIds.includes(accountId)
        ? n.readByAccountIds
        : [...n.readByAccountIds, accountId];
      found = { ...n, readByAccountIds: readBy };
      return found;
    });
    return found;
  }

  async markAllNotificationsRead(accountId: string): Promise<CompanyNotification[]> {
    if (this.mongoConnected) {
      await NotificationModel.updateMany({}, { $addToSet: { readByAccountIds: accountId } });
      return this.listNotifications();
    }
    this.notificationsMem = this.notificationsMem.map((n) => ({
      ...n,
      readByAccountIds: n.readByAccountIds.includes(accountId)
        ? n.readByAccountIds
        : [...n.readByAccountIds, accountId],
    }));
    return this.listNotifications();
  }

  async getWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
    const orders = await this.listOrders();
    const notifications = await this.listNotifications();
    const todayKey = getTodayDateKey();

    let activities: ActivityLogItem[];
    let todayCheckIns: CheckInRecord[];

    if (this.mongoConnected) {
      const actDocs = await ActivityModel.find()
        .sort({ timestampMillis: -1 })
        .limit(20)
        .lean<ActivityDocument[]>();
      activities = actDocs.map(toActivity);

      const checkDocs = await CheckInModel.find({ dateKey: todayKey })
        .sort({ timestampMillis: -1 })
        .lean<CheckInDocument[]>();
      todayCheckIns = checkDocs.map(toCheckIn);
    } else {
      activities = [...this.activitiesMem]
        .sort((a, b) => b.timestampMillis - a.timestampMillis)
        .slice(0, 20);
      todayCheckIns = this.checkInsMem
        .filter((c) => c.dateKey === todayKey)
        .sort((a, b) => b.timestampMillis - a.timestampMillis);
    }

    const latestCheckIn = todayCheckIns[0] ?? null;

    return {
      orders,
      activities,
      notifications,
      accounts: MOCK_ACCOUNTS,
      latestCheckIn,
      isCheckedInToday: Boolean(latestCheckIn),
      attendanceCount: BASE_ATTENDANCE_COUNT + todayCheckIns.length,
      activeBranch: latestCheckIn?.branchName ?? this.activeBranch,
      databaseMode: this.mongoConnected ? 'mongodb' : 'memory-fallback',
    };
  }

  async upsertOrder(order: BusinessOrder): Promise<BusinessOrder> {
    const normalized: BusinessOrder = {
      ...order,
      status: normalizeOrderStatus(order.status),
      timestampMillis: order.timestampMillis ?? Date.now(),
    };

    if (this.mongoConnected) {
      await OrderModel.findByIdAndUpdate(normalized.id, toOrderDoc(normalized), {
        upsert: true,
        new: true,
      });
    } else {
      this.ordersMem = mergeOrdersUpsert(this.ordersMem, [normalized]);
    }

    const now = Date.now();
    await this.appendActivity({
      id: `ACT-${now}-${Math.floor(Math.random() * 1000)}`,
      type: 'ORDER_CREATED',
      title: `Tạo đầu việc ${normalized.trackingNumber}`,
      description: `${normalized.senderAddress} (${normalized.recipientName})`,
      timestamp: formatTimeShort(now),
      timestampMillis: now,
    });

    return normalized;
  }

  async bulkUpsertOrders(orders: BusinessOrder[]): Promise<number> {
    if (orders.length === 0) return 0;

    if (this.mongoConnected) {
      const ops = orders.map((order) => {
        const doc = toOrderDoc(order);
        return {
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: doc },
            upsert: true,
          },
        };
      });
      await OrderModel.bulkWrite(ops);
    } else {
      this.ordersMem = mergeOrdersUpsert(this.ordersMem, orders);
    }

    return orders.length;
  }

  async updateOrderStatus(id: string, rawStatus: string): Promise<OrderStatus | null> {
    const nextStatus = normalizeOrderStatus(rawStatus);
    let trackingNumber = id;

    if (this.mongoConnected) {
      const updated = await OrderModel.findByIdAndUpdate(
        id,
        { status: nextStatus, statusName: nextStatus },
        { new: true }
      ).lean<OrderDocument | null>();
      if (!updated) return null;
      trackingNumber = updated.trackingNumber;
    } else {
      const existing = this.ordersMem.find((o) => o.id === id);
      if (!existing) return null;
      trackingNumber = existing.trackingNumber;
      this.ordersMem = this.ordersMem.map((o) =>
        o.id === id ? { ...o, status: nextStatus } : o
      );
    }

    const now = Date.now();
    await this.appendActivity({
      id: `ACT-${now}-${Math.floor(Math.random() * 1000)}`,
      type: 'STATUS_UPDATED',
      title: `Cập nhật ${trackingNumber} -> ${ORDER_STATUS_META[nextStatus].label}`,
      description: `Trạng thái mới đã được lưu vào cơ sở dữ liệu.`,
      timestamp: formatTimeShort(now),
      timestampMillis: now,
    });

    return nextStatus;
  }

  async deleteOrder(id: string): Promise<boolean> {
    if (this.mongoConnected) {
      const res = await OrderModel.findByIdAndDelete(id);
      return Boolean(res);
    }
    const before = this.ordersMem.length;
    this.ordersMem = this.ordersMem.filter((o) => o.id !== id);
    return this.ordersMem.length < before;
  }

  async performCheckIn(params?: {
    userName?: string;
    branchName?: string;
    coordinates?: string;
  }): Promise<{
    isCheckedInToday: boolean;
    attendanceCount: number;
    latestCheckIn: CheckInRecord;
    activeBranch: string;
    activities: ActivityLogItem[];
  }> {
    const now = Date.now();
    const dateKey = getTodayDateKey(now);
    const branchName = params?.branchName?.trim() || this.activeBranch;
    const userName = params?.userName?.trim() || 'Alex Nguyễn';
    const coordinates = params?.coordinates?.trim() || '21.0358° N, 105.8188° E';
    this.activeBranch = branchName;

    let existingToday: CheckInRecord | null = null;
    let todayCount = 0;

    if (this.mongoConnected) {
      const docs = await CheckInModel.find({ dateKey })
        .sort({ timestampMillis: -1 })
        .lean<CheckInDocument[]>();
      todayCount = docs.length;
      existingToday = docs[0] ? toCheckIn(docs[0]) : null;
    } else {
      const docs = this.checkInsMem
        .filter((c) => c.dateKey === dateKey)
        .sort((a, b) => b.timestampMillis - a.timestampMillis);
      todayCount = docs.length;
      existingToday = docs[0] ?? null;
    }

    if (existingToday && existingToday.branchName === branchName) {
      const snapshot = await this.getWorkspaceSnapshot();
      return {
        isCheckedInToday: true,
        attendanceCount: snapshot.attendanceCount,
        latestCheckIn: existingToday,
        activeBranch: branchName,
        activities: snapshot.activities,
      };
    }

    const record: CheckInRecord = {
      id: `CHK-${now}`,
      userName,
      branchName,
      coordinates,
      checkedInAt: `${formatTimeShort(now)} · Hôm nay`,
      dateKey,
      timestampMillis: now,
    };

    if (this.mongoConnected) {
      await CheckInModel.create({
        _id: record.id,
        userName: record.userName,
        branchName: record.branchName,
        coordinates: record.coordinates,
        checkedInAt: record.checkedInAt,
        dateKey: record.dateKey,
        timestampMillis: record.timestampMillis,
      });
      todayCount += 1;
    } else {
      this.checkInsMem = [record, ...this.checkInsMem];
      todayCount += 1;
    }

    await this.appendActivity({
      id: `ACT-${now}-CHK`,
      type: 'CHECK_IN',
      title: `Chấm công GPS tại ${branchName}`,
      description: `${userName} đã điểm danh trực ca (${coordinates}).`,
      timestamp: formatTimeShort(now),
      timestampMillis: now,
    });

    const snapshot = await this.getWorkspaceSnapshot();
    return {
      isCheckedInToday: true,
      attendanceCount: BASE_ATTENDANCE_COUNT + todayCount,
      latestCheckIn: record,
      activeBranch: branchName,
      activities: snapshot.activities,
    };
  }

  async resetWorkspace(): Promise<WorkspaceSnapshot> {
    const now = Date.now();
    if (this.mongoConnected) {
      await OrderModel.deleteMany({});
      await CheckInModel.deleteMany({});
      await ActivityModel.deleteMany({});
      await NotificationModel.deleteMany({});
      await OrderModel.insertMany(getDefaultOrders(now).map(toOrderDoc));
      await ActivityModel.insertMany(
        getDefaultActivities(now).map((a) => ({
          _id: a.id,
          type: a.type,
          title: a.title,
          description: a.description,
          timestamp: a.timestamp,
          timestampMillis: a.timestampMillis,
        }))
      );
      await NotificationModel.insertMany(
        getDefaultNotifications(now).map(toNotificationDoc)
      );
    } else {
      this.seedMemory();
    }
    return this.getWorkspaceSnapshot();
  }

  async getHealth() {
    const orders = await this.listOrders();
    return {
      ok: true,
      service: 'business-manage-api',
      database: this.mongoConnected ? 'mongodb' : 'memory-fallback',
      mongoConfigured: Boolean(process.env.MONGODB_URI),
      ordersCount: orders.length,
    };
  }
}
