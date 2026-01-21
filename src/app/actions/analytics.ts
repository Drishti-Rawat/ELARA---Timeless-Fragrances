'use server';

import { prisma } from "@/lib/prisma";

export type AnalyticsPeriod = 'week' | 'month' | 'year';

export async function getAnalyticsDataAction(period: AnalyticsPeriod) {
    try {
        const now = new Date();
        let startDate = new Date();

        // Include today? Yes.
        // Set generic start dates
        if (period === 'week') {
            startDate.setDate(now.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(now.getMonth() - 1);
        } else if (period === 'year') {
            startDate.setFullYear(now.getFullYear() - 1);
        }

        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            select: {
                id: true,
                total: true,
                agentCommission: true,
                createdAt: true,
                status: true,
                items: {
                    include: {
                        product: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Fetch New Customers count
        const newCustomersCount = await prisma.user.count({
            where: {
                role: 'USER',
                createdAt: {
                    gte: startDate
                }
            }
        });

        // Fetch Low Stock Products
        const lowStockProducts = await prisma.product.findMany({
            where: {
                stock: {
                    lt: 10
                },
                isArchived: false
            },
            select: {
                id: true,
                name: true,
                stock: true,
                price: true
            },
            orderBy: {
                stock: 'asc'
            },
            take: 5
        });

        // Aggregate
        let totalRevenue = 0;
        let totalCommissions = 0;
        let totalOrders = 0;

        const chartMap = new Map<string, { revenue: number; count: number, sortKey: number }>();
        const categoryMap = new Map<string, { revenue: number, count: number }>();
        const productMap = new Map<string, { revenue: number, count: number, name: string }>();
        const statusMap = new Map<string, number>();
        const genderMap = new Map<string, { revenue: number, count: number }>();

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const status = order.status || 'PENDING';

            // Track status for Drop-off Chart
            statusMap.set(status, (statusMap.get(status) || 0) + 1);

            // If cancelled, skip revenue & product stats
            if (status === 'CANCELLED') return;

            totalOrders += 1;

            if (status === 'DELIVERED') {
                totalRevenue += Number(order.total);
                totalCommissions += Number(order.agentCommission || 0);

                // 1. Time Series Data
                let key = '';
                let sortKey = date.getTime();

                if (period === 'week') {
                    key = date.toISOString().split('T')[0];
                } else if (period === 'month') {
                    key = date.toISOString().split('T')[0];
                } else if (period === 'year') {
                    key = date.toISOString().substring(0, 7);
                }

                if (!chartMap.has(key)) {
                    chartMap.set(key, { revenue: 0, count: 0, sortKey });
                }
                const entry = chartMap.get(key)!;
                entry.revenue += Number(order.total);
                entry.count += 1;

                // 2. Category, Product & Gender Data
                order.items.forEach((item: any) => {
                    const price = Number(item.price) * item.quantity;

                    // Category
                    const catName = item.product.category?.name || 'Uncategorized';
                    if (!categoryMap.has(catName)) categoryMap.set(catName, { revenue: 0, count: 0 });
                    const catEntry = categoryMap.get(catName)!;
                    catEntry.revenue += price;
                    catEntry.count += item.quantity;

                    // Product
                    const prodId = item.productId;
                    if (!productMap.has(prodId)) productMap.set(prodId, { revenue: 0, count: 0, name: item.product.name });
                    const prodEntry = productMap.get(prodId)!;
                    prodEntry.revenue += price;
                    prodEntry.count += item.quantity;

                    // Gender
                    const gender = item.product.gender || 'UNISEX';
                    if (!genderMap.has(gender)) genderMap.set(gender, { revenue: 0, count: 0 });
                    const genderEntry = genderMap.get(gender)!;
                    genderEntry.revenue += price;
                    genderEntry.count += item.quantity;
                });
            }
        });

        // Calculate AOV
        const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

        // Fill in missing gaps
        const fillGaps = () => {
            const result = [];
            let current = new Date(startDate);
            const end = new Date();

            while (current <= end) {
                let key = '';
                let label = '';

                if (period === 'week' || period === 'month') {
                    key = current.toISOString().split('T')[0];
                    label = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                } else if (period === 'year') {
                    key = current.toISOString().substring(0, 7);
                    label = current.toLocaleDateString('en-US', { month: 'short' });
                }

                const data = chartMap.get(key) || { revenue: 0, count: 0 };

                result.push({
                    name: label,
                    revenue: data.revenue,
                    orders: data.count,
                    date: key
                });

                // Increment
                if (period === 'week' || period === 'month') {
                    current.setDate(current.getDate() + 1);
                } else {
                    current.setMonth(current.getMonth() + 1);
                }
            }
            return result;
        };

        const chartData = fillGaps();

        // Format Category Data for Pie Chart
        const categoryData = Array.from(categoryMap.entries()).map(([name, data]) => ({
            name,
            value: data.count,
            revenue: data.revenue
        })).sort((a, b) => b.value - a.value);

        // Format Product Data for Bar Chart
        const productData = Array.from(productMap.values()).map(data => ({
            name: data.name,
            sales: data.count,
            revenue: data.revenue
        })).sort((a, b) => b.sales - a.sales).slice(0, 5);

        // Format Status Data - Only Completed vs Cancelled
        const deliveredCount = statusMap.get('DELIVERED') || 0;
        const cancelledCount = statusMap.get('CANCELLED') || 0;

        const statusData = [
            { name: 'Completed', value: deliveredCount },
            { name: 'Cancelled', value: cancelledCount }
        ].filter(item => item.value > 0); // Only show if there's data

        // Format Gender Data
        const genderData = Array.from(genderMap.entries()).map(([name, data]) => ({
            name,
            value: data.count,
            revenue: data.revenue
        })).sort((a, b) => b.revenue - a.revenue);

        // Fetch Rating Analytics
        const reviews = await prisma.review.findMany({
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            select: {
                rating: true
            }
        });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        const ratingDistribution = [
            { rating: 5, count: reviews.filter(r => r.rating === 5).length },
            { rating: 4, count: reviews.filter(r => r.rating === 4).length },
            { rating: 3, count: reviews.filter(r => r.rating === 3).length },
            { rating: 2, count: reviews.filter(r => r.rating === 2).length },
            { rating: 1, count: reviews.filter(r => r.rating === 1).length },
        ];

        return {
            success: true,
            totalRevenue,
            totalCommissions,
            totalOrders,
            averageOrderValue,
            newCustomersCount,
            lowStockProducts,
            chartData,
            categoryData,
            productData,
            statusData,
            genderData,
            totalReviews,
            averageRating,
            ratingDistribution
        };

    } catch (error) {
        console.error("Analytics Error:", error);
        return { success: false, error: "Failed to fetch analytics" };
    }
}
