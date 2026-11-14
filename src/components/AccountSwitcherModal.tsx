import { Check, ShieldCheck, User, X } from 'lucide-react';
import type { MockAccount } from '../types/business';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  accounts: MockAccount[];
  currentAccountId: string;
  onSelectAccount: (account: MockAccount) => void;
  onClose: () => void;
}

export function AccountSwitcherModal({
  isOpen,
  accounts,
  currentAccountId,
  onSelectAccount,
  onClose,
}: AccountSwitcherModalProps) {
  if (!isOpen) return null;

  const supervisors = accounts.filter((a) => a.role === 'SUPERVISOR');
  const subordinates = accounts.filter((a) => a.role === 'SUBORDINATE');

  const renderGroup = (title: string, description: string, list: MockAccount[]) => (
    <div className="space-y-2">
      <div>
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="space-y-2">
        {list.map((acc) => {
          const active = acc.id === currentAccountId;
          const isSup = acc.role === 'SUPERVISOR';
          return (
            <button
              key={acc.id}
              type="button"
              onClick={() => {
                onSelectAccount(acc);
                onClose();
              }}
              data-testid={`account-option-${acc.id}`}
              aria-pressed={active}
              className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition ${
                active
                  ? 'border-[#1A56FA] bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    isSup
                      ? 'bg-[#1A56FA] text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {isSup ? (
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <User className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                    {acc.name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {acc.title} · {acc.branchName}
                  </p>
                </div>
              </div>

              {active && (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#1A56FA] dark:text-blue-400">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Đang dùng</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-switcher-title"
    >
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl sm:rounded-3xl sm:p-6 dark:bg-slate-900">
        <div
          aria-hidden="true"
          className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300 sm:hidden dark:bg-slate-700"
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="account-switcher-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Chuyển tài khoản thử nghiệm
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Kiểm tra phân quyền Cấp trên (quản trị & thông báo) và Cấp dưới (nhân viên)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại chuyển tài khoản"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {renderGroup(
            'Tài khoản Cấp trên (Quản lý)',
            'Duyệt đề xuất, xóa đầu việc, gửi thông báo nhân viên và xuất báo cáo CSV',
            supervisors
          )}
          {renderGroup(
            'Tài khoản Cấp dưới (Nhân viên)',
            'Nhận thông báo chỉ đạo, chấm công GPS, gửi đề xuất và xác nhận hoàn tất việc',
            subordinates
          )}
        </div>
      </div>
    </div>
  );
}
