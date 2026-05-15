import Groq from "groq-sdk";

const MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 4096;

/**
 * Groq provider — Llama 3.3 70B Versatile.
 * Groq does NOT support prompt caching as of late 2025; every call pays
 * full input price. The mode-selector UI surfaces a warning when this
 * provider is active so the user is aware of the cost profile.
 */
export async function* streamFromGroq(
  systemPrompt: string,
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
): AsyncGenerator<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }

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

  const stream = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}
