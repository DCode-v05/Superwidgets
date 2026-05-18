export const SKILL = `# WIDGET SPECIALIST: kanban_board

## When the router picks you
- "Sprint board", "organize tasks", "what's in progress"
- Tasks in 2–4 named columns (To Do / Doing / Done; Backlog / Sprint / Review / Shipped)

## Structure
- Header with title (e.g. "Sprint 24")
- 3 or 4 columns side by side
- Each column = title + card count + stack of cards
- Card: title (semibold) + optional body + optional tag pills + optional @assignee

## Aesthetic
- Subtle tint per column (gray for To Do, amber for Doing, green for Done)
- Cards: white background, soft border, no drop shadow
- Tag pills tiny, rounded, muted color

## Example (3-person team shipping a feature)

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:20px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Board</div>
  <h3 style="margin:0 0 12px;font-size:18px;font-weight:600;font-family:Georgia,serif">Feature: bulk-export · 3 people</h3>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
    <div style="background:#f4f0e6;padding:10px;border-radius:8px">
      <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:0.15em;font-weight:600;margin-bottom:8px">To Do · 2</div>
      <div style="background:#fff;border:1px solid #e3dccd;border-radius:6px;padding:10px;margin-bottom:6px">
        <div style="font-size:13px;font-weight:600">Add CSV format option</div>
        <div style="font-size:10px;color:#666;margin-top:4px">· @ravi</div>
      </div>
      <div style="background:#fff;border:1px solid #e3dccd;border-radius:6px;padding:10px">
        <div style="font-size:13px;font-weight:600">Update docs</div>
      </div>
    </div>
    <div style="background:#fff5e6;padding:10px;border-radius:8px">
      <div style="font-size:10px;color:#a86a00;text-transform:uppercase;letter-spacing:0.15em;font-weight:600;margin-bottom:8px">Doing · 2</div>
      <div style="background:#fff;border:1px solid #f4dfb0;border-radius:6px;padding:10px;margin-bottom:6px">
        <div style="font-size:13px;font-weight:600">Stream large exports</div>
        <div style="display:flex;gap:4px;margin-top:4px"><span style="background:#fde4b0;color:#a86a00;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600">perf</span><span style="font-size:10px;color:#666">· @lana</span></div>
      </div>
      <div style="background:#fff;border:1px solid #f4dfb0;border-radius:6px;padding:10px">
        <div style="font-size:13px;font-weight:600">UI loading state</div>
        <div style="font-size:10px;color:#666;margin-top:4px">· @maya</div>
      </div>
    </div>
    <div style="background:#e6f4ec;padding:10px;border-radius:8px">
      <div style="font-size:10px;color:#2d7a3e;text-transform:uppercase;letter-spacing:0.15em;font-weight:600;margin-bottom:8px">Done · 2</div>
      <div style="background:#fff;border:1px solid #c8e3d3;border-radius:6px;padding:10px;margin-bottom:6px">
        <div style="font-size:13px;font-weight:600">Schema design</div>
      </div>
      <div style="background:#fff;border:1px solid #c8e3d3;border-radius:6px;padding:10px">
        <div style="font-size:13px;font-weight:600">DB migration</div>
      </div>
    </div>
  </div>
</div>
<!--bap-widget:end-->
`;
