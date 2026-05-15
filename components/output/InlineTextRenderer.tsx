"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { StreamingCursor } from "@/components/chat/StreamingCursor";

interface InlineTextRendererProps {
  text: string;
  isStreaming?: boolean;
}

function CodeBlock({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="my-2 rounded-lg overflow-hidden border border-gray-200 dark:border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-[#1a1b1f] border-b border-gray-200 dark:border-border">
        <span className="text-[11px] font-mono text-gray-500 dark:text-text-secondary">
          {language || "text"}
        </span>
        <button
          onClick={handleCopy}
          className="text-[11px] inline-flex items-center gap-1 text-gray-500 dark:text-text-secondary hover:text-accent"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{ margin: 0, padding: "0.75rem", fontSize: "0.8rem" }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export function InlineTextRenderer({ text, isStreaming }: InlineTextRendererProps) {
  return (
    <div className="md-prose text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const value = String(children).replace(/\n$/, "");
            const isInline = !match && !value.includes("\n");
            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return <CodeBlock language={match ? match[1] : ""} value={value} />;
          },
          a({ children, ...props }) {
            return (
              <a {...props} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="my-2 overflow-x-auto">
                <table className="w-full text-xs border-collapse">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="text-left font-semibold border-b border-gray-200 dark:border-border px-2 py-1">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border-b border-gray-100 dark:border-border/40 px-2 py-1">
                {children}
              </td>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
      {isStreaming && <StreamingCursor />}
    </div>
  );
}
