"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

const SANITIZE_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    "div", "span", "p", "h1", "h2", "h3", "h4", "ul", "ol", "li",
    "strong", "em", "code", "pre", "br",
    "table", "thead", "tbody", "tr", "th", "td",
    "button", "a",
    "svg", "g", "rect", "circle", "line", "polyline", "polygon", "path", "text", "title",
  ],
  ALLOWED_ATTR: [
    "class", "style", "data-bap-prompt", "data-bap-confirm",
    "href", "target", "rel",
    "viewBox", "xmlns", "width", "height",
    "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r",
    "points", "d",
    "fill", "stroke", "stroke-width", "fill-opacity", "stroke-opacity",
    "transform", "text-anchor", "dominant-baseline",
    "font-size", "font-family",
    "role", "aria-label",
  ],
  ALLOW_DATA_ATTR: false,
};

export function HtmlBubble({ html }: { html: string }) {
  const clean = useMemo(
    () => DOMPurify.sanitize(html, SANITIZE_CONFIG) as string,
    [html],
  );
  return (
    <div
      className="bap-bubble"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
