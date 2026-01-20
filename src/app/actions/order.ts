'use server';

import { prisma } from "@/lib/prisma";

export async function cancelOrderAction(orderId: string, userId: string) {
    try {
        // Verify order belongs to user
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: userId
            }
        });

        if (!order) {
            return { success: false, error: "Order not found" };
        }

        // Only allow cancellation for PENDING or PROCESSING orders
        if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
            return { success: false, error: "Cannot cancel order that is already shipped or delivered" };
        }

        // Update order status to CANCELLED
        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' }
        });

        // Optionally: Restore stock for cancelled items
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId },
            include: { product: true }
        });

        for (const item of orderItems) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        increment: item.quantity
                    }
                }
            });
        }

        return { success: true, message: "Order cancelled successfully" };
    } catch (error) {
        console.error("Cancel order error:", error);
        return { success: false, error: "Failed to cancel order" };
    }
}
