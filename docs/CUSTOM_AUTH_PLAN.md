# 🔐 Custom Authentication Implementation Plan

## Overview

Build a custom JWT-based authentication system from scratch. No Clerk, Auth0, or third-party auth providers.

---

## 1. Database Schema Changes

### Add Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  email_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verification_token_expires_at TIMESTAMP,
  password_reset_token TEXT,
  password_reset_token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### Modify Projects Table
```sql
-- Add user_id to projects (link project to user)
ALTER TABLE projects ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create project members table for team access
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'editor', 'viewer')) DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
```

### API Keys Table (for SDK)
```sql
-- Keep API keys separate for SDK integration
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  key_preview TEXT,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_keys_project ON api_keys(project_id);
```

---

## 2. Environment Variables

Add to `.env.local`:
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@agentcost.dev

# Token Expiry
PASSWORD_RESET_TOKEN_EXPIRES_IN=1h
EMAIL_VERIFICATION_EXPIRES_IN=24h

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Core Authentication Libraries

### File: `apps/dashboard/lib/auth.ts`
```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT tokens
export function generateJWT(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch {
    return null;
  }
}

// Random tokens for email verification & password reset
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// API keys for SDK
export function generateAPIKey(): string {
  return 'ak_' + crypto.randomBytes(24).toString('hex');
}

export function hashAPIKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Validate password strength
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### File: `apps/dashboard/lib/email-service.ts`
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify your AgentCost email',
    html: `
      <h2>Welcome to AgentCost!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset your AgentCost password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `,
  });
}
```

---

## 4. API Routes

### 1. Register: `POST /api/auth/register`
```typescript
// apps/dashboard/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { 
  hashPassword, 
  generateRandomToken, 
  isStrongPassword, 
  isValidEmail 
} from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and name required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be 8+ chars with uppercase, lowercase, numbers' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const verificationToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name, verification_token, verification_token_expires_at)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${fullName}, ${verificationToken}, ${expiresAt})
      RETURNING id, email, full_name
    `;

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({
      success: true,
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name,
      },
      message: 'Verification email sent. Please check your inbox.',
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 2. Login: `POST /api/auth/login`
```typescript
// apps/dashboard/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyPassword, generateJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find user
    const result = await sql`
      SELECT id, password_hash, full_name, email_verified 
      FROM users 
      WHERE email = ${email.toLowerCase()}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check email verified
    if (!user.email_verified) {
      return NextResponse.json(
        { error: 'Please verify your email first' },
        { status: 403 }
      );
    }

    // Generate JWT
    const token = generateJWT(user.id, email);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: email,
        fullName: user.full_name,
      },
    });

    // Set JWT in httpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. Verify Email: `POST /api/auth/verify`
