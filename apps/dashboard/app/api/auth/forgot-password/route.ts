import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { generateRandomToken, isValidEmail, sanitizeEmail } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const sanitizedEmail = sanitizeEmail(email);

    const result = await sql`
      SELECT id, full_name FROM users WHERE email = ${sanitizedEmail}
    `;

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const resetToken = generateRandomToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      await sql`
        UPDATE users
        SET password_reset_token = ${resetToken},
            password_reset_token_expires_at = ${expiresAt},
            updated_at = NOW()
        WHERE id = ${user.id}
      `;

      await sendPasswordResetEmail(sanitizedEmail, resetToken, user.full_name);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
