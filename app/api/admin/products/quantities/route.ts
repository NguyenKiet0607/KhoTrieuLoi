import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                code: true,
                StockItem: {
                    select: {
                        quantity: true,
                        warehouseId: true,
                    }
                }
            }
        });

        // Calculate total quantity for each product
        const quantities = products.map((product: any) => ({
            id: product.id,
            name: product.name,
            code: product.code,
            totalQuantity: product.StockItem.reduce((sum: number, item: any) => sum + item.quantity, 0),
            stockItems: product.StockItem
        }));

        return NextResponse.json(quantities);
    } catch (error) {
        console.error('Error fetching product quantities:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product quantities' },
            { status: 500 }
        );
    }
}
