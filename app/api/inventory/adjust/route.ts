import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activityLogger';

// POST /api/inventory/adjust - Update stock and invoice quantity
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { productId, invoiceQuantity, warehouseAdjustments } = body;

        if (!productId) {
            return NextResponse.json(
                { error: 'Missing product ID' },
                { status: 400 }
            );
        }

        // Start transaction
        await prisma.$transaction(async (tx) => {
            // 1. Update Invoice Quantity
            if (invoiceQuantity !== undefined) {
                await tx.product.update({
                    where: { id: productId },
                    data: { invoiceQuantity: parseInt(invoiceQuantity) },
                });
            }

            // 2. Update Stock Quantities per Warehouse
            if (warehouseAdjustments && Array.isArray(warehouseAdjustments)) {
                for (const adj of warehouseAdjustments) {
                    const { warehouseId, quantity } = adj;

                    // Find existing stock item
                    const stockItem = await tx.stockItem.findFirst({
                        where: {
                            productId,
                            warehouseId,
                        },
                    });

                    if (stockItem) {
                        // Update existing
                        await tx.stockItem.update({
                            where: { id: stockItem.id },
                            data: { quantity: parseInt(quantity) },
                        });
                    } else {
                        // Create new if not exists (and quantity > 0)
                        if (parseInt(quantity) > 0) {
                            await tx.stockItem.create({
                                data: {
                                    id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    productId,
                                    warehouseId,
                                    quantity: parseInt(quantity),
                                    updatedAt: new Date(),
                                },
                            });
                        }
                    }
                }
            }
        });

        // Log activity
        const product = await prisma.product.findUnique({ where: { id: productId } });
        await logActivity({
            userId: authResult.user!.id,
            action: 'UPDATE',
            category: 'INVENTORY',
            description: `Điều chỉnh tồn kho cho sản phẩm ${product?.name}`,
            details: JSON.stringify({ productId, invoiceQuantity, warehouseAdjustments }),
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
            userAgent: request.headers.get('user-agent') || '',
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error adjusting inventory:', error);
        return NextResponse.json(
            { error: 'Failed to adjust inventory' },
            { status: 500 }
        );
    }
}
