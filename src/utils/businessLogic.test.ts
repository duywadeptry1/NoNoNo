import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildNewOrder,
  calculateBudgetEstimate,
  computeStatsFromOrders,
  exportWorkspaceToJson,
  filterOrders,
  formatVnd,
  mergeOrdersUpsert,
  parseImportCsvPayload,
  parseImportJsonPayload,
} from './businessLogic';
import {
  getDefaultOrders,
  getDefaultRevenues,
  getDefaultServices,
  SAMPLE_IMPORT_CSV,
  SAMPLE_IMPORT_JSON,
} from '../data/seedData';

test('formatVnd formats Vietnamese currency properly', () => {
  const formatted = formatVnd(34650000);
  assert.ok(formatted.includes('34.650.000') || formatted.includes('34,650,000'));
  assert.ok(formatted.endsWith('₫'));
});

test('computeStatsFromOrders reflects default seed counts and status changes', () => {
  const orders = getDefaultOrders(10000);
  const stats = computeStatsFromOrders(orders);
  assert.equal(stats.length, 4);
  assert.equal(stats[0].count, '5'); // Total
  assert.equal(stats[1].count, '2'); // 1 DELIVERING + 1 PENDING
  assert.equal(stats[2].count, '2'); // 2 COMPLETED
  assert.equal(stats[3].count, '1'); // 1 CANCELLED
});

test('filterOrders filters by search query and status', () => {
  const orders = getDefaultOrders(10000);
  assert.equal(filterOrders(orders, 'ERP', null).length, 1);
  assert.equal(filterOrders(orders, '', 'COMPLETED').length, 2);
  assert.equal(filterOrders(orders, 'nonexistent-xyz', null).length, 0);
});

test('calculateBudgetEstimate and buildNewOrder produce valid project records', () => {
  const services = getDefaultServices();
  const est = calculateBudgetEstimate(32000000, 10);
  assert.equal(est.estimatedBudget, 48000000);
  assert.equal(est.reserveFund, 7200000);
  assert.equal(est.totalApproved, 40800000);

  const created = buildNewOrder({
    recipientName: 'Trần Thu Trang',
    recipientAddress: 'Dự án ERP Chi nhánh Miền Bắc',
    weightKg: 10,
    departmentCode: 'TECH',
    service: services[0],
    now: 50000,
    randomCode: 12345,
  });
  assert.equal(created.status, 'PENDING');
  assert.equal(created.senderName, 'Phòng Kỹ Thuật & R&D');
  assert.equal(created.recipientName, 'Trần Thu Trang');
  assert.equal(created.trackingNumber, 'PRJ-12345-BM');
});

test('parseImportJsonPayload imports sample JSON and merges with existing orders', () => {
  const existing = getDefaultOrders(10000);
  const imported = parseImportJsonPayload(SAMPLE_IMPORT_JSON, 20000);
  assert.equal(imported.summary.errorMessage, undefined);
  assert.equal(imported.summary.ordersImported, 3);
  assert.equal(imported.summary.revenuesImported, 7);

  const merged = mergeOrdersUpsert(existing, imported.orders);
  assert.equal(merged.length, 8);
  assert.ok(merged.some((o) => o.trackingNumber === 'VN-99201-HN'));
});

test('parseImportCsvPayload imports sample CSV and validates malformed inputs', () => {
  const csvResult = parseImportCsvPayload(SAMPLE_IMPORT_CSV, 20000);
  assert.equal(csvResult.summary.errorMessage, undefined);
  assert.equal(csvResult.orders.length, 3);
  assert.equal(csvResult.orders[0].trackingNumber, 'PRJ-77501-HN');

  const emptyResult = parseImportCsvPayload('   ');
  assert.ok(emptyResult.summary.errorMessage);
});

test('exportWorkspaceToJson round-trips cleanly through parseImportJsonPayload', () => {
  const orders = getDefaultOrders(10000);
  const revenues = getDefaultRevenues();
  const json = exportWorkspaceToJson(orders, revenues);
  const reparsed = parseImportJsonPayload(json, 20000);
  assert.equal(reparsed.summary.ordersImported, orders.length);
  assert.equal(reparsed.summary.revenuesImported, revenues.length);
});
