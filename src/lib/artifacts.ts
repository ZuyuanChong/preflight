import type { Artifact, FinalVerdict, VentureBrief } from "@/types/preflight";

const defaultCitationIds = ["ev-ralphthon-impact", "ev-codex-goals"];

export function buildArtifacts(brief: VentureBrief, verdict: FinalVerdict, citationIds = defaultCitationIds): Artifact[] {
  const subject = brief.idea || "the venture";
  const customer = brief.targetCustomer || "the target customer";
  const geography = brief.geography || "the initial market";
  const businessModel = brief.businessModel || "a pricing model still to be tested";
  const assumptions = brief.assumptions.length
    ? brief.assumptions
    : ["The target customer has an urgent pain.", "The proposed solution can win against current substitutes."];
  const unknowns = brief.unknowns.length
    ? brief.unknowns
    : ["Who pays first?", "Which acquisition channel proves repeatable?"];

  return [
    {
      id: "artifact-founder-memo",
      type: "founder_memo",
      title: "Founder Memo",
      qualityStatus: "warn",
      citationIds: citationIds.slice(0, 2),
      markdown: `# Founder Memo

## Decision
${verdict.decision}: ${subject}

## Why
${verdict.rationale}

## Strongest Wedge
${verdict.strongestWedge}

## What Must Be True
- ${assumptions[0]}
- ${assumptions[1] ?? `${customer} can reach value quickly enough to justify switching.`}
- ${assumptions[2] ?? "The first MVP can produce a clear buying or usage signal."}

## Immediate Move
Focus the next validation step on ${customer} in ${geography}, not on broad feature expansion.`
    },
    {
      id: "artifact-market-brief",
      type: "market_brief",
      title: "Market Brief",
      qualityStatus: "warn",
      citationIds: citationIds.slice(0, 3),
      markdown: `# Market Brief

## Market Thesis
${customer} may have enough pain to consider ${subject}, but the market proof depends on whether the problem is urgent, budgeted, and currently handled by weak substitutes.

## Geography
${geography}

## Business Model Hypothesis
${businessModel}

## Evidence Status
Treat uncited claims as assumptions until live source collection or customer interviews validate them.

## Open Questions
- ${unknowns[0]}
- ${unknowns[1] ?? "Which substitute is painful enough to displace?"}
- ${unknowns[2] ?? "What proof would justify a Proceed verdict?"}`
    },
    {
      id: "artifact-prd",
      type: "prd",
      title: "Product Requirements Document",
      qualityStatus: "pass",
      citationIds: [],
      markdown: `# Product Requirements Document

## MVP
- Capture the core ${customer} workflow.
- Solve one narrow pain before adding adjacent features.
- Show the buyer exactly what changed, saved, or improved.
- Track assumptions separately from sourced evidence.
- Make the first success metric visible inside the product.

## Non-Goals
- Broad platform scope.
- Enterprise admin surfaces.
- Multi-segment positioning.
- Revenue forecasts without proof.

## Demo Success
The founder can explain who the first buyer is, why the pain is urgent, what the MVP proves, and what would change the verdict.`
    },
    {
      id: "artifact-pitch-deck",
      type: "pitch_deck_outline",
      title: "Pitch Deck Outline",
      qualityStatus: "warn",
      citationIds: citationIds.slice(0, 2),
      markdown: `# Pitch Deck Outline

1. Problem: ${customer} face a painful workflow or decision gap.
2. Current Substitute: What they use today and why it is not good enough.
3. Solution: ${subject}.
4. Wedge: ${verdict.strongestWedge}
5. Buyer: The first narrow segment in ${geography}.
6. Product: MVP scope and one measurable outcome.
7. Business Model: ${businessModel}.
8. Risks: ${verdict.risks[0] ?? "Evidence and willingness to pay remain unproven."}
9. Validation: The next experiment that changes the verdict.
10. Ask: Customer access, proof points, or distribution support.`
    },
    {
      id: "artifact-unit-economics",
      type: "unit_economics",
      title: "Unit Economics",
      qualityStatus: "fail",
      citationIds: citationIds.slice(0, 2),
      markdown: `# Unit Economics

## Assumptions
- The buyer is reachable without expensive sales cycles.
- The product can deliver enough repeat value to support ${businessModel}.
- Service, support, model, data, and onboarding costs stay below gross margin targets.

## Pricing Hypothesis
${businessModel}

## Risk
Pricing is unvalidated until ${customer} commit budget, time, or repeated usage.`
    },
    {
      id: "artifact-gtm",
      type: "gtm_plan",
      title: "GTM Plan",
      qualityStatus: "warn",
      citationIds: [],
      markdown: `# GTM Plan

## First Segment
${customer}

## Channels
- Existing communities or trade groups in ${geography}.
- Direct outreach to buyers with the clearest pain trigger.
- Partner channels already trusted by the buyer.
- Founder-led demos tied to the current substitute workflow.

## First Experiment
Run 10-20 buyer conversations or concierge trials and measure whether the verdict should move from ${verdict.decision} to Proceed, Pivot, Pause, or Kill.`
    },
    {
      id: "artifact-red-team",
      type: "red_team_memo",
      title: "Red-Team Memo",
      qualityStatus: "warn",
      citationIds: citationIds.slice(0, 2),
      markdown: `# Red-Team Memo

## Strongest Objection
${verdict.risks[0] ?? `${customer} may not feel enough urgency to switch.`}

## Competitive Risk
The strongest competitor may be the buyer's current manual process, spreadsheet, services vendor, or internal workaround.

## Evidence Risk
The product loses trust if assumptions are presented as sourced market proof.

## Verdict Pressure
The next experiment must produce evidence strong enough to defend or change the ${verdict.decision} verdict.`
    }
  ];
}
