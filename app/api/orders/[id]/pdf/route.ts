import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/orders/[id]/pdf - Generate PDF for order
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                Warehouse: true,
                User: { select: { id: true, name: true, email: true } },
                OrderItem: {
                    include: {
                        Product: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Return order data for client-side PDF generation
        return NextResponse.json({
            order,
            type: 'ORDER',
            title: 'PHIẾU THU',
        });
    } catch (error) {
        console.error('Error fetching order for PDF:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}
