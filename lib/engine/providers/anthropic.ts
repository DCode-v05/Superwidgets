import Anthropic from "@anthropic-ai/sdk";
import type { ProviderInvoker, UsageMetadata } from "./types";

const MAX_TOKENS = 4096;

/**
 * Factory for Anthropic providers — produces a streamer pinned to the given
 * model. Uses the beta prompt-caching endpoint (SDK ^0.32.1 quirk).
 *
 * Usage is captured from MessageStream.finalMessage() after streaming
 * completes. Anthropic reports cache_creation and cache_read tokens
 * separately from input_tokens; we map them into the normalized
 * UsageMetadata shape (total billed input = input + cache_read + cache_write).
 */
export function createAnthropicStreamer(model: string): ProviderInvoker {
  return (systemPrompt, message, history) => {
    let usageResolve!: (u: UsageMetadata) => void;
    let usageReject!: (err: unknown) => void;
    const usagePromise = new Promise<UsageMetadata>((res, rej) => {
      usageResolve = res;
      usageReject = rej;
    });

    async function* streamGen(): AsyncGenerator<string> {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

      const client = new Anthropic({ apiKey });

      const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
      for (const m of history) {
        if (m.content && m.content.trim().length > 0) {
          messages.push({ role: m.role, content: m.content });
        }
      }
      messages.push({ role: "user", content: message });

      const apiStream = client.beta.promptCaching.messages.stream({
        model,
        max_tokens: MAX_TOKENS,
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages,
      });

      try {
        for await (const event of apiStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            yield event.delta.text;
          }
        }
        const final = await apiStream.finalMessage();
        const u = final.usage;
        const cacheRead = (u as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0;
        const cacheWrite = (u as { cache_creation_input_tokens?: number }).cache_creation_input_tokens ?? 0;
        usageResolve({
          inputTokens: u.input_tokens + cacheRead + cacheWrite,
          outputTokens: u.output_tokens,
          cacheReadTokens: cacheRead,
          cacheWriteTokens: cacheWrite,
        });
      } catch (err) {
        usageReject(err);
        throw err;
      }
    }

    return { stream: streamGen(), usage: () => usagePromise };
  };
}
