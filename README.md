# Preflight

AI Venture Preflight for Ralphthon Impact track.

Preflight is a founder decision system. A solo founder enters a startup idea, and the app runs an AI venture studio sprint that returns an evidence-backed company blueprint: verdict, market proof, ICP, MVP scope, pricing, GTM plan, risks, quality gates, red-team critique, and founder artifacts.

> Before you build it, put it through Preflight.

## Current Build Brief

This repository is set up for an autonomous Codex Goals build. The latest implementation instructions are split across:

- [AGENTS.md](./AGENTS.md) - mandatory Codex operating manual with skill/plugin triggers, autonomous rules, fallbacks, and verification gates.
- [PLAN.md](./PLAN.md) - product plan, build priorities, data contracts, acceptance checklist.
- [CODEX_HANDOVER.md](./CODEX_HANDOVER.md) - exact one-hour Codex handoff, verification rules, and seeded local-run content.
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

## Multi-Agent System

Preflight now models the venture sprint as an explicit multi-agent system instead of a loose role list. The app exposes agent ownership, role-specific tools, workflow order, shared memory, handoffs, revision requests, reviewer findings, and inspectable per-agent activity logs in the product UI.

Live Agent Studio runs use an independent backend execution model. The server decomposes the founder request into role-specific tasks, gives every agent its own system prompt and task context, runs search-capable agents with their own server-side retrieval step when Tavily credentials are available, preserves per-agent sources, flags unsupported claims, and then asks the Managing Partner summarizer to synthesize only the merged structured outputs.

- **Managing Partner:** Orchestrator that assigns work, resolves conflicts, and approves the final verdict.
- **Intake and Clarification:** Converts founder input into a usable venture brief and records safe assumptions.
- **Venture Framer:** Turns the brief into hypotheses, assumptions, unknowns, and specialist questions.
- **Market Evidence:** Separates sourced claims from assumptions, competitor gaps, and evidence risks.
- **Customer and ICP:** Defines the first buyer segment, pain, workflow, objections, and interviews.
- **Product Strategy:** Scopes MVP, user journey, features, non-goals, and feasibility risks.
- **Business Modeler:** Models pricing, unit economics assumptions, cost drivers, and monetization risk.
- **Growth Strategist:** Creates launch channels, validation experiments, and first-user plan.
- **Red Team Critic:** Challenges assumptions, urgency, moat, willingness to pay, and evidence quality.
- **Quality Control:** Reviews accuracy, completeness, consistency, unsupported claims, and artifact usefulness.
- **Artifact Producer:** Finalization agent that formats only approved blueprint material into founder artifacts.

Each agent is represented as an individual LLM profile with bounded capabilities. Examples:

- Web-search capable agents: Market Evidence and Growth Strategist.
- Document-review agents: Product Strategy, Quality Control, and Artifact Producer.
- Data-analysis agent: Business Modeler.
- Technical-debugging agent: Product Strategy.
- Research-synthesis agents: Venture Framer, Customer and ICP, Growth Strategist, and Red Team Critic.

The operating architecture panel includes an agent activity console. Each log shows the agent task, tools used, reasoning summary, output, and handoff target so the sprint feels modular and inspectable instead of one generic assistant response.

## Autonomous Codex Goal

Use this as the primary unattended Goal:

```text
/goal Build a demo-ready Preflight web app in this repository within the current autonomous work window. First read and follow AGENTS.md, PLAN.md, CODEX_HANDOVER.md, and README.md. Invoke the required skills/plugins in AGENTS.md when their trigger conditions appear. The app must let a judge enter a startup idea, run or simulate an AI venture preflight sprint, and show a polished Intake, Live Sprint, Blueprint, Quality Gate, Red Team, Evidence Ledger, and Artifacts experience. Verify by running the local app, checking desktop and mobile layouts with Browser/Playwright/webapp-testing, and running typecheck/build where available. Preserve README.md, PLAN.md, CODEX_HANDOVER.md, and AGENTS.md, document any generated work as hackathon-built, and avoid Streamlit/basic RAG framing.
```

Completion requires evidence:

- The Next.js app opens locally.
- Intake is the first usable screen.
- A Preflight run works from founder input.
- Verdict, scorecard, evidence, quality issues, red-team critique, and artifacts are visible.
- Desktop and mobile layouts do not overlap.
- Setup and verification results are recorded in `IMPLEMENTATION_LOG.md`.

## Required Autonomous Capabilities

Codex must automatically use the capability matrix in [AGENTS.md](./AGENTS.md). In short:

