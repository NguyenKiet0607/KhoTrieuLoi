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

        const debt = await prisma.debt.findUnique({
            where: { id: params.id },
            include: {
                User: { select: { id: true, name: true, email: true } },
            },
        });

        if (!debt) {
            return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
        }

        return NextResponse.json(debt);
    } catch (error) {
        console.error('Error fetching debt:', error);
        return NextResponse.json({ error: 'Failed to fetch debt' }, { status: 500 });
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
        const { collectedAmount, notes } = body;

        const existing = await prisma.debt.findUnique({
            where: { id: params.id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
        }

        const collected = collectedAmount !== undefined ? collectedAmount : existing.collectedAmount;
        const remaining = existing.totalAmount - collected;

        const debt = await prisma.debt.update({
            where: { id: params.id },
            data: {
                collectedAmount: collected,
                remainingAmount: remaining,
                notes: notes !== undefined ? notes : existing.notes,
                updatedAt: new Date(),
            },
            include: {
                User: { select: { id: true, name: true, email: true } },
            },
        });

        return NextResponse.json(debt);
    } catch (error) {
        console.error('Error updating debt:', error);
        return NextResponse.json({ error: 'Failed to update debt' }, { status: 500 });
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

        await prisma.debt.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Debt deleted successfully' });
    } catch (error) {
        console.error('Error deleting debt:', error);
        return NextResponse.json({ error: 'Failed to delete debt' }, { status: 500 });
    }
}
