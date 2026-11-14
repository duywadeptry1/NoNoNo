package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
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
import com.example.model.OrderStatus
import com.example.model.ShippingOrder
import com.example.ui.components.OrderListItemCard
import com.example.ui.components.SearchBarField
import com.example.ui.components.StatusPill
import com.example.ui.theme.BrandBlue
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.LocalThemeIsDark
import com.example.viewmodel.GoShipUiState
import com.example.viewmodel.GoShipViewModel

@Composable
fun OrdersScreen(
    uiState: GoShipUiState,
    isSupervisor: Boolean,
    canApproveStatus: (OrderStatus, OrderStatus) -> Boolean,
    onSearchChange: (String) -> Unit,
    onFilterSelect: (OrderStatus?) -> Unit,
    onCreateOrderClick: () -> Unit,
    onUpdateOrderStatus: (String, OrderStatus) -> Unit,
    onAdvanceOrderStatus: (ShippingOrder) -> Unit,
    onDeleteOrder: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val filteredOrders = remember(uiState.orders, uiState.searchQuery, uiState.selectedOrderFilter) {
        uiState.orders.filter { order ->
            val matchesFilter = uiState.selectedOrderFilter == null || order.status == uiState.selectedOrderFilter
            val matchesSearch = uiState.searchQuery.isBlank() ||
                order.trackingNumber.contains(uiState.searchQuery, ignoreCase = true) ||
                order.senderName.contains(uiState.searchQuery, ignoreCase = true) ||
                order.senderAddress.contains(uiState.searchQuery, ignoreCase = true) ||
                order.recipientName.contains(uiState.searchQuery, ignoreCase = true) ||
                order.recipientAddress.contains(uiState.searchQuery, ignoreCase = true)
            matchesFilter && matchesSearch
        }
    }

    var selectedOrderDetail by remember { mutableStateOf<ShippingOrder?>(null) }

    fun canQuickAdvanceOrder(order: ShippingOrder): Boolean {
        val next = when (order.status) {
            OrderStatus.PENDING -> OrderStatus.DELIVERING
            OrderStatus.DELIVERING -> OrderStatus.COMPLETED
            OrderStatus.CANCELLED -> OrderStatus.PENDING
            OrderStatus.COMPLETED -> if (isSupervisor) OrderStatus.DELIVERING else return false
        }
        return canApproveStatus(order.status, next)
    }

    BoxWithConstraints(modifier = modifier.fillMaxSize()) {
        val isTablet = maxWidth > 700.dp

        Box(modifier = Modifier.fillMaxSize()) {
            if (isTablet) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 24.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .weight(1.1f)
                            .fillMaxSize()
                    ) {
                        OrdersTopHeader(
                            searchQuery = uiState.searchQuery,
                            onSearchChange = onSearchChange,
                            selectedFilter = uiState.selectedOrderFilter,
                            onFilterSelect = onFilterSelect
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.fillMaxSize()
                        ) {
                            items(filteredOrders, key = { it.id }) { order ->
                                val allowed = canQuickAdvanceOrder(order)
                                OrderListItemCard(
                                    order = order,
                                    onClick = { selectedOrderDetail = order },
                                    onQuickAdvance = { onAdvanceOrderStatus(order) },
                                    canQuickAdvance = allowed,
                                    restrictedLabel = if (!allowed && order.status == OrderStatus.PENDING) "Chờ Cấp trên duyệt" else null
                                )
                            }
                            item { Spacer(modifier = Modifier.height(40.dp)) }
                        }
                    }

                    Column(
                        modifier = Modifier
                            .weight(0.9f)
                            .fillMaxSize()
                    ) {
                        val activeOrder = filteredOrders.find { it.id == selectedOrderDetail?.id }
                            ?: filteredOrders.firstOrNull()
                        if (activeOrder != null) {
                            TaskDetailPane(
                                order = activeOrder,
                                isSupervisor = isSupervisor,
                                canApproveStatus = { st -> canApproveStatus(activeOrder.status, st) },
                                onUpdateStatus = { newStatus -> onUpdateOrderStatus(activeOrder.id, newStatus) },
                                onDeleteOrder = { onDeleteOrder(activeOrder.id) }
                            )
                        }
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item { Spacer(modifier = Modifier.height(6.dp)) }

                    item {
                        OrdersTopHeader(
                            searchQuery = uiState.searchQuery,
                            onSearchChange = onSearchChange,
                            selectedFilter = uiState.selectedOrderFilter,
                            onFilterSelect = onFilterSelect
                        )
                    }

                    val activeDetail = filteredOrders.find { it.id == selectedOrderDetail?.id }
                    if (activeDetail != null) {
                        item {
                            TaskDetailPane(
                                order = activeDetail,
                                isSupervisor = isSupervisor,
                                canApproveStatus = { st -> canApproveStatus(activeDetail.status, st) },
                                onUpdateStatus = { st -> onUpdateOrderStatus(activeDetail.id, st) },
                                onDeleteOrder = {
                                    onDeleteOrder(activeDetail.id)
                                    selectedOrderDetail = null
                                }
                            )
                        }
                    }

                    if (filteredOrders.isEmpty()) {
                        item {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 36.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Assignment,
                                    contentDescription = null,
                                    tint = BrandBlue,
                                    modifier = Modifier.size(36.dp)
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                                Text(
                                    text = "Không có đầu việc phù hợp",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Nhấn + để thêm nhanh đầu việc mới",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    } else {
                        items(filteredOrders, key = { it.id }) { order ->
                            val allowed = canQuickAdvanceOrder(order)
                            OrderListItemCard(
                                order = order,
                                onClick = {
                                    selectedOrderDetail = if (selectedOrderDetail?.id == order.id) null else order
                                },
                                onQuickAdvance = { onAdvanceOrderStatus(order) },
                                canQuickAdvance = allowed,
                                restrictedLabel = if (!allowed && order.status == OrderStatus.PENDING) "Chờ Cấp trên duyệt" else null
                            )
                        }
                    }

                    item { Spacer(modifier = Modifier.height(76.dp)) }
                }
            }

            FloatingActionButton(
                onClick = onCreateOrderClick,
                containerColor = BrandBlue,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(20.dp)
                    .testTag("fab_create_order")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Thêm việc nhanh", modifier = Modifier.size(26.dp))
            }
        }
    }
}

