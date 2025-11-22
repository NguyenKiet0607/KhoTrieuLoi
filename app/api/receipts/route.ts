import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activityLogger';

// GET /api/receipts - Lấy danh sách phiếu nhập kho
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
            where.OR = [
                { code: { contains: search } },
                { supplier: { contains: search } },
            ];
        }

        if (status) {
            where.status = status;
        }

        const [receipts, total] = await Promise.all([
            prisma.stockReceipt.findMany({
                where,
                include: {
                    User: { select: { id: true, name: true, email: true } },
                    StockReceiptItem: {
                        include: {
                            StockItem: {
                                include: {
                                    Product: true,
                                    Warehouse: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            prisma.stockReceipt.count({ where }),
        ]);

        return NextResponse.json({
            receipts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching receipts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch receipts' },
            { status: 500 }
        );
    }
}

// POST /api/receipts - Tạo phiếu nhập kho mới
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { code, date, supplier, description, items, status } = body;

        if (!code || !date || !supplier || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if code already exists
        const existing = await prisma.stockReceipt.findUnique({
            where: { code },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Receipt code already exists' },
                { status: 400 }
            );
        }

        // Calculate total
        const totalAmount = items.reduce((sum: number, item: any) => sum + item.amount, 0);

        // Create receipt with items and update stock
        const receipt = await prisma.$transaction(async (tx) => {
            const newReceipt = await tx.stockReceipt.create({
                data: {
                    id: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    code,
                    date: new Date(date),
                    supplier,
                    description: description || null,
                    totalAmount,
                    userId: authResult.user!.id,
                    status: status || 'DRAFT',
                    updatedAt: new Date(),
                },
            });

            // Create receipt items and update stock
            for (const item of items) {
                // Find or create stock item
                let stockItem = await tx.stockItem.findFirst({
                    where: {
                        productId: item.productId,
                        warehouseId: item.warehouseId,
                    },
                });

                if (!stockItem) {
                    stockItem = await tx.stockItem.create({
                        data: {
                            id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            productId: item.productId,
                            warehouseId: item.warehouseId,
                            quantity: 0,
                            updatedAt: new Date(),
                        },
                    });
                }

                // Create receipt item
                await tx.stockReceiptItem.create({
                    data: {
                        id: `sri_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        receiptId: newReceipt.id,
                        stockItemId: stockItem.id,
                        quantity: item.quantity,
                        price: item.price,
                        amount: item.amount,
                        useInvoiceQuantity: item.useInvoiceQuantity || false,
                        updatedAt: new Date(),
                    },
                });

                // Update stock quantity if status is COMPLETED
                if (status === 'COMPLETED') {
                    await tx.stockItem.update({
                        where: { id: stockItem.id },
                        data: {
                            quantity: stockItem.quantity + item.quantity,
                            updatedAt: new Date(),
                        },
                    });
                }
            }

            return newReceipt;
        });

        // Log activity
        await logActivity({
            userId: authResult.user!.id,
            action: 'CREATE_RECEIPT',
            category: 'STOCK',
            description: `Tạo phiếu nhập kho ${code}`,
            details: JSON.stringify({ receiptId: receipt.id, code, supplier, totalAmount }),
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
            userAgent: request.headers.get('user-agent') || '',
        });

        // Fetch complete receipt with relations
        const completeReceipt = await prisma.stockReceipt.findUnique({
            where: { id: receipt.id },
            include: {
                User: { select: { id: true, name: true, email: true } },
                StockReceiptItem: {
                    include: {
                        StockItem: {
                            include: {
                                Product: true,
                                Warehouse: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(completeReceipt, { status: 201 });
    } catch (error) {
        console.error('Error creating receipt:', error);
        return NextResponse.json(
            { error: 'Failed to create receipt' },
            { status: 500 }
        );
    }
}
