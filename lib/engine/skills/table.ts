export const SKILL = `# WIDGET SPECIALIST: table

## When the router picks you
- Tabular comparison or feature matrix
- "Compare A, B, C in a table", "Show feature matrix"
- Structured data with 2-6 columns and 3-10 rows

## Structure pattern
- Header bar with title + optional subtitle
- HTML \`<table>\` with \`<thead>\` and \`<tbody>\`
- First column is the row label (feature / dimension)
- Other columns are the options being compared
- Use ✓ / ✗ / partial (~) symbols OR concise text values
- End with 2-3 chips for deeper dives per dimension

## Required interactivity
- Optional follow-up chips: \`data-bap-prompt="Explain the [dimension] row in detail"\`

## Aesthetic guidance
- Clean, scannable — tables are reference material
- Subtle row striping OR row dividers (not both)
- Header row clearly distinct (background tint or bottom border)
- Right-align numeric columns, left-align text
- Use \`border-collapse: collapse\` to avoid double borders

## Full example

Here's the feature matrix. The "winner" per row is highlighted; the choice depends on what you weight.

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:22px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Comparison</div>
  <h3 style="margin:0 0 4px;font-size:20px;font-weight:600;letter-spacing:-0.3px;font-family:Georgia,serif">Serverless function platforms</h3>
  <div style="font-size:13px;color:#666;margin-bottom:16px">All three production-ready; differences are in pricing and cold-start profile.</div>

  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead>
      <tr style="background:#f4f0e6">
        <th style="text-align:left;padding:11px 12px;font-weight:600;color:#555;border-bottom:2px solid #d8cfbe">Dimension</th>
        <th style="text-align:left;padding:11px 12px;font-weight:600;color:#555;border-bottom:2px solid #d8cfbe">AWS Lambda</th>
        <th style="text-align:left;padding:11px 12px;font-weight:600;color:#555;border-bottom:2px solid #d8cfbe">Vercel Functions</th>
        <th style="text-align:left;padding:11px 12px;font-weight:600;color:#555;border-bottom:2px solid #d8cfbe">Cloudflare Workers</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #ece7da">
        <td style="padding:10px 12px;font-weight:500">Cold start (typical)</td>
        <td style="padding:10px 12px">~250 ms</td>
        <td style="padding:10px 12px">~150 ms</td>
        <td style="padding:10px 12px;color:#EC3B4A;font-weight:600">< 5 ms</td>
      </tr>
      <tr style="border-bottom:1px solid #ece7da">
        <td style="padding:10px 12px;font-weight:500">Free tier</td>
        <td style="padding:10px 12px">1M req / mo</td>
        <td style="padding:10px 12px">100K req / mo</td>
        <td style="padding:10px 12px;color:#EC3B4A;font-weight:600">100K req / day</td>
      </tr>
      <tr style="border-bottom:1px solid #ece7da">
        <td style="padding:10px 12px;font-weight:500">Max execution time</td>
        <td style="padding:10px 12px;color:#EC3B4A;font-weight:600">15 min</td>
        <td style="padding:10px 12px">10–60 s (plan)</td>
        <td style="padding:10px 12px">30 s</td>
      </tr>
      <tr style="border-bottom:1px solid #ece7da">
        <td style="padding:10px 12px;font-weight:500">Native runtimes</td>
        <td style="padding:10px 12px;color:#EC3B4A;font-weight:600">Node, Python, Go, Java, …</td>
        <td style="padding:10px 12px">Node, Edge runtime</td>
        <td style="padding:10px 12px">V8 isolates</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;font-weight:500">Vendor lock-in</td>
        <td style="padding:10px 12px">High (AWS-shaped)</td>
        <td style="padding:10px 12px">Medium</td>
        <td style="padding:10px 12px">Medium-high (CF-shaped)</td>
      </tr>
    </tbody>
  </table>

  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">
    <button data-bap-prompt="Explain the cold start row in detail — why are CF Workers so much faster?" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Why CF cold starts win</button>
    <button data-bap-prompt="What's the pricing comparison at 10M requests per month?" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Pricing at scale</button>
  </div>
</div>
<!--bap-widget:end-->
`;
