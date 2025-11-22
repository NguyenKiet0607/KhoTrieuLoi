/**
 * User Permissions API Route
 * 
 * NEW VERSION: Next.js 14 API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDefaultUserPermissions, PAGE_PERMISSIONS, getAllPageKeys } from '@/lib/permissionsConfig';
import { logActivity, getClientIP, getUserAgent } from '@/lib/activityLogger';

// GET user permissions
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const payload = await verifyToken(request);
        if (!payload || !(await isAdmin(request))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                pagePermissions: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        let pagePermissions = {};
        try {
            if (user.pagePermissions) {
                // User has permissions in database, parse and return them
                pagePermissions = JSON.parse(user.pagePermissions);
            } else {
                // User has no permissions in database yet
                // Return empty object - admin needs to explicitly grant permissions
                // This ensures menu items only show when permissions are explicitly granted
                pagePermissions = {};
            }
        } catch (e) {
            // Error parsing, return empty object
            console.error('[Permissions API] Error parsing permissions:', e);
            pagePermissions = {};
        }

        return NextResponse.json({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userRole: user.role,
            pagePermissions,
            availablePages: PAGE_PERMISSIONS,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Internal error' },
            { status: 500 }
        );
    }
}

// PUT update user permissions
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const payload = await verifyToken(request);
        if (!payload || !(await isAdmin(request))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { pagePermissions } = body;

        if (!pagePermissions || typeof pagePermissions !== 'object') {
            return NextResponse.json(
                { error: 'pagePermissions must be an object' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                pagePermissions: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Validate permissions structure
        const validatedPermissions: Record<string, any> = {};
        const availablePageKeys = getAllPageKeys();

        // Parse current permissions
        let currentPerms: Record<string, any> = {};
        try {
            if (user.pagePermissions) {
                currentPerms = JSON.parse(user.pagePermissions);
            } else {
                currentPerms = getDefaultUserPermissions();
            }
        } catch (e) {
            currentPerms = getDefaultUserPermissions();
        }

        // Build validated permissions - use provided permissions, fallback to current, then default
        for (const pageKey of availablePageKeys) {
            if (pagePermissions[pageKey] !== undefined) {
                // Use the permission from request (explicitly set)
                const perm = pagePermissions[pageKey];
                validatedPermissions[pageKey] = {
                    allowed: Boolean(perm.allowed),
                    buttons: Array.isArray(perm.buttons) ? perm.buttons : [],
                };
            } else if (currentPerms[pageKey] !== undefined) {
                // Keep current permission if not in request
                validatedPermissions[pageKey] = currentPerms[pageKey];
            } else {
                // Fallback to default
                const defaultPerms = getDefaultUserPermissions();
                validatedPermissions[pageKey] = defaultPerms[pageKey] || { allowed: false, buttons: [] };
            }
        }

        // Update user permissions
        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: {
                pagePermissions: JSON.stringify(validatedPermissions),
            },
        });

        // Log activity
        await logActivity({
            userId: payload.userId,
            action: 'USER_UPDATE',
            description: `Cập nhật phân quyền cho user: ${user.name} (${user.email})`,
            ipAddress: getClientIP(request),
            userAgent: getUserAgent(request),
            details: { pagePermissions: validatedPermissions },
        });

        return NextResponse.json({
            message: 'Permissions updated successfully',
            userId: updatedUser.id,
            pagePermissions: validatedPermissions,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Internal error' },
            { status: 500 }
        );
    }
}
