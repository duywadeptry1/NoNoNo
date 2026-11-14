import {
  ArrowLeftRight,
  Database,
  Download,
  Moon,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import type { MockAccount } from '../types/business';
import {
  canExportEnterpriseReport,
  canSendCompanyNotification,
  isSupervisorAccount,
} from '../utils/businessLogic';

interface SettingsViewProps {
  currentAccount: MockAccount;
  accounts: MockAccount[];
  ordersCount: number;
  databaseMode: 'mongodb' | 'memory-fallback';
  isDark: boolean;
  isSyncing: boolean;
  onSelectAccount: (account: MockAccount) => void;
  onOpenAccountSwitcher: () => void;
  onOpenSendNotification: () => void;
  onToggleDarkMode: (dark: boolean) => void;
  onSyncNow: () => void;
  onDownloadReport: () => void;
  onResetWorkspace: () => void;
}

export function SettingsView({
  currentAccount,
  accounts,
  ordersCount,
  databaseMode,
  isDark,
  isSyncing,
  onSelectAccount,
  onOpenAccountSwitcher,
  onOpenSendNotification,
  onToggleDarkMode,
  onSyncNow,
  onDownloadReport,
  onResetWorkspace,
}: SettingsViewProps) {
  const isSupervisor = isSupervisorAccount(currentAccount);
  const canNotify = canSendCompanyNotification(currentAccount);
  const canExport = canExportEnterpriseReport(currentAccount);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-5 pb-24 md:px-8 md:py-6 md:pb-10">
      <header className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Cài đặt & Phân quyền tài khoản
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Chuyển đổi giữa tài khoản Cấp trên và Cấp dưới để kiểm tra tính năng riêng biệt
        </p>
      </header>

      {/* Active Account Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isSupervisor
                  ? 'bg-[#1A56FA] text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {isSupervisor ? (
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              ) : (
                <User className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {currentAccount.name} · {currentAccount.title}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {isSupervisor ? 'Quyền Cấp trên' : 'Quyền Cấp dưới'} · {currentAccount.department} ·{' '}
                {currentAccount.branchName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAccountSwitcher}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-[#1A56FA] transition hover:border-[#1A56FA] dark:border-slate-700 dark:text-blue-400"
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            <span>Mở bảng tài khoản</span>
          </button>
        </div>

        {/* 1-tap Mock Account Strip optimized for mobile */}
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            Chuyển nhanh tài khoản giả lập (Cấp trên / Cấp dưới)
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {accounts.map((acc) => {
              const selected = acc.id === currentAccount.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => onSelectAccount(acc)}
                  aria-pressed={selected}
                  className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-left text-xs transition ${
                    selected
                      ? 'border-[#1A56FA] bg-blue-50/70 font-bold text-[#1A56FA] dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'border-slate-200 bg-slate-50 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300'
                  }`}
                >
                  {acc.name} ({acc.role === 'SUPERVISOR' ? 'Cấp trên' : 'Cấp dưới'})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {canNotify && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <Send className="h-5 w-5 text-[#1A56FA]" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Gửi thông báo nhân viên (Cấp trên)
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Phát thông báo toàn công ty, theo chi nhánh hoặc cá nhân nhân viên
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSendNotification}
              className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1A56FA] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1447C6]"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Soạn thông báo</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5 text-[#1A56FA]" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Giao diện Tối (Dark Mode)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Giảm chói mắt khi sử dụng ngoài hiện trường hoặc buổi tối
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Bật tắt giao diện tối"
            onClick={() => onToggleDarkMode(!isDark)}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
              isDark ? 'bg-[#1A56FA]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-[#1A56FA]" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Cơ sở dữ liệu MongoDB ({ordersCount} đầu việc)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {databaseMode === 'mongodb'
                  ? 'Đã kết nối Mongoose MongoDB trực tiếp'
                  : 'Đang dùng chế độ dự phòng bộ nhớ (cấu hình MONGODB_URI trong .env để lưu MongoDB Atlas/Local)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSyncNow}
            disabled={isSyncing}
            className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1A56FA] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1447C6] disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isSyncing ? 'Đang đồng bộ…' : 'Đồng bộ lại'}</span>
          </button>
        </div>

        {canExport && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Báo cáo hoạt động ngày (CSV)
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Xuất tổng hợp đầu việc, chấm công GPS và nhật ký thao tác (quyền Cấp trên)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onDownloadReport}
              className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#1A56FA] hover:text-[#1A56FA] dark:border-slate-800 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tải CSV</span>
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <RotateCcw className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Khôi phục dữ liệu mẫu ban đầu
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đặt lại 5 đầu việc, thông báo và nhật ký ca trên Database
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onResetWorkspace}
            className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Khôi phục mẫu
          </button>
        </div>
      </section>
    </div>
  );
}
