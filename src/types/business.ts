export type OrderStatus = 'PENDING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; bgLight: string; textLight: string; bgDark: string; textDark: string }
> = {
  PENDING: {
    label: 'Chờ duyệt',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-700',
    bgDark: 'dark:bg-amber-950/70',
    textDark: 'dark:text-amber-300',
  },
  DELIVERING: {
    label: 'Đang triển khai',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    bgDark: 'dark:bg-blue-950/70',
    textDark: 'dark:text-blue-300',
  },
  COMPLETED: {
    label: 'Hoàn tất',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    bgDark: 'dark:bg-emerald-950/70',
    textDark: 'dark:text-emerald-300',
  },
  CANCELLED: {
    label: 'Tạm dừng',
    bgLight: 'bg-slate-100',
    textLight: 'text-slate-600',
    bgDark: 'dark:bg-slate-800',
    textDark: 'dark:text-slate-300',
  },
};

export interface BusinessOrder {
  id: string;
  trackingNumber: string;
  senderName: string; // Phòng ban chủ trì
  senderAddress: string; // Tiêu đề công việc / Dự án
  recipientName: string; // Nhân sự phụ trách
  recipientAddress: string; // Chi nhánh / Ghi chú hiện trường
  status: OrderStatus;
  serviceType: string;
  feeVnd: number;
  codVnd: number;
  createdAt: string;
  estimatedDelivery: string;
  weightKg: number;
  timestampMillis?: number;
}

export interface StatCardData {
  key: 'pending' | 'active' | 'completed';
  title: string;
  count: string;
  subtitle: string;
}

export type ActivityType =
  | 'ORDER_CREATED'
  | 'STATUS_UPDATED'
  | 'CHECK_IN'
  | 'NOTIFICATION_SENT'
  | 'SYSTEM';

export interface ActivityLogItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  timestampMillis: number;
}

export interface CheckInRecord {
  id: string;
  userName: string;
  branchName: string;
  coordinates: string;
  checkedInAt: string;
  dateKey: string;
  timestampMillis: number;
}

export type UserRole = 'SUPERVISOR' | 'SUBORDINATE';

export interface MockAccount {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  branchName: string;
}

export type NotificationPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export type NotificationAudience =
  | 'ALL_STAFF'
  | 'SUBORDINATES'
  | 'SUPERVISORS'
  | 'BRANCH'
  | 'INDIVIDUAL';

export interface CompanyNotification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  audience: NotificationAudience;
  targetBranch?: string;
  targetAccountId?: string;
  targetAccountName?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  createdAt: string;
  timestampMillis: number;
  readByAccountIds: string[];
}

export interface WorkspaceSnapshot {
  orders: BusinessOrder[];
  activities: ActivityLogItem[];
  notifications: CompanyNotification[];
  accounts: MockAccount[];
  latestCheckIn: CheckInRecord | null;
  isCheckedInToday: boolean;
  attendanceCount: number;
  activeBranch: string;
  databaseMode: 'mongodb' | 'memory-fallback';
}
