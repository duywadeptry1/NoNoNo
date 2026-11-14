package com.example.ui

import android.content.Intent
import androidx.activity.compose.BackHandler
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.BusinessCenter
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.Assignment
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.NavigationRailItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.model.OrderStatus
import com.example.ui.components.AccountSwitcherSheet
import com.example.ui.components.CreateOrderSheet
import com.example.ui.components.SendNotificationSheet
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.NotificationsScreen
import com.example.ui.screens.OrdersScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.TrackingScreen
import com.example.ui.theme.BrandBlue
import com.example.ui.theme.LocalThemeIsDark
import com.example.viewmodel.GoShipUiState
import com.example.viewmodel.GoShipViewModel

data class NavItem(
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val tag: String,
    val badgeCount: Int = 0
)

@Composable
fun MainAdaptiveScreen(
    viewModel: GoShipViewModel,
    uiState: GoShipUiState
) {
    val isDark = LocalThemeIsDark.current
    val snackbarHostState = remember { SnackbarHostState() }
    val unreadNotifs = viewModel.unreadNotificationsCount(uiState.notifications, uiState.currentAccount)

    BackHandler(enabled = uiState.selectedTab != 0) {
        viewModel.selectTab(0)
    }

    LaunchedEffect(uiState.snackbarMessage) {
        uiState.snackbarMessage?.let { msg ->
            snackbarHostState.showSnackbar(
                message = msg,
                duration = SnackbarDuration.Short
            )
            viewModel.clearSnackbar()
        }
    }

    val navItems = listOf(
        NavItem("Tổng quan", Icons.Filled.Dashboard, Icons.Outlined.Dashboard, "nav_home"),
        NavItem("Công việc", Icons.Filled.Assignment, Icons.Outlined.Assignment, "nav_orders"),
        NavItem(
            "Thông báo",
            Icons.Filled.Notifications,
            Icons.Outlined.Notifications,
            "nav_notifications",
            badgeCount = unreadNotifs
        ),
        NavItem("Chấm công", Icons.Filled.LocationOn, Icons.Outlined.LocationOn, "nav_checkin"),
        NavItem("Cài đặt", Icons.Filled.Settings, Icons.Outlined.Settings, "nav_settings")
    )

    BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
        val isTablet = maxWidth > 600.dp

        if (isTablet) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background)
                    .windowInsetsPadding(WindowInsets.safeDrawing)
            ) {
                NavigationRail(
                    containerColor = if (isDark) MaterialTheme.colorScheme.surface else Color.White,
                    header = {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(vertical = 16.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(BrandBlue),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.BusinessCenter,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "BizManage",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = BrandBlue
                            )
                        }
                    },
                    modifier = Modifier.fillMaxHeight()
                ) {
                    Spacer(modifier = Modifier.weight(1f))
                    navItems.forEachIndexed { index, item ->
                        val selected = uiState.selectedTab == index
                        NavigationRailItem(
                            selected = selected,
                            onClick = { viewModel.selectTab(index) },
                            icon = {
                                NavIconWithBadge(item = item, selected = selected)
                            },
                            label = {
                                Text(
                                    text = item.title,
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                    maxLines = 1
                                )
                            },
                            colors = NavigationRailItemDefaults.colors(
                                selectedIconColor = BrandBlue,
                                selectedTextColor = BrandBlue,
                                indicatorColor = BrandBlue.copy(alpha = if (isDark) 0.25f else 0.12f),
                                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                            ),
                            modifier = Modifier.testTag(item.tag)
                        )
                    }
                    Spacer(modifier = Modifier.weight(1f))
                }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                ) {
                    ScreenContent(
                        tabIndex = uiState.selectedTab,
                        viewModel = viewModel,
                        uiState = uiState
                    )
                    SnackbarHost(
                        hostState = snackbarHostState,
                        modifier = Modifier.align(Alignment.BottomCenter)
                    )
                }
            }
        } else {
            Scaffold(
                containerColor = MaterialTheme.colorScheme.background,
                contentWindowInsets = WindowInsets.safeDrawing,
                snackbarHost = { SnackbarHost(snackbarHostState) },
                bottomBar = {
                    NavigationBar(
                        containerColor = if (isDark) MaterialTheme.colorScheme.surface else Color.White,
                        tonalElevation = 6.dp,
                        modifier = Modifier
                            .windowInsetsPadding(WindowInsets.navigationBars)
                            .testTag("bottom_nav_bar")
                    ) {
                        navItems.forEachIndexed { index, item ->
                            val selected = uiState.selectedTab == index
                            NavigationBarItem(
                                selected = selected,
                                onClick = { viewModel.selectTab(index) },
                                icon = {
                                    NavIconWithBadge(item = item, selected = selected)
                                },
                                label = {
                                    Text(
                                        text = item.title,
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = BrandBlue,
                                    selectedTextColor = BrandBlue,
                                    indicatorColor = BrandBlue.copy(alpha = if (isDark) 0.25f else 0.12f),
                                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                ),
                                modifier = Modifier.testTag(item.tag)
                            )
                        }
                    }
                }
            ) { innerPadding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                ) {
                    ScreenContent(
                        tabIndex = uiState.selectedTab,
                        viewModel = viewModel,
                        uiState = uiState
                    )
                }
            }
        }

        CreateOrderSheet(
            isVisible = uiState.isCreateOrderSheetVisible,
            defaultBranch = uiState.activeBranch,
            onDismiss = { viewModel.closeCreateOrderSheet() },
            onConfirm = { title, assignee, dept, branch, budget ->
                viewModel.createQuickTask(title, assignee, dept, branch, budget)
            }
        )

        AccountSwitcherSheet(
            isVisible = uiState.isAccountSwitcherVisible,
            accounts = uiState.accounts,
            currentAccountId = uiState.currentAccount.id,
            onDismiss = { viewModel.closeAccountSwitcher() },
            onSelectAccount = { id -> viewModel.switchAccount(id) }
        )

        SendNotificationSheet(
            isVisible = uiState.isSendNotificationSheetVisible,
            defaultBranch = uiState.activeBranch,
            accounts = uiState.accounts,
            onDismiss = { viewModel.closeSendNotificationSheet() },
            onSend = { title, msg, priority, audience, branch, targetId ->
                viewModel.sendCompanyNotification(
                    title = title,
                    message = msg,
                    priority = priority,
                    audience = audience,
                    targetBranch = branch,
                    targetAccountId = targetId
                )
            }
        )
    }
}

