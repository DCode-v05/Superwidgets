"use client";

import { useCallback, useRef, useState } from "react";
import type { EngineEvent, ChatMessage, OutputFormat } from "@/lib/types/engine-widgets";
import type { ProviderId } from "@/lib/engine/providers";
import { classifyEngineError } from "@/lib/engine/error-classifier";
import { uid } from "@/lib/utils";

export interface SendOpts {
  providerId: ProviderId;
  useSkill: boolean;
  pipeline: boolean;
  outputFormat: OutputFormat;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  send: (message: string, opts: SendOpts) => Promise<void>;
  reset: () => void;
}

interface AssistantBuilder {
  id: string;
  text: string;
  widgetHtml: string | null;
  typedWidgets: ChatMessage["typedWidgets"];
  agentDecision: ChatMessage["agentDecision"];
  usage: ChatMessage["usage"];
  error: ChatMessage["error"];
}

function applyEvent(builder: AssistantBuilder, ev: EngineEvent): boolean {
  switch (ev.type) {
    case "text_delta":
      builder.text += ev.text;
      return false;
    case "widget_html":
      builder.widgetHtml = ev.html;
      return false;
    case "typed_widget":
      builder.typedWidgets = [...(builder.typedWidgets ?? []), ev.widget];
      return false;
    case "agent_thought":
      // Intermediate trace — we don't surface this in state because the
      // committed `agent_decision` event arrives right after with both rounds.
      // Hook is here so future versions can stream a live "thinking" panel.
      return false;
    case "agent_decision":
      builder.agentDecision = ev.decision;
      return false;
    case "usage":
      builder.usage = ev.usage;
      return false;
    case "error":
      builder.error = classifyEngineError(ev.message);
      return false;
    case "done":
      return true;
    default:
      return false;
  }
}

async function* parseSse(stream: ReadableStream<Uint8Array>): AsyncGenerator<EngineEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sepIdx;
    while ((sepIdx = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, sepIdx);
      buffer = buffer.slice(sepIdx + 2);

      const lines = block.split("\n");
      let dataLine = "";
      for (const ln of lines) {
        if (ln.startsWith("data:")) {
          dataLine += ln.slice(5).trim();
        }
      }
      if (!dataLine) continue;
      try {
        const ev = JSON.parse(dataLine) as EngineEvent;
        yield ev;
      } catch {
        // ignore malformed event
      }
    }
  }
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (message: string, opts: SendOpts) => {
    if (!message.trim()) return;
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setError(null);

    const userMsg: ChatMessage = {
      id: uid("u"),
      role: "user",
      text: message,
      widgetHtml: null,
    };
    const assistantId = uid("a");
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      text: "",
      widgetHtml: null,
      outputFormat: opts.outputFormat,
      useSkill: opts.useSkill,
      pipeline: opts.pipeline,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const history = messagesToHistory(messages);

    try {
      const res = await fetch("/api/engine/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history,
          providerId: opts.providerId,
          useSkill: opts.useSkill,
          pipeline: opts.pipeline,
          outputFormat: opts.outputFormat,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Engine returned ${res.status}`);
      }

      const builder: AssistantBuilder = {
        id: assistantId,
        text: "",
        widgetHtml: null,
        typedWidgets: undefined,
        agentDecision: undefined,
        usage: undefined,
        error: undefined,
      };

      for await (const ev of parseSse(res.body)) {
        const isDone = applyEvent(builder, ev);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  text: builder.text,
                  widgetHtml: builder.widgetHtml,
                  typedWidgets: builder.typedWidgets,
                  agentDecision: builder.agentDecision,
                  usage: builder.usage,
                  error: builder.error,
                  isStreaming: !isDone,
                }
              : m,
          ),
        );

        if (isDone) break;
      }
    } catch (err) {
      if (ctrl.signal.aborted) return;
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m,
        ),
      );
    } finally {
      setIsStreaming(false);
    }
  }, [messages]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, error, send, reset };
}

function messagesToHistory(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: m.role,
    content: m.text.trim(),
  }));
}
