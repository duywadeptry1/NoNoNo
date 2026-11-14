import { useEffect, useState } from 'react';
import { Bell, Send, X } from 'lucide-react';
import { APP_BRANCHES } from '../data/seedData';
import type {
  MockAccount,
  NotificationAudience,
  NotificationPriority,
} from '../types/business';

interface SendNotificationModalProps {
  isOpen: boolean;
  accounts: MockAccount[];
  defaultBranch: string;
  onClose: () => void;
  onSend: (params: {
    title: string;
    message: string;
    priority: NotificationPriority;
    audience: NotificationAudience;
    targetBranch?: string;
    targetAccountId?: string;
  }) => void;
}

const PRIORITY_OPTIONS: { value: NotificationPriority; label: string }[] = [
  { value: 'NORMAL', label: 'Thường' },
  { value: 'IMPORTANT', label: 'Quan trọng' },
  { value: 'URGENT', label: 'Khẩn cấp' },
];

const AUDIENCE_OPTIONS: { value: NotificationAudience; label: string }[] = [
  { value: 'ALL_STAFF', label: 'Toàn công ty' },
  { value: 'SUBORDINATES', label: 'Tất cả cấp dưới' },
  { value: 'BRANCH', label: 'Theo chi nhánh' },
  { value: 'INDIVIDUAL', label: 'Cá nhân cụ thể' },
];

const QUICK_TEMPLATES = [
  {
    label: 'Họp giao ban',
    title: 'Họp giao ban nhanh toàn bộ phận lúc 14:00',
    message: 'Các trưởng nhóm và nhân viên chuẩn bị số liệu tiến độ trong ngày để rà soát nhanh.',
    priority: 'IMPORTANT' as NotificationPriority,
  },
  {
    label: 'Nhắc chấm công',
    title: 'Nhắc xác nhận chấm công GPS đầu ca',
    message: 'Nhân sự có mặt tại điểm làm việc vui lòng bấm Chấm công GPS trên app trước 08:30.',
    priority: 'NORMAL' as NotificationPriority,
  },
  {
    label: 'Đẩy tiến độ khẩn',
    title: 'Ưu tiên hoàn tất các đầu việc đang triển khai trong hôm nay',
    message: 'Cập nhật ngay trạng thái hoàn tất trên ứng dụng khi bàn giao xong tại hiện trường.',
    priority: 'URGENT' as NotificationPriority,
  },
];

export function SendNotificationModal({
  isOpen,
  accounts,
  defaultBranch,
  onClose,
  onSend,
}: SendNotificationModalProps) {
  const subordinates = accounts.filter((a) => a.role === 'SUBORDINATE');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<NotificationPriority>('IMPORTANT');
  const [audience, setAudience] = useState<NotificationAudience>('SUBORDINATES');
  const [targetBranch, setTargetBranch] = useState<string>(defaultBranch || APP_BRANCHES[0]);
  const [targetAccountId, setTargetAccountId] = useState<string>(subordinates[0]?.id ?? '');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTargetBranch(defaultBranch || APP_BRANCHES[0]);
      setTargetAccountId(subordinates[0]?.id ?? '');
      setErrorText(null);
    }
  }, [isOpen, defaultBranch]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorText('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.');
      return;
    }
    onSend({
      title: title.trim(),
      message: message.trim(),
      priority,
      audience,
      targetBranch: audience === 'BRANCH' ? targetBranch : undefined,
      targetAccountId: audience === 'INDIVIDUAL' ? targetAccountId : undefined,
    });
    setTitle('');
    setMessage('');
    setErrorText(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-notification-title"
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl sm:rounded-3xl sm:p-6 dark:bg-slate-900">
        <div
          aria-hidden="true"
          className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300 sm:hidden dark:bg-slate-700"
        />

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1A56FA] dark:bg-blue-950/70 dark:text-blue-400">
              <Bell className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="send-notification-title"
                className="text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                Gửi thông báo nhân viên
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tính năng dành riêng cho Cấp trên · Phát tức thời lên app
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại gửi thông báo"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick mobile-friendly templates */}
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            Mẫu nhanh cho điện thoại
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => {
                  setTitle(tpl.title);
                  setMessage(tpl.message);
                  setPriority(tpl.priority);
                  setErrorText(null);
                }}
                className="min-h-[38px] shrink-0 whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#1A56FA] hover:text-[#1A56FA] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Đối tượng nhận
            </span>
            <div className="grid grid-cols-2 gap-2">
              {AUDIENCE_OPTIONS.map((opt) => {
                const active = audience === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAudience(opt.value)}
                    aria-pressed={active}
                    className={`min-h-[44px] rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      active
                        ? 'bg-[#1A56FA] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {audience === 'BRANCH' && (
            <div>
              <label
                htmlFor="notif-target-branch"
                className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Chọn chi nhánh nhận thông báo
              </label>
              <select
                id="notif-target-branch"
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#1A56FA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {APP_BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {audience === 'INDIVIDUAL' && (
            <div>
              <label
                htmlFor="notif-target-account"
                className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Chọn nhân viên nhận chỉ đạo
              </label>
              <select
                id="notif-target-account"
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#1A56FA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.title} · {acc.branchName})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mức độ ưu tiên
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITY_OPTIONS.map((opt) => {
                const active = priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    aria-pressed={active}
                    className={`min-h-[44px] rounded-xl px-2 py-2 text-xs font-semibold transition ${
                      active
                        ? opt.value === 'URGENT'
                          ? 'bg-red-600 text-white'
                          : opt.value === 'IMPORTANT'
                            ? 'bg-amber-600 text-white'
                            : 'bg-[#1A56FA] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="notif-title-input"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Tiêu đề thông báo
            </label>
            <input
              id="notif-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Họp giao ban khẩn lúc 14:00"
              className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A56FA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="notif-message-input"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Nội dung chi tiết
            </label>
            <textarea
              id="notif-message-input"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập yêu cầu cụ thể tới nhân viên hoặc chi nhánh…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A56FA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {errorText && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-950/60 dark:text-red-300"
            >
              {errorText}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] flex-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              data-testid="btn-submit-notification"
              className="inline-flex min-h-[48px] flex-[2] items-center justify-center gap-1.5 rounded-xl bg-[#1A56FA] text-xs font-semibold text-white hover:bg-[#1447C6]"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>Gửi thông báo ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
