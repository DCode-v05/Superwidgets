/**
 * Verifier for the agentic loop's Action → Verify → OK/Loop cycle.
 *
 * Mirrors HtmlBubble's DOMPurify rules so the agent can self-check before
 * submitting to render_widget. `<script>` and `<form>` ARE allowed (those
 * are removed from the forbidden-tag list); the verifier instead checks
 * that scripts follow the safety rules (no remote loading, no fetch/XHR/
 * eval/new Function/document.write, no inline on* handlers).
 */

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
  summary: string;
}

const SENTINEL_START = "<!--bap-widget:start-->";
const SENTINEL_END = "<!--bap-widget:end-->";

const FORBIDDEN_TAG_RE = /<(iframe|style|object|embed)\b/i;
const EVENT_HANDLER_RE = /\son[a-z]+\s*=/i;
const SCRIPT_SRC_RE = /<script\b[^>]*\ssrc\s*=/i;
const FORM_ACTION_RE = /<form\b[^>]*\saction\s*=/i;
const FORM_METHOD_RE = /<form\b[^>]*\smethod\s*=/i;
const NETWORK_RE = /\b(fetch|XMLHttpRequest|navigator\.sendBeacon|new\s+EventSource|new\s+WebSocket)\s*\(/;
const DYNAMIC_CODE_RE = /\b(eval|new\s+Function|document\.write|setTimeout\s*\(\s*['"`]|setInterval\s*\(\s*['"`])/;

/** Max bytes for one widget block. ~6KB covers any well-designed widget. */
const MAX_WIDGET_BYTES = 6_000;

export function validateWidget(html: string): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  const raw = html ?? "";

  // 1. Sentinels — required for the parser
  if (!raw.includes(SENTINEL_START) || !raw.includes(SENTINEL_END)) {
    issues.push(
      `Missing required sentinels. Wrap your widget exactly in ${SENTINEL_START} ... ${SENTINEL_END}.`,
    );
  }

  // 2. Single widget block
  const startCount = (raw.match(/<!--bap-widget:start-->/g) ?? []).length;
  const endCount = (raw.match(/<!--bap-widget:end-->/g) ?? []).length;
  if (startCount > 1 || endCount > 1) {
    issues.push(`Exactly ONE widget block per response. Found ${startCount} start / ${endCount} end sentinels.`);
  }

  const inner = extractInner(raw);

  // 3. Forbidden tags (script and form are NOT in this list now)
  if (FORBIDDEN_TAG_RE.test(inner)) {
    const tag = inner.match(FORBIDDEN_TAG_RE)?.[1] ?? "unknown";
    issues.push(`Forbidden tag <${tag}> present. Sanitizer will strip it. Remove or replace.`);
  }

  // 4. Inline event handlers (still blocked — use addEventListener)
  if (EVENT_HANDLER_RE.test(inner)) {
    issues.push(
      `Inline event handler (on*=) detected. Sanitizer strips these. ` +
        `Use addEventListener inside <script> instead.`,
    );
  }

  // 5. Script source URLs (inline only — no remote loading)
  if (SCRIPT_SRC_RE.test(inner)) {
    issues.push(`<script src="..."> not allowed. Inline scripts only — paste the code directly.`);
  }

  // 6. Form action / method (forms must use script-based handling)
  if (FORM_ACTION_RE.test(inner)) {
    issues.push(`<form action="..."> not allowed. Forms never submit anywhere — handle via <script>.`);
  }
  if (FORM_METHOD_RE.test(inner)) {
    issues.push(`<form method="..."> not allowed. Forms never submit anywhere — handle via <script>.`);
  }

  // 7. Contrast rule — root must set background AND color inline
  const rootStyle = inner.match(/^<\w+[^>]*\sstyle=["']([^"']*)["']/im)?.[1] ?? "";
  const hasBg = /\bbackground/i.test(rootStyle);
  const hasColor = /\bcolor\s*:/i.test(rootStyle);
  if (!hasBg || !hasColor) {
    issues.push(
      `Contrast rule: widget root element must set BOTH background and color inline. ` +
        `Got: background=${hasBg ? "yes" : "no"}, color=${hasColor ? "yes" : "no"}.`,
    );
  }

  // 8. Size cap
  if (inner.length > MAX_WIDGET_BYTES) {
    issues.push(`Widget HTML is ${inner.length} bytes (max ${MAX_WIDGET_BYTES}). Trim styles or content.`);
  }

  // 9. Rough tag balance
  const openTags = (inner.match(/<\w+(?:\s[^>]*)?>/g) ?? []).length;
  const selfClose = (inner.match(/<\w+[^>]*\/>/g) ?? []).length;
  const closeTags = (inner.match(/<\/\w+>/g) ?? []).length;
  const drift = Math.abs(openTags - selfClose - closeTags);
  if (drift > Math.max(1, Math.floor(openTags * 0.05))) {
    issues.push(
      `Tag balance off — ${openTags} open / ${selfClose} self-close / ${closeTags} close. Close every tag.`,
    );
  }

  // 10. href outside source_cards (heuristic warning)
  if (/<a\s[^>]*href=/i.test(inner)) {
    warnings.push(`<a href> detected. Only valid inside source_cards. For navigation, prefer <button data-bap-prompt>.`);
  }

  // ===== Script-content safety checks (only if script is present) =====
  const scripts = Array.from(inner.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi));

  if (scripts.length > 0) {
    const allBody = scripts.map((m) => m[1]).join("\n");

    if (NETWORK_RE.test(allBody)) {
      issues.push(
        `Script attempts network call (fetch / XHR / WebSocket / sendBeacon). ` +
          `Mini-BAP widgets are purely client-side — remove network code.`,
      );
    }
    if (DYNAMIC_CODE_RE.test(allBody)) {
      issues.push(
        `Script uses dynamic-code construct (eval / new Function / document.write / string-form setTimeout). Remove it.`,
      );
    }

    // Soft check — recommend IIFE wrap (warning, not blocker)
    const trimmed = allBody.trim();
    if (!/^\(function\s*\(/.test(trimmed) && !/^\(\s*\(\s*\)\s*=>/.test(trimmed) && !/^\(\s*async\s*function/.test(trimmed)) {
      warnings.push(`Recommend wrapping script body in an IIFE: (function(){ ... })();`);
    }

    // Soft check — encourage scoped DOM queries via root id
    const hasGetById = /document\.getElementById\s*\(\s*['"]bap-w-/.test(allBody);
    if (!hasGetById && allBody.length > 80) {
      warnings.push(`Recommend scoping queries to a root element with id="bap-w-..." via document.getElementById.`);
    }

    // Forms in widget should have preventDefault on submit handler
    if (/<form\b/i.test(inner) && /addEventListener\s*\(\s*["']submit/.test(allBody) && !/preventDefault\s*\(\s*\)/.test(allBody)) {
      issues.push(`Form submit handler must call e.preventDefault() — otherwise the page navigates.`);
    }

    // Total script size budget
    if (allBody.length > 4000) {
      warnings.push(`Script body is ${allBody.length} chars — consider trimming under 4000.`);
    }
  }

  const valid = issues.length === 0;
  const summary = valid
    ? `Widget passes all structural checks (${inner.length} bytes${scripts.length > 0 ? `, ${scripts.length} script(s)` : ""}${warnings.length > 0 ? `, ${warnings.length} warning(s)` : ""}).`
    : `${issues.length} issue${issues.length === 1 ? "" : "s"} — fix and revalidate before render_widget.`;

  return { valid, issues, warnings, summary };
}

function extractInner(raw: string): string {
  const start = raw.indexOf(SENTINEL_START);
  const end = raw.indexOf(SENTINEL_END);
  if (start === -1 || end === -1 || end <= start) return raw;
  return raw.slice(start + SENTINEL_START.length, end).trim();
}
