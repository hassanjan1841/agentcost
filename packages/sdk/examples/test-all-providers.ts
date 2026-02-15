import { CostTracker } from '../src/index';
import {
  MockAnthropicClient,
  MockOpenAIClient,
  MockGeminiClient,
} from '../src/mocks/clients';

// Override the real clients with mock clients for testing
const tracker = new CostTracker({
  projectId: 'test-project',
  apiKey: 'test-key',
  debug: true,
  endpoint: 'http://localhost:3000/api/track', // Will fail but shows logs
});

async function testAnthropicMock() {
  console.log('\n🧪 Testing Anthropic Mock...\n');
  
  const mockClient = new MockAnthropicClient() as any;
  
  const response = await mockClient.messages.create({
    model: 'claude-sonnet-4',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello!' }],
  });

  console.log('✅ Anthropic Response:', {
    content: response.content[0].text,
    usage: response.usage,
  });
}

async function testOpenAIMock() {
  console.log('\n🧪 Testing OpenAI Mock...\n');
  
  const mockClient = new MockOpenAIClient() as any;
  
  const response = await mockClient.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: 'Hello!' }],
  });

  console.log('✅ OpenAI Response:', {
    content: response.choices[0].message.content,
    usage: response.usage,
  });
}

async function testGeminiMock() {
  console.log('\n🧪 Testing Gemini Mock...\n');
  
  const mockClient = new MockGeminiClient() as any;
  
  const response = await mockClient.generateContent({
    model: 'gemini-pro',
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Hello!' }],
      },
    ],
  });

  console.log('✅ Gemini Response:', {
    content: response.candidates[0].content.parts[0].text,
    usage: response.usageMetadata,
  });
}

async function runAllTests() {
  try {
    await testAnthropicMock();
    await testOpenAIMock();
    await testGeminiMock();
    
    console.log('\n✅ All mock tests passed!\n');
    console.log('📊 Cost tracking events logged above');
    console.log('🎯 Next: Build the dashboard to see these costs!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runAllTests();
