import type { ProviderId } from "./providers";

export type ModelFamily = "Anthropic" | "Google" | "OpenAI";

export interface ModelInfo {
  /** Friendly UI label, e.g. "Sonnet 4.6". */
  label: string;
  family: ModelFamily;
  /**
   * One-line recommendation: when is this model the right pick?
   * Used in the mode selector hint and the cost calculator.
   */
  bestFor: string;
}

export const MODEL_INFO: Record<ProviderId, ModelInfo> = {
  sonnet: {
    label: "Sonnet 4.6",
    family: "Anthropic",
    bestFor:
      "Highest-quality widgets — decision cards, dense tables, nuanced charts. Premium price, strongest reasoning.",
  },
  haiku: {
    label: "Haiku 4.5",
    family: "Anthropic",
    bestFor:
      "Fast, cheap default — solid widget quality for chips, banners, code blocks, simple comparisons.",
  },
  "gemini-flash": {
    label: "Gemini 2.5 Flash",
    family: "Google",
    bestFor:
      "Balanced multimodal — strong tables and structured outputs at low cost. (Subject to project spend cap.)",
  },
  "gemini-flash-lite": {
    label: "Gemini 2.0 Flash Lite",
    family: "Google",
    bestFor:
      "Cheapest of the lineup — use for chips, banners, short follow-ups. Skip for complex widgets.",
  },
  "gpt-4o-mini": {
    label: "GPT-4o Mini",
    family: "OpenAI",
    bestFor:
      "Cheap OpenAI option — reliable for chips, code blocks, banners. Less design polish than Sonnet/GPT-4o.",
  },
  "gpt-4o": {
    label: "GPT-4o",
    family: "OpenAI",
    bestFor:
      "Balanced quality/cost — design-strong on tables, charts, and React widgets. Good A/B vs Sonnet.",
  },
  "gpt-5": {
    label: "GPT-5",
    family: "OpenAI",
    bestFor:
      "Premium reasoning — hardest queries, deep comparisons, complex decision matrices. Most expensive.",
  },
};

export function getModelLabel(id: ProviderId): string {
  return MODEL_INFO[id].label;
}
