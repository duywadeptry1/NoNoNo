import { useEffect, useMemo, useState } from 'react';
import {
  getDefaultActivities,
  getDefaultNotifications,
  getDefaultOrders,
  MOCK_ACCOUNTS,
} from './data/seedData';
import type {
  MockAccount,
  NotificationAudience,
  NotificationPriority,
  OrderStatus,
  WorkspaceSnapshot,
} from './types/business';
import {
  buildCompanyNotification,
  buildQuickTask,
  canApproveOrderStatus,
  canDeleteOrders,
  canExportEnterpriseReport,
  canSendCompanyNotification,
  computeOperationalStats,
  downloadCsvFile,
  formatTimeShort,
  generateDailyActivitiesCsvReport,
  getDailyActivitiesReportFilename,
  getNotificationAudienceLabel,
  getTodayDateKey,
  getUnreadNotificationsCount,
  isSupervisorAccount,
} from './utils/businessLogic';
import {
  DesktopNavigationRail,
  MobileBottomNav,
} from './components/NavigationShell';
import { HomeView } from './components/HomeView';
import { OrdersView } from './components/OrdersView';
import { NotificationsView } from './components/NotificationsView';
import { CheckInView } from './components/CheckInView';
import { SettingsView } from './components/SettingsView';
import { CreateTaskModal } from './components/CreateTaskModal';
import { AccountSwitcherModal } from './components/AccountSwitcherModal';
import { SendNotificationModal } from './components/SendNotificationModal';

const STORAGE_KEY = 'business_manage_ops_v3';
const ACCOUNT_STORAGE_KEY = 'business_manage_active_account_id';
const THEME_STORAGE_KEY = 'business_manage_dark_mode';

function createFallbackWorkspace(): WorkspaceSnapshot {
  const now = Date.now();
  return {
    orders: getDefaultOrders(now),
    activities: getDefaultActivities(now),
    notifications: getDefaultNotifications(now),
    accounts: MOCK_ACCOUNTS,
    latestCheckIn: null,
    isCheckedInToday: false,
    attendanceCount: 124,
    activeBranch: 'Trụ sở Hà Nội',
    databaseMode: 'memory-fallback',
  };
}

