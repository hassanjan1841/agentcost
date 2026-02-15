# AgentCost 💰

**Open-source cost tracking for AI APIs.**

Stop overspending on OpenAI, Anthropic & Google. Get real-time visibility into your AI costs.

[![npm version](https://img.shields.io/npm/v/@agentcost/sdk)](https://www.npmjs.com/package/@agentcost/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/hassanjan1841/agentcost)](https://github.com/hassanjan1841/agentcost)

[GitHub](https://github.com/hassanjan1841/agentcost) • [Docs](#documentation)

---

## 🎯 The Problem

Most developers have **no idea** how much they're spending on AI APIs until the bill arrives.

- 💸 Surprise bills of $500+ per month
- 🤷 No visibility into which features cost the most
- 📈 Costs spiral out of control quickly
- 🚫 No way to set budget limits

---

## ✨ The Solution

**AgentCost** gives you:

- 📊 **Real-time cost dashboard** - See spending as it happens
- 💰 **Budget alerts** - Get notified before overspending  
- 🔍 **Request-level tracking** - Detailed breakdown per API call
- 📈 **Cost projections** - Predict monthly spending
- 🌐 **Multi-provider** - OpenAI, Anthropic, Google Gemini
- 🔒 **Self-hosted** - Keep your data private
- 📤 **Export to CSV** - For accounting and analysis

---

## 🚀 Quick Start
```bash
npm install @agentcost/sdk
```
```typescript
import { CostTracker } from '@agentcost/sdk';

const tracker = new CostTracker({
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
});

// Wrap your Anthropic client
const anthropic = tracker.anthropic(process.env.ANTHROPIC_API_KEY);

// Use normally - costs are tracked automatically!
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
});

// View costs in real-time at https://agentcost.dev
```

---

---

## 📦 Installation

### Option 1: Hosted (Recommended)

1. Sign up at [agentcost.dev](https://agentcost.dev)
2. Create a project and get your API key
3. Install SDK:
```bash
   npm install @agentcost/sdk
```

### Option 2: Self-Hosted

1. Clone the repo:
```bash
   git clone https://github.com/hassanjan1841/agentcost
   cd agentcost
```

2. Install dependencies:
```bash
   pnpm install
```

3. Build the SDK:
```bash
   pnpm build:sdk
```

4. Deploy the dashboard
5. Set up budget alerts

---

## 📖 Usage

### Anthropic (Claude)
```typescript
import { CostTracker } from '@agentcost/sdk';

const tracker = new CostTracker({
  projectId: 'proj_abc123',
  apiKey: 'ak_xyz789',
});

const anthropic = tracker.anthropic(process.env.ANTHROPIC_API_KEY);

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Write a haiku about TypeScript' }],
});

console.log(response.content);
// Cost is automatically tracked! ✅
```

### OpenAI
```typescript
const openai = tracker.openai(process.env.OPENAI_API_KEY);

const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo',
  messages: [{ role: 'user', content: 'Explain quantum computing' }],
});

console.log(response.choices[0].message.content);
// Cost is automatically tracked! ✅
```

### Google Gemini
```typescript
const gemini = tracker.google(process.env.GOOGLE_API_KEY);

const response = await gemini.generateContent({
  model: 'gemini-pro',
  contents: [{ role: 'user', parts: [{ text: 'Hello!' }] }],
});

console.log(response.candidates[0].content.parts[0].text);
// Cost is automatically tracked! ✅
```

---

## 💰 Budget Alerts

Set up email alerts when you approach spending limits:

1. Go to Dashboard → Budget Alerts
2. Click "Add Budget"
3. Set your limit (e.g., $100/month)
4. Add your email
5. Get notified at 80% usage

---

## 📤 Export to CSV

Export your cost data for accounting and analysis:

1. Go to Dashboard
2. Click "Export CSV"
3. Choose time range (24h, 7d, 30d)
4. Save the file

---

## 🧪 Testing Without API Keys

You can test AgentCost without spending money using our mock clients:
```typescript
import {
  CostTracker,
  MockAnthropicClient,
  MockOpenAIClient,
  MockGeminiClient,
} from '@agentcost/sdk';

const tracker = new CostTracker({
  projectId: 'test-project',
  apiKey: 'test-key',
  debug: true,
});

// Use mock clients for development
const mockAnthropic = new MockAnthropicClient();

const response = await mockAnthropic.messages.create({
  model: 'claude-sonnet-4',
  max_tokens: 100,
  messages: [{ role: 'user', content: 'Hello!' }],
});

// Costs are still tracked using mock token counts! ✅
```

### Run Test Suite
```bash
cd packages/sdk

# Test all providers with mocks
pnpm test:mocks

# Test cost tracking logic
pnpm test:tracking
```

---

## 🔧 Configuration
```typescript
const tracker = new CostTracker({
  projectId: 'your-project-id',    // Required
  apiKey: 'your-api-key',          // Required
  endpoint: 'https://custom.com',  // Optional (default: api.agentcost.dev)
  batchSize: 10,                   // Optional (default: 10 events)
  flushInterval: 5000,             // Optional (default: 5000ms)
  debug: false,                    // Optional (default: false)
});
```

---

## 🏗️ How It Works

1. **SDK wraps official clients** - Zero changes to your code
2. **Intercepts API responses** - Extracts token usage
3. **Calculates costs** - Based on current pricing (updated monthly)
4. **Batches events** - Sends to dashboard every 5s or 10 events
5. **Real-time display** - Beautiful dashboard shows costs instantly

**Privacy:** Only aggregated metrics are sent (tokens, cost, model). Your prompts/responses stay private.

---

## 📊 Pricing (Feb 2025)

The SDK uses these rates for cost calculation:

| Provider | Model | Input (per 1M) | Output (per 1M) |
|----------|-------|----------------|-----------------|
| Anthropic | Claude Opus 4 | $15.00 | $75.00 |
| Anthropic | Claude Sonnet 4 | $3.00 | $15.00 |
| Anthropic | Claude Haiku 4 | $0.80 | $4.00 |
| OpenAI | GPT-4 Turbo | $10.00 | $30.00 |
| OpenAI | GPT-4o | $2.50 | $10.00 |
| Google | Gemini Pro | $0.125 | $0.375 |

*Pricing updated monthly. See [packages/sdk/src/pricing.ts](packages/sdk/src/pricing.ts) for full list.*

---

## 🛠️ Tech Stack

- **SDK**: TypeScript, Node.js
- **Dashboard**: Next.js 15, React, TailwindCSS
- **Database**: Vercel Postgres
- **Charts**: Recharts
- **UI**: shadcn/ui
- **Deployment**: Vercel

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT - see [LICENSE](LICENSE) file

---

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org) - Dashboard framework
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) - Claude API
- [Vercel](https://vercel.com) - Deployment

---

**Made with ❤️ by developers, for developers.**

[GitHub](https://github.com/hassanjan1841/agentcost) • [npm](https://www.npmjs.com/package/@agentcost/sdk)
