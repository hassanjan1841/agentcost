import { ProviderPricing, PricingRate } from './types';

// Pricing data as of February 2025
// Prices are per 1 million tokens
export const PRICING: ProviderPricing = {
  anthropic: {
    'claude-opus-4': { input: 15.00, output: 75.00 },
    'claude-opus-4-20250514': { input: 15.00, output: 75.00 },
    'claude-sonnet-4': { input: 3.00, output: 15.00 },
    'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 },
    'claude-haiku-4': { input: 0.80, output: 4.00 },
    'claude-haiku-4-20250514': { input: 0.80, output: 4.00 },
    // Legacy models
    'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
    'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  },
  openai: {
    'gpt-4': { input: 30.00, output: 60.00 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
  },
  google: {
    'gemini-pro': { input: 0.125, output: 0.375 },
    'gemini-1.5-pro': { input: 1.25, output: 5.00 },
    'gemini-ultra': { input: 12.50, output: 37.50 },
  },
};

export function calculateCost(
  provider: keyof ProviderPricing,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const providerPricing = PRICING[provider];
  
  if (!providerPricing) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  // Try exact match first
  let rates = providerPricing[model];
  
  // If not found, try to match by model family
  if (!rates) {
    const modelFamily = model.split('-')[0]; // e.g., "claude" from "claude-sonnet-4-20250514"
    const familyMatch = Object.keys(providerPricing).find(
      key => key.startsWith(modelFamily)
    );
    
    if (familyMatch) {
      rates = providerPricing[familyMatch];
      console.warn(
        `Exact model "${model}" not found in pricing. Using "${familyMatch}" rates.`
      );
    }
  }

  if (!rates) {
    throw new Error(
      `Unknown model: ${model}. Please update pricing data or report this at https://github.com/yourusername/agentcost/issues`
    );
  }

  const inputCost = (inputTokens / 1_000_000) * rates.input;
  const outputCost = (outputTokens / 1_000_000) * rates.output;

  return inputCost + outputCost;
}
