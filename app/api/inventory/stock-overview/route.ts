import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/inventory/stock-overview - Get comprehensive stock overview
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('📊 [Stock Overview API] Fetching products...');

        const products = await prisma.product.findMany({
            include: {
                Category: true,
                StockItem: {
                    include: {
                        Warehouse: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        console.log(`📊 [Stock Overview API] Found ${products.length} products`);

        // Calculate stock overview for each product
        const overview = products.map((product) => {
            const totalStock = product.StockItem.reduce((sum, item) => sum + item.quantity, 0);
            const warehouses = product.StockItem.map((item) => ({
                warehouseId: item.warehouseId,
                warehouseName: item.Warehouse.name,
                quantity: item.quantity,
            }));

            return {
                productId: product.id,
                productCode: product.code,
                productName: product.name,
                categoryName: product.Category.name,
                unit: product.unit,
                price: product.price,
                totalStock,
                warehouses,
                isUnlimited: product.isUnlimited,
                description: product.description,
                supplier: product.supplier,
                invoiceQuantity: product.invoiceQuantity,
            };
        });

        console.log(`📊 [Stock Overview API] Returning ${overview.length} items`);

        return NextResponse.json(overview);
    } catch (error: any) {
        console.error('❌ [Stock Overview API] Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch stock overview' },
            { status: 500 }
        );
    }
}
