import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyPassword, generateJWT, sanitizeEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const sanitizedEmail = sanitizeEmail(email);

    const result = await sql`
      SELECT id, email, password_hash, full_name, email_verified
      FROM users WHERE email = ${sanitizedEmail}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = result.rows[0];

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.email_verified) {
      return NextResponse.json({ error: 'Please verify your email before logging in' }, { status: 403 });
    }

    const token = generateJWT(user.id, user.email);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, fullName: user.full_name },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
