import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { searchParams } = new URL(request.url);
        const warehouseId = searchParams.get('warehouseId');

        if (warehouseId) {
            const stockItem = await prisma.stockItem.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: id,
                        warehouseId: warehouseId,
                    },
                },
            });

            return NextResponse.json({
                totalStock: stockItem?.quantity || 0,
            });
        } else {
            const stockItems = await prisma.stockItem.findMany({
                where: {
                    productId: id,
                },
            });

            const totalStock = stockItems.reduce((sum, item) => sum + item.quantity, 0);

            return NextResponse.json({
                totalStock,
            });
        }
    } catch (error) {
        console.error('Error fetching product stock:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product stock' },
            { status: 500 }
        );
    }
}
