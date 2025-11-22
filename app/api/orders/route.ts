import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activityLogger';

// GET /api/orders - Lấy danh sách đơn hàng
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const warehouseId = searchParams.get('warehouseId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { code: { contains: search } },
                { customer: { contains: search } },
                { phone: { contains: search } },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (warehouseId) {
            where.warehouseId = warehouseId;
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    Warehouse: true,
                    User: { select: { id: true, name: true, email: true } },
                    OrderItem: {
                        include: {
                            Product: true,
                        },
                    },
                },
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        return NextResponse.json({
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

// POST /api/orders - Tạo đơn hàng mới
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
            customer,
            address,
            phone,
            description,
            warehouseId,
            items,
            hasInvoice,
            hasVAT,
            status,
        } = body;

        if (!code || !date || !customer || !warehouseId || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if code already exists
        const existing = await prisma.order.findUnique({
            where: { code },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Order code already exists' },
                { status: 400 }
            );
        }

        // Calculate total
        const totalAmount = items.reduce((sum: number, item: any) => sum + item.amount, 0);

        // Create order with items and update stock
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    code,
                    date: new Date(date),
                    customer,
                    address: address || null,
                    phone: phone || null,
                    description: description || null,
                    totalAmount,
                    hasInvoice: hasInvoice || false,
                    hasVAT: hasVAT || false,
                    userId: authResult.user!.id,
                    warehouseId,
                    status: status || 'DRAFT',
                    updatedAt: new Date(),
                    OrderItem: {
                        create: items.map((item: any) => ({
                            id: `oi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            amount: item.amount,
                            updatedAt: new Date(),
                        })),
                    },
                },
            });

            // If status is COMPLETED, deduct stock
            if (status === 'COMPLETED') {
                for (const item of items) {
                    const stockItem = await tx.stockItem.findFirst({
                        where: {
                            productId: item.productId,
                            warehouseId: warehouseId,
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

            return newOrder;
        });

        // Log activity
        await logActivity({
            userId: authResult.user!.id,
            action: 'CREATE_ORDER',
            category: 'ORDER',
            description: `Tạo đơn hàng ${code}`,
            details: JSON.stringify({ orderId: order.id, code, customer, totalAmount }),
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
            userAgent: request.headers.get('user-agent') || '',
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
