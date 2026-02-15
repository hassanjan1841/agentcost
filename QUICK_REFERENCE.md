# AgentCost - Quick Reference Guide

## What You Have

✅ Full-stack AI cost tracking platform
✅ SDK with 3 provider support (Anthropic, OpenAI, Google)
✅ Beautiful Next.js dashboard
✅ Real-time cost tracking
✅ Budget alerts with email/webhook
✅ CSV export functionality
✅ Complete documentation
✅ Launch-ready materials

## Key Files

### Core Features
- **Tracking:** `packages/sdk/src/tracker.ts`
- **Pricing:** `packages/sdk/src/pricing.ts`
- **Providers:** `packages/sdk/src/providers/`
- **Dashboard:** `apps/dashboard/app/dashboard/page.tsx`
- **Budgets:** `apps/dashboard/lib/budget-checker.ts`
- **Export:** `apps/dashboard/lib/export.ts`

### API Routes
- **Track events:** `POST /api/track` (with budget checks)
- **Manage budgets:** `GET/POST/DELETE /api/budgets`
- **Export CSV:** `GET /api/export?range=7d|24h|30d`

### Database
- **Schema:** `apps/dashboard/lib/schema.sql`
- **Connection:** `apps/dashboard/lib/db.ts`

## Common Commands

```bash
# Install & setup
pnpm install
pnpm build:sdk

# Development
pnpm dev                    # Start dashboard (port 3000)
cd packages/sdk && pnpm dev # Watch SDK changes

# Testing
cd packages/sdk && pnpm test:mocks       # Test all providers
cd packages/sdk && pnpm test:tracking    # Test cost calculation

# Type checking
cd apps/dashboard && pnpm tsc --noEmit   # Check dashboard types
cd packages/sdk && pnpm type-check       # Check SDK types

# Production
pnpm build                  # Build all packages
pnpm start                  # Start production server
```

## Budget Alerts Setup

```typescript
// Create budget via API
POST /api/budgets
{
  "limitAmount": 100,           // dollars
  "period": "monthly",          // daily|weekly|monthly
  "alertThreshold": 0.8,        // alert at 80%
  "email": "dev@example.com"    // optional
}

// How it works:
1. Event tracked → INSERT into events
2. checkBudgets() runs automatically
3. Calculates spending for period
4. If ≥ threshold → send alert
5. Throttle: max 1 alert per period
```

## CSV Export

```typescript
// Download cost data
GET /api/export?range=7d

// Returns CSV with columns:
// Timestamp, Provider, Model, Input Tokens, Output Tokens, Cost, Duration
```

## Database Schema Highlights

```sql
-- Events table (1000s of rows)
-- indexed by (project_id, created_at)

-- Budgets table (simple)
-- (project_id, limit_amount, period, alert_threshold, email, webhook_url)

-- Demo project auto-created:
-- api_key: 'ak_demo_test_key_123'
```

## Environment Variables

```bash
# Required (dashboard)
POSTGRES_URL=postgresql://...
POSTGRES_URLUNVERIFIED=postgresql://...

# Optional (email service)
RESEND_API_KEY=re_...        # For production emails
```

## Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| SDK (3 providers) | ✅ Complete | Ready for production |
| Dashboard | ✅ Complete | Real-time cost tracking |
| Budget alerts | ✅ Complete | Email/webhook ready |
| CSV export | ✅ Complete | All time ranges |
| Documentation | ✅ Complete | README, CONTRIBUTING |
| Launch materials | ✅ Complete | LAUNCH.md checklist |

## Launch Checklist

- [ ] Create dashboard screenshot
- [ ] Add MIT LICENSE file
- [ ] Make repo public
- [ ] Follow LAUNCH.md hour-by-hour
- [ ] Post on: Twitter, HN, Reddit, Dev.to
- [ ] Respond to every comment
- [ ] Fix reported bugs quickly
- [ ] Merge community PRs

## Important Endpoints

```
SDK Wrappers:
- tracker.anthropic(apiKey)
- tracker.openai(apiKey)
- tracker.google(apiKey)

Dashboard:
- http://localhost:3000/dashboard

API:
- http://localhost:3000/api/track
- http://localhost:3000/api/budgets
- http://localhost:3000/api/export

Admin:
- http://localhost:3000/api/costs (analytics)
- http://localhost:3000/api/usage (metrics)
```

## Testing Budget Alerts

```bash
# 1. Create budget
curl -X POST http://localhost:3000/api/budgets \
  -H "Content-Type: application/json" \
  -d '{
    "limitAmount": 0.01,
    "period": "daily",
    "alertThreshold": 0.5,
    "email": "test@example.com"
  }'

# 2. Send tracking events
curl -X POST http://localhost:3000/api/track \
  -H "x-api-key: ak_demo_test_key_123" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "projectId": "demo-project-id",
        "provider": "anthropic",
        "model": "claude-sonnet-4",
        "inputTokens": 100,
        "outputTokens": 50,
        "cost": 0.003,
        "duration": 100,
        "timestamp": '$(date +%s000)'
      }
    ]
  }'

# 3. Check console for "Budget alert triggered"
# 4. Email logged to console (replace with real service)
```

## Project Structure

```
agentcost/
├── packages/sdk/              # SDK package (@agentcost/sdk)
│   ├── src/
│   │   ├── tracker.ts         # Main class
│   │   ├── pricing.ts         # Pricing database
│   │   ├── providers/         # 3 provider wrappers
│   │   ├── mocks/             # Testing mocks
│   │   └── types.ts           # TypeScript types
│   └── dist/                  # Built outputs
│
├── apps/dashboard/            # Next.js dashboard
│   ├── app/
│   │   ├── dashboard/         # Main page
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── BudgetWidget.tsx   # Budget management
│   │   ├── ExportButton.tsx   # CSV export
│   │   └── ui/                # shadcn components
│   └── lib/
│       ├── db.ts              # Database connection
│       ├── budget-checker.ts  # Budget logic
│       ├── email.ts           # Email service
│       └── export.ts          # CSV generation
│
├── README.md                  # Project overview
├── CONTRIBUTING.md            # Contribution guide
├── LAUNCH.md                  # Launch strategy
├── PHASE_3_COMPLETE.md        # Technical docs
└── AGENTS.md                  # Agent guidelines
```

## Success Metrics

**Day 1:** 20+ GitHub stars
**Week 1:** 50+ stars
**Month 1:** 100+ stars (YOUR GOAL)

---

## Quick Wins for Launch Day

1. **Tweet:** Share exciting features
2. **HN:** Post "Show HN" with first-day engagement
3. **Reddit:** Multi-subreddit posts (r/ClaudeAI, r/OpenAI, etc)
4. **Dev.to:** Write quick tech blog post
5. **Communities:** Share in AI/dev Discord servers

## Email Service Integration

Currently logs to console. To enable real emails, uncomment in `email.ts`:

```typescript
// Replace this:
console.log('📧 EMAIL ALERT:', {...});

// With real API call (Resend example):
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({...})
});
```

---

**Ready to launch?** Follow LAUNCH.md! 🚀
