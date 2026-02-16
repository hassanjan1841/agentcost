import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE users
      SET email_verified = true,
          verification_token = NULL,
          verification_token_expires_at = NULL,
          updated_at = NOW()
      WHERE verification_token = ${token}
        AND verification_token_expires_at > NOW()
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
