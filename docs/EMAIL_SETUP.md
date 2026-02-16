# 📧 Email Service - Production-Ready Setup

**Status:** Production-Ready
**Date:** February 15, 2026

---

## Overview

The email system uses a **three-tier fallback approach** with no code duplication:

```
Tier 1: Resend API (Production) ✅
   ↓ (on failure)
Tier 2: Nodemailer SMTP (Fallback) ✅
   ↓ (on failure)
Tier 3: Console Logging (Development)
```

---

## Architecture

### File Structure
```
apps/dashboard/lib/email/
├── index.ts              # Main export (API)
├── service.ts            # High-level functions (80 lines)
├── sender.ts             # Unified sender (180 lines)
└── templates.ts          # Reusable templates (350 lines)
```

### No Code Duplication ✅
- **Templates:** Centralized in `templates.ts` (write once, use everywhere)
- **Sending Logic:** Unified in `sender.ts` (try Resend → Nodemailer → console)
- **API:** Clean high-level functions in `service.ts`

---

## Email Types Supported

### 1. Email Verification
```typescript
import { sendVerificationEmail } from '@/lib/email';

await sendVerificationEmail(
  'user@example.com',
  'token_abc123',
  'John Doe'  // optional
);
```
**Template:** Beautiful HTML with 24h countdown

### 2. Password Reset
```typescript
import { sendPasswordResetEmail } from '@/lib/email';

await sendPasswordResetEmail(
  'user@example.com',
  'token_xyz789',
  'John Doe'  // optional
);
```
**Template:** Warning banner, 1h expiry

### 3. Welcome Email
```typescript
import { sendWelcomeEmail } from '@/lib/email';

await sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);
```
**Template:** Next steps guide

### 4. Budget Alert
```typescript
import { sendBudgetAlertEmail } from '@/lib/email';

await sendBudgetAlertEmail(
  'user@example.com',
  'My Project',
  450.50,    // spent
  500,       // limit
  90         // percentage
);
```
**Template:** Visual progress bar

### 5. Activity Notifications
```typescript
import { sendActivityNotificationEmail } from '@/lib/email';

await sendActivityNotificationEmail(
  'user@example.com',
  'new_login',  // 'new_login' | 'password_changed' | 'email_changed'
  new Date(),
  '192.168.1.1'
);
```
**Template:** Security alert

### 6. Custom Email
```typescript
import { sendTransactionalEmail } from '@/lib/email';

await sendTransactionalEmail(
  'user@example.com',
  'Custom Subject',
  '<p>Your custom HTML content</p>',
  {
    actionUrl: 'https://...',
    actionText: 'Click Me',
  }
);
```

### 7. Bulk Emails
```typescript
import { sendBulkEmails } from '@/lib/email';

const results = await sendBulkEmails(
  [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
  ],
  'Newsletter',
  '<p>Hello {{name}}, ...</p>',
  100  // delay ms between sends
);

console.log(`Sent: ${results.successful}/${results.total}`);
```

---

## Configuration

### Environment Variables

```bash
# Required: At least one provider must be configured

# 1. RESEND (Primary for Production)
RESEND_API_KEY=re_abc123def456...

# 2. SMTP (Fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@agentcost.dev

# 3. Branding
EMAIL_FROM_NAME=AgentCost

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Setup Instructions

### Option 1: Resend (Recommended for Production)

1. **Create Resend Account**
   - Go to https://resend.com
   - Sign up

2. **Get API Key**
   - Dashboard → API Keys
   - Create new key
   - Copy the `re_...` key

3. **Add to Environment**
   ```bash
   RESEND_API_KEY=re_abc123def456...
   ```

4. **Verify Domain (Optional but Recommended)**
   - Resend Dashboard → Domains
   - Add your domain
   - Follow DNS setup
   - This improves deliverability

**Pricing:** 100 emails/day free, then $0.20 per 1000

---

### Option 2: SMTP (Development/Fallback)

#### Gmail
1. **Enable 2FA**
   - Google Account → Security
   - Enable 2-Step Verification

2. **Create App Password**
   - https://myaccount.google.com/apppasswords
   - Select Mail + App (other)
   - Get 16-character password

3. **Add to Environment**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=<16-char-password>
   ```

