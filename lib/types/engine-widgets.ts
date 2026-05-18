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
  isStreaming?: boolean;
}
