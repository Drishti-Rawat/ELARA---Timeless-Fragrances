'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";

// --- Categories ---

export async function createCategoryAction(formData: FormData) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const name = formData.get('name') as string;
        // Image handling would typically involve uploading to a storage service (S3/Supabase Storage)
        // For now we will accept a URL string or leave it blank
        const image = formData.get('image') as string || null;

        if (!name) return { success: false, error: "Name is required" };

        const category = await prisma.category.create({
            data: { name, image }
        });

        revalidatePath('/admin');
        return { success: true, category };
    } catch (error) {
        console.error("Create Category Error:", error);
        return { success: false, error: "Failed to create category" };
    }
}

export async function getCategoriesAction() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
        return { success: true, categories };
    } catch (error) {
        return { success: false, error: "Failed to fetch categories" };
    }
}

// --- Products ---

export async function createProductAction(formData: FormData) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string);
        const categoryId = formData.get('categoryId') as string;
        const stock = parseInt(formData.get('stock') as string) || 0;
        const sku = formData.get('sku') as string || undefined;
        // Simple image URL handling for now
        const imageUrl = formData.get('imageUrl') as string;
        const gender = (formData.get('gender') as "MEN" | "WOMEN" | "UNISEX") || "UNISEX";

        if (!name || !price || !categoryId) {
            return { success: false, error: "Missing required fields" };
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                sku,
                categoryId,
                images: imageUrl ? [imageUrl] : [],
                gender
            }
        });

        revalidatePath('/admin');
        return { success: true, product };
    } catch (error) {
        console.error("Create Product Error:", error);
        return { success: false, error: "Failed to create product" };
    }
}

export async function getProductsAction(page: number = 1, limit: number = 10) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                include: { category: true },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: skip
            }),
            prisma.product.count()
        ]);

        return {
            success: true,
            products,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page,
                limit
            }
        };
    } catch (error) {
        return { success: false, error: "Failed to fetch products" };
    }
}

export async function updateProductAction(formData: FormData) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const id = formData.get('id') as string;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string);
        const stock = parseInt(formData.get('stock') as string);
        const isOnSale = formData.get('isOnSale') === 'on';
        const salePercentage = parseFloat(formData.get('salePercentage') as string) || 0;
        const saleEndDateRaw = formData.get('saleEndDate') as string;

        // Optional fields handling if partially updating (or assume form sends current values)
        // For simple restocking, we expect at least stock and id. But let's handle full update for safety.

        let data: any = { stock };
        if (name) data.name = name;
        if (description) data.description = description;
        if (!isNaN(price)) data.price = price;
        data.isOnSale = isOnSale;
        data.salePercentage = salePercentage;
        data.saleEndDate = saleEndDateRaw ? new Date(saleEndDateRaw) : null;

        await prisma.product.update({
            where: { id },
            data
        });

        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update product" };
    }
}

// --- Users ---

export async function getUsersAction() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const users = await prisma.user.findMany({
            where: {
                role: { not: 'ADMIN' }
            },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { orders: true } } }
        });
        return { success: true, users };
    } catch (error) {
        console.error("Fetch Users Error:", error);
        return { success: false, error: "Failed to fetch users" };
    }
}

// --- Orders ---

export async function getOrdersAction(page: number = 1, limit: number = 10, filter: 'active' | 'history' | 'all' = 'active') {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const skip = (page - 1) * limit;

        let whereClause: any = {};
        if (filter === 'active') {
            whereClause.status = { notIn: ['DELIVERED', 'CANCELLED'] };
        } else if (filter === 'history') {
            whereClause.status = { in: ['DELIVERED', 'CANCELLED'] };
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: whereClause,
                include: {
                    user: { select: { name: true, email: true } },
                    items: { include: { product: true } },
                    deliveryAgent: { select: { id: true, name: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: skip
            }),
            prisma.order.count({ where: whereClause })
        ]);

        return {
            success: true,
            orders,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page,
                limit
            }
        };
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        return { success: false, error: "Failed to fetch orders" };
    }
}

export async function promoteToAgentAction(email: string) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return { success: false, error: "User not found" };

        await prisma.user.update({
            where: { email },
            data: { role: 'DELIVERY_AGENT' }
        });

        revalidatePath('/admin/agents');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to promote user" };
    }
}

// --- Agents ---

export async function getDeliveryAgentsAction() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const agents = await prisma.user.findMany({
            where: { role: 'DELIVERY_AGENT' },
            select: { id: true, name: true, email: true, phone: true, isAvailable: true }
        });
        return { success: true, agents };
    } catch (error) {
        return { success: false, error: "Failed to fetch agents" };
    }
}

export async function assignAgentToOrderAction(orderId: string, agentId: string) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        await prisma.order.update({
            where: { id: orderId },
            data: { deliveryAgentId: agentId },
        });

        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to assign agent" };
    }
}

export async function updateOrderStatusAction(orderId: string, status: string, trackingNumber?: string) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const updateData: any = { status };

        // Auto-generate tracking number if shipping and not provided
        if (status === 'SHIPPED') {
            if (!trackingNumber) {
                // numeric timestamp + random suffix
                const timestamp = Date.now().toString().slice(-6);
                updateData.trackingNumber = `TRK-${orderId.slice(0, 4).toUpperCase()}-${timestamp}`;
            }

            // Generate OTP immediately when Shipped (or Handed Over)
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            updateData.deliveryOtp = otp;

            // Mock Notification
            console.log(`[NOTIFICATION] Order ${orderId} SHIPPED. OTP sent to customer: ${otp}`);
        } else if (trackingNumber) {
            updateData.trackingNumber = trackingNumber;
        }

        // Logic Flaw Fix: Restore stock if Admin cancels the order
        if (status === 'CANCELLED') {
            const existingOrder = await prisma.order.findUnique({
                where: { id: orderId },
                include: { items: true }
            });

            // Only restore if not already cancelled
            if (existingOrder && existingOrder.status !== 'CANCELLED') {
                for (const item of existingOrder.items) {
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    });
                }
            }
        }

        const order = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: { user: true }
        });

        // Send Email if Shipped
        if (status === 'SHIPPED' && updateData.deliveryOtp) {
            await sendEmail({
                to: order.user.email,
                subject: `Your Order #${orderId.slice(0, 8)} has been Shipped!`,
                html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h1>Order Shipped</h1>
                    <p>Your order is on its way. Use the following OTP when the agent arrives:</p>
                    <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 24px; letter-spacing: 5px; font-weight: bold;">${updateData.deliveryOtp}</span>
                    </div>
                </div>
                `
            });
        }

        revalidatePath('/admin/orders');
        revalidatePath('/orders');
        revalidatePath('/delivery');
        return { success: true, order };
    } catch (error) {
        console.error("Update Order Error:", error);
        return { success: false, error: "Failed to update order status" };
    }
}


