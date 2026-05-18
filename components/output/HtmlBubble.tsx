"use client";

import { useEffect, useMemo, useRef } from "react";
import DOMPurify, { type Config } from "dompurify";

/**
 * Sanitizer config — allows scripts, forms, and form controls so the LLM
 * can build interactive widgets (calculator, quiz, etc).
 *
 * Safety posture (this is a single-user prototype, not multi-tenant):
 *  - `<script>` is allowed but `src` is stripped — INLINE SCRIPTS ONLY,
 *    no remote loading.
 *  - `<form>` is allowed but `action` and `method` are stripped — the LLM
 *    must intercept submit via addEventListener + preventDefault.
 *  - All `on*` inline event handlers stay BLOCKED — interactivity must use
 *    addEventListener inside a <script> block.
 *  - Inline scripts run in the user's browser tab (no eval sandbox); the
 *    system prompt instructs the model to keep state local, no fetch/XHR.
 */
const SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS: [
    // Block / inline text
    "div", "span", "p", "h1", "h2", "h3", "h4", "ul", "ol", "li",
    "strong", "em", "code", "pre", "br", "small", "b", "i", "u", "sub", "sup",
    "hr", "blockquote",

    // Tables
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",

    // Interactive
    "button", "a",

    // Inline SVG (diagrams + charts)
    "svg", "g", "rect", "circle", "ellipse", "line", "polyline", "polygon", "path",
    "text", "tspan", "title", "defs", "marker", "linearGradient", "radialGradient",
    "stop", "clipPath", "mask", "pattern", "use", "symbol", "foreignObject",

    // Forms + form controls (LLM-generated interactive widgets)
    "form", "input", "select", "option", "optgroup", "textarea",
    "label", "fieldset", "legend", "output", "progress", "meter", "datalist",

    // Scripts — see safety posture above
    "script",
  ],
  ALLOWED_ATTR: [
    // General
    "class", "style", "id", "title", "lang", "dir",
    "data-bap-prompt", "data-bap-confirm",

    // Links
    "href", "target", "rel",

    // SVG geometry / paint
    "viewBox", "xmlns", "preserveAspectRatio", "width", "height",
    "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry",
    "points", "d", "offset",
    "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin",
    "stroke-dasharray", "fill-opacity", "stroke-opacity", "opacity",
    "transform", "text-anchor", "dominant-baseline", "alignment-baseline",
    "font-size", "font-family", "font-weight", "letter-spacing",
    "gradientUnits", "gradientTransform", "spreadMethod",
    "marker-end", "marker-start", "marker-mid", "orient", "refX", "refY",
    "markerWidth", "markerHeight", "patternUnits", "clip-path",

    // Form controls — `action` and `method` on <form> are intentionally omitted
    "type", "name", "value", "placeholder", "checked", "selected", "disabled",
    "readonly", "multiple", "size", "min", "max", "step", "maxlength",
    "minlength", "pattern", "required", "autocomplete", "spellcheck",
    "for", "form", "list", "accept", "novalidate",
    "rows", "cols", "wrap",

    // Accessibility
    "role", "aria-label", "aria-labelledby", "aria-describedby",
    "aria-hidden", "aria-live", "aria-checked", "aria-selected",
    "aria-expanded", "aria-pressed", "tabindex",

    // Tables
    "colspan", "rowspan", "scope", "headers",
  ],
  // Inline event handlers stay blocked — interactivity goes through addEventListener
  FORBID_ATTR: [
    "onclick", "onload", "onerror", "onmouseover", "onmouseout",
    "onmousedown", "onmouseup", "onmousemove", "onkeydown", "onkeyup",
    "onkeypress", "onfocus", "onblur", "onchange", "oninput", "onsubmit",
    "onreset", "onselect", "onabort", "ondblclick", "oncontextmenu",
    "onwheel", "ondrag", "ondrop", "onanimationend", "onanimationstart",
    "ontransitionend",
    // <form action/method> — block remote submission paths
    "action", "method", "formaction", "formmethod",
    // <script src> — INLINE ONLY (no remote loading)
    "src", "integrity", "crossorigin",
  ],
  ALLOW_DATA_ATTR: false,
  // Keep script bodies as text (DOMPurify default strips them — we want them through)
  KEEP_CONTENT: true,
};

export function HtmlBubble({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const clean = useMemo(
    () => DOMPurify.sanitize(html, SANITIZE_CONFIG) as string,
    [html],
  );

  /**
   * Re-execute <script> tags inside the sanitized HTML.
   *
   * HTML5 spec: <script> elements inserted via innerHTML do NOT execute.
   * We walk the freshly-rendered DOM, clone each <script> into a new
   * element (which DOES execute), and replace the inert original. Each
   * script runs in module-like isolation by being wrapped in an IIFE the
   * model is instructed to use, so re-mounts don't double-bind handlers.
   */
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const scripts = Array.from(root.querySelectorAll("script"));
    for (const oldScript of scripts) {
      const fresh = document.createElement("script");
      // Carry over only type/language; src is already stripped by sanitizer
      if (oldScript.type) fresh.type = oldScript.type;
      fresh.text = oldScript.textContent ?? "";
      try {
        oldScript.replaceWith(fresh);
      } catch {
        // If replacement fails (e.g. node already detached), fall through.
      }
    }
  }, [clean]);

  return (
    <div
      ref={containerRef}
      className="bap-bubble"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
