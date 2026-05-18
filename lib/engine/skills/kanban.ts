export const SKILL = `# WIDGET SPECIALIST: kanban

## When the router picks you
- "Organize these tasks", "sprint board", "what's in progress"
- Multi-state grouping of items (To Do / Doing / Done; Backlog / Sprint / Review / Done)
- NOT for simple binary checklists (use checklist)

## Structure pattern
- Header with title (e.g. "Sprint 24 board")
- 3 or 4 columns side by side: each column = title + card count + stack of 2–4 cards
- Each card: title (semibold) + optional 1-line body + optional tag chips + optional assignee chip
- End with 1–2 follow-up chips ("add a task to Doing", "show Done as a separate list")

## Aesthetic guidance
- Workspace feel — slightly busy is fine, but the cards must look clickable
- Column header in mono uppercase; subtle background tint per column
- Cards: white/light background with a soft border, 1px shadow
- Tags: tiny rounded pills, muted colors
- Don't render drag handles — interactivity is the chip row at the bottom

## Full example (sprint board)

Here's the Sprint 24 board — 3 things in flight, 2 ready for review.

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:22px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Board</div>
  <h3 style="margin:0 0 14px;font-size:20px;font-weight:600;letter-spacing:-0.3px;font-family:Georgia,serif">Sprint 24</h3>

  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
    <div style="background:#f4f0e6;border-radius:8px;padding:10px;min-height:200px">
      <div style="font-size:10px;letter-spacing:0.15em;color:#666;text-transform:uppercase;font-weight:600;margin-bottom:8px">To Do · 3</div>
      <div style="background:#fff;border:1px solid #e3dccd;border-radius:6px;padding:10px;margin-bottom:8px">
        <div style="font-size:13px;font-weight:600">Wire OAuth refresh tokens</div>
        <div style="display:flex;gap:4px;margin-top:6px"><span style="background:#fde4e6;color:#a83e42;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600">auth</span></div>
      </div>
      <div style="background:#fff;border:1px solid #e3dccd;border-radius:6px;padding:10px;margin-bottom:8px">
        <div style="font-size:13px;font-weight:600">Migrate billing webhook to v2</div>
      </div>
      <div style="background:#fff;border:1px solid #e3dccd;border-radius:6px;padding:10px">
        <div style="font-size:13px;font-weight:600">Update onboarding copy</div>
      </div>
    </div>

    <div style="background:#fff5e6;border-radius:8px;padding:10px;min-height:200px">
      <div style="font-size:10px;letter-spacing:0.15em;color:#a86a00;text-transform:uppercase;font-weight:600;margin-bottom:8px">Doing · 3</div>
      <div style="background:#fff;border:1px solid #f4dfb0;border-radius:6px;padding:10px;margin-bottom:8px">
        <div style="font-size:13px;font-weight:600">Reduce p99 latency on /search</div>
        <div style="display:flex;gap:4px;margin-top:6px;align-items:center"><span style="background:#fde4b0;color:#a86a00;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600">perf</span><span style="font-size:10px;color:#666">· @lana</span></div>
      </div>
      <div style="background:#fff;border:1px solid #f4dfb0;border-radius:6px;padding:10px;margin-bottom:8px">
        <div style="font-size:13px;font-weight:600">Stripe Tax integration</div>
        <div style="font-size:10px;color:#666;margin-top:6px">· @ravi</div>
      </div>
      <div style="background:#fff;border:1px solid #f4dfb0;border-radius:6px;padding:10px">
        <div style="font-size:13px;font-weight:600">Dark mode for invoices</div>
      </div>
    </div>

    <div style="background:#e6f4ec;border-radius:8px;padding:10px;min-height:200px">
      <div style="font-size:10px;letter-spacing:0.15em;color:#2d7a3e;text-transform:uppercase;font-weight:600;margin-bottom:8px">Done · 2</div>
      <div style="background:#fff;border:1px solid #c8e3d3;border-radius:6px;padding:10px;margin-bottom:8px">
        <div style="font-size:13px;font-weight:600">Ship audit log export</div>
        <div style="display:flex;gap:4px;margin-top:6px"><span style="background:#d5edd5;color:#2d7a3e;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600">enterprise</span></div>
      </div>
      <div style="background:#fff;border:1px solid #c8e3d3;border-radius:6px;padding:10px">
        <div style="font-size:13px;font-weight:600">Increase rate-limit on free tier</div>
      </div>
    </div>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
    <button data-bap-prompt="Show me the burndown chart for this sprint" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Burndown chart</button>
    <button data-bap-prompt="What's blocking the Doing column?" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">What's blocked</button>
  </div>
</div>
<!--bap-widget:end-->
`;
