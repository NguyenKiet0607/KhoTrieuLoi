import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/reports - Lấy báo cáo
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const type = searchParams.get('type') || 'summary';

        console.log('[Reports API] Request params:', { dateFrom, dateTo, type });

        const fromDate = dateFrom ? new Date(dateFrom) : new Date(new Date().setDate(new Date().getDate() - 30));
        const toDate = dateTo ? new Date(dateTo) : new Date();

        if (type === 'summary') {
            // Get summary report
            const [orders, receipts, issues, transfers] = await Promise.all([
                prisma.order.findMany({
                    where: {
                        date: {
                            gte: fromDate,
                            lte: toDate,
                        },
                    },
                    include: {
                        OrderItem: true,
                    },
                }),
                prisma.stockReceipt.findMany({
                    where: {
                        date: {
                            gte: fromDate,
                            lte: toDate,
                        },
                    },
                }),
                prisma.stockIssue.findMany({
                    where: {
                        date: {
                            gte: fromDate,
                            lte: toDate,
                        },
                    },
                }),
                prisma.stockTransfer.findMany({
                    where: {
                        date: {
                            gte: fromDate,
                            lte: toDate,
                        },
                    },
                }),
            ]);

            const summary = {
                period: {
                    from: fromDate,
                    to: toDate,
                },
                orders: {
                    count: orders.length,
                    totalAmount: orders.reduce((sum, o) => sum + o.totalAmount, 0),
                },
                receipts: {
                    count: receipts.length,
                    totalAmount: receipts.reduce((sum, r) => sum + r.totalAmount, 0),
                },
                issues: {
                    count: issues.length,
                    totalAmount: issues.reduce((sum, i) => sum + i.totalAmount, 0),
                },
                transfers: {
                    count: transfers.length,
                    totalAmount: transfers.reduce((sum, t) => sum + t.totalAmount, 0),
                },
            };

            return NextResponse.json(summary);
        }

        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
