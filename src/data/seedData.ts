import type {
  BranchSupervisor,
  BusinessOrder,
  BusinessService,
  DailyRevenue,
  PaymentMethodShare,
  ScheduleDayItem,
  TrackingStep,
} from '../types/business';

export function getDefaultOrders(baseTimestamp = Date.now()): BusinessOrder[] {
  return [
    {
      id: 'ORD-001',
      trackingNumber: 'PRJ-88492-ERP',
      senderName: 'Phòng Kỹ Thuật & R&D',
      senderAddress: 'Dự án: Triển khai Hệ thống Quản trị ERP Cloud Q4',
      recipientName: 'Phạm Thị Thu Thảo (Project Lead)',
      recipientAddress: 'Trụ sở Hà Nội • Tiến độ 85% • Ưu tiên Cao',
      status: 'DELIVERING',
      serviceType: 'Dự án Công nghệ',
      feeVnd: 4500000,
      codVnd: 28500000,
      createdAt: '08:30 • Hôm nay',
      estimatedDelivery: 'Hạn: 25/11/2026',
      weightKg: 15.0,
      timestampMillis: baseTimestamp - 1000,
    },
    {
      id: 'ORD-002',
      trackingNumber: 'CTR-88491-B2B',
      senderName: 'Phòng Kinh Doanh B2B',
      senderAddress: 'Hợp đồng: Cung ứng Phần mềm Quản lý Chuỗi Bán lẻ',
      recipientName: 'Nguyễn Minh Khang (Sales Manager)',
      recipientAddress: 'Chi nhánh Đà Nẵng • Đã bàn giao nghiệm thu',
      status: 'COMPLETED',
      serviceType: 'Hợp đồng B2B',
      feeVnd: 2100000,
      codVnd: 42000000,
      createdAt: '09:15 • 09/11/2026',
      estimatedDelivery: 'Đã nghiệm thu 16:20',
      weightKg: 10.0,
      timestampMillis: baseTimestamp - 2000,
    },
    {
      id: 'ORD-003',
      trackingNumber: 'FIN-88490-AUD',
      senderName: 'Phòng Tài Chính - Kế Toán',
      senderAddress: 'Quy trình: Phê duyệt Ngân sách Vận hành & Lương T11',
      recipientName: 'Trần Đình Trọng (CFO)',
      recipientAddress: 'Trụ sở Chính • Chờ Ban Giám Đốc ký duyệt',
      status: 'PENDING',
      serviceType: 'Ngân sách & Lương',
      feeVnd: 1800000,
      codVnd: 65000000,
      createdAt: '07:30 • Hôm nay',
      estimatedDelivery: 'Hạn duyệt: 18:00',
      weightKg: 5.0,
      timestampMillis: baseTimestamp - 3000,
    },
    {
      id: 'ORD-004',
      trackingNumber: 'MKT-88489-CMP',
      senderName: 'Phòng Marketing & Truyền Thông',
      senderAddress: 'Chiến dịch: Ra mắt Bộ Giải pháp Doanh nghiệp Số 2026',
      recipientName: 'Hoàng Kim Oanh (CMO)',
      recipientAddress: 'Chi nhánh TP.HCM • Đạt 120% KPI khách hàng',
      status: 'COMPLETED',
      serviceType: 'Chiến dịch MKT',
      feeVnd: 3200000,
      codVnd: 19500000,
      createdAt: '14:20 • 08/11/2026',
      estimatedDelivery: 'Hoàn thành vượt KPI',
      weightKg: 8.0,
      timestampMillis: baseTimestamp - 4000,
    },
    {
      id: 'ORD-005',
      trackingNumber: 'HR-88488-REC',
      senderName: 'Phòng Hành Chính - Nhân Sự',
      senderAddress: 'Đề xuất: Tuyển dụng & Đào tạo 15 Kỹ sư Phần mềm',
      recipientName: 'Lê Hoàng Long (HR Director)',
      recipientAddress: 'Chi nhánh Cần Thơ • Tạm dừng chờ điều chỉnh định biên',
      status: 'CANCELLED',
      serviceType: 'Nhân sự & Đào tạo',
      feeVnd: 950000,
      codVnd: 12000000,
      createdAt: '09:00 • 07/11/2026',
      estimatedDelivery: 'Tạm dừng xét duyệt',
      weightKg: 6.0,
      timestampMillis: baseTimestamp - 5000,
    },
  ];
}

