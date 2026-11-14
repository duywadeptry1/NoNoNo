package com.example.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.local.SeedData
import com.example.data.remote.OrderApi
import com.example.data.repository.BusinessRepository
import com.example.model.ActivityLogItem
import com.example.model.CompanyNotification
import com.example.model.MockAccount
import com.example.model.NotificationAudience
import com.example.model.NotificationPriority
import com.example.model.OrderStatus
import com.example.model.ShippingOrder
import com.example.model.StatCardData
import com.example.model.UserRole
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class GoShipUiState(
    val selectedTab: Int = 0,
    val isDarkMode: Boolean? = null,
    val searchQuery: String = "",
    val selectedOrderFilter: OrderStatus? = null,
    val isCreateOrderSheetVisible: Boolean = false,
    val isSendNotificationSheetVisible: Boolean = false,
    val isAccountSwitcherVisible: Boolean = false,
    val activeBranch: String = "Trụ sở Hà Nội",
    val isCheckedInToday: Boolean = false,
    val attendanceCount: Int = 124,
    val databaseMode: String = "memory-fallback",
    val isSyncing: Boolean = false,
    val accounts: List<MockAccount> = SeedData.mockAccounts,
    val currentAccount: MockAccount = SeedData.mockAccounts.first(),
    val notifications: List<CompanyNotification> = emptyList(),
    val orders: List<ShippingOrder> = emptyList(),
    val stats: List<StatCardData> = emptyList(),
    val activities: List<ActivityLogItem> = emptyList(),
    val snackbarMessage: String? = null
)

