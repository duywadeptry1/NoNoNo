import type {
  BusinessOrder,
  BusinessService,
  DailyRevenue,
  ImportSummary,
  OrderStatus,
  PaymentMethodShare,
  StatCardData,
} from '../types/business';

const VALID_STATUSES: OrderStatus[] = ['DELIVERING', 'PENDING', 'COMPLETED', 'CANCELLED'];

export function normalizeOrderStatus(raw?: string): OrderStatus {
  const upper = (raw ?? 'PENDING').trim().toUpperCase() as OrderStatus;
  return VALID_STATUSES.includes(upper) ? upper : 'PENDING';
}

export function formatVnd(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `${new Intl.NumberFormat('vi-VN').format(safe)} ₫`;
}

export function computeStatsFromOrders(orders: BusinessOrder[]): StatCardData[] {
  const total = orders.length;
  const active = orders.filter((o) => o.status === 'DELIVERING').length;
  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const completed = orders.filter((o) => o.status === 'COMPLETED').length;
  const cancelled = orders.filter((o) => o.status === 'CANCELLED').length;
  const successRate = total > 0 ? Math.round((completed * 100) / total) : 100;

  return [
    {
      title: 'Tổng dự án & việc',
      count: String(total),
      subtitle: 'hạng mục trong DB',
      trend: '+14.8%',
      isPositive: true,
    },
    {
      title: 'Đang triển khai',
      count: String(active + pending),
      subtitle: `${pending} chờ phê duyệt`,
      trend: 'Đúng hạn',
      isPositive: true,
    },
    {
      title: 'Đã nghiệm thu',
      count: String(completed),
      subtitle: `hoàn tất ${successRate}%`,
      trend: '+12.4%',
      isPositive: true,
    },
    {
      title: 'Tạm dừng / Quá hạn',
      count: String(cancelled),
      subtitle: 'cần rà soát',
      trend: '-2.1%',
      isPositive: false,
    },
  ];
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
      order.recipientAddress.toLowerCase().includes(q) ||
      order.serviceType.toLowerCase().includes(q)
    );
  });
}

export function filterServices(services: BusinessService[], searchQuery: string): BusinessService[] {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return services;
  return services.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.deliveryTime.toLowerCase().includes(q) ||
      (s.popularTag?.toLowerCase().includes(q) ?? false)
  );
}

export function calculateBudgetEstimate(basePriceVnd: number, manDays: number) {
  const safeDays = Math.max(1, manDays);
  const estimatedBudget = Math.round(basePriceVnd * (0.5 + safeDays * 0.1));
  const reserveFund = Math.round(estimatedBudget * 0.15);
  const totalApproved = Math.max(0, estimatedBudget - reserveFund);
  const operatingFee = Math.round(estimatedBudget * 0.12);
  return { estimatedBudget, reserveFund, totalApproved, operatingFee };
}

export function buildNewOrder(params: {
  recipientName: string;
  recipientAddress: string;
  weightKg: number;
  departmentCode: string;
  service: BusinessService;
  now?: number;
  randomCode?: number;
}): BusinessOrder {
  const now = params.now ?? Date.now();
  const code = params.randomCode ?? Math.floor(10000 + Math.random() * 90000);
  const departmentMap: Record<string, string> = {
    TECH: 'Phòng Kỹ Thuật & R&D',
    MKT: 'Phòng Marketing & Truyền Thông',
    FIN: 'Phòng Tài Chính - Kế Toán',
    B2B: 'Phòng Kinh Doanh B2B',
  };
  const department = departmentMap[params.departmentCode] ?? 'Phòng Kinh Doanh B2B';
  const { estimatedBudget, operatingFee } = calculateBudgetEstimate(
    params.service.basePriceVnd,
    params.weightKg
  );

  return {
    id: `ORD-${now % 100000}-${code % 100}`,
    trackingNumber: `PRJ-${code}-BM`,
    senderName: department,
    senderAddress: params.recipientAddress.trim() || 'Dự án Triển khai Giải pháp Doanh nghiệp',
    recipientName: params.recipientName.trim() || 'Khách Hàng Mới',
    recipientAddress: `Trụ sở Chính • Quy mô ${Math.round(params.weightKg)} ngày công • Ưu tiên Cao`,
    status: 'PENDING',
    serviceType: department.replace('Phòng ', ''),
    feeVnd: operatingFee,
    codVnd: estimatedBudget,
    createdAt: 'Vừa khởi tạo',
    estimatedDelivery: 'Hạn duyệt hôm nay',
    weightKg: params.weightKg,
    timestampMillis: now,
  };
}

