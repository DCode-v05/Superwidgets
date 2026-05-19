export interface UsageReport {
  providerId: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  cacheHitRate: number;
  totalCost: number;
}

export interface TraceStep {
  iteration: number;
  toolName: string;
  inputSummary: string;
  resultSummary: string;
  isError: boolean;
}

export type EngineEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_call"; iteration: number; toolName: string; inputSummary: string }
  | {
      type: "tool_result";
      iteration: number;
      toolName: string;
      resultSummary: string;
      isError: boolean;
    }
  | { type: "widget_html"; html: string }
  | { type: "usage"; usage: UsageReport }
  | { type: "error"; message: string }
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
