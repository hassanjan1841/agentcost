export interface CostTrackerConfig {
  projectId: string;
  apiKey: string;
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
  debug?: boolean;
}

export interface CostEvent {
  projectId: string;
  provider: 'anthropic' | 'openai' | 'google';
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface PricingRate {
  input: number;  // per 1M tokens
  output: number; // per 1M tokens
}

export interface ModelPricing {
  [model: string]: PricingRate;
}

export interface ProviderPricing {
  anthropic: ModelPricing;
  openai: ModelPricing;
  google: ModelPricing;
}
