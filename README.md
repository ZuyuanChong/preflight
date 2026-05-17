# Preflight

AI Venture Preflight for Ralphthon Impact track.

Preflight is a founder decision system. A solo founder enters a startup idea, and the app runs an AI venture studio sprint that returns an evidence-backed company blueprint: verdict, market proof, ICP, MVP scope, pricing, GTM plan, risks, quality gates, red-team critique, and founder artifacts.

> Before you build it, put it through Preflight.

## Current Build Brief

This repository is set up for an autonomous Codex Goals build. The latest implementation instructions are split across:

- [AGENTS.md](./AGENTS.md) - mandatory Codex operating manual with skill/plugin triggers, autonomous rules, fallbacks, and verification gates.
- [PLAN.md](./PLAN.md) - product plan, build priorities, data contracts, acceptance checklist.
- [CODEX_HANDOVER.md](./CODEX_HANDOVER.md) - exact one-hour Codex handoff, fallback path, verification rules, seeded demo content.
- [RALPH_LOOP_LAUNCH.md](./RALPH_LOOP_LAUNCH.md) - human launch checklist and copy-ready Ralph loop Goal prompt.

Codex must read the operating files before making implementation changes.

## Why This Fits Ralphthon Impact

Ralphthon Impact projects are scored on live demo quality, creativity/originality, and impact potential. Preflight is optimized around that:

- **Live demo:** A judge can type an idea, start a sprint, and inspect verdict, evidence, quality gates, critique, and artifacts.
- **Originality:** The product is not a generic idea validator or pitch deck generator. It is an AI Venture Preflight system with explicit evidence quality and red-team pressure.
- **Impact:** Founders waste time building weak ideas. Preflight helps them decide whether an idea deserves a weekend, a prototype, or a pause.

Important framing:

- Do not position this as a Streamlit prototype.
- Do not position this as a basic RAG app.
- Do not position this as a generic chatbot, pitch generator, or long-term AI cofounder.
- Do position this as an evidence-backed pre-build decision workflow.

## Product Flow

1. Founder enters idea, target customer, geography, and optional business model.
2. Preflight frames the idea into assumptions and unknowns.
3. Managing Partner dispatches specialist agents.
4. Specialist agents produce findings.
5. Quality Gate flags weak output and unsupported claims.
6. Red Team attacks the venture.
7. Managing Partner synthesizes the final verdict: **Proceed**, **Pivot**, **Pause**, or **Kill**.
8. Artifact Producer formats founder-ready outputs.

## MVP Screens

The first autonomous build should produce these screens before any live API integration:

- **Intake:** Serious SaaS-style startup idea form. This is the first screen, not a marketing landing page.
- **Live Sprint:** Agent statuses, logs, progress, evidence, and quality gates.
- **Blueprint:** Verdict, scorecard, ICP, market notes, MVP, pricing, GTM, risks, and next actions.
- **Evidence Ledger:** Source-backed claims separated from assumptions.
- **Quality Gates:** Missing citations, unsupported numbers, generic filler, uncertain competitors, contradictions, weak assumptions, and overclaims.
- **Red Team:** Specific objections that make the output more trustworthy.
- **Artifacts:** Founder memo, market brief, PRD, pitch deck outline, unit economics, GTM plan, and red-team memo.

## Agent Roles

- **Managing Partner:** Orchestrates, synthesizes, and decides the final verdict.
- **Framer:** Converts raw idea into structured venture brief and assumptions.
- **Market Scout:** Finds market signals, competitors, substitutes, pricing, and demand evidence.
- **Customer Analyst:** Defines ICP, pains, workflows, objections, and interview questions.
- **Product Architect:** Scopes MVP, user journey, features, and non-goals.
- **Business Modeler:** Models pricing, unit economics, cost drivers, and monetization risk.
- **Growth Strategist:** Creates launch channels, validation experiments, and GTM plan.
- **Red Team Critic:** Attacks assumptions, moat, urgency, willingness to pay, and evidence quality.
- **Artifact Producer:** Formats final outputs.

## Autonomous Codex Goal