#### SendGrid
1. **Create Account**
   - https://sendgrid.com
   - Verify sender email

2. **Create API Key**
   - Settings → API Keys
   - Create new key

3. **Add to Environment**
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=<sendgrid-api-key>
   ```

#### Other SMTP Services
- Mailgun
- AWS SES
- SparkPost
- etc.

Just configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`

---

### Option 3: Development Mode (Console Logging)

If neither Resend nor SMTP is configured, emails log to console:

```
📧 EMAIL (Logged to console - no provider available)
────────────────────────────────────────────
To:       user@example.com
Subject:  Your Email Subject
─────────────────────────────────────────────
[HTML Email Content - 2450 bytes]
─────────────────────────────────────────────
Message ID: msg_1234567890_abc123
Timestamp:  2026-02-15T10:30:00.000Z
────────────────────────────────────────────
```

Perfect for local development without external services.

---

## Production Deployment

### Recommended Setup

**Tier 1 (Primary):**
- Resend API key from environment
- Most reliable, best deliverability
- No infrastructure needed

**Tier 2 (Fallback):**
- SMTP (Gmail, SendGrid, or custom)
- Automatic fallback if Resend fails
- No performance impact

**Result:** Email always gets sent, even if primary fails

### Environment Variables Checklist

```bash
# Required
RESEND_API_KEY=re_...
JWT_SECRET=...
POSTGRES_URL=...

# Optional (for fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...

# Recommended
EMAIL_FROM_NAME=AgentCost
NEXT_PUBLIC_APP_URL=https://agentcost.dev
```

---

## Usage in API Routes

### Example: Register Route
```typescript
// apps/dashboard/app/api/auth/register/route.ts
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  // ... validation & user creation ...

  // Send verification email
  const emailResult = await sendVerificationEmail(
    user.email,
    verificationToken,
    user.fullName
  );

  if (!emailResult.success) {
    console.error('Email send failed:', emailResult.error);
    // Decide: fail the request or succeed but warn?
  }

  return NextResponse.json({ success: true });
}
```

### Error Handling
```typescript
const result = await sendVerificationEmail(email, token);

if (!result.success) {
  // Email failed
  console.error('Failed to send:', result.error);
  console.log('Provider:', result.provider);
  
  // Can still let user proceed (email will retry)
  // Or ask user to resend manually later
}
```

---

## Testing

### Test in Development

```typescript
// apps/dashboard/app/api/email/test/route.ts
import { testEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  const result = await testEmail(email);
  return NextResponse.json(result);
}
```

Then:
```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Check Configuration
```typescript
import { getEmailConfig, logEmailSetup } from '@/lib/email';

// In your startup code
logEmailSetup();

