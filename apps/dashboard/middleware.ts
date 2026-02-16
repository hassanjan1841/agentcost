import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define paths
const PUBLIC_PATHS = [
    '/',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/verify',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/webhooks/stripe',
];

const AUTH_PATHS = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Allow public API routes and static files
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') || // files like favicon.ico
        PUBLIC_PATHS.includes(pathname)
    ) {
        return NextResponse.next();
    }

    // 2. Get token from cookie
    const token = request.cookies.get('token')?.value;

    // 3. Verify token
    let isValid = false;
    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            await jwtVerify(token, secret);
            isValid = true;
        } catch (err) {
            isValid = false;
        }
    }

    // 4. Handle Redirection Logic

    // Scenario A: Authenticated User trying to access Auth Pages (Login/Register)
    // Redirect them to Dashboard because they are already logged in
    if (isValid && AUTH_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Scenario B: Unauthenticated User trying to access Protected Pages
    // (Everything NOT public and NOT an auth page is protected by default)
    const isPublicPath = PUBLIC_PATHS.includes(pathname) || AUTH_PATHS.some(path => pathname.startsWith(path));

    if (!isValid && !isPublicPath) {
        const loginUrl = new URL('/auth/login', request.url);
        // Add ?from=... to redirect back after login
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
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
