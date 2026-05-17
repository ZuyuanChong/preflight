# Preflight Ralphthon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` when splitting tasks across agents, or `superpowers:executing-plans` when implementing inline. Steps use checkbox syntax for tracking.

**Goal:** Build **Preflight**, a demo-ready AI Venture Preflight app where a founder enters a startup idea and receives an evidence-backed company blueprint with verdict, market proof, ICP, MVP scope, pricing, GTM plan, red-team critique, quality gates, and founder artifacts.

**Architecture:** Start with one polished Next.js app that can run fully in demo mode without live APIs. Use typed local data and a simulated sprint to guarantee the Ralphthon demo works, then add optional server-side Tavily web-evidence paths only after the app is already demoable. Implementation is performed by Codex Goals through the user's ChatGPT Pro subscription, not by app-side OpenAI API usage.

**Tech Stack:** Next.js App Router, TypeScript, CSS or Tailwind, local typed mock data, optional server-side Tavily search/evidence provider, Vercel deployment if time permits.

---

## Companion Handoff

Use `AGENTS.md` as the mandatory project-level Codex operating manual, `CODEX_HANDOVER.md` as the operator document for the unattended one-hour Codex Goal run, and `RALPH_LOOP_LAUNCH.md` as the human pre-run checklist. This plan defines what to build; `AGENTS.md` defines required skills/plugins, autonomous triggers, fallbacks, and verification gates; the handoff defines how Codex should execute, recover, verify, and summarize the autonomous build.

## Required Autonomous Capabilities

Codex must automatically invoke these capabilities when their trigger conditions appear:

- `superpowers:executing-plans` or `superpowers:subagent-driven-development` for implementation execution.
- `superpowers:systematic-debugging` for build, test, runtime, or rendering failures.
- `superpowers:verification-before-completion` before any completion claim.
- `build-web-apps:frontend-app-builder` for the app UI.
- `build-web-apps:frontend-testing-debugging` for local UI debugging.
- `build-web-apps:react-best-practices` after React/Next.js edits when available.
- Browser plugin first, then Playwright or webapp-testing fallback, for local visual verification.
- Codex Goals through ChatGPT Pro for implementation; do not require `OPENAI_API_KEY` for the primary build.
- Tavily skills only after demo mode works and real web evidence is being added.
- Vercel skills only after local build verification and only if auth is already available.
- Git/GitHub checkpoint pushes when the autonomous publishing rules in `AGENTS.md` are met.

If any optional capability is unavailable, keep demo mode working, record the missing capability in `IMPLEMENTATION_LOG.md`, and continue with the documented fallback. Do not ask the user for runtime clarification during the Ralph loop.

## Source Constraints

- Ralphthon guide: https://ralphthon.team-attention.com/guide
- OpenAI Codex Goals cookbook: https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex

The Ralphthon Singapore guide says Impact projects are judged on business value, UX polish, and whether the demo itself sells the product. It also disqualifies Streamlit apps, basic RAG apps, and projects that do not clearly identify hackathon-built work.

The OpenAI Goals cookbook frames a Goal as a scoped completion contract with a measurable outcome, verification surface, constraints, and evidence-based completion. This plan uses that style so Codex can keep moving for the one-hour autonomous window without waiting for manual steering.

## Positioning

**Category:** AI Venture Preflight.

**One-liner:** Before a founder builds, Preflight runs the idea through an AI venture studio and returns an evidence-backed decision: proceed, pivot, pause, or kill.

**Do say:**
- AI venture preflight for zero-to-one founders.
- Evidence-backed company blueprint before build.
- Founder decision system, not a pitch generator.
- Quality-gated AI output with red-team critique.

**Do not say:**
- Generic idea validator.
- Basic RAG app.
- Streamlit prototype.
- Pitch deck generator.
- Long-term AI cofounder.

## Hackathon Strategy

Target the **Impact** track. Codex Goals and Ralph-loop execution are the build method, not the main product category. Judges should understand the human value in the first 30 seconds: founders waste time building weak ideas; Preflight helps them decide what deserves to exist.

The first hour must produce a reliable, visual, local demo. A simulated sprint with typed evidence is acceptable for the first milestone because the guide rewards a working live demo. Live Tavily search, PPTX export, a custom Codex runner, and generated product deployment are secondary. Do not spend the first hour adding app-side OpenAI API calls; the autonomous implementation agent already runs through Codex Goals using the user's ChatGPT Pro subscription.

