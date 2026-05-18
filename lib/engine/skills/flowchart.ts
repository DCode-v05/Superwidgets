export const SKILL = `# WIDGET SPECIALIST: flowchart

## When the router picks you
- Process / system flow with branches ("how does X work", "draw the refund flow")
- Decision diamonds, conditional paths
- NOT linear (use stepper) and NOT chronological (use timeline)

## Structure
- Header with title
- Inline SVG, viewBox \`0 0 600 320\`
- 3–8 nodes: rectangles for steps, diamonds for decisions, pills for start/end
- Edges with arrowheads + small labels
- 1–2 follow-up chips

## Aesthetic
- Clean technical-doc feel; BAP red \`#EC3B4A\` for primary path
- Border 1.5px on nodes; mono labels on edges

## Example

A flowchart for handling a refund request.

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:20px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Flow</div>
  <h3 style="margin:0 0 12px;font-size:18px;font-weight:600;font-family:Georgia,serif">Refund request flow</h3>
  <svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#fff;border:1px solid #ece5d4;border-radius:8px">
    <!-- Start -->
    <rect x="40" y="20" width="120" height="40" rx="20" fill="#16181f"/>
    <text x="100" y="46" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">Customer asks</text>
    <!-- Decision: within 30d? -->
    <polygon points="100,90 200,140 100,190 0,140" transform="translate(180,40)" fill="#fff" stroke="#888" stroke-width="1.5"/>
    <text x="280" y="184" text-anchor="middle" fill="#1a1a1a" font-size="12">Within 30 days?</text>
    <!-- Yes path -->
    <rect x="420" y="120" width="140" height="40" rx="6" fill="#fff" stroke="#22c55e" stroke-width="1.5"/>
    <text x="490" y="146" text-anchor="middle" fill="#22c55e" font-size="12" font-weight="600">Auto-refund</text>
    <!-- No path -->
    <rect x="420" y="220" width="140" height="40" rx="6" fill="#fff" stroke="#EC3B4A" stroke-width="1.5"/>
    <text x="490" y="246" text-anchor="middle" fill="#EC3B4A" font-size="12" font-weight="600">Manual review</text>
    <!-- Edges -->
    <line x1="100" y1="60" x2="100" y2="100" stroke="#888" stroke-width="1.5"/>
    <line x1="160" y1="60" x2="280" y2="120" stroke="#888" stroke-width="1.5"/>
    <line x1="380" y1="140" x2="420" y2="140" stroke="#22c55e" stroke-width="1.5"/>
    <text x="395" y="132" font-size="10" fill="#22c55e">yes</text>
    <line x1="320" y1="220" x2="420" y2="240" stroke="#EC3B4A" stroke-width="1.5"/>
    <text x="365" y="225" font-size="10" fill="#EC3B4A">no</text>
    <polygon points="416,138 426,140 416,142" fill="#22c55e"/>
    <polygon points="416,238 426,240 416,242" fill="#EC3B4A"/>
  </svg>
  <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
    <button data-bap-prompt="What's the policy for manual review?" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:6px 12px;border-radius:999px;font-size:12px;cursor:pointer">Manual review policy</button>
  </div>
</div>
<!--bap-widget:end-->
`;
