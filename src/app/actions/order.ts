import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function cancelOrderAction(orderId: string) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

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
