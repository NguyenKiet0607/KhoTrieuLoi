import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Check for static files and images
    if (pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js)$/)) {
        return NextResponse.next();
    }

    // Check authentication - support both cookie and Authorization header
    const cookieToken = request.cookies.get('token')?.value;
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = cookieToken || headerToken;

    // If user has token and tries to access login page, redirect to dashboard
    if (token && pathname === '/login') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    // For API routes, return 401 if no token
    if (pathname.startsWith('/api/')) {
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify token for API routes (optional, can be done in route handlers too)
        // const isValid = await verifyAuth(request);
        // if (!isValid.valid) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        return NextResponse.next();
    }

    // For pages, redirect to login if no token
    if (!token) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
