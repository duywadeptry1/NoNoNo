import {
  ArrowLeftRight,
  Bell,
  CheckCircle2,
  Download,
  MapPin,
  Moon,
  Plus,
  Send,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import type {
  BusinessOrder,
  CheckInRecord,
  MockAccount,
  OrderStatus,
  StatCardData,
} from '../types/business';
import {
  canApproveOrderStatus,
  getNextWorkflowAction,
  isSupervisorAccount,
} from '../utils/businessLogic';
import { OrderCard } from './OrderCard';

interface HomeViewProps {
  currentAccount: MockAccount;
  orders: BusinessOrder[];
  stats: StatCardData[];
  activeBranch: string;
  isCheckedInToday: boolean;
  latestCheckIn: CheckInRecord | null;
  attendanceCount: number;
  unreadNotificationsCount: number;
  databaseMode: 'mongodb' | 'memory-fallback';
  isDark: boolean;
  onToggleDarkMode: (dark: boolean) => void;
  onOpenAccountSwitcher: () => void;
  onOpenSendNotification: () => void;
  onDownloadReport: () => void;
  onQuickCreateClick: () => void;
  onPerformCheckIn: () => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onOpenTasksWithFilter: (status: OrderStatus | null) => void;
  onJumpToNotifications: () => void;
  onJumpToCheckIn: () => void;
}

const STAT_TARGET_STATUS: Record<StatCardData['key'], OrderStatus> = {
  pending: 'PENDING',
  active: 'DELIVERING',
  completed: 'COMPLETED',
};

export function HomeView({
  currentAccount,
  orders,
  stats,
  activeBranch,
  isCheckedInToday,
  latestCheckIn,
  attendanceCount,
  unreadNotificationsCount,
  databaseMode,
  isDark,
  onToggleDarkMode,
  onOpenAccountSwitcher,
  onOpenSendNotification,
  onDownloadReport,
  onQuickCreateClick,
  onPerformCheckIn,
  onUpdateOrderStatus,
  onOpenTasksWithFilter,
  onJumpToNotifications,
  onJumpToCheckIn,
}: HomeViewProps) {
  const isSupervisor = isSupervisorAccount(currentAccount);
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const priorityOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'DELIVERING'
  );
  const displayQueue = priorityOrders.length > 0 ? priorityOrders : orders;

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 pb-24 md:px-8 md:py-6 md:pb-10">
      {/* Top Bar: User & Role Switcher — Context — Primary Action */}
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {currentAccount.name}
            </h1>
            <button
              type="button"
              onClick={onOpenAccountSwitcher}
              data-testid="btn-open-account-switcher"
              className="inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#1A56FA] transition hover:border-[#1A56FA] dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Đổi tài khoản</span>
            </button>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {isSupervisor ? 'Cấp trên' : 'Cấp dưới'} · {currentAccount.title} · {activeBranch} ·{' '}
            {databaseMode === 'mongodb' ? 'MongoDB' : 'Bộ nhớ đệm'}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={() => onToggleDarkMode(!isDark)}
            aria-label={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-amber-400 dark:hover:bg-slate-800"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={onQuickCreateClick}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1A56FA] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1447C6] sm:flex-initial"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{isSupervisor ? 'Giao việc nhanh' : 'Gửi đề xuất'}</span>
          </button>
        </div>
      </header>

      {/* Role-Specific Control Panel */}
      {isSupervisor ? (
        <section
          aria-label="Bảng điều phối dành riêng cho Cấp trên"
          data-testid="supervisor-exclusive-panel"
          className="rounded-2xl border border-[#1A56FA]/30 bg-blue-50/50 p-4 dark:border-blue-500/40 dark:bg-blue-950/30"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A56FA] dark:text-blue-400">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Chức năng riêng cho Cấp trên</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Phát thông báo toàn công ty, duyệt {pendingCount} đề xuất đang chờ và xuất báo cáo CSV doanh nghiệp
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
              <button
                type="button"
                onClick={onOpenSendNotification}
                data-testid="btn-supervisor-send-notif"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1A56FA] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#1447C6]"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Gửi thông báo</span>
              </button>
              <button
                type="button"
                onClick={onDownloadReport}
                data-testid="btn-supervisor-export-csv"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#1A56FA] hover:text-[#1A56FA] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Xuất CSV ngày</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section
          aria-label="Thông báo từ Cấp trên"
          data-testid="subordinate-inbox-banner"
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
              <Bell className="h-4 w-4 shrink-0 text-[#1A56FA]" aria-hidden="true" />
              <span>Hộp thư chỉ đạo nhân viên</span>
              <span aria-hidden="true" className="text-slate-400">
                ·
              </span>
              <span className="font-mono tabular-nums text-[#1A56FA] dark:text-blue-400">
                {unreadNotificationsCount} chưa đọc
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Xem chỉ đạo mới từ Cấp trên và xác nhận hoàn tất đầu việc được giao
            </p>
          </div>

          <button
            type="button"
            onClick={onJumpToNotifications}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1A56FA] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1447C6]"
          >
            <Bell className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Mở thông báo</span>
          </button>
        </section>
      )}

      {/* 3 Operational KPI Cards (Clickable to jump straight to filtered queue) */}
      <section aria-label="Tổng quan tác vụ trên app" className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {stats.map((stat) => (
          <button
            key={stat.key}
            type="button"
            onClick={() => onOpenTasksWithFilter(STAT_TARGET_STATUS[stat.key])}
            className="flex min-h-[76px] flex-col items-start rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#1A56FA] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500 sm:p-4"
          >
            <span className="line-clamp-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">
              {stat.title}
            </span>
            <span className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100 sm:mt-1.5 sm:text-3xl">
              {stat.count}
            </span>
            <span className="mt-1 hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              {stat.subtitle}
            </span>
          </button>
        ))}
      </section>

      {/* Primary Mobile Action: 1-Tap GPS Check-in Card */}
      <section
        aria-label="Chấm công nhanh tại chi nhánh"
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Điểm danh hiện trường · {attendanceCount}/130 nhân sự trực ca
          </p>
          <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
            {isCheckedInToday
              ? `Đã chấm công tại ${latestCheckIn?.branchName ?? activeBranch}`
              : `Chưa chấm công hôm nay · ${activeBranch}`}
          </h2>
          {latestCheckIn && (
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              {latestCheckIn.userName} · {latestCheckIn.checkedInAt}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={onPerformCheckIn}
            className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold text-white transition sm:flex-initial ${
              isCheckedInToday
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-[#1A56FA] hover:bg-[#1447C6]'
            }`}
          >
            {isCheckedInToday ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <MapPin className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{isCheckedInToday ? 'Đã chấm công' : 'Chấm công GPS'}</span>
          </button>

          <button
            type="button"
            onClick={onJumpToCheckIn}
            className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Nhật ký ca
          </button>
        </div>
      </section>

      {/* Quick Approval & Active Field Queue */}
      <section aria-label="Hàng đợi duyệt và xử lý nhanh">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isSupervisor ? 'Hàng đợi duyệt & Điều phối' : 'Công việc hiện trường'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isSupervisor
                ? 'Phê duyệt đề xuất 1 chạm và điều phối nhân sự trực ca'
                : 'Cập nhật hoàn tất việc đang chạy · Các đề xuất mới chờ Cấp trên duyệt'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenTasksWithFilter(null)}
            className="min-h-[44px] shrink-0 whitespace-nowrap px-2 text-xs font-semibold text-[#1A56FA] hover:underline dark:text-blue-400"
          >
            Tất cả ({orders.length})
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2" data-testid="home-orders-list">
          {displayQueue.slice(0, 4).map((order) => {
            const nextAction = getNextWorkflowAction(order.status);
            const allowed = canApproveOrderStatus(currentAccount, order.status, nextAction.nextStatus);
            return (
              <OrderCard
                key={order.id}
                order={order}
                canQuickProgress={allowed}
                restrictedLabel={
                  order.status === 'PENDING' ? 'Chờ Cấp trên duyệt' : 'Chỉ Cấp trên điều chỉnh'
                }
                onQuickProgress={onUpdateOrderStatus}
                onSelect={() => onOpenTasksWithFilter(order.status)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
