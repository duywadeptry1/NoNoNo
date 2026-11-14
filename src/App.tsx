import { useEffect, useMemo, useState } from 'react';
import {
  getDefaultDriver,
  getDefaultOrders,
  getDefaultPaymentShares,
  getDefaultRevenues,
  getDefaultServices,
  getDefaultTrackingSteps,
  getDefaultWeeklySchedule,
  SAMPLE_IMPORT_JSON,
} from './data/seedData';
import type {
  BusinessService,
  OrderStatus,
  WorkspaceSnapshot,
} from './types/business';
import {
  buildNewOrder,
  computeStatsFromOrders,
  exportWorkspaceToJson,
  mergeOrdersUpsert,
  parseImportCsvPayload,
  parseImportJsonPayload,
} from './utils/businessLogic';
import {
  DesktopNavigationRail,
  MobileBottomNav,
} from './components/NavigationShell';
import { HomeView } from './components/HomeView';
import { OrdersView } from './components/OrdersView';
import { TrackingView } from './components/TrackingView';
import { ServicesView } from './components/ServicesView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfileView } from './components/ProfileView';
import { CreateOrderModal } from './components/CreateOrderModal';
import { DatabaseImportModal } from './components/DatabaseImportModal';

const STORAGE_KEY = 'business_manage_workspace_v1';
const THEME_STORAGE_KEY = 'business_manage_dark_mode';

function createFallbackWorkspace(): WorkspaceSnapshot {
  return {
    orders: getDefaultOrders(),
    services: getDefaultServices(),
    dailyRevenues: getDefaultRevenues(),
    paymentShares: getDefaultPaymentShares(),
    activeDriver: getDefaultDriver(),
    trackingSteps: getDefaultTrackingSteps(),
    weeklySchedule: getDefaultWeeklySchedule(),
    isCheckedInToday: false,
    attendanceCount: 124,
  };
}

