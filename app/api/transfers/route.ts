import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activityLogger';

// GET /api/transfers - Lấy danh sách phiếu chuyển kho
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.code = { contains: search };
        }

        if (status) {
            where.status = status;
        }

        const [transfers, total] = await Promise.all([
            prisma.stockTransfer.findMany({
                where,
                include: {
                    User: { select: { id: true, name: true, email: true } },
                    Warehouse_StockTransfer_fromWarehouseIdToWarehouse: true,
                    Warehouse_StockTransfer_toWarehouseIdToWarehouse: true,
                    StockTransferItem: {
                        include: {
                            Product: true,
                        },
                    },
                },
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            prisma.stockTransfer.count({ where }),
        ]);

        return NextResponse.json({
            transfers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching transfers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transfers' },
            { status: 500 }
        );
    }
}

// POST /api/transfers - Tạo phiếu chuyển kho mới
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            code,
            date,
            fromWarehouseId,
            toWarehouseId,
            description,
            warehouseKeeperOut,
            warehouseKeeperIn,
            transporterName,
            vehicleInfo,
            items,
            status,
        } = body;

        if (!code || !date || !fromWarehouseId || !toWarehouseId || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (fromWarehouseId === toWarehouseId) {
            return NextResponse.json(
                { error: 'Cannot transfer to the same warehouse' },
                { status: 400 }
            );
        }

        // Check if code already exists
        const existing = await prisma.stockTransfer.findUnique({
            where: { code },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Transfer code already exists' },
                { status: 400 }
            );
        }

        // Calculate total
        const totalAmount = items.reduce((sum: number, item: any) => sum + item.amount, 0);

        // Create transfer with items and update stock
        const transfer = await prisma.$transaction(async (tx: any) => {
            const newTransfer = await tx.stockTransfer.create({
                data: {
                    id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    code,
                    date: new Date(date),
                    fromWarehouseId,
                    toWarehouseId,
                    description: description || null,
                    warehouseKeeperOut: warehouseKeeperOut || null,
                    warehouseKeeperIn: warehouseKeeperIn || null,
                    transporterName: transporterName || null,
                    vehicleInfo: vehicleInfo || null,
                    totalAmount,
                    userId: authResult.user!.id,
                    status: status || 'COMPLETED',
                    updatedAt: new Date(),
                },
            });

            // Create transfer items and update stock
            for (const item of items) {
                // Create transfer item
                await tx.stockTransferItem.create({
                    data: {
                        id: `sti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        transferId: newTransfer.id,
                        productId: item.productId,
                        quantityOut: item.quantityOut,
                        quantityIn: item.quantityIn,
                        price: item.price || 0,
                        amount: item.amount || 0,
                        updatedAt: new Date(),
                    },
                });

                // Update stock if status is COMPLETED
                if (status === 'COMPLETED') {
                    // Decrease from warehouse
                    const fromStock = await tx.stockItem.findFirst({
                        where: {
                            productId: item.productId,
                            warehouseId: fromWarehouseId,
                        },
                    });

                    if (fromStock) {
                        await tx.stockItem.update({
                            where: { id: fromStock.id },
                            data: {
                                quantity: fromStock.quantity - item.quantityOut,
                                updatedAt: new Date(),
                            },
                        });
                    }

                    // Increase to warehouse
                    let toStock = await tx.stockItem.findFirst({
                        where: {
                            productId: item.productId,
                            warehouseId: toWarehouseId,
                        },
                    });

                    if (!toStock) {
                        toStock = await tx.stockItem.create({
                            data: {
                                id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                productId: item.productId,
                                warehouseId: toWarehouseId,
                                quantity: 0,
                                updatedAt: new Date(),
                            },
                        });
                    }

                    await tx.stockItem.update({
                        where: { id: toStock.id },
                        data: {
                            quantity: toStock.quantity + item.quantityIn,
                            updatedAt: new Date(),
                        },
                    });
                }
            }

            return newTransfer;
        });

        // Log activity
        await logActivity({
            userId: authResult.user!.id,
            action: 'CREATE_TRANSFER',
            category: 'STOCK',
            description: `Tạo phiếu chuyển kho ${code}`,
            details: JSON.stringify({ transferId: transfer.id, code, fromWarehouseId, toWarehouseId, totalAmount }),
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
            userAgent: request.headers.get('user-agent') || '',
        });

        // Fetch complete transfer with relations
        const completeTransfer = await prisma.stockTransfer.findUnique({
            where: { id: transfer.id },
            include: {
                User: { select: { id: true, name: true, email: true } },
                Warehouse_StockTransfer_fromWarehouseIdToWarehouse: true,
                Warehouse_StockTransfer_toWarehouseIdToWarehouse: true,
                StockTransferItem: {
                    include: {
                        Product: true,
                    },
                },
            },
        });

        return NextResponse.json(completeTransfer, { status: 201 });
    } catch (error) {
        console.error('Error creating transfer:', error);
        return NextResponse.json(
            { error: 'Failed to create transfer' },
            { status: 500 }
        );
    }
}
