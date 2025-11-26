import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        const companies = await prisma.shippingCompany.findMany({
            where: search ? {
                OR: [
                    { name: { contains: search } },
                    { phone: { contains: search } },
                ]
            } : {},
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(companies);
    } catch (error) {
        console.error('Error fetching shipping companies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shipping companies' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { name, phone, address } = data;

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        const company = await prisma.shippingCompany.create({
            data: {
                id: `SC-${Date.now()}`,
                name,
                phone: phone || null,
                address: address || null,
                updatedAt: new Date()
            }
        });

        return NextResponse.json(company);
    } catch (error) {
        console.error('Error creating shipping company:', error);
        return NextResponse.json(
            { error: 'Failed to create shipping company' },
            { status: 500 }
        );
    }
}
