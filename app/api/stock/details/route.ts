import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/stock/details - Lấy chi tiết tồn kho theo sản phẩm và kho
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const warehouseId = searchParams.get('warehouseId');

        if (!productId && !warehouseId) {
            return NextResponse.json(
                { error: 'Either productId or warehouseId is required' },
                { status: 400 }
            );
        }

        const where: any = {};
        if (productId) where.productId = productId;
        if (warehouseId) where.warehouseId = warehouseId;

        const stockDetails = await prisma.stockItem.findMany({
            where,
            include: {
                Product: {
                    include: {
                        Category: true,
                    },
                },
                Warehouse: true,
                StockReceiptItem: {
                    include: {
                        StockReceipt: {
                            select: {
                                id: true,
                                code: true,
                                date: true,
                                supplier: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10,
                },
                StockIssueItem: {
                    include: {
                        StockIssue: {
                            select: {
                                id: true,
                                code: true,
                                date: true,
                                receiver: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10,
                },
            },
        });

        return NextResponse.json(stockDetails);
    } catch (error) {
        console.error('Error fetching stock details:', error);
        return NextResponse.json({ error: 'Failed to fetch stock details' }, { status: 500 });
    }
}
