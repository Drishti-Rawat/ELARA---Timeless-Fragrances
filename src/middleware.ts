import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get(process.env.COOKIE_NAME!)?.value;
    const session = await decrypt(sessionCookie);

    const { pathname } = request.nextUrl;

    // 1. Admin Route Protection
    if (pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (session.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // 2. Delivery Agent Route Protection
    if (pathname.startsWith('/delivery')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (session.role !== 'DELIVERY_AGENT') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // 3. Authenticated Routes Protection
    const authRoutes = ['/cart', '/wishlist', '/orders'];
    if (authRoutes.some(route => pathname.startsWith(route))) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 4. Redirect logged-in users away from Login page
    if (pathname === '/login' && session) {
        if (session.role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        if (session.role === 'DELIVERY_AGENT') {
            return NextResponse.redirect(new URL('/delivery', request.url));
        }
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/delivery/:path*', '/login', '/cart', '/wishlist', '/orders'],
};
