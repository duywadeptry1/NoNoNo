import type {
  ActivityLogItem,
  BusinessOrder,
  CompanyNotification,
  MockAccount,
} from '../types/business';

export const APP_BRANCHES = [
  'Trụ sở Hà Nội',
  'Chi nhánh Đà Nẵng',
  'Chi nhánh TP.HCM',
] as const;

export const APP_DEPARTMENTS = [
  { code: 'B2B', label: 'Kinh doanh', fullName: 'Phòng Kinh Doanh B2B' },
  { code: 'TECH', label: 'Kỹ thuật', fullName: 'Phòng Kỹ Thuật & R&D' },
  { code: 'OPS', label: 'Vận hành', fullName: 'Phòng Vận Hành Chi nhánh' },
  { code: 'FIN', label: 'Tài chính', fullName: 'Phòng Tài Chính' },
] as const;

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: 'ACC-SUP-01',
    name: 'Alex Nguyễn',
    role: 'SUPERVISOR',
    title: 'Giám đốc Vận hành',
    department: 'Ban Điều hành',
    branchName: 'Trụ sở Hà Nội',
  },
  {
    id: 'ACC-SUP-02',
    name: 'Nguyễn Hoàng Nam',
    role: 'SUPERVISOR',
    title: 'Trưởng phòng Kỹ thuật',
    department: 'Phòng Kỹ Thuật & R&D',
    branchName: 'Chi nhánh Đà Nẵng',
  },
  {
    id: 'ACC-SUB-01',
    name: 'Phạm Thu Thảo',
    role: 'SUBORDINATE',
    title: 'Chuyên viên Hiện trường',
    department: 'Phòng Kỹ Thuật & R&D',
    branchName: 'Trụ sở Hà Nội',
  },
  {
    id: 'ACC-SUB-02',
    name: 'Lê Minh Tuấn',
    role: 'SUBORDINATE',
    title: 'Nhân viên Vận hành',
    department: 'Phòng Vận Hành Chi nhánh',
    branchName: 'Chi nhánh Đà Nẵng',
  },
  {
    id: 'ACC-SUB-03',
    name: 'Trần Đình Trọng',
    role: 'SUBORDINATE',
    title: 'Chuyên viên Tài chính',
    department: 'Phòng Tài Chính',
    branchName: 'Chi nhánh TP.HCM',
  },
];

export function getDefaultOrders(baseTimestamp = Date.now()): BusinessOrder[] {
  return [
    {
      id: 'ORD-001',
      trackingNumber: 'FIN-88490',
      senderName: 'Phòng Tài Chính',
      senderAddress: 'Duyệt chi phí vận hành & phụ cấp ca tháng 11',
      recipientName: 'Trần Đình Trọng',
      recipientAddress: 'Trụ sở Hà Nội · Chờ duyệt qua app',
      status: 'PENDING',
      serviceType: 'Phê duyệt nhanh',
      feeVnd: 0,
      codVnd: 18500000,
      createdAt: '08:15 · Hôm nay',
      estimatedDelivery: 'Hạn duyệt: 17:30',
      weightKg: 1,
      timestampMillis: baseTimestamp - 1000,
    },
    {
      id: 'ORD-002',
      trackingNumber: 'PRJ-88492',
      senderName: 'Phòng Kỹ Thuật & R&D',
      senderAddress: 'Triển khai thiết bị POS tại điểm bán Cầu Giấy',
      recipientName: 'Phạm Thu Thảo',
      recipientAddress: 'Trụ sở Hà Nội · Đang lắp đặt',
      status: 'DELIVERING',
      serviceType: 'Hiện trường',
      feeVnd: 0,
      codVnd: 12000000,
      createdAt: '09:00 · Hôm nay',
      estimatedDelivery: 'Hạn: 25/11/2026',
      weightKg: 2,
      timestampMillis: baseTimestamp - 2000,
    },
    {
      id: 'ORD-003',
      trackingNumber: 'OPS-88493',
      senderName: 'Phòng Vận Hành Chi nhánh',
      senderAddress: 'Kiểm tra thiết bị & mở ca chi nhánh Đà Nẵng',
      recipientName: 'Lê Minh Tuấn',
      recipientAddress: 'Chi nhánh Đà Nẵng · Chờ xác nhận',
      status: 'PENDING',
      serviceType: 'Phê duyệt nhanh',
      feeVnd: 0,
      codVnd: 4500000,
      createdAt: '09:40 · Hôm nay',
      estimatedDelivery: 'Hạn: Hôm nay',
      weightKg: 1,
      timestampMillis: baseTimestamp - 3000,
    },
    {
      id: 'ORD-004',
      trackingNumber: 'CTR-88491',
      senderName: 'Phòng Kinh Doanh B2B',
      senderAddress: 'Bàn giao hợp đồng chuỗi bán lẻ Miền Trung',
      recipientName: 'Nguyễn Minh Khang',
      recipientAddress: 'Chi nhánh Đà Nẵng · Đã ký biên bản',
      status: 'COMPLETED',
      serviceType: 'Bàn giao',
      feeVnd: 0,
      codVnd: 42000000,
      createdAt: 'Hôm qua',
      estimatedDelivery: 'Đã hoàn tất',
      weightKg: 3,
      timestampMillis: baseTimestamp - 4000,
    },
    {
      id: 'ORD-005',
      trackingNumber: 'OPS-88488',
      senderName: 'Phòng Vận Hành Chi nhánh',
      senderAddress: 'Bảo trì máy chủ nội bộ chi nhánh Cần Thơ',
      recipientName: 'Lê Hoàng Long',
      recipientAddress: 'Chi nhánh TP.HCM · Tạm hoãn lịch',
      status: 'CANCELLED',
      serviceType: 'Bảo trì',
      feeVnd: 0,
      codVnd: 6000000,
      createdAt: '07/11/2026',
      estimatedDelivery: 'Chờ sắp lịch lại',
      weightKg: 1,
      timestampMillis: baseTimestamp - 5000,
    },
  ];
}

