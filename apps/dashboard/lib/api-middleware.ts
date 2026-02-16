import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, JWTPayload } from '@/lib/auth';

export type AuthenticatedRequest = NextRequest & {
    user: JWTPayload;
};

type RouteHandler = (
    req: NextRequest,
    user: JWTPayload,
    context?: any
) => Promise<NextResponse>;

export function withAuth(handler: RouteHandler) {
    return async (req: NextRequest, context?: any) => {
        try {
            const token = req.cookies.get('token')?.value;

            if (!token) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            const decoded = verifyJWT(token);
            if (!decoded || !decoded.userId) {
                return NextResponse.json(
                    { error: 'Invalid token' },
                    { status: 401 }
                );
            }

            // Call the handler with the authenticated user
            return await handler(req, decoded, context);

        } catch (error) {
            console.error('API Error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}
