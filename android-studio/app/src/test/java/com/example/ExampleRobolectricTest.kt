package com.example

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.data.local.AppDatabase
import com.example.data.repository.BusinessRepository
import com.example.model.OrderStatus
import com.example.viewmodel.GoShipViewModel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExampleRobolectricTest {

    private lateinit var database: AppDatabase
    private lateinit var repository: BusinessRepository

    @Before
    fun setUp() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        database = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        repository = BusinessRepository(database.businessDao())
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun `read string from context`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("Business Manage", appName)
    }

    @Test
    fun `test Room cache seeding status update and delete`() = runBlocking {
        repository.ensureSeeded()
        val initialOrders = repository.ordersFlow.first()
        assertEquals(5, initialOrders.size)

        repository.updateOrderStatus("ORD-001", OrderStatus.COMPLETED)
        val updatedOrder = repository.ordersFlow.first().find { it.id == "ORD-001" }
        assertNotNull(updatedOrder)
        assertEquals(OrderStatus.COMPLETED, updatedOrder?.status)

        repository.deleteOrder("ORD-005")
        val remaining = repository.ordersFlow.first()
        assertEquals(4, remaining.size)
    }

    @Test
    fun `test streamlined quick task creation status progression and GPS check-in`() {
        val viewModel = GoShipViewModel()
        val initialCount = viewModel.uiState.value.orders.size
        assertFalse(viewModel.uiState.value.isCheckedInToday)

        // Create quick task
        viewModel.createQuickTask(
            title = "Duyệt vật tư điểm bán Q3",
            assignee = "Trần Thu Trang",
            departmentCode = "OPS",
            branchName = "Trụ sở Hà Nội",
            budgetVnd = 5_000_000L
        )

        val afterCreate = viewModel.uiState.value
        assertEquals(initialCount + 1, afterCreate.orders.size)
        val created = afterCreate.orders.first()
        assertEquals(OrderStatus.PENDING, created.status)
        assertEquals("Trần Thu Trang", created.recipientName)

        // 1-tap progression: PENDING -> DELIVERING -> COMPLETED
        viewModel.advanceOrderStatus(created)
        assertEquals(OrderStatus.DELIVERING, viewModel.uiState.value.orders.first().status)

        viewModel.advanceOrderStatus(viewModel.uiState.value.orders.first())
        assertEquals(OrderStatus.COMPLETED, viewModel.uiState.value.orders.first().status)

        // GPS check-in
        viewModel.performGpsCheckIn("Chi nhánh Đà Nẵng")
        assertTrue(viewModel.uiState.value.isCheckedInToday)
        assertEquals("Chi nhánh Đà Nẵng", viewModel.uiState.value.activeBranch)
        assertEquals(125, viewModel.uiState.value.attendanceCount)
    }

    @Test
    fun `test dark mode toggle`() {
        val viewModel = GoShipViewModel()
        viewModel.toggleDarkMode(true)
        assertEquals(true, viewModel.uiState.value.isDarkMode)

        viewModel.toggleDarkMode(false)
        assertEquals(false, viewModel.uiState.value.isDarkMode)
    }

    @Test
    fun `test daily activities csv report generation with RFC 4180 escaping`() {
        val viewModel = GoShipViewModel()
        viewModel.createQuickTask(
            title = "Kiểm tra, \"kho số 1\"",
            assignee = "Lê Minh",
            departmentCode = "OPS",
            branchName = "Chi nhánh Đà Nẵng"
        )
        viewModel.performGpsCheckIn("Chi nhánh Đà Nẵng")

        val csv = viewModel.generateDailyActivitiesCsvReport(reportDate = "2026-11-14")
        assertTrue(csv.startsWith("\uFEFF"))
        assertTrue(csv.contains("Ngay bao cao,2026-11-14"))
        assertTrue(csv.contains("Chi nhanh hoat dong,Chi nhánh Đà Nẵng"))
        assertTrue(csv.contains("Quan so hien dien,125/130"))
        assertTrue(csv.contains("\"Kiểm tra, \"\"kho số 1\"\" (Lê Minh)\""))
    }

    @Test
    fun `test supervisor and subordinate account switching and permission guards`() {
        val viewModel = GoShipViewModel()
        assertEquals(com.example.model.UserRole.SUPERVISOR, viewModel.uiState.value.currentAccount.role)
        assertTrue(viewModel.isSupervisor())
        assertTrue(viewModel.canDeleteOrders())
        assertTrue(viewModel.canExportEnterpriseReport())
        assertTrue(viewModel.canApproveOrderStatus(OrderStatus.PENDING, OrderStatus.DELIVERING))

        // Switch to Subordinate (Phạm Thu Thảo - ACC-SUB-01)
        viewModel.switchAccount("ACC-SUB-01")
        assertEquals(com.example.model.UserRole.SUBORDINATE, viewModel.uiState.value.currentAccount.role)
        assertFalse(viewModel.isSupervisor())
        assertFalse(viewModel.canDeleteOrders())
        assertFalse(viewModel.canExportEnterpriseReport())
        assertFalse(viewModel.canApproveOrderStatus(OrderStatus.PENDING, OrderStatus.DELIVERING))
        assertTrue(viewModel.canApproveOrderStatus(OrderStatus.DELIVERING, OrderStatus.COMPLETED))

        // Subordinate cannot send company notifications
        val beforeNotifCount = viewModel.uiState.value.notifications.size
        viewModel.sendCompanyNotification(
            title = "Thử gửi trái phép",
            message = "Không được phép",
            priority = com.example.model.NotificationPriority.URGENT,
            audience = com.example.model.NotificationAudience.ALL_STAFF
        )
        assertEquals(beforeNotifCount, viewModel.uiState.value.notifications.size)
    }

    @Test
    fun `test supervisor broadcasts company notification and subordinate reads it`() {
        val viewModel = GoShipViewModel()
        viewModel.switchAccount("ACC-SUP-01")

        viewModel.sendCompanyNotification(
            title = "Họp giao ban khẩn 15:00",
            message = "Tất cả nhân sự báo cáo tiến độ hiện trường.",
            priority = com.example.model.NotificationPriority.URGENT,
            audience = com.example.model.NotificationAudience.SUBORDINATES
        )

        // Switch to Phạm Thu Thảo (ACC-SUB-01)
        viewModel.switchAccount("ACC-SUB-01")
        val visibleForThao = viewModel.visibleNotifications()
        assertEquals("Họp giao ban khẩn 15:00", visibleForThao.first().title)
        val unreadBefore = viewModel.unreadNotificationsCount()
        assertEquals(3, unreadBefore) // NTF-001, NTF-002, + newly sent alert

        viewModel.markNotificationRead(visibleForThao.first().id)
        assertEquals(2, viewModel.unreadNotificationsCount())

        viewModel.markAllNotificationsRead()
        assertEquals(0, viewModel.unreadNotificationsCount())
    }
}