export default function App() {
  const [workspace, setWorkspace] = useState<WorkspaceSnapshot>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Partial<WorkspaceSnapshot>;
        if (Array.isArray(parsed.orders)) {
          const fallback = createFallbackWorkspace();
          return {
            ...fallback,
            ...parsed,
            notifications: Array.isArray(parsed.notifications)
              ? parsed.notifications
              : fallback.notifications,
            accounts: Array.isArray(parsed.accounts) ? parsed.accounts : MOCK_ACCOUNTS,
          };
        }
      }
    } catch {
      // Ignore storage read failures
    }
    return createFallbackWorkspace();
  });

  const [currentAccountId, setCurrentAccountId] = useState<string>(() => {
    try {
      return localStorage.getItem(ACCOUNT_STORAGE_KEY) || MOCK_ACCOUNTS[0].id;
    } catch {
      return MOCK_ACCOUNTS[0].id;
    }
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const [isSendNotifModalOpen, setIsSendNotifModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const accounts = workspace.accounts?.length ? workspace.accounts : MOCK_ACCOUNTS;
  const currentAccount = useMemo(
    () => accounts.find((a) => a.id === currentAccountId) ?? accounts[0],
    [accounts, currentAccountId]
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#020617';
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      // Ignore
    }
  }, [workspace]);

  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, currentAccount.id);
    } catch {
      // Ignore
    }
  }, [currentAccount.id]);

  const fetchWorkspaceFromServer = async (showFeedback = false) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/workspace');
      if (res.ok) {
        const data = (await res.json()) as WorkspaceSnapshot;
        if (data && Array.isArray(data.orders)) {
          setWorkspace({
            ...data,
            notifications: Array.isArray(data.notifications)
              ? data.notifications
              : getDefaultNotifications(),
            accounts: Array.isArray(data.accounts) ? data.accounts : MOCK_ACCOUNTS,
          });
          if (showFeedback) {
            setSnackbarMessage('Đã đồng bộ dữ liệu mới nhất từ máy chủ.');
          }
        }
      }
    } catch {
      if (showFeedback) {
        setSnackbarMessage('Không kết nối được máy chủ, đang giữ bộ nhớ đệm.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    void fetchWorkspaceFromServer(false);
  }, []);

  useEffect(() => {
    if (!snackbarMessage) return;
    const timer = setTimeout(() => setSnackbarMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [snackbarMessage]);

  const stats = useMemo(
    () => computeOperationalStats(workspace.orders),
    [workspace.orders]
  );

  const pendingCount = useMemo(
    () => workspace.orders.filter((o) => o.status === 'PENDING').length,
    [workspace.orders]
  );

  const unreadNotificationsCount = useMemo(
    () => getUnreadNotificationsCount(workspace.notifications, currentAccount),
    [workspace.notifications, currentAccount]
  );

  const handleSelectAccount = (account: MockAccount) => {
    setCurrentAccountId(account.id);
    setWorkspace((prev) => ({ ...prev, activeBranch: account.branchName }));
    const roleLabel = isSupervisorAccount(account) ? 'Cấp trên' : 'Cấp dưới';
    setSnackbarMessage(`Đã chuyển sang ${account.name} (${roleLabel}).`);
  };

  const handleCreateTask = async (params: {
    title: string;
    assignee: string;
    departmentCode: string;
    branchName: string;
    budgetVnd?: number;
  }) => {
    const now = Date.now();
    const newTask = buildQuickTask({ ...params, now });

    setWorkspace((prev) => ({
      ...prev,
      orders: [newTask, ...prev.orders],
      activities: [
        {
          id: `ACT-${now}`,
          type: 'ORDER_CREATED' as const,
          title: `Tạo đầu việc ${newTask.trackingNumber}`,
          description: `${newTask.senderAddress} (${newTask.recipientName})`,
          timestamp: formatTimeShort(now),
          timestampMillis: now,
        },
        ...prev.activities,
      ].slice(0, 20),
    }));
    setIsCreateModalOpen(false);
    setSnackbarMessage(`Đã lưu ${newTask.trackingNumber}.`);

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
    } catch {
      // Local state already updated
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const now = Date.now();
    const target = workspace.orders.find((o) => o.id === orderId);
    if (!target) return;

    if (!canApproveOrderStatus(currentAccount, target.status, status)) {
      setSnackbarMessage('Chỉ tài khoản Cấp trên mới có quyền phê duyệt hoặc điều phối trạng thái này.');
      return;
    }

    setWorkspace((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
      activities: [
        {
          id: `ACT-${now}`,
          type: 'STATUS_UPDATED' as const,
          title: `Cập nhật ${target.trackingNumber}`,
          description: `${currentAccount.name} đã chuyển trạng thái công việc.`,
          timestamp: formatTimeShort(now),
          timestampMillis: now,
        },
        ...prev.activities,
      ].slice(0, 20),
    }));
    setSnackbarMessage('Đã cập nhật trạng thái công việc.');

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
    if (!canDeleteOrders(currentAccount)) {
      setSnackbarMessage('Chỉ tài khoản Cấp trên mới được phép xóa đầu việc.');
      return;
    }

    setWorkspace((prev) => ({
      ...prev,
      orders: prev.orders.filter((o) => o.id !== orderId),
    }));
    setSnackbarMessage('Đã xóa đầu việc.');

    try {
      await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
      });
    } catch {
      // Local state already updated
    }
  };

  const handlePerformCheckIn = async (branchName = workspace.activeBranch) => {
    const now = Date.now();
    const record = {
      id: `CHK-${now}`,
      userName: currentAccount.name,
      branchName,
      coordinates: '21.0358° N, 105.8188° E',
      checkedInAt: `${formatTimeShort(now)} · Hôm nay`,
      dateKey: getTodayDateKey(now),
      timestampMillis: now,
    };

    setWorkspace((prev) => {
      const sameBranchAlready =
        prev.isCheckedInToday &&
        prev.latestCheckIn?.branchName === branchName &&
        prev.latestCheckIn?.userName === currentAccount.name;
      if (sameBranchAlready) return prev;
      return {
        ...prev,
        isCheckedInToday: true,
        activeBranch: branchName,
        latestCheckIn: record,
        attendanceCount: prev.isCheckedInToday ? prev.attendanceCount : prev.attendanceCount + 1,
        activities: [
          {
            id: `ACT-${now}-CHK`,
            type: 'CHECK_IN' as const,
            title: `Chấm công GPS tại ${branchName}`,
            description: `${currentAccount.name} đã điểm danh trực ca.`,
            timestamp: formatTimeShort(now),
            timestampMillis: now,
          },
          ...prev.activities,
        ].slice(0, 20),
      };
    });
    setSnackbarMessage(`${currentAccount.name} đã chấm công GPS tại ${branchName}.`);

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchName, userName: currentAccount.name }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspace((prev) => ({
          ...prev,
          isCheckedInToday: Boolean(data.isCheckedInToday),
          attendanceCount: Number(data.attendanceCount ?? prev.attendanceCount),
          latestCheckIn: data.latestCheckIn ?? prev.latestCheckIn,
          activeBranch: data.activeBranch ?? branchName,
          activities: Array.isArray(data.activities) ? data.activities : prev.activities,
        }));
      }
    } catch {
      // Local state already updated
    }
  };

  const handleSendNotification = async (params: {
    title: string;
    message: string;
    priority: NotificationPriority;
    audience: NotificationAudience;
    targetBranch?: string;
    targetAccountId?: string;
  }) => {
    if (!canSendCompanyNotification(currentAccount)) {
      setSnackbarMessage('Chỉ tài khoản Cấp trên mới có quyền gửi thông báo công ty.');
      return;
    }

    const now = Date.now();
    const optimistic = buildCompanyNotification({
      ...params,
      sender: currentAccount,
      accounts,
      now,
    });
    const audienceLabel = getNotificationAudienceLabel(optimistic);

    setWorkspace((prev) => ({
      ...prev,
      notifications: [optimistic, ...prev.notifications],
      activities: [
        {
          id: `ACT-${now}-NTF`,
          type: 'NOTIFICATION_SENT' as const,
          title: `Thông báo: ${optimistic.title}`,
          description: `${currentAccount.name} gửi tới ${audienceLabel}.`,
          timestamp: formatTimeShort(now),
          timestampMillis: now,
        },
        ...prev.activities,
      ].slice(0, 20),
    }));
    setIsSendNotifModalOpen(false);
    setSnackbarMessage(`Đã gửi thông báo tới ${audienceLabel}.`);

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          senderId: currentAccount.id,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setWorkspace((prev) => ({
          ...prev,
          notifications: [
            saved,
            ...prev.notifications.filter((n) => n.id !== optimistic.id && n.id !== saved.id),
          ],
        }));
      }
    } catch {
      // Optimistic notification stays in local state
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notificationId && !n.readByAccountIds.includes(currentAccount.id)
          ? { ...n, readByAccountIds: [...n.readByAccountIds, currentAccount.id] }
          : n
      ),
    }));

    try {
      await fetch(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: currentAccount.id }),
      });
    } catch {
      // Local state already updated
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.readByAccountIds.includes(currentAccount.id)
          ? n
          : { ...n, readByAccountIds: [...n.readByAccountIds, currentAccount.id] }
      ),
    }));
    setSnackbarMessage('Đã đánh dấu đọc toàn bộ thông báo.');

    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: currentAccount.id }),
      });
    } catch {
      // Local state already updated
    }
  };

  const handleResetWorkspace = async () => {
    const fresh = createFallbackWorkspace();
    setWorkspace(fresh);
    setSnackbarMessage('Đã khôi phục dữ liệu mẫu.');
    try {
      const res = await fetch('/api/workspace/reset', { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as WorkspaceSnapshot;
        setWorkspace(data);
      }
    } catch {
      // Local fallback already applied
    }
  };

  const handleDownloadDailyReport = () => {
    if (!canExportEnterpriseReport(currentAccount)) {
      setSnackbarMessage('Chỉ tài khoản Cấp trên mới có quyền xuất báo cáo CSV doanh nghiệp.');
      return;
    }
    const reportDate = getTodayDateKey();
    const csv = generateDailyActivitiesCsvReport({
      activities: workspace.activities,
      orders: workspace.orders,
      activeBranch: workspace.activeBranch,
      attendanceCount: workspace.attendanceCount,
      isCheckedInToday: workspace.isCheckedInToday,
      latestCheckIn: workspace.latestCheckIn,
      reportDate,
    });
    const filename = getDailyActivitiesReportFilename(reportDate);
    downloadCsvFile(filename, csv);
    setSnackbarMessage(`Đã tải báo cáo hoạt động ngày (${filename}).`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <DesktopNavigationRail
        selectedTab={selectedTab}
        pendingCount={pendingCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onSelectTab={setSelectedTab}
      />

      <main className="min-w-0 flex-1 overflow-y-auto">
        {selectedTab === 0 && (
          <HomeView
            currentAccount={currentAccount}
            orders={workspace.orders}
            stats={stats}
            activeBranch={workspace.activeBranch}
            isCheckedInToday={workspace.isCheckedInToday}
            latestCheckIn={workspace.latestCheckIn}
            attendanceCount={workspace.attendanceCount}
            unreadNotificationsCount={unreadNotificationsCount}
            databaseMode={workspace.databaseMode}
            isDark={isDark}
            onToggleDarkMode={setIsDark}
            onOpenAccountSwitcher={() => setIsAccountSwitcherOpen(true)}
            onOpenSendNotification={() => setIsSendNotifModalOpen(true)}
            onDownloadReport={handleDownloadDailyReport}
            onQuickCreateClick={() => setIsCreateModalOpen(true)}
            onPerformCheckIn={() => void handlePerformCheckIn(workspace.activeBranch)}
            onUpdateOrderStatus={(id, st) => void handleUpdateOrderStatus(id, st)}
            onOpenTasksWithFilter={(filter) => {
              setSelectedOrderFilter(filter);
              setSelectedTab(1);
            }}
            onJumpToNotifications={() => setSelectedTab(2)}
            onJumpToCheckIn={() => setSelectedTab(3)}
          />
        )}

        {selectedTab === 1 && (
          <OrdersView
            currentAccount={currentAccount}
            orders={workspace.orders}
            searchQuery={searchQuery}
            selectedFilter={selectedOrderFilter}
            onSearchChange={setSearchQuery}
            onFilterSelect={setSelectedOrderFilter}
            onCreateOrderClick={() => setIsCreateModalOpen(true)}
            onUpdateOrderStatus={(id, st) => void handleUpdateOrderStatus(id, st)}
            onDeleteOrder={(id) => void handleDeleteOrder(id)}
          />
        )}

        {selectedTab === 2 && (
          <NotificationsView
            notifications={workspace.notifications}
            currentAccount={currentAccount}
            onOpenSendModal={() => setIsSendNotifModalOpen(true)}
            onMarkRead={(id) => void handleMarkNotificationRead(id)}
            onMarkAllRead={() => void handleMarkAllNotificationsRead()}
          />
        )}

        {selectedTab === 3 && (
          <CheckInView
            currentAccount={currentAccount}
            activeBranch={workspace.activeBranch}
            isCheckedInToday={workspace.isCheckedInToday}
            latestCheckIn={workspace.latestCheckIn}
            attendanceCount={workspace.attendanceCount}
            activities={workspace.activities}
            onSelectBranch={(branch) =>
              setWorkspace((prev) => ({ ...prev, activeBranch: branch }))
            }
            onPerformCheckIn={(branch) => void handlePerformCheckIn(branch)}
            onDownloadReport={handleDownloadDailyReport}
          />
        )}

        {selectedTab === 4 && (
          <SettingsView
            currentAccount={currentAccount}
            accounts={accounts}
            ordersCount={workspace.orders.length}
            databaseMode={workspace.databaseMode}
            isDark={isDark}
            isSyncing={isSyncing}
            onSelectAccount={handleSelectAccount}
            onOpenAccountSwitcher={() => setIsAccountSwitcherOpen(true)}
            onOpenSendNotification={() => setIsSendNotifModalOpen(true)}
            onToggleDarkMode={setIsDark}
            onSyncNow={() => void fetchWorkspaceFromServer(true)}
            onDownloadReport={handleDownloadDailyReport}
            onResetWorkspace={() => void handleResetWorkspace()}
          />
        )}
      </main>

      <MobileBottomNav
        selectedTab={selectedTab}
        pendingCount={pendingCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onSelectTab={setSelectedTab}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        defaultBranch={workspace.activeBranch}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={(params) => void handleCreateTask(params)}
      />

      <AccountSwitcherModal
        isOpen={isAccountSwitcherOpen}
        accounts={accounts}
        currentAccountId={currentAccount.id}
        onSelectAccount={handleSelectAccount}
        onClose={() => setIsAccountSwitcherOpen(false)}
      />

      <SendNotificationModal
        isOpen={isSendNotifModalOpen}
        accounts={accounts}
        defaultBranch={workspace.activeBranch}
        onClose={() => setIsSendNotifModalOpen(false)}
        onSend={(params) => void handleSendNotification(params)}
      />

      {snackbarMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-40 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-center text-xs font-semibold leading-snug text-white shadow-lg md:bottom-6 dark:bg-[#1A56FA]"
        >
          {snackbarMessage}
        </div>
      )}
    </div>
  );
}
