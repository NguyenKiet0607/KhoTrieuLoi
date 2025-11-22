/**
 * Verify Token API Route
 * 
 * NEW VERSION: Next.js 14 API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDefaultUserPermissions } from '@/lib/permissionsConfig';

export async function GET(request: NextRequest) {
    try {
        const payload = await verifyToken(request);
        if (!payload) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                pagePermissions: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            );
        }

        // Parse pagePermissions
        let pagePermissions = {};
        try {
            if (user.pagePermissions) {
                pagePermissions = JSON.parse(user.pagePermissions);
            } else {
                pagePermissions = getDefaultUserPermissions();
                // Save to database
                await prisma.user.update({
                    where: { id: user.id },
                    data: { pagePermissions: JSON.stringify(pagePermissions) },
                });
            }
        } catch (e) {
            pagePermissions = getDefaultUserPermissions();
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions || '[]',
                pagePermissions,
            },
        });
    } catch (error) {
        console.error('Verify error:', error);
        return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
        );
    }
}
