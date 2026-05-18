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

  // 9. Tag balance — opens that need closes vs actual closes.
  // CORRECTLY accounts for:
  //   - HTML void elements (input, br, img, hr, …) — no close needed
  //   - SVG leaf elements (circle, rect, path, …) — typically self-closed
  //     in inline SVG; HTML parser tolerates either form
  //   - explicitly self-closed tags (`<foo />`)
  // Previous version counted <input> as an open with no matching close,
  // false-flagging every calculator/quiz widget.
  const VOID_OR_LEAF =
    "area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr|" +
    "circle|ellipse|rect|line|polyline|polygon|path|stop|use|image";
  const tagRe = new RegExp(`<(\\/?)(\\w+)(?:\\s[^>]*?)?(\\s*\\/)?>`, "gi");
  let needClose = 0;
  let closes = 0;
  let openTotal = 0;
  const voidRe = new RegExp(`^(?:${VOID_OR_LEAF})$`, "i");
  for (const m of inner.matchAll(tagRe)) {
    const isClose = m[1] === "/";
    const name = m[2];
    const isSelfClose = !!m[3];
    if (isClose) {
      closes++;
    } else {
      openTotal++;
      if (!voidRe.test(name) && !isSelfClose) needClose++;
    }
  }
  const drift = Math.abs(needClose - closes);
  if (drift > Math.max(1, Math.floor(openTotal * 0.05))) {
    issues.push(
      `Tag balance off — ${needClose} non-void opens need a close, found ${closes} close tag(s). Close every non-void tag.`,
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

    // === .value vs .textContent mismatch detection ===
    // Catches the most common LLM bug for interactive widgets: confusing
    // <input>/<select>/<textarea> (which use .value) with <div>/<span>
    // (which use .textContent). Symptom: widget renders but typing doesn't
    // visibly update — the script writes to the wrong property.
    const varToRole = new Map<string, string>();
    const bindingRe =
      /\b(?:var|let|const)\s+(\w+)\s*=\s*[\w.]+\.querySelector(?:All)?\s*\(\s*['"`]\[data-role=([^'"`\]\s]+)\][^)]*\)/g;
    let bm: RegExpExecArray | null;
    while ((bm = bindingRe.exec(allBody)) !== null) {
      varToRole.set(bm[1], bm[2]);
    }

    const isInputLike = (role: string): boolean => {
      const re = new RegExp(
        `<(input|select|textarea)\\b[^>]*\\bdata-role\\s*=\\s*['"]?${role.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"\\s>]`,
        "i",
      );
      return re.test(inner);
    };

    const isDisplayElement = (role: string): boolean => {
      const re = new RegExp(
        `<(div|span|p|h[1-6]|output|td|th|li|label|small|b|i|em|strong|code|pre)\\b[^>]*\\bdata-role\\s*=\\s*['"]?${role.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"\\s>]`,
        "i",
      );
      return re.test(inner);
    };

    // Pattern A: writes to .textContent on an input-like element
    const textWriteRe = /\b(\w+)\.textContent\s*=/g;
    let tw: RegExpExecArray | null;
    while ((tw = textWriteRe.exec(allBody)) !== null) {
      const v = tw[1];
      const role = varToRole.get(v);
      if (role && isInputLike(role)) {
        issues.push(
          `Script writes \`${v}.textContent\` but \`${v}\` is an <input>/<select>/<textarea> ` +
            `(data-role="${role}"). Inputs render their value from the .value property — ` +
            `textContent writes are invisible. Use \`${v}.value = ...\` instead.`,
        );
      }
    }

    // Pattern B: reads .textContent from an input-like element (parseFloat, etc.)
    const textReadRe = /\b(\w+)\.textContent\b(?!\s*=)/g;
    let tr: RegExpExecArray | null;
    while ((tr = textReadRe.exec(allBody)) !== null) {
      const v = tr[1];
      const role = varToRole.get(v);
      if (role && isInputLike(role)) {
        issues.push(
          `Script reads \`${v}.textContent\` but \`${v}\` is an <input>/<select>/<textarea> ` +
            `(data-role="${role}"). Use \`${v}.value\` instead.`,
        );
      }
    }

    // Pattern C: writes to .value on a non-input display element
    const valueWriteRe = /\b(\w+)\.value\s*=/g;
    let vw: RegExpExecArray | null;
    while ((vw = valueWriteRe.exec(allBody)) !== null) {
      const v = vw[1];
      const role = varToRole.get(v);
      if (role && isDisplayElement(role)) {
        issues.push(
          `Script writes \`${v}.value\` but \`${v}\` is a display element ` +
            `(data-role="${role}"). Display elements show their .textContent — ` +
            `.value is invisible. Use \`${v}.textContent = ...\` instead.`,
        );
      }
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
