import { useState } from 'react';
import { CloudDownload, Lightbulb, TrendingUp } from 'lucide-react';
import type { DailyRevenue, PaymentMethodShare } from '../types/business';
import { formatVnd } from '../utils/businessLogic';

interface AnalyticsViewProps {
  dailyRevenues: DailyRevenue[];
  paymentShares: PaymentMethodShare[];
  onOpenDbImportClick: () => void;
}

const SHARE_COLORS = ['bg-[#1A56FA]', 'bg-[#FF9500]', 'bg-[#8B5CF6]'];

export function AnalyticsView({
  dailyRevenues,
  paymentShares,
  onOpenDbImportClick,
}: AnalyticsViewProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(4); // Default T6
  const maxRevenue = Math.max(...dailyRevenues.map((r) => r.amountVnd), 1);
  const selectedDay = dailyRevenues[selectedDayIndex] ?? dailyRevenues[0];

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 pb-24 md:px-8 md:pb-8">
      <header>
        <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Quản trị Tài chính & Ngân sách
        </h1>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          Theo dõi dòng tiền, doanh thu theo ngày và cơ cấu phân bổ ngân sách
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Column: Treasury Balance + Interactive Weekly Revenue Chart */}
        <div className="space-y-5 lg:col-span-7">
          <section className="wallet-gradient rounded-2xl p-6 text-white shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-white/85">
                Quỹ Ngân sách Doanh nghiệp khả dụng
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-[#6EE7B7]">
                <TrendingUp className="h-3.5 w-3.5" />
                +18.5%
              </span>
            </div>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">34,650,000 VND</p>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-black/20 p-3.5">
              <div>
                <p className="text-[11px] text-white/75">Chi phí vận hành tháng</p>
                <p className="mt-0.5 text-sm font-bold">15,590,000 ₫</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-white/75">Doanh thu hợp đồng tuần</p>
                <p className="mt-0.5 text-sm font-bold text-[#6EE7B7]">19,060,000 ₫</p>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={onOpenDbImportClick}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-[#0F2B66] transition hover:bg-blue-50"
              >
                <CloudDownload className="h-4 w-4" />
                <span>Đồng bộ / Nhập Sổ quỹ DB</span>
              </button>
            </div>
          </section>

          {/* Interactive Weekly Revenue Bar Chart */}
          <section
            aria-label="Biểu đồ doanh thu 7 ngày"
            className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2E3E55] dark:bg-[#151E2E]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Biểu đồ Doanh thu 7 ngày gần nhất
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Chọn từng cột ngày để xem chi tiết giao dịch
                </p>
              </div>
              {selectedDay && (
                <div className="rounded-xl bg-[#EBF2FF] px-3 py-1.5 text-right dark:bg-blue-950/70">
                  <p className="text-[11px] font-bold text-[#1A56FA] dark:text-blue-300">
                    {selectedDay.dayLabel} • {selectedDay.orderCount} giao dịch
                  </p>
                  <p className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                    {formatVnd(selectedDay.amountVnd)}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 grid h-48 grid-cols-7 items-end gap-2.5 sm:gap-4">
              {dailyRevenues.map((rev, idx) => {
                const heightPct = Math.max(16, Math.round((rev.amountVnd / maxRevenue) * 100));
                const isSelected = idx === selectedDayIndex;
                return (
                  <button
                    key={rev.dayLabel}
                    type="button"
                    onClick={() => setSelectedDayIndex(idx)}
                    aria-pressed={isSelected}
                    aria-label={`Doanh thu ngày ${rev.dayLabel}: ${formatVnd(rev.amountVnd)}`}
                    className="flex h-full flex-col items-center justify-end gap-2 focus:outline-none"
                  >
                    <div className="flex w-full flex-1 items-end justify-center">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[38px] rounded-t-xl ${
                          isSelected
                            ? 'bg-[#1A56FA] shadow-md'
                            : rev.isPeak
                              ? 'bg-[#FF9500] hover:bg-[#D97706]'
                              : 'bg-blue-200 hover:bg-blue-300 dark:bg-slate-700 dark:hover:bg-slate-600'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs ${
                        isSelected
                          ? 'font-bold text-[#1A56FA] dark:text-blue-400'
                          : 'font-medium text-[#64748B] dark:text-[#94A3B8]'
                      }`}
                    >
                      {rev.dayLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Payment Share Breakdown + Financial Tips */}
        <div className="space-y-5 lg:col-span-5">
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2E3E55] dark:bg-[#151E2E]">
            <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Cơ cấu Phân bổ Ngân sách & Dòng tiền
            </h2>
            <div className="mt-4 space-y-4">
              {paymentShares.map((share, idx) => (
                <div key={share.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {share.name}
                    </span>
                    <span className="font-bold text-[#1A56FA] dark:text-blue-400">
                      {share.percentage}% • {formatVnd(share.totalVnd)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, share.percentage))}%` }}
                      className={`h-full rounded-full ${SHARE_COLORS[idx % SHARE_COLORS.length]}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="promo-gradient rounded-2xl border border-amber-200/70 p-5 dark:border-amber-900/50">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF9500] text-white">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Gợi ý Kiểm toán & Tối ưu Chi phí
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                  Quỹ R&D đang sử dụng hiệu quả 20% ngân sách. Doanh thu ngày Thứ 6 đạt đỉnh tuần — khuyến nghị chốt đối soát hợp đồng B2B trước 17:00 để tối ưu dòng tiền.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
