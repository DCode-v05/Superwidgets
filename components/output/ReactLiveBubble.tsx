"use client";

import { useState } from "react";
import * as React from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { transform } from "sucrase";
import { FileCode, Eye, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReactLiveBubbleProps {
  code: string;
}

/**
 * Renders a React TSX component (returned by the LLM) as a LIVE component
 * inside the chat. Uses react-live + Sucrase to compile TSX→JS in the browser
 * and execute it. Tabs let the user flip between Preview and Code views.
 *
 * Pipeline:
 *   1. Strip markdown code fences if present (defensive)
 *   2. Strip ES6 imports (we provide React + hooks via scope instead)
 *   3. Strip `export default` and identify component name
 *   4. Append `render(<Component />)` for react-live noInline mode
 *   5. transformCode runs Sucrase (TS + JSX) before react-live evals the JS
 *
 * Security note: this evaluates LLM-generated code. The output is sandboxed
 * to the browser tab — no Node access, no server reach. Acceptable for a
 * trusted-LLM prototype; would need a stricter sandbox (iframe + CSP) for
 * arbitrary user-uploaded code.
 */

// Common React APIs the model may use without explicit imports.
const SCOPE = {
  React,
  useState: React.useState,
  useEffect: React.useEffect,
  useMemo: React.useMemo,
  useRef: React.useRef,
  useCallback: React.useCallback,
  useReducer: React.useReducer,
  useId: React.useId,
  Fragment: React.Fragment,
};

function stripFences(code: string): string {
  let s = code.trim();
  s = s.replace(/^```(?:tsx|jsx|typescript|ts|javascript|js)?\s*\n/, "");
  s = s.replace(/\n```\s*$/, "");
  return s;
}

function prepareForLive(rawTsx: string): string {
  let code = stripFences(rawTsx);
  // Drop ES6 imports — scope provides everything
  code = code.replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, "");
  // Find component name
  let componentName = "Component";
  const exportFnMatch = code.match(/export\s+default\s+function\s+(\w+)/);
  const exportConstMatch = code.match(/export\s+default\s+(\w+)\s*;?\s*$/m);
  const fnMatch = code.match(/function\s+(\w+)\s*\(/);
  if (exportFnMatch) componentName = exportFnMatch[1];
  else if (exportConstMatch) componentName = exportConstMatch[1];
  else if (fnMatch) componentName = fnMatch[1];
  // Drop "export default"
  code = code.replace(/export\s+default\s+/g, "");
  code = code.trim();
  return `${code}\n\nrender(<${componentName} />);`;
}

function transformCode(code: string): string {
  return transform(code, {
    transforms: ["typescript", "jsx"],
    jsxRuntime: "classic",
    production: true,
  }).code;
}

export function ReactLiveBubble({ code }: ReactLiveBubbleProps) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const cleanedCode = stripFences(code).trim();
  const liveCode = prepareForLive(code);

  return (
    <div className="bap-bubble rounded-xl overflow-hidden border border-[var(--border)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[var(--border)]">
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#8b949e]">
          <FileCode className="h-3 w-3" strokeWidth={1.75} />
          Widget.tsx
        </div>
        <div className="flex items-center gap-1">
          <TabButton
            active={tab === "preview"}
            onClick={() => setTab("preview")}
            icon={<Eye className="h-3 w-3" strokeWidth={1.75} />}
            label="Preview"
          />
          <TabButton
            active={tab === "code"}
            onClick={() => setTab("code")}
            icon={<Code2 className="h-3 w-3" strokeWidth={1.75} />}
            label="Code"
          />
        </div>
      </div>

      {tab === "preview" ? (
        <div className="bg-[#1a1714] p-4">
          <LiveProvider
            code={liveCode}
            scope={SCOPE}
            noInline
            transformCode={transformCode}
          >
            <LivePreview />
            <LiveError className="mt-2 text-[11px] font-mono text-red-300 bg-red-950/30 border border-red-900/40 rounded p-2 whitespace-pre-wrap" />
          </LiveProvider>
        </div>
      ) : (
        <SyntaxHighlighter
          language="tsx"
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "16px 18px",
            fontSize: "12.5px",
            lineHeight: 1.6,
            background: "#0d1117",
          }}
        >
          {cleanedCode}
        </SyntaxHighlighter>
      )}
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.15em] transition-colors",
        active
          ? "bg-accent text-white"
          : "text-[#8b949e] hover:text-[var(--foreground)] hover:bg-[#1f2937]",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
