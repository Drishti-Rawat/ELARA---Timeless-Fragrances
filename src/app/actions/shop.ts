'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";

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

        // Fetch user session for wishlist status
        const session = await getSession();
        let wishlistedProductIds = new Set<string>();

        if (session?.userId) {
            const wishlist = await prisma.wishlist.findUnique({
                where: { userId: session.userId },
                include: { items: { select: { productId: true } } }
            });
            if (wishlist) {
                wishlistedProductIds = new Set(wishlist.items.map(item => item.productId));
            }
        }

        // Calculate average rating for each product and add wishlist status
        const productsWithRatings = products.map(product => {
            const avgRating = product.reviews.length > 0
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                : 0;

            return {
                ...product,
                price: Number(product.price),
                averageRating: avgRating,
                reviewCount: product.reviews.length,
                reviews: undefined, // Remove reviews array from response
                isInWishlist: wishlistedProductIds.has(product.id)
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
        const session = await getSession();
        const userId = session?.userId;

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

        let isWishlisted = false;
        if (userId) {
            const wishlist = await prisma.wishlist.findUnique({
                where: { userId },
                include: { items: { where: { productId: id } } }
            });
            if (wishlist && wishlist.items.length > 0) {
                isWishlisted = true;
            }
        }

        // Fetch similar products (same category, excluding current)
        const similar = await prisma.product.findMany({
            where: {
                categoryId: product.categoryId,
                id: { not: product.id },
                isArchived: false
            },
            take: 4
        });

        return {
            success: true,
            product: { ...product, price: Number(product.price) },
            similar: similar.map(p => ({ ...p, price: Number(p.price) })),
            isWishlisted
        };

    } catch (error) {
        console.error("Product Detail Error:", error);
        return { success: false, error: "Failed to load product" };
    }
}

export async function addToCartAction(productId: string, quantity: number) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

        // Find or create cart
        const [existingCart, user] = await Promise.all([
            prisma.cart.findUnique({ where: { userId } }),
            prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } })
        ]);

        let cart = existingCart;
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

export async function toggleWishlistAction(productId: string) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

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

export async function submitReviewAction(productId: string, rating: number, comment: string) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

        await prisma.review.create({
            data: { userId, productId, rating, comment }
        });
        revalidatePath(`/shop/${productId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to submit review" };
    }
}

export async function getCartAction() {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

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
    total: number,
    items: any[],
    deliveryAddress: any,
    couponCode?: string,
    subtotal?: number,
    discount?: number
) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;
        // Auto-generate tracking number
        const timestamp = Date.now().toString().slice(-6);
        const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random
        const trackingNumber = `TRK-${timestamp}-${randomSuffix}`;

        // Fetch user for email notification
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true }
        });

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

            // Decrease Stock (Safe Atomic Update)
            for (const item of items) {
                const updated = await tx.product.updateMany({
                    where: {
                        id: item.productId,
                        stock: { gte: item.quantity }
                    },
                    data: { stock: { decrement: item.quantity } }
                });

                if (updated.count === 0) {
                    throw new Error(`Product ${item.productId} is out of stock`);
                }
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

        // Send Confirmation Email
        if (user && user.email) {
            const { getOrderConfirmationEmail } = await import('@/lib/emailTemplates');

            await sendEmail({
                to: user.email,
                subject: `Order Confirmed - ELARA #${trackingNumber}`,
                html: getOrderConfirmationEmail({
                    userName: user.name || 'Valued Customer',
                    orderId: trackingNumber, // Display tracking number as order ID for user simplicity or use real ID
                    trackingNumber,
                    total,
                    items: items.map(item => {
                        // ... existing item mapping logic ...
                        let price = Number(item.product?.price || 0);
                        if (item.product?.isOnSale) {
                            price = price * (1 - (item.product.salePercentage || 0) / 100);
                        }
                        return {
                            name: item.product?.name || item.productName || 'Product',
                            quantity: item.quantity,
                            price: price
                        };
                    })
                })
            });
        }

        revalidatePath('/cart');
        revalidatePath('/orders');
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error("Place Order Error:", error);
        return { success: false, error: "Failed to place order" };
    }
}

export async function updateOrderAddressAction(orderId: string, newAddress: any) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

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

export async function getWishlistAction(page: number = 1, limit: number = 9) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

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

export async function getUserOrdersAction() {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Unauthorized" };
        const userId = session.userId;

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                },
                deliveryAgent: {
                    select: { name: true, phone: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, orders };
    } catch (error) {
        return { success: false, error: "Failed to fetch orders" };
    }
}
