import { calculateCost } from '../pricing';
import { CostEvent } from '../types';

// OpenAI types (simplified)
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAICompletionParams {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export function wrapOpenAIClient(
  apiKey: string,
  trackEvent: (event: Omit<CostEvent, 'projectId' | 'timestamp'>) => void,
  debug: boolean = false
): any {
  // Mock OpenAI client structure
  const client = {
    chat: {
      completions: {
        create: async function (params: OpenAICompletionParams): Promise<OpenAIResponse> {
          const startTime = Date.now();

          if (debug) {
            console.log('[AgentCost] Tracking OpenAI API call:', {
              model: params.model,
              maxTokens: params.max_tokens,
            });
          }

          try {
            // Call actual OpenAI API
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
              body: JSON.stringify(params),
            });

            if (!response.ok) {
              throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            const data: OpenAIResponse = await response.json();

            // Calculate duration
            const duration = Date.now() - startTime;

            // Calculate cost
            const cost = calculateCost(
              'openai',
              data.model,
              data.usage.prompt_tokens,
              data.usage.completion_tokens
            );

            // Track the event
            trackEvent({
              provider: 'openai',
              model: data.model,
              inputTokens: data.usage.prompt_tokens,
              outputTokens: data.usage.completion_tokens,
              cost,
              duration,
              metadata: {
                finishReason: data.choices[0]?.finish_reason,
                totalTokens: data.usage.total_tokens,
              },
            });

            if (debug) {
              console.log('[AgentCost] Cost calculated:', {
                inputTokens: data.usage.prompt_tokens,
                outputTokens: data.usage.completion_tokens,
                cost: `$${cost.toFixed(6)}`,
                duration: `${duration}ms`,
              });
            }

            return data;
          } catch (error) {
            // Track error
            trackEvent({
              provider: 'openai',
              model: params.model,
              inputTokens: 0,
              outputTokens: 0,
              cost: 0,
              duration: Date.now() - startTime,
              metadata: {
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            });

            throw error;
          }
        },
      },
    },
  };

  return client;
}
