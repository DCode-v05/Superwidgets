import type { ToolDefinition, AgentMessage, ToolCall } from "../tools/types";

export interface UsageMetadata {
  /** Total prompt tokens billed (including cached + cache-write). */
  inputTokens: number;
  /** Generated output tokens. */
  outputTokens: number;
  /** Tokens that hit prompt cache (billed at reduced rate). */
  cacheReadTokens: number;
  /** Tokens written to cache (Anthropic-specific; billed at 1.25× input rate). */
  cacheWriteTokens: number;
}

/**
 * Events produced during a single agent turn (one LLM call).
 * The agentic loop in run-engine.ts consumes these and decides next-step
 * (execute tools, send another turn, end the loop).
 */
export type TurnEvent =
  /** Visible text the model is emitting (streamed token-by-token). */
  | { type: "text"; delta: string }
  /** Model wants to invoke a tool. Emitted once the call is fully parsed. */
  | { type: "tool_call"; call: ToolCall };

/**
 * Result of one agent turn — a stream of events plus a promise resolving
 * to (usage, stopReason) after the stream is fully consumed.
 */
export interface TurnResult {
  stream: AsyncGenerator<TurnEvent>;
  /** Resolves after the stream is fully consumed. */
  done(): Promise<{ usage: UsageMetadata; stopReason: StopReason }>;
}

/** Why the model stopped this turn. */
export type StopReason =
  /** Model emitted one or more tool_use blocks (loop continues). */
  | "tool_use"
  /** Model finished with plain text only (loop should terminate). */
  | "end_turn"
  /** Model hit the token cap mid-output. */
  | "max_tokens"
  /** Anything else (refusal, content filter, …). */
  | "other";

/**
 * A provider's agentic-turn invoker. Given system prompt, current
 * normalized conversation, and tool definitions, return one turn's
 * stream of events plus a completion promise.
 */
export type AgentTurnInvoker = (
  systemPrompt: string,
  messages: AgentMessage[],
  tools: ToolDefinition[],
) => TurnResult;