export function mergeOrdersUpsert(existing: BusinessOrder[], incoming: BusinessOrder[]): BusinessOrder[] {
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

function parseJsonOrder(obj: Record<string, unknown>, baseTimestamp: number, index: number, total: number): BusinessOrder {
  const trackingNumber =
    typeof obj.trackingNumber === 'string' && obj.trackingNumber.trim()
      ? obj.trackingNumber.trim()
      : `VN-${Math.floor(10000 + Math.random() * 90000)}-DB`;
  const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : `ORD-${trackingNumber}`;
  return {
    id,
    trackingNumber,
    senderName: String(obj.senderName ?? 'Alex Nguyễn'),
    senderAddress: String(obj.senderAddress ?? '120 Hoàng Hoa Thám, Ba Đình, Hà Nội'),
    recipientName: String(obj.recipientName ?? 'Khách hàng GoShip'),
    recipientAddress: String(obj.recipientAddress ?? 'Quận 1, TP. Hồ Chí Minh'),
    status: normalizeOrderStatus(String(obj.status ?? obj.statusName ?? 'PENDING')),
    serviceType: String(obj.serviceType ?? 'Hỏa tốc 2H'),
    feeVnd: Number(obj.feeVnd ?? 45000),
    codVnd: Number(obj.codVnd ?? 500000),
    createdAt: String(obj.createdAt ?? 'Nhập từ Database'),
    estimatedDelivery: String(obj.estimatedDelivery ?? 'Dự kiến hôm nay'),
    weightKg: Number(obj.weightKg ?? 1.5),
    timestampMillis: baseTimestamp + (total - index),
  };
}

export function parseImportJsonPayload(
  jsonString: string,
  now = Date.now()
): {
  orders: BusinessOrder[];
  services: BusinessService[];
  revenues: DailyRevenue[];
  paymentShares: PaymentMethodShare[];
  summary: ImportSummary;
} {
  try {
    const trimmed = jsonString.trim();
    if (!trimmed) {
      return {
        orders: [],
        services: [],
        revenues: [],
        paymentShares: [],
        summary: {
          ordersImported: 0,
          servicesImported: 0,
          revenuesImported: 0,
          paymentSharesImported: 0,
          errorMessage: 'Dữ liệu JSON trống.',
        },
      };
    }
    const parsed = JSON.parse(trimmed);
    let orders: BusinessOrder[] = [];
    let services: BusinessService[] = [];
    let revenues: DailyRevenue[] = [];
    let paymentShares: PaymentMethodShare[] = [];

    if (Array.isArray(parsed)) {
      orders = parsed.map((item, idx) =>
        parseJsonOrder(item as Record<string, unknown>, now, idx, parsed.length)
      );
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.orders)) {
        orders = parsed.orders.map((item: Record<string, unknown>, idx: number) =>
          parseJsonOrder(item, now, idx, parsed.orders.length)
        );
      }
      if (Array.isArray(parsed.services)) {
        services = parsed.services.map((item: Record<string, unknown>, idx: number) => ({
          id: String(item.id ?? `SRV-IMP-${idx + 1}`),
          name: String(item.name ?? 'Dịch vụ mới'),
          description: String(item.description ?? 'Nhập từ JSON'),
          basePriceVnd: Number(item.basePriceVnd ?? 25000),
          deliveryTime: String(item.deliveryTime ?? 'Trong ngày'),
          popularTag: typeof item.popularTag === 'string' ? item.popularTag : null,
        }));
      }
      if (Array.isArray(parsed.revenues)) {
        revenues = parsed.revenues.map((item: Record<string, unknown>, idx: number) => ({
          dayIndex: Number(item.dayIndex ?? idx),
          dayLabel: String(item.dayLabel ?? `D${idx + 1}`),
          amountVnd: Number(item.amountVnd ?? 3000000),
          orderCount: Number(item.orderCount ?? 15),
          isPeak: Boolean(item.isPeak ?? false),
        }));
      }
      if (Array.isArray(parsed.paymentShares)) {
        paymentShares = parsed.paymentShares.map((item: Record<string, unknown>, idx: number) => ({
          name: String(item.name ?? `Phương thức ${idx + 1}`),
          percentage: Number(item.percentage ?? 30),
          totalVnd: Number(item.totalVnd ?? 5000000),
        }));
      }
    }

    return {
      orders,
      services,
      revenues,
      paymentShares,
      summary: {
        ordersImported: orders.length,
        servicesImported: services.length,
        revenuesImported: revenues.length,
        paymentSharesImported: paymentShares.length,
      },
    };
  } catch (err) {
    return {
      orders: [],
      services: [],
      revenues: [],
      paymentShares: [],
      summary: {
        ordersImported: 0,
        servicesImported: 0,
        revenuesImported: 0,
        paymentSharesImported: 0,
        errorMessage: `Lỗi định dạng JSON: ${err instanceof Error ? err.message : 'Không hợp lệ'}`,
      },
    };
  }
}

