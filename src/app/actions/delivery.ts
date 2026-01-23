'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/email';

export async function getAssignedOrders() {
    const session = await getSession();
    if (!session || session.role !== 'DELIVERY_AGENT') {
        return [];
    }

    const [orders, agent] = await Promise.all([
        prisma.order.findMany({
            where: {
                deliveryAgentId: session.userId,
                status: {
                    in: ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'],
                },
            },
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        }),
        prisma.user.findUnique({
            where: { id: session.userId },
            select: { id: true, name: true, email: true, phone: true, vehicleDetails: true }
        })
    ]);

    return { orders, agent };
}

export async function updateAgentProfileAction(phone: string, vehicleDetails?: string) {
    const session = await getSession();
    if (!session || session.role !== 'DELIVERY_AGENT') {
        throw new Error('Unauthorized');
    }

    await prisma.user.update({
        where: { id: session.userId },
        data: { phone, vehicleDetails }
    });

    revalidatePath('/delivery');
    return { success: true };
}

export async function markAsOutForDelivery(orderId: string) {
    const session = await getSession();
    if (!session || session.role !== 'DELIVERY_AGENT') {
        throw new Error('Unauthorized');
    }

    // Check if order belongs to agent
    // Check if order belongs to agent
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
    });

    if (!order || order.deliveryAgentId !== session.userId) {
        throw new Error('Order not found or not assigned to you');
    }

    // Generate OTP only if not already present
    let otp = order.deliveryOtp;
    if (!otp) {
        otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP

        // Update Order with new Status and OTP
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'OUT_FOR_DELIVERY',
                deliveryOtp: otp,
            },
        });

        const { getDeliveryOTPEmail } = await import('@/lib/emailTemplates');

        // ... inside markAsOutForDelivery

        await sendEmail({
            to: order.user.email,
            subject: `Out for Delivery - ELARA Order #${orderId.slice(0, 8)}`,
            html: getDeliveryOTPEmail({
                userName: order.user.name || 'Valued Customer',
                orderId: orderId.slice(0, 8).toUpperCase(),
                otp
            })
        });
    } else {
        // Just update status
        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'OUT_FOR_DELIVERY' },
        });

        // Resend with nice template
        const { getDeliveryOTPEmail } = await import('@/lib/emailTemplates');
        await sendEmail({
            to: order.user.email,
            subject: `Reminder: Your Order #${orderId.slice(0, 8)} is Out for Delivery!`,
            html: getDeliveryOTPEmail({
                userName: order.user.name || 'Valued Customer',
                orderId: orderId.slice(0, 8).toUpperCase(),
                otp
            })
        });
    }

    revalidatePath('/delivery');
    return { success: true, message: 'Order status updated. OTP sent to customer.' };
}

export async function completeDelivery(orderId: string, otp: string) {
    const session = await getSession();
    if (!session || session.role !== 'DELIVERY_AGENT') {
        throw new Error('Unauthorized');
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
    });

    if (!order || order.deliveryAgentId !== session.userId) {
        throw new Error('Order not found or not assigned to you');
    }

    if (order.status !== 'OUT_FOR_DELIVERY') {
        throw new Error('Order must be Out for Delivery before completing');
    }

    if (order.deliveryOtp !== otp) {
        return { success: false, message: 'Invalid OTP' };
    }

    // Calculate Commission (Mock: 5% of subtotal or flat 50)
    const commission = 50; // Flat fee for simplicity

    await prisma.$transaction(async (tx) => {
        // 1. Update Order
        await tx.order.update({
            where: { id: orderId },
            data: {
                status: 'DELIVERED',
                deliveryOtp: null, // Clear OTP
                agentCommission: commission,
            },
        });

        // 2. We could update agent balance here if we had a wallet model
    });

    const { getOrderDeliveredEmail } = await import('@/lib/emailTemplates');
    await sendEmail({
        to: order.user.email,
        subject: `Order Delivered - ELARA #${orderId.slice(0, 8)}`,
        html: getOrderDeliveredEmail({
            userName: order.user.name || 'Valued Customer',
            orderId: orderId.slice(0, 8).toUpperCase()
        })
    });

    revalidatePath('/delivery');
    return { success: true, message: 'Order delivered successfully!' };
}
