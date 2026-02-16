import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword, generateRandomToken, isStrongPassword, isValidEmail, sanitizeEmail, getPasswordFeedback } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      const feedback = getPasswordFeedback(password);
      return NextResponse.json({ error: 'Password is too weak', details: feedback }, { status: 400 });
    }

    const sanitizedEmail = sanitizeEmail(email);

    const existing = await sql`SELECT id FROM users WHERE email = ${sanitizedEmail}`;
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await sql`
      INSERT INTO users (email, password_hash, full_name, verification_token, verification_token_expires_at)
      VALUES (${sanitizedEmail}, ${passwordHash}, ${fullName.trim()}, ${verificationToken}, ${expiresAt})
    `;

    await sendVerificationEmail(sanitizedEmail, verificationToken, fullName.trim());

    return NextResponse.json(
      { success: true, message: 'Registration successful. Please check your email to verify your account.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
