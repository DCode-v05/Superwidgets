"use client";

import { useEffect, useMemo, useRef } from "react";
import DOMPurify, { type Config } from "dompurify";

/**
 * DOMPurify config. Allows <script>, <form>, and form controls so the LLM
 * can build interactive widgets. Safety:
 *  - <script src>, <form action>, <form method>, on*= are all stripped
 *  - All data-* attributes preserved (model uses them as selector hooks)
 *  - Single-user prototype — scripts run in the user's own tab
 */
const SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS: [
    "div", "span", "p", "h1", "h2", "h3", "h4", "ul", "ol", "li",
    "strong", "em", "code", "pre", "br", "small", "b", "i", "u", "sub", "sup",
    "hr", "blockquote",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
    "button", "a",
    "svg", "g", "rect", "circle", "ellipse", "line", "polyline", "polygon", "path",
    "text", "tspan", "title", "defs", "marker", "linearGradient", "radialGradient",
    "stop", "clipPath", "mask", "pattern", "use", "symbol", "foreignObject",
    "form", "input", "select", "option", "optgroup", "textarea",
    "label", "fieldset", "legend", "output", "progress", "meter", "datalist",
    "script",
  ],
  ALLOWED_ATTR: [
    "class", "style", "id", "title", "lang", "dir",
    "data-superwidgets-prompt", "data-superwidgets-confirm",
    "href", "target", "rel",
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
    "type", "name", "value", "placeholder", "checked", "selected", "disabled",
    "readonly", "multiple", "size", "min", "max", "step", "maxlength",
    "minlength", "pattern", "required", "autocomplete", "spellcheck",
    "for", "form", "list", "accept", "novalidate",
    "rows", "cols", "wrap",
    "role", "aria-label", "aria-labelledby", "aria-describedby",
    "aria-hidden", "aria-live", "aria-checked", "aria-selected",
    "aria-expanded", "aria-pressed", "tabindex",
    "colspan", "rowspan", "scope", "headers",
  ],
  FORBID_ATTR: [
    "onclick", "onload", "onerror", "onmouseover", "onmouseout",
    "onmousedown", "onmouseup", "onmousemove", "onkeydown", "onkeyup",
    "onkeypress", "onfocus", "onblur", "onchange", "oninput", "onsubmit",
    "onreset", "onselect", "onabort", "ondblclick", "oncontextmenu",
    "onwheel", "ondrag", "ondrop", "onanimationend", "onanimationstart",
    "ontransitionend",
    "action", "method", "formaction", "formmethod",
    "src", "integrity", "crossorigin",
  ],
  ALLOW_DATA_ATTR: true,
  KEEP_CONTENT: true,
};

export function HtmlBubble({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Guards against StrictMode's double-effect-run from blowing away the DOM
  // (and bound listeners) on the second run.
  const lastInjectedRef = useRef<string | null>(null);

  const clean = useMemo(
    () => DOMPurify.sanitize(html, SANITIZE_CONFIG) as string,
    [html],
  );

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    if (lastInjectedRef.current === clean) return;
    lastInjectedRef.current = clean;

    // Per-instance ID rewriting. Without this, multiple widgets on the page
    // with the same model-emitted id (e.g. "superwidgets-w-tip") collide and
    // document.getElementById returns the first match — scripts bind to
    // the wrong widget's elements.
    const instanceTag = Math.random().toString(36).slice(2, 8);
    const rewrittenIds = new Set<string>();
    const transformedHtml = clean.replace(
      /\bid=(["'])(superwidgets-w-[A-Za-z0-9_-]+)\1/g,
      (_match, quote, id) => {
        rewrittenIds.add(id);
        return `id=${quote}${id}-${instanceTag}${quote}`;
      },
    );

    root.innerHTML = transformedHtml;

    const idRewriteRegex =
      rewrittenIds.size > 0
        ? new RegExp(
            [...rewrittenIds]
              .sort((a, b) => b.length - a.length)
              .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
              .join("|"),
            "g",
          )
        : null;

    // HTML5 spec: <script> elements set via innerHTML do NOT execute. Clone
    // each into a fresh element (which DOES execute) and replace the inert
    // original. Wrap the body in try/catch so an in-script throw doesn't
    // surface in the Next.js error overlay.
    for (const oldScript of root.querySelectorAll("script")) {
      const fresh = document.createElement("script");
      if (oldScript.type) fresh.type = oldScript.type;
      let body = oldScript.textContent ?? "";
      if (idRewriteRegex) {
        body = body.replace(idRewriteRegex, (m) => `${m}-${instanceTag}`);
      }
      fresh.text = `try{${body}}catch(e){console.error("[superwidgets-widget] script error:",e);}`;
      try {
        oldScript.replaceWith(fresh);
      } catch {
        /* node already detached */
      }
    }
  }, [clean]);

  return <div ref={containerRef} className="superwidgets-bubble" />;
}
