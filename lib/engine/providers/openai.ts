import OpenAI from "openai";
import type {
  AgentTurnInvoker,
  StopReason,
  TurnEvent,
  UsageMetadata,
} from "./types";
import type { AgentMessage, ToolDefinition } from "../tools/types";

const MAX_OUTPUT_TOKENS = 16384;

/**
 * OpenAI agentic-turn invoker — uses the Responses API (`/v1/responses`).
 *
 * Why Responses and not Chat Completions: GPT-5 family rejects
 * `reasoning_effort` + `tools` on `/v1/chat/completions` (returns 400
 * "Please use /v1/responses instead"). The Responses API is OpenAI's
 * recommended path for tool-using agents and lets us set
 * `reasoning.effort: "minimal"` — the cheapest tier, ideal for the
 * classify → choose → verify → submit loop where deep reasoning is
 * wasted on each small structured tool call.
 *
 * Streaming events handled:
 *   - response.output_item.added              (track new function_call items)
 *   - response.output_text.delta              (stream visible text)
 *   - response.function_call_arguments.delta  (accumulate tool arguments)
 *   - response.output_item.done               (emit completed tool_call)
 *   - response.completed                      (capture usage + stop reason)
 */
export function createOpenAIAgent(model: string): AgentTurnInvoker {
  return (systemPrompt, messages, tools) => {
    let resolveDone!: (v: { usage: UsageMetadata; stopReason: StopReason }) => void;
    let rejectDone!: (err: unknown) => void;
    const donePromise = new Promise<{ usage: UsageMetadata; stopReason: StopReason }>(
      (res, rej) => {
        resolveDone = res;
        rejectDone = rej;
      },
    );

    async function* streamGen(): AsyncGenerator<TurnEvent> {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

      const client = new OpenAI({ apiKey });

      const input = toResponsesInput(messages);
      const apiTools = tools.map(toResponsesTool);

      try {
        const stream = await client.responses.create({
          model,
          instructions: systemPrompt,
          input,
          tools: apiTools,
          // GPT-5 family accepts {none, low, medium, high, xhigh}. "none"
          // disables reasoning entirely — ideal for our tool-dispatch loop
          // (classify / choose / validate / render) which doesn't need it.
          // SDK ^4.104 types only know low/medium/high so we cast.
          reasoning: { effort: "none" as "low" },
          max_output_tokens: MAX_OUTPUT_TOKENS,
          stream: true,
        });

        // Accumulate streaming function-call arguments per output_index
        const fnCalls = new Map<
          number,
          { call_id: string; name: string; args: string }
        >();

        let capturedUsage: UsageMetadata = {
          inputTokens: 0,
          outputTokens: 0,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
        };
        let stopReason: StopReason = "other";

        for await (const event of stream) {
          // The SDK types stream events as a discriminated union via .type
          // — we narrow with switch on the string literal.
          switch (event.type) {
            case "response.output_item.added": {
              const item = (event as { item?: { type?: string; call_id?: string; name?: string } }).item;
              const idx = (event as { output_index?: number }).output_index ?? 0;
              if (item?.type === "function_call" && item.call_id && item.name) {
                fnCalls.set(idx, { call_id: item.call_id, name: item.name, args: "" });
              }
              break;
            }
            case "response.output_text.delta": {
              const delta = (event as { delta?: string }).delta ?? "";
              if (delta) yield { type: "text", delta };
              break;
            }
            case "response.function_call_arguments.delta": {
              const idx = (event as { output_index?: number }).output_index ?? 0;
              const delta = (event as { delta?: string }).delta ?? "";
              const fc = fnCalls.get(idx);
              if (fc) fc.args += delta;
              break;
            }
            case "response.output_item.done": {
              const idx = (event as { output_index?: number }).output_index ?? 0;
              const fc = fnCalls.get(idx);
              if (fc) {
                yield {
                  type: "tool_call",
                  call: {
                    id: fc.call_id,
                    name: fc.name,
                    input: safeParseJson(fc.args),
                  },
                };
                fnCalls.delete(idx);
              }
              break;
            }
            case "response.completed": {
              const resp = (event as { response?: ResponseFinal }).response;
              if (resp?.usage) {
                capturedUsage = {
                  inputTokens: resp.usage.input_tokens ?? 0,
                  outputTokens: resp.usage.output_tokens ?? 0,
                  cacheReadTokens:
                    resp.usage.input_tokens_details?.cached_tokens ?? 0,
                  cacheWriteTokens: 0,
                };
              }
              // Determine stop reason from the final output array
              const hadToolCall = resp?.output?.some(
                (it) => it?.type === "function_call",
              );
              stopReason = hadToolCall ? "tool_use" : "end_turn";
              break;
            }
            case "response.failed":
            case "response.incomplete": {
              const resp = (event as { response?: ResponseFinal }).response;
              if (resp?.incomplete_details?.reason === "max_output_tokens") {
                stopReason = "max_tokens";
              } else {
                stopReason = "other";
              }
              if (resp?.usage) {
                capturedUsage = {
                  inputTokens: resp.usage.input_tokens ?? 0,
                  outputTokens: resp.usage.output_tokens ?? 0,
                  cacheReadTokens:
                    resp.usage.input_tokens_details?.cached_tokens ?? 0,
                  cacheWriteTokens: 0,
                };
              }
              break;
            }
            // Other events (response.created, response.in_progress,
            // response.output_text.done, response.function_call_arguments.done,
            // reasoning summary events, etc.) we don't need to act on.
            default:
              break;
          }
        }

        resolveDone({ usage: capturedUsage, stopReason });
      } catch (err) {
        rejectDone(err);
        throw err;
      }
    }

    return { stream: streamGen(), done: () => donePromise };
  };
}

// === Input/tool translation ===

type ResponseFinal = {
  output?: Array<{ type?: string } | null>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    input_tokens_details?: { cached_tokens?: number };
  };
  incomplete_details?: { reason?: string };
};

type InputItem =
  | { role: "user" | "assistant" | "system" | "developer"; content: string }
  | {
      type: "function_call";
      call_id: string;
      name: string;
      arguments: string;
    }
  | {
      type: "function_call_output";
      call_id: string;
      output: string;
    };

function toResponsesInput(messages: AgentMessage[]): InputItem[] {
  const items: InputItem[] = [];
  for (const m of messages) {
    if (m.role === "user") {
      items.push({ role: "user", content: m.content });
    } else if (m.role === "assistant") {
      if (m.content && m.content.trim()) {
        items.push({ role: "assistant", content: m.content });
      }
      for (const tc of m.toolCalls ?? []) {
        items.push({
          type: "function_call",
          call_id: tc.id,
          name: tc.name,
          arguments: JSON.stringify(tc.input),
        });
      }
    } else {
      // role === "tool"
      for (const r of m.results) {
        items.push({
          type: "function_call_output",
          call_id: r.toolCallId,
          output: r.content,
        });
      }
    }
  }
  return items;
}

function toResponsesTool(t: ToolDefinition) {
  return {
    type: "function" as const,
    name: t.name,
    description: t.description,
    parameters: t.input_schema,
    strict: false,
  };
}

function safeParseJson(s: string): Record<string, unknown> {
  if (!s.trim()) return {};
  try {
    const parsed = JSON.parse(s);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
