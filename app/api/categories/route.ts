import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/categories - Lấy danh sách danh mục
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { Product: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

// POST /api/categories - Tạo danh mục mới
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if name already exists
        const existing = await prisma.category.findUnique({
            where: { name },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Category name already exists' },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
            data: {
                id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name,
                description: description || null,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}

// PUT /api/categories - Cập nhật danh mục
export async function PUT(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, description } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Missing category ID' },
                { status: 400 }
            );
        }

        const existing = await prisma.category.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Check if name is being changed and already exists
        if (name && name !== existing.name) {
            const nameExists = await prisma.category.findUnique({
                where: { name },
            });

            if (nameExists) {
                return NextResponse.json(
                    { error: 'Category name already exists' },
                    { status: 400 }
                );
            }
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                name: name || existing.name,
                description: description !== undefined ? description : existing.description,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

// DELETE /api/categories - Xóa danh mục
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
                { error: 'Missing category ID' },
                { status: 400 }
            );
        }

        // Check if category has products
        const productCount = await prisma.product.count({
            where: { categoryId: id },
        });

        if (productCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category with products' },
                { status: 400 }
            );
        }

        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}
