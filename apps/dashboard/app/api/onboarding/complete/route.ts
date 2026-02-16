import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { withAuth } from '@/lib/api-middleware';

// POST /api/onboarding/complete - Mark onboarding as complete
export const POST = withAuth(async (request: NextRequest, user) => {
    await sql`
    UPDATE users 
    SET onboarding_completed = true 
    WHERE id = ${user.userId}
  `;

    return NextResponse.json({ success: true });
});
