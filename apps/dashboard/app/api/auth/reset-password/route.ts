import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword, isStrongPassword, getPasswordFeedback } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      const feedback = getPasswordFeedback(password);
      return NextResponse.json({ error: 'Password is too weak', details: feedback }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const result = await sql`
      UPDATE users
      SET password_hash = ${passwordHash},
          password_reset_token = NULL,
          password_reset_token_expires_at = NULL,
          updated_at = NOW()
      WHERE password_reset_token = ${token}
        AND password_reset_token_expires_at > NOW()
      RETURNING id, email, full_name
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const user = result.rows[0];
    await sendWelcomeEmail(user.email, user.full_name);

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
