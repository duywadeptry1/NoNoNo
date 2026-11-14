import {
  BarChart3,
  Briefcase,
  Home,
  MapPin,
  User,
  Users,
} from 'lucide-react';

export interface NavItem {
  index: number;
  label: string;
  icon: typeof Home;
}

export const NAV_ITEMS: NavItem[] = [
  { index: 0, label: 'Tổng quan', icon: Home },
  { index: 1, label: 'Dự án', icon: Briefcase },
  { index: 2, label: 'Chi nhánh', icon: MapPin },
  { index: 3, label: 'Nhân sự', icon: Users },
  { index: 4, label: 'Tài chính', icon: BarChart3 },
  { index: 5, label: 'Hồ sơ', icon: User },
];

interface NavigationShellProps {
  selectedTab: number;
  onSelectTab: (index: number) => void;
}

export function DesktopNavigationRail({ selectedTab, onSelectTab }: NavigationShellProps) {
  return (
    <aside
      aria-label="Điều hướng chính"
      className="hidden w-24 shrink-0 flex-col items-center border-r border-[#E2E8F0] bg-white py-5 md:flex dark:border-[#2E3E55] dark:bg-[#151E2E]"
    >
      <div className="mb-6 flex flex-col items-center gap-1.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A56FA] text-sm font-extrabold text-white shadow-sm">
          BM
        </div>
        <span className="text-[11px] font-bold tracking-tight text-[#1A56FA] dark:text-blue-400">
          Business
        </span>
      </div>

      <nav className="flex w-full flex-col items-center gap-2 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = selectedTab === item.index;
          return (
            <button
              key={item.index}
              type="button"
              onClick={() => onSelectTab(item.index)}
              aria-current={active ? 'page' : undefined}
              className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-center transition ${
                active
                  ? 'bg-[#EBF2FF] text-[#1A56FA] dark:bg-blue-950/70 dark:text-blue-400'
                  : 'text-[#64748B] hover:bg-slate-100 dark:text-[#94A3B8] dark:hover:bg-[#1E293B]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className={`text-[11px] ${active ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileBottomNav({ selectedTab, onSelectTab }: NavigationShellProps) {
  return (
    <nav
      aria-label="Điều hướng di động"
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[#E2E8F0] bg-white/95 px-1 py-1.5 backdrop-blur md:hidden dark:border-[#2E3E55] dark:bg-[#151E2E]/95"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = selectedTab === item.index;
        return (
          <button
            key={item.index}
            type="button"
            onClick={() => onSelectTab(item.index)}
            aria-current={active ? 'page' : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition ${
              active
                ? 'text-[#1A56FA] dark:text-blue-400'
                : 'text-[#64748B] dark:text-[#94A3B8]'
            }`}
          >
            <div
              className={`rounded-full px-3 py-1 ${
                active ? 'bg-[#EBF2FF] dark:bg-blue-950/70' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span className={`truncate text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
