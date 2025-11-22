import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const issue = await prisma.stockIssue.findUnique({
            where: { id: params.id },
            include: {
                User: { select: { id: true, name: true, email: true } },
                StockIssueItem: {
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

        if (!issue) {
            return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
        }

        return NextResponse.json(issue);
    } catch (error) {
        console.error('Error fetching issue:', error);
        return NextResponse.json({ error: 'Failed to fetch issue' }, { status: 500 });
    }
}

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
        const { status, documentPath } = body;

        const issue = await prisma.stockIssue.update({
            where: { id: params.id },
            data: {
                status: status || undefined,
                documentPath: documentPath !== undefined ? documentPath : undefined,
                updatedAt: new Date(),
            },
            include: {
                User: { select: { id: true, name: true, email: true } },
                StockIssueItem: {
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

        return NextResponse.json(issue);
    } catch (error) {
        console.error('Error updating issue:', error);
        return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
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

        await prisma.stockIssue.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Issue deleted successfully' });
    } catch (error) {
        console.error('Error deleting issue:', error);
        return NextResponse.json({ error: 'Failed to delete issue' }, { status: 500 });
    }
}
