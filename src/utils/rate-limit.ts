/**
 * Rate Limit Handler - Detect 429 responses and implement exponential backoff
 */

import { RetryOptions } from '../types';

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class RateLimitHandler {
  private retryCount: Map<string, number>;
  private lastRetryTime: Map<string, number>;

  constructor() {
    this.retryCount = new Map();
    this.lastRetryTime = new Map();
  }

  /**
   * Execute a function with exponential backoff retry logic
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions,
    operationKey: string = 'default'
  ): Promise<T> {
    let lastError: Error | null = null;
    let currentDelay = options.delayMs;

    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Reset retry count on success
        this.retryCount.delete(operationKey);
        this.lastRetryTime.delete(operationKey);
        
        return result;
      } catch (error) {
        lastError = error as Error;

        // Check if it's a rate limit error (HTTP 429)
        const isRateLimit = this.isRateLimitError(error);
        
        if (isRateLimit) {
          console.warn(`[Rate Limit] Attempt ${attempt}/${options.maxAttempts} failed for ${operationKey}`);
        }

        // Don't retry if it's the last attempt
        if (attempt === options.maxAttempts) {
          break;
        }

        // Call retry callback if provided
        if (options.onRetry) {
          options.onRetry(attempt, lastError);
        }

        // Update retry tracking
        this.retryCount.set(operationKey, attempt);
        this.lastRetryTime.set(operationKey, Date.now());

        // Wait before retrying with exponential backoff
        await this.sleep(currentDelay);
        
        // Increase delay for next attempt
        currentDelay = Math.min(
          currentDelay * options.backoffMultiplier,
          options.maxDelayMs
        );
      }
    }

    throw new RateLimitError(
      `Operation failed after ${options.maxAttempts} attempts: ${lastError?.message}`
    );
  }

  /**
   * Check if error is a rate limit error
   */
  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('429') ||
        message.includes('rate limit') ||
        message.includes('too many requests') ||
        message.includes('quota exceeded')
      );
    }
    return false;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get retry statistics for an operation
   */
  public getRetryStats(operationKey: string): { count: number; lastRetry: number | null } {
    return {
      count: this.retryCount.get(operationKey) || 0,
      lastRetry: this.lastRetryTime.get(operationKey) || null,
    };
  }

  /**
   * Reset retry tracking for an operation
   */
  public reset(operationKey?: string): void {
    if (operationKey) {
      this.retryCount.delete(operationKey);
      this.lastRetryTime.delete(operationKey);
    } else {
      this.retryCount.clear();
      this.lastRetryTime.clear();
    }
  }
}

// Singleton instance
export const rateLimitHandler = new RateLimitHandler();
