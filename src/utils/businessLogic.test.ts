import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCompanyNotification,
  buildQuickTask,
  canApproveOrderStatus,
  canDeleteOrders,
  canExportEnterpriseReport,
  canSendCompanyNotification,
  computeOperationalStats,
  escapeCsvCell,
  filterOrders,
  formatVnd,
  generateDailyActivitiesCsvReport,
  getDailyActivitiesReportFilename,
  getNextWorkflowAction,
  getNotificationsForAccount,
  getUnreadNotificationsCount,
  isSupervisorAccount,
  mergeOrdersUpsert,
  normalizeOrderStatus,
} from './businessLogic';
import {
  getDefaultActivities,
  getDefaultNotifications,
  getDefaultOrders,
  MOCK_ACCOUNTS,
} from '../data/seedData';

test('formatVnd formats Vietnamese currency properly', () => {
  const formatted = formatVnd(18500000);
  assert.ok(formatted.includes('18.500.000') || formatted.includes('18,500,000'));
  assert.ok(formatted.endsWith('₫'));
});

test('computeOperationalStats summarizes pending, active, and completed counts', () => {
  const orders = getDefaultOrders(10000);
  const stats = computeOperationalStats(orders);
  assert.equal(stats.length, 3);
  assert.equal(stats[0].key, 'pending');
  assert.equal(stats[0].count, '2');
  assert.equal(stats[1].key, 'active');
  assert.equal(stats[1].count, '1');
  assert.equal(stats[2].key, 'completed');
  assert.equal(stats[2].count, '1');
});

test('getNextWorkflowAction returns single-tap status progression', () => {
  assert.deepEqual(getNextWorkflowAction('PENDING'), {
    label: 'Duyệt triển khai',
    nextStatus: 'DELIVERING',
  });
  assert.deepEqual(getNextWorkflowAction('DELIVERING'), {
    label: 'Xác nhận hoàn tất',
    nextStatus: 'COMPLETED',
  });
  assert.deepEqual(getNextWorkflowAction('COMPLETED'), {
    label: 'Mở lại việc',
    nextStatus: 'DELIVERING',
  });
  assert.deepEqual(getNextWorkflowAction('CANCELLED'), {
    label: 'Đưa về chờ duyệt',
    nextStatus: 'PENDING',
  });
});

test('filterOrders filters by search query and status', () => {
  const orders = getDefaultOrders(10000);
  assert.equal(filterOrders(orders, 'POS', null).length, 1);
  assert.equal(filterOrders(orders, '', 'PENDING').length, 2);
  assert.equal(filterOrders(orders, 'nonexistent-xyz', null).length, 0);
});

test('buildQuickTask creates concise mobile-manageable task in PENDING status', () => {
  const task = buildQuickTask({
    title: 'Kiểm tra kho chi nhánh Cầu Giấy',
    assignee: 'Nguyễn Văn An',
    departmentCode: 'OPS',
    branchName: 'Trụ sở Hà Nội',
    budgetVnd: 3500000,
    now: 50000,
    randomCode: 24680,
  });
  assert.equal(task.status, 'PENDING');
  assert.equal(task.trackingNumber, 'OPS-24680');
  assert.equal(task.senderName, 'Phòng Vận Hành Chi nhánh');
  assert.equal(task.senderAddress, 'Kiểm tra kho chi nhánh Cầu Giấy');
  assert.equal(task.recipientName, 'Nguyễn Văn An');
  assert.equal(task.codVnd, 3500000);
});

test('mergeOrdersUpsert deduplicates by id and sorts newest first', () => {
  const existing = getDefaultOrders(10000);
  const created = buildQuickTask({
    title: 'Việc khẩn',
    assignee: 'Trần B',
    departmentCode: 'TECH',
    now: 20000,
    randomCode: 11111,
  });
  const merged = mergeOrdersUpsert(existing, [created]);
  assert.equal(merged.length, existing.length + 1);
  assert.equal(merged[0].id, created.id);
  assert.equal(normalizeOrderStatus('unknown'), 'PENDING');
});

test('escapeCsvCell escapes commas, quotes, and newlines per RFC 4180', () => {
  assert.equal(escapeCsvCell('Trụ sở Hà Nội'), 'Trụ sở Hà Nội');
  assert.equal(escapeCsvCell('Hà Nội, Cầu Giấy'), '"Hà Nội, Cầu Giấy"');
  assert.equal(escapeCsvCell('Duyệt "gấp"'), '"Duyệt ""gấp"""');
  assert.equal(escapeCsvCell('Dòng 1\nDòng 2'), '"Dòng 1\nDòng 2"');
});

