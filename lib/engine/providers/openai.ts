import OpenAI from "openai";
import type { ProviderInvoker, UsageMetadata } from "./types";

const MAX_COMPLETION_TOKENS = 16384;

/**
 * Factory for OpenAI providers — produces a streamer pinned to the given
 * model. `gpt-5*` models are reasoning models; we set `reasoning_effort: "low"`
 * to avoid burning the visible-output budget on thinking tokens.
 *
 * Usage captured from the final chunk when `stream_options: { include_usage: true }`.
 * Prompt caching is automatic on prompts ≥ 1024 tokens — cached tokens
 * appear in `prompt_tokens_details.cached_tokens`.
 */
export function createOpenAIStreamer(model: string): ProviderInvoker {
  const isGpt5 = model.startsWith("gpt-5");

  return (systemPrompt, message, history) => {
    let usageResolve!: (u: UsageMetadata) => void;
    let usageReject!: (err: unknown) => void;
    const usagePromise = new Promise<UsageMetadata>((res, rej) => {
      usageResolve = res;
      usageReject = rej;
    });

    async function* streamGen(): AsyncGenerator<string> {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

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

      try {
        const stream = await client.chat.completions.create({
          model,
          max_completion_tokens: MAX_COMPLETION_TOKENS,
          messages,
          stream: true,
          stream_options: { include_usage: true },
          ...(isGpt5 ? { reasoning_effort: "low" as const } : {}),
        });

        let captured: UsageMetadata = {
          inputTokens: 0,
          outputTokens: 0,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
        };

        for await (const chunk of stream) {
          const usage = (chunk as {
            usage?: {
              prompt_tokens?: number;
              completion_tokens?: number;
              prompt_tokens_details?: { cached_tokens?: number };
            };
          }).usage;
          if (usage) {
            captured = {
              inputTokens: usage.prompt_tokens ?? 0,
              outputTokens: usage.completion_tokens ?? 0,
              cacheReadTokens: usage.prompt_tokens_details?.cached_tokens ?? 0,
              cacheWriteTokens: 0,
            };
          }
          const content = chunk.choices[0]?.delta?.content;
          if (content) yield content;
        }
        usageResolve(captured);
      } catch (err) {
        usageReject(err);
        throw err;
      }
    }

    return { stream: streamGen(), usage: () => usagePromise };
  };
}
