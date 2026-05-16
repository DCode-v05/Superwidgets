import type { ChatMessage } from "@/lib/types/engine-widgets";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatCost(usd: number): string {
  if (usd < 0.0001) return "<$0.0001";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}

function renderMessage(msg: ChatMessage): string {
  if (msg.role === "user") {
    return `
      <div class="msg msg-user">
        <div class="label label-user">YOU</div>
        <div class="bubble bubble-user">${escapeHtml(msg.text)}</div>
      </div>`;
  }

  // Assistant
  const proseHtml = msg.text
    ? `<div class="prose">${escapeHtml(msg.text).replace(/\n/g, "<br>")}</div>`
    : "";

  let widgetHtml = "";
  if (msg.widgetHtml) {
    if (msg.outputFormat === "react") {
      widgetHtml = `<pre class="code"><code>${escapeHtml(msg.widgetHtml)}</code></pre>`;
    } else {
      // HTML widgets are self-contained with inline styles — drop in as-is.
      widgetHtml = `<div class="widget-wrap">${msg.widgetHtml}</div>`;
    }
  }

  let usageHtml = "";
  if (msg.usage) {
    const hitPct = Math.round(msg.usage.cacheHitRate * 100);
    const skillBadge = msg.useSkill ? `<span class="badge badge-on">+skill</span>` : `<span class="badge">no skill</span>`;
    const pipelineBadge = msg.pipeline ? `<span class="badge badge-on">pipeline</span>` : `<span class="badge">single</span>`;
    const formatBadge = msg.outputFormat ? `<span class="badge">${msg.outputFormat}</span>` : "";
    usageHtml = `
      <div class="usage">
        <span><b>${formatTokens(msg.usage.inputTokens)}</b> in</span>
        <span class="sep">·</span>
        <span><b>${formatTokens(msg.usage.outputTokens)}</b> out</span>
        <span class="sep">·</span>
        <span class="${hitPct > 0 ? "accent" : ""}"><b>${hitPct}%</b> cached</span>
        <span class="sep">·</span>
        <span><b>${formatCost(msg.usage.totalCost)}</b></span>
        <span class="meta">
          ${escapeHtml(msg.usage.providerId)} ${formatBadge} ${skillBadge} ${pipelineBadge}
        </span>
      </div>`;
  }

  return `
    <div class="msg msg-bap">
      <div class="label label-bap">BAP</div>
      <div class="bubble bubble-bap">
        ${proseHtml}
        ${widgetHtml}
        ${usageHtml}
      </div>
    </div>`;
}

export function exportChatAsHtml(messages: ChatMessage[]): string {
  const ts = new Date().toLocaleString();
  const body = messages.map(renderMessage).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mini-BAP Chat — ${escapeHtml(ts)}</title>
<style>
  :root {
    --bg: #1a1714;
    --surface: #22201c;
    --border: #322e28;
    --text: #f4ecdf;
    --secondary: #9b948a;
    --accent: #EC3B4A;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px 16px;
    background: var(--bg);
    color: var(--text);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  .container { max-width: 820px; margin: 0 auto; }
  header {
    border-bottom: 1px solid var(--border);
    padding-bottom: 18px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  h1 {
    margin: 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .subtitle {
    color: var(--secondary);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-family: ui-monospace, monospace;
  }

  .msg {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 28px;
  }
  .msg-user { flex-direction: row-reverse; }
  .label {
    font-family: ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding-top: 10px;
    color: var(--secondary);
    min-width: 30px;
  }
  .label-bap { color: var(--accent); }

  .bubble {
    padding: 16px 20px;
    line-height: 1.55;
    font-size: 14px;
  }
  .bubble-user {
    background: var(--accent);
    color: #fff;
    max-width: 80%;
    border-radius: 16px 16px 4px 16px;
    white-space: pre-wrap;
  }
  .bubble-bap {
    background: var(--surface);
    border: 1px solid var(--border);
    flex: 1;
    border-radius: 4px 16px 16px 16px;
  }

  .prose { margin-bottom: 12px; }
  .widget-wrap { margin: 8px 0; }

  pre.code {
    background: #0d1117;
    color: #c9d1d9;
    padding: 14px;
    border-radius: 8px;
    overflow-x: auto;
    font-family: ui-monospace, "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.55;
  }

  .usage {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    font-family: ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--secondary);
  }
  .usage b { color: var(--text); font-weight: 600; }
  .usage .sep { opacity: 0.4; }
  .usage .accent b { color: var(--accent); }
  .usage .meta { margin-left: auto; display: inline-flex; gap: 6px; align-items: center; }
  .badge {
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid var(--border);
    font-size: 9px;
    opacity: 0.6;
    text-transform: lowercase;
    letter-spacing: 0.1em;
  }
  .badge.badge-on { border-color: var(--accent); color: var(--accent); opacity: 1; }

  footer {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    text-align: center;
    color: var(--secondary);
    font-family: ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Mini-BAP Chat Export</h1>
      <span class="subtitle">${escapeHtml(ts)}</span>
    </header>
${body}
    <footer>
      Generated by Mini-BAP · ${messages.length} message${messages.length === 1 ? "" : "s"}
    </footer>
  </div>
</body>
</html>
`;
}

/** Trigger a browser download of the full chat as a standalone .html file. */
export function downloadChatPage(messages: ChatMessage[]): void {
  const doc = exportChatAsHtml(messages);
  const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  a.href = url;
  a.download = `bap-chat-${ts}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
