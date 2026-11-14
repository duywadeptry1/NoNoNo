import { useMemo } from 'react';
import { Award, PlusCircle, Search, Users } from 'lucide-react';
import type { BusinessService } from '../types/business';
import { filterServices, formatVnd } from '../utils/businessLogic';

interface ServicesViewProps {
  services: BusinessService[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectService: (service: BusinessService) => void;
}

export function ServicesView({
  services,
  searchQuery,
  onSearchChange,
  onSelectService,
}: ServicesViewProps) {
  const filtered = useMemo(
    () => filterServices(services, searchQuery),
    [services, searchQuery]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 pb-24 md:px-8 md:pb-8">
      <header>
        <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Danh bạ Nhân sự & Giải pháp Doanh nghiệp
        </h1>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          Chọn nhân sự chủ chốt hoặc gói giải pháp để khởi tạo dự án mới
        </p>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
        <label htmlFor="services-search-input" className="sr-only">
          Tìm kiếm nhân sự, phòng ban hoặc gói giải pháp
        </label>
        <input
          id="services-search-input"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm trưởng phòng, giải pháp ERP, POS hoặc KPI…"
          className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#1A56FA] focus:outline-none dark:border-[#2E3E55] dark:bg-[#151E2E] dark:text-[#F8FAFC]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-testid="services-grid">
        {filtered.map((service) => (
          <article
            key={service.id}
            className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:border-blue-300 dark:border-[#2E3E55] dark:bg-[#151E2E] dark:hover:border-blue-700"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF2FF] text-[#1A56FA] dark:bg-blue-950/70 dark:text-blue-400">
                  <Users className="h-5 w-5" />
                </div>
                {service.popularTag && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-[#D97706] dark:bg-amber-950/70 dark:text-amber-300">
                    <Award className="h-3 w-3" />
                    {service.popularTag}
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {service.name}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                {service.description}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4 dark:border-[#2E3E55]">
              <div>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  {service.deliveryTime}
                </p>
                <p className="text-sm font-extrabold text-[#1A56FA] dark:text-blue-400">
                  {formatVnd(service.basePriceVnd)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectService(service)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1A56FA] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#1447C6]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Tạo dự án</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
