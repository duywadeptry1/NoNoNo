package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.model.OrderStatus
import com.example.model.ShippingOrder

@Entity(tableName = "orders")
data class OrderEntity(
    @PrimaryKey val id: String,
    val trackingNumber: String,
    val senderName: String,
    val senderAddress: String,
    val recipientName: String,
    val recipientAddress: String,
    val statusName: String,
    val serviceType: String,
    val feeVnd: Long,
    val codVnd: Long,
    val createdAt: String,
    val estimatedDelivery: String,
    val weightKg: Float,
    val timestampMillis: Long = System.currentTimeMillis()
) {
    fun toDomain(): ShippingOrder {
        val status = runCatching { OrderStatus.valueOf(statusName.uppercase()) }
            .getOrDefault(OrderStatus.PENDING)
        return ShippingOrder(
            id = id,
            trackingNumber = trackingNumber,
            senderName = senderName,
            senderAddress = senderAddress,
            recipientName = recipientName,
            recipientAddress = recipientAddress,
            status = status,
            serviceType = serviceType,
            feeVnd = feeVnd,
            codVnd = codVnd,
            createdAt = createdAt,
            estimatedDelivery = estimatedDelivery,
            weightKg = weightKg,
            timestampMillis = timestampMillis
        )
    }
}

fun ShippingOrder.toEntity(timestampMillis: Long = this.timestampMillis): OrderEntity {
    return OrderEntity(
        id = id,
        trackingNumber = trackingNumber,
        senderName = senderName,
        senderAddress = senderAddress,
        recipientName = recipientName,
        recipientAddress = recipientAddress,
        statusName = status.name,
        serviceType = serviceType,
        feeVnd = feeVnd,
        codVnd = codVnd,
        createdAt = createdAt,
        estimatedDelivery = estimatedDelivery,
        weightKg = weightKg,
        timestampMillis = timestampMillis
    )
}
