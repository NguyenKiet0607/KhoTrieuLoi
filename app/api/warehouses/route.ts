import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/warehouses - Lấy danh sách kho
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const warehouses = await prisma.warehouse.findMany({
            include: {
                _count: {
                    select: {
                        StockItem: true,
                        Order: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(warehouses);
    } catch (error: any) {
        console.error('❌ [WAREHOUSES] Error fetching warehouses:', error.message);
        console.error('❌ [WAREHOUSES] Stack:', error.stack);
        return NextResponse.json(
            { error: 'Failed to fetch warehouses' },
            { status: 500 }
        );
    }
}

// POST /api/warehouses - Tạo kho mới
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, address, description } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if name already exists
        const existing = await prisma.warehouse.findUnique({
            where: { name },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Warehouse name already exists' },
                { status: 400 }
            );
        }

        const warehouse = await prisma.warehouse.create({
            data: {
                id: `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name,
                address: address || null,
                description: description || null,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(warehouse, { status: 201 });
    } catch (error) {
        console.error('Error creating warehouse:', error);
        return NextResponse.json(
            { error: 'Failed to create warehouse' },
            { status: 500 }
        );
    }
}

// PUT /api/warehouses - Cập nhật kho
export async function PUT(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, address, description } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Missing warehouse ID' },
                { status: 400 }
            );
        }

        const existing = await prisma.warehouse.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Warehouse not found' },
                { status: 404 }
            );
        }

        // Check if name is being changed and already exists
        if (name && name !== existing.name) {
            const nameExists = await prisma.warehouse.findUnique({
                where: { name },
            });

            if (nameExists) {
                return NextResponse.json(
                    { error: 'Warehouse name already exists' },
                    { status: 400 }
                );
            }
        }

        const warehouse = await prisma.warehouse.update({
            where: { id },
            data: {
                name: name || existing.name,
                address: address !== undefined ? address : existing.address,
                description: description !== undefined ? description : existing.description,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(warehouse);
    } catch (error) {
        console.error('Error updating warehouse:', error);
        return NextResponse.json(
            { error: 'Failed to update warehouse' },
            { status: 500 }
        );
    }
}

// DELETE /api/warehouses - Xóa kho
export async function DELETE(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Missing warehouse ID' },
                { status: 400 }
            );
        }

        // Check if warehouse has stock items
        const stockCount = await prisma.stockItem.count({
            where: { warehouseId: id },
        });

        if (stockCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete warehouse with stock items' },
                { status: 400 }
            );
        }

        await prisma.warehouse.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Warehouse deleted successfully' });
    } catch (error) {
        console.error('Error deleting warehouse:', error);
        return NextResponse.json(
            { error: 'Failed to delete warehouse' },
            { status: 500 }
        );
    }
}
