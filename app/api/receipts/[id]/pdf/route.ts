import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/receipts/[id]/pdf - Generate PDF for receipt
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

        return NextResponse.json({
            receipt,
            type: 'RECEIPT',
            title: 'PHIẾU NHẬP KHO',
        });
    } catch (error) {
        console.error('Error fetching receipt for PDF:', error);
        return NextResponse.json(
            { error: 'Failed to fetch receipt' },
            { status: 500 }
        );
    }
}
