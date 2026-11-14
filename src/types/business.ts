export type OrderStatus = 'DELIVERING' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; bgLight: string; textLight: string; bgDark: string; textDark: string }
> = {
  DELIVERING: {
    label: 'Đang triển khai',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    bgDark: 'dark:bg-blue-950/70',
    textDark: 'dark:text-blue-300',
  },
  PENDING: {
    label: 'Chờ phê duyệt',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-700',
    bgDark: 'dark:bg-amber-950/70',
    textDark: 'dark:text-amber-300',
  },
  COMPLETED: {
    label: 'Đã nghiệm thu',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    bgDark: 'dark:bg-emerald-950/70',
    textDark: 'dark:text-emerald-300',
  },
  CANCELLED: {
    label: 'Tạm dừng / Quá hạn',
    bgLight: 'bg-red-50',
    textLight: 'text-red-700',
    bgDark: 'dark:bg-red-950/70',
    textDark: 'dark:text-red-300',
  },
};

export interface BusinessOrder {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
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
  title: string;
  count: string;
  subtitle: string;
  trend: string;
  isPositive: boolean;
}

export interface BusinessService {
  id: string;
  name: string;
  description: string;
  basePriceVnd: number;
  deliveryTime: string;
  popularTag?: string | null;
}

export interface DailyRevenue {
  dayIndex: number;
  dayLabel: string;
  amountVnd: number;
  orderCount: number;
  isPeak?: boolean;
}

export interface PaymentMethodShare {
  name: string;
  percentage: number;
  totalVnd: number;
}

export interface BranchSupervisor {
  name: string;
  phone: string;
  licensePlate: string;
  vehicleModel: string;
  rating: number;
  completedTrips: number;
  currentDistanceKm: number;
  etaMinutes: number;
}

export interface TrackingStep {
  title: string;
  description: string;
  timestamp: string;
  isDone: boolean;
  isCurrent: boolean;
}

export interface ScheduleDayItem {
  dayOfWeek: string;
  dayNumber: string;
  meetingTitle: string;
  department: string;
  timeSlot: string;
  roomOrLocation: string;
  statusBadge: string;
}

export interface ImportSummary {
  ordersImported: number;
  servicesImported: number;
  revenuesImported: number;
  paymentSharesImported: number;
  errorMessage?: string;
}

export interface WorkspaceSnapshot {
  orders: BusinessOrder[];
  services: BusinessService[];
  dailyRevenues: DailyRevenue[];
  paymentShares: PaymentMethodShare[];
  activeDriver: BranchSupervisor;
  trackingSteps: TrackingStep[];
  weeklySchedule: ScheduleDayItem[];
  isCheckedInToday: boolean;
  attendanceCount: number;
}
