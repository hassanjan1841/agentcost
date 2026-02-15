# Week 1 Critical Priorities - Before Public Launch

## ⚠️ MUST COMPLETE THIS WEEK

These 5 items are blocking public launch. All must be done before making repo public.

---

## 1. Email Alerts Integration (2-3 hours)
**Status:** ❌ BLOCKING - Currently only logs to console

### Current Problem
```typescript
// apps/dashboard/lib/email.ts - Line 11-16
export async function sendAlertEmail(email: AlertEmail) {
  // For demo, log to console (replace with real email service later)
  console.log('📧 EMAIL ALERT:', {
    to: email.to,
    subject: email.subject,
    body: email.body,
  });
  return { success: true };
}
```

### Why This Matters
- Budget alerts don't actually send emails
- Users won't know when they hit budget limits
- Feature appears broken to end users

### Solution: Use Resend API

**Step 1: Install Resend**
```bash
cd apps/dashboard
npm install resend
```

**Step 2: Add Environment Variable**
```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

Get API key from: https://resend.com (sign up → get API key)

**Step 3: Update email.ts**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAlertEmail(email: AlertEmail) {
  try {
    const response = await resend.emails.send({
      from: 'alerts@agentcost.dev',
      to: email.to,
      subject: email.subject,
      html: email.body,
    });
    
    if (response.error) {
      console.error('Email send failed:', response.error);
      return { success: false };
    }
    
    console.log('✅ Email sent to:', email.to);
    return { success: true };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false };
  }
}
```

**Step 4: Test**
```bash
# Create budget and send test event
# Check your email inbox
# Verify email is received
```

**Acceptance Criteria:**
- [ ] Email received when budget threshold hit
- [ ] Email contains correct subject/body
- [ ] Error handling works (invalid email)
- [ ] Logs success/failure to console

**Time to Complete:** 30-45 minutes

---

## 2. Security Headers (2-3 hours)
**Status:** ❌ BLOCKING - Missing all security headers

### Current Problem
- No HTTPS enforcement
- No Content Security Policy
- No X-Frame-Options
- Easy target for XSS/clickjacking attacks

### Solution: Add Next.js Middleware

**File: apps/dashboard/middleware.ts** (Create new file)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Step 2: Test Headers**
```bash
# In browser DevTools → Network tab
# Open any page, click request, check Response Headers
# Should see all security headers

# Or use curl
curl -I http://localhost:3000
# Look for security headers in response
```

**Acceptance Criteria:**
- [ ] Strict-Transport-Security header set
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Content-Security-Policy set
- [ ] Headers appear in all responses

**Time to Complete:** 30 minutes

---

## 3. Rate Limiting (4-6 hours)
**Status:** ❌ BLOCKING - No rate limits

### Current Problem
- Anyone can spam API with unlimited requests
- No protection against DDoS
- Costs can spiral due to abuse

### Solution: Upstash Redis Rate Limiting

**Step 1: Create Upstash Account**
- Go to https://upstash.com
- Sign up → Create Redis database
- Copy connection string

**Step 2: Install Dependencies**
```bash
cd apps/dashboard
npm install @upstash/ratelimit @upstash/redis
```

**Step 3: Add Environment Variables**
```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**Step 4: Create Rate Limit Utility**
**File: apps/dashboard/lib/rate-limit.ts** (Create new file)
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 1000 requests per minute per API key
export const trackRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, '1 m'),
  analytics: true,
  prefix: 'ratelimit:track',
});

// 100 requests per minute per IP (for dashboard)
export const dashboardRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:dashboard',
});
```

**Step 5: Apply Rate Limit to Track API**
**File: apps/dashboard/app/api/track/route.ts** (Update)
```typescript
import { trackRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Get API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }

    // Check rate limit
    const { success, limit, reset, remaining } = await trackRateLimit.limit(
      apiKey
    );

    if (!success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit,
          remaining,
          reset: new Date(reset),
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          },
        }
      );
    }

    // ... rest of track logic
    
    // Return with rate limit info
    return NextResponse.json(
      { success: true, tracked: body.events.length },
      {
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        },
      }
    );

  } catch (error) {
    // ... error handling
  }
}
```

**Step 6: Test Rate Limiting**
```bash
# Send 1001 requests in 1 minute
for i in {1..1001}; do
  curl -X POST http://localhost:3000/api/track \
    -H "x-api-key: ak_demo_test_key_123" \
    -H "Content-Type: application/json" \
    -d '{"events": [...]}'
  sleep 0.05  # 50ms between requests
done

# Request 1001 should return 429 Too Many Requests
```

**Acceptance Criteria:**
- [ ] Rate limit configured (1000 req/min)
- [ ] Returns 429 when limit exceeded
- [ ] Headers show rate limit info
- [ ] Different API keys have separate limits
- [ ] Limits reset after 1 minute

**Time to Complete:** 1-1.5 hours

---

## 4. Error Monitoring with Sentry (3-4 hours)
**Status:** ⚠️ BLOCKING - Console logs only

### Current Problem
- All errors lost after restart
- Can't debug production issues
- No error notifications

### Solution: Integrate Sentry

**Step 1: Create Sentry Account**
- Go to https://sentry.io
- Sign up → Create Next.js project
- Copy DSN

