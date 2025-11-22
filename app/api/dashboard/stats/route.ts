import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get counts for all main entities
        const [
            totalProducts,
            totalOrders,
            totalWarehouses,
            totalUsers,
            totalCategories,
            recentOrders,
            recentReceipts,
            recentIssues
        ] = await Promise.all([
            prisma.product.count(),
            prisma.order.count(),
            prisma.warehouse.count(),
            prisma.user.count(),
            prisma.category.count(),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    code: true,
                    customer: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true
                }
            }),
            prisma.stockReceipt.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    code: true,
                    supplier: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true
                }
            }),
            prisma.stockIssue.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    code: true,
                    receiver: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true
                }
            })
        ]);

        return NextResponse.json({
            stats: {
                totalProducts,
                totalOrders,
                totalWarehouses,
                totalUsers,
                totalCategories
            },
            recentActivity: {
                orders: recentOrders,
                receipts: recentReceipts,
                issues: recentIssues
            }
        });
    } catch (error: any) {
        console.error('❌ [DASHBOARD] Error fetching stats:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}
