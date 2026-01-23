'use server';

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { couponRatelimit } from "@/lib/rate-limit";

export interface CouponActionResponse<T = unknown> {
    success: boolean;
    error?: string;
    coupon?: T;
    coupons?: T[];
}

// Admin: Create a new coupon
export async function createCouponAction(data: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderValue?: number;
    maxUses?: number;
    firstOrderOnly?: boolean;
    excludeSaleItems?: boolean;
    expiresAt?: Date;
}) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const coupon = await prisma.coupon.create({
            data: {
                code: data.code.toUpperCase(),
                discountType: data.discountType,
                discountValue: data.discountValue,
                minOrderValue: data.minOrderValue || null,
                maxUses: data.maxUses || null,
                firstOrderOnly: data.firstOrderOnly || false,
                excludeSaleItems: data.excludeSaleItems !== undefined ? data.excludeSaleItems : true,
                expiresAt: data.expiresAt || null,
            }
        });

        return {
            success: true,
            coupon: {
                ...coupon,
                discountValue: Number(coupon.discountValue),
                minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null
            }
        };
    } catch (error) {
        console.error("Create coupon error:", error);
        return { success: false, error: "Failed to create coupon. Code might already exist." };
    }
}

// Admin: Get all coupons
export async function getAllCouponsAction() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const formattedCoupons = coupons.map(coupon => ({
            ...coupon,
            discountValue: Number(coupon.discountValue),
            minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null
        }));

        return { success: true, coupons: formattedCoupons };
    } catch (error) {
        console.error("Get coupons error:", error);
        return { success: false, error: "Failed to fetch coupons" };
    }
}

// Admin: Toggle coupon active status
export async function toggleCouponStatusAction(id: string) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        const coupon = await prisma.coupon.findUnique({ where: { id } });
        if (!coupon) return { success: false, error: "Coupon not found" };

        const updated = await prisma.coupon.update({
            where: { id },
            data: { isActive: !coupon.isActive }
        });

        return {
            success: true,
            coupon: {
                ...updated,
                discountValue: Number(updated.discountValue),
                minOrderValue: updated.minOrderValue ? Number(updated.minOrderValue) : null
            }
        };
    } catch (error) {
        console.error("Toggle coupon error:", error);
        return { success: false, error: "Failed to update coupon" };
    }
}

// Admin: Delete coupon
export async function deleteCouponAction(id: string) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return { success: false, error: "Unauthorized" };

        await prisma.coupon.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Delete coupon error:", error);
        return { success: false, error: "Failed to delete coupon" };
    }
}

// User: Validate and apply coupon
export async function validateCouponAction(
    code: string,
    orderTotal: number,
    cartItems?: { product?: { isOnSale: boolean } }[]
) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

        const { success } = await couponRatelimit.limit(userId);
        if (!success) {
            return {
                success: false,
                error: `Too many attempts. Please try again later.`
            };
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                usages: {
                    where: { userId }
                }
            }
        });

        if (!coupon) {
            return { success: false, error: "Invalid coupon code" };
        }

        if (!coupon.isActive) {
            return { success: false, error: "This coupon is no longer active" };
        }

        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return { success: false, error: "This coupon has expired" };
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return { success: false, error: "This coupon has reached its usage limit" };
        }

        if (coupon.usages.length > 0) {
            return { success: false, error: "You've already used this coupon" };
        }

        if (coupon.firstOrderOnly) {
            const previousOrders = await prisma.order.count({
                where: { userId }
            });

            if (previousOrders > 0) {
                return { success: false, error: "This coupon is only for first-time customers" };
            }
        }

        if (coupon.excludeSaleItems && cartItems && cartItems.length > 0) {
            const hasSaleItems = cartItems.some((item) => item.product?.isOnSale);
            if (hasSaleItems) {
                return {
                    success: false,
                    error: "This coupon cannot be applied to products already on sale"
                };
            }
        }

        const minOrderValue = coupon.minOrderValue ? Number(coupon.minOrderValue) : 0;
        if (minOrderValue > 0 && orderTotal < minOrderValue) {
            return {
                success: false,
                error: `Minimum order value of ₹${minOrderValue.toFixed(2)} required`
            };
        }

        let discount = 0;
        const discountValue = Number(coupon.discountValue);
        if (coupon.discountType === 'PERCENTAGE') {
            discount = (orderTotal * discountValue) / 100;
        } else {
            discount = discountValue;
        }

        discount = Math.min(discount, orderTotal);

        return {
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: discountValue,
                discount: discount
            }
        };
    } catch (error) {
        console.error("Validate coupon error:", error);
        return { success: false, error: "Failed to validate coupon" };
    }
}
