import Anthropic from '@anthropic-ai/sdk';
import { mockAnthropicResponse, mockOpenAIResponse, mockGeminiResponse } from './responses';

/**
 * Mock Anthropic client for testing without API key
 */
export class MockAnthropicClient {
  messages = {
    create: async (params: any): Promise<Anthropic.Message> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[Mock] Anthropic API called with:', {
        model: params.model,
        maxTokens: params.max_tokens,
      });

      return mockAnthropicResponse;
    },
  };
}

/**
 * Mock OpenAI client for testing without API key
 */
export class MockOpenAIClient {
  chat = {
    completions: {
      create: async (params: any) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('[Mock] OpenAI API called with:', {
          model: params.model,
          maxTokens: params.max_tokens,
        });

        return mockOpenAIResponse;
      },
    },
  };
}

/**
 * Mock Google Gemini client for testing without API key
 */
export class MockGeminiClient {
  async generateContent(params: any) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('[Mock] Gemini API called with:', {
      model: params.model,
    });

    return mockGeminiResponse;
  }
}
