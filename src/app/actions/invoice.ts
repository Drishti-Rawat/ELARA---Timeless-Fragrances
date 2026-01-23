'use server';

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function generateInvoiceDataAction(orderId: string) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                items: {
                    include: {
                        product: {
                            select: { name: true, price: true, sku: true }
                        }
                    }
                }
            }
        });

        if (!order || (order.userId !== userId && session.role !== 'ADMIN')) {
            return { success: false, error: "Order not found or unauthorized" };
        }

        // Format invoice data
        const invoiceData = {
            invoiceNumber: `INV-${order.id.slice(0, 8).toUpperCase()}`,
            orderNumber: order.id.slice(0, 8).toUpperCase(),
            date: new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            customer: {
                name: order.user.name || 'Customer',
                email: order.user.email,
                address: order.deliveryAddress as { street: string; city: string; state: string; zip: string } | null
            },
            items: order.items.map(item => ({
                name: item.product.name,
                sku: item.product.sku || 'N/A',
                quantity: item.quantity,
                price: Number(item.price),
                total: Number(item.price) * item.quantity
            })),
            subtotal: Number(order.subtotal),
            discount: Number(order.discount),
            couponCode: order.couponCode,
            total: Number(order.total),
            status: order.status,
            trackingNumber: order.trackingNumber
        };

        return { success: true, invoice: invoiceData };
    } catch (error) {
        console.error("Generate invoice error:", error);
        return { success: false, error: "Failed to generate invoice" };
    }
}
