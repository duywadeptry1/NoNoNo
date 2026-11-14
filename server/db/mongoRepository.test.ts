import test from 'node:test';
import assert from 'node:assert/strict';
import { BusinessMongoRepository } from './mongoRepository';
import { buildQuickTask } from '../../src/utils/businessLogic';

test('BusinessMongoRepository seeds defaults and supports CRUD + check-in + reset', async () => {
  const repo = new BusinessMongoRepository();
  const mode = await repo.connectAndSeed(undefined);
  assert.equal(mode, 'memory-fallback');

  const initial = await repo.getWorkspaceSnapshot();
  assert.equal(initial.orders.length, 5);
  assert.equal(initial.isCheckedInToday, false);
  assert.equal(initial.databaseMode, 'memory-fallback');

  // Create task
  const task = buildQuickTask({
    title: 'Duyệt đơn hàng thiết bị POS',
    assignee: 'Trần Thu Trang',
    departmentCode: 'TECH',
    now: Date.now() + 10_000,
    randomCode: 54321,
  });
  await repo.upsertOrder(task);

  const afterCreate = await repo.getWorkspaceSnapshot();
  assert.equal(afterCreate.orders.length, 6);
  assert.equal(afterCreate.orders[0].trackingNumber, 'TECH-54321');
  assert.ok(afterCreate.activities.some((a) => a.title.includes('TECH-54321')));

  // Update status
  const nextStatus = await repo.updateOrderStatus(task.id, 'DELIVERING');
  assert.equal(nextStatus, 'DELIVERING');
  const updated = (await repo.listOrders()).find((o) => o.id === task.id);
  assert.equal(updated?.status, 'DELIVERING');

  // GPS check-in
  const checkin = await repo.performCheckIn({ branchName: 'Chi nhánh Đà Nẵng' });
  assert.equal(checkin.isCheckedInToday, true);
  assert.equal(checkin.activeBranch, 'Chi nhánh Đà Nẵng');
  assert.equal(checkin.attendanceCount, 125);

  // Send company notification (Supervisor)
  const sentNotif = await repo.sendNotification({
    title: 'Họp giao ban khẩn 14:00',
    message: 'Nhân viên các chi nhánh báo cáo số liệu trước 13:45.',
    priority: 'URGENT',
    audience: 'SUBORDINATES',
    senderId: 'ACC-SUP-01',
  });
  assert.equal(sentNotif.senderName, 'Alex Nguyễn');

  const withNotif = await repo.getWorkspaceSnapshot();
  assert.ok(withNotif.notifications.some((n) => n.id === sentNotif.id));
  assert.ok(withNotif.activities.some((a) => a.type === 'NOTIFICATION_SENT'));

  // Subordinate marks notification read
  const readNotif = await repo.markNotificationRead(sentNotif.id, 'ACC-SUB-01');
  assert.ok(readNotif?.readByAccountIds.includes('ACC-SUB-01'));

  // Delete & reset
  const deleted = await repo.deleteOrder(task.id);
  assert.equal(deleted, true);
  const reset = await repo.resetWorkspace();
  assert.equal(reset.orders.length, 5);
  assert.equal(reset.isCheckedInToday, false);
  assert.equal(reset.notifications.length, 3);
});