Use this as the primary unattended Goal:

```text
/goal Build a demo-ready Preflight web app in this repository within the current autonomous work window. First read and follow AGENTS.md, PLAN.md, CODEX_HANDOVER.md, and README.md. Invoke the required skills/plugins in AGENTS.md when their trigger conditions appear. The app must let a judge enter a startup idea, run or simulate an AI venture preflight sprint, and show a polished Intake, Live Sprint, Blueprint, Quality Gate, Red Team, Evidence Ledger, and Artifacts experience. Verify by running the local app, checking desktop and mobile layouts with Browser/Playwright/webapp-testing, and running typecheck/build where available. Preserve README.md, PLAN.md, CODEX_HANDOVER.md, and AGENTS.md, document any generated work as hackathon-built, avoid Streamlit/basic RAG framing, and keep demo mode working without API keys. If dependency installation or dev server startup is blocked, create a static fallback demo and document the exact blocker and launch command.
```

Completion requires evidence:

- The app or static fallback opens locally.
- Intake is the first usable screen.
- A seeded demo run works without API keys.
- Verdict, scorecard, evidence, quality issues, red-team critique, and artifacts are visible.
- Desktop and mobile layouts do not overlap.
- Setup and verification results are recorded in `IMPLEMENTATION_LOG.md`.

## Required Autonomous Capabilities

Codex must automatically use the capability matrix in [AGENTS.md](./AGENTS.md). In short:

- Use Superpowers execution skills for task execution and verification discipline.
- Use Build Web Apps skills for frontend implementation and UI debugging.
- Use Browser first, then Playwright or webapp-testing fallback, for local visual verification.
- Use OpenAI Developers skills only after demo mode works and only for server-side live generation.
- Use Tavily skills only after demo mode works and only for real web evidence.
- Use Vercel only after local build verification and only if authentication is already available.
- Commit and push useful checkpoints to GitHub autonomously when the rules in `AGENTS.md` say to do so.

Missing optional integrations are not blockers. Missing both Next.js and static fallback capability is a blocker.

## Build Priorities

### P0: Demo Mode

Build a deterministic, polished demo first. It must work with no API keys and no network dependency.

Required:

- Typed local demo data.
- Sprint simulation or completed demo run.
- Agent dashboard.
- Evidence ledger.
- Quality gates.
- Red-team memo.
- Blueprint.
- Seven artifact tabs.
- Demo reset or "load completed demo" control.

### P1: Server Skeleton

After demo mode works:

- Add a run creation route.
- Keep state local and simple.
- Keep seeded fallback active.
- Do not expose API keys in client code.

### P2: Optional Live AI And Evidence

After local demo and build verification:

- Add server-side OpenAI generation if `OPENAI_API_KEY` exists.
- Add search/evidence provider if a key exists.
- Validate all generated output against the existing data contracts.
- Fall back to demo mode on any live failure.

### P3: Submission Polish

After the app builds locally:

- Update README with final run commands.
- Add a 3-minute demo script.
- Deploy only if Vercel auth is already available.
- Do not let deployment attempts break local demo mode.

## Suggested Tech Stack

Preferred:

- Next.js App Router.
- TypeScript.
- CSS or Tailwind.
- Local typed demo data.
- Optional server-side OpenAI API.
- Optional search provider.

Fallback:

- `static-demo/index.html`
- `static-demo/styles.css`
- `static-demo/app.js`

The static fallback is acceptable if dependency installation or dev server startup is blocked. It must still show the core Preflight workflow.

## Expected Repository Shape

If using Next.js:

```text
preflight/
├── AGENTS.md
├── CODEX_HANDOVER.md
├── IMPLEMENTATION_LOG.md
├── PLAN.md
├── README.md
├── package.json
├── tsconfig.json
├── next.config.mjs
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── ArtifactTabs.tsx
    │   ├── BlueprintPanel.tsx
    │   ├── EvidenceLedger.tsx
    │   ├── IntakePanel.tsx
    │   ├── QualityGatePanel.tsx
    │   └── SprintDashboard.tsx
    ├── data/
    │   └── demo-run.ts
    ├── lib/
    │   ├── artifacts.ts
    │   ├── quality.ts
    │   └── sprint.ts
    └── types/
        └── preflight.ts
```

