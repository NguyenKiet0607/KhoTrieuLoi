import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/customers
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
            ];
        }

        const customers = await prisma.customer.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take: 50,
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        );
    }
}

// POST /api/customers
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, phone, address } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Check if customer already exists (by phone or email if provided)
        if (phone) {
            const existing = await prisma.customer.findFirst({
                where: { phone },
            });
            if (existing) {
                return NextResponse.json(
                    { error: 'Customer with this phone already exists' },
                    { status: 400 }
                );
            }
        }

        const customer = await prisma.customer.create({
            data: {
                id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name,
                email,
                phone,
                address,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        );
    }
}
