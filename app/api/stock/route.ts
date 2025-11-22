import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/stock - Lấy tổng quan tồn kho
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const warehouseId = searchParams.get('warehouseId');
        const search = searchParams.get('search') || '';

        const where: any = {};

        if (warehouseId) {
            where.warehouseId = warehouseId;
        }

        if (search) {
            where.Product = {
                OR: [
                    { name: { contains: search } },
                    { code: { contains: search } },
                ],
            };
        }

        const stockItems = await prisma.stockItem.findMany({
            where,
            include: {
                Product: {
                    include: {
                        Category: true,
                    },
                },
                Warehouse: true,
            },
            orderBy: [
                { Warehouse: { name: 'asc' } },
                { Product: { name: 'asc' } },
            ],
        });

        return NextResponse.json(stockItems);
    } catch (error) {
        console.error('Error fetching stock:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stock' },
            { status: 500 }
        );
    }
}
