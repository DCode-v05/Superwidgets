export const SKILL = `# WIDGET SPECIALIST: code_block

## When the router picks you
- User asks for a code snippet, function, query, config, or command
- "Write a Python function for X", "SQL to do Y", "Dockerfile for Z"

## Structure pattern
- Header strip: filename / language label on left, optional small caption on right
- \`<pre>\` with \`<code>\` inside, monospace font, light syntax-color hints via inline color spans (sparingly)
- Code body: dark background, monospace, generous line-height (1.55-1.7)
- Optional: comment lines in lighter gray for readability
- End with chips for variations / explanations

## Required interactivity
- 2-3 follow-up chips: \`data-bap-prompt="Walk me through this line by line"\`, \`data-bap-prompt="Show me the test for this"\`, etc.

## Aesthetic guidance
- Dark code surface even on light pages — universal convention
- Monospace: \`ui-monospace, "JetBrains Mono", Menlo, monospace\`
- Use 12-13px font size for body text inside the code
- Preserve original whitespace — DO NOT wrap lines unless asked
- Comment lines: \`<span style="color:#7c8b9c">// ...</span>\`
- Optionally highlight a key keyword in BAP red (\`#EC3B4A\`) for emphasis — use sparingly

## Full example

Here's a minimal Python helper that fetches a URL with exponential-backoff retries.

<!--bap-widget:start-->
<div style="background:#0d1117;color:#c9d1d9;padding:0;border-radius:12px;font-family:ui-sans-serif,system-ui;overflow:hidden">
  <div style="padding:10px 16px;background:#161b22;border-bottom:1px solid #21262d;display:flex;justify-content:space-between;align-items:center">
    <div style="font-size:12px;font-family:ui-monospace,monospace;color:#8b949e">fetch_with_retry.py</div>
    <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#EC3B4A">python</div>
  </div>
  <pre style="margin:0;padding:16px 18px;font-family:ui-monospace,'JetBrains Mono',Menlo,monospace;font-size:12.5px;line-height:1.65;overflow-x:auto"><code><span style="color:#7c8b9c"># Exponential backoff: 0.5s, 1s, 2s, 4s</span>
<span style="color:#ff7b72">import</span> time
<span style="color:#ff7b72">import</span> requests

<span style="color:#ff7b72">def</span> <span style="color:#d2a8ff">fetch_with_retry</span>(url: <span style="color:#ffa657">str</span>, max_attempts: <span style="color:#ffa657">int</span> = <span style="color:#79c0ff">4</span>) -> <span style="color:#ffa657">requests.Response</span>:
    <span style="color:#a5d6ff">"""Fetch url with exponential backoff. Raises on final failure."""</span>
    last_err = <span style="color:#79c0ff">None</span>
    <span style="color:#ff7b72">for</span> attempt <span style="color:#ff7b72">in</span> <span style="color:#d2a8ff">range</span>(max_attempts):
        <span style="color:#ff7b72">try</span>:
            r = requests.get(url, timeout=<span style="color:#79c0ff">10</span>)
            r.raise_for_status()
            <span style="color:#ff7b72">return</span> r
        <span style="color:#ff7b72">except</span> requests.RequestException <span style="color:#ff7b72">as</span> e:
            last_err = e
            time.sleep(<span style="color:#79c0ff">0.5</span> * (<span style="color:#79c0ff">2</span> ** attempt))
    <span style="color:#ff7b72">raise</span> last_err</code></pre>
  <div style="padding:12px 16px;background:#0d1117;border-top:1px solid #21262d;display:flex;flex-wrap:wrap;gap:8px">
    <button data-bap-prompt="Walk me through this function line by line" style="background:transparent;color:#c9d1d9;border:1px solid #30363d;padding:6px 12px;border-radius:999px;font-size:11px;cursor:pointer;font-family:ui-sans-serif">Walk through line by line</button>
    <button data-bap-prompt="Show me a pytest test for this function" style="background:transparent;color:#c9d1d9;border:1px solid #30363d;padding:6px 12px;border-radius:999px;font-size:11px;cursor:pointer;font-family:ui-sans-serif">Show a test</button>
    <button data-bap-prompt="Convert this to async with httpx" style="background:transparent;color:#c9d1d9;border:1px solid #30363d;padding:6px 12px;border-radius:999px;font-size:11px;cursor:pointer;font-family:ui-sans-serif">Async with httpx</button>
  </div>
</div>
<!--bap-widget:end-->
`;
