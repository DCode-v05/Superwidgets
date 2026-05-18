export const SKILL = `# WIDGET SPECIALIST: kpi_tiles

## When the router picks you
- "Show me key metrics", "dashboard snapshot", "what's the current state"
- Single-point-in-time numbers (NOT a trend — use chart for trends)
- 3–6 numbers worth surfacing together with deltas vs previous period

## Structure pattern
- Header with title (e.g. "Q1 snapshot") + optional subtitle
- Grid of 3–6 tiles (2-, 3-, or 4-column responsive grid)
- Each tile: small label · big number · delta with tone color · optional sparkline (4–12 points)
- End with 1–2 follow-up chips

## Aesthetic guidance
- Dashboard discipline — big numbers carry the eye, decoration is minimal
- Delta tones: green for "good direction" (rising revenue), red for "bad direction" (rising errors)
- Sparkline: BAP red \`#EC3B4A\` if good, gray otherwise
- Big number in a distinctive font; label/delta in mono or restrained sans-serif

## Full example (Q1 snapshot)

Here's the Q1 snapshot — revenue and active users are up, error rate is down.

<!--bap-widget:start-->
<div style="background:#0f1116;color:#e6e6e6;padding:22px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Snapshot</div>
  <h3 style="margin:0 0 16px;font-size:20px;font-weight:600;letter-spacing:-0.3px;font-family:Georgia,serif;color:#fff">Q1 2026 KPIs</h3>

  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
    <div style="padding:14px;background:#16181f;border:1px solid #222;border-left:3px solid #22c55e;border-radius:8px">
      <div style="font-size:11px;letter-spacing:0.1em;color:#8a8a8a;text-transform:uppercase">Revenue</div>
      <div style="font-size:26px;font-weight:700;color:#fff;margin:6px 0 4px;font-family:Georgia,serif">$1.24M</div>
      <div style="font-size:11px;color:#4ade80;font-weight:600">▲ 18% vs Q4</div>
      <svg viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:28px;margin-top:6px">
        <polyline points="0,22 20,18 40,16 60,12 80,9 100,6 120,3" fill="none" stroke="#22c55e" stroke-width="1.5"/>
      </svg>
    </div>

    <div style="padding:14px;background:#16181f;border:1px solid #222;border-left:3px solid #EC3B4A;border-radius:8px">
      <div style="font-size:11px;letter-spacing:0.1em;color:#8a8a8a;text-transform:uppercase">Active users</div>
      <div style="font-size:26px;font-weight:700;color:#fff;margin:6px 0 4px;font-family:Georgia,serif">42.8K</div>
      <div style="font-size:11px;color:#EC3B4A;font-weight:600">▲ 12% vs Q4</div>
      <svg viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:28px;margin-top:6px">
        <polyline points="0,18 20,17 40,14 60,15 80,10 100,8 120,5" fill="none" stroke="#EC3B4A" stroke-width="1.5"/>
      </svg>
    </div>

    <div style="padding:14px;background:#16181f;border:1px solid #222;border-left:3px solid #22c55e;border-radius:8px">
      <div style="font-size:11px;letter-spacing:0.1em;color:#8a8a8a;text-transform:uppercase">Error rate</div>
      <div style="font-size:26px;font-weight:700;color:#fff;margin:6px 0 4px;font-family:Georgia,serif">0.12%</div>
      <div style="font-size:11px;color:#4ade80;font-weight:600">▼ 35% vs Q4</div>
      <svg viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:28px;margin-top:6px">
        <polyline points="0,8 20,10 40,12 60,14 80,18 100,20 120,22" fill="none" stroke="#22c55e" stroke-width="1.5"/>
      </svg>
    </div>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
    <button data-bap-prompt="Break revenue down by product line" style="background:transparent;color:#e6e6e6;border:1px solid #333;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">By product line</button>
    <button data-bap-prompt="Show the same KPIs for Q2 forecast" style="background:transparent;color:#e6e6e6;border:1px solid #333;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Q2 forecast</button>
  </div>
</div>
<!--bap-widget:end-->
`;
