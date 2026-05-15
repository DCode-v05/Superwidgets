import Anthropic from "@anthropic-ai/sdk";
import type { ProviderInvoker } from "./types";

const MAX_TOKENS = 4096;

/**
 * Factory for Anthropic providers — produces a streamer pinned to the given
 * model. Used to register both Sonnet 4.6 and Haiku 4.5 in the registry.
 *
 * Uses the beta prompt-caching endpoint because the installed SDK version
 * (^0.32.1) only exposes cache_control under client.beta.promptCaching.
 * Once the SDK is bumped to a version where caching is GA on the main
 * Messages API, switch to client.messages.stream(...) with the same body.
 *
 * The system prompt is wrapped in an ephemeral cache_control block so
 * subsequent calls within ~5 minutes hit the cache (~10% of input cost).
 * Caching requires the cached content ≥ 1024 tokens; if the system prompt
 * is shorter, the marker is accepted but no caching occurs — verify
 * cache_read_input_tokens > 0 in the API response.
 */
export function createAnthropicStreamer(model: string): ProviderInvoker {
  return async function* (systemPrompt, message, history) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }

    const client = new Anthropic({ apiKey });

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
    for (const m of history) {
      if (m.content && m.content.trim().length > 0) {
        messages.push({ role: m.role, content: m.content });
      }
    }
    messages.push({ role: "user", content: message });

    const stream = client.beta.promptCaching.messages.stream({
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

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  };
}
