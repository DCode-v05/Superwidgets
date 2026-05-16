import type { ProviderId } from "./providers";
import type { UsageMetadata } from "./providers/types";

interface ProviderPricing {
  /** $/MTok for standard (uncached) input. */
  input: number;
  /** $/MTok for output. */
  output: number;
  /** $/MTok for cache-read input. */
  cachedInput: number;
}

/**
 * Pricing tier per model in USD per million tokens.
 * Update quarterly — these are point-in-time estimates as of 2026-05.
 * Anthropic cache writes are billed at input × 1.25, computed below.
 */
const PRICING: Record<ProviderId, ProviderPricing> = {
  sonnet: { input: 3.00, output: 15.00, cachedInput: 0.30 },
  haiku: { input: 0.80, output: 4.00, cachedInput: 0.08 },
  "gemini-2.5": { input: 0.075, output: 0.30, cachedInput: 0.075 },
  "gemini-3": { input: 0.50, output: 3.00, cachedInput: 0.50 },
  llama: { input: 0.59, output: 0.79, cachedInput: 0.59 },
  "gpt-5.4-mini": { input: 0.75, output: 4.50, cachedInput: 0.075 },
  "gpt-5.4": { input: 1.25, output: 10.00, cachedInput: 0.125 },
};

export function getPricing(providerId: ProviderId): ProviderPricing {
  return PRICING[providerId];
}

export function computeCost(providerId: ProviderId, usage: UsageMetadata): number {
  const p = PRICING[providerId];
  const standardInput = Math.max(
    0,
    usage.inputTokens - usage.cacheReadTokens - usage.cacheWriteTokens,
  );
  const inputCost =
    (standardInput * p.input +
      usage.cacheReadTokens * p.cachedInput +
      usage.cacheWriteTokens * p.input * 1.25) /
    1_000_000;
  const outputCost = (usage.outputTokens * p.output) / 1_000_000;
  return inputCost + outputCost;
}
