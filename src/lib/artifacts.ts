import type { Artifact, FinalVerdict, VentureBrief } from "@/types/preflight";

export function buildArtifacts(brief: VentureBrief, verdict: FinalVerdict): Artifact[] {
  const subject = brief.idea || "the venture";
  const customer = brief.targetCustomer || "the target customer";

  return [
    {
      id: "artifact-founder-memo",
      type: "founder_memo",
      title: "Founder Memo",
      qualityStatus: "warn",
      citationIds: ["ev-ralphthon-impact", "ev-codex-goals"],
      markdown: `# Founder Memo

## Decision
${verdict.decision} from a generic AI startup advisor toward AI Venture Preflight.

## Why
${verdict.rationale}

## What Must Be True
- ${customer} feel enough pain from wasted build weekends.
- They trust a report that separates sources from assumptions.
- Red-team critique increases decision confidence instead of reducing motivation.

## Immediate Move
Use ${subject} as a sharp pre-build decision workflow, not a broad pitch generator.`
    },
    {
      id: "artifact-market-brief",
      type: "market_brief",
      title: "Market Brief",
      qualityStatus: "warn",
      citationIds: ["ev-ralphthon-impact", "ev-codex-goals"],
      markdown: `# Market Brief

## Market Thesis
Solo founders already use AI tools for research and drafting, but the unmet need is a disciplined pre-build decision workflow.

## Evidence
- Ralphthon Impact scoring rewards useful, polished AI-native products.
- Codex Goals support evidence-checked autonomous build loops.

## Open Questions
- Which founder segment pays first?
- Are substitute research tools good enough for one-off validation?
- Does critique improve conversion or scare users away?`
    },
    {
      id: "artifact-prd",
      type: "prd",
      title: "Product Requirements Document",
      qualityStatus: "pass",
      citationIds: [],
      markdown: `# Product Requirements Document

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

## Demo Success
A judge can enter an idea, run the sprint, and inspect verdict, evidence, gates, critique, and artifacts without API keys.`
    },
    {
      id: "artifact-pitch-deck",
      type: "pitch_deck_outline",
      title: "Pitch Deck Outline",
      qualityStatus: "warn",
      citationIds: ["ev-ralphthon-impact"],
      markdown: `# Pitch Deck Outline

1. Problem: Founders build before they know what must be true.
2. User: Solo technical founder choosing a weekend MVP.
3. Solution: AI Venture Preflight with evidence, critique, and artifacts.
4. Workflow: Intake, agents, evidence, quality gates, verdict, artifacts.
5. Trust: Sources and assumptions are separated.
6. Wedge: Pre-build decision, not post-build pitch polish.
7. Business Model: Freemium plus paid deep reports.
8. Risks: Crowded AI research space and willingness to pay.
9. Roadmap: Live evidence, interview generator, workspace history.
10. Ask: Validate with founders and ship live evidence collection.`
    },
    {
      id: "artifact-unit-economics",
      type: "unit_economics",
      title: "Unit Economics",
      qualityStatus: "fail",
      citationIds: ["ev-assumption-founder-wtp"],
      markdown: `# Unit Economics

## Assumptions
- Free demo run uses seeded or lightweight model output.
- Paid report uses deeper model calls and web evidence collection.
- Main cost drivers are model tokens and search calls.

## Pricing Hypothesis
- Free: one demo preflight.
- Paid: $19-49 for a deep-dive report.
- Team: $99/month for saved runs and collaboration.

## Risk
Pricing is unvalidated until founders show willingness to pay.`
    },
    {
      id: "artifact-gtm",
      type: "gtm_plan",
      title: "GTM Plan",
      qualityStatus: "warn",
      citationIds: [],
      markdown: `# GTM Plan

## First Segment
Solo technical founders building weekend MVPs.

## Channels
- Indie hacker communities
- Hackathon builders
- Founder Discords and Slack groups
- Build-in-public posts

## First Experiment
Offer 20 manual Preflight reports and measure whether founders change, pause, or sharpen their build plan.`
    },
    {
      id: "artifact-red-team",
      type: "red_team_memo",
      title: "Red-Team Memo",
      qualityStatus: "warn",
      citationIds: ["ev-assumption-founder-wtp"],
      markdown: `# Red-Team Memo

## Strongest Objection
Founders may want confidence and momentum more than honest critique.

## Competitive Risk
General AI research tools can imitate parts of the workflow unless Preflight owns the quality-gated decision layer.

## Evidence Risk
The product loses trust if it presents assumptions as facts.

## Verdict Pressure
The demo must prove that Pivot or Pause can feel valuable, not disappointing.`
    }
  ];
}
