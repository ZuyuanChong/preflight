# Codex Handover: Build Preflight Autonomously

This document is the operating handoff for Codex during the one-hour autonomous Ralphthon build window.

## Mission

Build **Preflight**, a demo-ready AI Venture Preflight product for Ralphthon Impact track.

The app must let a judge enter a startup idea and watch an AI venture studio produce a company blueprint: verdict, evidence, ICP, MVP, business model, GTM plan, risks, quality gates, red-team critique, and founder artifacts.

The priority is a working, polished demo. Do not spend the first hour building infrastructure that is invisible in the demo. Implementation runs through Codex Goals using the user's ChatGPT Pro subscription, not app-side OpenAI API usage.

## Read These First

1. `AGENTS.md` for mandatory Codex operating rules, skill/plugin triggers, fallbacks, and verification gates.
2. `PLAN.md` for product scope, data contracts, and acceptance criteria.
3. This file for the one-hour runbook.
4. `README.md` for the public-facing project overview, demo framing, and submission notes.
5. `RALPH_LOOP_LAUNCH.md` for the human pre-run checklist and copy-ready Goal prompt.

## External Constraints

Ralphthon guide: https://ralphthon.team-attention.com/guide

Key constraints to preserve:

- Track: Impact.
- Scoring: live demo, creativity/originality, impact potential.
- Demo: about 3 minutes plus Q&A.
- Public repo required.
- New work only; clearly identify what was built during the hackathon.
- Do not ship banned formats such as Streamlit, basic RAG apps, or generic analyzers.

OpenAI Goals guide: https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex

Use Goals as evidence-checked completion contracts. Do not mark done because the UI "probably works"; mark done only after inspecting files, running commands, and opening or verifying the generated app.

## Exact Goal To Run

Use this as the unattended Goal:

```text
/goal Build a demo-ready Preflight web app in this repository within the current autonomous work window. First read and follow AGENTS.md, PLAN.md, CODEX_HANDOVER.md, and README.md. Invoke the required skills/plugins in AGENTS.md when their trigger conditions appear. The app must let a judge enter a startup idea, run or simulate an AI venture preflight sprint, and show a polished Intake, Live Sprint, Blueprint, Quality Gate, Red Team, Evidence Ledger, and Artifacts experience. Verify by running the local app, checking desktop and mobile layouts with Browser/Playwright/webapp-testing, and running typecheck/build where available. Preserve README.md, PLAN.md, CODEX_HANDOVER.md, and AGENTS.md, document any generated work as hackathon-built, avoid Streamlit/basic RAG framing, and keep demo mode working without API keys. If dependency installation or dev server startup is blocked, create a static fallback demo and document the exact blocker and launch command.
```

## Required Skills And Tools

Follow the trigger matrix in `AGENTS.md`. At minimum:

- Use `superpowers:executing-plans` or `superpowers:subagent-driven-development` for implementation execution.
- Use `build-web-apps:frontend-app-builder` for the UI build.
- Use Browser first, then Playwright or webapp-testing fallback, for visual verification.
- Use `superpowers:systematic-debugging` when commands, rendering, or runtime behavior fail.
- Use `superpowers:verification-before-completion` before marking the Goal complete.
- Do not require `OPENAI_API_KEY` for the primary implementation; Codex Goals is the implementation engine.
- Use Tavily skills only for optional live evidence after demo mode works.
- Prefer `TAVILY_API_KEY`; support `TAVILY_API` as a fallback alias if that is the provided local env var.
- Use Vercel only after local build verification and only if already authenticated.
- Commit and push GitHub checkpoints according to `AGENTS.md` when remote/auth are available.

If a required optional integration is missing, keep demo mode working and log the missing integration in `IMPLEMENTATION_LOG.md`. Do not block the first hour on OpenAI API credentials.

## Autonomous Operating Rules

- Do not wait for user input.
- Preserve `PLAN.md`, `CODEX_HANDOVER.md`, `README.md`, and `AGENTS.md`.
- Create or update `IMPLEMENTATION_LOG.md` as you work.
- Keep changes scoped to building the demo.
- Prefer a deterministic demo over live API fragility.
- Keep mock/demo data clearly labeled as demo data.
- Do not invent fake citations. If a claim is not sourced, label it as an assumption.
- If a command fails because of missing network, auth, or credentials, use the documented fallback and keep moving.
- If the app cannot be built with Next.js, create the static fallback.
- Do not declare completion until verification evidence exists.
- Do not commit real secrets. Use `.env.example` for documented variables and `.env.local` for local credentials.

## One-Hour Execution Plan

### Minute 0-5: Inspect And Choose Path