export function getDefaultServices(): BusinessService[] {
  return [
    {
      id: 'SRV-01',
      name: 'Phạm Thị Thu Thảo — Trưởng phòng Dự án',
      description:
        'Chuyên gia Quản trị Dự án ERP & Chuyển đổi số. Phụ trách 12 dự án trọng điểm, tỷ lệ đúng hạn 98.5%.',
      basePriceVnd: 32000000,
      deliveryTime: 'Phòng Kỹ Thuật • KPI 98%',
      popularTag: 'Nhân sự Xuất sắc',
    },
    {
      id: 'SRV-02',
      name: 'Nguyễn Minh Khang — Giám đốc Kinh doanh B2B',
      description:
        'Quản lý mạng lưới 85 đối tác doanh nghiệp lớn toàn quốc, vượt 135% chỉ tiêu doanh số Quý 4.',
      basePriceVnd: 38000000,
      deliveryTime: 'Phòng Kinh Doanh • KPI 135%',
      popularTag: 'Top Doanh Số',
    },
    {
      id: 'SRV-03',
      name: 'Gói Giải pháp ERP Doanh nghiệp Toàn diện',
      description:
        'Hệ thống quản lý đồng bộ Tài chính, Kho vận, Nhân sự (HRM) và CRM cho doanh nghiệp vừa và lớn.',
      basePriceVnd: 45000000,
      deliveryTime: 'Sẵn sàng triển khai',
      popularTag: 'Sản phẩm Chủ lực',
    },
    {
      id: 'SRV-04',
      name: 'Hệ thống POS & Quản trị Chuỗi Chi nhánh',
      description:
        'Giải pháp phần cứng kết hợp Cloud AI đồng bộ tồn kho, hóa đơn điện tử và báo cáo lãi lỗ theo thời gian thực.',
      basePriceVnd: 18500000,
      deliveryTime: 'Tồn kho: 145 bộ',
      popularTag: 'Bán chạy nhất',
    },
  ];
}

export function getDefaultRevenues(): DailyRevenue[] {
  return [
    { dayIndex: 0, dayLabel: 'T2', amountVnd: 3450000, orderCount: 18, isPeak: false },
    { dayIndex: 1, dayLabel: 'T3', amountVnd: 4200000, orderCount: 22, isPeak: false },
    { dayIndex: 2, dayLabel: 'T4', amountVnd: 5100000, orderCount: 26, isPeak: false },
    { dayIndex: 3, dayLabel: 'T5', amountVnd: 4800000, orderCount: 24, isPeak: false },
    { dayIndex: 4, dayLabel: 'T6', amountVnd: 7650000, orderCount: 38, isPeak: true },
    { dayIndex: 5, dayLabel: 'T7', amountVnd: 5900000, orderCount: 30, isPeak: false },
    { dayIndex: 6, dayLabel: 'CN', amountVnd: 3550000, orderCount: 16, isPeak: false },
  ];
}

export function getDefaultPaymentShares(): PaymentMethodShare[] {
  return [
    { name: 'Doanh thu Hợp đồng & Dịch vụ B2B', percentage: 45, totalVnd: 15590000 },
    { name: 'Quỹ Vận hành & Lương thưởng Nhân sự', percentage: 35, totalVnd: 12120000 },
    { name: 'Đầu tư R&D & Hạ tầng Công nghệ', percentage: 20, totalVnd: 6940000 },
  ];
}

export function getDefaultDriver(): BranchSupervisor {
  return {
    name: 'Trần Văn Mạnh — Giám đốc Vận hành',
    phone: '0982 123 456',
    licensePlate: 'HQ-HANOI-01 • 124/130 Nhân sự có mặt',
    vehicleModel: 'Trụ sở Chính Ba Đình, Hà Nội',
    rating: 4.9,
    completedTrips: 148,
    currentDistanceKm: 0.1,
    etaMinutes: 12,
  };
}

