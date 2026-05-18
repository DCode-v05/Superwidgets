/**
 * Classify raw provider error strings into something a human can act on.
 *
 * The providers throw whatever the SDK gives back — usually JSON-stringified
 * 4xx/5xx bodies. This module turns those into a `{ message, hint }` pair
 * that the chat UI can render as a banner.
 */
export interface ClassifiedError {
  message: string;
  hint?: string;
}

export function classifyEngineError(raw: string): ClassifiedError {
  const lower = raw.toLowerCase();

  // Missing-key cases — engine code throws this exact text
  if (lower.includes("anthropic_api_key is not set")) {
    return {
      message: "Anthropic key is missing.",
      hint: "Add ANTHROPIC_API_KEY to .env.local and restart the dev server. This is required for Sonnet and Haiku.",
    };
  }
  if (lower.includes("google_api_key is not set")) {
    return {
      message: "Google key is missing.",
      hint: "Add GOOGLE_API_KEY to .env.local and restart. Required for Gemini.",
    };
  }
  if (lower.includes("openai_api_key is not set")) {
    return {
      message: "OpenAI key is missing.",
      hint: "Add OPENAI_API_KEY to .env.local and restart. Required for GPT-4o and GPT-5.",
    };
  }

  // Anthropic 401 / invalid key
  if (lower.includes("invalid_api_key") || (lower.includes("401") && lower.includes("anthropic"))) {
    return {
      message: "Anthropic key is invalid or revoked.",
      hint: "Generate a new key at console.anthropic.com and replace ANTHROPIC_API_KEY in .env.local.",
    };
  }

  // OpenAI 401
  if (lower.includes("401") && (lower.includes("openai") || lower.includes("incorrect api key"))) {
    return {
      message: "OpenAI key is invalid or revoked.",
      hint: "Generate a new key at platform.openai.com and replace OPENAI_API_KEY in .env.local.",
    };
  }

  // Google API key invalid
  if (lower.includes("api_key_invalid") || (lower.includes("400") && lower.includes("api key"))) {
    return {
      message: "Google key is invalid.",
      hint: "Generate a new key at aistudio.google.com/app/apikey and replace GOOGLE_API_KEY in .env.local.",
    };
  }

  // Google quota / spend cap (the live state right now)
  if (
    lower.includes("resource_exhausted") ||
    lower.includes("spending cap") ||
    (lower.includes("429") && lower.includes("google"))
  ) {
    return {
      message: "Google project has hit its monthly spend cap.",
      hint: "Lift the cap at https://ai.studio/spend or switch to an Anthropic or OpenAI model.",
    };
  }

  // Anthropic / OpenAI rate limiting
  if (lower.includes("rate_limit") || lower.includes("429")) {
    return {
      message: "Rate limit hit on this provider.",
      hint: "Wait 30–60s and retry, or switch to a different provider for this turn.",
    };
  }

  // Unknown model
  if (lower.includes("not_found_error") || (lower.includes("404") && lower.includes("model"))) {
    const modelMatch = raw.match(/model:\s*([a-z0-9.\-_]+)/i);
    const model = modelMatch ? modelMatch[1] : "unknown";
    return {
      message: `Model "${model}" not accessible from this account.`,
      hint: "Check that your API key's plan or org grants this model. Update lib/engine/providers/index.ts if you need a different model ID.",
    };
  }

  // OpenAI insufficient quota / billing
  if (lower.includes("insufficient_quota") || lower.includes("billing")) {
    return {
      message: "OpenAI account has no credit or billing is suspended.",
      hint: "Add billing at platform.openai.com/account/billing, or switch to an Anthropic model.",
    };
  }

  // Server-side 5xx
  if (lower.includes("500") || lower.includes("502") || lower.includes("503") || lower.includes("overloaded")) {
    return {
      message: "Upstream provider is having issues right now.",
      hint: "Try again in a few seconds, or switch providers to bypass.",
    };
  }

  // Fallback — surface the raw cause but mark it as unclassified
  return {
    message: raw.length > 220 ? raw.slice(0, 220) + "…" : raw,
  };
}
