import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/products/[id] - Lấy chi tiết sản phẩm
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                Category: true,
                ProductBundle_ProductBundle_mainProductIdToProduct: {
                    include: {
                        Product_ProductBundle_childProductIdToProduct: true,
                    },
                },
                ProductBundle_ProductBundle_childProductIdToProduct: {
                    include: {
                        Product_ProductBundle_mainProductIdToProduct: true,
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

// PUT /api/products/[id] - Cập nhật sản phẩm
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
        const {
            code,
            name,
            description,
            categoryId,
            unit,
            costPrice,
            price,
            priceMin,
            priceMax,
            supplier,
            kgPerBag,
            invoiceQuantity,
            vat,
            isUnlimited,
        } = body;

        // Check if product exists
        const existing = await prisma.product.findUnique({
            where: { id: params.id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check if code is being changed and already exists
        if (code && code !== existing.code) {
            const codeExists = await prisma.product.findUnique({
                where: { code },
            });

            if (codeExists) {
                return NextResponse.json(
                    { error: 'Product code already exists' },
                    { status: 400 }
                );
            }
        }

        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                code: code || existing.code,
                name: name || existing.name,
                description: description !== undefined ? description : existing.description,
                categoryId: categoryId || existing.categoryId,
                unit: unit || existing.unit,
                costPrice: costPrice !== undefined ? costPrice : existing.costPrice,
                price: price !== undefined ? price : existing.price,
                priceMin: priceMin !== undefined ? priceMin : existing.priceMin,
                priceMax: priceMax !== undefined ? priceMax : existing.priceMax,
                supplier: supplier !== undefined ? supplier : existing.supplier,
                kgPerBag: kgPerBag !== undefined ? kgPerBag : existing.kgPerBag,
                invoiceQuantity: invoiceQuantity !== undefined ? invoiceQuantity : existing.invoiceQuantity,
                vat: vat !== undefined ? vat : existing.vat,
                isUnlimited: isUnlimited !== undefined ? isUnlimited : existing.isUnlimited,
                updatedAt: new Date(),
            },
            include: {
                Category: true,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

// DELETE /api/products/[id] - Xóa sản phẩm
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if product exists
        const existing = await prisma.product.findUnique({
            where: { id: params.id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check if product is used in any transactions
        const [orderItems, stockItems] = await Promise.all([
            prisma.orderItem.count({ where: { productId: params.id } }),
            prisma.stockItem.count({ where: { productId: params.id } }),
        ]);

        if (orderItems > 0 || stockItems > 0) {
            return NextResponse.json(
                { error: 'Cannot delete product that is used in transactions' },
                { status: 400 }
            );
        }

        await prisma.product.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
