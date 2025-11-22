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

        const receipt = await prisma.stockReceipt.findUnique({
            where: { id: params.id },
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

        if (!receipt) {
            return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
        }

        return NextResponse.json(receipt);
    } catch (error) {
        console.error('Error fetching receipt:', error);
        return NextResponse.json({ error: 'Failed to fetch receipt' }, { status: 500 });
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
        const { status, documentPath } = body;

        const receipt = await prisma.stockReceipt.update({
            where: { id: params.id },
            data: {
                status: status || undefined,
                documentPath: documentPath !== undefined ? documentPath : undefined,
                updatedAt: new Date(),
            },
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

        return NextResponse.json(receipt);
    } catch (error) {
        console.error('Error updating receipt:', error);
        return NextResponse.json({ error: 'Failed to update receipt' }, { status: 500 });
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

        await prisma.stockReceipt.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Receipt deleted successfully' });
    } catch (error) {
        console.error('Error deleting receipt:', error);
        return NextResponse.json({ error: 'Failed to delete receipt' }, { status: 500 });
    }
}
