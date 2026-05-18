export const SKILL = `# WIDGET SPECIALIST: pie_chart

## When the router picks you
- Composition / breakdown of a whole ("what makes up X")
- 3–7 slices (more than 7 = unreadable; use a bar chart instead)
- NOT for trends over time (use chart)

## Structure
- Header with title + total
- Inline SVG, viewBox \`0 0 360 220\`
- Pie via SVG arc paths (center 110,110, radius 90)
- Legend with color swatch + label + value/percent on the right

## Aesthetic
- BAP red \`#EC3B4A\` for the largest slice; gray-scale or muted hues for the rest

## Math
- Each slice arc: total = sum(values), angle = (value/total) * 2π
- Build path: M cx,cy → L (cx + r·cos θ₀), (cy + r·sin θ₀) → A r,r 0 largeArc,1 (cx + r·cos θ₁), (cy + r·sin θ₁) → Z
- largeArc = 1 if angle > π else 0

## Example (SaaS startup expenses)

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:20px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Breakdown</div>
  <h3 style="margin:0 0 14px;font-size:18px;font-family:Georgia,serif">Typical SaaS startup expenses</h3>
  <div style="display:flex;gap:20px;align-items:center">
    <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" style="width:200px;flex-shrink:0">
      <!-- Salaries 60% -->
      <path d="M 110,110 L 200,110 A 90,90 0 1,1 64,30 Z" fill="#EC3B4A"/>
      <!-- Cloud 20% -->
      <path d="M 110,110 L 64,30 A 90,90 0 0,1 138,21 Z" fill="#374151"/>
      <!-- Tools 10% -->
      <path d="M 110,110 L 138,21 A 90,90 0 0,1 190,62 Z" fill="#9CA3AF"/>
      <!-- Marketing 10% -->
      <path d="M 110,110 L 190,62 A 90,90 0 0,1 200,110 Z" fill="#d1d5db"/>
    </svg>
    <ul style="list-style:none;padding:0;margin:0;font-size:13px;line-height:1.9">
      <li><span style="display:inline-block;width:10px;height:10px;background:#EC3B4A;margin-right:8px;border-radius:2px"></span>Salaries — 60%</li>
      <li><span style="display:inline-block;width:10px;height:10px;background:#374151;margin-right:8px;border-radius:2px"></span>Cloud / infra — 20%</li>
      <li><span style="display:inline-block;width:10px;height:10px;background:#9CA3AF;margin-right:8px;border-radius:2px"></span>SaaS tools — 10%</li>
      <li><span style="display:inline-block;width:10px;height:10px;background:#d1d5db;margin-right:8px;border-radius:2px"></span>Marketing — 10%</li>
    </ul>
  </div>
</div>
<!--bap-widget:end-->
`;
