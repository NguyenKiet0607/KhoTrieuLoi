import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const receipt = await prisma.deliveryReceipt.findUnique({
            where: { id: params.id },
            include: {
                Order: {
                    include: {
                        OrderItem: {
                            include: {
                                Product: true
                            }
                        }
                    }
                },
                ShippingCompany: true,
                User: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!receipt) {
            return NextResponse.json(
                { error: 'Delivery receipt not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(receipt);
    } catch (error) {
        console.error('Error fetching delivery receipt:', error);
        return NextResponse.json(
            { error: 'Failed to fetch delivery receipt' },
            { status: 500 }
        );
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

        await prisma.deliveryReceipt.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting delivery receipt:', error);
        return NextResponse.json(
            { error: 'Failed to delete delivery receipt' },
            { status: 500 }
        );
    }
}
