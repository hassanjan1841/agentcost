# AgentCost Dashboard

Beautiful, real-time cost tracking dashboard for AI APIs built with Next.js 15 and Tailwind CSS.

## Features

- 📊 Real-time cost metrics and charts
- 💰 Provider breakdown (Anthropic, OpenAI, Google)
- 📈 Cost trends over time
- 🔍 Recent requests table
- ⚡ Live updates every 5 seconds
- 🎨 Beautiful UI with shadcn/ui components

## Quick Start

### Prerequisites

- PostgreSQL database (Vercel Postgres recommended)
- Node.js 18+
- pnpm

### Setup

1. **Install dependencies:**
```bash
pnpm install
```

2. **Configure database:**
   - Create a PostgreSQL database (or use Vercel Postgres)
   - Update `.env.local` with your database credentials
   - Run the schema:
   ```bash
   psql $POSTGRES_URL < lib/schema.sql
   ```

3. **Start development server:**
```bash
pnpm dev
```

4. **Open browser:**
   - Landing page: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard

## API Routes

### `POST /api/track`
Track cost events from the SDK.

**Headers:**
- `x-api-key` - Your API key (e.g., `ak_demo_test_key_123`)

**Body:**
```json
{
  "events": [
    {
      "projectId": "uuid",
      "provider": "anthropic|openai|google",
      "model": "claude-sonnet-4",
      "inputTokens": 150,
      "outputTokens": 300,
      "cost": 0.00195,
      "duration": 1234,
      "timestamp": 1708001234567,
      "metadata": {}
    }
  ]
}
```

### `GET /api/costs?range=7d`
Get dashboard metrics.

**Query Parameters:**
- `range` - Time range: `24h`, `7d`, or `30d` (default: `7d`)

**Response:**
```json
{
  "totalCost": 1.2345,
  "totalRequests": 42,
  "avgCostPerRequest": 0.000029,
  "mostUsedModel": "claude-sonnet-4",
  "costByProvider": [...],
  "costByModel": [...],
  "timeline": [...],
  "recentRequests": [...]
}
```

### `GET /api/projects`
Get list of projects.

### `POST /api/projects`
Create a new project.

## Database Schema

The dashboard uses the following tables:

- **projects** - Project metadata and API keys
- **events** - Individual API call events
- **daily_costs** - Aggregated daily metrics
- **budgets** - Budget configuration and alerts

See `lib/schema.sql` for the complete schema.

## Seeding Demo Data

```bash
cd apps/dashboard
npx tsx scripts/seed-demo-data.ts
```

This will insert sample events for testing.

## Building for Production

```bash
pnpm build
pnpm start
```

## Environment Variables

```env
# Database
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
POSTGRES_USER="postgres"
POSTGRES_HOST="localhost"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="agentcost"
```

## Project Structure

```
app/
├── api/
│   ├── track/route.ts          # Event tracking endpoint
│   ├── costs/route.ts          # Metrics endpoint
│   └── projects/route.ts       # Project management
├── dashboard/
│   ├── page.tsx                # Dashboard
│   └── layout.tsx              # Dashboard layout
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout
└── globals.css                 # Global styles

components/
├── ui/                         # shadcn/ui components
├── MetricCard.tsx             # Metric display component
├── CostChart.tsx              # Cost chart component
├── ProviderBreakdown.tsx      # Provider breakdown
└── RecentRequests.tsx         # Recent requests table

lib/
├── db.ts                      # Database utilities
├── queries.ts                 # Database queries
├── schema.sql                 # Database schema
└── utils.ts                   # Helper utilities
```

## Next Steps

- Phase 3: Budget alerts and export features
- Phase 4: Team management and authentication
- Phase 5: Advanced analytics and forecasting