## One-Hour Master Goal

Paste this as the primary unattended Codex Goal:

```text
/goal Build a demo-ready Preflight web app in this repository within the current autonomous work window. First read and follow AGENTS.md, PLAN.md, CODEX_HANDOVER.md, and README.md. Invoke the required skills/plugins in AGENTS.md when their trigger conditions appear. The app must let a judge enter a startup idea, run or simulate an AI venture preflight sprint, and show a polished Intake, Live Sprint, Blueprint, Quality Gate, Red Team, Evidence Ledger, and Artifacts experience. Verify by running the local app, checking desktop and mobile layouts with Browser/Playwright/webapp-testing, and running typecheck/build where available. Preserve README.md, PLAN.md, CODEX_HANDOVER.md, and AGENTS.md, document any generated work as hackathon-built, avoid Streamlit/basic RAG framing, and keep demo mode working without API keys. If dependency installation or dev server startup is blocked, create a static fallback demo and document the exact blocker and launch command.
```

Completion is only valid when the evidence exists:
- A local app or static fallback opens successfully.
- The first screen is the usable Preflight intake, not a marketing landing page.
- A complete seeded sprint can be shown without API keys.
- The judge can inspect verdict, scorecard, evidence, quality issues, red-team critique, and artifacts.
- Mobile and desktop layouts do not visibly overlap.
- `README.md` or a new implementation log explains setup, demo mode, and what was built.

## Build Priority

### P0: Demo-Ready Product Surface

Build this before any live AI integration:

- Intake form with fields for idea, customer, geography, and optional business model.
- Simulated venture sprint with visible agent progress.
- Blueprint screen with final verdict, scorecard, ICP, market notes, MVP, pricing, GTM, risks, and next actions.
- Evidence ledger that separates cited claims from assumptions.
- Quality gate panel that catches missing citations, unsupported numbers, generic filler, contradictions, weak assumptions, and overclaims.
- Red-team memo that attacks the idea honestly.
- Artifact tabs for founder memo, market brief, PRD, pitch deck outline, unit economics, GTM plan, and red-team memo.
- Demo reset button with a pre-seeded completed run for reliability.

### P1: Server-Side Orchestration Skeleton

Only after P0 works:

- Add `POST /api/runs` to create a run.
- Add `GET /api/runs/[id]` or equivalent to read the latest run state.
- Keep state local and simple: file JSON, in-memory seed, or local browser state is acceptable for the hackathon.
- Do not require OpenAI API credentials for this stage.
- Return the seeded demo run and show "Demo mode" unless an optional live evidence provider is ready.

### P2: Live Evidence

Only after P0 and P1 work:

- Add Tavily search provider integration if `TAVILY_API_KEY` exists, falling back to `TAVILY_API` if present.
- Store each evidence item with URL, title, summary, confidence, freshness, and related claim.
- Label uncertain findings as assumptions instead of pretending they are sourced.
- If search fails, keep the source-ready interface and seeded citations.

### P3: Deployment and Polish

Only after the app builds locally:

- Deploy to Vercel if authenticated and time remains.
- Add final README setup, env vars, demo script, and screenshots if possible.
- Do not let deployment work break local demo mode.
- Commit and push the verified local demo checkpoint before attempting deployment.

## Product Flow

1. Founder enters idea, target customer, geography, and optional business model.
2. Preflight frames the idea into assumptions and unknowns.
3. Managing Partner dispatches specialist agents.
4. Specialist agents produce findings.
5. Quality Gate flags weak output and unsupported claims.
6. Red Team attacks the venture.
7. Managing Partner synthesizes final verdict: **Proceed**, **Pivot**, **Pause**, or **Kill**.
8. Artifact Producer formats founder-ready outputs.

## Agent Set

- **Managing Partner:** Orchestrates, synthesizes, and decides the final verdict.
- **Framer:** Converts raw idea into structured venture brief and assumptions.
- **Market Scout:** Finds market signals, competitors, substitutes, pricing, and demand evidence.
- **Customer Analyst:** Defines ICP, pains, workflows, objections, and interview questions.
- **Product Architect:** Scopes MVP, user journey, features, and non-goals.
- **Business Modeler:** Models pricing, unit economics, cost drivers, and monetization risk.
- **Growth Strategist:** Creates launch channels, validation experiments, and GTM plan.
- **Red Team Critic:** Attacks assumptions, moat, urgency, willingness to pay, and evidence quality.
- **Artifact Producer:** Formats the final outputs.

