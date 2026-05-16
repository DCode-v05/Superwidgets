export const SKILL = `# WIDGET SPECIALIST: stepper

## When the router picks you
- Multi-step plan, process, roadmap, or sequence
- "Walk me through X", "Plan a Y in N steps", "Onboarding flow"
- Anything that benefits from a numbered timeline

## Structure pattern
- Header with title + brief context (1 sentence)
- Vertical timeline of 3-7 steps
- Each step: index number (or status icon), title, 1-2 sentence description
- Optional: status indicator (done/active/pending) using color + symbol
- End with chip buttons for "show me details on step N" deep dives

## Required interactivity
- 2-3 follow-up chips at the bottom: \`data-bap-prompt="Tell me more about step [N] — [title]"\`

## Aesthetic guidance
- Use a vertical line connecting steps (1px border or absolute-positioned div)
- Numbered circles for each step (filled accent for active/done, outline for pending)
- Refined typography — serif heading + sans body works well
- Plenty of vertical spacing between steps (24-32px)

## Full example

Here's a 5-step onboarding plan for a new backend engineer. Customize per team norms.

<!--bap-widget:start-->
<div style="background:#f5f1ea;color:#2a2520;padding:24px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a7e6e;text-transform:uppercase;margin-bottom:6px">Plan</div>
  <h3 style="margin:0 0 20px;font-size:22px;font-weight:600;color:#1a1410;font-family:Georgia,serif;letter-spacing:-0.5px">First two weeks</h3>
  <ol style="list-style:none;padding:0;margin:0;position:relative">
    <li style="position:relative;padding-left:48px;padding-bottom:22px;border-left:2px solid #d8cfbe;margin-left:14px">
      <div style="position:absolute;left:-15px;top:-2px;width:30px;height:30px;border-radius:50%;background:#EC3B4A;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">1</div>
      <div style="font-weight:600;font-size:15px;color:#1a1410">Environment setup (Day 1)</div>
      <div style="font-size:13px;color:#6e6457;margin-top:4px;line-height:1.55">Get repo cloned, dev DB running, and a "hello world" PR merged before lunch.</div>
    </li>
    <li style="position:relative;padding-left:48px;padding-bottom:22px;border-left:2px solid #d8cfbe;margin-left:14px">
      <div style="position:absolute;left:-15px;top:-2px;width:30px;height:30px;border-radius:50%;background:#EC3B4A;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">2</div>
      <div style="font-weight:600;font-size:15px;color:#1a1410">Codebase tour (Day 2-3)</div>
      <div style="font-size:13px;color:#6e6457;margin-top:4px;line-height:1.55">Pair with senior on a guided walk through service boundaries, data model, deploy flow.</div>
    </li>
    <li style="position:relative;padding-left:48px;padding-bottom:22px;border-left:2px solid #d8cfbe;margin-left:14px">
      <div style="position:absolute;left:-15px;top:-2px;width:30px;height:30px;border-radius:50%;background:#fff;border:2px solid #EC3B4A;color:#EC3B4A;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">3</div>
      <div style="font-weight:600;font-size:15px;color:#1a1410">Starter bug (Day 4-7)</div>
      <div style="font-size:13px;color:#6e6457;margin-top:4px;line-height:1.55">Small scoped bug or chore. Goal: full PR cycle including review feedback.</div>
    </li>
    <li style="position:relative;padding-left:48px;padding-bottom:22px;border-left:2px solid #d8cfbe;margin-left:14px">
      <div style="position:absolute;left:-15px;top:-2px;width:30px;height:30px;border-radius:50%;background:#fff;border:2px solid #d8cfbe;color:#8a7e6e;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">4</div>
      <div style="font-weight:600;font-size:15px;color:#1a1410">Shadow on-call (Week 2)</div>
      <div style="font-size:13px;color:#6e6457;margin-top:4px;line-height:1.55">Sit alongside the on-call engineer for a rotation; observe incident handling without primary responsibility.</div>
    </li>
    <li style="position:relative;padding-left:48px;margin-left:14px">
      <div style="position:absolute;left:-15px;top:-2px;width:30px;height:30px;border-radius:50%;background:#fff;border:2px solid #d8cfbe;color:#8a7e6e;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">5</div>
      <div style="font-weight:600;font-size:15px;color:#1a1410">First feature (Week 3+)</div>
      <div style="font-size:13px;color:#6e6457;margin-top:4px;line-height:1.55">Ownership of a small scoped feature, end to end including design doc and rollout.</div>
    </li>
  </ol>
  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:20px">
    <button data-bap-prompt="Tell me more about step 1 — environment setup. What's a typical Day 1 checklist?" style="background:transparent;color:#1a1410;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Day 1 checklist</button>
    <button data-bap-prompt="Tell me more about step 3 — starter bug. How do I scope a good one?" style="background:transparent;color:#1a1410;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Scoping starter bugs</button>
  </div>
</div>
<!--bap-widget:end-->
`;
