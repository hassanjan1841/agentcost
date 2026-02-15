import Anthropic from '@anthropic-ai/sdk';
import { calculateCost } from '../pricing';
import { CostEvent } from '../types';

export function wrapAnthropicClient(
  apiKey: string,
  trackEvent: (event: Omit<CostEvent, 'projectId' | 'timestamp'>) => void,
  debug: boolean = false
): Anthropic {
  const client = new Anthropic({ apiKey });

  // Store the original method
  const originalCreate = client.messages.create.bind(client.messages);

  // Override the create method with proper typing
  (client.messages.create as any) = function (
    params: any
  ) {
    const startTime = Date.now();

    if (debug) {
      console.log('[AgentCost] Tracking Anthropic API call:', {
        model: params.model,
        maxTokens: params.max_tokens,
      });
    }

    // Return the promise chain
    const promise = originalCreate(params);

    return promise
      .then((response: any) => {
        // Calculate duration
        const duration = Date.now() - startTime;

        // Calculate cost
        const cost = calculateCost(
          'anthropic',
          params.model,
          response.usage.input_tokens,
          response.usage.output_tokens
        );

        // Track the event
        trackEvent({
          provider: 'anthropic',
          model: params.model,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          cost,
          duration,
          metadata: {
            stopReason: response.stop_reason,
            stopSequence: response.stop_sequence,
          },
        });

        if (debug) {
          console.log('[AgentCost] Cost calculated:', {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            cost: `$${cost.toFixed(6)}`,
            duration: `${duration}ms`,
          });
        }

        return response;
      })
      .catch((error: any) => {
        // Track error
        trackEvent({
          provider: 'anthropic',
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
      });
  };

  return client;
}
