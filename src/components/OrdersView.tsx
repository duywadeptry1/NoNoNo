import { useMemo, useState } from 'react';
import {
  Briefcase,
  CloudDownload,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { ORDER_STATUS_META, type BusinessOrder, type OrderStatus } from '../types/business';
import { filterOrders, formatVnd } from '../utils/businessLogic';
import { OrderCard } from './OrderCard';
import { StatusBadge } from './StatusBadge';

interface OrdersViewProps {
  orders: BusinessOrder[];
  searchQuery: string;
  selectedFilter: OrderStatus | null;
  onSearchChange: (q: string) => void;
  onFilterSelect: (status: OrderStatus | null) => void;
  onCreateOrderClick: () => void;
  onOpenDbImportClick: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onTrackOrderClick: (trackingNumber: string) => void;
  onJumpToTracking: () => void;
}

const ALL_STATUSES: OrderStatus[] = ['DELIVERING', 'PENDING', 'COMPLETED', 'CANCELLED'];

export function OrdersView({
  orders,
  searchQuery,
  selectedFilter,
  onSearchChange,
  onFilterSelect,
  onCreateOrderClick,
  onOpenDbImportClick,
  onUpdateOrderStatus,
  onDeleteOrder,
  onTrackOrderClick,
  onJumpToTracking,
}: OrdersViewProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders[0]?.id ?? null
  );

  const filteredOrders = useMemo(
    () => filterOrders(orders, searchQuery, selectedFilter),
    [orders, searchQuery, selectedFilter]
  );

  const selectedOrder =
    filteredOrders.find((o) => o.id === selectedOrderId) ??
    filteredOrders[0] ??
    null;

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 pb-24 md:px-8 md:pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Quản lý Dự án & Quy trình ({orders.length})
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Đồng bộ thời gian thực với Backend API & Database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenDbImportClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-[#0F172A] transition hover:bg-slate-50 dark:border-[#2E3E55] dark:bg-[#151E2E] dark:text-[#F8FAFC] dark:hover:bg-[#1E293B]"
          >
            <CloudDownload className="h-4 w-4 text-[#1A56FA]" />
            <span>Nhập / Xuất DB</span>
          </button>
          <button
            type="button"
            onClick={onCreateOrderClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1A56FA] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#1447C6]"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo dự án</span>
          </button>
        </div>
      </header>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <label htmlFor="orders-search-input" className="sr-only">
            Tìm kiếm dự án theo mã hoặc phòng ban
          </label>
          <input
            id="orders-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo mã PRJ, phòng ban hoặc người phụ trách…"
            className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#1A56FA] focus:outline-none dark:border-[#2E3E55] dark:bg-[#151E2E] dark:text-[#F8FAFC]"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo trạng thái">
          <button
            type="button"
            onClick={() => onFilterSelect(null)}
            aria-pressed={selectedFilter === null}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              selectedFilter === null
                ? 'bg-[#1A56FA] text-white'
                : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-slate-50 dark:border-[#2E3E55] dark:bg-[#151E2E] dark:text-[#94A3B8]'
            }`}
          >
            Tất cả ({orders.length})
          </button>
          {ALL_STATUSES.map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            const active = selectedFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => onFilterSelect(active ? null : status)}
                aria-pressed={active}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? 'bg-[#1A56FA] text-white'
                    : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-slate-50 dark:border-[#2E3E55] dark:bg-[#151E2E] dark:text-[#94A3B8]'
                }`}
              >
                {ORDER_STATUS_META[status].label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Master-Detail Split Layout */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white py-12 text-center dark:border-[#2E3E55] dark:bg-[#151E2E]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EBF2FF] text-[#1A56FA] dark:bg-blue-950/70 dark:text-blue-400">
            <Briefcase className="h-7 w-7" />
          </div>
          <h2 className="mt-3 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Không tìm thấy dự án / quy trình phù hợp
          </h2>
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
            Hãy thử tìm kiếm khác hoặc nhập dữ liệu mới từ Database
          </p>
          <button
            type="button"
            onClick={onOpenDbImportClick}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#1A56FA] hover:bg-blue-50 dark:border-[#2E3E55] dark:text-blue-400"
          >
            <CloudDownload className="h-4 w-4" />
            <span>Nhập dữ liệu từ Database</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7" data-testid="orders-list">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedOrder?.id === order.id}
                onSelect={() => setSelectedOrderId(order.id)}
                onTrackClick={() => {
                  onTrackOrderClick(order.trackingNumber);
                  onJumpToTracking();
                }}
              />
            ))}
          </div>

          {selectedOrder && (
            <aside
              aria-label="Hồ sơ chi tiết dự án"
              className="h-fit rounded-2xl border border-[#E2E8F0] bg-white p-5 lg:sticky lg:top-5 lg:col-span-5 dark:border-[#2E3E55] dark:bg-[#151E2E]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Hồ sơ Dự án & Nghiệp vụ
                  </h2>
                  <p className="text-sm font-bold text-[#1A56FA] dark:text-blue-400">
                    {selectedOrder.trackingNumber}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={selectedOrder.status} />
                  <button
                    type="button"
                    onClick={() => onDeleteOrder(selectedOrder.id)}
                    aria-label={`Xóa dự án ${selectedOrder.trackingNumber}`}
                    className="rounded-lg p-1.5 text-[#EF4444] transition hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="my-4 border-t border-[#E2E8F0] dark:border-[#2E3E55]" />

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                    Đơn vị chủ trì & Mục tiêu
                  </p>
                  <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    {selectedOrder.senderName} • {selectedOrder.senderAddress}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                    Nhân sự phụ trách & Chi nhánh
                  </p>
                  <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    {selectedOrder.recipientName} • {selectedOrder.recipientAddress}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Phê duyệt & Cập nhật trạng thái trong Database
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_STATUSES.map((st) => {
                    const active = selectedOrder.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => onUpdateOrderStatus(selectedOrder.id, st)}
                        aria-pressed={active}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                          active
                            ? 'bg-[#1A56FA] text-white'
                            : 'bg-[#F1F5F9] text-[#475569] hover:bg-slate-200 dark:bg-[#1E293B] dark:text-[#94A3B8]'
                        }`}
                      >
                        {ORDER_STATUS_META[st].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#F8FAFC] p-3 text-xs dark:bg-[#1E293B]">
                <div>
                  <p className="text-[#64748B] dark:text-[#94A3B8]">Nhóm nghiệp vụ</p>
                  <p className="mt-0.5 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {selectedOrder.serviceType}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B] dark:text-[#94A3B8]">Định mức</p>
                  <p className="mt-0.5 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {Math.round(selectedOrder.weightKg)} ngày công
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B] dark:text-[#94A3B8]">Ngân sách</p>
                  <p className="mt-0.5 font-bold text-[#1A56FA] dark:text-blue-400">
                    {formatVnd(
                      selectedOrder.codVnd > 0 ? selectedOrder.codVnd : selectedOrder.feeVnd
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onTrackOrderClick(selectedOrder.trackingNumber);
                  onJumpToTracking();
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A56FA] py-2.5 text-xs font-bold text-white transition hover:bg-[#1447C6]"
              >
                <Briefcase className="h-4 w-4" />
                <span>Giám sát chi nhánh & Tiến độ thực tế</span>
              </button>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
