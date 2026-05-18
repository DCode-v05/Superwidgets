export const SKILL = `# WIDGET SPECIALIST: venn_diagram

## When the router picks you
- Overlapping categories — "X vs Y vs Z and what they share"
- 2 or 3 sets ONLY (Venn diagrams beyond 3 break visually)

## Structure
- Header with title
- Inline SVG, viewBox \`0 0 480 320\`
- 2 or 3 large overlapping circles with partial opacity
- Set labels above/below each circle
- Items listed inside each region (per-set only OR intersection)

## Aesthetic
- Distinct hues per set (BAP red, navy, teal) at fill-opacity ~0.35
- Generous spacing; bold set names

## Example

Where data engineering, data science, and analytics engineering overlap.

<!--bap-widget:start-->
<div style="background:#0f1116;color:#e6e6e6;padding:20px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Overlap</div>
  <h3 style="margin:0 0 14px;font-size:18px;color:#fff;font-family:Georgia,serif">Data roles — what overlaps</h3>
  <svg viewBox="0 0 480 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;background:#16181f;border-radius:8px">
    <circle cx="170" cy="160" r="110" fill="#EC3B4A" fill-opacity="0.30" stroke="#EC3B4A" stroke-width="1.5"/>
    <circle cx="310" cy="160" r="110" fill="#3b82f6" fill-opacity="0.30" stroke="#3b82f6" stroke-width="1.5"/>
    <circle cx="240" cy="240" r="110" fill="#14b8a6" fill-opacity="0.30" stroke="#14b8a6" stroke-width="1.5"/>
    <text x="100" y="80"  fill="#EC3B4A" font-size="14" font-weight="700">Data Engineer</text>
    <text x="320" y="80"  fill="#3b82f6" font-size="14" font-weight="700">Data Scientist</text>
    <text x="170" y="312" fill="#14b8a6" font-size="14" font-weight="700">Analytics Engineer</text>
    <text x="100" y="180" fill="#fff" font-size="11">pipelines</text>
    <text x="350" y="180" fill="#fff" font-size="11">ML / stats</text>
    <text x="200" y="260" fill="#fff" font-size="11">dbt models</text>
    <text x="220" y="170" fill="#fff" font-size="11" font-weight="600">SQL</text>
    <text x="230" y="200" fill="#fff" font-size="11" font-weight="600">warehouses</text>
  </svg>
</div>
<!--bap-widget:end-->
`;
