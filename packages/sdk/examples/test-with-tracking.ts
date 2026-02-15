import { CostTracker } from '../src/tracker';
import { wrapAnthropicClient } from '../src/providers/anthropic';
import { MockAnthropicClient } from '../src/mocks/clients';

// Create tracker
const tracker = new CostTracker({
  projectId: 'test-project',
  apiKey: 'test-key',
  debug: true,
});

// Create a mock client
const mockClient = new MockAnthropicClient();

// Wrap it with cost tracking
const trackedClient = wrapAnthropicClient(
  'mock-api-key',
  (event) => {
    console.log('\n💰 COST EVENT TRACKED:', {
      provider: event.provider,
      model: event.model,
      inputTokens: event.inputTokens,
      outputTokens: event.outputTokens,
      cost: `$${event.cost.toFixed(6)}`,
      duration: `${event.duration}ms`,
    });
  },
  true
);

// Override the client's methods with our wrapped version
(trackedClient as any).messages.create = async (params: any) => {
  return mockClient.messages.create(params);
};

async function test() {
  console.log('🚀 Testing cost tracking with mocks...\n');
  
  const response = await (trackedClient as any).messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello!' }],
  });

  console.log('\n✅ Response received:', response.content[0].text);
  console.log('\n📊 Check the COST EVENT above - that\'s what gets sent to dashboard!');
}

test();