If using static fallback:

```text
preflight/
└── static-demo/
    ├── README.md
    ├── app.js
    ├── index.html
    └── styles.css
```

## Demo Seed

Use Preflight itself as the reliable demo idea:

```text
Idea: A web app where solo founders enter one sentence and an AI venture studio produces an evidence-backed company blueprint.
Target customer: Solo technical founders and indie hackers before they spend a weekend building.
Geography: Global, English-speaking startup communities.
Business model: Freemium with paid deep-dive reports and team workspaces.
```

Seeded verdict:

```text
Decision: Pivot
Rationale: The wedge is strong, but the generic "AI startup advisor" market is crowded. The sharper opportunity is not idea validation; it is a pre-build decision system that makes evidence quality, red-team objections, and artifact consistency visible.
Strongest wedge: A founder can see what would have to be true before investing a weekend in the build.
```

## Environment Variables

Demo mode must work without these.

```text
OPENAI_API_KEY=
TAVILY_API_KEY=
PREFLIGHT_MODE=demo
```

Rules:

- Use `OPENAI_API_KEY` only in server-side code.
- Treat missing keys as expected, not fatal.
- Keep seeded demo mode available at all times.

## Verification

Run these when available:

```powershell
npm run typecheck
npm run build
npm run dev
```

If the project uses the static fallback, verify by opening:

```powershell
static-demo\index.html
```

Manual checks:

- Intake appears first.
- Start sprint works.
- Demo reset works.
- Completed demo works without API keys.
- Evidence ledger separates sources from assumptions.
- Quality gates show warning/failure states.
- Red-team critique is specific.
- All artifact tabs open.
- Mobile width has no horizontal overflow.
- Desktop view has no overlapping cards or clipped text.

## Three-Minute Demo Script

1. **0:00-0:20:** Open Preflight. Enter the demo idea and start the sprint.
2. **0:20-0:50:** Show Managing Partner dispatching specialist agents.
3. **0:50-1:20:** Open evidence ledger and explain sourced claims versus assumptions.
4. **1:20-1:50:** Show quality gate catching unsupported or generic claims.
5. **1:50-2:20:** Show Red Team critique and final verdict.
6. **2:20-2:45:** Open founder memo and pitch deck outline.
7. **2:45-3:00:** Close with: "Preflight does not just help founders pitch. It helps them decide whether the thing deserves to exist."

## Built During Hackathon

For submission, clearly separate:

- This planning and handoff material.
- The implementation produced during the autonomous Codex build.
- Any generated demo data or seeded fallback content.
- Any optional live integration added after demo mode works.

Do not claim pre-existing planning text as shipped product code. The demo should focus on what was built in the hackathon window.

## Autonomous GitHub Publishing

The implementation loop is authorized to commit and push checkpoints to `origin` without manual supervision when:

- the demo shell or static fallback first becomes runnable;
- P0 demo mode passes local verification;
- Codex is about to start risky optional live API/search/deployment work;
- the current Goal is verified; or
- the budget is nearly exhausted and the remote should receive the latest useful state.

If GitHub auth, network, or branch protection blocks a push, Codex must keep working locally and record the exact blocker in `IMPLEMENTATION_LOG.md`.

## Next Best Goals

After the first autonomous build succeeds:

```text
/goal Add optional live server-side sprint generation to the existing Preflight demo without breaking demo mode. First read AGENTS.md and use OpenAI docs/platform-key skills when available. Use OPENAI_API_KEY only on the server, return structured JSON matching the existing types, keep seeded fallback active when credentials or network are unavailable, and verify one live or fallback run renders fully.
```

Then:

```text
/goal Make Preflight submission-ready by verifying setup from a fresh terminal, documenting env vars and demo mode, adding a 3-minute demo script to README.md, and deploying only if Vercel authentication is already available. First read AGENTS.md and use Browser/Playwright/webapp-testing for verification. Do not break the local demo while attempting deployment.
```