export function parseImportCsvPayload(
  csvString: string,
  now = Date.now()
): { orders: BusinessOrder[]; summary: ImportSummary } {
  const lines = csvString
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return {
      orders: [],
      summary: {
        ordersImported: 0,
        servicesImported: 0,
        revenuesImported: 0,
        paymentSharesImported: 0,
        errorMessage: 'Dữ liệu CSV trống.',
      },
    };
  }
  const dataLines = lines[0].toLowerCase().startsWith('trackingnumber') ? lines.slice(1) : lines;
  const orders: BusinessOrder[] = [];

  dataLines.forEach((line, index) => {
    const cols = line.split(',').map((c) => c.trim());
    if (cols.length >= 5) {
      const tracking = cols[0] || `VN-${Math.floor(10000 + Math.random() * 90000)}-CSV`;
      orders.push({
        id: `ORD-CSV-${tracking}`,
        trackingNumber: tracking,
        senderName: cols[1] || 'Alex Nguyễn',
        senderAddress: cols[2] || 'Hà Nội',
        recipientName: cols[3] || 'Khách hàng',
        recipientAddress: cols[4] || 'TP. Hồ Chí Minh',
        status: normalizeOrderStatus(cols[5]),
        serviceType: cols[6] || 'Tiết kiệm liên tỉnh',
        feeVnd: Number(cols[7]) || 35000,
        codVnd: Number(cols[8]) || 0,
        createdAt: 'Nhập từ CSV',
        estimatedDelivery: 'Dự kiến trong ngày',
        weightKg: Number(cols[9]) || 1.0,
        timestampMillis: now + (dataLines.length - index),
      });
    }
  });

  if (orders.length === 0) {
    return {
      orders: [],
      summary: {
        ordersImported: 0,
        servicesImported: 0,
        revenuesImported: 0,
        paymentSharesImported: 0,
        errorMessage: 'Không tìm thấy dòng CSV hợp lệ (cần tối thiểu 5 cột).',
      },
    };
  }

  return {
    orders,
    summary: {
      ordersImported: orders.length,
      servicesImported: 0,
      revenuesImported: 0,
      paymentSharesImported: 0,
    },
  };
}

export function exportWorkspaceToJson(
  orders: BusinessOrder[],
  revenues: DailyRevenue[]
): string {
  return JSON.stringify(
    {
      orders: orders.map((o) => ({
        id: o.id,
        trackingNumber: o.trackingNumber,
        senderName: o.senderName,
        senderAddress: o.senderAddress,
        recipientName: o.recipientName,
        recipientAddress: o.recipientAddress,
        status: o.status,
        serviceType: o.serviceType,
        feeVnd: o.feeVnd,
        codVnd: o.codVnd,
        createdAt: o.createdAt,
        estimatedDelivery: o.estimatedDelivery,
        weightKg: o.weightKg,
      })),
      revenues: revenues.map((r) => ({
        dayIndex: r.dayIndex,
        dayLabel: r.dayLabel,
        amountVnd: r.amountVnd,
        orderCount: r.orderCount,
        isPeak: Boolean(r.isPeak),
      })),
    },
    null,
    2
  );
}
