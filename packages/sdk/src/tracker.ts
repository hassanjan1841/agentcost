import { CostTrackerConfig, CostEvent } from './types';
import { wrapAnthropicClient } from './providers/anthropic';
import { wrapOpenAIClient } from './providers/openai';
import { wrapGeminiClient } from './providers/google';
import { retryWithBackoff } from './utils';
import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_ENDPOINT = 'https://api.agentcost.dev/api/track';
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_FLUSH_INTERVAL = 5000; // 5 seconds

export class CostTracker {
  private config: Required<CostTrackerConfig>;
  private queue: CostEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private isFlushing: boolean = false;

  constructor(config: CostTrackerConfig) {
    this.config = {
      endpoint: DEFAULT_ENDPOINT,
      batchSize: DEFAULT_BATCH_SIZE,
      flushInterval: DEFAULT_FLUSH_INTERVAL,
      debug: false,
      ...config,
    };

    this.startFlush();

    if (this.config.debug) {
      console.log('[AgentCost] Tracker initialized:', {
        projectId: this.config.projectId,
        endpoint: this.config.endpoint,
        batchSize: this.config.batchSize,
        flushInterval: this.config.flushInterval,
      });
    }
  }

  /**
   * Wrap an Anthropic client to track costs
   */
  anthropic(apiKey: string): Anthropic {
    return wrapAnthropicClient(
      apiKey,
      (event) => this.track(event),
      this.config.debug
    );
  }

  /**
   * Wrap an OpenAI client to track costs
   */
  openai(apiKey: string): any {
    return wrapOpenAIClient(
      apiKey,
      (event) => this.track(event),
      this.config.debug
    );
  }

  /**
   * Wrap a Google Gemini client to track costs
   */
  google(apiKey: string): any {
    return wrapGeminiClient(
      apiKey,
      (event) => this.track(event),
      this.config.debug
    );
  }

  /**
   * Track a cost event
   */
  private track(event: Omit<CostEvent, 'projectId' | 'timestamp'>): void {
    const fullEvent: CostEvent = {
      projectId: this.config.projectId,
      timestamp: Date.now(),
      ...event,
    };

    this.queue.push(fullEvent);

    if (this.config.debug) {
      console.log('[AgentCost] Event queued:', {
        queueLength: this.queue.length,
        event: fullEvent,
      });
    }

    // Flush if batch size reached
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush events to the API
   */
  private async flush(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;

    // Take events from queue
    const events = [...this.queue];
    this.queue = [];

    if (this.config.debug) {
      console.log('[AgentCost] Flushing events:', {
        count: events.length,
        endpoint: this.config.endpoint,
      });
    }

    try {
      await retryWithBackoff(async () => {
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey,
          },
          body: JSON.stringify({ events }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to track events: ${response.status} ${response.statusText}`
          );
        }

        if (this.config.debug) {
          console.log('[AgentCost] Events sent successfully');
        }
      });
    } catch (error) {
      console.error('[AgentCost] Failed to send events after retries:', error);
      
      // Re-queue events on failure
      this.queue.push(...events);

      if (this.config.debug) {
        console.log('[AgentCost] Events re-queued:', {
          queueLength: this.queue.length,
        });
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Start automatic flushing
   */
  private startFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);

    // Handle process exit
    if (typeof process !== 'undefined') {
      process.on('beforeExit', () => {
        this.destroy();
      });
    }
  }

  /**
   * Stop tracking and flush remaining events
   */
  async destroy(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    await this.flush();

    if (this.config.debug) {
      console.log('[AgentCost] Tracker destroyed');
    }
  }
}