## Suggested File Map

If the repo has no app yet, create a minimal app in the repository root. Preserve existing docs.

- `AGENTS.md` - mandatory Codex operating instructions, skill triggers, fallbacks, and verification gates.
- `RALPH_LOOP_LAUNCH.md` - human pre-run checklist and copy-ready Ralph loop Goal prompt.
- `package.json` - scripts for `dev`, `build`, `typecheck`, and dependencies.
- `tsconfig.json` - TypeScript config.
- `next.config.mjs` - Next config if using Next.js.
- `src/app/layout.tsx` - app metadata and global shell.
- `src/app/page.tsx` - main Preflight app flow.
- `src/app/globals.css` - product UI system, responsive layout, and animation.
- `src/types/preflight.ts` - all domain model types.
- `src/data/demo-run.ts` - seeded Preflight demo run.
- `src/lib/quality.ts` - quality gate heuristics.
- `src/lib/artifacts.ts` - artifact generation helpers from a blueprint.
- `src/lib/sprint.ts` - deterministic sprint simulation and status transitions.
- `src/components/IntakePanel.tsx` - startup idea intake.
- `src/components/SprintDashboard.tsx` - live agent statuses, logs, and progress.
- `src/components/BlueprintPanel.tsx` - final verdict and scorecard.
- `src/components/EvidenceLedger.tsx` - citations and assumptions.
- `src/components/QualityGatePanel.tsx` - quality issues and pass/warn/fail state.
- `src/components/ArtifactTabs.tsx` - founder memo, market brief, PRD, deck outline, unit economics, GTM, red team.
- `src/app/api/runs/route.ts` - optional create/list runs route.
- `src/app/api/runs/[id]/route.ts` - optional read run route.
- `IMPLEMENTATION_LOG.md` - created during autonomous build to record what was built, commands run, and blockers.

If Next.js dependency installation fails, create the fallback:

- `static-demo/index.html`
- `static-demo/styles.css`
- `static-demo/app.js`
- `static-demo/README.md`
- `.env.example`
- `.gitignore`

The fallback must still show intake, sprint progress, blueprint, evidence, quality gates, and artifacts.

## Data Contracts

Use simple explicit types so UI, mock mode, and future live mode share one shape.

```ts
export type VerdictDecision = "Proceed" | "Pivot" | "Pause" | "Kill";
export type AgentStatus = "queued" | "running" | "blocked" | "complete" | "failed";
export type EvidenceKind = "source" | "assumption";
export type QualitySeverity = "pass" | "warn" | "fail";

export interface VentureBrief {
  idea: string;
  targetCustomer: string;
  geography: string;
  businessModel?: string;
  problem: string;
  solution: string;
  assumptions: string[];
  unknowns: string[];
}

export interface AgentRun {
  id: string;
  agentName: string;
  role: string;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  logs: string[];
  summary: string;
}

export interface EvidenceItem {
  id: string;
  kind: EvidenceKind;
  claim: string;
  sourceUrl?: string;
  sourceTitle?: string;
  summary: string;
  confidence: "low" | "medium" | "high";
  freshness?: string;
  agentName: string;
}

export interface QualityIssue {
  id: string;
  artifactId: string;
  severity: QualitySeverity;
  type:
    | "missing_citation"
    | "generic_filler"
    | "unsupported_number"
    | "uncertain_competitor"
    | "contradiction"
    | "weak_assumption"
    | "overclaim";
  message: string;
  suggestedFix: string;
}

export interface VentureScorecard {
  pain: number;
  buyerClarity: number;
  timing: number;
  competition: number;
  distribution: number;
  monetization: number;
  feasibility: number;
  evidenceQuality: number;
  redTeamSeverity: number;
}

export interface Artifact {
  id: string;
  type:
    | "founder_memo"
    | "market_brief"
    | "prd"
    | "pitch_deck_outline"
    | "unit_economics"
    | "gtm_plan"
    | "red_team_memo";
  title: string;
  markdown: string;
  citationIds: string[];
  qualityStatus: QualitySeverity;
}

export interface FinalVerdict {
  decision: VerdictDecision;
  rationale: string;
  strongestWedge: string;
  nextActions: string[];
  risks: string[];
}
```

