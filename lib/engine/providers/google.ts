import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProviderInvoker } from "./types";

/**
 * Factory for Google providers — produces a streamer pinned to the given
 * Gemini model. Used to register both Gemini 2.5 Flash and 3.5 Flash.
 *
 * Context caching IS available for some Flash models via cachedContents
 * but requires ≥ 4096 tokens cached. The slim freeform prompt (~80 lines)
 * plus skill (~80 lines) likely sits below threshold, so this implementation
 * pays full input every call. Revisit if combined system content grows.
 */
export function createGoogleStreamer(model: string): ProviderInvoker {
  return async function* (systemPrompt, message, history) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set");
    }

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

    const result = await genModel.generateContentStream({ contents });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  };
}