class GoShipViewModel(
    private val repository: BusinessRepository? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(GoShipUiState())
    val uiState: StateFlow<GoShipUiState> = _uiState.asStateFlow()

    init {
        loadInitialAndObserveDatabase()
    }

    private fun loadInitialAndObserveDatabase() {
        val initialOrders = SeedData.defaultOrders().map { it.toDomain() }
        val initialActivities = SeedData.defaultActivities()
        val initialNotifications = SeedData.defaultNotifications()

        _uiState.update {
            it.copy(
                orders = initialOrders,
                stats = computeStatsFromOrders(initialOrders),
                activities = initialActivities,
                notifications = initialNotifications
            )
        }

        if (repository != null) {
            viewModelScope.launch {
                val remote = repository.ensureSeeded()
                if (remote != null) {
                    _uiState.update { state ->
                        state.copy(
                            activities = if (remote.activities.isNotEmpty()) remote.activities else state.activities,
                            isCheckedInToday = remote.isCheckedInToday,
                            attendanceCount = remote.attendanceCount,
                            activeBranch = remote.activeBranch,
                            databaseMode = remote.databaseMode
                        )
                    }
                }
            }
            viewModelScope.launch {
                repository.ordersFlow.collectLatest { dbOrders ->
                    if (dbOrders.isNotEmpty()) {
                        _uiState.update { state ->
                            state.copy(
                                orders = dbOrders,
                                stats = computeStatsFromOrders(dbOrders)
                            )
                        }
                    }
                }
            }
        }
    }

    private fun computeStatsFromOrders(orders: List<ShippingOrder>): List<StatCardData> {
        val pending = orders.count { it.status == OrderStatus.PENDING }
        val active = orders.count { it.status == OrderStatus.DELIVERING }
        val completed = orders.count { it.status == OrderStatus.COMPLETED }
        val total = orders.size
        val rate = if (total > 0) ((completed * 100f) / total).toInt() else 100

        return listOf(
            StatCardData(
                title = "Chờ duyệt ngay",
                count = pending.toString(),
                subtitle = if (pending > 0) "Cần xử lý trên app" else "Đã duyệt hết",
                trend = if (pending > 0) "Cần duyệt" else "Gọn",
                isPositive = pending == 0
            ),
            StatCardData(
                title = "Đang triển khai",
                count = active.toString(),
                subtitle = "Nhân sự đang chạy",
                trend = "Trực tuyến",
                isPositive = true
            ),
            StatCardData(
                title = "Đã hoàn tất",
                count = completed.toString(),
                subtitle = "$rate% tổng $total việc",
                trend = "$rate%",
                isPositive = true
            )
        )
    }

    fun isSupervisor(account: MockAccount = _uiState.value.currentAccount): Boolean {
        return account.role == UserRole.SUPERVISOR
    }

    fun canApproveOrderStatus(
        currentStatus: OrderStatus,
        nextStatus: OrderStatus,
        account: MockAccount = _uiState.value.currentAccount
    ): Boolean {
        if (isSupervisor(account)) return true
        return currentStatus == OrderStatus.DELIVERING && nextStatus == OrderStatus.COMPLETED
    }

    fun canDeleteOrders(account: MockAccount = _uiState.value.currentAccount): Boolean {
        return isSupervisor(account)
    }

    fun canExportEnterpriseReport(account: MockAccount = _uiState.value.currentAccount): Boolean {
        return isSupervisor(account)
    }

    fun visibleNotifications(
        notifications: List<CompanyNotification> = _uiState.value.notifications,
        account: MockAccount = _uiState.value.currentAccount
    ): List<CompanyNotification> {
        return notifications.filter { n ->
            if (account.role == UserRole.SUPERVISOR) {
                if (n.senderId == account.id) return@filter true
                when (n.audience) {
                    NotificationAudience.SUPERVISORS,
                    NotificationAudience.ALL_STAFF,
                    NotificationAudience.SUBORDINATES -> true
                    NotificationAudience.BRANCH -> n.targetBranch == account.branchName
                    NotificationAudience.INDIVIDUAL -> n.targetAccountId == account.id
                }
            } else {
                when (n.audience) {
                    NotificationAudience.ALL_STAFF,
                    NotificationAudience.SUBORDINATES -> true
                    NotificationAudience.SUPERVISORS -> false
                    NotificationAudience.BRANCH -> n.targetBranch == account.branchName
                    NotificationAudience.INDIVIDUAL -> n.targetAccountId == account.id
                }
            }
        }.sortedByDescending { it.timestampMillis }
    }

    fun unreadNotificationsCount(
        notifications: List<CompanyNotification> = _uiState.value.notifications,
        account: MockAccount = _uiState.value.currentAccount
    ): Int {
        return visibleNotifications(notifications, account).count { n ->
            !n.readByAccountIds.contains(account.id)
        }
    }

    fun switchAccount(accountId: String) {
        val next = _uiState.value.accounts.find { it.id == accountId } ?: return
        _uiState.update {
            it.copy(
                currentAccount = next,
                activeBranch = next.branchName,
                isAccountSwitcherVisible = false,
                snackbarMessage = "Đã chuyển sang ${next.name} (${next.role.label})"
            )
        }
    }

    fun openAccountSwitcher() {
        _uiState.update { it.copy(isAccountSwitcherVisible = true) }
    }

    fun closeAccountSwitcher() {
        _uiState.update { it.copy(isAccountSwitcherVisible = false) }
    }

    fun openSendNotificationSheet() {
        if (!isSupervisor()) {
            _uiState.update {
                it.copy(snackbarMessage = "Chỉ tài khoản Cấp trên mới được gửi thông báo công ty")
            }
            return
        }
        _uiState.update { it.copy(isSendNotificationSheetVisible = true) }
    }

    fun closeSendNotificationSheet() {
        _uiState.update { it.copy(isSendNotificationSheetVisible = false) }
    }

    fun sendCompanyNotification(
        title: String,
        message: String,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        audience: NotificationAudience = NotificationAudience.ALL_STAFF,
        targetBranch: String? = null,
        targetAccountId: String? = null
    ) {
        val sender = _uiState.value.currentAccount
        if (!isSupervisor(sender)) {
            _uiState.update {
                it.copy(snackbarMessage = "Chỉ tài khoản Cấp trên mới được gửi thông báo công ty")
            }
            return
        }
        val cleanTitle = title.trim()
        val cleanMsg = message.trim()
        if (cleanTitle.isEmpty() || cleanMsg.isEmpty()) {
            _uiState.update { it.copy(snackbarMessage = "Vui lòng nhập tiêu đề và nội dung thông báo") }
            return
        }

        val now = System.currentTimeMillis()
        val targetAcc = targetAccountId?.let { id -> _uiState.value.accounts.find { it.id == id } }
        val notif = CompanyNotification(
            id = "NTF-${now % 100000}-${(10..89).random()}",
            title = cleanTitle,
            message = cleanMsg,
            priority = priority,
            audience = audience,
            targetBranch = if (audience == NotificationAudience.BRANCH) (targetBranch ?: _uiState.value.activeBranch) else null,
            targetAccountId = if (audience == NotificationAudience.INDIVIDUAL) targetAcc?.id else null,
            targetAccountName = if (audience == NotificationAudience.INDIVIDUAL) targetAcc?.name else null,
            senderId = sender.id,
            senderName = sender.name,
            senderRole = sender.role,
            createdAt = "Vừa xong · Hôm nay",
            timestampMillis = now,
            readByAccountIds = listOf(sender.id)
        )

        val act = ActivityLogItem(
            id = "ACT-$now",
            type = "NOTIFICATION_SENT",
            title = "${sender.name} gửi thông báo (${priority.label})",
            description = cleanTitle,
            timestamp = "Vừa xong",
            timestampMillis = now
        )

        _uiState.update {
            it.copy(
                notifications = listOf(notif) + it.notifications,
                activities = (listOf(act) + it.activities).take(20),
                isSendNotificationSheetVisible = false,
                snackbarMessage = "Đã phát thông báo tới ${audience.label}"
            )
        }
    }

    fun markNotificationRead(notificationId: String) {
        val accountId = _uiState.value.currentAccount.id
        _uiState.update { state ->
            state.copy(
                notifications = state.notifications.map { n ->
                    if (n.id == notificationId && !n.readByAccountIds.contains(accountId)) {
                        n.copy(readByAccountIds = n.readByAccountIds + accountId)
                    } else {
                        n
                    }
                }
            )
        }
    }

    fun markAllNotificationsRead() {
        val account = _uiState.value.currentAccount
        val visibleIds = visibleNotifications(_uiState.value.notifications, account).map { it.id }.toSet()
        _uiState.update { state ->
            state.copy(
                notifications = state.notifications.map { n ->
                    if (visibleIds.contains(n.id) && !n.readByAccountIds.contains(account.id)) {
                        n.copy(readByAccountIds = n.readByAccountIds + account.id)
                    } else {
                        n
                    }
                },
                snackbarMessage = "Đã đánh dấu đọc toàn bộ thông báo"
            )
        }
    }

    fun selectTab(index: Int) {
        _uiState.update { it.copy(selectedTab = index.coerceIn(0, 4)) }
    }

    fun selectBranch(branchName: String) {
        _uiState.update { it.copy(activeBranch = branchName) }
    }

    fun performGpsCheckIn(branchOverride: String? = null) {
        val current = _uiState.value
        val branch = branchOverride?.takeIf { it.isNotBlank() } ?: current.activeBranch
        val account = current.currentAccount

        if (current.isCheckedInToday && current.activeBranch == branch) {
            _uiState.update {
                it.copy(snackbarMessage = "${account.name} đã chấm công hôm nay tại $branch")
            }
            return
        }

        val now = System.currentTimeMillis()
        val newCount = current.attendanceCount + 1
        val newAct = ActivityLogItem(
            id = "ACT-$now",
            type = "CHECK_IN",
            title = "Chấm công GPS tại $branch",
            description = "${account.name} (${account.role.label}) vừa xác nhận trực ca trên thiết bị di động.",
            timestamp = "Vừa xong",
            timestampMillis = now
        )

        _uiState.update {
            it.copy(
                isCheckedInToday = true,
                attendanceCount = newCount,
                activeBranch = branch,
                activities = (listOf(newAct) + it.activities).take(20),
                snackbarMessage = "${account.name} đã chấm công GPS tại $branch ($newCount/130)"
            )
        }

        if (repository != null) {
            viewModelScope.launch {
                val res = repository.performCheckIn(branchName = branch)
                if (res != null) {
                    _uiState.update { state ->
                        state.copy(
                            isCheckedInToday = res.isCheckedInToday,
                            attendanceCount = res.attendanceCount,
                            activeBranch = res.activeBranch,
                            activities = if (res.activities.isNotEmpty()) res.activities else state.activities
                        )
                    }
                }
            }
        }
    }

    fun syncWithServer() {
        val repo = repository ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isSyncing = true) }
            val snapshot = repo.refreshFromServer()
            _uiState.update { state ->
                if (snapshot != null) {
                    state.copy(
                        isSyncing = false,
                        activities = if (snapshot.activities.isNotEmpty()) snapshot.activities else state.activities,
                        isCheckedInToday = snapshot.isCheckedInToday,
                        attendanceCount = snapshot.attendanceCount,
                        activeBranch = snapshot.activeBranch,
                        databaseMode = snapshot.databaseMode,
                        snackbarMessage = "Đã đồng bộ dữ liệu (${snapshot.databaseMode})"
                    )
                } else {
                    state.copy(
                        isSyncing = false,
                        snackbarMessage = "Không kết nối được backend, đang dùng bộ nhớ cục bộ"
                    )
                }
            }
        }
    }

    fun toggleDarkMode(enable: Boolean) {
        _uiState.update { it.copy(isDarkMode = enable) }
    }

    fun updateSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun filterOrders(status: OrderStatus?) {
        _uiState.update { it.copy(selectedOrderFilter = status) }
    }

    fun openCreateOrderSheet() {
        _uiState.update { it.copy(isCreateOrderSheetVisible = true) }
    }

    fun closeCreateOrderSheet() {
        _uiState.update { it.copy(isCreateOrderSheetVisible = false) }
    }

    fun createQuickTask(
        title: String,
        assignee: String,
        departmentCode: String,
        branchName: String,
        budgetVnd: Long = 0L
    ) {
        val cleanTitle = title.trim()
        val cleanAssignee = assignee.trim()
        if (cleanTitle.isEmpty() || cleanAssignee.isEmpty()) {
            _uiState.update { it.copy(snackbarMessage = "Vui lòng nhập nội dung việc và người phụ trách") }
            return
        }

        val now = System.currentTimeMillis()
        val trackingCode = "$departmentCode-${(10000..99999).random()}"
        val newOrder = ShippingOrder(
            id = "ORD-${now % 1000000}",
            trackingNumber = trackingCode,
            senderName = SeedData.fullDepartmentName(departmentCode),
            senderAddress = cleanTitle,
            recipientName = cleanAssignee,
            recipientAddress = "$branchName · Tạo qua app",
            status = OrderStatus.PENDING,
            serviceType = "Phê duyệt nhanh",
            feeVnd = 0L,
            codVnd = budgetVnd.coerceAtLeast(0L),
            createdAt = "Vừa tạo · Hôm nay",
            estimatedDelivery = "Hạn: Hôm nay",
            weightKg = 1.0f,
            timestampMillis = now
        )

        val act = ActivityLogItem(
            id = "ACT-$now",
            type = "ORDER_CREATED",
            title = "Tạo đầu việc $trackingCode",
            description = "$cleanTitle ($cleanAssignee)",
            timestamp = "Vừa xong",
            timestampMillis = now
        )

        val updatedOrders = listOf(newOrder) + _uiState.value.orders
        _uiState.update {
            it.copy(
                orders = updatedOrders,
                stats = computeStatsFromOrders(updatedOrders),
                activities = (listOf(act) + it.activities).take(20),
                isCreateOrderSheetVisible = false,
                snackbarMessage = "Đã lưu $trackingCode vào MongoDB"
            )
        }

        if (repository != null) {
            viewModelScope.launch {
                repository.insertOrder(newOrder)
            }
        }
    }

    fun advanceOrderStatus(order: ShippingOrder) {
        val next = when (order.status) {
            OrderStatus.PENDING -> OrderStatus.DELIVERING
            OrderStatus.DELIVERING -> OrderStatus.COMPLETED
            OrderStatus.CANCELLED -> OrderStatus.PENDING
            OrderStatus.COMPLETED -> if (isSupervisor()) OrderStatus.DELIVERING else return
        }
        updateOrderStatus(order.id, next)
    }

    fun updateOrderStatus(orderId: String, newStatus: OrderStatus) {
        val target = _uiState.value.orders.find { it.id == orderId } ?: return
        if (!canApproveOrderStatus(target.status, newStatus)) {
            _uiState.update {
                it.copy(snackbarMessage = "Cần tài khoản Cấp trên để duyệt hoặc tạm hoãn đầu việc này")
            }
            return
        }

        val updatedOrders = _uiState.value.orders.map {
            if (it.id == orderId) it.copy(status = newStatus) else it
        }
        val now = System.currentTimeMillis()
        val act = ActivityLogItem(
            id = "ACT-$now",
            type = "STATUS_UPDATED",
            title = "Cập nhật ${target.trackingNumber} → ${newStatus.label}",
            description = "${_uiState.value.currentAccount.name} cập nhật trạng thái trực tiếp trên ứng dụng.",
            timestamp = "Vừa xong",
            timestampMillis = now
        )

        _uiState.update {
            it.copy(
                orders = updatedOrders,
                stats = computeStatsFromOrders(updatedOrders),
                activities = (listOf(act) + it.activities).take(20),
                snackbarMessage = "${target.trackingNumber}: ${newStatus.label}"
            )
        }
        if (repository != null) {
            viewModelScope.launch {
                repository.updateOrderStatus(orderId, newStatus)
            }
        }
    }

    fun deleteOrder(orderId: String) {
        if (!canDeleteOrders()) {
            _uiState.update {
                it.copy(snackbarMessage = "Chỉ tài khoản Cấp trên mới được xóa đầu việc")
            }
            return
        }
        val updatedOrders = _uiState.value.orders.filterNot { it.id == orderId }
        _uiState.update {
            it.copy(
                orders = updatedOrders,
                stats = computeStatsFromOrders(updatedOrders),
                snackbarMessage = "Đã xóa đầu việc khỏi danh sách"
            )
        }
        if (repository != null) {
            viewModelScope.launch {
                repository.deleteOrder(orderId)
            }
        }
    }

    fun resetDatabaseToDefaults() {
        viewModelScope.launch {
            val remote = repository?.resetToDefaultSeed()
            if (remote != null) {
                _uiState.update {
                    it.copy(
                        orders = remote.orders,
                        stats = computeStatsFromOrders(remote.orders),
                        activities = remote.activities,
                        notifications = SeedData.defaultNotifications(),
                        isCheckedInToday = remote.isCheckedInToday,
                        attendanceCount = remote.attendanceCount,
                        activeBranch = remote.activeBranch,
                        databaseMode = remote.databaseMode,
                        snackbarMessage = "Đã khôi phục dữ liệu mẫu"
                    )
                }
            } else {
                val defaultOrders = SeedData.defaultOrders().map { it.toDomain() }
                val defaultActs = SeedData.defaultActivities()
                _uiState.update {
                    it.copy(
                        orders = defaultOrders,
                        stats = computeStatsFromOrders(defaultOrders),
                        activities = defaultActs,
                        notifications = SeedData.defaultNotifications(),
                        isCheckedInToday = false,
                        attendanceCount = 124,
                        snackbarMessage = "Đã khôi phục dữ liệu mẫu"
                    )
                }
            }
        }
    }

    fun generateDailyActivitiesCsvReport(
        reportDate: String = todayDateKey(),
        includeBom: Boolean = true
    ): String {
        val state = _uiState.value
        val pendingCount = state.orders.count { it.status == OrderStatus.PENDING }
        val activeCount = state.orders.count { it.status == OrderStatus.DELIVERING }
        val completedCount = state.orders.count { it.status == OrderStatus.COMPLETED }
        val sortedActivities = state.activities.sortedByDescending { it.timestampMillis }

        val summaryRows = listOf(
            listOf("BAO CAO TONG HOP HOAT DONG NGAY", "Business Manage"),
            listOf("Chi so", "Gia tri"),
            listOf("Ngay bao cao", reportDate),
            listOf("Chi nhanh hoat dong", state.activeBranch),
            listOf(
                "Trang thai cham cong GPS",
                if (state.isCheckedInToday) "Da cham cong (Hom nay)" else "Chua cham cong"
            ),
            listOf("Quan so hien dien", "${state.attendanceCount}/130"),
            listOf("Tong dau viec", state.orders.size.toString()),
            listOf("Cho duyet", pendingCount.toString()),
            listOf("Dang trien khai", activeCount.toString()),
            listOf("Da hoan tat", completedCount.toString()),
            listOf("Tong hoat dong ghi nhan", sortedActivities.size.toString())
        )

        val activityHeader = listOf("Ma hoat dong", "Loai hoat dong", "Thoi gian", "Tieu de", "Chi tiet")
        val activityRows = sortedActivities.map { item ->
            val typeLabel = when (item.type) {
                "CHECK_IN" -> "Chấm công GPS"
                "ORDER_CREATED" -> "Tạo đầu việc"
                "STATUS_UPDATED" -> "Cập nhật tiến độ"
                "NOTIFICATION_SENT" -> "Gửi thông báo"
                else -> "Hệ thống"
            }
            listOf(item.id, typeLabel, item.timestamp, item.title, item.description)
        }

        val lines = buildList {
            summaryRows.forEach { row -> add(row.joinToString(",") { escapeCsvCell(it) }) }
            add("")
            add(activityHeader.joinToString(",") { escapeCsvCell(it) })
            activityRows.forEach { row -> add(row.joinToString(",") { escapeCsvCell(it) }) }
        }
        val body = lines.joinToString("\r\n")
        return if (includeBom) "\uFEFF$body" else body
    }

    fun getDailyActivitiesReportFilename(reportDate: String = todayDateKey()): String {
        return "bao-cao-hoat-dong-$reportDate.csv"
    }

    fun clearSnackbar() {
        _uiState.update { it.copy(snackbarMessage = null) }
    }

    companion object {
        fun todayDateKey(timestampMillis: Long = System.currentTimeMillis()): String {
            return SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(timestampMillis))
        }

        fun escapeCsvCell(value: String?): String {
            val str = value ?: ""
            return if (str.any { it == ',' || it == '"' || it == '\r' || it == '\n' }) {
                "\"${str.replace("\"", "\"\"")}\""
            } else {
                str
            }
        }

        fun formatVnd(amount: Long): String {
            val format = NumberFormat.getInstance(Locale("vi", "VN"))
            return "${format.format(amount)} ₫"
        }

        fun provideFactory(context: Context): ViewModelProvider.Factory {
            return object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    val database = AppDatabase.getInstance(context)
                    val repository = BusinessRepository(database.businessDao(), OrderApi())
                    return GoShipViewModel(repository) as T
                }
            }
        }
    }
}
