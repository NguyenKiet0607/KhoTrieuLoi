import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/issues/[id]/pdf - Generate PDF for issue
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

        return NextResponse.json({
            issue,
            type: 'ISSUE',
            title: 'PHIẾU XUẤT KHO',
        });
    } catch (error) {
        console.error('Error fetching issue for PDF:', error);
        return NextResponse.json(
            { error: 'Failed to fetch issue' },
            { status: 500 }
        );
    }
}
