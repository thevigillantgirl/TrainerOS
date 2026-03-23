import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/app'];
const publicRoutes = ['/login', '/register', '/'];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
    const isPublicRoute = publicRoutes.includes(path);

    const token = request.cookies.get('session')?.value;
    const session = token ? await decrypt(token) : null;

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    if (isPublicRoute && session && path !== '/') {
        // Redirect based on role
        if (session.role === 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
        } else {
            return NextResponse.redirect(new URL('/app', request.nextUrl));
        }
    }

    // Inject user details in headers for easier extraction in API routes
    const response = NextResponse.next();
    if (session) {
        response.headers.set('x-tenant-id', session.tenantId);
        response.headers.set('x-user-id', session.userId);
        response.headers.set('x-user-role', session.role);
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
