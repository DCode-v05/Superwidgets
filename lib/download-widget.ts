import type { OutputFormat } from "@/lib/types/engine-widgets";

/**
 * Wrap raw widget HTML in a standalone HTML document so it can be opened
 * directly in a browser. Widget HTML is self-contained via inline styles,
 * so we only need a minimal scaffold + a body background that matches the
 * dark chat bubble (which the model designed against per the contrast rule).
 */
export function wrapWidgetAsDocument(widgetHtml: string, title?: string): string {
  const safeTitle = (title ?? "Mini-BAP Widget").replace(/[<>&"']/g, "");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    body {
      margin: 0;
      padding: 48px 24px;
      background: #1a1714;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .bap-widget-container {
      max-width: 820px;
      width: 100%;
    }
  </style>
</head>
<body>
  <div class="bap-widget-container">
${widgetHtml}
  </div>
</body>
</html>
`;
}

function triggerDownload(content: string, ext: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  a.href = url;
  a.download = `bap-widget-${ts}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Download the widget as a standalone .html document, opens directly in a browser. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function downloadWidget(content: string, _format?: OutputFormat): void {
  triggerDownload(wrapWidgetAsDocument(content), "html", "text/html");
}

/** Copy the widget HTML source to the clipboard. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function copyWidget(content: string, _format?: OutputFormat): Promise<void> {
  await navigator.clipboard.writeText(content);
}
