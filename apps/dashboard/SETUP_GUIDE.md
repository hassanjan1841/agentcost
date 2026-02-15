# AgentCost Dashboard - Setup Guide

This guide walks you through setting up the AgentCost dashboard from scratch.

## Prerequisites

- Node.js 18+ 
- PostgreSQL (local or Vercel Postgres)
- pnpm (or npm/yarn)
- Git

## Step 1: Database Setup

### Option A: Vercel Postgres (Recommended)

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up or log in

2. **Create Postgres Database**
   - Go to Dashboard → Storage
   - Click "Create Database" → Postgres
   - Name: `agentcost`
   - Region: Choose closest to you

3. **Get Connection String**
   - Copy the `POSTGRES_URL` connection string
   - Save it somewhere safe

### Option B: Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   createdb agentcost
   psql agentcost
   ```

3. **Create Connection String**
   ```
   postgresql://user:password@localhost:5432/agentcost
   ```

## Step 2: Configure Environment

1. **Update `.env.local`**
   ```bash
   cd apps/dashboard
   # Edit .env.local with your credentials
   ```

2. **Set Environment Variables**
   ```env
   # Copy from Vercel or your local setup
   POSTGRES_URL="postgresql://user:password@host/agentcost"
   POSTGRES_PRISMA_URL="postgresql://user:password@host/agentcost?schema=public"
   POSTGRES_URL_NON_POOLING="postgresql://user:password@host/agentcost"
   POSTGRES_USER="postgres"
   POSTGRES_HOST="localhost"
   POSTGRES_PASSWORD="your-password"
   POSTGRES_DATABASE="agentcost"
   ```

3. **Test Connection**
   ```bash
   psql $POSTGRES_URL -c "SELECT 1"
   # Should return: 1
   ```

## Step 3: Initialize Database Schema

1. **Run Schema**
   ```bash
   # From project root
   psql $POSTGRES_URL < apps/dashboard/lib/schema.sql
   ```

2. **Verify Schema**
   ```bash
   psql $POSTGRES_URL -c "\dt"
   # Should show: projects, events, daily_costs, budgets
   ```

3. **Check Demo Project**
   ```bash
   psql $POSTGRES_URL -c "SELECT * FROM projects LIMIT 1"
   # Should show: Demo Project | ak_demo_test_key_123
   ```

## Step 4: Install Dependencies

```bash
# From project root
cd /home/hassan-jan/agentcost
pnpm install

# Verify dashboard dependencies
cd apps/dashboard
pnpm list
```

## Step 5: Start Development Server

```bash
cd apps/dashboard
pnpm dev
```

Output should show:
```
  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

## Step 6: Test Dashboard

1. **Open Browser**
   - Landing page: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard

2. **Expected Result**
   - Landing page loads with hero section
   - Dashboard shows empty state
   - Time range selector works
   - Auto-refresh running (every 5s)

## Step 7: Seed Demo Data (Optional)

To see data in the dashboard without using the API:

```bash
cd apps/dashboard
npx tsx scripts/seed-demo-data.ts
```

Output:
```
🌱 Seeding demo data...
✅ Seeded 3 demo events
```

Now refresh the dashboard - you should see:
- Total Cost: $0.0169
- Total Requests: 3
- Cost chart with 1 day of data
- Recent requests table populated

## Step 8: Test API Integration

### Test Tracking Endpoint

```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -H "x-api-key: ak_demo_test_key_123" \
  -d '{
    "events": [{
      "projectId": "uuid-here",
      "provider": "anthropic",
      "model": "claude-sonnet-4",
      "inputTokens": 100,
      "outputTokens": 50,
      "cost": 0.001,
      "duration": 500,
      "timestamp": 1708001234567
    }]
  }'
```

Expected response:
```json
{
  "success": true,
  "tracked": 1
}
```

### Get Metrics

```bash
curl http://localhost:3000/api/costs?range=7d
```

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
- Check PostgreSQL is running: `brew services list` (macOS)
- Check env vars in `.env.local`
- Try: `psql $POSTGRES_URL -c "SELECT 1"`

### Missing Tables
```
Error: relation "projects" does not exist
```
**Solution:**
```bash
psql $POSTGRES_URL < apps/dashboard/lib/schema.sql
```

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

### TypeScript Errors
```bash
# Verify types
pnpm tsc --noEmit

# Check dependencies
pnpm install
```

## Production Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Phase 2: Beautiful Dashboard"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to vercel.com
   - Click "New Project"
   - Select your GitHub repo
   - Framework: Next.js

3. **Set Environment Variables**
   - Add all `POSTGRES_*` variables
   - Copy from `.env.local`

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your dashboard is live!

### Self-Hosted (Docker)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY pnpm-lock.yaml .
COPY package.json .
RUN npm i -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

```bash
docker build -t agentcost .
docker run -p 3000:3000 -e POSTGRES_URL="..." agentcost
```

## Next Steps

1. **Use the SDK**
   - Integrate `@agentcost/sdk` in your app
   - Start tracking costs
   - See data appear on dashboard

2. **Customize**
   - Add your logo (replace in landing page)
   - Change brand colors in `tailwind.config.ts`
   - Add custom metrics

3. **Add Features (Phase 3)**
   - Budget alerts
   - CSV export
   - Email notifications

## Support

- Check docs: `/apps/dashboard/README.md`
- View schema: `/apps/dashboard/lib/schema.sql`
- See examples: `/apps/dashboard/scripts/seed-demo-data.ts`

## Quick Reference

```bash
# All commands from project root

# Install
pnpm install

# Development
cd apps/dashboard && pnpm dev

# Type check
cd apps/dashboard && pnpm tsc --noEmit

# Production build
cd apps/dashboard && pnpm build && pnpm start

# Seed data
cd apps/dashboard && npx tsx scripts/seed-demo-data.ts

# Database
psql $POSTGRES_URL < apps/dashboard/lib/schema.sql
```

---

You're all set! The dashboard is ready to track AI API costs. 🚀
