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

        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                Warehouse: true,
                User: { select: { id: true, name: true, email: true } },
                OrderItem: {
                    include: {
                        Product: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status, documentPath, paymentReceiptPath } = body;

        const order = await prisma.$transaction(async (tx: any) => {
            // Get current order status and items
            const currentOrder = await tx.order.findUnique({
                where: { id: params.id },
                include: { OrderItem: true },
            });

            if (!currentOrder) {
                throw new Error('Order not found');
            }

            // Update order
            const updatedOrder = await tx.order.update({
                where: { id: params.id },
                data: {
                    status: status || undefined,
                    documentPath: documentPath !== undefined ? documentPath : undefined,
                    paymentReceiptPath: paymentReceiptPath !== undefined ? paymentReceiptPath : undefined,
                    updatedAt: new Date(),
                },
                include: {
                    Warehouse: true,
                    User: { select: { id: true, name: true, email: true } },
                    OrderItem: {
                        include: {
                            Product: true,
                        },
                    },
                },
            });

            // Handle stock updates if status changed
            if (status && status !== currentOrder.status) {
                // If changing TO COMPLETED -> Deduct stock
                if (status === 'COMPLETED') {
                    for (const item of currentOrder.OrderItem) {
                        const stockItem = await tx.stockItem.findFirst({
                            where: {
                                productId: item.productId,
                                warehouseId: currentOrder.warehouseId,
                            },
                        });

                        if (!stockItem) {
                            throw new Error(`Sản phẩm chưa có trong kho này (Mã SP: ${item.productId})`);
                        }

                        if (stockItem.quantity < item.quantity) {
                            throw new Error(`Không đủ tồn kho cho sản phẩm (Mã SP: ${item.productId}). Tồn: ${stockItem.quantity}, Yêu cầu: ${item.quantity}`);
                        }

                        await tx.stockItem.update({
                            where: { id: stockItem.id },
                            data: {
                                quantity: stockItem.quantity - item.quantity,
                                updatedAt: new Date(),
                            },
                        });
                    }
                }
                // If changing FROM COMPLETED (to DRAFT or CANCELLED) -> Restore stock
                else if (currentOrder.status === 'COMPLETED') {
                    for (const item of currentOrder.OrderItem) {
                        const stockItem = await tx.stockItem.findFirst({
                            where: {
                                productId: item.productId,
                                warehouseId: currentOrder.warehouseId,
                            },
                        });

                        if (stockItem) {
                            await tx.stockItem.update({
                                where: { id: stockItem.id },
                                data: {
                                    quantity: stockItem.quantity + item.quantity,
                                    updatedAt: new Date(),
                                },
                            });
                        }
                        // If stock item doesn't exist anymore (unlikely), we might need to create it or ignore. 
                        // For safety, we'll assume it exists or ignore if not found (though it should exist).
                    }
                }
            }

            return updatedOrder;
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get order details first to find file paths
        const orderToDelete = await prisma.order.findUnique({
            where: { id: params.id },
            select: { documentPath: true, paymentReceiptPath: true }
        });

        await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: params.id },
                include: { OrderItem: true },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            // If order was COMPLETED, restore stock
            if (order.status === 'COMPLETED') {
                for (const item of order.OrderItem) {
                    const stockItem = await tx.stockItem.findFirst({
                        where: {
                            productId: item.productId,
                            warehouseId: order.warehouseId,
                        },
                    });

                    if (stockItem) {
                        await tx.stockItem.update({
                            where: { id: stockItem.id },
                            data: {
                                quantity: stockItem.quantity + item.quantity,
                                updatedAt: new Date(),
                            },
                        });
                    }
                }
            }

            // Delete OrderItems first
            await tx.orderItem.deleteMany({
                where: { orderId: params.id },
            });

            await tx.order.delete({
                where: { id: params.id },
            });
        });

        // Delete associated files after successful DB deletion
        if (orderToDelete) {
            const fs = require('fs');
            const path = require('path');
            const publicDir = path.join(process.cwd(), 'public');

            if (orderToDelete.documentPath) {
                const filePath = path.join(publicDir, orderToDelete.documentPath);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                        console.log(`Deleted order document: ${filePath}`);
                    } catch (err) {
                        console.error(`Failed to delete order document: ${filePath}`, err);
                    }
                }
            }

            if (orderToDelete.paymentReceiptPath) {
                const filePath = path.join(publicDir, orderToDelete.paymentReceiptPath);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                        console.log(`Deleted payment receipt: ${filePath}`);
                    } catch (err) {
                        console.error(`Failed to delete payment receipt: ${filePath}`, err);
                    }
                }
            }
        }

        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json(
            { error: 'Failed to delete order' },
            { status: 500 }
        );
    }
}
