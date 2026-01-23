'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { Gender } from "@prisma/client";

// Bulk apply sale to category
export async function bulkApplySaleByCategoryAction(
    categoryId: string,
    salePercentage: number,
    saleEndDate?: Date
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized", count: 0 };

        const result = await prisma.product.updateMany({
            where: { categoryId },
            data: {
                salePercentage,
                isOnSale: salePercentage > 0,
                saleEndDate: saleEndDate || null
            }
        });

        revalidatePath('/shop');
        revalidatePath('/admin/products');
        return { success: true, count: result.count };
    } catch (error) {
        console.error("Bulk sale by category error:", error);
        return { success: false, error: "Failed to apply sale", count: 0 };
    }
}

// Bulk apply sale by price range
export async function bulkApplySaleByPriceAction(
    minPrice: number,
    maxPrice: number,
    salePercentage: number,
    saleEndDate?: Date
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized", count: 0 };

        const result = await prisma.product.updateMany({
            where: {
                price: {
                    gte: minPrice,
                    lte: maxPrice
                }
            },
            data: {
                salePercentage,
                isOnSale: salePercentage > 0,
                saleEndDate: saleEndDate || null
            }
        });

        revalidatePath('/shop');
        revalidatePath('/admin/products');
        return { success: true, count: result.count };
    } catch (error) {
        console.error("Bulk sale by price error:", error);
        return { success: false, error: "Failed to apply sale", count: 0 };
    }
}

// Bulk apply sale by gender
export async function bulkApplySaleByGenderAction(
    gender: 'MEN' | 'WOMEN' | 'UNISEX',
    salePercentage: number,
    saleEndDate?: Date
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized", count: 0 };

        const result = await prisma.product.updateMany({
            where: { gender },
            data: {
                salePercentage,
                isOnSale: salePercentage > 0,
                saleEndDate: saleEndDate || null
            }
        });

        revalidatePath('/shop');
        revalidatePath('/admin/products');
        return { success: true, count: result.count };
    } catch (error) {
        console.error("Bulk sale by gender error:", error);
        return { success: false, error: "Failed to apply sale", count: 0 };
    }
}

// Bulk apply to selected products
export async function bulkApplySaleToProductsAction(
    productIds: string[],
    salePercentage: number,
    saleEndDate?: Date
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized", count: 0 };

        const result = await prisma.product.updateMany({
            where: {
                id: { in: productIds }
            },
            data: {
                salePercentage,
                isOnSale: salePercentage > 0,
                saleEndDate: saleEndDate || null
            }
        });

        revalidatePath('/shop');
        revalidatePath('/admin/products');
        return { success: true, count: result.count };
    } catch (error) {
        console.error("Bulk sale to products error:", error);
        return { success: false, error: "Failed to apply sale", count: 0 };
    }
}

// Clear all sales
export async function clearAllSalesAction() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized", count: 0 };

        const result = await prisma.product.updateMany({
            data: {
                salePercentage: 0,
                isOnSale: false
            }
        });

        revalidatePath('/shop');
        revalidatePath('/admin/products');
        return { success: true, count: result.count };
    } catch (error) {
        console.error("Clear sales error:", error);
        return { success: false, error: "Failed to clear sales", count: 0 };
    }
}

// Get products count by filter (for preview)
export async function getProductsCountByFilterAction(filter: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    gender?: 'MEN' | 'WOMEN' | 'UNISEX';
}) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized", count: 0 };

        const where: { categoryId?: string; gender?: Gender; price?: { gte?: number; lte?: number } } = {};

        if (filter.categoryId) where.categoryId = filter.categoryId;
        if (filter.gender) where.gender = filter.gender;
        if (filter.minPrice || filter.maxPrice) {
            where.price = {};
            if (filter.minPrice) where.price.gte = filter.minPrice;
            if (filter.maxPrice) where.price.lte = filter.maxPrice;
        }

        const count = await prisma.product.count({ where });
        return { success: true, count };
    } catch (error) {
        console.error("Get products count error:", error);
        return { success: false, count: 0 };
    }
}
