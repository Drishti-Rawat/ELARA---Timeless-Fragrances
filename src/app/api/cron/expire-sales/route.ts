import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// This endpoint should be called periodically (e.g., every hour) by a cron service
// You can use Vercel Cron Jobs or external services like cron-job.org
export async function GET(request: Request) {
    // Verify Vercel Cron Secret (Optional but recommended)
    // To enable this, add CRON_SECRET to your environment variables
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const now = new Date();

        // 1. Find all products with expired sales
        const expiredSales = await prisma.product.updateMany({
            where: {
                isOnSale: true,
                saleEndDate: {
                    lte: now
                }
            },
            data: {
                isOnSale: false,
                salePercentage: 0,
                saleEndDate: null
            }
        });

        // 2. Deactivate expired coupons
        const expiredCoupons = await prisma.coupon.updateMany({
            where: {
                isActive: true,
                expiresAt: {
                    lte: now
                }
            },
            data: {
                isActive: false
            }
        });

        return NextResponse.json({
            success: true,
            message: `Expired ${expiredSales.count} sales and ${expiredCoupons.count} coupons`,
            counts: {
                sales: expiredSales.count,
                coupons: expiredCoupons.count
            },
            timestamp: now.toISOString()
        });
    } catch (error) {
        console.error('Auto-expire sales error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to expire sales' },
            { status: 500 }
        );
    }
}
