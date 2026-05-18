import { createAnthropicStreamer } from "./anthropic";
import { createGoogleStreamer } from "./google";
import { createOpenAIStreamer } from "./openai";
import type { ProviderInvoker } from "./types";

export type { ProviderInvoker } from "./types";

export type ProviderId =
  | "sonnet"
  | "haiku"
  | "gemini-flash"
  | "gemini-flash-lite"
  | "gpt-4o-mini"
  | "gpt-4o"
  | "gpt-5";

export const PROVIDER_IDS: ProviderId[] = [
  "sonnet",
  "haiku",
  "gemini-flash",
  "gemini-flash-lite",
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-5",
];

const REGISTRY: Record<ProviderId, ProviderInvoker> = {
  sonnet: createAnthropicStreamer("claude-sonnet-4-6"),
  haiku: createAnthropicStreamer("claude-haiku-4-5-20251001"),
  "gemini-flash": createGoogleStreamer("gemini-2.5-flash"),
  "gemini-flash-lite": createGoogleStreamer("gemini-2.0-flash-lite"),
  "gpt-4o-mini": createOpenAIStreamer("gpt-4o-mini"),
  "gpt-4o": createOpenAIStreamer("gpt-4o"),
  "gpt-5": createOpenAIStreamer("gpt-5"),
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