- Use Superpowers execution skills for task execution and verification discipline.
- Use Build Web Apps skills for frontend implementation and UI debugging.
- Use Browser first, then Playwright or webapp-testing fallback, for local visual verification.
- Use Codex Goals through the user's ChatGPT Pro subscription for implementation. The first verified build works without `OPENAI_API_KEY`; the current Next.js app can also use a server-side OpenAI key for dynamic runs.
- Use Tavily skills only after demo mode works and only for real web evidence.
- Use Vercel only after local build verification and only if authentication is already available.
- Commit and push useful checkpoints to GitHub autonomously when the rules in `AGENTS.md` say to do so.

Missing optional integrations are not blockers. Missing the Next.js app runtime is a blocker.

## Build Priorities

### P0: Local Product Flow

Build a polished founder-facing flow first. It must let the user enter a real brief and start the agent sprint from the app.

Required:

- Typed local demo data.
- Sprint simulation from founder input.
- Agent dashboard.
- Evidence ledger.
- Quality gates.
- Red-team memo.
- Blueprint.
- Seven artifact tabs.
- Reset control.

### P1: Server Skeleton

After demo mode works:

- Add a run creation route.
- Keep state local and simple.
- Keep seeded fallback active.
- Do not expose API keys in client code.

### P2: Optional Live Evidence

After local demo and build verification:

- Add server-side Tavily search/evidence if `TAVILY_API_KEY` exists.
- Accept `TAVILY_API` as a local compatibility alias if that is the only variable available.
- Validate all evidence output against the existing data contracts.
- Fall back to seeded demo evidence on any live failure.

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
- Codex Goals through ChatGPT Pro for implementation work.
- Optional server-side Tavily search/evidence provider.

Fallback:

- No standalone fallback bundle is currently shipped. Run the Next.js app for local and deployed usage.

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

Demo mode still works without any keys. Dynamic Preflight runs use the OpenAI API from the Next.js server route, so the key belongs in `.env.local` and is never sent to browser code.

```text
OPENAI_API_KEY=
OPENAI_MODEL=
PREFLIGHT_OPENAI_TIMEOUT_MS=120000
TAVILY_API_KEY=
TAVILY_API=
PREFLIGHT_MODE=auto
```

Rules:

- Put your real OpenAI key in `.env.local` as `OPENAI_API_KEY=...`.
- Do not paste API keys into React components, browser local storage, or committed docs.
- `OPENAI_MODEL` is optional. If omitted, the server tries `gpt-5.4-mini`, then `gpt-4o-mini`.
- `PREFLIGHT_OPENAI_TIMEOUT_MS` is optional. The default is `120000` and values are clamped between `30000` and `180000`.
- `PREFLIGHT_MODE=auto` uses OpenAI when `OPENAI_API_KEY` is available and falls back to demo mode when it is not.
- Use `PREFLIGHT_MODE=demo-only` only when you want to force seeded fallback output.
- Live OpenAI failures no longer auto-render a prefilled completed run. Use `Start Preflight` to retry.
- OpenAI-generated evidence is treated as assumptions unless a verified evidence provider is connected. This avoids presenting model text as sourced research.
- Prefer `TAVILY_API_KEY`; support `TAVILY_API` as a fallback alias because the local credential may be named that way.
- Use Tavily only from server-side code or build-time scripts, never in browser/client code.
- Treat missing Tavily keys as expected, not fatal.
- Keep seeded demo mode available at all times.
- Do not commit real secrets. Use `.env.local` locally and commit only `.env.example`.

## Verification

Run these when available:

```powershell
npm run typecheck
npm run build
npm run dev
```

Manual checks:

- Intake appears first.
- Start sprint works.
- Demo reset works.
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

- the app shell first becomes runnable;
- P0 demo mode passes local verification;
- Codex is about to start risky optional live API/search/deployment work;
- the current Goal is verified; or
- the budget is nearly exhausted and the remote should receive the latest useful state.

If GitHub auth, network, or branch protection blocks a push, Codex must keep working locally and record the exact blocker in `IMPLEMENTATION_LOG.md`.

## Next Best Goals

After the first autonomous build succeeds:

```text
/goal Add optional live Tavily-backed evidence collection to the existing Preflight demo without breaking demo mode. First read AGENTS.md and use Tavily skills when available. Use TAVILY_API_KEY server-side, falling back to TAVILY_API if present, return structured evidence items matching the existing types, keep seeded fallback active when credentials or network are unavailable, and verify one live or fallback evidence run renders fully.
```

Then:

```text
/goal Make Preflight submission-ready by verifying setup from a fresh terminal, documenting env vars and demo mode, adding a 3-minute demo script to README.md, and deploying only if Vercel authentication is already available. First read AGENTS.md and use Browser/Playwright/webapp-testing for verification. Do not break the local demo while attempting deployment.
```
