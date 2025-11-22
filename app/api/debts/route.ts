import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/debts - Lấy danh sách công nợ
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { companyName: { contains: search } },
                { invoice: { contains: search } },
            ];
        }

        const [debts, total] = await Promise.all([
            prisma.debt.findMany({
                where,
                include: {
                    User: { select: { id: true, name: true, email: true } },
                },
                orderBy: { paymentDate: 'desc' },
                skip,
                take: limit,
            }),
            prisma.debt.count({ where }),
        ]);

        return NextResponse.json({
            debts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching debts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch debts' },
            { status: 500 }
        );
    }
}

// POST /api/debts - Tạo công nợ mới
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            companyName,
            deliveryDate,
            receiveDate,
            invoice,
            purchaseContent,
            totalAmount,
            collectedAmount,
            paymentDate,
            notes,
        } = body;

        if (!companyName || !totalAmount || !paymentDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const collected = collectedAmount || 0;
        const remaining = totalAmount - collected;

        const debt = await prisma.debt.create({
            data: {
                id: `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                companyName,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                receiveDate: receiveDate ? new Date(receiveDate) : null,
                invoice: invoice || null,
                purchaseContent: purchaseContent || null,
                totalAmount,
                collectedAmount: collected,
                remainingAmount: remaining,
                paymentDate: new Date(paymentDate),
                notes: notes || '',
                userId: authResult.user!.id,
                updatedAt: new Date(),
            },
            include: {
                User: { select: { id: true, name: true, email: true } },
            },
        });

        return NextResponse.json(debt, { status: 201 });
    } catch (error) {
        console.error('Error creating debt:', error);
        return NextResponse.json(
            { error: 'Failed to create debt' },
            { status: 500 }
        );
    }
}
