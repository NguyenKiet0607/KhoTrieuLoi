import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const receipts = await prisma.deliveryReceipt.findMany({
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
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(receipts);
    } catch (error) {
        console.error('Error fetching delivery receipts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch delivery receipts' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid || !authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const {
            orderId,
            deliveryDate,
            deliveryLocation,
            deliveryMethod,
            shippingCompanyId,
            shippingCompanyName,
            shippingCompanyPhone,
            shippingCompanyAddress,
            terms,
            notes
        } = data;

        if (!orderId || !deliveryDate) {
            return NextResponse.json(
                { error: 'Order ID and delivery date are required' },
                { status: 400 }
            );
        }

        const receipt = await prisma.deliveryReceipt.create({
            data: {
                id: `DR-${Date.now()}`,
                orderId,
                deliveryDate: new Date(deliveryDate),
                deliveryLocation: deliveryLocation || null,
                deliveryMethod: deliveryMethod || 'SELF',
                shippingCompanyId: shippingCompanyId || null,
                shippingCompanyName: shippingCompanyName || null,
                shippingCompanyPhone: shippingCompanyPhone || null,
                shippingCompanyAddress: shippingCompanyAddress || null,
                terms: terms || null,
                notes: notes || null,
                createdBy: authResult.user.id,
                updatedAt: new Date()
            },
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
                ShippingCompany: true
            }
        });

        return NextResponse.json(receipt);
    } catch (error) {
        console.error('Error creating delivery receipt:', error);
        return NextResponse.json(
            { error: 'Failed to create delivery receipt' },
            { status: 500 }
        );
    }
}
