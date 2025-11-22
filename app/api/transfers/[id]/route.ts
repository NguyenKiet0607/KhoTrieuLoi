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

        const transfer = await prisma.stockTransfer.findUnique({
            where: { id: params.id },
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

        if (!transfer) {
            return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
        }

        return NextResponse.json(transfer);
    } catch (error) {
        console.error('Error fetching transfer:', error);
        return NextResponse.json({ error: 'Failed to fetch transfer' }, { status: 500 });
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

        const transfer = await prisma.stockTransfer.update({
            where: { id: params.id },
            data: {
                status: status || undefined,
                documentPath: documentPath !== undefined ? documentPath : undefined,
                updatedAt: new Date(),
            },
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

        return NextResponse.json(transfer);
    } catch (error) {
        console.error('Error updating transfer:', error);
        return NextResponse.json({ error: 'Failed to update transfer' }, { status: 500 });
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

        await prisma.stockTransfer.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Transfer deleted successfully' });
    } catch (error) {
        console.error('Error deleting transfer:', error);
        return NextResponse.json({ error: 'Failed to delete transfer' }, { status: 500 });
    }
}
