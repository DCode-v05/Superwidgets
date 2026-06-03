import type { EngineEvent } from "@/lib/types/engine-widgets";
import { getProvider, type ProviderId } from "./providers";
import type { UsageMetadata } from "./providers/types";
import { SYSTEM_PROMPT_FREEFORM } from "./system-prompt-freeform";
import { FRONTEND_DESIGN_SKILL } from "./frontend-design-skill";
import { computeCost } from "./pricing";
import {
  TOOL_DEFINITIONS,
  executeTool,
  type AgentMessage,
  type ToolCall,
  type ToolResult,
} from "./tools";

const SKILL_SEPARATOR = "\n\n---\n\n";
const MAX_ITERATIONS = 8;

export interface RunEngineOpts {
  providerId: ProviderId;
  useSkill: boolean;
}

export async function* runEngine(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  opts: RunEngineOpts,
): AsyncGenerator<EngineEvent> {
  const invoker = getProvider(opts.providerId);
  const systemPrompt = opts.useSkill
    ? FRONTEND_DESIGN_SKILL + SKILL_SEPARATOR + SYSTEM_PROMPT_FREEFORM
    : SYSTEM_PROMPT_FREEFORM;

  const messages: AgentMessage[] = [
    ...history
      .filter((m) => m.content && m.content.trim().length > 0)
      .map<AgentMessage>((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const summedUsage: UsageMetadata = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  };

  let finalWidget: { html: string; prose: string | null } | null = null;
  let loopError: string | null = null;

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
    const turn = invoker(systemPrompt, messages, TOOL_DEFINITIONS);

    let assistantText = "";
    const toolCallsThisTurn: ToolCall[] = [];

    try {
      for await (const ev of turn.stream) {
        if (ev.type === "text") {
          assistantText += ev.delta;
          yield { type: "text_delta", text: ev.delta };
        } else if (ev.type === "tool_call") {
          toolCallsThisTurn.push(ev.call);
          yield {
            type: "tool_call",
            iteration,
            toolName: ev.call.name,
            inputSummary: summarizeInput(ev.call.name, ev.call.input),
          };
        }
      }

      const { usage, stopReason } = await turn.done();
      summedUsage.inputTokens += usage.inputTokens;
      summedUsage.outputTokens += usage.outputTokens;
      summedUsage.cacheReadTokens += usage.cacheReadTokens;
      summedUsage.cacheWriteTokens += usage.cacheWriteTokens;

      if (toolCallsThisTurn.length === 0) {
        if (stopReason === "max_tokens") {
          loopError = "Model hit max_tokens before calling render_widget.";
        } else if (!assistantText.trim()) {
          loopError = "Model ended without calling any tools or emitting text.";
        }
        break;
      }

      messages.push({
        role: "assistant",
        content: assistantText,
        toolCalls: toolCallsThisTurn,
      });

      const results: ToolResult[] = [];
      for (const call of toolCallsThisTurn) {
        const exec = executeTool(call);
        results.push(exec.result);
        yield {
          type: "tool_result",
          iteration,
          toolName: call.name,
          resultSummary: truncate(exec.result.content, 360),
          isError: exec.result.isError,
        };
        if (exec.finalRender) finalWidget = exec.finalRender;
      }

      messages.push({ role: "tool", results });

      if (finalWidget) break;
    } catch (err) {
      loopError = err instanceof Error ? err.message : String(err);
      break;
    }
  }

  if (finalWidget) {
    if (finalWidget.prose) {
      yield { type: "text_delta", text: `\n\n${finalWidget.prose}\n\n` };
    }
    yield { type: "widget_html", html: extractInner(finalWidget.html) };
  } else if (!loopError) {
    loopError = `Agent did not call render_widget within ${MAX_ITERATIONS} iterations.`;
  }

  if (loopError) {
    yield { type: "error", message: loopError };
  }

  yield buildUsageEvent(opts.providerId, summedUsage);
}

function summarizeInput(toolName: string, input: Record<string, unknown>): string {
  if (toolName === "build_widget") {
    return `intent: ${String(input.intent ?? "?")}`;
  }
  if (toolName === "submit_widget") {
    const intent = String(input.intent ?? "?");
    const htmlLen = String(input.html ?? "").length;
    const prose = typeof input.prose === "string" ? input.prose : "";
    return prose
      ? `${intent} · ${htmlLen}B · "${truncate(prose, 50)}"`
      : `${intent} · ${htmlLen}B`;
  }
  return JSON.stringify(input).slice(0, 120);
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

function extractInner(raw: string): string {
  const START = "<!--superwidgets-widget:start-->";
  const END = "<!--superwidgets-widget:end-->";
  const i = raw.indexOf(START);
  const j = raw.indexOf(END);
  if (i === -1 || j === -1 || j <= i) return raw;
  return raw.slice(i + START.length, j).trim();
}

function buildUsageEvent(providerId: ProviderId, usage: UsageMetadata): EngineEvent {
  const totalCost = computeCost(providerId, usage);
  const cacheHitRate =
    usage.inputTokens > 0 ? usage.cacheReadTokens / usage.inputTokens : 0;
  return {
    type: "usage",
    usage: {
      providerId,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cacheReadTokens: usage.cacheReadTokens,
      cacheWriteTokens: usage.cacheWriteTokens,
      cacheHitRate,
      totalCost,
    },
  };
}
