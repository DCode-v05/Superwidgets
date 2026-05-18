"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { CodeBlockPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips } from "./shared";

/**
 * Code block — uses react-syntax-highlighter (already in package.json)
 * with the Prism `oneDark` theme. Header strip shows filename + language;
 * trailing copy button is local (doesn't fire a follow-up prompt).
 */
export function CodeBlockWidget({
  payload,
  actions,
}: {
  payload: CodeBlockPayload;
  actions?: WidgetAction[];
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload?.code ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[#0d1117]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#161b22] px-4 py-2">
        <span className="text-[12px] font-mono text-white/70">
          {payload?.filename ?? `${payload?.language ?? "text"}.snippet`}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent">
            {payload?.language ?? "text"}
          </span>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-accent" strokeWidth={2} /> : <Copy className="h-3 w-3" strokeWidth={1.75} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div className="text-[12.5px]">
        <SyntaxHighlighter
          language={payload?.language ?? "text"}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "16px 18px",
            background: "transparent",
            fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
            fontSize: "12.5px",
            lineHeight: 1.6,
          }}
        >
          {payload?.code ?? ""}
        </SyntaxHighlighter>
      </div>
      {actions && actions.length > 0 && (
        <div className="border-t border-white/10 bg-[#0d1117] px-4 py-3">
          <ActionChips actions={actions} />
        </div>
      )}
    </div>
  );
}
