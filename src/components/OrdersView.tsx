import { useMemo, useState } from 'react';
import { Check, CheckSquare, Lock, Plus, Search, Trash2, X } from 'lucide-react';
import {
  ORDER_STATUS_META,
  type BusinessOrder,
  type MockAccount,
  type OrderStatus,
} from '../types/business';
import {
  canApproveOrderStatus,
  canDeleteOrders,
  filterOrders,
  formatVnd,
  getNextWorkflowAction,
  isSupervisorAccount,
} from '../utils/businessLogic';
import { OrderCard } from './OrderCard';
import { StatusBadge } from './StatusBadge';

interface OrdersViewProps {
  currentAccount: MockAccount;
  orders: BusinessOrder[];
  searchQuery: string;
  selectedFilter: OrderStatus | null;
  onSearchChange: (q: string) => void;
  onFilterSelect: (status: OrderStatus | null) => void;
  onCreateOrderClick: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
}

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'DELIVERING', 'COMPLETED', 'CANCELLED'];

export function OrdersView({
  currentAccount,
  orders,
  searchQuery,
  selectedFilter,
  onSearchChange,
  onFilterSelect,
  onCreateOrderClick,
  onUpdateOrderStatus,
  onDeleteOrder,
}: OrdersViewProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders[0]?.id ?? null
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const isSupervisor = isSupervisorAccount(currentAccount);
  const canDelete = canDeleteOrders(currentAccount);

  const filteredOrders = useMemo(
    () => filterOrders(orders, searchQuery, selectedFilter),
    [orders, searchQuery, selectedFilter]
  );

  const selectedOrder =
    filteredOrders.find((o) => o.id === selectedOrderId) ??
    filteredOrders[0] ??
    null;

  const renderDetailBody = (order: BusinessOrder) => {
    const nextAction = getNextWorkflowAction(order.status);
    const canAdvance = canApproveOrderStatus(currentAccount, order.status, nextAction.nextStatus);

    return (
      <>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-mono text-xs font-semibold text-[#1A56FA] dark:text-blue-400">
              {order.trackingNumber}
            </span>
            <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
              {order.senderAddress}
            </h2>
          </div>
          {canDelete && (
            <button
              type="button"
              onClick={() => {
                onDeleteOrder(order.id);
                setMobileDetailOpen(false);
              }}
              aria-label={`Xóa công việc ${order.trackingNumber}`}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={order.status} />
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {order.estimatedDelivery}
          </span>
        </div>

        <div className="my-4 border-t border-slate-100 dark:border-slate-800" />

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Bộ phận phụ trách</dt>
            <dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
              {order.senderName}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Người thực hiện & Địa điểm</dt>
            <dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
              {order.recipientName} · {order.recipientAddress}
            </dd>
          </div>
          {order.codVnd > 0 && (
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Ngân sách dự kiến</dt>
              <dd className="mt-0.5 font-mono font-bold tabular-nums text-[#1A56FA] dark:text-blue-400">
                {formatVnd(order.codVnd)}
              </dd>
            </div>
          )}
        </dl>

        {isSupervisor ? (
          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              Điều phối trạng thái (Quyền Cấp trên)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_STATUSES.map((st) => {
                const active = order.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.id, st)}
                    aria-pressed={active}
                    className={`min-h-[44px] rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      active
                        ? 'bg-[#1A56FA] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {ORDER_STATUS_META[st].label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Tài khoản Cấp dưới chỉ xác nhận hoàn tất việc đang triển khai; duyệt hoặc xóa do Cấp trên thực hiện.
            </span>
          </div>
        )}

        {canAdvance && (
          <button
            type="button"
            onClick={() => {
              onUpdateOrderStatus(order.id, nextAction.nextStatus);
              setMobileDetailOpen(false);
            }}
            className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            <span>{nextAction.label}</span>
          </button>
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 pb-24 md:px-8 md:py-6 md:pb-10">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Công việc & Phê duyệt ({orders.length})
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {isSupervisor
              ? 'Quyền Cấp trên: Duyệt nhanh đề xuất, điều phối và xóa đầu việc'
              : 'Quyền Cấp dưới: Gửi đề xuất mới và báo cáo hoàn tất việc đang chạy'}
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateOrderClick}
          className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1A56FA] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1447C6]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>{isSupervisor ? 'Thêm việc mới' : 'Gửi đề xuất'}</span>
        </button>
      </header>

      {/* Search & Horizontal Scrollable Segmented Status Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <label htmlFor="orders-search-input" className="sr-only">
            Tìm kiếm công việc theo mã, tiêu đề hoặc người phụ trách
          </label>
          <input
            id="orders-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm mã việc, nội dung hoặc người phụ trách…"
            className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A56FA] focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div
          className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-900"
          role="group"
          aria-label="Lọc theo trạng thái"
        >
          <button
            type="button"
            onClick={() => onFilterSelect(null)}
            aria-pressed={selectedFilter === null}
            className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              selectedFilter === null
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
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
                className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-white text-[#1A56FA] shadow-xs dark:bg-slate-800 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <CheckSquare className="h-9 w-9 text-[#1A56FA]" aria-hidden="true" />
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">
            Không có công việc phù hợp
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Thử đổi bộ lọc trạng thái hoặc tạo nhanh đầu việc mới
          </p>
          <div className="mt-4 flex gap-2">
            {(searchQuery || selectedFilter) && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  onFilterSelect(null);
                }}
                className="min-h-[44px] rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200"
              >
                Xóa bộ lọc
              </button>
            )}
            <button
              type="button"
              onClick={onCreateOrderClick}
              className="min-h-[44px] rounded-xl bg-[#1A56FA] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1447C6]"
            >
              {isSupervisor ? 'Thêm việc mới' : 'Gửi đề xuất'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7" data-testid="orders-list">
            {filteredOrders.map((order) => {
              const nextAction = getNextWorkflowAction(order.status);
              const allowed = canApproveOrderStatus(currentAccount, order.status, nextAction.nextStatus);
              return (
                <OrderCard
                  key={order.id}
                  order={order}
                  isSelected={selectedOrder?.id === order.id}
                  canQuickProgress={allowed}
                  restrictedLabel={
                    order.status === 'PENDING' ? 'Chờ Cấp trên duyệt' : 'Chỉ Cấp trên điều chỉnh'
                  }
                  onSelect={() => {
                    setSelectedOrderId(order.id);
                    setMobileDetailOpen(true);
                  }}
                  onQuickProgress={onUpdateOrderStatus}
                />
              );
            })}
          </div>

          {selectedOrder && (
            <aside
              aria-label="Chi tiết xử lý nhanh"
              className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-5 lg:col-span-5 lg:block dark:border-slate-800 dark:bg-slate-900"
            >
              {renderDetailBody(selectedOrder)}
            </aside>
          )}
        </div>
      )}

      {/* Mobile Detail Bottom Sheet */}
      {mobileDetailOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={`Chi tiết ${selectedOrder.trackingNumber}`}
        >
          <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl dark:bg-slate-900">
            <div className="mb-2 flex items-center justify-between">
              <div
                aria-hidden="true"
                className="mx-auto h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700"
              />
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                aria-label="Đóng chi tiết công việc"
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderDetailBody(selectedOrder)}
          </div>
        </div>
      )}
    </div>
  );
}