export function getDefaultActivities(baseTimestamp = Date.now()): ActivityLogItem[] {
  return [
    {
      id: 'ACT-001',
      type: 'STATUS_UPDATED',
      title: 'Khởi tạo hàng đợi phê duyệt ngày mới',
      description: 'Có 2 đầu việc đang chờ duyệt nhanh trên ứng dụng.',
      timestamp: '08:15',
      timestampMillis: baseTimestamp - 1000,
    },
    {
      id: 'ACT-002',
      type: 'ORDER_CREATED',
      title: 'Cập nhật tiến độ hiện trường PRJ-88492',
      description: 'Phạm Thu Thảo đã nhận thiết bị và di chuyển tới điểm bán Cầu Giấy.',
      timestamp: '09:05',
      timestampMillis: baseTimestamp - 2000,
    },
    {
      id: 'ACT-003',
      type: 'SYSTEM',
      title: 'Đồng bộ cơ sở dữ liệu MongoDB',
      description: 'Dữ liệu công việc và chấm công được đồng bộ giữa Web và Android Studio.',
      timestamp: '09:30',
      timestampMillis: baseTimestamp - 3000,
    },
  ];
}

export function getDefaultNotifications(baseTimestamp = Date.now()): CompanyNotification[] {
  return [
    {
      id: 'NTF-001',
      title: 'Nhắc chấm công GPS trước 08:30 tại các chi nhánh',
      message:
        'Toàn bộ nhân sự đi làm trực tiếp vui lòng xác nhận vị trí GPS trên app trước giờ vào ca để chốt quân số.',
      priority: 'IMPORTANT',
      audience: 'ALL_STAFF',
      senderId: 'ACC-SUP-01',
      senderName: 'Alex Nguyễn',
      senderRole: 'SUPERVISOR',
      createdAt: '08:00 · Hôm nay',
      timestampMillis: baseTimestamp - 1500,
      readByAccountIds: ['ACC-SUP-01'],
    },
    {
      id: 'NTF-002',
      title: 'Cập nhật biên bản bàn giao POS điểm bán Cầu Giấy',
      message:
        'Phạm Thu Thảo chụp ảnh nghiệm thu thiết bị POS (PRJ-88492) và bấm xác nhận hoàn tất ngay sau khi lắp đặt xong.',
      priority: 'URGENT',
      audience: 'INDIVIDUAL',
      targetAccountId: 'ACC-SUB-01',
      targetAccountName: 'Phạm Thu Thảo',
      senderId: 'ACC-SUP-02',
      senderName: 'Nguyễn Hoàng Nam',
      senderRole: 'SUPERVISOR',
      createdAt: '09:10 · Hôm nay',
      timestampMillis: baseTimestamp - 2500,
      readByAccountIds: ['ACC-SUP-02'],
    },
    {
      id: 'NTF-003',
      title: 'Lịch bảo trì hệ thống chi nhánh Đà Nẵng cuối tuần',
      message:
        'Đội vận hành chi nhánh Đà Nẵng chuẩn bị phương án dự phòng ca trực vào 18:00 Thứ Sáu.',
      priority: 'NORMAL',
      audience: 'BRANCH',
      targetBranch: 'Chi nhánh Đà Nẵng',
      senderId: 'ACC-SUP-01',
      senderName: 'Alex Nguyễn',
      senderRole: 'SUPERVISOR',
      createdAt: 'Hôm qua',
      timestampMillis: baseTimestamp - 3500,
      readByAccountIds: ['ACC-SUP-01', 'ACC-SUP-02'],
    },
  ];
}
