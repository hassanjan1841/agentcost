import Anthropic from '@anthropic-ai/sdk';

// Mock Anthropic response (from https://docs.anthropic.com/en/api/messages)
export const mockAnthropicResponse: Anthropic.Message = {
  id: 'msg_01XFDUDYJgAACzvnptvVoYEL',
  type: 'message',
  role: 'assistant',
  content: [
    {
      type: 'text',
      text: 'Hello! How can I assist you today?',
    },
  ],
  model: 'claude-sonnet-4-20250514',
  stop_reason: 'end_turn',
  stop_sequence: null,
  usage: {
    input_tokens: 12,
    output_tokens: 25,
  },
};

// Mock OpenAI response (from https://platform.openai.com/docs/api-reference/chat)
export const mockOpenAIResponse = {
  id: 'chatcmpl-123',
  object: 'chat.completion',
  created: 1677652288,
  model: 'gpt-4-turbo',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: 'Hello! How can I help you today?',
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 20,
    total_tokens: 30,
  },
};

// Mock Google Gemini response (from https://ai.google.dev/api/rest)
export const mockGeminiResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: 'Hello! How can I assist you today?',
          },
        ],
        role: 'model',
      },
      finishReason: 'STOP',
      index: 0,
    },
  ],
  usageMetadata: {
    promptTokenCount: 8,
    candidatesTokenCount: 15,
    totalTokenCount: 23,
  },
};
