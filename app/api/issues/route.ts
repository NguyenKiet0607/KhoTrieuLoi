import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activityLogger';

// GET /api/issues - Lấy danh sách phiếu xuất kho
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
                { receiver: { contains: search } },
            ];
        }

        if (status) {
            where.status = status;
        }

        const [issues, total] = await Promise.all([
            prisma.stockIssue.findMany({
                where,
                include: {
                    User: { select: { id: true, name: true, email: true } },
                    StockIssueItem: {
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
            prisma.stockIssue.count({ where }),
        ]);

        return NextResponse.json({
            issues,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching issues:', error);
        return NextResponse.json(
            { error: 'Failed to fetch issues' },
            { status: 500 }
        );
    }
}

// POST /api/issues - Tạo phiếu xuất kho mới
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { code, date, receiver, description, items, status } = body;

        if (!code || !date || !receiver || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if code already exists
        const existing = await prisma.stockIssue.findUnique({
            where: { code },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Issue code already exists' },
                { status: 400 }
            );
        }

        // Calculate total
        const totalAmount = items.reduce((sum: number, item: any) => sum + item.amount, 0);

        // Create issue with items and update stock
        const issue = await prisma.$transaction(async (tx) => {
            const newIssue = await tx.stockIssue.create({
                data: {
                    id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    code,
                    date: new Date(date),
                    receiver,
                    description: description || null,
                    totalAmount,
                    userId: authResult.user!.id,
                    status: status || 'DRAFT',
                    updatedAt: new Date(),
                },
            });

            // Create issue items and update stock
            for (const item of items) {
                const stockItem = await tx.stockItem.findUnique({
                    where: { id: item.stockItemId },
                });

                if (!stockItem) {
                    throw new Error(`Stock item ${item.stockItemId} not found`);
                }

                // Check if enough stock
                if (stockItem.quantity < item.quantity && status === 'COMPLETED') {
                    throw new Error(`Not enough stock for product ${stockItem.productId}`);
                }

                // Create issue item
                await tx.stockIssueItem.create({
                    data: {
                        id: `sii_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        issueId: newIssue.id,
                        stockItemId: item.stockItemId,
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
                            quantity: stockItem.quantity - item.quantity,
                            updatedAt: new Date(),
                        },
                    });
                }
            }

            return newIssue;
        });

        // Log activity
        await logActivity({
            userId: authResult.user!.id,
            action: 'CREATE_ISSUE',
            category: 'STOCK',
            description: `Tạo phiếu xuất kho ${code}`,
            details: JSON.stringify({ issueId: issue.id, code, receiver, totalAmount }),
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
            userAgent: request.headers.get('user-agent') || '',
        });

        // Fetch complete issue with relations
        const completeIssue = await prisma.stockIssue.findUnique({
            where: { id: issue.id },
            include: {
                User: { select: { id: true, name: true, email: true } },
                StockIssueItem: {
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

        return NextResponse.json(completeIssue, { status: 201 });
    } catch (error) {
        console.error('Error creating issue:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create issue' },
            { status: 500 }
        );
    }
}
