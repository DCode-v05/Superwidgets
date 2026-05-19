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

export function downloadWidget(content: string): void {
  triggerDownload(wrapWidgetAsDocument(content), "html", "text/html");
}

export async function copyWidget(content: string): Promise<void> {
  await navigator.clipboard.writeText(content);
}
