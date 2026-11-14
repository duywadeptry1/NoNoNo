package com.example.data.local

import com.example.data.local.entity.OrderEntity
import com.example.model.ActivityLogItem
import com.example.model.CompanyNotification
import com.example.model.MockAccount
import com.example.model.NotificationAudience
import com.example.model.NotificationPriority
import com.example.model.OrderStatus
import com.example.model.UserRole

/**
 * Dữ liệu mẫu tinh gọn, đồng bộ cấu trúc với MongoDB collection `orders`, `activities` và `notifications`.
 */
object SeedData {

    val branches = listOf(
        "Trụ sở Hà Nội",
        "Chi nhánh Đà Nẵng",
        "Chi nhánh TP.HCM"
    )

    val departments = listOf(
        "B2B" to "Kinh doanh",
        "TECH" to "Kỹ thuật",
        "OPS" to "Vận hành",
        "FIN" to "Tài chính"
    )

    val mockAccounts = listOf(
        MockAccount(
            id = "ACC-SUP-01",
            name = "Alex Nguyễn",
            role = UserRole.SUPERVISOR,
            title = "Giám đốc Vận hành",
            department = "Ban Điều hành",
            branchName = "Trụ sở Hà Nội"
        ),
        MockAccount(
            id = "ACC-SUP-02",
            name = "Nguyễn Hoàng Nam",
            role = UserRole.SUPERVISOR,
            title = "Trưởng phòng Kỹ thuật",
            department = "Phòng Kỹ Thuật & R&D",
            branchName = "Chi nhánh Đà Nẵng"
        ),
        MockAccount(
            id = "ACC-SUB-01",
            name = "Phạm Thu Thảo",
            role = UserRole.SUBORDINATE,
            title = "Chuyên viên Hiện trường",
            department = "Phòng Kỹ Thuật & R&D",
            branchName = "Trụ sở Hà Nội"
        ),
        MockAccount(
            id = "ACC-SUB-02",
            name = "Lê Minh Tuấn",
            role = UserRole.SUBORDINATE,
            title = "Nhân viên Vận hành",
            department = "Phòng Vận Hành Chi nhánh",
            branchName = "Chi nhánh Đà Nẵng"
        ),
        MockAccount(
            id = "ACC-SUB-03",
            name = "Trần Đình Trọng",
            role = UserRole.SUBORDINATE,
            title = "Chuyên viên Tài chính",
            department = "Phòng Tài Chính",
            branchName = "Chi nhánh TP.HCM"
        )
    )

    fun fullDepartmentName(code: String): String = when (code) {
        "TECH" -> "Phòng Kỹ Thuật & R&D"
        "OPS" -> "Phòng Vận Hành Chi nhánh"
        "FIN" -> "Phòng Tài Chính"
        else -> "Phòng Kinh Doanh B2B"
    }

    fun defaultOrders(): List<OrderEntity> {
        val now = System.currentTimeMillis()
        return listOf(
            OrderEntity(
                id = "ORD-001",
                trackingNumber = "FIN-88490",
                senderName = "Phòng Tài Chính",
                senderAddress = "Duyệt chi phí vận hành & phụ cấp ca tháng 11",
                recipientName = "Trần Đình Trọng",
                recipientAddress = "Trụ sở Hà Nội · Chờ duyệt qua app",
                statusName = OrderStatus.PENDING.name,
                serviceType = "Phê duyệt nhanh",
                feeVnd = 0L,
                codVnd = 18500000L,
                createdAt = "08:15 · Hôm nay",
                estimatedDelivery = "Hạn duyệt: 17:30",
                weightKg = 1.0f,
                timestampMillis = now - 1000L
            ),
            OrderEntity(
                id = "ORD-002",
                trackingNumber = "PRJ-88492",
                senderName = "Phòng Kỹ Thuật & R&D",
                senderAddress = "Triển khai thiết bị POS tại điểm bán Cầu Giấy",
                recipientName = "Phạm Thu Thảo",
                recipientAddress = "Trụ sở Hà Nội · Đang lắp đặt",
                statusName = OrderStatus.DELIVERING.name,
                serviceType = "Hiện trường",
                feeVnd = 0L,
                codVnd = 12000000L,
                createdAt = "09:00 · Hôm nay",
                estimatedDelivery = "Hạn: 25/11/2026",
                weightKg = 2.0f,
                timestampMillis = now - 2000L
            ),
            OrderEntity(
                id = "ORD-003",
                trackingNumber = "OPS-88493",
                senderName = "Phòng Vận Hành Chi nhánh",
                senderAddress = "Kiểm tra thiết bị & mở ca chi nhánh Đà Nẵng",
                recipientName = "Lê Minh Tuấn",
                recipientAddress = "Chi nhánh Đà Nẵng · Chờ xác nhận",
                statusName = OrderStatus.PENDING.name,
                serviceType = "Phê duyệt nhanh",
                feeVnd = 0L,
                codVnd = 4500000L,
                createdAt = "09:40 · Hôm nay",
                estimatedDelivery = "Hạn: Hôm nay",
                weightKg = 1.0f,
                timestampMillis = now - 3000L
            ),
            OrderEntity(
                id = "ORD-004",
                trackingNumber = "CTR-88491",
                senderName = "Phòng Kinh Doanh B2B",
                senderAddress = "Bàn giao hợp đồng chuỗi bán lẻ Miền Trung",
                recipientName = "Nguyễn Minh Khang",
                recipientAddress = "Chi nhánh Đà Nẵng · Đã ký biên bản",
                statusName = OrderStatus.COMPLETED.name,
                serviceType = "Bàn giao",
                feeVnd = 0L,
                codVnd = 42000000L,
                createdAt = "Hôm qua",
                estimatedDelivery = "Đã hoàn tất",
                weightKg = 3.0f,
                timestampMillis = now - 4000L
            ),
            OrderEntity(
                id = "ORD-005",
                trackingNumber = "OPS-88488",
                senderName = "Phòng Vận Hành Chi nhánh",
                senderAddress = "Bảo trì máy chủ nội bộ chi nhánh Cần Thơ",
                recipientName = "Lê Hoàng Long",
                recipientAddress = "Chi nhánh TP.HCM · Tạm hoãn lịch",
                statusName = OrderStatus.CANCELLED.name,
                serviceType = "Bảo trì",
                feeVnd = 0L,
                codVnd = 6000000L,
                createdAt = "07/11/2026",
                estimatedDelivery = "Chờ sắp lịch lại",
                weightKg = 1.0f,
                timestampMillis = now - 5000L
            )
        )
    }