```typescript
// apps/dashboard/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 }
      );
    }

    // Find user with token
    const result = await sql`
      SELECT id 
      FROM users 
      WHERE verification_token = ${token}
      AND verification_token_expires_at > NOW()
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const userId = result.rows[0].id;

    // Mark email as verified
    await sql`
      UPDATE users 
      SET email_verified = true,
          verification_token = NULL,
          verification_token_expires_at = NULL
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. Forgot Password: `POST /api/auth/forgot-password`
```typescript
// apps/dashboard/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { generateRandomToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    // Find user
    const result = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'If email exists, reset link has been sent',
      });
    }

    const userId = result.rows[0].id;
    const resetToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await sql`
      UPDATE users 
      SET password_reset_token = ${resetToken},
          password_reset_token_expires_at = ${expiresAt}
      WHERE id = ${userId}
    `;

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({
      success: true,
      message: 'Reset link sent to your email',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 5. Reset Password: `POST /api/auth/reset-password`
```typescript
// apps/dashboard/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword, isStrongPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password required' },
        { status: 400 }
      );
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be 8+ chars with uppercase, lowercase, numbers' },
        { status: 400 }
      );
    }

    // Find user with valid token
    const result = await sql`
      SELECT id FROM users 
      WHERE password_reset_token = ${token}
      AND password_reset_token_expires_at > NOW()
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const userId = result.rows[0].id;
    const passwordHash = await hashPassword(password);

    // Update password
    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash},
          password_reset_token = NULL,
          password_reset_token_expires_at = NULL
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. Please log in.',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 6. Logout: `POST /api/auth/logout`
```typescript
// apps/dashboard/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.set('token', '', {
    httpOnly: true,
    maxAge: 0,
  });

  return response;
}
```

### 7. Get Current User: `GET /api/auth/me`
```typescript
// apps/dashboard/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get fresh user data from DB
    const result = await sql`
      SELECT id, email, full_name 
      FROM users 
      WHERE id = ${payload.userId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 5. Frontend Components

### File: `apps/dashboard/components/auth/LoginForm.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p className="text-sm text-gray-600">
        Don't have an account? <Link href="/auth/register">Register</Link>
      </p>
      <p className="text-sm text-gray-600">
        <Link href="/auth/forgot-password">Forgot password?</Link>
      </p>
    </form>
  );
}
```

---

## 6. Update Projects Routes

### Update: `apps/dashboard/app/api/projects/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get projects owned by user or shared with them
    const result = await sql`
      SELECT p.* FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = ${payload.userId}
      OR pm.user_id = ${payload.userId}
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json({ projects: result.rows });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO projects (name, owner_id)
      VALUES (${name}, ${payload.userId})
      RETURNING *
    `;

    return NextResponse.json({ project: result.rows[0] }, { status: 201 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

## 7. Implementation Checklist

### Phase 1: Setup (2-3 hours)
- [ ] Install dependencies: `pnpm add bcryptjs jsonwebtoken nodemailer`
- [ ] Install types: `pnpm add -D @types/bcryptjs @types/jsonwebtoken`
- [ ] Create database migration file
- [ ] Add environment variables to `.env.local`
- [ ] Create `lib/auth.ts` and `lib/email-service.ts`

### Phase 2: API Routes (4-5 hours)
- [ ] Create `/api/auth/register`
- [ ] Create `/api/auth/login`
- [ ] Create `/api/auth/logout`
- [ ] Create `/api/auth/verify`
- [ ] Create `/api/auth/forgot-password`
- [ ] Create `/api/auth/reset-password`
- [ ] Create `/api/auth/me`
- [ ] Update `/api/projects` to use JWT

### Phase 3: Frontend (3-4 hours)
- [ ] Create auth pages (`/auth/login`, `/auth/register`, etc.)
- [ ] Create LoginForm component
- [ ] Create RegisterForm component
- [ ] Create password reset form
- [ ] Add auth context/hooks
- [ ] Update dashboard to check auth

### Phase 4: Protect Routes (2-3 hours)
- [ ] Create middleware to check auth on dashboard
- [ ] Redirect unauthenticated users to login
- [ ] Update /api/track to use JWT
- [ ] Update /api/costs to use JWT
- [ ] Update /api/budgets to use JWT

### Phase 5: Testing (2-3 hours)
- [ ] Test registration flow
- [ ] Test login/logout
- [ ] Test email verification
- [ ] Test password reset
- [ ] Test project access control
- [ ] Test token expiry

---

## 8. Dependencies to Install

```bash
pnpm add bcryptjs jsonwebtoken nodemailer
pnpm add -D @types/bcryptjs @types/jsonwebtoken @types/nodemailer
```

---

## 9. Security Checklist

- ✅ Passwords hashed with bcryptjs
- ✅ JWT signed with secret
- ✅ Cookies httpOnly and secure
- ✅ Email verification required
- ✅ Password reset tokens expire
- ✅ Rate limiting on auth endpoints (TODO)
- ✅ CORS properly configured (TODO)
- ✅ HTTPS enforced in production (TODO)

---

## 10. Next Steps After Auth

Once auth is complete:
1. Update SDK to use API key auth (separate from JWT)
2. Implement rate limiting on API endpoints
3. Add security headers middleware
4. Setup SMTP email service
5. Create password strength validator
6. Add 2FA support (optional)

---

**Status:** Ready to implement
**Estimated Total Time:** 15-20 hours
**Difficulty:** Medium
