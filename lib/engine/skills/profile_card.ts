export const SKILL = `# WIDGET SPECIALIST: profile_card

## When the router picks you
- "Profile card for X", "intro card", "show me a fictional <role>"
- Single-person snapshot with name, role, stats, actions

## Structure
- Header strip with role / department
- Big avatar tile (initials in BAP red square)
- Name (semibold), role line, optional 1–2 sentence bio
- Row of 2–4 stat cells: small label + value
- 1–3 action buttons (data-bap-prompt)

## Aesthetic
- Card with gentle border + 1px shadow
- Avatar: 64px square, rounded, accent background
- Stats in mono numbers, soft dividers between

## Example (fictional staff engineer)

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:20px;border-radius:14px;font-family:ui-sans-serif,system-ui;max-width:480px">
  <div style="display:flex;gap:14px;align-items:center;margin-bottom:14px">
    <div style="width:64px;height:64px;background:#EC3B4A;color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;font-family:Georgia,serif">LM</div>
    <div>
      <div style="font-size:17px;font-weight:600">Lana Morrison</div>
      <div style="font-size:12px;color:#666">Staff Engineer · Platform team</div>
    </div>
  </div>
  <div style="font-size:13px;color:#444;line-height:1.55;margin-bottom:14px">10 years of distributed-systems work, currently leading the migration to event-sourced billing.</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
    <div style="padding:10px;background:#f4f0e6;border-radius:6px;text-align:center">
      <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:0.1em">Years</div>
      <div style="font-size:18px;font-weight:700;font-family:Georgia,serif">10</div>
    </div>
    <div style="padding:10px;background:#f4f0e6;border-radius:6px;text-align:center">
      <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:0.1em">PRs / mo</div>
      <div style="font-size:18px;font-weight:700;font-family:Georgia,serif">14</div>
    </div>
    <div style="padding:10px;background:#f4f0e6;border-radius:6px;text-align:center">
      <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:0.1em">Reports</div>
      <div style="font-size:18px;font-weight:700;font-family:Georgia,serif">0</div>
    </div>
  </div>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button data-bap-prompt="Show me Lana's recent PRs" style="background:#EC3B4A;color:#fff;border:0;padding:8px 14px;border-radius:6px;font-weight:600;cursor:pointer;font-size:12px">Recent PRs</button>
    <button data-bap-prompt="Book 30 min with Lana" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:8px 14px;border-radius:6px;font-weight:600;cursor:pointer;font-size:12px">Book 30 min</button>
  </div>
</div>
<!--bap-widget:end-->
`;
