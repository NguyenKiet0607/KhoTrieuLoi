/**
 * Login API Route
 *
 * NEW VERSION: Next.js 14 API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';
import { logActivity, getClientIP, getUserAgent } from '@/lib/activityLogger';
import { getDefaultUserPermissions } from '@/lib/permissionsConfig';

const JWT_SECRET = process.env.JWT_SECRET || 'please_change';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { identifier, password, rememberMe } = body; // identifier = email or username

        if (!identifier || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Find user by email or username
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }],
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate token with appropriate expiration
        const expirationTime = rememberMe ? '30d' : '7d';
        const token = await new SignJWT({
            userId: user.id,
            role: user.role,
            name: user.name,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(expirationTime)
            .sign(new TextEncoder().encode(JWT_SECRET));

        // Log login activity
        await logActivity({
            userId: user.id,
            action: 'LOGIN',
            description: 'Đăng nhập thành công',
            ipAddress: getClientIP(request),
            userAgent: getUserAgent(request),
        });

        // Ensure pagePermissions exist
        let pagePermissions = {};
        try {
            if (user.pagePermissions) {
                pagePermissions = JSON.parse(user.pagePermissions);
            } else {
                pagePermissions = getDefaultUserPermissions();
                await prisma.user.update({
                    where: { id: user.id },
                    data: { pagePermissions: JSON.stringify(pagePermissions) },
                });
            }
        } catch {
            pagePermissions = getDefaultUserPermissions();
        }

        return NextResponse.json({
            token,
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
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