export function getDefaultTrackingSteps(): TrackingStep[] {
  return [
    {
      title: 'Mở ca vận hành & Đồng bộ hệ thống',
      description:
        'Hệ thống chấm công sinh trắc học & GPS tại 3 chi nhánh (Hà Nội, Đà Nẵng, TP.HCM) đã kích hoạt.',
      timestamp: '08:00',
      isDone: true,
      isCurrent: false,
    },
    {
      title: 'Họp giao ban Trưởng bộ phận',
      description: 'Phê duyệt chỉ tiêu KPI ngày và phân bổ nguồn lực cho 5 phòng ban chuyên môn.',
      timestamp: '08:45',
      isDone: true,
      isCurrent: false,
    },
    {
      title: 'Kiểm soát tiến độ Dự án & Hợp đồng',
      description: 'Phòng Kỹ thuật & Kinh doanh cập nhật dữ liệu nghiệm thu lên Database đồng bộ.',
      timestamp: '10:15',
      isDone: true,
      isCurrent: false,
    },
    {
      title: 'Giám sát vận hành & Phê duyệt ngân sách',
      description: 'Ban Giám đốc đang xét duyệt 3 đề xuất giải ngân và theo dõi chấm công ca chiều.',
      timestamp: '14:00',
      isDone: false,
      isCurrent: true,
    },
    {
      title: 'Tổng kết doanh thu & Đóng sổ cuối ngày',
      description: 'Tự động đối soát dòng tiền, xuất báo cáo tài chính và sao lưu Database.',
      timestamp: 'Dự kiến 17:30',
      isDone: false,
      isCurrent: false,
    },
  ];
}

export function getDefaultWeeklySchedule(): ScheduleDayItem[] {
  return [
    {
      dayOfWeek: 'T2',
      dayNumber: '06',
      meetingTitle: 'Họp Giao ban Đầu tuần & Rà soát KPI',
      department: 'Ban Giám Đốc & Trưởng phòng',
      timeSlot: '08:30 - 10:00',
      roomOrLocation: 'Phòng họp VIP A1',
      statusBadge: 'Đã hoàn tất',
    },
    {
      dayOfWeek: 'T3',
      dayNumber: '07',
      meetingTitle: 'Đào tạo Quy trình ERP & Database',
      department: 'Phòng Kỹ Thuật & Nhân Sự',
      timeSlot: '09:30 - 11:30',
      roomOrLocation: 'Hội trường Tầng 4',
      statusBadge: 'Đã hoàn tất',
    },
    {
      dayOfWeek: 'T4',
      dayNumber: '08',
      meetingTitle: 'Ký kết Hợp đồng Chuỗi Bán lẻ B2B',
      department: 'Phòng Kinh Doanh B2B',
      timeSlot: '14:00 - 16:00',
      roomOrLocation: 'Chi nhánh TP.HCM',
      statusBadge: 'Đã hoàn tất',
    },
    {
      dayOfWeek: 'T5',
      dayNumber: '09',
      meetingTitle: 'Kiểm toán Chi phí & Đối soát Quỹ',
      department: 'Phòng Tài Chính - Kế Toán',
      timeSlot: '10:00 - 11:30',
      roomOrLocation: 'Phòng họp B2',
      statusBadge: 'Đã hoàn tất',
    },
    {
      dayOfWeek: 'T6',
      dayNumber: '10',
      meetingTitle: 'Hội nghị Đánh giá Dự án Trọng điểm Q4',
      department: 'Toàn bộ Khối Vận Hành',
      timeSlot: '14:00 - 16:30',
      roomOrLocation: 'Trụ sở Chính Hà Nội',
      statusBadge: 'Đang diễn ra',
    },
    {
      dayOfWeek: 'T7',
      dayNumber: '11',
      meetingTitle: 'Tổng kết Chấm công & Thưởng Tuần',
      department: 'Phòng Hành Chính - Nhân Sự',
      timeSlot: '09:00 - 11:00',
      roomOrLocation: 'Trực tuyến / Hybrid',
      statusBadge: 'Sắp tới',
    },
    {
      dayOfWeek: 'CN',
      dayNumber: '12',
      meetingTitle: 'Bảo trì Máy chủ & Sao lưu SQLite DB',
      department: 'Đội ngũ IT SysAdmin',
      timeSlot: '22:00 - 23:30',
      roomOrLocation: 'Data Center Cloud',
      statusBadge: 'Lịch cố định',
    },
  ];
}

