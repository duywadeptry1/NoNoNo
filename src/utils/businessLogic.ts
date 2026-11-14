import { APP_DEPARTMENTS, MOCK_ACCOUNTS } from '../data/seedData';
import type {
  ActivityLogItem,
  ActivityType,
  BusinessOrder,
  CheckInRecord,
  CompanyNotification,
  MockAccount,
  NotificationAudience,
  NotificationPriority,
  OrderStatus,
  StatCardData,
} from '../types/business';

const VALID_STATUSES: OrderStatus[] = ['PENDING', 'DELIVERING', 'COMPLETED', 'CANCELLED'];

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  CHECK_IN: 'Chấm công GPS',
  ORDER_CREATED: 'Tạo đầu việc',
  STATUS_UPDATED: 'Cập nhật tiến độ',
  NOTIFICATION_SENT: 'Gửi thông báo',
  SYSTEM: 'Hệ thống',
};

export function normalizeOrderStatus(raw?: string): OrderStatus {
  const upper = (raw ?? 'PENDING').trim().toUpperCase() as OrderStatus;
  return VALID_STATUSES.includes(upper) ? upper : 'PENDING';
}

export function formatVnd(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `${new Intl.NumberFormat('vi-VN').format(safe)} ₫`;
}

export function formatTimeShort(timestampMillis = Date.now()): string {
  const d = new Date(timestampMillis);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function getTodayDateKey(timestampMillis = Date.now()): string {
  const d = new Date(timestampMillis);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function computeOperationalStats(orders: BusinessOrder[]): StatCardData[] {
  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const active = orders.filter((o) => o.status === 'DELIVERING').length;
  const completed = orders.filter((o) => o.status === 'COMPLETED').length;

  return [
    {
      key: 'pending',
      title: 'Chờ duyệt ngay',
      count: String(pending),
      subtitle: pending > 0 ? 'Cần xử lý trên app' : 'Không còn tồn đọng',
    },
    {
      key: 'active',
      title: 'Đang triển khai',
      count: String(active),
      subtitle: 'Đang theo dõi tiến độ',
    },
    {
      key: 'completed',
      title: 'Đã hoàn tất',
      count: String(completed),
      subtitle: `Tổng ${orders.length} đầu việc`,
    },
  ];
}

export function getNextWorkflowAction(status: OrderStatus): {
  label: string;
  nextStatus: OrderStatus;
} {
  switch (status) {
    case 'PENDING':
      return { label: 'Duyệt triển khai', nextStatus: 'DELIVERING' };
    case 'DELIVERING':
      return { label: 'Xác nhận hoàn tất', nextStatus: 'COMPLETED' };
    case 'COMPLETED':
      return { label: 'Mở lại việc', nextStatus: 'DELIVERING' };
    case 'CANCELLED':
      return { label: 'Đưa về chờ duyệt', nextStatus: 'PENDING' };
  }
}

export function filterOrders(
  orders: BusinessOrder[],
  searchQuery: string,
  statusFilter: OrderStatus | null
): BusinessOrder[] {
  const q = searchQuery.trim().toLowerCase();
  return orders.filter((order) => {
    const matchesStatus = statusFilter === null || order.status === statusFilter;
    if (!matchesStatus) return false;
    if (!q) return true;
    return (
      order.trackingNumber.toLowerCase().includes(q) ||
      order.senderName.toLowerCase().includes(q) ||
      order.senderAddress.toLowerCase().includes(q) ||
      order.recipientName.toLowerCase().includes(q) ||
      order.recipientAddress.toLowerCase().includes(q)
    );
  });
}

export function buildQuickTask(params: {
  title: string;
  assignee: string;
  departmentCode: string;
  branchName?: string;
  budgetVnd?: number;
  now?: number;
  randomCode?: number;
}): BusinessOrder {
  const now = params.now ?? Date.now();
  const code = params.randomCode ?? Math.floor(10000 + Math.random() * 90000);
  const dept =
    APP_DEPARTMENTS.find((d) => d.code === params.departmentCode) ?? APP_DEPARTMENTS[0];
  const branch = params.branchName?.trim() || 'Trụ sở Hà Nội';
  const safeBudget = Number.isFinite(params.budgetVnd) && (params.budgetVnd ?? 0) > 0
    ? Math.round(params.budgetVnd!)
    : 0;

  return {
    id: `ORD-${now % 100000}-${code % 100}`,
    trackingNumber: `${dept.code}-${code}`,
    senderName: dept.fullName,
    senderAddress: params.title.trim(),
    recipientName: params.assignee.trim(),
    recipientAddress: `${branch} · Tạo nhanh trên app`,
    status: 'PENDING',
    serviceType: dept.label,
    feeVnd: 0,
    codVnd: safeBudget,
    createdAt: `${formatTimeShort(now)} · Hôm nay`,
    estimatedDelivery: 'Chờ duyệt nhanh',
    weightKg: 1,
    timestampMillis: now,
  };
}

export function mergeOrdersUpsert(
  existing: BusinessOrder[],
  incoming: BusinessOrder[]
): BusinessOrder[] {
  const map = new Map<string, BusinessOrder>();
  for (const item of existing) {
    map.set(item.id, item);
  }
  for (const item of incoming) {
    map.set(item.id, item);
  }
  return Array.from(map.values()).sort(
    (a, b) => (b.timestampMillis ?? 0) - (a.timestampMillis ?? 0)
  );
}

export function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value == null ? '' : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface DailyActivitiesReportInput {
  activities: ActivityLogItem[];
  orders: BusinessOrder[];
  activeBranch: string;
  attendanceCount: number;
  isCheckedInToday: boolean;
  latestCheckIn?: CheckInRecord | null;
  reportDate?: string;
  includeBom?: boolean;
}

export function generateDailyActivitiesCsvReport({
  activities,
  orders,
  activeBranch,
  attendanceCount,
  isCheckedInToday,
  latestCheckIn,
  reportDate = getTodayDateKey(),
  includeBom = true,
}: DailyActivitiesReportInput): string {
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const activeCount = orders.filter((o) => o.status === 'DELIVERING').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const sortedActivities = [...activities].sort(
    (a, b) => b.timestampMillis - a.timestampMillis
  );

  const summaryRows: (string | number)[][] = [
    ['BAO CAO TONG HOP HOAT DONG NGAY', 'Business Manage'],
    ['Chi so', 'Gia tri'],
    ['Ngay bao cao', reportDate],
    ['Chi nhanh hoat dong', activeBranch],
    [
      'Trang thai cham cong GPS',
      isCheckedInToday
        ? `Da cham cong (${latestCheckIn?.checkedInAt ?? 'Hom nay'})`
        : 'Chua cham cong',
    ],
    ['Quan so hien dien', `${attendanceCount}/130`],
    ['Tong dau viec', orders.length],
    ['Cho duyet', pendingCount],
    ['Dang trien khai', activeCount],
    ['Da hoan tat', completedCount],
    ['Tong hoat dong ghi nhan', sortedActivities.length],
  ];

  const activityHeader = ['Ma hoat dong', 'Loai hoat dong', 'Thoi gian', 'Tieu de', 'Chi tiet'];
  const activityRows = sortedActivities.map((item) => [
    item.id,
    ACTIVITY_TYPE_LABELS[item.type] ?? item.type,
    item.timestamp,
    item.title,
    item.description,
  ]);

  const lines = [
    ...summaryRows.map((row) => row.map(escapeCsvCell).join(',')),
    '',
    activityHeader.map(escapeCsvCell).join(','),
    ...activityRows.map((row) => row.map(escapeCsvCell).join(',')),
  ];

  const csvBody = lines.join('\r\n');
  return includeBom ? `\uFEFF${csvBody}` : csvBody;
}

export function getDailyActivitiesReportFilename(reportDate = getTodayDateKey()): string {
  return `bao-cao-hoat-dong-${reportDate}.csv`;
}

export function downloadCsvFile(filename: string, csvContent: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function isSupervisorAccount(account: Pick<MockAccount, 'role'>): boolean {
  return account.role === 'SUPERVISOR';
}

export function canSendCompanyNotification(account: Pick<MockAccount, 'role'>): boolean {
  return isSupervisorAccount(account);
}

export function canApproveOrderStatus(
  account: Pick<MockAccount, 'role'>,
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean {
  if (isSupervisorAccount(account)) return true;
  // Subordinates can report active field work as completed, but cannot approve PENDING or cancel/reopen
  return currentStatus === 'DELIVERING' && nextStatus === 'COMPLETED';
}

export function canDeleteOrders(account: Pick<MockAccount, 'role'>): boolean {
  return isSupervisorAccount(account);
}

export function canExportEnterpriseReport(account: Pick<MockAccount, 'role'>): boolean {
  return isSupervisorAccount(account);
}

export function getNotificationsForAccount(
  notifications: CompanyNotification[],
  account: MockAccount
): CompanyNotification[] {
  return [...notifications]
    .filter((n) => {
      if (account.role === 'SUPERVISOR') {
        if (n.senderId === account.id) return true;
        if (n.audience === 'SUPERVISORS' || n.audience === 'ALL_STAFF') return true;
        if (n.audience === 'BRANCH') return n.targetBranch === account.branchName;
        if (n.audience === 'INDIVIDUAL') return n.targetAccountId === account.id;
        return true; // Supervisors also have visibility into subordinate announcements
      }
      switch (n.audience) {
        case 'ALL_STAFF':
        case 'SUBORDINATES':
          return true;
        case 'SUPERVISORS':
          return false;
        case 'BRANCH':
          return n.targetBranch === account.branchName;
        case 'INDIVIDUAL':
          return n.targetAccountId === account.id;
      }
    })
    .sort((a, b) => b.timestampMillis - a.timestampMillis);
}

export function isNotificationUnread(
  notification: CompanyNotification,
  accountId: string
): boolean {
  return !notification.readByAccountIds.includes(accountId);
}

export function getUnreadNotificationsCount(
  notifications: CompanyNotification[],
  account: MockAccount
): number {
  return getNotificationsForAccount(notifications, account).filter((n) =>
    isNotificationUnread(n, account.id)
  ).length;
}

export function getNotificationAudienceLabel(notification: Pick<
  CompanyNotification,
  'audience' | 'targetBranch' | 'targetAccountName'
>): string {
  switch (notification.audience) {
    case 'ALL_STAFF':
      return 'Toàn công ty';
    case 'SUBORDINATES':
      return 'Tất cả cấp dưới';
    case 'SUPERVISORS':
      return 'Ban quản lý';
    case 'BRANCH':
      return notification.targetBranch ? `Chi nhánh · ${notification.targetBranch}` : 'Theo chi nhánh';
    case 'INDIVIDUAL':
      return notification.targetAccountName
        ? `Cá nhân · ${notification.targetAccountName}`
        : 'Cá nhân';
  }
}

export function buildCompanyNotification(params: {
  title: string;
  message: string;
  priority: NotificationPriority;
  audience: NotificationAudience;
  targetBranch?: string;
  targetAccountId?: string;
  sender: MockAccount;
  accounts?: MockAccount[];
  now?: number;
}): CompanyNotification {
  const now = params.now ?? Date.now();
  const pool = params.accounts ?? MOCK_ACCOUNTS;
  const targetAcc = params.targetAccountId
    ? pool.find((a) => a.id === params.targetAccountId)
    : undefined;

  return {
    id: `NTF-${now % 100000}-${Math.floor(10 + Math.random() * 89)}`,
    title: params.title.trim(),
    message: params.message.trim(),
    priority: params.priority,
    audience: params.audience,
    targetBranch: params.audience === 'BRANCH' ? params.targetBranch : undefined,
    targetAccountId: params.audience === 'INDIVIDUAL' ? targetAcc?.id : undefined,
    targetAccountName: params.audience === 'INDIVIDUAL' ? targetAcc?.name : undefined,
    senderId: params.sender.id,
    senderName: params.sender.name,
    senderRole: params.sender.role,
    createdAt: `${formatTimeShort(now)} · Hôm nay`,
    timestampMillis: now,
    readByAccountIds: [params.sender.id],
  };
}
