export interface UsageReport {
  providerId: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  cacheHitRate: number; // 0..1
  totalCost: number; // USD
}

/**
 * One step in the agent's loop trace — analogous to a `working_memory_log`
 * entry in engine-peripherals. Surfaced to the UI for transparency.
 */
export interface TraceStep {
  /** Loop iteration this step belongs to (1-indexed). */
  iteration: number;
  /** Tool the agent invoked. */
  toolName: string;
  /** Truncated, readable summary of the tool's input. */
  inputSummary: string;
  /** Truncated, readable summary of the tool's output (or error). */
  resultSummary: string;
  /** True if the tool returned an error result. */
  isError: boolean;
}

export type EngineEvent =
  /** Streaming text from the model (any iteration). */
  | { type: "text_delta"; text: string }
  /** Agent invoked a tool (emitted as soon as the call is parsed). */
  | { type: "tool_call"; iteration: number; toolName: string; inputSummary: string }
  /** Tool execution returned (emitted after the executor runs). */
  | {
      type: "tool_result";
      iteration: number;
      toolName: string;
      resultSummary: string;
      isError: boolean;
    }
  /** Final widget HTML (emitted by the render_widget terminal tool). */
  | { type: "widget_html"; html: string }
  /** Cumulative usage + cost across ALL loop iterations. */
  | { type: "usage"; usage: UsageReport }
  /** Fatal error during a turn. */
  | { type: "error"; message: string }
  /** Terminal event — loop ended. */
  | { type: "done" };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  widgetHtml: string | null;
  useSkill?: boolean;
  usage?: UsageReport;
  trace?: TraceStep[];
  isStreaming?: boolean;
}
