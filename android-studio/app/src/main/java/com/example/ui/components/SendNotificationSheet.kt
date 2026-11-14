package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.local.SeedData
import com.example.model.MockAccount
import com.example.model.NotificationAudience
import com.example.model.NotificationPriority
import com.example.model.UserRole
import com.example.ui.theme.BrandBlue
import com.example.ui.theme.BrandOrange
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.LocalThemeIsDark

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SendNotificationSheet(
    isVisible: Boolean,
    defaultBranch: String,
    accounts: List<MockAccount>,
    onDismiss: () -> Unit,
    onSend: (
        title: String,
        message: String,
        priority: NotificationPriority,
        audience: NotificationAudience,
        targetBranch: String?,
        targetAccountId: String?
    ) -> Unit
) {
    if (!isVisible) return

    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val isDark = LocalThemeIsDark.current

    val subordinates = accounts.filter { it.role == UserRole.SUBORDINATE }

    var title by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf(NotificationPriority.IMPORTANT) }
    var audience by remember { mutableStateOf(NotificationAudience.ALL_STAFF) }
    var targetBranch by remember(defaultBranch) { mutableStateOf(defaultBranch) }
    var targetAccountId by remember { mutableStateOf(subordinates.firstOrNull()?.id ?: "") }
    var validationError by remember { mutableStateOf<String?>(null) }

    val quickTemplates = listOf(
        "Nhắc chấm công GPS" to "Nhắc chấm công GPS đầu ca" to "Toàn bộ nhân sự xác nhận vị trí GPS trước 08:30.",
        "Họp giao ban khẩn" to "Họp giao ban khẩn lúc 14:30" to "Các trưởng nhóm và nhân viên chuẩn bị số liệu tiến độ hôm nay.",
        "Chốt báo cáo ngày" to "Chốt báo cáo tiến độ cuối ngày" to "Hoàn tất cập nhật các đầu việc đang chạy trước 17:15."
    )

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = if (isDark) MaterialTheme.colorScheme.surface else Color.White,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        dragHandle = null
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 18.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Phát thông báo công ty",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Tính năng dành riêng cho tài khoản Cấp trên",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Đóng")
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Mẫu soạn nhanh trên điện thoại",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                quickTemplates.forEach { (pair, body) ->
                    val (label, tplTitle) = pair
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isDark) MaterialTheme.colorScheme.surfaceVariant else Color(0xFFF1F5F9))
                            .clickable {
                                title = tplTitle
                                message = body
                                validationError = null
                            }
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = label,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = title,
                onValueChange = {
                    title = it
                    validationError = null
                },
                label = { Text("Tiêu đề thông báo *") },
                placeholder = { Text("VD: Họp giao ban toàn công ty") },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("input_notif_title"),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = BrandBlue,
                    unfocusedBorderColor = if (isDark) MaterialTheme.colorScheme.outline else Color(0xFFE2E8F0)
                )
            )

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedTextField(
                value = message,
                onValueChange = {
                    message = it
                    validationError = null
                },
                label = { Text("Nội dung chỉ đạo *") },
                placeholder = { Text("Nhập thông điệp gửi nhân viên...") },
                minLines = 3,
                maxLines = 4,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("input_notif_message"),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = BrandBlue,
                    unfocusedBorderColor = if (isDark) MaterialTheme.colorScheme.outline else Color(0xFFE2E8F0)
                )
            )

            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Mức độ ưu tiên",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                NotificationPriority.entries.forEach { p ->
                    val selected = priority == p
                    val activeBg = when (p) {
                        NotificationPriority.URGENT -> ErrorRed
                        NotificationPriority.IMPORTANT -> BrandOrange
                        NotificationPriority.NORMAL -> BrandBlue
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                if (selected) activeBg
                                else if (isDark) MaterialTheme.colorScheme.surfaceVariant
                                else Color(0xFFF1F5F9)
                            )
                            .clickable { priority = p }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = p.label,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                            color = if (selected) Color.White else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Đối tượng nhận thông báo",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(
                    NotificationAudience.ALL_STAFF,
                    NotificationAudience.SUBORDINATES,
                    NotificationAudience.BRANCH,
                    NotificationAudience.INDIVIDUAL
                ).forEach { aud ->
                    val selected = audience == aud
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                if (selected) BrandBlue
                                else if (isDark) MaterialTheme.colorScheme.surfaceVariant
                                else Color(0xFFF1F5F9)
                            )
                            .clickable { audience = aud }
                            .padding(horizontal = 12.dp, vertical = 10.dp)
                    ) {
                        Text(
                            text = aud.label,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                            color = if (selected) Color.White else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            if (audience == NotificationAudience.BRANCH) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    SeedData.branches.forEach { branch ->
                        val selected = targetBranch == branch
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(
                                    if (selected) BrandBlue
                                    else if (isDark) MaterialTheme.colorScheme.surfaceVariant
                                    else Color(0xFFF1F5F9)
                                )
                                .clickable { targetBranch = branch }
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = branch,
                                style = MaterialTheme.typography.labelSmall,
                                color = if (selected) Color.White else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }

            if (audience == NotificationAudience.INDIVIDUAL && subordinates.isNotEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    subordinates.forEach { sub ->
                        val selected = targetAccountId == sub.id
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(
                                    if (selected) BrandBlue
                                    else if (isDark) MaterialTheme.colorScheme.surfaceVariant
                                    else Color(0xFFF1F5F9)
                                )
                                .clickable { targetAccountId = sub.id }
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = "${sub.name} (${sub.branchName})",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (selected) Color.White else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }

            if (validationError != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = validationError!!,
                    style = MaterialTheme.typography.bodySmall,
                    color = ErrorRed,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(18.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onDismiss,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Hủy", style = MaterialTheme.typography.labelLarge)
                }
                Button(
                    onClick = {
                        if (title.isBlank() || message.isBlank()) {
                            validationError = "Vui lòng nhập tiêu đề và nội dung thông báo."
                            return@Button
                        }
                        onSend(
                            title.trim(),
                            message.trim(),
                            priority,
                            audience,
                            if (audience == NotificationAudience.BRANCH) targetBranch else null,
                            if (audience == NotificationAudience.INDIVIDUAL) targetAccountId else null
                        )
                    },
                    modifier = Modifier
                        .weight(2f)
                        .testTag("btn_submit_send_notif"),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = BrandBlue)
                ) {
                    Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Gửi ngay", style = MaterialTheme.typography.labelLarge, color = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}
