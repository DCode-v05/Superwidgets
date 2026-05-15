import OpenAI from "openai";
import type { ProviderInvoker } from "./types";

const MAX_COMPLETION_TOKENS = 16384;

/**
 * Factory for OpenAI providers — produces a streamer pinned to the given
 * model. Used to register both gpt-4o-mini and gpt-5-mini.
 *
 * `max_completion_tokens` is the post-2024 replacement for `max_tokens`.
 * GPT-5 family rejects `max_tokens`; the new param is accepted by older
 * models too (gpt-4o-mini), so a single param works across the registry.
 *
 * Set generously high (16384) because GPT-5 family models are REASONING
 * models — internal "thinking" tokens count against this budget. With a
 * 4K cap and medium effort, the model often burns the budget on reasoning
 * and stream-cuts mid-widget, producing an "unclosed widget block" error.
 *
 * For GPT-5 family, also set `reasoning_effort: "low"` — HTML widget
 * generation needs structured output, not deep reasoning, so we want the
 * vast majority of the budget going to visible output. (The newer
 * "minimal" value isn't typed in SDK ^4.70.0 yet, but "low" achieves the
 * same effect with the type the SDK accepts.)
 *
 * OpenAI prompt caching is automatic for prompts ≥ 1024 tokens — cached
 * input tokens are billed at 50% of the normal input rate. No explicit
 * cache_control field is needed; the API handles it transparently.
 */
export function createOpenAIStreamer(model: string): ProviderInvoker {
  const isGpt5 = model.startsWith("gpt-5");

  return async function* (systemPrompt, message, history) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const client = new OpenAI({ apiKey });

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];
    for (const m of history) {
      if (m.content && m.content.trim().length > 0) {
        messages.push({ role: m.role, content: m.content });
      }
    }
    messages.push({ role: "user", content: message });

    const stream = await client.chat.completions.create({
      model,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      messages,
      stream: true,
      ...(isGpt5 ? { reasoning_effort: "low" as const } : {}),
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  };
}
