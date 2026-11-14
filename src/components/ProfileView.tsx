import { useState } from 'react';
import {
  Bell,
  Database,
  Globe,
  Headphones,
  Lock,
  Moon,
  RefreshCw,
  Smartphone,
} from 'lucide-react';

interface ProfileViewProps {
  ordersCount: number;
  isDark: boolean;
  onToggleDarkMode: (dark: boolean) => void;
  onOpenDbImportClick: () => void;
  onResetDbClick: () => void;
}

export function ProfileView({
  ordersCount,
  isDark,
  onToggleDarkMode,
  onOpenDbImportClick,
  onResetDbClick,
}: ProfileViewProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-5 pb-24 md:px-8 md:pb-8">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2E3E55] dark:bg-[#151E2E]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A56FA] text-lg font-extrabold text-white">
              AN
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Alex Nguyễn
              </h1>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                CEO & Giám đốc Điều hành • The Business Manage
              </p>
              <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#1A56FA] dark:bg-blue-950/70 dark:text-blue-300">
                {ordersCount} hồ sơ dự án đang đồng bộ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2 text-xs dark:bg-[#1E293B]">
            <Smartphone className="h-4 w-4 text-[#10B981]" />
            <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Cross-Platform Ready (Web + Android Studio)
            </span>
          </div>
        </div>
      </header>

      {/* Database & Appearance Controls */}
      <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white dark:border-[#2E3E55] dark:bg-[#151E2E]">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] p-4 dark:border-[#2E3E55]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF2FF] text-[#1A56FA] dark:bg-blue-950/70 dark:text-blue-400">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Chế độ Giao diện Tối (Dark Mode)
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Chuyển đổi giữa nền Sáng và nền Tối chuyên sâu
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Bật tắt chế độ giao diện tối"
            onClick={() => onToggleDarkMode(!isDark)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
              isDark ? 'bg-[#1A56FA]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenDbImportClick}
          className="flex w-full items-center justify-between border-b border-[#E2E8F0] p-4 text-left transition hover:bg-slate-50 dark:border-[#2E3E55] dark:hover:bg-[#1E293B]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF2FF] text-[#1A56FA] dark:bg-blue-950/70 dark:text-blue-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Quản lý Database (Import JSON / CSV)
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Nhập, trích xuất và đồng bộ dữ liệu với API Backend
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#1A56FA] dark:text-blue-400">Mở trình quản lý</span>
        </button>

        <button
          type="button"
          onClick={onResetDbClick}
          className="flex w-full items-center justify-between p-4 text-left transition hover:bg-slate-50 dark:hover:bg-[#1E293B]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#FF9500] dark:bg-amber-950/70 dark:text-amber-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Khôi phục Dữ liệu mẫu Doanh nghiệp
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Đặt lại 5 dự án & biểu đồ doanh thu mặc định ban đầu
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#FF9500]">Khôi phục</span>
        </button>
      </section>

      {/* Notifications & Security */}
      <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white dark:border-[#2E3E55] dark:bg-[#151E2E]">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] p-4 dark:border-[#2E3E55]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#FF9500] dark:bg-amber-950/70 dark:text-amber-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Thông báo biến động dự án & quy trình
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Nhận cảnh báo tức thời khi trạng thái phê duyệt thay đổi
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            aria-label="Bật tắt thông báo biến động"
            onClick={() => setNotificationsEnabled((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
              notificationsEnabled ? 'bg-[#1A56FA]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#10B981] dark:bg-emerald-950/70 dark:text-emerald-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Bảo mật vân tay & Sinh trắc học
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Bảo vệ các giao dịch duyệt ngân sách và đối soát quỹ
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={biometricEnabled}
            aria-label="Bật tắt bảo mật sinh trắc học"
            onClick={() => setBiometricEnabled((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
              biometricEnabled ? 'bg-[#1A56FA]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                biometricEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Support info */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#2E3E55] dark:bg-[#151E2E]">
          <Globe className="h-5 w-5 text-[#1A56FA]" />
          <div>
            <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Ngôn ngữ hiển thị</p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Tiếng Việt (Mặc định)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#2E3E55] dark:bg-[#151E2E]">
          <Headphones className="h-5 w-5 text-[#1A56FA]" />
          <div>
            <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Hỗ trợ doanh nghiệp 24/7</p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Hotline 1900 6868 • Trực tuyến</p>
          </div>
        </div>
      </section>
    </div>
  );
}