**Step 2: Install Sentry**
```bash
cd apps/dashboard
npm install @sentry/nextjs
```

**Step 3: Initialize Sentry**
**File: apps/dashboard/sentry.client.config.ts** (Create new file)
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
});
```

**File: apps/dashboard/sentry.server.config.ts** (Create new file)
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
});
```

**Step 4: Add to next.config.js**
```javascript
const withSentryConfig = require('@sentry/nextjs').withSentryConfig;

const nextConfig = {
  // ... your config
};

module.exports = withSentryConfig(nextConfig, {
  org: 'your-org',
  project: 'your-project',
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
```

**Step 5: Add Environment Variables**
```bash
# .env.local
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...
```

**Step 6: Replace console.log with Sentry**
```typescript
// Before
console.error('Track error:', error);

// After
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error, {
  level: 'error',
  tags: { context: 'track_api' },
});
console.error('Track error:', error);
```

**Step 7: Test**
```bash
# Trigger an error
throw new Error('Test error');

# Check Sentry dashboard for error report
# https://sentry.io/organizations/[org]/issues/
```

**Acceptance Criteria:**
- [ ] Sentry project created
- [ ] DSN added to environment
- [ ] Errors appear in Sentry dashboard
- [ ] Error context includes relevant info
- [ ] Alerts configured for critical errors

**Time to Complete:** 1-1.5 hours

---

## 5. API Key Validation & Database Check (1-2 hours)
**Status:** ⚠️ NEEDS HARDENING

### Current Problem
```typescript
// apps/dashboard/app/api/track/route.ts
// Allows any API key without validation
```

### Solution: Improve Validation

**Step 1: Add Better Validation**
**File: apps/dashboard/lib/api-key.ts** (Create new file)
```typescript
import { sql } from './db';

export async function validateApiKey(apiKey: string) {
  if (!apiKey || apiKey.length < 10) {
    return { valid: false, error: 'Invalid API key format' };
  }

  try {
    const result = await sql`
      SELECT id, name FROM projects WHERE api_key = ${apiKey}
    `;

    if (result.rows.length === 0) {
      return { valid: false, error: 'API key not found' };
    }

    return {
      valid: true,
      projectId: result.rows[0].id,
      projectName: result.rows[0].name,
    };
  } catch (error) {
    return { valid: false, error: 'Database error' };
  }
}
```

**Step 2: Use in API Routes**
```typescript
// apps/dashboard/app/api/track/route.ts
import { validateApiKey } from '@/lib/api-key';

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required' },
      { status: 401 }
    );
  }

  const validation = await validateApiKey(apiKey);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 401 }
    );
  }

  const projectId = validation.projectId;
  // ... rest of logic
}
```

**Step 3: Test**
```bash
# Valid key
curl -X POST http://localhost:3000/api/track \
  -H "x-api-key: ak_demo_test_key_123"
# Should succeed

# Invalid key
curl -X POST http://localhost:3000/api/track \
  -H "x-api-key: invalid_key_xyz"
# Should return 401
```

**Acceptance Criteria:**
- [ ] Valid API keys accepted
- [ ] Invalid keys rejected (401)
- [ ] Missing keys rejected (401)
- [ ] Database queries optimized
- [ ] Error messages don't leak info

**Time to Complete:** 45 minutes

---

## 📋 Week 1 Summary

| Task | Priority | Time | Status |
|------|----------|------|--------|
| Email Alerts | 🔴 Critical | 30-45m | [ ] |
| Security Headers | 🔴 Critical | 30m | [ ] |
| Rate Limiting | 🔴 Critical | 1-1.5h | [ ] |
| Error Monitoring | 🔴 Critical | 1-1.5h | [ ] |
| API Validation | 🟡 High | 45m | [ ] |

**Total Time: ~5 hours** (can be done in 1-2 days)

---

## ✅ Before Making Repo Public

- [ ] All 5 items above completed
- [ ] Test each feature thoroughly
- [ ] Add .env.example file
- [ ] Update README with new features
- [ ] Run final type check
- [ ] Test build with production build
- [ ] Verify no hardcoded secrets
- [ ] Take dashboard screenshot

---

## 🚀 After Completing Week 1

**Ready to:**
- [ ] Make GitHub repo public
- [ ] Follow LAUNCH.md checklist
- [ ] Post on Twitter, HN, Reddit
- [ ] Engage with comments
- [ ] Monitor error logs
- [ ] Fix issues quickly

---

## 📚 Resources

| Task | Resource |
|------|----------|
| Email | https://resend.com |
| Rate Limit | https://upstash.com |
| Error Monitoring | https://sentry.io |
| Security | https://nextjs.org/docs/advanced-features/security-headers |

---

## 💡 Pro Tips

1. **Do emails first** - Users care about this most
2. **Test each feature** before moving to next
3. **Deploy changes to staging** before production
4. **Keep secrets in .env, not git**
5. **Check Sentry/error logs daily** after launch

---

**Start: This week**
**Target: 1-2 days of focused work**
**Blockers: Getting API keys (Resend, Upstash, Sentry)**

---

**Questions?** See PRODUCTION_READINESS.md for more details.