@Composable
private fun NavIconWithBadge(item: NavItem, selected: Boolean) {
    if (item.badgeCount > 0) {
        BadgedBox(
            badge = {
                Badge(containerColor = BrandBlue, contentColor = Color.White) {
                    Text(text = item.badgeCount.toString())
                }
            }
        ) {
            Icon(
                imageVector = if (selected) item.selectedIcon else item.unselectedIcon,
                contentDescription = item.title,
                modifier = Modifier.size(22.dp)
            )
        }
    } else {
        Icon(
            imageVector = if (selected) item.selectedIcon else item.unselectedIcon,
            contentDescription = item.title,
            modifier = Modifier.size(22.dp)
        )
    }
}

@Composable
private fun ScreenContent(
    tabIndex: Int,
    viewModel: GoShipViewModel,
    uiState: GoShipUiState
) {
    val context = LocalContext.current
    val isSupervisor = viewModel.isSupervisor(uiState.currentAccount)
    val visibleNotifications = viewModel.visibleNotifications(uiState.notifications, uiState.currentAccount)
    val unreadNotifs = viewModel.unreadNotificationsCount(uiState.notifications, uiState.currentAccount)

    val shareCsvReport: () -> Unit = {
        if (viewModel.canExportEnterpriseReport(uiState.currentAccount)) {
            val csv = viewModel.generateDailyActivitiesCsvReport()
            val filename = viewModel.getDailyActivitiesReportFilename()
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/csv"
                putExtra(Intent.EXTRA_SUBJECT, filename)
                putExtra(Intent.EXTRA_TEXT, csv)
            }
            context.startActivity(
                Intent.createChooser(shareIntent, "Xuất báo cáo hoạt động ngày (CSV)")
            )
        }
    }

    Crossfade(targetState = tabIndex, label = "screen_transition") { targetTab ->
        when (targetTab) {
            0 -> HomeScreen(
                uiState = uiState,
                isSupervisor = isSupervisor,
                unreadNotificationsCount = unreadNotifs,
                canAdvanceOrder = { order ->
                    val next = when (order.status) {
                        OrderStatus.PENDING -> OrderStatus.DELIVERING
                        OrderStatus.DELIVERING -> OrderStatus.COMPLETED
                        OrderStatus.CANCELLED -> OrderStatus.PENDING
                        OrderStatus.COMPLETED -> if (isSupervisor) OrderStatus.DELIVERING else OrderStatus.COMPLETED
                    }
                    order.status != OrderStatus.COMPLETED &&
                        viewModel.canApproveOrderStatus(order.status, next, uiState.currentAccount)
                },
                onTabSelect = { viewModel.selectTab(it) },
                onPerformCheckIn = { viewModel.performGpsCheckIn() },
                onCreateOrderClick = { viewModel.openCreateOrderSheet() },
                onOpenAccountSwitcher = { viewModel.openAccountSwitcher() },
                onOpenSendNotification = { viewModel.openSendNotificationSheet() },
                onExportCsv = shareCsvReport,
                onQuickAdvance = { viewModel.advanceOrderStatus(it) },
                onToggleDarkMode = { viewModel.toggleDarkMode(it) }
            )
            1 -> OrdersScreen(
                uiState = uiState,
                isSupervisor = isSupervisor,
                canApproveStatus = { cur, nxt ->
                    viewModel.canApproveOrderStatus(cur, nxt, uiState.currentAccount)
                },
                onSearchChange = { viewModel.updateSearchQuery(it) },
                onFilterSelect = { viewModel.filterOrders(it) },
                onCreateOrderClick = { viewModel.openCreateOrderSheet() },
                onUpdateOrderStatus = { id, st -> viewModel.updateOrderStatus(id, st) },
                onAdvanceOrderStatus = { viewModel.advanceOrderStatus(it) },
                onDeleteOrder = { id -> viewModel.deleteOrder(id) }
            )
            2 -> NotificationsScreen(
                uiState = uiState,
                visibleNotifications = visibleNotifications,
                unreadCount = unreadNotifs,
                isSupervisor = isSupervisor,
                onOpenComposer = { viewModel.openSendNotificationSheet() },
                onMarkRead = { id -> viewModel.markNotificationRead(id) },
                onMarkAllRead = { viewModel.markAllNotificationsRead() }
            )
            3 -> TrackingScreen(
                uiState = uiState,
                canExportCsv = isSupervisor,
                onSelectBranch = { viewModel.selectBranch(it) },
                onPerformCheckIn = { viewModel.performGpsCheckIn(it) },
                onExportCsv = shareCsvReport
            )
            else -> ProfileScreen(
                uiState = uiState,
                isSupervisor = isSupervisor,
                onSwitchAccount = { id -> viewModel.switchAccount(id) },
                onOpenAccountSwitcher = { viewModel.openAccountSwitcher() },
                onOpenSendNotification = { viewModel.openSendNotificationSheet() },
                onExportCsv = shareCsvReport,
                onToggleDarkMode = { viewModel.toggleDarkMode(it) },
                onSyncNow = { viewModel.syncWithServer() },
                onResetDbClick = { viewModel.resetDatabaseToDefaults() }
            )
        }
    }
}
