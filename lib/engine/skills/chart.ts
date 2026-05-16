export const SKILL = `# WIDGET SPECIALIST: chart

## When the router picks you
- Numeric trend over time, distribution, or comparison
- "Show revenue trend", "Visualize growth", "Plot X vs Y"
- Bar / line / area only — skip pie, scatter, flowchart (they break)

## Structure pattern
- Header: title + subtitle (units, time range)
- Inline SVG, viewBox 0 0 400 220 (or 800 440 for higher res)
- Padding: 40px left for y-axis labels, 30px bottom for x-axis labels, 20px top, 20px right
- Y-axis with 3-5 gridlines + labels (right-aligned)
- X-axis with tick labels under each data point
- Optional: legend below chart for multi-series
- End with chips for drill-downs

## Math you do in your head
- Chart area = viewBox 400×220 minus padding → ~340×170 plot area
- Y-axis: map data values linearly to plot height (invert: y=0 is bottom)
- X-axis: distribute evenly across plot width
- For BAR: width = plot_width / (data.length × 1.4), gap = 0.4 × bar width
- For LINE: <polyline points="x1,y1 x2,y2 ..." />
- For AREA: same as line but with bottom edge closed and fill-opacity

## Color
- Primary series: BAP red \`#EC3B4A\`
- Secondary: dark gray \`#374151\`
- Tertiary: muted \`#9CA3AF\`
- Gridlines: very light \`#e5e7eb\` (light bg) or \`#1f2937\` (dark bg)
- Axis text: medium gray

## Required interactivity
- 2-3 follow-up chips: \`data-bap-prompt="Show me the [metric] for the previous period"\` etc.

## Aesthetic guidance
- Restrained — chart is the answer, decoration is noise
- Generous padding around the SVG inside the container
- Title in a distinctive font (serif works well for editorial feel)
- Numeric labels in monospace for alignment

## Full example (line chart, 6 months)

Revenue trended up consistently over the period, with the steepest gain in May.

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:22px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Trend</div>
  <h3 style="margin:0 0 4px;font-size:20px;font-weight:600;letter-spacing:-0.3px;font-family:Georgia,serif">Monthly revenue</h3>
  <div style="font-size:12px;color:#777;margin-bottom:14px;font-family:ui-monospace,monospace">USD · last 6 months</div>

  <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
    <!-- Gridlines -->
    <line x1="40" y1="20"  x2="380" y2="20"  stroke="#e5e7eb" stroke-width="1"/>
    <line x1="40" y1="60"  x2="380" y2="60"  stroke="#e5e7eb" stroke-width="1"/>
    <line x1="40" y1="100" x2="380" y2="100" stroke="#e5e7eb" stroke-width="1"/>
    <line x1="40" y1="140" x2="380" y2="140" stroke="#e5e7eb" stroke-width="1"/>
    <line x1="40" y1="180" x2="380" y2="180" stroke="#e5e7eb" stroke-width="1"/>

    <!-- Y-axis labels -->
    <text x="35" y="24"  text-anchor="end" font-size="10" fill="#888" font-family="ui-monospace,monospace">20K</text>
    <text x="35" y="64"  text-anchor="end" font-size="10" fill="#888" font-family="ui-monospace,monospace">15K</text>
    <text x="35" y="104" text-anchor="end" font-size="10" fill="#888" font-family="ui-monospace,monospace">10K</text>
    <text x="35" y="144" text-anchor="end" font-size="10" fill="#888" font-family="ui-monospace,monospace">5K</text>
    <text x="35" y="184" text-anchor="end" font-size="10" fill="#888" font-family="ui-monospace,monospace">0</text>

    <!-- Data points: Dec 12K, Jan 13.5K, Feb 14.2K, Mar 15.8K, Apr 17.1K, May 19.5K -->
    <!-- y = 180 - (value / 20000 * 160) -->
    <polyline points="68,84 130,72 192,66 254,53 316,42 378,23"
              fill="none" stroke="#EC3B4A" stroke-width="2.5"/>

    <!-- Dots -->
    <circle cx="68"  cy="84" r="3.5" fill="#EC3B4A"/>
    <circle cx="130" cy="72" r="3.5" fill="#EC3B4A"/>
    <circle cx="192" cy="66" r="3.5" fill="#EC3B4A"/>
    <circle cx="254" cy="53" r="3.5" fill="#EC3B4A"/>
    <circle cx="316" cy="42" r="3.5" fill="#EC3B4A"/>
    <circle cx="378" cy="23" r="3.5" fill="#EC3B4A"/>

    <!-- X-axis labels -->
    <text x="68"  y="200" text-anchor="middle" font-size="10" fill="#888" font-family="ui-monospace,monospace">Dec</text>
    <text x="130" y="200" text-anchor="middle" font-size="10" fill="#888" font-family="ui-monospace,monospace">Jan</text>
    <text x="192" y="200" text-anchor="middle" font-size="10" fill="#888" font-family="ui-monospace,monospace">Feb</text>
    <text x="254" y="200" text-anchor="middle" font-size="10" fill="#888" font-family="ui-monospace,monospace">Mar</text>
    <text x="316" y="200" text-anchor="middle" font-size="10" fill="#888" font-family="ui-monospace,monospace">Apr</text>
    <text x="378" y="200" text-anchor="middle" font-size="10" fill="#888" font-family="ui-monospace,monospace">May</text>
  </svg>

  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
    <button data-bap-prompt="Show me the same chart but for the previous 6 months" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Previous period</button>
    <button data-bap-prompt="Break this down by product line" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">By product line</button>
  </div>
</div>
<!--bap-widget:end-->
`;
