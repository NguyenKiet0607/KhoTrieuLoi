import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/products/[id]/bundles - Lấy danh sách bundle của sản phẩm
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const bundles = await prisma.productBundle.findMany({
            where: { mainProductId: params.id },
            include: {
                Product_ProductBundle_childProductIdToProduct: true,
            },
        });

        return NextResponse.json(bundles);
    } catch (error) {
        console.error('Error fetching bundles:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bundles' },
            { status: 500 }
        );
    }
}

// POST /api/products/[id]/bundles - Tạo bundle mới
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { childProductId, quantity } = body;

        if (!childProductId || !quantity) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if bundle already exists
        const existing = await prisma.productBundle.findFirst({
            where: {
                mainProductId: params.id,
                childProductId,
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Bundle already exists' },
                { status: 400 }
            );
        }

        const bundle = await prisma.productBundle.create({
            data: {
                id: `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                mainProductId: params.id,
                childProductId,
                quantity,
                updatedAt: new Date(),
            },
            include: {
                Product_ProductBundle_childProductIdToProduct: true,
            },
        });

        return NextResponse.json(bundle, { status: 201 });
    } catch (error) {
        console.error('Error creating bundle:', error);
        return NextResponse.json(
            { error: 'Failed to create bundle' },
            { status: 500 }
        );
    }
}

// DELETE /api/products/[id]/bundles - Xóa bundle
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const childProductId = searchParams.get('childProductId');

        if (!childProductId) {
            return NextResponse.json(
                { error: 'Missing childProductId' },
                { status: 400 }
            );
        }

        await prisma.productBundle.deleteMany({
            where: {
                mainProductId: params.id,
                childProductId,
            },
        });

        return NextResponse.json({ message: 'Bundle deleted successfully' });
    } catch (error) {
        console.error('Error deleting bundle:', error);
        return NextResponse.json(
            { error: 'Failed to delete bundle' },
            { status: 500 }
        );
    }
}
