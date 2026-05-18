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
  // Allow ALL data-* attributes through. The model uses these heavily as
  // hooks for its scripts (`data-role="km"`, `data-correct`, `data-state`,
  // …). Previously this was `false` with only `data-bap-prompt` /
  // `data-bap-confirm` listed — which silently stripped `data-role` and
  // broke every interactive widget (query selectors returned null, scripts
  // skipped listener binding via their `if (el)` guards, widgets looked
  // alive but didn't respond to input). data-* attributes are inert from
  // a security standpoint — they're metadata, not behavior.
  ALLOW_DATA_ATTR: true,
  // Keep script bodies as text (DOMPurify default strips them — we want them through)
  KEEP_CONTENT: true,
};

export function HtmlBubble({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Tracks the last-injected HTML so we can skip the second effect run
  // React StrictMode triggers in dev (which would otherwise blow away
  // set A's DOM + listeners and re-create set B).
  const lastInjectedRef = useRef<string | null>(null);

  const clean = useMemo(
    () => DOMPurify.sanitize(html, SANITIZE_CONFIG) as string,
    [html],
  );

  /**
   * Inject the sanitized HTML AND re-execute its <script> tags in one
   * controlled step.
   *
   * We deliberately do NOT use `dangerouslySetInnerHTML` here — React's
   * reconciler can re-touch the inner DOM on parent re-renders and
   * detach input elements while leaving cloned scripts' listeners bound
   * to the dead nodes.
   *
   * The `lastInjectedRef` guard makes this effect IDEMPOTENT — critical
   * because React 18+ StrictMode in dev runs every effect twice. Without
   * the guard, the second run resets innerHTML, destroying the DOM that
   * the first run's script just bound listeners to.
   *
   * HTML5 spec: <script> elements set via innerHTML do NOT execute. We
   * walk the freshly-injected DOM, clone each script into a new element
   * (which DOES execute), and replace the inert original.
   */
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    if (lastInjectedRef.current === clean) {
      // Same HTML, already injected on a prior effect run — skip to
      // preserve the live DOM + bound listeners.
      console.log("[bap-widget] skip duplicate inject (StrictMode dance)");
      return;
    }
    lastInjectedRef.current = clean;

    // === Per-instance ID rewriting ===
    // The model emits widgets with hardcoded ids like `id="bap-w-tip"`
    // (per the system prompt template). When MULTIPLE widgets render on
    // the same page (e.g. multiple chat messages each carrying their own
    // calculator), `document.getElementById("bap-w-tip")` returns the
    // FIRST match in DOM order — not the script's own widget. Scripts
    // then bind listeners to the wrong widget's inputs, the visible
    // widget appears dead.
    //
    // We suffix every `id="bap-w-..."` with a random instance tag, then
    // rewrite the same id string everywhere it appears in the script
    // body so `getElementById` and `querySelector("#…")` calls resolve
    // to THIS widget's elements.
    const instanceTag = Math.random().toString(36).slice(2, 8);
    const rewrittenIds = new Set<string>();
    const transformedHtml = clean.replace(
      /\bid=(["'])(bap-w-[A-Za-z0-9_-]+)\1/g,
      (_match, quote, id) => {
        rewrittenIds.add(id);
        return `id=${quote}${id}-${instanceTag}${quote}`;
      },
    );

    root.innerHTML = transformedHtml;

    const scripts = Array.from(root.querySelectorAll("script"));
    console.log(
      `[bap-widget] injected ${transformedHtml.length} chars, found ${scripts.length} script(s), instance=${instanceTag}, rewrote ${rewrittenIds.size} id(s)`,
    );

    // DEFINITIVE DIAGNOSTIC — what survived DOMPurify?
    // The recurring "interactive widget looks alive but doesn't respond"
    // bug almost always traces to selectors returning null. Dumping the
    // post-sanitize DOM tells us exactly which attributes were preserved
    // and which were stripped.
    const allRoleEls = root.querySelectorAll("[data-role]");
    const allInputs = root.querySelectorAll("input,select,textarea");
    console.log(
      `[bap-widget] post-inject DOM: ${allRoleEls.length} [data-role] element(s), ${allInputs.length} input/select/textarea`,
    );
    if (allRoleEls.length === 0 && allInputs.length > 0) {
      console.warn(
        `[bap-widget] WARNING — found ${allInputs.length} inputs but ZERO [data-role] attributes. ` +
          `DOMPurify is stripping data-role. Check ALLOW_DATA_ATTR in SANITIZE_CONFIG.`,
      );
    }
    allRoleEls.forEach((el) => {
      const role = el.getAttribute("data-role");
      const tag = el.tagName.toLowerCase();
      const val =
        el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
          ? `value="${el.value}"`
          : `text="${el.textContent?.slice(0, 30) ?? ""}"`;
      console.log(`[bap-widget]   <${tag} data-role="${role}"> ${val}`);
    });
    // Also check: is the script using selectors that would resolve?
    const scriptBody = scripts.map((s) => s.textContent ?? "").join("\n");
    const selectorMatches = [...scriptBody.matchAll(/\[data-role[=~|^$*]?["']?([^"'\]]+)["']?\]/g)];
    for (const m of selectorMatches) {
      const role = m[1];
      const found = root.querySelector(`[data-role="${role}"]`);
      if (!found) {
        console.error(
          `[bap-widget] SELECTOR MISS — script queries [data-role="${role}"] but no such element in DOM. ` +
            `Listener bindings on this selector will silently skip.`,
        );
      }
    }

    // Build a single regex that matches any of the rewritten ids (longest
    // first to avoid prefix-collisions like `bap-w-x` vs `bap-w-xy`).
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

    for (const oldScript of scripts) {
      const fresh = document.createElement("script");
      if (oldScript.type) fresh.type = oldScript.type;

      let body = oldScript.textContent ?? "";
      if (idRewriteRegex) {
        body = body.replace(idRewriteRegex, (m) => `${m}-${instanceTag}`);
      }

      // Wrap the model's script body in try/catch so an in-script throw
      // (e.g. addEventListener on a null query result) doesn't bubble up
      // through replaceWith and surface in the Next.js error overlay.
      // NOTE: this does NOT rescue subsequent statements inside the same
      // IIFE — once a throw happens, the IIFE exits. The real fix for
      // half-bound listeners is the model writing defensive code
      // (`if (el) el.addEventListener(...)`) — see system prompt.
      const tag = `w-${instanceTag}`;
      fresh.text =
        `console.log("[bap-widget ${tag}] === script starting ===");` +
        `console.log("[bap-widget ${tag}] body (copy this if asking for help):", ${JSON.stringify(body)});` +
        `try{${body};console.log("[bap-widget ${tag}] === script completed ===");}` +
        `catch(e){console.error("[bap-widget ${tag}] === script error ===",e);}`;
      try {
        oldScript.replaceWith(fresh);
      } catch {
        /* node already detached — skip */
      }
    }
  }, [clean]);

  return <div ref={containerRef} className="bap-bubble" />;
}
