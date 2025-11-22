import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/products - Lấy danh sách sản phẩm
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('categoryId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { code: { contains: search } },
                { description: { contains: search } },
            ];
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    Category: true,
                },
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// POST /api/products - Tạo sản phẩm mới
export async function POST(request: NextRequest) {
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

        // Validate required fields
        if (!code || !name || !categoryId || !unit) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if code already exists
        const existing = await prisma.product.findUnique({
            where: { code },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Product code already exists' },
                { status: 400 }
            );
        }

        const product = await prisma.product.create({
            data: {
                id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                code,
                name,
                description: description || null,
                categoryId,
                unit,
                costPrice: costPrice || 0,
                price: price || 0,
                priceMin: priceMin || 0,
                priceMax: priceMax || 0,
                supplier: supplier || null,
                kgPerBag: kgPerBag || 25.0,
                invoiceQuantity: invoiceQuantity || 0,
                vat: vat || 0,
                isUnlimited: isUnlimited || false,
                updatedAt: new Date(),
            },
            include: {
                Category: true,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