## Quality Gate Rules

Implement deterministic heuristics before model-based critique:

- `missing_citation`: claim mentions market size, competitor, pricing, demand, growth, or willingness to pay without evidence.
- `generic_filler`: output contains vague phrases such as "revolutionize", "seamless experience", "game changer", "leverage AI", or "unlock insights" without specifics.
- `unsupported_number`: output contains a percentage, dollar amount, TAM/SAM/SOM, CAGR, or numeric forecast without citation.
- `uncertain_competitor`: competitor appears without source URL or is marked as "possible".
- `contradiction`: one artifact recommends proceeding while another severe red-team issue says no urgent buyer exists.
- `weak_assumption`: assumption is business-critical and still untested.
- `overclaim`: output says "proven", "guaranteed", "validated", or "will" when evidence only supports "may".

## Visual Direction

Serious SaaS/productivity tool. Avoid a marketing landing page. The first screen should feel like a founder operating console:

- Dense but calm interface.
- White or near-white canvas with restrained dark text.
- One accent color plus semantic warning/success/error colors.
- Compact cards and panels, no oversized hero.
- Agent status rows, score meters, tabs, evidence table, and artifact preview.
- Use icons for status/actions if available; do not add decorative illustrations.
- Buttons and controls must fit on mobile and desktop.

## Demo Script

Use this demo idea:

> A web app where solo founders enter one sentence and an AI venture studio produces an evidence-backed company blueprint.

Three-minute flow:

1. **0:00-0:20:** Open Preflight. Enter the demo idea and start sprint.
2. **0:20-0:50:** Show Managing Partner dispatching specialist agents.
3. **0:50-1:20:** Open evidence ledger and explain sourced claims versus assumptions.
4. **1:20-1:50:** Show quality gate catching unsupported or generic claims.
5. **1:50-2:20:** Show Red Team critique and final verdict.
6. **2:20-2:45:** Open founder memo and pitch deck outline.
7. **2:45-3:00:** Close with: "Preflight does not just help founders pitch. It helps them decide whether the thing deserves to exist."

## Acceptance Checklist

- [ ] The app starts locally or the static fallback opens locally.
- [ ] Intake is the first usable screen.
- [ ] Demo mode works without API keys.
- [ ] A full Preflight run can be completed in under 3 minutes.
- [ ] The Live Sprint screen shows at least 8 agents with sensible status progression.
- [ ] Blueprint includes verdict, scorecard, ICP, market, MVP, pricing, GTM, risks, and next actions.
- [ ] Evidence ledger includes source and assumption rows.
- [ ] Quality Gate shows at least five issue types.
- [ ] Red Team produces specific objections.
- [ ] All seven artifacts render.
- [ ] Desktop and mobile views have no overlapping text or controls.
- [ ] README or implementation log documents setup, demo mode, env vars, and hackathon-built scope.
- [ ] `IMPLEMENTATION_LOG.md` names the skills/plugins used, verification commands run, browser checks performed, fallbacks taken, and any missing optional integrations.
- [ ] Latest useful checkpoint is committed and pushed to `origin`, or the GitHub push blocker is recorded.

## Non-Goals For The First Hour

- Do not build a custom Codex CLI orchestrator before the UI works.
- Do not build generated product deployment as the core demo.
- Do not add authentication.
- Do not add a database.
- Do not add payments.
- Do not build PPTX or PDF export before HTML artifacts work.
- Do not spend the autonomous hour tuning live prompts while the demo surface is unfinished.

## If Time Remains

Run a second Goal:

```text
/goal Add optional live Tavily-backed evidence collection to the existing Preflight demo without breaking demo mode. First read AGENTS.md and use Tavily skills when available. Use TAVILY_API_KEY server-side, falling back to TAVILY_API if present, return structured evidence items matching the existing types, keep seeded fallback active when credentials or network are unavailable, and verify one live or fallback evidence run renders fully.
```

Then run a final reliability Goal:

```text
/goal Make Preflight submission-ready by verifying setup from a fresh terminal, documenting env vars and demo mode, adding a 3-minute demo script to README.md, and deploying only if Vercel authentication is already available. First read AGENTS.md and use Browser/Playwright/webapp-testing for verification. Do not break the local demo while attempting deployment.
```
