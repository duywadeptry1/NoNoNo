package com.example.data.remote

import com.example.BuildConfig
import com.example.data.local.entity.OrderEntity
import com.example.model.ActivityLogItem
import com.example.model.OrderStatus
import com.example.model.RemoteWorkspaceSnapshot
import com.example.model.ShippingOrder
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * ĐỊA CHỈ BACKEND – cấu hình qua .env / gradle.properties (API_BASE_URL).
 *  - Máy ảo (Android Emulator): "http://10.0.2.2:3000"
 *  - Điện thoại thật (LAN):     "http://<IPv4 máy tính>:3000"
 *  - Backend cloud:             "https://<your-app-url>"
 */
object ApiConfig {
    val BASE_URL: String = BuildConfig.API_BASE_URL
}

data class CheckInApiResponse(
    val isCheckedInToday: Boolean,
    val attendanceCount: Int,
    val activeBranch: String,
    val activities: List<ActivityLogItem>
)

/** Gọi backend (Node + MongoDB). Các hàm này chạy blocking, hãy gọi trong Dispatchers.IO. */
class OrderApi(private val baseUrl: String = ApiConfig.BASE_URL) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private val jsonType = "application/json; charset=utf-8".toMediaType()

    fun getWorkspace(): RemoteWorkspaceSnapshot {
        val request = Request.Builder().url("$baseUrl/api/workspace").get().build()
        client.newCall(request).execute().use { res ->
            check(res.isSuccessful) { "GET /api/workspace lỗi ${res.code}" }
            val body = JSONObject(res.body?.string() ?: "{}")
            return parseWorkspace(body)
        }
    }

    fun getOrders(): List<OrderEntity> {
        val request = Request.Builder().url("$baseUrl/orders").get().build()
        client.newCall(request).execute().use { res ->
            check(res.isSuccessful) { "GET /orders lỗi ${res.code}" }
            val arr = JSONArray(res.body?.string() ?: "[]")
            return (0 until arr.length()).map { orderEntityFromJson(arr.getJSONObject(it)) }
        }
    }

    fun upsertOrders(orders: List<OrderEntity>) {
        if (orders.isEmpty()) return
        val body = JSONArray().apply { orders.forEach { put(toJson(it)) } }
            .toString().toRequestBody(jsonType)
        val request = Request.Builder().url("$baseUrl/orders/bulk").post(body).build()
        client.newCall(request).execute().use { check(it.isSuccessful) { "POST /orders/bulk lỗi ${it.code}" } }
    }

    fun updateStatus(id: String, statusName: String) {
        val body = JSONObject().put("statusName", statusName).toString().toRequestBody(jsonType)
        val request = Request.Builder().url("$baseUrl/orders/$id/status").patch(body).build()
        client.newCall(request).execute().use { check(it.isSuccessful) { "PATCH lỗi ${it.code}" } }
    }

    fun deleteOrder(id: String) {
        val request = Request.Builder().url("$baseUrl/orders/$id").delete().build()
        client.newCall(request).execute().use { check(it.isSuccessful) { "DELETE lỗi ${it.code}" } }
    }

    fun performCheckIn(
        branchName: String,
        userName: String = "Alex Nguyễn",
        coordinates: String = "21.0358° N, 105.8188° E"
    ): CheckInApiResponse {
        val payload = JSONObject().apply {
            put("branchName", branchName)
            put("userName", userName)
            put("coordinates", coordinates)
        }.toString().toRequestBody(jsonType)
        val request = Request.Builder().url("$baseUrl/api/checkin").post(payload).build()
        client.newCall(request).execute().use { res ->
            check(res.isSuccessful) { "POST /api/checkin lỗi ${res.code}" }
            val json = JSONObject(res.body?.string() ?: "{}")
            return CheckInApiResponse(
                isCheckedInToday = json.optBoolean("isCheckedInToday", true),
                attendanceCount = json.optInt("attendanceCount", 125),
                activeBranch = json.optString("activeBranch", branchName),
                activities = parseActivities(json.optJSONArray("activities"))
            )
        }
    }

    fun resetWorkspace(): RemoteWorkspaceSnapshot {
        val body = "{}".toRequestBody(jsonType)
        val request = Request.Builder().url("$baseUrl/api/workspace/reset").post(body).build()
        client.newCall(request).execute().use { res ->
            check(res.isSuccessful) { "POST /api/workspace/reset lỗi ${res.code}" }
            return parseWorkspace(JSONObject(res.body?.string() ?: "{}"))
        }
    }

    private fun parseWorkspace(json: JSONObject): RemoteWorkspaceSnapshot {
        val ordersArr = json.optJSONArray("orders") ?: JSONArray()
        val orders = (0 until ordersArr.length()).map {
            domainOrderFromJson(ordersArr.getJSONObject(it))
        }
        return RemoteWorkspaceSnapshot(
            orders = orders,
            activities = parseActivities(json.optJSONArray("activities")),
            isCheckedInToday = json.optBoolean("isCheckedInToday", false),
            attendanceCount = json.optInt("attendanceCount", 124),
            activeBranch = json.optString("activeBranch", "Trụ sở Hà Nội"),
            databaseMode = json.optString("databaseMode", "memory-fallback")
        )
    }

    private fun parseActivities(arr: JSONArray?): List<ActivityLogItem> {
        if (arr == null) return emptyList()
        return (0 until arr.length()).map { idx ->
            val obj = arr.getJSONObject(idx)
            ActivityLogItem(
                id = obj.optString("id", "ACT-$idx"),
                type = obj.optString("type", "SYSTEM"),
                title = obj.optString("title"),
                description = obj.optString("description"),
                timestamp = obj.optString("timestamp"),
                timestampMillis = obj.optLong("timestampMillis", System.currentTimeMillis())
            )
        }
    }

    private fun toJson(o: OrderEntity) = JSONObject().apply {
        put("id", o.id)
        put("trackingNumber", o.trackingNumber)
        put("senderName", o.senderName)
        put("senderAddress", o.senderAddress)
        put("recipientName", o.recipientName)
        put("recipientAddress", o.recipientAddress)
        put("status", o.statusName)
        put("statusName", o.statusName)
        put("serviceType", o.serviceType)
        put("feeVnd", o.feeVnd)
        put("codVnd", o.codVnd)
        put("createdAt", o.createdAt)
        put("estimatedDelivery", o.estimatedDelivery)
        put("weightKg", o.weightKg.toDouble())
        put("timestampMillis", o.timestampMillis)
    }

    private fun orderEntityFromJson(j: JSONObject): OrderEntity {
        val rawStatus = j.optString("statusName").ifBlank { j.optString("status", "PENDING") }
        return OrderEntity(
            id = j.getString("id"),
            trackingNumber = j.optString("trackingNumber"),
            senderName = j.optString("senderName"),
            senderAddress = j.optString("senderAddress"),
            recipientName = j.optString("recipientName"),
            recipientAddress = j.optString("recipientAddress"),
            statusName = rawStatus,
            serviceType = j.optString("serviceType"),
            feeVnd = j.optLong("feeVnd"),
            codVnd = j.optLong("codVnd"),
            createdAt = j.optString("createdAt"),
            estimatedDelivery = j.optString("estimatedDelivery"),
            weightKg = j.optDouble("weightKg", 1.0).toFloat(),
            timestampMillis = j.optLong("timestampMillis", System.currentTimeMillis())
        )
    }

    private fun domainOrderFromJson(j: JSONObject): ShippingOrder {
        val rawStatus = j.optString("status").ifBlank { j.optString("statusName", "PENDING") }
        val status = runCatching { OrderStatus.valueOf(rawStatus.uppercase()) }
            .getOrDefault(OrderStatus.PENDING)
        return ShippingOrder(
            id = j.getString("id"),
            trackingNumber = j.optString("trackingNumber"),
            senderName = j.optString("senderName"),
            senderAddress = j.optString("senderAddress"),
            recipientName = j.optString("recipientName"),
            recipientAddress = j.optString("recipientAddress"),
            status = status,
            serviceType = j.optString("serviceType"),
            feeVnd = j.optLong("feeVnd"),
            codVnd = j.optLong("codVnd"),
            createdAt = j.optString("createdAt"),
            estimatedDelivery = j.optString("estimatedDelivery"),
            weightKg = j.optDouble("weightKg", 1.0).toFloat(),
            timestampMillis = j.optLong("timestampMillis", System.currentTimeMillis())
        )
    }
}
