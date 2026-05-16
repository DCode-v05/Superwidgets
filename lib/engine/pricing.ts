import type { ProviderId } from "./providers";
import type { UsageMetadata } from "./providers/types";

export interface ProviderPricing {
  /** $/MTok for standard (uncached) input. */
  input: number;
  /** $/MTok for output. */
  output: number;
  /** $/MTok for cache-read input ("cache hits"). */
  cachedInput: number;
}

/**
 * Pricing per model in USD per million tokens — verified against official
 * docs (Anthropic, OpenAI, Google) as of 2026-05-13.
 *
 * Anthropic cache writes (5m) cost 1.25× the base input rate — applied in
 * `computeCost` via the `cacheWriteTokens` field.
 *
 * Gemini context caching cache-read rate is ~10% of base input (when used).
 * OpenAI auto-caching: cached input is ~10% of base (GPT-5.4 family / 5.5).
 * GPT-5.4 Mini cached is also 10% of base.
 */
const PRICING: Record<ProviderId, ProviderPricing> = {
  sonnet: { input: 3.00, output: 15.00, cachedInput: 0.30 },
  haiku: { input: 1.00, output: 5.00, cachedInput: 0.10 },
  "gemini-3": { input: 0.50, output: 3.00, cachedInput: 0.05 },
  "gemini-3.1": { input: 0.25, output: 1.50, cachedInput: 0.025 },
  "gpt-5.4-mini": { input: 0.75, output: 4.50, cachedInput: 0.075 },
  "gpt-5.4": { input: 2.50, output: 15.00, cachedInput: 0.25 },
  "gpt-5.5": { input: 5.00, output: 30.00, cachedInput: 0.50 },
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

/**
 * Estimate cost for arbitrary input/output token counts at a given cache
 * hit ratio. Used by the in-app cost calculator.
 */
export function estimateCost(
  providerId: ProviderId,
  inputTokens: number,
  outputTokens: number,
  cacheHitRate: number,
): number {
  const p = PRICING[providerId];
  const cachedInput = Math.floor(inputTokens * Math.max(0, Math.min(1, cacheHitRate)));
  const standardInput = Math.max(0, inputTokens - cachedInput);
  return (
    (standardInput * p.input + cachedInput * p.cachedInput + outputTokens * p.output) /
    1_000_000
  );
}