    fun defaultActivities(): List<ActivityLogItem> {
        val now = System.currentTimeMillis()
        return listOf(
            ActivityLogItem(
                id = "ACT-001",
                type = "STATUS_UPDATED",
                title = "Khởi tạo hàng đợi phê duyệt ngày mới",
                description = "Có 2 đầu việc đang chờ duyệt nhanh trên ứng dụng.",
                timestamp = "08:15",
                timestampMillis = now - 1000L
            ),
            ActivityLogItem(
                id = "ACT-002",
                type = "ORDER_CREATED",
                title = "Cập nhật tiến độ hiện trường PRJ-88492",
                description = "Phạm Thu Thảo đã nhận thiết bị và di chuyển tới điểm bán Cầu Giấy.",
                timestamp = "09:05",
                timestampMillis = now - 2000L
            ),
            ActivityLogItem(
                id = "ACT-003",
                type = "SYSTEM",
                title = "Đồng bộ cơ sở dữ liệu MongoDB",
                description = "Dữ liệu công việc và chấm công sẵn sàng đồng bộ giữa Android và Web.",
                timestamp = "09:30",
                timestampMillis = now - 3000L
            )
        )
    }

    fun defaultNotifications(now: Long = System.currentTimeMillis()): List<CompanyNotification> {
        return listOf(
            CompanyNotification(
                id = "NTF-001",
                title = "Nhắc chấm công GPS trước 08:30 tại các chi nhánh",
                message = "Toàn bộ nhân sự đi làm trực tiếp vui lòng xác nhận vị trí GPS trên app trước giờ vào ca để chốt quân số.",
                priority = NotificationPriority.IMPORTANT,
                audience = NotificationAudience.ALL_STAFF,
                senderId = "ACC-SUP-01",
                senderName = "Alex Nguyễn",
                senderRole = UserRole.SUPERVISOR,
                createdAt = "08:00 · Hôm nay",
                timestampMillis = now - 1500L,
                readByAccountIds = listOf("ACC-SUP-01")
            ),
            CompanyNotification(
                id = "NTF-002",
                title = "Cập nhật biên bản bàn giao POS điểm bán Cầu Giấy",
                message = "Phạm Thu Thảo chụp ảnh nghiệm thu thiết bị POS (PRJ-88492) và bấm xác nhận hoàn tất ngay sau khi lắp đặt xong.",
                priority = NotificationPriority.URGENT,
                audience = NotificationAudience.INDIVIDUAL,
                targetAccountId = "ACC-SUB-01",
                targetAccountName = "Phạm Thu Thảo",
                senderId = "ACC-SUP-02",
                senderName = "Nguyễn Hoàng Nam",
                senderRole = UserRole.SUPERVISOR,
                createdAt = "09:10 · Hôm nay",
                timestampMillis = now - 2500L,
                readByAccountIds = listOf("ACC-SUP-02")
            ),
            CompanyNotification(
                id = "NTF-003",
                title = "Lịch bảo trì hệ thống chi nhánh Đà Nẵng cuối tuần",
                message = "Đội vận hành chi nhánh Đà Nẵng chuẩn bị phương án dự phòng ca trực vào 18:00 Thứ Sáu.",
                priority = NotificationPriority.NORMAL,
                audience = NotificationAudience.BRANCH,
                targetBranch = "Chi nhánh Đà Nẵng",
                senderId = "ACC-SUP-01",
                senderName = "Alex Nguyễn",
                senderRole = UserRole.SUPERVISOR,
                createdAt = "Hôm qua",
                timestampMillis = now - 3500L,
                readByAccountIds = listOf("ACC-SUP-01", "ACC-SUP-02")
            )
        )
    }
}