export const SAMPLE_IMPORT_JSON = `{
  "orders": [
    {
      "id": "ORD-IMP-101",
      "trackingNumber": "VN-99201-HN",
      "senderName": "Phòng Kinh Doanh Quốc Tế",
      "senderAddress": "Dự án: Ký kết Hợp đồng Cung ứng Thiết bị POS",
      "recipientName": "Đặng Quốc Việt (Account Lead)",
      "recipientAddress": "Trụ sở Hà Nội • Ưu tiên Cao • Tiến độ 70%",
      "status": "DELIVERING",
      "serviceType": "Hợp đồng B2B",
      "feeVnd": 3500000,
      "codVnd": 45000000,
      "createdAt": "Vừa nhập DB",
      "estimatedDelivery": "Hạn: 28/11/2026",
      "weightKg": 12.0
    },
    {
      "id": "ORD-IMP-102",
      "trackingNumber": "PRJ-99202-SG",
      "senderName": "Phòng Công Nghệ & AI",
      "senderAddress": "Dự án: Nâng cấp Cơ sở dữ liệu Doanh nghiệp",
      "recipientName": "Vũ Ngọc Ánh (Tech Lead)",
      "recipientAddress": "Chi nhánh TP.HCM • Chờ phê duyệt ngân sách",
      "status": "PENDING",
      "serviceType": "Dự án Công nghệ",
      "feeVnd": 2900000,
      "codVnd": 32000000,
      "createdAt": "Vừa nhập DB",
      "estimatedDelivery": "Hạn: 30/11/2026",
      "weightKg": 18.5
    },
    {
      "id": "ORD-IMP-103",
      "trackingNumber": "FIN-99203-BD",
      "senderName": "Phòng Tài Chính - Kế Toán",
      "senderAddress": "Quy trình: Quyết toán Thuế & Thưởng Quý 4",
      "recipientName": "Công ty Kiểm toán Minh Phát",
      "recipientAddress": "Chi nhánh Bình Dương • Đã hoàn tất nghiệm thu",
      "status": "COMPLETED",
      "serviceType": "Tài chính & Kiểm toán",
      "feeVnd": 1500000,
      "codVnd": 25000000,
      "createdAt": "Vừa nhập DB",
      "estimatedDelivery": "Đã nghiệm thu",
      "weightKg": 6.0
    }
  ],
  "revenues": [
    { "dayIndex": 0, "dayLabel": "T2", "amountVnd": 4100000, "orderCount": 21, "isPeak": false },
    { "dayIndex": 1, "dayLabel": "T3", "amountVnd": 5300000, "orderCount": 27, "isPeak": false },
    { "dayIndex": 2, "dayLabel": "T4", "amountVnd": 6200000, "orderCount": 31, "isPeak": false },
    { "dayIndex": 3, "dayLabel": "T5", "amountVnd": 5850000, "orderCount": 29, "isPeak": false },
    { "dayIndex": 4, "dayLabel": "T6", "amountVnd": 9400000, "orderCount": 48, "isPeak": true },
    { "dayIndex": 5, "dayLabel": "T7", "amountVnd": 7200000, "orderCount": 36, "isPeak": false },
    { "dayIndex": 6, "dayLabel": "CN", "amountVnd": 4800000, "orderCount": 24, "isPeak": false }
  ]
}`;

export const SAMPLE_IMPORT_CSV = `trackingNumber,senderName,senderAddress,recipientName,recipientAddress,status,serviceType,feeVnd,codVnd,weightKg
PRJ-77501-HN,Phòng Kinh Doanh,Triển khai Đại lý Khu vực Miền Bắc,Lê Văn Tùng,Trụ sở Ba Đình Hà Nội,DELIVERING,Hợp đồng B2B,2800000,35000000,10.0
PRJ-77502-DN,Phòng Kỹ Thuật,Bảo trì Hạ tầng Cloud Chi nhánh Miền Trung,Bùi Bích Phương,Chi nhánh Hải Châu Đà Nẵng,PENDING,Dự án Công nghệ,1900000,21500000,8.0
PRJ-77503-HP,Phòng Nhân Sự,Đào tạo Hội nhập Nhân sự Mới T11,Ngô Thanh Vân,Chi nhánh Ngô Quyền Hải Phòng,COMPLETED,Nhân sự & Đào tạo,950000,12000000,4.5`;
