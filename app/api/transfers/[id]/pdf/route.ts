import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/transfers/[id]/pdf - Generate PDF for transfer
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

        return NextResponse.json({
            transfer,
            type: 'TRANSFER',
            title: 'PHIẾU CHUYỂN KHO',
        });
    } catch (error) {
        console.error('Error fetching transfer for PDF:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transfer' },
            { status: 500 }
        );
    }
}
