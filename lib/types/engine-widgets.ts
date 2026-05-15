export type EngineEvent =
  | { type: "text_delta"; text: string }
  | { type: "widget_html"; html: string }
  | { type: "error"; message: string }
  | { type: "done" };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  widgetHtml: string | null;
  isStreaming?: boolean;
}
