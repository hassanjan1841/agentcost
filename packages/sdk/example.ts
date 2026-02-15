import { CostTracker } from './src/index';
import Anthropic from '@anthropic-ai/sdk';

// This is a test example (won't actually work until dashboard is live)
const tracker = new CostTracker({
  projectId: 'test-project',
  apiKey: 'test-key',
  debug: true, // Enable debug logging
});

const anthropic = tracker.anthropic(process.env.ANTHROPIC_API_KEY || '');

async function test() {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 100,
      messages: [
        { role: 'user', content: 'Say hello in exactly 5 words.' }
      ],
    });

    console.log('\n✅ Response:', response.content[0].type === 'text' ? response.content[0].text : 'Non-text response');
    console.log('\n📊 Check console for cost tracking logs!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();
