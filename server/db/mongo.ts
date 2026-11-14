import mongoose, { Schema, type Model } from 'mongoose';
import type { ActivityType, OrderStatus } from '../../src/types/business';

export interface OrderDocument {
  _id: string;
  trackingNumber: string;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
  status: OrderStatus;
  statusName: OrderStatus;
  serviceType: string;
  feeVnd: number;
  codVnd: number;
  createdAt: string;
  estimatedDelivery: string;
  weightKg: number;
  timestampMillis: number;
}

export interface CheckInDocument {
  _id: string;
  userName: string;
  branchName: string;
  coordinates: string;
  checkedInAt: string;
  dateKey: string;
  timestampMillis: number;
}

export interface ActivityDocument {
  _id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  timestampMillis: number;
}

const OrderSchema = new Schema<OrderDocument>(
  {
    _id: { type: String, required: true },
    trackingNumber: { type: String, required: true, index: true },
    senderName: { type: String, required: true },
    senderAddress: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientAddress: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'DELIVERING', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    statusName: {
      type: String,
      enum: ['PENDING', 'DELIVERING', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    serviceType: { type: String, default: 'Vận hành' },
    feeVnd: { type: Number, default: 0 },
    codVnd: { type: Number, default: 0 },
    createdAt: { type: String, required: true },
    estimatedDelivery: { type: String, default: 'Hạn hôm nay' },
    weightKg: { type: Number, default: 1 },
    timestampMillis: { type: Number, required: true, index: true },
  },
  { versionKey: false, collection: 'orders' }
);

const CheckInSchema = new Schema<CheckInDocument>(
  {
    _id: { type: String, required: true },
    userName: { type: String, required: true },
    branchName: { type: String, required: true },
    coordinates: { type: String, required: true },
    checkedInAt: { type: String, required: true },
    dateKey: { type: String, required: true, index: true },
    timestampMillis: { type: Number, required: true, index: true },
  },
  { versionKey: false, collection: 'checkins' }
);

const ActivitySchema = new Schema<ActivityDocument>(
  {
    _id: { type: String, required: true },
    type: {
      type: String,
      enum: ['ORDER_CREATED', 'STATUS_UPDATED', 'CHECK_IN', 'NOTIFICATION_SENT', 'SYSTEM'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: String, required: true },
    timestampMillis: { type: Number, required: true, index: true },
  },
  { versionKey: false, collection: 'activities' }
);

export interface NotificationDocument {
  _id: string;
  title: string;
  message: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  audience: 'ALL_STAFF' | 'SUBORDINATES' | 'SUPERVISORS' | 'BRANCH' | 'INDIVIDUAL';
  targetBranch?: string;
  targetAccountId?: string;
  targetAccountName?: string;
  senderId: string;
  senderName: string;
  senderRole: 'SUPERVISOR' | 'SUBORDINATE';
  createdAt: string;
  timestampMillis: number;
  readByAccountIds: string[];
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: {
      type: String,
      enum: ['NORMAL', 'IMPORTANT', 'URGENT'],
      default: 'NORMAL',
      index: true,
    },
    audience: {
      type: String,
      enum: ['ALL_STAFF', 'SUBORDINATES', 'SUPERVISORS', 'BRANCH', 'INDIVIDUAL'],
      default: 'ALL_STAFF',
      index: true,
    },
    targetBranch: { type: String },
    targetAccountId: { type: String },
    targetAccountName: { type: String },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: {
      type: String,
      enum: ['SUPERVISOR', 'SUBORDINATE'],
      default: 'SUPERVISOR',
    },
    createdAt: { type: String, required: true },
    timestampMillis: { type: Number, required: true, index: true },
    readByAccountIds: { type: [String], default: [] },
  },
  { versionKey: false, collection: 'notifications' }
);

export const OrderModel: Model<OrderDocument> =
  (mongoose.models.Order as Model<OrderDocument> | undefined) ??
  mongoose.model<OrderDocument>('Order', OrderSchema);

export const CheckInModel: Model<CheckInDocument> =
  (mongoose.models.CheckIn as Model<CheckInDocument> | undefined) ??
  mongoose.model<CheckInDocument>('CheckIn', CheckInSchema);

export const ActivityModel: Model<ActivityDocument> =
  (mongoose.models.Activity as Model<ActivityDocument> | undefined) ??
  mongoose.model<ActivityDocument>('Activity', ActivitySchema);

export const NotificationModel: Model<NotificationDocument> =
  (mongoose.models.Notification as Model<NotificationDocument> | undefined) ??
  mongoose.model<NotificationDocument>('Notification', NotificationSchema);