@Composable
private fun OrdersTopHeader(
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    selectedFilter: OrderStatus?,
    onFilterSelect: (OrderStatus?) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "Đầu việc cần xử lý",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(10.dp))

        SearchBarField(
            query = searchQuery,
            onQueryChange = onSearchChange,
            placeholderText = "Tìm mã việc, người phụ trách, chi nhánh…"
        )

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            FilterChipItem(
                label = "Tất cả",
                isSelected = selectedFilter == null,
                onClick = { onFilterSelect(null) }
            )
            OrderStatus.entries.forEach { status ->
                FilterChipItem(
                    label = status.label,
                    isSelected = selectedFilter == status,
                    onClick = { onFilterSelect(status) }
                )
            }
        }
    }
}

@Composable
private fun FilterChipItem(
    label: String,
    isSelected: Boolean,
    enabled: Boolean = true,
    onClick: () -> Unit
) {
    val isDark = LocalThemeIsDark.current
    val bg = if (isSelected) BrandBlue
    else if (isDark) MaterialTheme.colorScheme.surfaceVariant
    else Color(0xFFF1F5F9)

    val textColor = when {
        isSelected -> Color.White
        !enabled -> MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.45f)
        else -> MaterialTheme.colorScheme.onSurface
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .background(bg)
            .clickable(enabled = enabled) { onClick() }
            .padding(horizontal = 14.dp, vertical = 8.dp)
            .testTag("filter_chip_$label"),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            color = textColor
        )
    }
}

@Composable
private fun TaskDetailPane(
    order: ShippingOrder,
    isSupervisor: Boolean,
    canApproveStatus: (OrderStatus) -> Boolean,
    onUpdateStatus: (OrderStatus) -> Unit,
    onDeleteOrder: () -> Unit
) {
    val isDark = LocalThemeIsDark.current
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(
                1.dp,
                if (isDark) MaterialTheme.colorScheme.outline else Color(0xFFE2E8F0),
                RoundedCornerShape(16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isDark) MaterialTheme.colorScheme.surface else Color.White
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = order.trackingNumber,
                        style = MaterialTheme.typography.labelLarge,
                        color = BrandBlue,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = order.senderAddress,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    StatusPill(status = order.status)
                    if (isSupervisor) {
                        IconButton(onClick = onDeleteOrder) {
                            Icon(Icons.Default.DeleteOutline, contentDescription = "Xóa đầu việc", tint = ErrorRed)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            HorizontalDivider(color = if (isDark) MaterialTheme.colorScheme.outline.copy(alpha = 0.4f) else Color(0xFFE2E8F0))
            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Phụ trách: ${order.recipientName} · ${order.senderName}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "${order.recipientAddress} · ${order.estimatedDelivery}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (order.codVnd > 0) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Ngân sách: ${GoShipViewModel.formatVnd(order.codVnd)}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = BrandBlue
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = if (isSupervisor) "Chuyển trạng thái nhanh (Quyền Cấp trên)" else "Cập nhật tiến độ nhân viên",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OrderStatus.entries.forEach { st ->
                    val allowed = st == order.status || canApproveStatus(st)
                    FilterChipItem(
                        label = st.label,
                        isSelected = order.status == st,
                        enabled = allowed,
                        onClick = { onUpdateStatus(st) }
                    )
                }
            }
        }
    }
}
