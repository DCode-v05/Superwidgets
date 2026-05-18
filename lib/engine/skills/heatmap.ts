export const SKILL = `# WIDGET SPECIALIST: heatmap

## When the router picks you
- Density grid across two dimensions ("traffic by day × hour", "activity matrix")
- Color-coded values per cell

## Structure
- Header with title + unit
- HTML <table> where each <td> has inline \`background\` and the numeric value as text
- Row labels in first column, column headers in <thead>
- Color scale: light shade (low) → BAP red (high)

## Aesthetic
- Compact cell size; mono numbers; clear contrast against the cell color

## Color math
- For value v with min/max range: opacity = (v - min) / (max - min)
- Use BAP red \`#EC3B4A\` with that opacity applied via rgba (e.g. \`rgba(236,59,74,0.45)\`)

## Example (website traffic — day × hour, simplified to 4 hour windows)

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:20px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Density</div>
  <h3 style="margin:0 0 6px;font-size:18px;font-family:Georgia,serif">Website traffic — day × time</h3>
  <div style="font-size:12px;color:#666;margin-bottom:10px">visits / hour · last 7 days</div>
  <table style="border-collapse:collapse;font-size:11px;font-family:ui-monospace,monospace">
    <thead><tr>
      <th></th><th style="padding:6px 10px;color:#666">00–06</th><th style="padding:6px 10px;color:#666">06–12</th><th style="padding:6px 10px;color:#666">12–18</th><th style="padding:6px 10px;color:#666">18–24</th>
    </tr></thead>
    <tbody>
      <tr><td style="padding:4px 8px;font-weight:600">Mon</td>
        <td style="background:rgba(236,59,74,0.08);padding:8px 14px;text-align:center">120</td>
        <td style="background:rgba(236,59,74,0.55);padding:8px 14px;text-align:center;color:#fff">740</td>
        <td style="background:rgba(236,59,74,0.90);padding:8px 14px;text-align:center;color:#fff">1240</td>
        <td style="background:rgba(236,59,74,0.40);padding:8px 14px;text-align:center">510</td>
      </tr>
      <tr><td style="padding:4px 8px;font-weight:600">Tue</td>
        <td style="background:rgba(236,59,74,0.10);padding:8px 14px;text-align:center">150</td>
        <td style="background:rgba(236,59,74,0.60);padding:8px 14px;text-align:center;color:#fff">820</td>
        <td style="background:rgba(236,59,74,0.95);padding:8px 14px;text-align:center;color:#fff">1310</td>
        <td style="background:rgba(236,59,74,0.42);padding:8px 14px;text-align:center">540</td>
      </tr>
      <tr><td style="padding:4px 8px;font-weight:600">Sat</td>
        <td style="background:rgba(236,59,74,0.20);padding:8px 14px;text-align:center">280</td>
        <td style="background:rgba(236,59,74,0.35);padding:8px 14px;text-align:center">460</td>
        <td style="background:rgba(236,59,74,0.30);padding:8px 14px;text-align:center">390</td>
        <td style="background:rgba(236,59,74,0.18);padding:8px 14px;text-align:center">240</td>
      </tr>
    </tbody>
  </table>
</div>
<!--bap-widget:end-->
`;
