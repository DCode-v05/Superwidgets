export const SKILL = `# WIDGET SPECIALIST: quiz

## When the router picks you
- "Quiz about X", "test me", "3-question check on Y"
- 2–5 multiple-choice questions on a single topic

## IMPORTANT — sanitizer constraints
- <script> tags are stripped. Live scoring is achievable via React in Typed mode, but in HTML mode you render a READ-ONLY quiz:
  - Show each question + 3-4 lettered options
  - Mark the correct option with a subtle indicator (e.g. "✓" or color tint) — DON'T hide it; the user is reading not playing
  - Add a small explanation below each question

## Structure
- Header with quiz title
- Numbered question list — each block: question text + lettered options + "Answer: X — <one-line explanation>"
- 1–2 chips for follow-up ("explain question 2", "give me a harder quiz")

## Aesthetic
- Editorial / textbook feel; serif headings; mono option letters

## Example (HTTP status codes)

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:20px;border-radius:14px;font-family:ui-sans-serif,system-ui;max-width:560px">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Quiz · 3 questions</div>
  <h3 style="margin:0 0 14px;font-size:18px;font-family:Georgia,serif">HTTP status codes</h3>

  <div style="margin-bottom:16px">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">1. Which status means "I can't find what you asked for"?</div>
    <ul style="list-style:none;padding:0;margin:0 0 6px;font-size:13px;line-height:1.7">
      <li><span style="font-family:ui-monospace,monospace;color:#666">a)</span> 200</li>
      <li><span style="font-family:ui-monospace,monospace;color:#666">b)</span> 301</li>
      <li style="color:#22c55e"><span style="font-family:ui-monospace,monospace;color:#22c55e">c) ✓</span> 404</li>
      <li><span style="font-family:ui-monospace,monospace;color:#666">d)</span> 500</li>
    </ul>
    <div style="font-size:12px;color:#666;font-style:italic">404 = Not Found. Use it when the URL doesn't match any resource.</div>
  </div>

  <div style="margin-bottom:16px">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">2. Which code is the right reply for "you're not allowed"?</div>
    <ul style="list-style:none;padding:0;margin:0 0 6px;font-size:13px;line-height:1.7">
      <li><span style="font-family:ui-monospace,monospace;color:#666">a)</span> 400</li>
      <li><span style="font-family:ui-monospace,monospace;color:#666">b)</span> 401</li>
      <li style="color:#22c55e"><span style="font-family:ui-monospace,monospace;color:#22c55e">c) ✓</span> 403</li>
      <li><span style="font-family:ui-monospace,monospace;color:#666">d)</span> 409</li>
    </ul>
    <div style="font-size:12px;color:#666;font-style:italic">403 = Forbidden (authenticated but not allowed). 401 = Unauthorized (not authenticated).</div>
  </div>

  <div style="margin-bottom:14px">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">3. What does 429 mean?</div>
    <ul style="list-style:none;padding:0;margin:0 0 6px;font-size:13px;line-height:1.7">
      <li style="color:#22c55e"><span style="font-family:ui-monospace,monospace;color:#22c55e">a) ✓</span> Too Many Requests</li>
      <li><span style="font-family:ui-monospace,monospace;color:#666">b)</span> Gateway Timeout</li>
      <li><span style="font-family:ui-monospace,monospace;color:#666">c)</span> Service Unavailable</li>
      <li><span style="font-family:ui-monospace,monospace;color:#666">d)</span> Bad Gateway</li>
    </ul>
    <div style="font-size:12px;color:#666;font-style:italic">429 = client is rate-limited; the server tells them to back off.</div>
  </div>

  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
    <button data-bap-prompt="Give me a harder quiz on HTTP" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:6px 12px;border-radius:999px;font-size:11px;cursor:pointer">Harder quiz</button>
    <button data-bap-prompt="Quiz me on REST design instead" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:6px 12px;border-radius:999px;font-size:11px;cursor:pointer">REST quiz</button>
  </div>
</div>
<!--bap-widget:end-->
`;
