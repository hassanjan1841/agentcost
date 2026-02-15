import { calculateCost } from '../pricing';
import { CostEvent } from '../types';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiParams {
  model: string;
  contents: GeminiMessage[];
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
    index: number;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export function wrapGeminiClient(
  apiKey: string,
  trackEvent: (event: Omit<CostEvent, 'projectId' | 'timestamp'>) => void,
  debug: boolean = false
): any {
  const client = {
    generateContent: async function (params: GeminiParams): Promise<GeminiResponse> {
      const startTime = Date.now();

      if (debug) {
        console.log('[AgentCost] Tracking Gemini API call:', {
          model: params.model,
        });
      }

      try {
        // Extract model name (e.g., "gemini-pro" from "models/gemini-pro")
        const modelName = params.model.replace('models/', '');
        
        // Call actual Gemini API
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: params.contents,
              generationConfig: params.generationConfig,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data: GeminiResponse = await response.json();

        // Calculate duration
        const duration = Date.now() - startTime;

        // Calculate cost
        const cost = calculateCost(
          'google',
          modelName,
          data.usageMetadata.promptTokenCount,
          data.usageMetadata.candidatesTokenCount
        );

        // Track the event
        trackEvent({
          provider: 'google',
          model: modelName,
          inputTokens: data.usageMetadata.promptTokenCount,
          outputTokens: data.usageMetadata.candidatesTokenCount,
          cost,
          duration,
          metadata: {
            finishReason: data.candidates[0]?.finishReason,
            totalTokens: data.usageMetadata.totalTokenCount,
          },
        });

        if (debug) {
          console.log('[AgentCost] Cost calculated:', {
            inputTokens: data.usageMetadata.promptTokenCount,
            outputTokens: data.usageMetadata.candidatesTokenCount,
            cost: `$${cost.toFixed(6)}`,
            duration: `${duration}ms`,
          });
        }

        return data;
      } catch (error) {
        // Track error
        trackEvent({
          provider: 'google',
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
  };

  return client;
}
