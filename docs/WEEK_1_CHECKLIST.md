# Week 1 Quick Checklist ✅

## Day 1: Email + Security Headers

### Morning (Email Alerts - 45 min)
- [ ] Create Resend account
- [ ] Get API key
- [ ] Add RESEND_API_KEY to .env.local
- [ ] Install resend package
- [ ] Update email.ts with Resend integration
- [ ] Test email delivery
- [ ] Commit changes

### Afternoon (Security Headers - 30 min)
- [ ] Create middleware.ts file
- [ ] Add all security headers
- [ ] Test headers with curl/DevTools
- [ ] Commit changes

### Evening (Bonus - API Validation - 45 min)
- [ ] Create api-key.ts utility
- [ ] Update track/route.ts
- [ ] Test valid/invalid keys
- [ ] Commit changes

---

## Day 2: Rate Limiting + Error Monitoring

### Morning (Rate Limiting - 1.5 hours)
- [ ] Create Upstash account
- [ ] Create Redis database
- [ ] Get credentials
- [ ] Add UPSTASH_* env vars
- [ ] Install @upstash packages
- [ ] Create rate-limit.ts
- [ ] Update track/route.ts with rate limit check
- [ ] Test rate limiting
- [ ] Commit changes

### Afternoon (Error Monitoring - 1.5 hours)
- [ ] Create Sentry account
- [ ] Get DSN
- [ ] Install @sentry/nextjs
- [ ] Create sentry.client.config.ts
- [ ] Create sentry.server.config.ts
- [ ] Update next.config.js
- [ ] Add SENTRY_* env vars
- [ ] Replace console.error with Sentry
- [ ] Test error capture
- [ ] Commit changes

### Evening (Final Prep)
- [ ] Create .env.example with all keys
- [ ] Run full type check
- [ ] Test production build
- [ ] Verify no secrets in git
- [ ] Update AGENTS.md if needed

---

## Pre-Launch Check

### Code Quality
- [ ] pnpm type-check passes
- [ ] No console.error statements (use Sentry)
- [ ] All error cases handled
- [ ] No hardcoded secrets

### Features
- [ ] ✅ Email alerts working
- [ ] ✅ Security headers present
- [ ] ✅ Rate limiting active
- [ ] ✅ Error monitoring live
- [ ] ✅ API validation strict

### Environment
- [ ] .env.local has all keys
- [ ] .env.example documented
- [ ] POSTGRES_URL set
- [ ] RESEND_API_KEY set
- [ ] UPSTASH credentials set
- [ ] SENTRY_DSN set

### Testing
- [ ] Email send test ✅
- [ ] Rate limit test ✅
- [ ] Error capture test ✅
- [ ] Security headers test ✅
- [ ] API key validation test ✅

### Documentation
- [ ] README updated
- [ ] CONTRIBUTING.md present
- [ ] LAUNCH.md ready
- [ ] WEEK_1_PRIORITIES.md done

---

## Time Breakdown

| Task | Time | Day |
|------|------|-----|
| Email Setup | 30m | Day 1 AM |
| Email Integration | 15m | Day 1 AM |
| Security Headers | 30m | Day 1 PM |
| API Validation | 45m | Day 1 Eve |
| Rate Limit Setup | 45m | Day 2 AM |
| Rate Limit Code | 30m | Day 2 AM |
| Sentry Setup | 45m | Day 2 PM |
| Sentry Integration | 30m | Day 2 PM |
| Final Testing | 30m | Day 2 Eve |
| **TOTAL** | **~4.5 hours** | **2 days** |

---

## Getting API Keys (30 min total)

1. **Resend** (~5 min)
   - https://resend.com → Sign up → Copy API key

2. **Upstash** (~10 min)
   - https://upstash.com → Sign up → Create Redis → Copy credentials

3. **Sentry** (~10 min)
   - https://sentry.io → Sign up → Create project → Copy DSN

4. **Keep Safe**
   - Save in .env.local (NOT git)
   - Add to .env.example as placeholders
   - Never share keys publicly

---

## Git Commits (Day by Day)

### Day 1 Commits
```
commit 1: feat: add email alerts with Resend integration
commit 2: feat: add security headers middleware
commit 3: feat: improve API key validation
```

### Day 2 Commits
```
commit 4: feat: add rate limiting with Upstash
commit 5: feat: integrate Sentry error monitoring
commit 6: chore: add environment variable templates
```

---

## Testing Commands

### Email Test
```bash
# Create budget
curl -X POST http://localhost:3000/api/budgets \
  -H "Content-Type: application/json" \
  -d '{
    "limitAmount": 0.01,
    "period": "daily",
    "alertThreshold": 0.5,
    "email": "your-email@example.com"
  }'

# Track events to trigger alert
# Check your email inbox
```

### Rate Limit Test
```bash
# Loop request until 429
for i in {1..1001}; do
  curl -X POST http://localhost:3000/api/track \
    -H "x-api-key: ak_demo_test_key_123" \
    -H "Content-Type: application/json" \
    -d '{"events": [{"projectId": "...", ...}]}'
done
# Request 1001 should return 429
```

### Security Headers Test
```bash
curl -I http://localhost:3000
# Look for X-Frame-Options, HSTS, etc.
```

### Sentry Test
```typescript
// In any API route
throw new Error('Test Sentry');
// Check Sentry dashboard
```

---

## Common Errors & Fixes

### Email not sending
- ✅ Check RESEND_API_KEY in .env.local
- ✅ Verify API key is valid
- ✅ Check email format
- ✅ Review Resend dashboard

### Rate limit not working
- ✅ Check UPSTASH credentials
- ✅ Verify Redis database created
- ✅ Test Redis connection
- ✅ Check network connectivity

### Sentry not capturing errors
- ✅ Check SENTRY_DSN set
- ✅ Verify project created in Sentry
- ✅ Check NODE_ENV not "production" locally
- ✅ Review Sentry init code

### Security headers not showing
- ✅ Check middleware.ts exists
- ✅ Verify middleware config correct
- ✅ Restart dev server
- ✅ Clear browser cache

---

## Post-Completion

Once all 5 tasks complete:
- [ ] Push to git
- [ ] Create GitHub repo (make it public)
- [ ] Add topics: ai, cost-tracking, openai, anthropic, nextjs
- [ ] Follow LAUNCH.md checklist
- [ ] Post on Twitter/HN/Reddit
- [ ] Respond to every comment

---

## Success Criteria

✅ All 5 tasks implemented
✅ All tests passing
✅ No hardcoded secrets
✅ All environment variables set
✅ Ready for public launch

---

**Time to Complete: 1-2 days**
**Start: This week**
**Target: Production-ready by end of week**

See WEEK_1_PRIORITIES.md for detailed implementation guide.
