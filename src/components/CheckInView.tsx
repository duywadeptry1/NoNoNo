import { Building2, CheckCircle2, Clock, Download, MapPin } from 'lucide-react';
import { APP_BRANCHES } from '../data/seedData';
import type { ActivityLogItem, CheckInRecord, MockAccount } from '../types/business';
import { canExportEnterpriseReport } from '../utils/businessLogic';

interface CheckInViewProps {
  currentAccount: MockAccount;
  activeBranch: string;
  isCheckedInToday: boolean;
  latestCheckIn: CheckInRecord | null;
  attendanceCount: number;
  activities: ActivityLogItem[];
  onSelectBranch: (branch: string) => void;
  onPerformCheckIn: (branchName: string) => void;
  onDownloadReport: () => void;
}

export function CheckInView({
  currentAccount,
  activeBranch,
  isCheckedInToday,
  latestCheckIn,
  attendanceCount,
  activities,
  onSelectBranch,
  onPerformCheckIn,
  onDownloadReport,
}: CheckInViewProps) {
  const canExport = canExportEnterpriseReport(currentAccount);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-5 pb-24 md:px-8 md:py-6 md:pb-10">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Chấm công GPS & Nhật ký ca
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Tài khoản hiện tại: {currentAccount.name} · Xác thực vị trí trực tiếp trên MongoDB
          </p>
        </div>

        <span
          className={`text-xs font-semibold ${
            isCheckedInToday
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {isCheckedInToday
            ? `Đã chấm công · ${latestCheckIn?.checkedInAt ?? 'Hôm nay'}`
            : `Chưa chấm công · ${attendanceCount}/130 trực ca`}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Branch Picker + 1-Tap GPS Check-in */}
        <section
          aria-label="Chọn chi nhánh và chấm công"
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Chọn điểm làm việc hôm nay
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Chọn chi nhánh bạn đang có mặt và bấm xác nhận GPS
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {APP_BRANCHES.map((branch) => {
              const selected = activeBranch === branch;
              return (
                <button
                  key={branch}
                  type="button"
                  onClick={() => onSelectBranch(branch)}
                  aria-pressed={selected}
                  className={`flex min-h-[48px] items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold transition ${
                    selected
                      ? 'border-[#1A56FA] bg-blue-50/70 text-[#1A56FA] dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300'
                  }`}
                >
                  <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{branch}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Nhân sự điểm danh</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {currentAccount.name}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Chi nhánh đang chọn</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{activeBranch}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Quân số hiện diện toàn hệ thống</span>
              <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {attendanceCount}/130
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onPerformCheckIn(activeBranch)}
            className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
              isCheckedInToday && latestCheckIn?.branchName === activeBranch
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-[#1A56FA] hover:bg-[#1447C6]'
            }`}
          >
            {isCheckedInToday && latestCheckIn?.branchName === activeBranch ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <MapPin className="h-4 w-4" aria-hidden="true" />
            )}
            <span>
              {isCheckedInToday && latestCheckIn?.branchName === activeBranch
                ? `Đã chấm công tại ${activeBranch}`
                : `Chấm công GPS tại ${activeBranch}`}
            </span>
          </button>
        </section>

        {/* Right: Real Activity Feed from MongoDB */}
        <section
          aria-label="Nhật ký hoạt động gần đây"
          className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Nhật ký thao tác trực tiếp
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Tự động ghi lại khi duyệt việc, gửi thông báo hoặc chấm công GPS
              </p>
            </div>

            {canExport && (
              <button
                type="button"
                onClick={onDownloadReport}
                data-testid="btn-download-daily-csv"
                className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#1A56FA] hover:text-[#1A56FA] dark:border-slate-800 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tải báo cáo CSV</span>
              </button>
            )}
          </div>

          <ol className="mt-4 divide-y divide-slate-100 dark:divide-slate-800" data-testid="activity-log-list">
            {activities.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs tabular-nums text-slate-400">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {item.timestamp}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
