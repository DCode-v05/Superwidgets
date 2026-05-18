export const SKILL = `# WIDGET SPECIALIST: kpi_dashboard

## When the router picks you
- "Show me KPIs", "SaaS dashboard", "MRR / churn / ARPU snapshot"
- 3–6 single-point metrics with optional delta + sparkline

## Structure
- Header with title + period subtitle
- Grid of 3–6 tile cards (2-, 3-, or 4-column)
- Each tile: label · big number · delta with tone color · sparkline SVG

## Aesthetic
- Dashboard discipline: big numbers, restrained chrome
- Delta green for "good direction", red for "bad direction"
- Sparkline thin, monochrome

## Example (SaaS KPIs)

<!--bap-widget:start-->
<div style="background:#0f1116;color:#e6e6e6;padding:20px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Dashboard</div>
  <h3 style="margin:0 0 14px;font-size:18px;color:#fff;font-family:Georgia,serif">SaaS KPIs — Q1 2026</h3>
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
    <div style="padding:14px;background:#16181f;border:1px solid #222;border-left:3px solid #22c55e;border-radius:8px">
      <div style="font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.1em">MRR</div>
      <div style="font-size:24px;color:#fff;font-weight:700;margin:6px 0;font-family:Georgia,serif">$124K</div>
      <div style="font-size:11px;color:#4ade80;font-weight:600">▲ 12% MoM</div>
      <svg viewBox="0 0 120 28" style="width:100%;height:24px;margin-top:6px"><polyline points="0,20 24,18 48,14 72,10 96,7 120,4" fill="none" stroke="#22c55e" stroke-width="1.5"/></svg>
    </div>
    <div style="padding:14px;background:#16181f;border:1px solid #222;border-left:3px solid #22c55e;border-radius:8px">
      <div style="font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.1em">Churn</div>
      <div style="font-size:24px;color:#fff;font-weight:700;margin:6px 0;font-family:Georgia,serif">2.4%</div>
      <div style="font-size:11px;color:#4ade80;font-weight:600">▼ 0.6pp</div>
      <svg viewBox="0 0 120 28" style="width:100%;height:24px;margin-top:6px"><polyline points="0,6 24,8 48,11 72,14 96,18 120,21" fill="none" stroke="#22c55e" stroke-width="1.5"/></svg>
    </div>
    <div style="padding:14px;background:#16181f;border:1px solid #222;border-left:3px solid #EC3B4A;border-radius:8px">
      <div style="font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.1em">ARPU</div>
      <div style="font-size:24px;color:#fff;font-weight:700;margin:6px 0;font-family:Georgia,serif">$68</div>
      <div style="font-size:11px;color:#EC3B4A;font-weight:600">▲ $4 vs Q4</div>
      <svg viewBox="0 0 120 28" style="width:100%;height:24px;margin-top:6px"><polyline points="0,18 24,16 48,14 72,12 96,8 120,5" fill="none" stroke="#EC3B4A" stroke-width="1.5"/></svg>
    </div>
    <div style="padding:14px;background:#16181f;border:1px solid #222;border-left:3px solid #22c55e;border-radius:8px">
      <div style="font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.1em">NPS</div>
      <div style="font-size:24px;color:#fff;font-weight:700;margin:6px 0;font-family:Georgia,serif">48</div>
      <div style="font-size:11px;color:#4ade80;font-weight:600">▲ 6 pts</div>
      <svg viewBox="0 0 120 28" style="width:100%;height:24px;margin-top:6px"><polyline points="0,22 24,18 48,14 72,10 96,7 120,4" fill="none" stroke="#22c55e" stroke-width="1.5"/></svg>
    </div>
  </div>
</div>
<!--bap-widget:end-->
`;
