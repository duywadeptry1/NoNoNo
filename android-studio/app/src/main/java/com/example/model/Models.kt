package com.example.model

enum class OrderStatus(val label: String) {
    PENDING("Chờ duyệt"),
    DELIVERING("Đang chạy"),
    COMPLETED("Hoàn tất"),
    CANCELLED("Tạm hoãn")
}

enum class UserRole(val label: String) {
    SUPERVISOR("Cấp trên"),
    SUBORDINATE("Cấp dưới")
}

data class MockAccount(
    val id: String,
    val name: String,
    val role: UserRole,
    val title: String,
    val department: String,
    val branchName: String
) {
    val initials: String
        get() = name.trim().split(Regex("\\s+")).takeLast(2)
            .mapNotNull { it.firstOrNull()?.uppercaseChar() }
            .joinToString("")
            .ifEmpty { "NV" }
}

enum class NotificationPriority(val label: String) {
    NORMAL("Thông thường"),
    IMPORTANT("Quan trọng"),
    URGENT("Khẩn cấp")
}

enum class NotificationAudience(val label: String) {
    ALL_STAFF("Toàn công ty"),
    SUBORDINATES("Tất cả cấp dưới"),
    BRANCH("Theo chi nhánh"),
    INDIVIDUAL("Cá nhân"),
    SUPERVISORS("Ban quản lý")
}

data class CompanyNotification(
    val id: String,
    val title: String,
    val message: String,
    val priority: NotificationPriority,
    val audience: NotificationAudience,
    val targetBranch: String? = null,
    val targetAccountId: String? = null,
    val targetAccountName: String? = null,
    val senderId: String,
    val senderName: String,
    val senderRole: UserRole,
    val createdAt: String,
    val timestampMillis: Long = System.currentTimeMillis(),
    val readByAccountIds: List<String> = emptyList()
)

data class ShippingOrder(
    val id: String,
    val trackingNumber: String,      // Mã đầu việc (e.g. FIN-88490)
    val senderName: String,          // Phòng ban phụ trách
    val senderAddress: String,       // Tên công việc cần xử lý
    val recipientName: String,       // Nhân sự phụ trách
    val recipientAddress: String,    // Chi nhánh & Ghi chú ngắn
    val status: OrderStatus,
    val serviceType: String,         // Nhóm thao tác nhanh (Phê duyệt nhanh, Hiện trường, Bàn giao, Bảo trì)
    val feeVnd: Long,
    val codVnd: Long,                // Ngân sách dự kiến (tùy chọn)
    val createdAt: String,
    val estimatedDelivery: String,
    val weightKg: Float,
    val timestampMillis: Long = System.currentTimeMillis()
)

data class StatCardData(
    val title: String,
    val count: String,
    val subtitle: String,
    val trend: String,
    val isPositive: Boolean
)

data class ActivityLogItem(
    val id: String,
    val type: String, // CHECK_IN, ORDER_CREATED, STATUS_UPDATED, NOTIFICATION_SENT, SYSTEM
    val title: String,
    val description: String,
    val timestamp: String,
    val timestampMillis: Long = System.currentTimeMillis()
)

data class RemoteWorkspaceSnapshot(
    val orders: List<ShippingOrder>,
    val activities: List<ActivityLogItem>,
    val isCheckedInToday: Boolean,
    val attendanceCount: Int,
    val activeBranch: String,
    val databaseMode: String
)
