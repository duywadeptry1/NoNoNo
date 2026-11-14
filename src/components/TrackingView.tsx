import { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  MapPin,
  Navigation,
  Phone,
  Star,
} from 'lucide-react';
import type { BranchSupervisor, TrackingStep } from '../types/business';

interface TrackingViewProps {
  trackingOrderId: string;
  activeDriver: BranchSupervisor;
  trackingSteps: TrackingStep[];
  isCheckedInToday: boolean;
  attendanceCount: number;
  onPerformCheckIn: () => void;
}

export function TrackingView({
  trackingOrderId,
  activeDriver,
  trackingSteps,
  isCheckedInToday,
  attendanceCount,
  onPerformCheckIn,
}: TrackingViewProps) {
  const [isCalling, setIsCalling] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 pb-24 md:px-8 md:pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Chi nhánh & Chấm công GPS
          </h1>
          <p className="text-sm font-semibold text-[#1A56FA] dark:text-blue-400">
            Dự án trọng điểm: {trackingOrderId}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${
            isCheckedInToday
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
              : 'bg-blue-50 text-[#1A56FA] dark:bg-blue-950/70 dark:text-blue-300'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          {isCheckedInToday ? 'Đã chấm công hợp lệ' : `${attendanceCount}/130 nhân sự trực ca`}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          {/* Interactive Branch Map Overview */}
          <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 p-6 dark:border-[#2E3E55] dark:from-[#101B33] dark:via-[#151E2E] dark:to-[#182238]">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#1A56FA] shadow-xs dark:bg-[#1E293B] dark:text-blue-300">
                <Navigation className="h-3.5 w-3.5" />
                <span>GPS Trụ sở Chính Ba Đình • 21.0358° N, 105.8188° E</span>
              </div>
              <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                Bán kính {activeDriver.currentDistanceKm} km
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { name: 'Trụ sở Hà Nội', staff: `${attendanceCount}/130 trực`, status: 'Ổn định' },
                { name: 'Chi nhánh Đà Nẵng', staff: '42/45 trực', status: 'Đúng ca' },
                { name: 'Chi nhánh TP.HCM', staff: '78/82 trực', status: 'Cao điểm' },
              ].map((branch) => (
                <div
                  key={branch.name}
                  className="rounded-xl border border-[#E2E8F0] bg-white/95 p-3.5 dark:border-[#2E3E55] dark:bg-[#151E2E]/95"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    <Building2 className="h-4 w-4 text-[#1A56FA]" />
                    <span>{branch.name}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {branch.staff}
                  </p>
                  <span className="mt-2 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {branch.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Supervisor & GPS Check-in Card */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2E3E55] dark:bg-[#151E2E]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A56FA] text-sm font-bold text-white">
                  TM
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {activeDriver.name}
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {activeDriver.vehicleModel} • {activeDriver.licensePlate}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>
                      KPI Chi nhánh: {activeDriver.rating}/5.0 ({activeDriver.completedTrips} dự án hoàn tất)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onPerformCheckIn}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition ${
                  isCheckedInToday
                    ? 'bg-[#10B981] hover:bg-emerald-600'
                    : 'bg-[#1A56FA] hover:bg-[#1447C6]'
                }`}
              >
                {isCheckedInToday ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span>{isCheckedInToday ? 'Đã Chấm Công GPS' : 'Chấm công GPS'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCalling((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-xs font-bold text-[#0F172A] transition hover:bg-slate-50 dark:border-[#2E3E55] dark:text-[#F8FAFC] dark:hover:bg-[#1E293B]"
              >
                <Phone className="h-4 w-4" />
                <span>Liên hệ</span>
              </button>
            </div>

            {isCalling && (
              <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Đang kết nối tổng đài nội bộ tới {activeDriver.name} ({activeDriver.phone})…
              </div>
            )}
          </div>
        </div>

        {/* Daily Operational Timeline */}
        <section
          aria-label="Nhật ký quy trình vận hành trong ngày"
          className="rounded-2xl border border-[#E2E8F0] bg-white p-5 lg:col-span-5 dark:border-[#2E3E55] dark:bg-[#151E2E]"
        >
          <h2 className="mb-4 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Nhật ký Quy trình Vận hành trong ngày
          </h2>
          <ol className="space-y-4">
            {trackingSteps.map((step, index) => (
              <li key={step.title} className="relative flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      step.isDone
                        ? 'bg-[#10B981] text-white'
                        : step.isCurrent
                          ? 'bg-[#1A56FA] ring-4 ring-blue-100 dark:ring-blue-950'
                          : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    {step.isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {step.isCurrent && <span className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  {index < trackingSteps.length - 1 && (
                    <div
                      className={`mt-1 w-0.5 flex-1 ${
                        step.isDone
                          ? 'bg-emerald-400/60'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-sm ${
                        step.isCurrent
                          ? 'font-bold text-[#1A56FA] dark:text-blue-400'
                          : 'font-semibold text-[#0F172A] dark:text-[#F8FAFC]'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <span className="shrink-0 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {step.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