// Get config
const config = getEmailConfig();
console.log(config);
// {
//   isProduction: false,
//   hasResend: true,
//   hasNodemailer: true,
//   fromEmail: 'noreply@agentcost.dev',
//   fromName: 'AgentCost',
//   appUrl: 'http://localhost:3000'
// }
```

---

## Email Templates

### Reusable Template Components

All templates built with:
- **Responsive Design** (mobile-friendly)
- **Consistent Styling** (branded colors)
- **Action Buttons** (calls-to-action)
- **Security Notes** (where applicable)
- **Footer** (unsubscribe, copyright)

### Adding New Email Type

1. **Create template function** in `templates.ts`:
   ```typescript
   export function myEmailTemplate(data: any): string {
     const bodyContent = `
       ${emailHeader('My Email Title', '📧')}
       <div class="body">
         <p>Content here</p>
       </div>
     `;
     return emailLayout(bodyContent);
   }
   ```

2. **Create service function** in `service.ts`:
   ```typescript
   export async function sendMyEmail(email: string, data: any) {
     const html = myEmailTemplate(data);
     return sendEmailWithTemplate(email, 'Subject', html);
   }
   ```

3. **Use in API route**:
   ```typescript
   import { sendMyEmail } from '@/lib/email';
   await sendMyEmail('user@example.com', data);
   ```

---

## Monitoring & Logging

### Console Output

**Success:**
```
✅ Email sent via Resend: {
  to: 'user@example.com',
  subject: 'Welcome to AgentCost!',
  messageId: 're_abc123'
}
```

**Fallback:**
```
⚠️  Resend failed, trying fallback...
✅ Email sent via Nodemailer: {
  to: 'user@example.com',
  subject: 'Welcome to AgentCost!',
  messageId: 'abc123@example.com'
}
```

**Both Failed:**
```
❌ Resend send error: Network error
❌ Nodemailer send error: SMTP connection failed
📧 EMAIL (Logged to console - no provider available)
To:       user@example.com
Subject:  Welcome to AgentCost!
...
```

### Return Values

All functions return:
```typescript
{
  success: boolean;
  messageId?: string;      // Email provider's ID
  error?: string;          // Error message if failed
  provider?: 'resend' | 'nodemailer' | 'console';
}
```

---

## Rate Limiting

### Per Provider

**Resend:** 100 emails/day free, then paid
**SMTP:** Depends on provider (Gmail: 500/day, SendGrid: varies)

### Bulk Email Rate Limiting

Built-in delay between sends to avoid rate limiting:

```typescript
await sendBulkEmails(recipients, subject, html, 100); // 100ms delay
```

---

## Best Practices

✅ **Always** check return value
```typescript
const result = await sendVerificationEmail(email, token);
if (!result.success) {
  console.error('Email failed:', result.error);
}
```

✅ **Log** email sends for debugging
```typescript
console.log('Email result:', {
  to: email,
  provider: result.provider,
  success: result.success,
});
```

✅ **Test** with real email in staging
```bash
RESEND_API_KEY=re_... pnpm dev
```

✅ **Monitor** email deliverability
- Check spam folder
- Review bounce rates
- Monitor unsubscribes

❌ **Don't** hardcode email addresses
❌ **Don't** ignore failed sends silently
❌ **Don't** mix templates with send logic

---

## Troubleshooting

### Email Not Sending

1. **Check configuration**
   ```typescript
   import { getEmailConfig } from '@/lib/email';
   console.log(getEmailConfig());
   ```

2. **Enable logging**
   ```bash
   NODE_ENV=development pnpm dev
   ```

3. **Test with console fallback**
   - Remove RESEND_API_KEY
   - Remove SMTP credentials
   - Emails will log to console

### Email in Spam

**Resend:**
- Verify domain in Resend dashboard
- Check SPF/DKIM records

**SMTP:**
- Verify sender address
- Check email content (avoid spam triggers)

### Rate Limiting

**Resend:**
- Wait for free tier reset
- Or upgrade account

**SMTP/Gmail:**
- Delay between bulk sends: `sendBulkEmails(..., 200)`
- Spread sends over time

---

## API Reference

```typescript
// Send individual emails
sendVerificationEmail(email, token, name?)
sendPasswordResetEmail(email, token, name?)
sendWelcomeEmail(email, name)
sendBudgetAlertEmail(email, project, spent, limit, %, name?)
sendActivityNotificationEmail(email, type, time, ip, name?)
sendTransactionalEmail(email, subject, content, options?)

// Bulk operations
sendBulkEmails(recipients, subject, html, delayMs?)

// Testing
testEmail(email)

// Configuration
getEmailConfig()
logEmailSetup()

// Low-level
sendEmail(options)
sendEmailWithTemplate(to, subject, html, replyTo?)
```

---

## Summary

✅ **Production-Ready** - Uses Resend + fallback
✅ **No Code Duplication** - Centralized templates
✅ **DRY Principles** - Single source of truth
✅ **Flexible** - Works with any SMTP provider
✅ **Fallback Support** - Automatic tier switching
✅ **Easy to Test** - Console logging in dev
✅ **Well Documented** - Clear function signatures
✅ **Type Safe** - Full TypeScript support

**Ready to use in Phase 2 API routes!**
