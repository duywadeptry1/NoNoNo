package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.model.OrderStatus
import com.example.model.ShippingOrder
import com.example.model.UserRole
import com.example.ui.components.OrderListItemCard
import com.example.ui.components.SectionHeader
import com.example.ui.components.StatMetricCard
import com.example.ui.theme.BrandBlue
import com.example.ui.theme.BrandOrange
import com.example.ui.theme.LocalThemeIsDark
import com.example.ui.theme.SuccessGreen
import com.example.viewmodel.GoShipUiState

@Composable
fun HomeScreen(
    uiState: GoShipUiState,
    isSupervisor: Boolean,
    unreadNotificationsCount: Int,
    canAdvanceOrder: (ShippingOrder) -> Boolean,
    onTabSelect: (Int) -> Unit,
    onPerformCheckIn: () -> Unit,
    onCreateOrderClick: () -> Unit,
    onOpenAccountSwitcher: () -> Unit,
    onOpenSendNotification: () -> Unit,
    onExportCsv: () -> Unit,
    onQuickAdvance: (ShippingOrder) -> Unit,
    onToggleDarkMode: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    val isDark = LocalThemeIsDark.current
    val account = uiState.currentAccount
    val roleAccent = if (account.role == UserRole.SUPERVISOR) BrandBlue else SuccessGreen
    val actionableQueue = uiState.orders
        .filter { it.status == OrderStatus.PENDING || it.status == OrderStatus.DELIVERING }
        .take(4)

    BoxWithConstraints(modifier = modifier.fillMaxSize()) {
        val isTablet = maxWidth > 600.dp

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = if (isTablet) 32.dp else 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item { Spacer(modifier = Modifier.height(6.dp)) }

            // Header tinh gọn kèm nút đổi tài khoản Cấp trên / Cấp dưới
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { onOpenAccountSwitcher() }
                            .padding(vertical = 4.dp)
                            .testTag("user_profile_header")
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(roleAccent),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = account.initials,
                                color = Color.White,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "${account.name} · ${account.role.label}",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "${account.title} · ${uiState.activeBranch}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = onOpenAccountSwitcher,
                            modifier = Modifier.testTag("btn_switch_account_home")
                        ) {
                            Icon(
                                imageVector = Icons.Default.SwapHoriz,
                                contentDescription = "Đổi tài khoản",
                                tint = roleAccent
                            )
                        }
                        IconButton(
                            onClick = { onToggleDarkMode(!isDark) },
                            modifier = Modifier.testTag("toggle_dark_mode_button")
                        ) {
                            Icon(
                                imageVector = if (isDark) Icons.Default.LightMode else Icons.Default.DarkMode,
                                contentDescription = "Đổi giao diện sáng/tối",
                                tint = if (isDark) Color(0xFFFBBF24) else Color(0xFF475569)
                            )
                        }
                    }
                }
            }

            // Chức năng riêng biệt cho Cấp trên hoặc hộp thư chỉ đạo cho Cấp dưới
            item {
                if (isSupervisor) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(
                                1.dp,
                                BrandBlue.copy(alpha = 0.35f),
                                RoundedCornerShape(16.dp)
                            )
                            .testTag("supervisor_exclusive_panel"),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isDark) MaterialTheme.colorScheme.surface else Color(0xFFF8FAFC)
                        )
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.AdminPanelSettings,
                                    contentDescription = null,
                                    tint = BrandBlue,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Chức năng riêng cho Cấp trên",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = BrandBlue
                                )
                            }
                            Text(
                                text = "Phê duyệt việc chờ xử lý, phát thông báo toàn công ty và xuất báo cáo ngày.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Button(
                                    onClick = onOpenSendNotification,
                                    modifier = Modifier
                                        .weight(1f)
                                        .testTag("btn_supervisor_send_notif"),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = BrandBlue)
                                ) {
                                    Icon(Icons.Default.Campaign, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Gửi thông báo", style = MaterialTheme.typography.labelMedium, color = Color.White)
                                }
                                OutlinedButton(
                                    onClick = onExportCsv,
                                    modifier = Modifier
                                        .weight(1f)
                                        .testTag("btn_supervisor_export_csv"),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Icon(Icons.Default.FileDownload, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Xuất CSV ngày", style = MaterialTheme.typography.labelMedium)
                                }
                            }
                        }
                    }
                } else {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(
                                1.dp,
                                SuccessGreen.copy(alpha = 0.4f),
                                RoundedCornerShape(16.dp)
                            )
                            .clickable { onTabSelect(2) }
                            .testTag("subordinate_inbox_banner"),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isDark) MaterialTheme.colorScheme.surface else Color.White
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Notifications,
                                    contentDescription = null,
                                    tint = SuccessGreen,
                                    modifier = Modifier.size(22.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "Hộp thư chỉ đạo nhân viên",
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = if (unreadNotificationsCount > 0) "Bạn có $unreadNotificationsCount thông báo chưa đọc từ Cấp trên" else "Đã cập nhật đầy đủ thông báo công ty",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                            Text(
                                text = "Mở hộp thư",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = BrandBlue
                            )
                        }
                    }
                }
            }

            // Banner Chấm công GPS 1 chạm
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(
                            1.dp,
                            if (uiState.isCheckedInToday) SuccessGreen.copy(alpha = 0.4f)
                            else if (isDark) MaterialTheme.colorScheme.outline
                            else Color(0xFFE2E8F0),
                            RoundedCornerShape(16.dp)
                        ),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isDark) MaterialTheme.colorScheme.surface else Color.White
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = if (uiState.isCheckedInToday) "Đã chấm công ca hôm nay" else "Chấm công ca tại ${uiState.activeBranch}",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = if (uiState.isCheckedInToday) "${account.name} · Quân số ${uiState.attendanceCount}/130" else "Chạm để điểm danh GPS ngay trên thiết bị",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Button(
                            onClick = onPerformCheckIn,
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (uiState.isCheckedInToday) SuccessGreen else BrandBlue
                            )
                        ) {
                            Icon(
                                imageVector = if (uiState.isCheckedInToday) Icons.Default.CheckCircle else Icons.Default.MyLocation,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (uiState.isCheckedInToday) "Đã Check-in" else "Check-in GPS",
                                style = MaterialTheme.typography.labelMedium,
                                color = Color.White
                            )
                        }
                    }
                }
            }

            // 3 chỉ số hành động tinh gọn
            item {
                val accents = listOf(BrandOrange, BrandBlue, SuccessGreen)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    uiState.stats.forEachIndexed { index, stat ->
                        StatMetricCard(
                            stat = stat,
                            accentColor = accents.getOrElse(index) { BrandBlue },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            // Thanh hành động nhanh: Thêm việc nhanh + Mở tab Chấm công GPS
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onCreateOrderClick,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = BrandBlue)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isSupervisor) "Giao việc nhanh" else "Đề xuất việc",
                            style = MaterialTheme.typography.labelLarge,
                            color = Color.White
                        )
                    }
                    OutlinedButton(
                        onClick = { onTabSelect(3) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.MyLocation, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Nhật ký GPS", style = MaterialTheme.typography.labelLarge)
                    }
                }
            }

            // Hàng chờ duyệt & đang chạy (1 chạm)
            item {
                SectionHeader(
                    title = "Cần duyệt & đang chạy (${actionableQueue.size})",
                    actionText = "Tất cả (${uiState.orders.size})",
                    onActionClick = { onTabSelect(1) }
                )
            }

            items(actionableQueue, key = { it.id }) { order ->
                val allowed = canAdvanceOrder(order)
                OrderListItemCard(
                    order = order,
                    onClick = { onTabSelect(1) },
                    onQuickAdvance = { onQuickAdvance(order) },
                    canQuickAdvance = allowed,
                    restrictedLabel = if (!allowed && order.status == OrderStatus.PENDING) "Chờ Cấp trên duyệt" else null
                )
            }

            item { Spacer(modifier = Modifier.height(24.dp)) }
        }
    }
}
