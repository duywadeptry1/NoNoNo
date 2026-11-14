package com.example.data.repository

import com.example.data.local.SeedData
import com.example.data.local.dao.BusinessDao
import com.example.data.local.entity.OrderEntity
import com.example.data.local.entity.toEntity
import com.example.data.remote.CheckInApiResponse
import com.example.data.remote.OrderApi
import com.example.model.OrderStatus
import com.example.model.RemoteWorkspaceSnapshot
import com.example.model.ShippingOrder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class BusinessRepository(
    private val dao: BusinessDao,
    private val api: OrderApi? = null
) {

    val ordersFlow: Flow<List<ShippingOrder>> = dao.getAllOrders().map { list ->
        list.map { it.toDomain() }
    }

    private fun pushOrders(entities: List<OrderEntity>) {
        val client = api ?: return
        if (entities.isEmpty()) return
        runCatching { client.upsertOrders(entities) }
    }

    /**
     * Đồng bộ hai chiều với backend MongoDB:
     * ưu tiên lấy workspace đầy đủ (orders, activities, check-in status);
     * nếu server trống thì đẩy dữ liệu đang có trong Room lên.
     */
    suspend fun refreshFromServer(): RemoteWorkspaceSnapshot? = withContext(Dispatchers.IO) {
        val client = api ?: return@withContext null
        runCatching {
            val snapshot = client.getWorkspace()
            if (snapshot.orders.isNotEmpty()) {
                dao.clearAllOrders()
                dao.insertOrders(snapshot.orders.map { it.toEntity() })
            } else {
                val localSnapshot = dao.getOrdersSnapshot()
                if (localSnapshot.isNotEmpty()) {
                    client.upsertOrders(localSnapshot)
                }
            }
            snapshot
        }.getOrNull()
    }

    suspend fun ensureSeeded(): RemoteWorkspaceSnapshot? = withContext(Dispatchers.IO) {
        if (dao.getOrdersCount() == 0) {
            dao.insertOrders(SeedData.defaultOrders())
        }
        refreshFromServer()
    }

    suspend fun insertOrder(order: ShippingOrder) = withContext(Dispatchers.IO) {
        val entity = order.toEntity(order.timestampMillis)
        dao.insertOrder(entity)
        pushOrders(listOf(entity))
    }

    suspend fun updateOrderStatus(orderId: String, status: OrderStatus) = withContext(Dispatchers.IO) {
        dao.updateOrderStatus(orderId, status.name)
        api?.let { runCatching { it.updateStatus(orderId, status.name) } }
        Unit
    }

    suspend fun deleteOrder(orderId: String) = withContext(Dispatchers.IO) {
        dao.deleteOrderById(orderId)
        api?.let { runCatching { it.deleteOrder(orderId) } }
        Unit
    }

    suspend fun performCheckIn(
        branchName: String,
        userName: String = "Alex Nguyễn",
        coordinates: String = "21.0358° N, 105.8188° E"
    ): CheckInApiResponse? = withContext(Dispatchers.IO) {
        val client = api ?: return@withContext null
        runCatching { client.performCheckIn(branchName, userName, coordinates) }.getOrNull()
    }

    suspend fun resetToDefaultSeed(): RemoteWorkspaceSnapshot? = withContext(Dispatchers.IO) {
        val remote = api?.let { runCatching { it.resetWorkspace() }.getOrNull() }
        dao.clearAllOrders()
        if (remote != null && remote.orders.isNotEmpty()) {
            dao.insertOrders(remote.orders.map { it.toEntity() })
        } else {
            dao.insertOrders(SeedData.defaultOrders())
        }
        remote
    }
}