- Check whether `package.json` exists.
- If no app exists, scaffold a root web app.
- Prefer Next.js + TypeScript if dependencies can install.
- If dependency install fails, immediately switch to `static-demo`.
- Write the chosen path to `IMPLEMENTATION_LOG.md`.

### Minute 5-20: Build Data And Core Screen

- Create domain types.
- Create seeded demo run.
- Build intake screen.
- Build run state that can start, simulate, reset, and complete a sprint.
- Make first screen usable, not a marketing landing page.

### Minute 20-35: Build Demo Experience

- Build Live Sprint dashboard.
- Build agent status list.
- Build evidence ledger.
- Build quality gate panel.
- Build red-team panel.
- Build final verdict and scorecard.

### Minute 35-45: Build Artifacts

- Render seven artifact tabs:
  - Founder Memo
  - Market Brief
  - PRD
  - Pitch Deck Outline
  - Unit Economics
  - GTM Plan
  - Red-Team Memo
- Ensure artifacts share the same verdict and assumptions.
- Ensure artifacts are specific to Preflight, not generic startup advice.

### Minute 45-55: Polish And Responsive Pass

- Fix visual density, spacing, mobile layout, overflow, and unclear copy.
- Add demo mode reset.
- Add setup and demo instructions to README or implementation log.
- Add optional env var notes for future live mode.

### Minute 55-60: Verify And Summarize

Run available checks:

```powershell
npm run typecheck
npm run build
npm run dev
```

If using static fallback, verify by opening:

```powershell
static-demo\index.html
```

Record results in `IMPLEMENTATION_LOG.md`:

- Commands run.
- What passed.
- What failed.
- Local URL or file path.
- Remaining risks.
- Git commit hash and push status when a checkpoint is created.

## Preferred Repository Shape

If building Next.js, create this shape:

```text
preflight/
|-- AGENTS.md
|-- CODEX_HANDOVER.md
|-- IMPLEMENTATION_LOG.md
|-- PLAN.md
|-- README.md
|-- package.json
|-- tsconfig.json
|-- next.config.mjs
`-- src/
    |-- app/
    |   |-- globals.css
    |   |-- layout.tsx
    |   `-- page.tsx
    |-- components/
    |   |-- ArtifactTabs.tsx
    |   |-- BlueprintPanel.tsx
    |   |-- EvidenceLedger.tsx
    |   |-- IntakePanel.tsx
    |   |-- QualityGatePanel.tsx
    |   `-- SprintDashboard.tsx
    |-- data/
    |   `-- demo-run.ts
    |-- lib/
    |   |-- artifacts.ts
    |   |-- quality.ts
    |   `-- sprint.ts
    `-- types/
        `-- preflight.ts
```

If dependency installation fails, create this shape:

```text
preflight/
`-- static-demo/
    |-- README.md
    |-- app.js
    |-- index.html
    `-- styles.css
```

## Implementation Details

### Domain Types

Create these types in `src/types/preflight.ts` for Next.js, or mirror the same shape in static JavaScript.

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

export interface PreflightRun {
  id: string;
  mode: "demo" | "live";
  status: "idle" | "running" | "complete" | "failed";
  brief: VentureBrief;
  agents: AgentRun[];
  evidence: EvidenceItem[];
  qualityIssues: QualityIssue[];
  scorecard: VentureScorecard;
  finalVerdict: {
    decision: VerdictDecision;
    rationale: string;
    strongestWedge: string;
    nextActions: string[];
    risks: string[];
  };
  artifacts: Artifact[];
}
```

### Seeded Demo Brief

Use Preflight itself as the demo:

```text
Idea: A web app where solo founders enter one sentence and an AI venture studio produces an evidence-backed company blueprint.
Target customer: Solo technical founders and indie hackers before they spend a weekend building.
Geography: Global, English-speaking startup communities.
Business model: Freemium with paid deep-dive reports and team workspaces.
```

### Seeded Verdict

Use this final verdict unless the implementation has better generated content:

```text
Decision: Pivot
Rationale: The wedge is strong, but the generic "AI startup advisor" market is crowded. The sharper opportunity is not idea validation; it is a pre-build decision system that makes evidence quality, red-team objections, and artifact consistency visible.
Strongest wedge: A founder can see what would have to be true before investing a weekend in the build.
Next actions:
1. Narrow the initial ICP to solo technical founders doing weekend MVPs.
2. Validate whether founders pay for pre-build decision confidence or only use free tools.
3. Add live evidence collection for market and competitor claims.
4. Turn quality gates into the product's trust layer.
Risks:
1. Founders may prefer speed and optimism over critique.
2. Existing AI research tools can imitate parts of the workflow.
3. Live evidence quality can degrade under search/API failure.
```

### Seeded Evidence

Use real sources already known from this handoff:

```ts
[
  {
    id: "ev-ralphthon-impact",
    kind: "source",
    claim: "Ralphthon Impact projects are evaluated on business value, UX polish, and whether the product is useful enough for real users.",
    sourceUrl: "https://ralphthon.team-attention.com/guide",
    sourceTitle: "Ralphthon Singapore Participant Guide",
    summary: "The guide frames Impact around market value, product polish, and AI serving a human user.",
    confidence: "high",
    freshness: "2026-05-17",
    agentName: "Market Scout"
  },
  {
    id: "ev-codex-goals",
    kind: "source",
    claim: "Codex Goals are useful when a task needs a persistent objective, verification surface, and evidence-based completion.",
    sourceUrl: "https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex",
    sourceTitle: "Using Goals in Codex",
    summary: "OpenAI describes Goals as scoped completion contracts that keep a thread working toward an auditable outcome.",
    confidence: "high",
    freshness: "2026-05-17",
    agentName: "Framer"
  },
  {
    id: "ev-assumption-founder-wtp",
    kind: "assumption",
    claim: "Solo founders may pay for stronger pre-build decision confidence if the report saves a weekend of wasted build time.",
    summary: "This is the riskiest monetization assumption and must be tested with customer interviews.",
    confidence: "medium",
    agentName: "Business Modeler"
  }
]
```

Do not add fake competitor URLs. If competitor research is not live, show competitors as "substitute categories" and label them as assumptions.

### UI Requirements

The app should look like a serious product console:

- First viewport: intake on the left, sprint preview or existing demo run on the right.
- Use compact cards, tables, tabs, status dots, score bars, and artifact preview.
- Avoid a hero page.
- Avoid huge marketing copy.
- Avoid decorative blobs and oversized rounded cards.
- Mobile should stack intake, sprint, blueprint, and artifacts without horizontal scrolling.
- All buttons should have clear state: idle, running, complete, reset.

Suggested visual copy:

```text
Preflight
AI Venture Preflight
Run a founder idea through evidence, critique, and launch planning before you build.

Start preflight
Reset demo
Demo mode
Live sprint
Evidence ledger
Quality gates
Final verdict
Founder artifacts
```

### Sprint Simulation

If no backend exists, simulate the sprint on the client:

- Initial state: all agents queued.
- On submit: set run status to running.
- Every 600-900 ms, mark next agent running, append one log line, then complete the previous agent.
- After the final agent completes, set run status to complete and reveal final verdict.
- Keep a "Skip animation" or "Load completed demo" control for judge reliability.

Suggested agent log lines:

```text
Framer converted raw idea into assumptions and unknowns.
Market Scout separated cited event constraints from unsourced market assumptions.
Customer Analyst narrowed ICP to solo technical founders.
Product Architect cut MVP scope to intake, sprint, evidence, gates, and artifacts.
Business Modeler flagged willingness-to-pay as the highest-risk assumption.
Growth Strategist chose community-led founder workflows as the first channel.
Red Team challenged the generic AI advisor positioning.
Artifact Producer aligned all outputs to the same verdict.
Managing Partner synthesized a Pivot verdict.
```

### Quality Gate Content

Show at least these issue types:

```text
missing_citation: Competitor claim needs a source before it can be treated as market proof.
unsupported_number: Any TAM, CAGR, conversion rate, or revenue forecast must include a citation or be labeled as an assumption.
generic_filler: "AI-powered insights" is too vague; replace with a concrete founder decision.
uncertain_competitor: Substitute products are not direct competitors until sourced and categorized.
weak_assumption: Willingness to pay is business-critical and still untested.
overclaim: "Validated" should become "supported by early evidence" unless customer proof exists.
contradiction: Do not recommend Proceed while severe red-team objections remain unresolved.
```

### Artifact Minimum Content

Each artifact must render as readable Markdown or native sections.

Founder Memo:

```markdown
# Founder Memo

## Decision
Pivot from "AI startup advisor" to "AI Venture Preflight".

## Why
The sharper value is not generating more startup content. It is forcing an evidence-backed decision before a founder spends time building.

## What Must Be True
- Founders feel enough pain from wasted build weekends.
- They trust a report that separates sources from assumptions.
- Red-team critique increases trust instead of reducing motivation.
```

Market Brief:

```markdown
# Market Brief

## Market Thesis
Solo founders already use AI tools for research and drafting, but the unmet need is a disciplined pre-build decision workflow.

## Evidence
- Ralphthon Impact scoring rewards useful, polished AI-native products.
- Codex Goals support evidence-checked autonomous build loops.

## Open Questions
- Which founder segment pays first?
- Are substitutes good enough for one-off validation?
- Does critique improve conversion or scare users away?
```

PRD:

```markdown
# Product Requirements Document

## MVP
- Intake form
- Live sprint dashboard
- Evidence ledger
- Quality gate panel
- Final blueprint
- Artifact tabs

## Non-Goals
- Authentication
- Multi-run collaboration
- PPTX export
- Full web-search automation
```

Pitch Deck Outline:

```markdown
# Pitch Deck Outline

1. Problem: Founders build before they know what must be true.
2. User: Solo technical founder choosing a weekend MVP.
3. Solution: AI Venture Preflight with evidence, critique, and artifacts.
4. Workflow: Intake, agents, evidence, quality gates, verdict, artifacts.
5. Trust: Sources and assumptions are separated.
6. Wedge: Pre-build decision, not post-build pitch polish.
7. Business Model: Freemium plus paid deep reports.
8. Risks: Crowded AI research space and willingness to pay.
9. Roadmap: Live evidence, interview generator, workspace history.
10. Ask: Validate with founders and ship live evidence collection.
```

Unit Economics:

```markdown
# Unit Economics

## Assumptions
- Free demo run uses seeded or lightweight model output.
- Paid report uses deeper model calls and web evidence collection.
- Main cost drivers are model tokens and search calls.

## Pricing Hypothesis
- Free: one demo preflight.
- Paid: $19-49 for a deep-dive report.
- Team: $99/month for saved runs and collaboration.

## Risk
Pricing is unvalidated until founders show willingness to pay.
```

GTM Plan:

```markdown
# GTM Plan

## First Segment
Solo technical founders building weekend MVPs.

## Channels
- Indie hacker communities
- Hackathon builders
- Founder Discords and Slack groups
- Build-in-public posts

## First Experiment
Offer 20 manual Preflight reports and measure whether founders change, pause, or sharpen their build plan.
```

Red-Team Memo:

```markdown
# Red-Team Memo

## Strongest Objection
Founders may want confidence and momentum more than honest critique.

## Competitive Risk
General AI research tools can imitate parts of the workflow unless Preflight owns the quality-gated decision layer.

## Evidence Risk
The product loses trust if it presents assumptions as facts.

## Verdict Pressure
The demo must prove that "Pivot" or "Pause" can feel valuable, not disappointing.
```

## Verification Checklist

Use every available check before declaring the Goal complete.

```powershell
npm run typecheck
npm run build
npm run dev
```

Browser checks:

- Intake visible on first screen.
- Start sprint works.
- Reset demo works.
- Completed demo works without API keys.
- Evidence ledger visibly separates sources from assumptions.
- Quality gate shows warnings/failures.
- Red-team critique is specific.
- All artifact tabs open.
- Mobile width has no horizontal overflow.
- Desktop view has no overlapping cards or clipped text.

If any check cannot run, record why in `IMPLEMENTATION_LOG.md`.

## Stop Conditions

Mark complete only if:

- Working app or static fallback exists.
- Core demo path works end to end.
- Verification evidence is recorded.
- Setup instructions are present.
- Latest useful checkpoint is committed and pushed to `origin` when remote/auth are available, or the push blocker is recorded.

Stop as blocked only if:

- Neither Next.js nor static fallback can be created.
- Filesystem writes are unavailable.
- The repo cannot be inspected or edited.

Budget exhaustion is not completion. On budget limit, summarize:

- What exists.
- How to run it.
- What was verified.
- What remains.

## Optional Live Evidence After Demo Works

If time remains and `TAVILY_API_KEY` or `TAVILY_API` exists:

- Add server-side or build-time Tavily evidence collection.
- Return evidence items matching `EvidenceItem`.
- Validate shape before rendering.
- On any failure, fall back to seeded demo evidence.
- Never expose API keys in client code.

Optional env vars:

```text
TAVILY_API_KEY=
TAVILY_API=
PREFLIGHT_MODE=demo
```

## Final Summary Format

At the end of the autonomous run, write this to `IMPLEMENTATION_LOG.md`:

```markdown
# Implementation Log

## Skills And Tools Used

## What Was Built

## How To Run

## Verification

## Demo Path

## Known Gaps

## GitHub Checkpoint

## Next Best Goal
```

The next best Goal should be one of:

```text
/goal Add optional live Tavily-backed evidence collection to the existing Preflight demo without breaking demo mode. First read AGENTS.md and use Tavily skills when available. Use TAVILY_API_KEY server-side, falling back to TAVILY_API if present, return structured evidence items matching the existing types, keep seeded fallback active when credentials or network are unavailable, and verify one live or fallback evidence run renders fully.
```

or:

```text
/goal Make Preflight submission-ready by verifying setup from a fresh terminal, documenting env vars and demo mode, adding a 3-minute demo script to README.md, and deploying only if Vercel authentication is already available. First read AGENTS.md and use Browser/Playwright/webapp-testing for verification. Do not break the local demo while attempting deployment.
```
