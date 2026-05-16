import Groq from "groq-sdk";
import type { ProviderInvoker, UsageMetadata } from "./types";

const MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 4096;

/**
 * Groq provider — Llama 3.3 70B Versatile. No prompt caching.
 * Usage captured from the final chunk when `stream_options: { include_usage: true }`.
 */
export const streamFromGroq: ProviderInvoker = (systemPrompt, message, history) => {
  let usageResolve!: (u: UsageMetadata) => void;
  let usageReject!: (err: unknown) => void;
  const usagePromise = new Promise<UsageMetadata>((res, rej) => {
    usageResolve = res;
    usageReject = rej;
  });

  async function* streamGen(): AsyncGenerator<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");

    const groq = new Groq({ apiKey });

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
      const stream = await groq.chat.completions.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages,
        stream: true,
        stream_options: { include_usage: true },
      });

      let captured: UsageMetadata = {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      };

      for await (const chunk of stream) {
        const usage = (chunk as { usage?: { prompt_tokens?: number; completion_tokens?: number } }).usage;
        if (usage) {
          captured = {
            inputTokens: usage.prompt_tokens ?? 0,
            outputTokens: usage.completion_tokens ?? 0,
            cacheReadTokens: 0,
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
