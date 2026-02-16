# 🔐 Authentication Implementation Checklist

## Phase 1: Setup ✅ COMPLETE

- [x] Install dependencies (bcryptjs, jsonwebtoken, nodemailer)
- [x] Create database migration (001_add_auth_tables.sql)
- [x] Create auth.ts library with all utility functions
- [x] Create email-service.ts with email templates
- [x] Create .env.local.example template
- [x] Document environment variables
- [x] Create PHASE_1_AUTH_IMPLEMENTATION.md summary

**Status:** READY FOR PHASE 2 ✅

---

## Phase 2: API Routes ✅ COMPLETE

### Register Route
- [x] Create `/api/auth/register/route.ts`
- [x] Validate email & password
- [x] Check for existing user
- [x] Hash password
- [x] Create user in database
- [x] Generate verification token
- [x] Send verification email
- [x] Return success response

### Login Route
- [x] Create `/api/auth/login/route.ts`
- [x] Find user by email
- [x] Verify password hash
- [x] Check email verified
- [x] Generate JWT token
- [x] Set httpOnly cookie
- [x] Return user data

### Logout Route
- [x] Create `/api/auth/logout/route.ts`
- [x] Clear JWT cookie
- [x] Return success

### Email Verification
- [x] Create `/api/auth/verify/route.ts`
- [x] Find user by token
- [x] Check token expiry
- [x] Mark email as verified
- [x] Clear verification token

### Forgot Password
- [x] Create `/api/auth/forgot-password/route.ts`
- [x] Find user by email
- [x] Generate reset token
- [x] Store reset token with expiry
- [x] Send password reset email
- [x] Don't reveal if email exists

### Reset Password
- [x] Create `/api/auth/reset-password/route.ts`
- [x] Find user by reset token
- [x] Check token expiry
- [x] Validate new password
- [x] Hash new password
- [x] Update in database
- [x] Clear reset token

### Get Current User
- [x] Create `/api/auth/me/route.ts`
- [x] Extract JWT from cookie
- [x] Verify token validity
- [x] Get fresh user from database
- [x] Return user data

**Status:** COMPLETE ✅

---

## Phase 3: Frontend Components ✅ COMPLETE

### Pages
- [x] `/auth/register` - Registration form
- [x] `/auth/login` - Login form
- [x] `/auth/verify` - Verify email
- [x] `/auth/forgot-password` - Request reset
- [x] `/auth/reset-password` - Reset form

### Components
- [x] Auth context & useAuth hook (`lib/auth-context.tsx`)
- [x] Toast notifications (`components/ui/toast.tsx`, `toaster.tsx`, `use-toast.ts`)
- [x] Toaster in root layout

### Hooks
- [x] `useAuth` hook in auth-context.tsx
- [x] `useToast` hook in use-toast.ts

### Middleware
- [x] Dashboard page protected with auth check

**Status:** COMPLETE ✅

---

## Phase 4: Protect Routes (NEXT)

### Update Projects Routes
- [ ] Change `/api/projects` to use JWT instead of API key
- [ ] Verify user ownership before access
- [ ] Filter projects by user

### Update Dashboard Routes
- [ ] Add auth check to `/api/costs`
- [ ] Add auth check to `/api/budgets`
- [ ] Add auth check to `/api/export`
- [ ] Add auth check to `/api/track` (keep API key for SDK)

### Middleware
- [ ] Create middleware for protected pages
- [ ] Redirect unauthenticated to login
- [ ] Check token validity on every request

**Estimated Time:** 2-3 hours

---

## Phase 5: Testing (VERIFY)

### API Testing
- [ ] Test registration with valid data
- [ ] Test registration with invalid email
- [ ] Test registration with weak password
- [ ] Test login with correct credentials
- [ ] Test login with wrong password
- [ ] Test email verification
- [ ] Test password reset flow
- [ ] Test token expiry

### Frontend Testing
- [ ] Test register page loads
- [ ] Test login page loads
- [ ] Test form validation
- [ ] Test error messages
- [ ] Test redirect on login
- [ ] Test logout works

### Integration Testing
- [ ] Register → Verify → Login flow
- [ ] Forgot password → Reset → Login flow
- [ ] Project access after login
- [ ] API endpoints with JWT

**Estimated Time:** 2-3 hours

---

## Environment Setup

### Before Running Code

1. **Set JWT_SECRET:**
   ```bash
   # Generate a random 32+ char secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Add to `.env.local`:
   ```
   JWT_SECRET=<your-generated-secret>
   ```

2. **Configure Email (Optional for Dev):**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```
   (In dev mode, emails will log to console if SMTP not configured)

3. **Set App URL:**
   ```
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run Database Migration:**
   ```bash
   psql $POSTGRES_URL < apps/dashboard/lib/migrations/001_add_auth_tables.sql
   ```

---

## Summary

| Phase | Status | Time Est | Start When |
|-------|--------|----------|-----------|
| 1. Setup | ✅ DONE | 30m | Now |
| 2. API Routes | ✅ DONE | ✅ DONE | After Phase 1 |
| 3. Frontend | ✅ DONE | ✅ DONE | After Phase 2 |
| 4. Protect Routes | ⏳ NEXT | 2-3h | After Phase 3 |
| 5. Testing | ⏳ FINAL | 2-3h | After Phase 4 |

**Total Estimated Time:** 15-20 hours
**Current Progress:** Phase 1-3 Complete

---

## Quick Commands

```bash
# Generate JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Run database migration
psql $POSTGRES_URL < apps/dashboard/lib/migrations/001_add_auth_tables.sql

# Start dev server
cd apps/dashboard && pnpm dev

# Check dependencies
pnpm list | grep -E "bcryptjs|jsonwebtoken|nodemailer"
```

---

**Next Step:** Ready to start Phase 2? Let me know and I'll create all the API routes!