test('generateDailyActivitiesCsvReport builds enterprise summary and escaped activity rows', () => {
  const orders = getDefaultOrders(10000);
  const activities = [
    ...getDefaultActivities(10000),
    {
      id: 'ACT-CSV-1',
      type: 'CHECK_IN' as const,
      title: 'Chấm công, "Chi nhánh Đà Nẵng"',
      description: 'Alex Nguyễn xác thực GPS\nca sáng',
      timestamp: '09:45',
      timestampMillis: 20000,
    },
  ];

  const csv = generateDailyActivitiesCsvReport({
    activities,
    orders,
    activeBranch: 'Chi nhánh Đà Nẵng',
    attendanceCount: 125,
    isCheckedInToday: true,
    latestCheckIn: {
      id: 'CHK-1',
      userName: 'Alex Nguyễn',
      branchName: 'Chi nhánh Đà Nẵng',
      coordinates: '16.0544° N, 108.2022° E',
      checkedInAt: '09:45 · Hôm nay',
      dateKey: '2026-11-14',
      timestampMillis: 20000,
    },
    reportDate: '2026-11-14',
  });

  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('Ngay bao cao,2026-11-14'));
  assert.ok(csv.includes('Chi nhanh hoat dong,Chi nhánh Đà Nẵng'));
  assert.ok(csv.includes('Quan so hien dien,125/130'));
  assert.ok(csv.includes('Cho duyet,2'));
  assert.ok(csv.includes('Tong hoat dong ghi nhan,4'));
  assert.ok(csv.includes('ACT-CSV-1,Chấm công GPS,09:45,"Chấm công, ""Chi nhánh Đà Nẵng""","Alex Nguyễn xác thực GPS\nca sáng"'));
  assert.equal(getDailyActivitiesReportFilename('2026-11-14'), 'bao-cao-hoat-dong-2026-11-14.csv');
});

test('supervisor and subordinate accounts have distinct permissions', () => {
  const supervisor = MOCK_ACCOUNTS.find((a) => a.role === 'SUPERVISOR')!;
  const subordinate = MOCK_ACCOUNTS.find((a) => a.role === 'SUBORDINATE')!;

  assert.equal(isSupervisorAccount(supervisor), true);
  assert.equal(isSupervisorAccount(subordinate), false);

  assert.equal(canSendCompanyNotification(supervisor), true);
  assert.equal(canSendCompanyNotification(subordinate), false);

  assert.equal(canDeleteOrders(supervisor), true);
  assert.equal(canDeleteOrders(subordinate), false);

  assert.equal(canExportEnterpriseReport(supervisor), true);
  assert.equal(canExportEnterpriseReport(subordinate), false);

  assert.equal(canApproveOrderStatus(supervisor, 'PENDING', 'DELIVERING'), true);
  assert.equal(canApproveOrderStatus(subordinate, 'PENDING', 'DELIVERING'), false);
  assert.equal(canApproveOrderStatus(subordinate, 'DELIVERING', 'COMPLETED'), true);
});

test('notifications filter by audience, branch, individual, and track unread count', () => {
  const supervisor = MOCK_ACCOUNTS[0]; // Alex Nguyễn (Hà Nội)
  const thao = MOCK_ACCOUNTS.find((a) => a.id === 'ACC-SUB-01')!; // Phạm Thu Thảo (Hà Nội)
  const tuan = MOCK_ACCOUNTS.find((a) => a.id === 'ACC-SUB-02')!; // Lê Minh Tuấn (Đà Nẵng)

  const seeded = getDefaultNotifications(10000);
  // NTF-001 ALL_STAFF (unread by Thao & Tuan), NTF-002 INDIVIDUAL->Thao, NTF-003 BRANCH->Đà Nẵng
  assert.equal(getNotificationsForAccount(seeded, thao).length, 2);
  assert.equal(getUnreadNotificationsCount(seeded, thao), 2);
  assert.equal(getNotificationsForAccount(seeded, tuan).length, 2);
  assert.equal(getUnreadNotificationsCount(seeded, tuan), 2);

  const created = buildCompanyNotification({
    title: 'Họp giao ban khẩn 14:00',
    message: 'Tất cả cấp dưới báo cáo tiến độ trước 13:45.',
    priority: 'URGENT',
    audience: 'SUBORDINATES',
    sender: supervisor,
    now: 25000,
  });

  const combined = [created, ...seeded];
  assert.equal(getNotificationsForAccount(combined, thao)[0].id, created.id);
  assert.equal(getUnreadNotificationsCount(combined, thao), 3);
  assert.equal(getUnreadNotificationsCount(combined, supervisor), 0); // NTF-002 is private INDIVIDUAL to Thao
  assert.equal(getUnreadNotificationsCount(combined, MOCK_ACCOUNTS[1]), 2); // Nam receives NTF-001 + created SUBORDINATES alert
});
