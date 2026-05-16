import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProviderInvoker, UsageMetadata } from "./types";

/**
 * Factory for Google providers — produces a streamer pinned to a Gemini model.
 * Usage is read from `result.response.usageMetadata` after streaming.
 */
export function createGoogleStreamer(model: string): ProviderInvoker {
  return (systemPrompt, message, history) => {
    let usageResolve!: (u: UsageMetadata) => void;
    let usageReject!: (err: unknown) => void;
    const usagePromise = new Promise<UsageMetadata>((res, rej) => {
      usageResolve = res;
      usageReject = rej;
    });

    async function* streamGen(): AsyncGenerator<string> {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) throw new Error("GOOGLE_API_KEY is not set");

      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({
        model,
        systemInstruction: systemPrompt,
      });

      const contents = history
        .filter((m) => m.content && m.content.trim().length > 0)
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));
      contents.push({ role: "user", parts: [{ text: message }] });

      try {
        const result = await genModel.generateContentStream({ contents });
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) yield text;
        }
        const finalResponse = await result.response;
        const meta = finalResponse.usageMetadata;
        if (meta) {
          const cacheRead = (meta as { cachedContentTokenCount?: number }).cachedContentTokenCount ?? 0;
          usageResolve({
            inputTokens: meta.promptTokenCount,
            outputTokens: meta.candidatesTokenCount ?? 0,
            cacheReadTokens: cacheRead,
            cacheWriteTokens: 0,
          });
        } else {
          usageResolve({
            inputTokens: 0,
            outputTokens: 0,
            cacheReadTokens: 0,
            cacheWriteTokens: 0,
          });
        }
      } catch (err) {
        usageReject(err);
        throw err;
      }
    }

    return { stream: streamGen(), usage: () => usagePromise };
  };
}
