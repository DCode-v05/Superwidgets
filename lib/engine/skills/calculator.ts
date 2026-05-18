export const SKILL = `# WIDGET SPECIALIST: calculator

## When the router picks you
- "Tip calculator", "mortgage calc", "X explainer with sliders"
- Live-recomputed output from 2–4 inputs (sliders / numbers)

## IMPORTANT — sanitizer constraints
- Our HTML sanitizer strips \`<script>\` tags and on* event handlers.
- BUT calculator NEEDS to recompute live. So in HTML mode, render a FORM-style layout where every input has \`oninput\` semantics emulated by **value display in the same widget body**.
- Use \`<input type="range">\` and \`<input type="number">\` — the layout shows the formula and inputs, but actual live recompute requires script (stripped).
- So PRINT the formula visibly and show one worked example below. The user can see how the inputs map.
- Alternatively, render as a styled "calc explainer" widget that's read-only.

## Structure
- Header with calculator name
- Stack of inputs: label · input · current value
- Output row: formula + computed result, big number
- 1–2 chip buttons to recompute with different scenarios via \`data-bap-prompt\`

## Example (tip calculator)

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:20px;border-radius:14px;font-family:ui-sans-serif,system-ui;max-width:480px">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Calculator</div>
  <h3 style="margin:0 0 14px;font-size:18px;font-family:Georgia,serif">Tip calculator</h3>
  <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">
    <div>
      <label style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:4px">Bill</label>
      <div style="display:flex;align-items:center;gap:10px">
        <input type="number" value="100" style="width:80px;padding:6px;border:1px solid #d8cfbe;border-radius:6px;font-family:ui-monospace,monospace"/>
        <span style="font-size:12px;color:#666">USD</span>
      </div>
    </div>
    <div>
      <label style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:4px">People</label>
      <input type="number" value="4" style="width:80px;padding:6px;border:1px solid #d8cfbe;border-radius:6px;font-family:ui-monospace,monospace"/>
    </div>
    <div>
      <label style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:4px">Tip %</label>
      <input type="range" min="0" max="30" value="18" style="width:100%;accent-color:#EC3B4A"/>
      <div style="font-family:ui-monospace,monospace;font-size:13px;margin-top:2px">18%</div>
    </div>
  </div>
  <div style="background:#16181f;color:#e6e6e6;padding:14px;border-radius:8px;text-align:center;margin-bottom:10px">
    <div style="font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.1em">Per person</div>
    <div style="font-size:28px;color:#fff;font-weight:700;font-family:Georgia,serif">$29.50</div>
    <div style="font-size:11px;color:#8a8a8a;font-family:ui-monospace,monospace;margin-top:4px">(bill × (1 + tip/100)) / people</div>
  </div>
  <div style="display:flex;gap:6px;flex-wrap:wrap">
    <button data-bap-prompt="Recompute the tip for a $250 bill, 6 people, 20% tip" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:6px 12px;border-radius:999px;font-size:11px;cursor:pointer">$250 · 6 · 20%</button>
    <button data-bap-prompt="What if I round up to the nearest dollar per person?" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:6px 12px;border-radius:999px;font-size:11px;cursor:pointer">Round up</button>
  </div>
</div>
<!--bap-widget:end-->
`;
