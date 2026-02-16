# AgentCost - Agent Guidelines

## Build & Commands

```bash
# Root workspace (from project root - monorepo)
pnpm install              # Install all dependencies
pnpm dev                  # Start dashboard dev server (default)
pnpm dev:dashboard        # Start dashboard dev server (explicit)
pnpm dev:sdk              # Watch mode for SDK development
pnpm build                # Build all packages
pnpm build:sdk            # Build SDK package (tsup)
pnpm build:dashboard      # Build dashboard for production
pnpm start                # Start dashboard production server
pnpm test                 # Run all tests
pnpm lint                 # Run linter on all packages
pnpm type-check           # TypeScript type checking all packages

# SDK package commands (from packages/sdk)
cd packages/sdk && pnpm build        # Build @agentcost/sdk
cd packages/sdk && pnpm dev          # Watch mode
cd packages/sdk && pnpm type-check   # TypeScript type checking only
cd packages/sdk && pnpm test:mocks   # Test all 3 providers with mocks
cd packages/sdk && pnpm test:tracking# Test cost tracking logic

# Dashboard package commands (from apps/dashboard)
cd apps/dashboard && pnpm dev        # Start development server
cd apps/dashboard && pnpm build      # Build for production
cd apps/dashboard && pnpm start      # Start production server
cd apps/dashboard && pnpm tsc --noEmit # TypeScript check only

# Database commands (from apps/dashboard)
psql $POSTGRES_URL < lib/schema.sql           # Run migrations
npx tsx scripts/seed-demo-data.ts             # Seed demo data
```

## Architecture

**Monorepo Structure:** Root + pnpm workspaces
- `packages/sdk/` - Main SDK package (@agentcost/sdk v0.2.0)
  - `src/tracker.ts` - CostTracker main class (anthropic, openai, google methods)
  - `src/pricing.ts` - Pricing database & calculation logic (Anthropic, OpenAI, Google)
  - `src/providers/` - Provider wrappers (anthropic.ts, openai.ts, google.ts)
  - `src/mocks/` - Mock clients & responses for testing without API keys
  - `src/types.ts` - Shared TypeScript interfaces
  - `src/utils.ts` - Helpers (retry, backoff, ID gen)
  - `examples/` - Test examples (test-all-providers.ts, test-with-tracking.ts)
  - `dist/` - Compiled ESM + CommonJS outputs
- `apps/dashboard/` - Next.js 15 Dashboard (Phase 2 - Complete)
  - `app/` - Next.js app router pages & API routes
  - `components/` - React components (UI + custom)
  - `lib/` - Database utilities, queries, schema
  - `scripts/` - Database seeding & utilities
  - `public/` - Static assets

**Key APIs:** CostTracker, wrapAnthropicClient(), wrapOpenAIClient(), wrapGeminiClient(), calculateCost(), retryWithBackoff()
**Mock Testing:** MockAnthropicClient, MockOpenAIClient, MockGeminiClient for testing without API keys
**Event Flow:** Wrap client → Intercept responses → Calculate costs → Batch → Send via fetch() → Retry on failure

## Code Style

- **TypeScript:** Strict mode enabled (`"strict": true`), ES2020 target, ESM + CommonJS builds
- **Imports:** Named imports organized by type (types first, then functions), path aliases unused
- **Naming:** camelCase functions/vars, PascalCase classes/interfaces, UPPER_CASE constants
- **Types:** Interfaces for public APIs (`CostTrackerConfig`, `CostEvent`), strict nullability
- **Comments:** JSDoc for public methods, inline for logic clarity
- **Error Handling:** Try-catch with retry logic (exponential backoff), errors tracked in events
- **Formatting:** 2-space indents, no semicolon enforcement in build (tsup handles)
- **Dependencies:** Minimal (only @anthropic-ai/sdk), peer deps for flexibility

## Documentation (.md files)

- **README.md** - Project overview, quick start, features, installation, usage examples
- **QUICKSTART.md** - Minimal 2-minute setup, code examples, config options, API reference
- **PHASE_1A_COMPLETE.md** - Architecture details, features implemented, next steps
- **PHASE_3_COMPLETE.md** - Budget alerts, CSV export, launch-ready features
- **PRODUCTION_READINESS.md** - Missing features, production checklist, timeline (READ THIS!)
- **LAUNCH.md** - Launch strategy, hour-by-hour checklist
- **AGENTS.md** - This file - build commands, architecture, code style for agents
- **CUSTOM_AUTH_PLAN.md** - Full custom authentication implementation plan
- **PHASE_1_AUTH_IMPLEMENTATION.md** - Phase 1 setup summary (dependencies, migrations)
- **EMAIL_SETUP.md** - Complete email configuration & usage guide
- **EMAIL_IMPLEMENTATION_COMPLETE.md** - Email service implementation summary
- **RESEND_NODEMAILER_INTEGRATION.md** - Email architecture (Resend + Nodemailer + Console)
- Update docs when adding features, APIs, or significant changes. Use clear examples.

## Email Service Structure

- `packages/sdk/lib/email/` - Main email service (4 files)
  - `index.ts` - Clean API export
  - `service.ts` - High-level email functions
  - `sender.ts` - Unified 3-tier sender (Resend → Nodemailer → Console)
  - `templates.ts` - Reusable HTML email templates (DRY)
- **Features:** 7 email types, 3 providers, zero code duplication, production-ready
- **Environment:** RESEND_API_KEY (primary), SMTP_* (fallback), console (dev)
