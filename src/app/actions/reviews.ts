'use server';

import { prisma } from "@/lib/prisma";

// Add a review (users can only review products they've purchased)
export async function addReviewAction(data: {
    userId: string;
    productId: string;
    rating: number;
    comment?: string;
}) {
    try {
        // Check if user has purchased this product
        const hasPurchased = await prisma.orderItem.findFirst({
            where: {
                productId: data.productId,
                order: {
                    userId: data.userId,
                    status: 'DELIVERED'
                }
            }
        });

        if (!hasPurchased) {
            return { success: false, error: "You can only review products you've purchased and received" };
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: data.userId,
                productId: data.productId
            }
        });

        if (existingReview) {
            return { success: false, error: "You've already reviewed this product" };
        }

        const review = await prisma.review.create({
            data: {
                userId: data.userId,
                productId: data.productId,
                rating: data.rating,
                comment: data.comment
            },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        return { success: true, review };
    } catch (error) {
        console.error("Add review error:", error);
        return { success: false, error: "Failed to add review" };
    }
}

// Get reviews for a product
export async function getProductReviewsAction(productId: string) {
    try {
        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return {
            success: true,
            reviews,
            averageRating: avgRating,
            totalReviews: reviews.length
        };
    } catch (error) {
        console.error("Get reviews error:", error);
        return { success: false, error: "Failed to fetch reviews" };
    }
}

// Admin: Get all reviews
export async function getAllReviewsAction() {
    try {
        const reviews = await prisma.review.findMany({
            include: {
                user: {
                    select: { name: true, email: true }
                },
                product: {
                    select: { name: true, images: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, reviews };
    } catch (error) {
        console.error("Get all reviews error:", error);
        return { success: false, error: "Failed to fetch reviews" };
    }
}

// Admin: Reply to a review (only once)
export async function replyToReviewAction(reviewId: string, adminResponse: string) {
    try {
        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!review) {
            return { success: false, error: "Review not found" };
        }

        if (review.adminResponse) {
            return { success: false, error: "You've already replied to this review" };
        }

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                adminResponse,
                respondedAt: new Date()
            },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                product: {
                    select: { name: true }
                }
            }
        });

        return { success: true, review: updatedReview };
    } catch (error) {
        console.error("Reply to review error:", error);
        return { success: false, error: "Failed to reply to review" };
    }
}

// Get product rating stats
export async function getProductRatingStatsAction(productId: string) {
    try {
        const reviews = await prisma.review.findMany({
            where: { productId },
            select: { rating: true }
        });

        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        // Count by star rating
        const ratingDistribution = {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length,
        };

        return {
            success: true,
            averageRating: avgRating,
            totalReviews,
            ratingDistribution
        };
    } catch (error) {
        console.error("Get rating stats error:", error);
        return { success: false, error: "Failed to fetch rating stats" };
    }
}
