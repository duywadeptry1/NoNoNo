import { useMemo, useState } from 'react';
import { Bell, Check, CheckCheck, Lock, Send } from 'lucide-react';
import type { CompanyNotification, MockAccount, NotificationPriority } from '../types/business';
import {
  canSendCompanyNotification,
  getNotificationAudienceLabel,
  getNotificationsForAccount,
  getUnreadNotificationsCount,
  isNotificationUnread,
} from '../utils/businessLogic';

interface NotificationsViewProps {
  notifications: CompanyNotification[];
  currentAccount: MockAccount;
  onOpenSendModal: () => void;
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead: () => void;
}

type FilterMode = 'ALL' | 'UNREAD' | 'URGENT';

const PRIORITY_META: Record<
  NotificationPriority,
  { label: string; colorClass: string }
> = {
  URGENT: {
    label: 'Khẩn cấp',
    colorClass: 'text-red-600 dark:text-red-400',
  },
  IMPORTANT: {
    label: 'Quan trọng',
    colorClass: 'text-amber-600 dark:text-amber-400',
  },
  NORMAL: {
    label: 'Thông báo chung',
    colorClass: 'text-slate-500 dark:text-slate-400',
  },
};

export function NotificationsView({
  notifications,
  currentAccount,
  onOpenSendModal,
  onMarkRead,
  onMarkAllRead,
}: NotificationsViewProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const canSend = canSendCompanyNotification(currentAccount);

  const visibleNotifications = useMemo(
    () => getNotificationsForAccount(notifications, currentAccount),
    [notifications, currentAccount]
  );

  const unreadCount = useMemo(
    () => getUnreadNotificationsCount(notifications, currentAccount),
    [notifications, currentAccount]
  );

  const filteredList = useMemo(() => {
    switch (filterMode) {
      case 'UNREAD':
        return visibleNotifications.filter((n) => isNotificationUnread(n, currentAccount.id));
      case 'URGENT':
        return visibleNotifications.filter((n) => n.priority === 'URGENT');
      default:
        return visibleNotifications;
    }
  }, [visibleNotifications, filterMode, currentAccount.id]);

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-5 pb-24 md:px-8 md:py-6 md:pb-10">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Thông báo công ty
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {canSend
              ? 'Phát thông báo & chỉ đạo trực tiếp cho nhân viên toàn hệ thống'
              : `Hộp thư chỉ đạo dành cho ${currentAccount.name} · ${currentAccount.branchName}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <CheckCheck className="h-4 w-4 text-[#1A56FA]" aria-hidden="true" />
              <span>Đọc tất cả ({unreadCount})</span>
            </button>
          )}

          {canSend && (
            <button
              type="button"
              onClick={onOpenSendModal}
              data-testid="btn-open-send-notification"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1A56FA] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1447C6] sm:flex-initial"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>Gửi thông báo</span>
            </button>
          )}
        </div>
      </header>

      {!canSend && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <Lock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span>
            Bạn đang dùng tài khoản Cấp dưới. Chức năng phát thông báo công ty chỉ mở cho Cấp trên.
          </span>
        </div>
      )}

      {/* Segmented mobile-friendly filters */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-900"
        role="group"
        aria-label="Lọc thông báo"
      >
        {(
          [
            { id: 'ALL', label: `Tất cả (${visibleNotifications.length})` },
            { id: 'UNREAD', label: `Chưa đọc (${unreadCount})` },
            {
              id: 'URGENT',
              label: `Khẩn cấp (${visibleNotifications.filter((n) => n.priority === 'URGENT').length})`,
            },
          ] as { id: FilterMode; label: string }[]
        ).map((tab) => {
          const active = filterMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              aria-pressed={active}
              className={`min-h-[40px] flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? 'bg-white text-[#1A56FA] shadow-xs dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      {filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Bell className="h-9 w-9 text-[#1A56FA]" aria-hidden="true" />
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">
            Không có thông báo phù hợp
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {filterMode === 'UNREAD'
              ? 'Bạn đã đọc toàn bộ thông báo công ty.'
              : 'Chưa có thông báo nào trong mục này.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="notifications-list">
          {filteredList.map((item) => {
            const unread = isNotificationUnread(item, currentAccount.id);
            const pMeta = PRIORITY_META[item.priority];
            const audienceText = getNotificationAudienceLabel(item);
            return (
              <article
                key={item.id}
                className={`rounded-2xl border p-4 transition-colors ${
                  unread
                    ? 'border-[#1A56FA]/60 bg-blue-50/40 dark:border-blue-500/60 dark:bg-blue-950/30'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`font-bold ${pMeta.colorClass}`}>{pMeta.label}</span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {audienceText}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                    <span className="font-mono tabular-nums text-slate-400">{item.createdAt}</span>
                  </div>

                  {unread && (
                    <span className="text-xs font-bold text-[#1A56FA] dark:text-blue-400">
                      Chưa đọc
                    </span>
                  )}
                </div>

                <h2 className="mt-1.5 text-sm font-bold leading-snug text-slate-900 dark:text-slate-100 sm:text-base">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                  {item.message}
                </p>

                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Từ <strong className="font-semibold text-slate-700 dark:text-slate-200">{item.senderName}</strong> (Cấp trên)
                  </span>

                  {unread ? (
                    <button
                      type="button"
                      onClick={() => onMarkRead(item.id)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1A56FA] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#1447C6]"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Đánh dấu đã đọc</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Đã xác nhận đọc</span>
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
