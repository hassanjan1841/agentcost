# 🚀 AgentCost SDK - Quick Start

## Installation

```bash
npm install @agentcost/sdk
```

## Basic Usage

```typescript
import { CostTracker } from '@agentcost/sdk';

// 1. Create tracker
const tracker = new CostTracker({
  projectId: 'proj_abc123',
  apiKey: 'ak_xyz789',
});

// 2. Get wrapped client
const anthropic = tracker.anthropic(process.env.ANTHROPIC_API_KEY);

// 3. Use normally - costs tracked automatically
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.content);
```

## Debug Mode

See what's being tracked:

```typescript
const tracker = new CostTracker({
  projectId: 'proj_abc123',
  apiKey: 'ak_xyz789',
  debug: true,  // Enable logging
});
```

Output:
```
[AgentCost] Tracker initialized: { ... }
[AgentCost] Tracking Anthropic API call: { model: 'claude-sonnet-4', ... }
[AgentCost] Cost calculated: { inputTokens: 50, outputTokens: 100, cost: '$0.001234' }
[AgentCost] Event queued: { queueLength: 1, ... }
[AgentCost] Flushing events: { count: 1, endpoint: '...' }
[AgentCost] Events sent successfully
```

## Configuration

```typescript
new CostTracker({
  // Required
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  
  // Optional
  endpoint: 'https://custom-api.com',  // Default: api.agentcost.dev
  batchSize: 10,                       // Default: 10 events
  flushInterval: 5000,                 // Default: 5000ms (5 seconds)
  debug: false,                        // Default: false
});
```

## Pricing Calculation

```typescript
import { calculateCost, PRICING } from '@agentcost/sdk';

// Manually calculate cost
const cost = calculateCost(
  'anthropic',
  'claude-sonnet-4',
  1000,    // input tokens
  500      // output tokens
);

console.log(`Cost: $${cost.toFixed(4)}`);  // Cost: $0.0045

// Check pricing data
console.log(PRICING.anthropic['claude-sonnet-4']);
// { input: 3.00, output: 15.00 } per 1M tokens
```

## Supported Models

### Anthropic
- claude-opus-4
- claude-opus-4-20250514
- claude-sonnet-4
- claude-sonnet-4-20250514
- claude-haiku-4
- claude-haiku-4-20250514
- claude-3-opus-20240229
- claude-3-sonnet-20240229
- claude-3-haiku-20240307

### OpenAI
- gpt-4
- gpt-4-turbo
- gpt-4o
- gpt-3.5-turbo

### Google Gemini
- gemini-pro
- gemini-1.5-pro
- gemini-ultra

## Event Data Sent

Each API call generates an event with:

```typescript
{
  projectId: 'your-project-id',
  provider: 'anthropic',
  model: 'claude-sonnet-4',
  inputTokens: 1000,
  outputTokens: 500,
  cost: 0.0045,
  duration: 1234,           // milliseconds
  timestamp: 1708001234567, // unix timestamp
  metadata: {               // optional
    stopReason: 'end_turn',
    // ... custom data
  }
}
```

## Error Handling

Errors are tracked automatically:

```typescript
try {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello!' }],
  });
} catch (error) {
  // Cost is still tracked (with cost: 0)
  console.error('API error:', error);
}
```

## Cleanup

Graceful shutdown:

```typescript
// Manually flush remaining events before exit
await tracker.destroy();

// Or let it handle automatically on process exit
```

## TypeScript Types

```typescript
import {
  CostTracker,
  CostTrackerConfig,
  CostEvent,
  PricingRate,
  ModelPricing,
  ProviderPricing,
  calculateCost,
  PRICING,
} from '@agentcost/sdk';
```

## Performance

- **Memory**: ~1KB per event (minimal overhead)
- **Network**: Events batched, sent every 5s or 10 events
- **Latency**: <1ms to track each API call
- **Reliability**: Retry with exponential backoff

## Privacy

Only the following data is sent to AgentCost servers:
- Model name
- Token counts (input/output)
- Calculated cost
- Duration
- Custom metadata (optional)

**NOT sent:**
- Your actual prompts
- Response content
- API keys
- Full conversation history

---

For more details, see:
- README.md - Full project documentation
- PHASE_1A_COMPLETE.md - Architecture details
- /packages/sdk/src/types.ts - TypeScript interfaces
