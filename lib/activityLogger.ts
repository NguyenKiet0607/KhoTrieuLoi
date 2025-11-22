import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

interface LogActivityParams {
    userId: string;
    action: string;
    category?: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
}

export async function logActivity({
    userId,
    action,
    category,
    description,
    ipAddress,
    userAgent,
    details,
}: LogActivityParams) {
    try {
        await prisma.activityLog.create({
            data: {
                id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId,
                action,
                category: category || 'GENERAL',
                description,
                ipAddress,
                userAgent,
                details: details ? JSON.stringify(details) : undefined,
            },
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}

export function getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    return request.ip || 'unknown';
}

export function getUserAgent(request: NextRequest): string {
    return request.headers.get('user-agent') || 'unknown';
}

