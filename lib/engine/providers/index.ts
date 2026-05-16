import { createAnthropicStreamer } from "./anthropic";
import { createGoogleStreamer } from "./google";
import { createOpenAIStreamer } from "./openai";
import type { ProviderInvoker } from "./types";

export type { ProviderInvoker } from "./types";

export type ProviderId =
  | "sonnet"
  | "haiku"
  | "gemini-3"
  | "gemini-3.1"
  | "gpt-5.4-mini"
  | "gpt-5.4"
  | "gpt-5.5";

export const PROVIDER_IDS: ProviderId[] = [
  "sonnet",
  "haiku",
  "gemini-3",
  "gemini-3.1",
  "gpt-5.4-mini",
  "gpt-5.4",
  "gpt-5.5",
];

const REGISTRY: Record<ProviderId, ProviderInvoker> = {
  sonnet: createAnthropicStreamer("claude-sonnet-4-6"),
  haiku: createAnthropicStreamer("claude-haiku-4-5-20251001"),
  "gemini-3": createGoogleStreamer("gemini-3-flash-preview"),
  "gemini-3.1": createGoogleStreamer("gemini-3.1-flash-lite-preview"),
  "gpt-5.4-mini": createOpenAIStreamer("gpt-5.4-mini"),
  "gpt-5.4": createOpenAIStreamer("gpt-5.4"),
  "gpt-5.5": createOpenAIStreamer("gpt-5.5"),
};

export function getProvider(id: ProviderId): ProviderInvoker {
  const invoker = REGISTRY[id];
  if (!invoker) {
    throw new Error(`Unknown providerId: ${id}`);
  }
  return invoker;
}

export function isProviderId(value: unknown): value is ProviderId {
  return typeof value === "string" && PROVIDER_IDS.includes(value as ProviderId);
}
