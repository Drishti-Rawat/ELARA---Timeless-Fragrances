'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getShopProducts(params?: {
    categoryId?: string,
    gender?: string,
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    page?: number,
    limit?: number
}) {
    try {
        const page = params?.page || 1;
        const limit = params?.limit || 9;
        const skip = (page - 1) * limit;

        const where: any = { isArchived: false };

        if (params?.categoryId) where.categoryId = params.categoryId;
        if (params?.gender && params.gender !== 'ALL') where.gender = params.gender;
        if (params?.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } }
            ];
        }

        if (params?.minPrice !== undefined || params?.maxPrice !== undefined) {
            where.price = {};
            if (params.minPrice !== undefined) where.price.gte = params.minPrice;
            if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
                reviews: {
                    select: { rating: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        // Calculate average rating for each product
        const productsWithRatings = products.map(product => {
            const avgRating = product.reviews.length > 0
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                : 0;

            return {
                ...product,
                averageRating: avgRating,
                reviewCount: product.reviews.length,
                reviews: undefined // Remove reviews array from response
            };
        });

        return { success: true, products: productsWithRatings };

    } catch (error) {
        console.error("Shop Fetch Error:", error);
        return { success: false, error: "Failed to load products" };
    }
}

export async function getProductDetails(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                reviews: {
                    include: { user: { select: { name: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!product) return { success: false, error: "Product not found" };

        // Fetch similar products (same category, excluding current)
        const similar = await prisma.product.findMany({
            where: {
                categoryId: product.categoryId,
                id: { not: product.id },
                isArchived: false
            },
            take: 4
        });

        return { success: true, product, similar };

    } catch (error) {
        console.error("Product Detail Error:", error);
        return { success: false, error: "Failed to load product" };
    }
}

export async function addToCartAction(userId: string, productId: string, quantity: number) {
    try {
        // Find or create cart
        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        // Check if item exists in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId }
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        } else {
            await prisma.cartItem.create({
                data: { cartId: cart.id, productId, quantity }
            });
        }

        revalidatePath('/cart');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to add to cart" };
    }
}

export async function toggleWishlistAction(userId: string, productId: string) {
    try {
        let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
            wishlist = await prisma.wishlist.create({ data: { userId } });
        }

        const existingItem = await prisma.wishlistItem.findUnique({
            where: { wishlistId_productId: { wishlistId: wishlist.id, productId } }
        });

        if (existingItem) {
            await prisma.wishlistItem.delete({ where: { id: existingItem.id } });
            return { success: true, added: false };
        } else {
            await prisma.wishlistItem.create({
                data: { wishlistId: wishlist.id, productId }
            });
            return { success: true, added: true };
        }
    } catch (error) {
        return { success: false, error: "Failed to update wishlist" };
    }
}

export async function submitReviewAction(userId: string, productId: string, rating: number, comment: string) {
    try {
        await prisma.review.create({
            data: { userId, productId, rating, comment }
        });
        revalidatePath(`/shop/${productId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to submit review" };
    }
}

export async function getCartAction(userId: string) {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: true },
                    orderBy: { id: 'asc' } // Changed from createdAt to id (stable sort) as CartItem might not have createdAt
                }
            }
        });
        return { success: true, cart };
    } catch (error) {
        return { success: false, error: "Failed to load cart" };
    }
}

export async function updateCartItemAction(itemId: string, quantity: number) {
    try {
        if (quantity <= 0) {
            await prisma.cartItem.delete({ where: { id: itemId } });
        } else {
            await prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity }
            });
        }
        revalidatePath('/cart');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update cart" };
    }
}

export async function placeOrderAction(
    userId: string,
    total: number,
    items: any[],
    deliveryAddress: any,
    couponCode?: string,
    subtotal?: number,
    discount?: number
) {
    try {
        // Auto-generate tracking number
        const timestamp = Date.now().toString().slice(-6);
        const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random
        const trackingNumber = `TRK-${timestamp}-${randomSuffix}`;

        // 1. Transaction to ensure stock and order integrity
        await prisma.$transaction(async (tx) => {
            // Create Order
            const orderItems = [];
            for (const item of items) {
                // Fetch fresh product data to get current price and sale status
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { price: true, isOnSale: true, salePercentage: true }
                });

                if (!product) throw new Error(`Product ${item.productId} not found`);

                let finalPrice = Number(product.price);
                if (product.isOnSale) {
                    finalPrice = finalPrice * (1 - product.salePercentage / 100);
                }

                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: finalPrice
                });
            }

            const order = await tx.order.create({
                data: {
                    userId,
                    subtotal: subtotal || total,
                    discount: discount || 0,
                    total: total,
                    couponCode: couponCode || null,
                    status: 'PENDING',
                    trackingNumber: trackingNumber,
                    deliveryAddress: deliveryAddress, // Store snapshot
                    items: {
                        create: orderItems
                    }
                }
            });

            // Decrease Stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // Clear Cart
            const cart = await tx.cart.findUnique({ where: { userId } });
            if (cart) {
                await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            }

            // Track coupon usage if coupon was applied
            if (couponCode) {
                // Increment global usage count
                await tx.coupon.update({
                    where: { code: couponCode },
                    data: { usedCount: { increment: 1 } }
                });

                // Create usage record for this user
                await tx.couponUsage.create({
                    data: {
                        couponId: (await tx.coupon.findUnique({ where: { code: couponCode }, select: { id: true } }))!.id,
                        userId,
                        orderId: order.id
                    }
                });
            }
        });

        revalidatePath('/cart');
        revalidatePath('/orders');
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error("Place Order Error:", error);
        return { success: false, error: "Failed to place order" };
    }
}

export async function updateOrderAddressAction(orderId: string, userId: string, newAddress: any) {
    try {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.userId !== userId) {
            return { success: false, error: "Order not found" };
        }

        if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
            return { success: false, error: "Cannot change address for this order status" };
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { deliveryAddress: newAddress }
        });
        revalidatePath('/orders');
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update order address" };
    }
}

export async function getWishlistAction(userId: string, page: number = 1, limit: number = 9) {
    try {
        const skip = (page - 1) * limit;

        const wishlist = await prisma.wishlist.findUnique({
            where: { userId },
            include: {
                _count: {
                    select: { items: true }
                },
                items: {
                    include: { product: true },
                    skip,
                    take: limit
                }
            }
        });

        if (!wishlist) return { success: true, items: [], totalCount: 0, totalPages: 0 };

        return {
            success: true,
            items: wishlist.items,
            totalCount: wishlist._count.items,
            totalPages: Math.ceil(wishlist._count.items / limit)
        };
    } catch (error) {
        console.error("Wishlist fetch error:", error);
        return { success: false, error: "Failed to load wishlist" };
    }
}

export async function getUserOrdersAction(userId: string) {
    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, orders };
    } catch (error) {
        return { success: false, error: "Failed to fetch orders" };
    }
}
