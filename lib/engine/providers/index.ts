import { createAnthropicStreamer } from "./anthropic";
import { createGoogleStreamer } from "./google";
import { streamFromGroq } from "./groq";
import { createOpenAIStreamer } from "./openai";
import type { ProviderInvoker } from "./types";

export type { ProviderInvoker } from "./types";

export type ProviderId =
  | "sonnet"
  | "haiku"
  | "gemini-2.5"
  | "gemini-3"
  | "llama"
  | "gpt-5.4-mini"
  | "gpt-5.4";

export const PROVIDER_IDS: ProviderId[] = [
  "sonnet",
  "haiku",
  "gemini-2.5",
  "gemini-3",
  "llama",
  "gpt-5.4-mini",
  "gpt-5.4",
];

const REGISTRY: Record<ProviderId, ProviderInvoker> = {
  sonnet: createAnthropicStreamer("claude-sonnet-4-6"),
  haiku: createAnthropicStreamer("claude-haiku-4-5-20251001"),
  "gemini-2.5": createGoogleStreamer("gemini-2.5-flash"),
  "gemini-3": createGoogleStreamer("gemini-3-flash-preview"),
  llama: streamFromGroq,
  "gpt-5.4-mini": createOpenAIStreamer("gpt-5.4-mini"),
  "gpt-5.4": createOpenAIStreamer("gpt-5.4"),
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
