'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

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

export async function getProductsAction() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, products };
    } catch (error) {
        return { success: false, error: "Failed to fetch products" };
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

export async function getOrdersAction() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const orders = await prisma.order.findMany({
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, orders };
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        return { success: false, error: "Failed to fetch orders" };
    }
}

export async function updateOrderStatusAction(orderId: string, status: string, trackingNumber?: string) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const updateData: any = { status };

        // Auto-generate tracking number if shipping and not provided
        if (status === 'SHIPPED' && !trackingNumber) {
            // numeric timestamp + random suffix
            const timestamp = Date.now().toString().slice(-6);
            updateData.trackingNumber = `TRK-${orderId.slice(0, 4).toUpperCase()}-${timestamp}`;
        } else if (trackingNumber) {
            updateData.trackingNumber = trackingNumber;
        }

        const order = await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });
        revalidatePath('/admin/orders');
        revalidatePath('/orders');
        return { success: true, order };
    } catch (error) {
        console.error("Update Order Error:", error);
        return { success: false, error: "Failed to update order status" };
    }
}
