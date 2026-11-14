import {
  Bell,
  CheckSquare,
  Home,
  MapPin,
  Settings,
} from 'lucide-react';

export interface NavItem {
  index: number;
  label: string;
  icon: typeof Home;
}

export const NAV_ITEMS: NavItem[] = [
  { index: 0, label: 'Tổng quan', icon: Home },
  { index: 1, label: 'Công việc', icon: CheckSquare },
  { index: 2, label: 'Thông báo', icon: Bell },
  { index: 3, label: 'Chấm công', icon: MapPin },
  { index: 4, label: 'Cài đặt', icon: Settings },
];

interface NavigationShellProps {
  selectedTab: number;
  pendingCount: number;
  unreadNotificationsCount: number;
  onSelectTab: (index: number) => void;
}

export function DesktopNavigationRail({
  selectedTab,
  pendingCount,
  unreadNotificationsCount,
  onSelectTab,
}: NavigationShellProps) {
  return (
    <aside
      aria-label="Điều hướng chính"
      className="hidden w-24 shrink-0 flex-col items-center border-r border-slate-200 bg-white py-5 md:flex dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-6 flex flex-col items-center gap-1.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A56FA] text-sm font-bold text-white">
          BM
        </div>
        <span className="text-[11px] font-bold tracking-tight text-[#1A56FA] dark:text-blue-400">
          Ops App
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
              className={`relative flex min-h-[44px] w-full flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-center transition ${
                active
                  ? 'bg-blue-50 text-[#1A56FA] dark:bg-blue-950/70 dark:text-blue-400'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className={`whitespace-nowrap text-[11px] ${active ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
              {item.index === 1 && pendingCount > 0 && (
                <span className="font-mono text-[10px] font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {pendingCount} chờ
                </span>
              )}
              {item.index === 2 && unreadNotificationsCount > 0 && (
                <span className="font-mono text-[10px] font-semibold tabular-nums text-[#1A56FA] dark:text-blue-400">
                  {unreadNotificationsCount} mới
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileBottomNav({
  selectedTab,
  pendingCount,
  unreadNotificationsCount,
  onSelectTab,
}: NavigationShellProps) {
  return (
    <nav
      aria-label="Điều hướng di động"
      className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 items-center border-t border-slate-200 bg-white/95 px-1 backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-900/95"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = selectedTab === item.index;
        const badgeCount =
          item.index === 1 ? pendingCount : item.index === 2 ? unreadNotificationsCount : 0;

        return (
          <button
            key={item.index}
            type="button"
            onClick={() => onSelectTab(item.index)}
            aria-current={active ? 'page' : undefined}
            className={`relative flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 transition ${
              active
                ? 'text-[#1A56FA] dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {badgeCount > 0 && (
                <span
                  aria-label={`${badgeCount} mục mới`}
                  className="absolute -right-2.5 -top-1 min-w-[16px] rounded-full bg-[#1A56FA] px-1 text-center font-mono text-[9px] font-bold leading-4 tabular-nums text-white"
                >
                  {badgeCount}
                </span>
              )}
            </div>
            <span className={`max-w-full truncate whitespace-nowrap text-[10px] tracking-tight ${active ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
