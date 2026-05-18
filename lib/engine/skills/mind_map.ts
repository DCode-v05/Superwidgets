export const SKILL = `# WIDGET SPECIALIST: mind_map

## When the router picks you
- Brainstorm / exploration of a topic ("mind map of skills for X")
- Hierarchical breakdown with NO ordering implied
- NOT a flowchart (no arrows/sequence), NOT a tree-table (no values)

## Structure
- Header with topic name
- Inline SVG, viewBox \`0 0 600 360\`
- Central node (BAP red), 4–6 radial branches with sub-leaves
- Curved or straight branch lines

## Aesthetic
- Soft palette; central node bold, leaves muted
- Lines thin, no arrows

## Example

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:20px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Mind map</div>
  <h3 style="margin:0 0 12px;font-size:18px;font-family:Georgia,serif">Skills for a senior backend engineer</h3>
  <svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" style="width:100%;background:#fff;border:1px solid #ece5d4;border-radius:8px">
    <line x1="300" y1="180" x2="120" y2="80"  stroke="#bbb"/>
    <line x1="300" y1="180" x2="490" y2="80"  stroke="#bbb"/>
    <line x1="300" y1="180" x2="120" y2="290" stroke="#bbb"/>
    <line x1="300" y1="180" x2="490" y2="290" stroke="#bbb"/>
    <line x1="300" y1="180" x2="300" y2="40"  stroke="#bbb"/>
    <line x1="300" y1="180" x2="300" y2="320" stroke="#bbb"/>
    <ellipse cx="300" cy="180" rx="80" ry="34" fill="#EC3B4A"/>
    <text x="300" y="185" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">Senior BE</text>
    <text x="120" y="80"  text-anchor="middle" fill="#1a1a1a" font-size="12" font-weight="600">Systems design</text>
    <text x="490" y="80"  text-anchor="middle" fill="#1a1a1a" font-size="12" font-weight="600">Data &amp; storage</text>
    <text x="300" y="40"  text-anchor="middle" fill="#1a1a1a" font-size="12" font-weight="600">Distributed sys</text>
    <text x="300" y="334" text-anchor="middle" fill="#1a1a1a" font-size="12" font-weight="600">Observability</text>
    <text x="120" y="290" text-anchor="middle" fill="#1a1a1a" font-size="12" font-weight="600">Mentorship</text>
    <text x="490" y="290" text-anchor="middle" fill="#1a1a1a" font-size="12" font-weight="600">Security</text>
  </svg>
</div>
<!--bap-widget:end-->
`;
