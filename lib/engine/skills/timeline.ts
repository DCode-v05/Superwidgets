export const SKILL = `# WIDGET SPECIALIST: timeline

## When the router picks you
- Chronological events, history of X, "when did Y happen"
- Product roadmap, project milestones with dates
- NOT for process steps with status (use stepper)

## Structure pattern
- Header with title + optional subtitle
- Vertical timeline: date on left, dot/marker, content on right
- 3–8 events; each event = date label + title + 1-line body
- BAP red dot for the most-recent / highlighted event; gray for others
- End with 1–2 follow-up chips

## Aesthetic guidance
- Editorial / magazine feel — generous line-height, distinctive typography
- Dates in monospace for alignment
- Vertical line behind dots in a muted color
- Titles in semibold; body in regular weight

## Full example (company milestones)

A condensed history of Y Combinator's biggest moments.

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:22px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">History</div>
  <h3 style="margin:0 0 18px;font-size:20px;font-weight:600;letter-spacing:-0.3px;font-family:Georgia,serif">Y Combinator — milestones</h3>

  <div style="position:relative;padding-left:120px">
    <div style="position:absolute;left:96px;top:0;bottom:0;width:2px;background:#e3dccd"></div>

    <div style="position:relative;padding-bottom:18px">
      <div style="position:absolute;left:-120px;top:2px;width:80px;text-align:right;font-family:ui-monospace,monospace;font-size:12px;color:#666;font-weight:600">2005</div>
      <div style="position:absolute;left:-30px;top:6px;width:10px;height:10px;border-radius:50%;background:#1a1a1a"></div>
      <div style="font-size:14px;font-weight:600;color:#1a1a1a">Founded by Paul Graham &amp; Jessica Livingston</div>
      <div style="font-size:12px;color:#666;margin-top:2px;line-height:1.5">First batch funded 8 startups in summer 2005 with $6,000 per founder.</div>
    </div>

    <div style="position:relative;padding-bottom:18px">
      <div style="position:absolute;left:-120px;top:2px;width:80px;text-align:right;font-family:ui-monospace,monospace;font-size:12px;color:#666;font-weight:600">2009</div>
      <div style="position:absolute;left:-30px;top:6px;width:10px;height:10px;border-radius:50%;background:#1a1a1a"></div>
      <div style="font-size:14px;font-weight:600;color:#1a1a1a">Airbnb founders join YC</div>
      <div style="font-size:12px;color:#666;margin-top:2px;line-height:1.5">Now valued in tens of billions — defining YC success story.</div>
    </div>

    <div style="position:relative;padding-bottom:18px">
      <div style="position:absolute;left:-120px;top:2px;width:80px;text-align:right;font-family:ui-monospace,monospace;font-size:12px;color:#666;font-weight:600">2014</div>
      <div style="position:absolute;left:-30px;top:6px;width:10px;height:10px;border-radius:50%;background:#1a1a1a"></div>
      <div style="font-size:14px;font-weight:600;color:#1a1a1a">Sam Altman becomes president</div>
      <div style="font-size:12px;color:#666;margin-top:2px;line-height:1.5">Pivoted toward larger batches and broader funding theses.</div>
    </div>

    <div style="position:relative;padding-bottom:18px">
      <div style="position:absolute;left:-120px;top:2px;width:80px;text-align:right;font-family:ui-monospace,monospace;font-size:12px;color:#EC3B4A;font-weight:700">2024</div>
      <div style="position:absolute;left:-30px;top:6px;width:10px;height:10px;border-radius:50%;background:#EC3B4A"></div>
      <div style="font-size:14px;font-weight:600;color:#1a1a1a">~5,000 companies funded total</div>
      <div style="font-size:12px;color:#666;margin-top:2px;line-height:1.5">Combined valuation exceeds $600 billion. Two batches per year.</div>
    </div>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">
    <button data-bap-prompt="What's the application process like?" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Application process</button>
    <button data-bap-prompt="List the most successful YC alumni" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Top alumni</button>
  </div>
</div>
<!--bap-widget:end-->
`;
