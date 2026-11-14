import {
  Bell,
  Calendar,
  CloudDownload,
  Database,
  MapPin,
  Moon,
  Plus,
  Search,
  Sun,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import type { BusinessOrder, ScheduleDayItem, StatCardData } from '../types/business';
import { OrderCard } from './OrderCard';

interface HomeViewProps {
  orders: BusinessOrder[];
  stats: StatCardData[];
  weeklySchedule: ScheduleDayItem[];
  selectedScheduleDayIndex: number;
  attendanceCount: number;
  searchQuery: string;
  isDark: boolean;
  onSearchChange: (q: string) => void;
  onSelectScheduleDay: (index: number) => void;
  onTabSelect: (tab: number) => void;
  onCreateOrderClick: () => void;
  onOpenDbImportClick: () => void;
  onPerformCheckIn: () => void;
  onTrackOrderClick: (trackingNumber: string) => void;
  onToggleDarkMode: (dark: boolean) => void;
}

const STAT_ACCENTS = [
  'text-[#1A56FA] bg-[#EBF2FF] dark:bg-blue-950/60 dark:text-blue-400',
  'text-[#FF9500] bg-[#FFF7ED] dark:bg-amber-950/60 dark:text-amber-400',
  'text-[#10B981] bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
  'text-[#EF4444] bg-red-50 dark:bg-red-950/60 dark:text-red-400',
];

export function HomeView({
  orders,
  stats,
  weeklySchedule,
  selectedScheduleDayIndex,
  attendanceCount,
  searchQuery,
  isDark,
  onSearchChange,
  onSelectScheduleDay,
  onTabSelect,
  onCreateOrderClick,
  onOpenDbImportClick,
  onPerformCheckIn,
  onTrackOrderClick,
  onToggleDarkMode,
}: HomeViewProps) {
  const activeDeliveringCount = orders.filter(
    (o) => o.status === 'DELIVERING' || o.status === 'PENDING'
  ).length;
  const activeDay = weeklySchedule[selectedScheduleDayIndex] ?? weeklySchedule[0];
  const filteredTopOrders = searchQuery.trim()
    ? orders.filter(
        (o) =>
          o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.senderAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 pb-24 md:px-8 md:pb-8">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A56FA] text-base font-bold text-white">
            AN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Alex Nguyễn
              </h1>
              <span className="rounded-md bg-[#EBF2FF] px-2 py-0.5 text-[11px] font-bold text-[#1A56FA] dark:bg-blue-950/70 dark:text-blue-300">
                CEO • Quản trị
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              The Business Manage • {orders.length} dự án ({activeDeliveringCount} đang xử lý)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenDbImportClick}
            aria-label="Mở trình quản lý và nhập Database"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#1A56FA] transition hover:bg-blue-50 dark:border-[#2E3E55] dark:bg-[#151E2E] dark:text-blue-400 dark:hover:bg-[#1E293B]"
          >
            <Database className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onToggleDarkMode(!isDark)}
            aria-label={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#475569] transition hover:bg-slate-100 dark:border-[#2E3E55] dark:bg-[#151E2E] dark:text-amber-400 dark:hover:bg-[#1E293B]"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => onTabSelect(1)}
            aria-label="Xem thông báo dự án"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] transition hover:bg-slate-100 dark:border-[#2E3E55] dark:bg-[#151E2E] dark:text-[#F8FAFC] dark:hover:bg-[#1E293B]"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#EF4444]" />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
        <label htmlFor="home-search-input" className="sr-only">
          Tìm kiếm dự án, hợp đồng, phòng ban hoặc nhân sự
        </label>
        <input
          id="home-search-input"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm mã dự án, hợp đồng, phòng ban hoặc nhân sự…"
          className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#1A56FA] focus:outline-none dark:border-[#2E3E55] dark:bg-[#151E2E] dark:text-[#F8FAFC]"
        />
      </div>

      {/* 4 KPI Stat Cards */}
      <section aria-label="Chỉ số KPI doanh nghiệp" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((stat, idx) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#2E3E55] dark:bg-[#151E2E]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                {stat.title}
              </span>
              <span
                className={`inline-flex shrink-0 whitespace-nowrap items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                  STAT_ACCENTS[idx % STAT_ACCENTS.length]
                }`}
              >
                {stat.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stat.trend}
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              {stat.count}
            </p>
            <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">{stat.subtitle}</p>
          </div>
        ))}
      </section>

      {/* Weekly Schedule & Shift Attendance Strip */}
      <section
        aria-label="Lịch điều hành và giao ban tuần"
        className="rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#2E3E55] dark:bg-[#151E2E]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#1A56FA]" />
            <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Lịch điều hành & Giao ban tuần
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#1A56FA] dark:text-blue-400">
            Tháng 11, 2026
          </span>
        </div>

        <div className="mt-3.5 grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {weeklySchedule.map((day, idx) => {
            const isSelected = idx === selectedScheduleDayIndex;
            return (
              <button
                key={day.dayOfWeek}
                type="button"
                onClick={() => onSelectScheduleDay(idx)}
                aria-pressed={isSelected}
                aria-label={`Chọn lịch ngày ${day.dayOfWeek} ngày ${day.dayNumber}`}
                className={`flex flex-col items-center rounded-xl py-2.5 transition ${
                  isSelected
                    ? 'bg-[#1A56FA] text-white shadow-sm'
                    : 'bg-[#F8FAFC] text-[#0F172A] hover:bg-slate-100 dark:bg-[#1E293B] dark:text-[#F8FAFC] dark:hover:bg-slate-700'
                }`}
              >
                <span
                  className={`text-[11px] font-medium ${
                    isSelected ? 'text-blue-100' : 'text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  {day.dayOfWeek}
                </span>
                <span className="mt-1 text-sm font-bold">{day.dayNumber}</span>
              </button>
            );
          })}
        </div>

        {activeDay && (
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] p-3 dark:bg-[#1E293B]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1A56FA] dark:bg-blue-950 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {activeDay.meetingTitle}
                </p>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {activeDay.department} • {activeDay.timeSlot} • {activeDay.roomOrLocation}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                {attendanceCount}/130 có mặt
              </span>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-[#D97706] dark:bg-amber-950/70 dark:text-amber-300">
                {activeDay.statusBadge}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Quick Business Process Actions */}
      <section aria-label="Quy trình nghiệp vụ nhanh">
        <h2 className="mb-3 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Quy trình nghiệp vụ nhanh
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <button
            type="button"
            onClick={onCreateOrderClick}
            className="flex flex-col items-center gap-2 rounded-2xl border border-transparent bg-white p-3 transition hover:border-blue-200 dark:bg-[#151E2E] dark:hover:border-blue-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A56FA] text-white">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-center text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Tạo dự án mới
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenDbImportClick}
            className="flex flex-col items-center gap-2 rounded-2xl border border-transparent bg-white p-3 transition hover:border-blue-200 dark:bg-[#151E2E] dark:hover:border-blue-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1A56FA] dark:bg-[#1E293B] dark:text-blue-400">
              <CloudDownload className="h-6 w-6" />
            </div>
            <span className="text-center text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Nhập DB mới
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onPerformCheckIn();
              onTabSelect(2);
            }}
            className="flex flex-col items-center gap-2 rounded-2xl border border-transparent bg-white p-3 transition hover:border-blue-200 dark:bg-[#151E2E] dark:hover:border-blue-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1A56FA] dark:bg-[#1E293B] dark:text-blue-400">
              <MapPin className="h-6 w-6" />
            </div>
            <span className="text-center text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Chấm công GPS
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabSelect(4)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-transparent bg-white p-3 transition hover:border-blue-200 dark:bg-[#151E2E] dark:hover:border-blue-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1A56FA] dark:bg-[#1E293B] dark:text-blue-400">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="text-center text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Duyệt quỹ
            </span>
          </button>
        </div>
      </section>

      {/* Top 3 Priority Projects */}
      <section aria-label="Dự án và quy trình trọng tâm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Dự án & Quy trình trọng tâm
          </h2>
          <button
            type="button"
            onClick={() => onTabSelect(1)}
            className="text-xs font-bold text-[#1A56FA] hover:underline dark:text-blue-400"
          >
            Xem tất cả ({orders.length})
          </button>
        </div>

        <div className="space-y-3" data-testid="home-orders-list">
          {filteredTopOrders.slice(0, 3).map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onTrackClick={() => {
                onTrackOrderClick(order.trackingNumber);
                onTabSelect(2);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
