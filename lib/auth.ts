import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'please_change';

export async function verifyToken(request: NextRequest) {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    console.log('🔍 [AUTH] Verifying token:', token ? `exists (${token.substring(0, 20)}...)` : 'MISSING');

    if (!token) {
        console.log('❌ [AUTH] No token found in Authorization header');
        return null;
    }

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(JWT_SECRET)
        );
        console.log('✅ [AUTH] Token valid for user:', payload.userId, 'role:', payload.role);
        return payload as { userId: string; role: string; name: string };
    } catch (error: any) {
        console.log('❌ [AUTH] Token verification failed:', error.message);
        return null;
    }
}

export async function verifyAuth(request: NextRequest) {
    const user = await verifyToken(request);
    return {
        valid: !!user,
        user: user ? { id: user.userId, role: user.role, name: user.name } : null,
    };
}

export async function isAdmin(request: NextRequest) {
    const payload = await verifyToken(request);
    return payload?.role === 'ADMIN';
}