export default function App() {
  const [workspace, setWorkspace] = useState<WorkspaceSnapshot>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached) as WorkspaceSnapshot;
      }
    } catch {
      // Ignore storage read failures
    }
    return createFallbackWorkspace();
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderFilter, setSelectedOrderFilter] = useState<OrderStatus | null>(null);
  const [selectedScheduleDayIndex, setSelectedScheduleDayIndex] = useState(4);
  const [trackingOrderId, setTrackingOrderId] = useState('PRJ-88492-ERP');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState<BusinessService | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbEditorPayload, setDbEditorPayload] = useState(SAMPLE_IMPORT_JSON);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Sync dark mode class on <html> and <body>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#0B111E';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#F8FAFC';
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, String(isDark));
    } catch {
      // Ignore
    }
  }, [isDark]);

  // Persist workspace locally as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      // Ignore
    }
  }, [workspace]);

  // Fetch initial workspace from Express backend
  useEffect(() => {
    let active = true;
    fetch('/api/workspace')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: WorkspaceSnapshot | null) => {
        if (active && data && Array.isArray(data.orders)) {
          setWorkspace(data);
          if (data.orders[0]?.trackingNumber) {
            setTrackingOrderId(data.orders[0].trackingNumber);
          }
        }
      })
      .catch(() => {
        // Fallback to localStorage / seed state silently
      });
    return () => {
      active = false;
    };
  }, []);

  // Auto-dismiss snackbar
  useEffect(() => {
    if (!snackbarMessage) return;
    const timer = setTimeout(() => setSnackbarMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [snackbarMessage]);

  const stats = useMemo(
    () => computeStatsFromOrders(workspace.orders),
    [workspace.orders]
  );

  const handleCreateOrder = async (params: {
    recipientName: string;
    recipientAddress: string;
    weightKg: number;
    departmentCode: string;
  }) => {
    const service = selectedServiceForOrder ?? workspace.services[0];
    const newOrder = buildNewOrder({
      ...params,
      service,
    });

    setWorkspace((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
    }));
    setTrackingOrderId(newOrder.trackingNumber);
    setIsCreateModalOpen(false);
    setSnackbarMessage(`Đã khởi tạo quy trình ${newOrder.trackingNumber} vào Database!`);

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch {
      // Local state already updated
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setWorkspace((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
    setSnackbarMessage('Đã cập nhật tiến độ quy trình trong Database!');

    try {
      await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusName: status }),
      });
    } catch {
      // Local state already updated
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      orders: prev.orders.filter((o) => o.id !== orderId),
    }));
    setSnackbarMessage('Đã xóa hạng mục khỏi Database');

    try {
      await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
      });
    } catch {
      // Local state already updated
    }
  };

  const handleGpsCheckIn = async () => {
    if (!workspace.isCheckedInToday) {
      setWorkspace((prev) => {
        const nextCount = prev.attendanceCount + 1;
        return {
          ...prev,
          isCheckedInToday: true,
          attendanceCount: nextCount,
          activeDriver: {
            ...prev.activeDriver,
            licensePlate: `HQ-HANOI-01 • ${nextCount}/130 Nhân sự có mặt`,
            etaMinutes: prev.activeDriver.etaMinutes + 1,
          },
        };
      });
      setSnackbarMessage('Đã chấm công GPS thành công tại Trụ sở Chính (0.1 km)!');
      try {
        await fetch('/api/checkin', { method: 'POST' });
      } catch {
        // Local state already updated
      }
    } else {
      setSnackbarMessage('Bạn đã hoàn tất chấm công GPS hôm nay.');
    }
  };

  const handleImportJson = async (payload: string) => {
    const parsed = parseImportJsonPayload(payload);
    if (parsed.summary.errorMessage) {
      setSnackbarMessage(parsed.summary.errorMessage);
      return;
    }

    setWorkspace((prev) => ({
      ...prev,
      orders: parsed.orders.length > 0 ? mergeOrdersUpsert(prev.orders, parsed.orders) : prev.orders,
      services: parsed.services.length > 0 ? parsed.services : prev.services,
      dailyRevenues: parsed.revenues.length > 0 ? parsed.revenues : prev.dailyRevenues,
      paymentShares: parsed.paymentShares.length > 0 ? parsed.paymentShares : prev.paymentShares,
    }));

    const totalImported =
      parsed.summary.ordersImported +
      parsed.summary.servicesImported +
      parsed.summary.revenuesImported +
      parsed.summary.paymentSharesImported;

    setIsDbModalOpen(false);
    setSnackbarMessage(`Đã nhập thành công ${totalImported} bản ghi vào Database!`);

    try {
      await fetch('/api/workspace/import-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
    } catch {
      // Local state already updated
    }
  };

  const handleImportCsv = async (payload: string) => {
    const parsed = parseImportCsvPayload(payload);
    if (parsed.summary.errorMessage) {
      setSnackbarMessage(parsed.summary.errorMessage);
      return;
    }

    setWorkspace((prev) => ({
      ...prev,
      orders: mergeOrdersUpsert(prev.orders, parsed.orders),
    }));
    setIsDbModalOpen(false);
    setSnackbarMessage(
      `Đã nhập ${parsed.summary.ordersImported} dự án/quy trình từ CSV vào Database!`
    );

    try {
      await fetch('/api/workspace/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
    } catch {
      // Local state already updated
    }
  };

  const handleExportCurrentDb = () => {
    const json = exportWorkspaceToJson(workspace.orders, workspace.dailyRevenues);
    setDbEditorPayload(json);
    setSnackbarMessage('Đã trích xuất dữ liệu hiện tại từ Database!');
  };

  const handleResetDatabase = async () => {
    const fresh = createFallbackWorkspace();
    setWorkspace(fresh);
    setIsDbModalOpen(false);
    setSnackbarMessage('Đã khôi phục dữ liệu mẫu Doanh nghiệp trong Database!');

    try {
      const res = await fetch('/api/workspace/reset', { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as WorkspaceSnapshot;
        setWorkspace(data);
      }
    } catch {
      // Local state already reset
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0B111E] dark:text-[#F8FAFC]">
      <DesktopNavigationRail selectedTab={selectedTab} onSelectTab={setSelectedTab} />

      <main className="min-w-0 flex-1 overflow-y-auto">
        {selectedTab === 0 && (
          <HomeView
            orders={workspace.orders}
            stats={stats}
            weeklySchedule={workspace.weeklySchedule}
            selectedScheduleDayIndex={selectedScheduleDayIndex}
            attendanceCount={workspace.attendanceCount}
            searchQuery={searchQuery}
            isDark={isDark}
            onSearchChange={setSearchQuery}
            onSelectScheduleDay={setSelectedScheduleDayIndex}
            onTabSelect={setSelectedTab}
            onCreateOrderClick={() => {
              setSelectedServiceForOrder(workspace.services[0] ?? null);
              setIsCreateModalOpen(true);
            }}
            onOpenDbImportClick={() => setIsDbModalOpen(true)}
            onPerformCheckIn={handleGpsCheckIn}
            onTrackOrderClick={setTrackingOrderId}
            onToggleDarkMode={setIsDark}
          />
        )}

        {selectedTab === 1 && (
          <OrdersView
            orders={workspace.orders}
            searchQuery={searchQuery}
            selectedFilter={selectedOrderFilter}
            onSearchChange={setSearchQuery}
            onFilterSelect={setSelectedOrderFilter}
            onCreateOrderClick={() => {
              setSelectedServiceForOrder(workspace.services[0] ?? null);
              setIsCreateModalOpen(true);
            }}
            onOpenDbImportClick={() => setIsDbModalOpen(true)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onTrackOrderClick={setTrackingOrderId}
            onJumpToTracking={() => setSelectedTab(2)}
          />
        )}

        {selectedTab === 2 && (
          <TrackingView
            trackingOrderId={trackingOrderId}
            activeDriver={workspace.activeDriver}
            trackingSteps={workspace.trackingSteps}
            isCheckedInToday={workspace.isCheckedInToday}
            attendanceCount={workspace.attendanceCount}
            onPerformCheckIn={handleGpsCheckIn}
          />
        )}

        {selectedTab === 3 && (
          <ServicesView
            services={workspace.services}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectService={(service) => {
              setSelectedServiceForOrder(service);
              setIsCreateModalOpen(true);
            }}
          />
        )}

        {selectedTab === 4 && (
          <AnalyticsView
            dailyRevenues={workspace.dailyRevenues}
            paymentShares={workspace.paymentShares}
            onOpenDbImportClick={() => setIsDbModalOpen(true)}
          />
        )}

        {selectedTab === 5 && (
          <ProfileView
            ordersCount={workspace.orders.length}
            isDark={isDark}
            onToggleDarkMode={setIsDark}
            onOpenDbImportClick={() => setIsDbModalOpen(true)}
            onResetDbClick={handleResetDatabase}
          />
        )}
      </main>

      <MobileBottomNav selectedTab={selectedTab} onSelectTab={setSelectedTab} />

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        services={workspace.services}
        selectedService={selectedServiceForOrder}
        onSelectService={setSelectedServiceForOrder}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateOrder}
      />

      <DatabaseImportModal
        isOpen={isDbModalOpen}
        ordersCount={workspace.orders.length}
        servicesCount={workspace.services.length}
        revenuesCount={workspace.dailyRevenues.length}
        payload={dbEditorPayload}
        onPayloadChange={setDbEditorPayload}
        onImportJson={handleImportJson}
        onImportCsv={handleImportCsv}
        onExportCurrentDb={handleExportCurrentDb}
        onResetDatabase={handleResetDatabase}
        onClose={() => setIsDbModalOpen(false)}
      />

      {snackbarMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white shadow-lg md:bottom-6 dark:bg-blue-600"
        >
          {snackbarMessage}
        </div>
      )}
    </div>
  );
}
