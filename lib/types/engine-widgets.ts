import type { TypedWidget } from "./widgets-typed";
import type { AgentDecision } from "@/lib/engine/agent-runner";

export type OutputFormat = "html" | "react" | "typed";

export interface UsageReport {
  providerId: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  cacheHitRate: number; // 0..1
  totalCost: number; // USD
}

export type EngineEvent =
  | { type: "text_delta"; text: string }
  | { type: "widget_html"; html: string }
  | { type: "typed_widget"; widget: TypedWidget }
  /** Live stream of intermediate agent reasoning (round 1 → round 2). */
  | { type: "agent_thought"; round: 1 | 2; payload: unknown }
  /** Final committed agent decision — chosen kind + rationale + candidates. */
  | { type: "agent_decision"; decision: AgentDecision }
  | { type: "usage"; usage: UsageReport }
  | { type: "error"; message: string }
  | { type: "done" };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  widgetHtml: string | null;
  /** Populated when outputFormat === "typed". Multiple widgets per turn allowed. */
  typedWidgets?: TypedWidget[];
  /** Set when the Skill Decision Agent ran (formerly "pipeline" mode). */
  agentDecision?: AgentDecision;
  outputFormat?: OutputFormat;
  useSkill?: boolean;
  pipeline?: boolean;
  usage?: UsageReport;
  /** Structured error from the engine (auth, quota, 404 model, etc.) — rendered as a banner instead of text. */
  error?: { message: string; hint?: string };
  isStreaming?: boolean;
}
