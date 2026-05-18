import type { Artifact, ArtifactDepth, FinalVerdict, VentureBrief } from "@/types/preflight";

const defaultCitationIds = ["ev-ralphthon-impact", "ev-codex-goals"];

interface BuildArtifactsOptions {
  depth?: ArtifactDepth;
}

interface ArtifactContext {
  subject: string;
  customer: string;
  geography: string;
  businessModel: string;
  problem: string;
  solution: string;
  assumptions: string[];
  unknowns: string[];
  nextActions: string[];
  risks: string[];
  evidenceLine: string;
}

export function buildArtifacts(
  brief: VentureBrief,
  verdict: FinalVerdict,
  citationIds = defaultCitationIds,
  options: BuildArtifactsOptions = {}
): Artifact[] {
  const depth = options.depth ?? "detailed";
  const context = buildArtifactContext(brief, verdict, citationIds);
  const markdown =
    depth === "executive"
      ? buildExecutiveMarkdown(context, verdict)
      : buildDetailedMarkdown(context, verdict);

  return [
    {
      id: "artifact-founder-memo",
      type: "founder_memo",
      title: "Founder Memo",
      qualityStatus: "warn",
      citationIds: citationIds.slice(0, 2),
      markdown: markdown.founderMemo
    },
    {
      id: "artifact-market-brief",
      type: "market_brief",
      title: "Market Brief",
      qualityStatus: "warn",
      citationIds: citationIds.slice(0, 3),
      markdown: markdown.marketBrief
    },
    {
      id: "artifact-prd",
      type: "prd",
      title: "Product Requirements Document",
      qualityStatus: "pass",
      citationIds: [],
      markdown: markdown.prd
    },
    {
      id: "artifact-pitch-deck",
      type: "pitch_deck_outline",
      title: "Pitch Deck Outline",
      qualityStatus: "warn",
      citationIds: citationIds.slice(0, 2),
      markdown: markdown.pitchDeck
    },
    {
      id: "artifact-unit-economics",
      type: "unit_economics",
      title: "Unit Economics",
      qualityStatus: "fail",
      citationIds: citationIds.slice(0, 2),
      markdown: markdown.unitEconomics
    },
    {
      id: "artifact-gtm",
      type: "gtm_plan",
      title: "GTM Plan",
      qualityStatus: "warn",
      citationIds: citationIds.slice(0, 2),
      markdown: markdown.gtmPlan
    },
    {
      id: "artifact-red-team",
      type: "red_team_memo",
      title: "Red-Team Memo",
      qualityStatus: "warn",
      citationIds: citationIds.slice(0, 2),
      markdown: markdown.redTeamMemo
    }
  ];
}

function buildArtifactContext(brief: VentureBrief, verdict: FinalVerdict, citationIds: string[]): ArtifactContext {
  const subject = cleanText(brief.idea, "the venture");
  const customer = cleanText(brief.targetCustomer, "the target customer");
  const geography = cleanText(brief.geography, "the initial market");
  const businessModel = cleanText(brief.businessModel, "a pricing model still to be tested");
  const problem = cleanText(brief.problem, `${customer} have an unresolved workflow or budget pain.`);
  const solution = cleanText(brief.solution, `A focused product concept that tests whether ${subject} deserves build time.`);
  const assumptions = ensureList(brief.assumptions, [
    `${customer} feel this problem often enough to change behavior.`,
    "The buyer has budget or authority for the proposed solution.",
    "The MVP can prove value before expensive infrastructure or integrations.",
    "Evidence quality will matter enough to change founder behavior."
  ]);
  const unknowns = ensureList(brief.unknowns, [
    "Which buyer segment has the most urgent trigger?",
    "Which substitute is currently used when the pain appears?",
    "What evidence proves willingness to pay?",
    "Which channel can repeatedly reach the first users?"
  ]);

  return {
    subject,
    customer,
    geography,
    businessModel,
    problem,
    solution,
    assumptions,
    unknowns,
    nextActions: ensureList(verdict.nextActions, [
      "Interview five target buyers about the urgent trigger.",
      "Identify the strongest current substitute.",
      "Run one no-code or concierge validation experiment.",
      "Define the metric that would move the verdict."
    ]),
    risks: ensureList(verdict.risks, [
      "Demand may be weaker than expected.",
      "The buyer may not control budget.",
      "The MVP may not prove willingness to pay.",
      "A substitute may already solve the workflow well enough."
    ]),
    evidenceLine: citationIds.length
      ? `Source-backed claims are linked to ${citationIds.join(", ")}. Any claim without a linked evidence id remains an assumption.`
      : "No source-backed evidence is attached yet. Treat market, competitor, pricing, and demand claims as assumptions."
  };
}

function buildExecutiveMarkdown(context: ArtifactContext, verdict: FinalVerdict) {
  return {
    founderMemo: `# Founder Memo

## Decision
${verdict.decision}: pursue ${context.subject} only through the narrow wedge below.

## Rationale
${verdict.rationale}

## What Must Be True
${bullets(context.assumptions.slice(0, 3))}

## Next Move
${context.nextActions[0]}`,
    marketBrief: `# Market Brief

## Category
Pre-build venture decision workflow for ${context.customer}.

## Target Segment
${context.customer} in ${context.geography}.

## Evidence And Assumptions
${context.evidenceLine}

## Validation Priority
${context.unknowns[0]}`,
    prd: `# Product Requirements Document

## Personas
- Primary: ${context.customer}.
- Secondary: a founder reviewing whether the idea deserves a build sprint.

## MVP Features
- Intake that captures idea, customer, geography, and business model.
- Blueprint with verdict, evidence, gates, risks, and next actions.
- Artifact tabs that stay consistent with the verdict.

## Non-Goals
- Authentication, team workspaces, exports, and unsourced market sizing.`,
    pitchDeck: `# Pitch Deck Outline

## 10-Slide Summary
1. Problem: ${context.problem}
2. Customer: ${context.customer}
3. Solution: ${context.solution}
4. Wedge: ${verdict.strongestWedge}
5. Evidence: ${context.evidenceLine}
6. Product: focused MVP around the first painful workflow.
7. Business model: ${context.businessModel}
8. GTM: reach the first 10 users through founder-led validation.
9. Risks: ${context.risks[0]}
10. Ask: access to target buyers and proof strong enough to change the verdict.`,
    unitEconomics: `# Unit Economics

## Pricing Assumptions
${context.businessModel}

## Cost Drivers
- Model, search, support, onboarding, and evidence review costs.

## Sensitivity Risks
${bullets(context.risks.slice(0, 3))}`,
    gtmPlan: `# GTM Plan

## ICP
${context.customer}

## Positioning
${context.subject} helps the founder decide what must be true before investing build time.

## First 10 Users Plan
${context.nextActions[0]}`,
    redTeamMemo: `# Red-Team Memo

## Strongest Objections
${bullets(context.risks.slice(0, 3))}

## Evidence Gaps
${bullets(context.unknowns.slice(0, 3))}

## Kill Test
If the buyer will not commit time, data, or budget to the first validation step, the idea should move toward Pause or Kill.`
  };
}

function buildDetailedMarkdown(context: ArtifactContext, verdict: FinalVerdict) {
  return {
    founderMemo: `# Founder Memo

## Decision
${verdict.decision}: ${context.subject}

## Rationale
${verdict.rationale}

## What Must Be True
${bullets(context.assumptions.slice(0, 4))}

## Wedge
${verdict.strongestWedge}

## Risks
${bullets(context.risks.slice(0, 4))}

## 7-Day Validation Plan
- Day 1: Rewrite the idea as one painful decision for ${context.customer}: ${context.problem}
- Day 2: Recruit 5-7 buyers in ${context.geography} who recently faced that decision.
- Day 3: Run interviews around the current substitute, budget owner, urgency, and evidence needed.
- Day 4: Show a concierge version of the output and ask what would make it worth paying for.
- Day 5: Test the strongest pricing objection against ${context.businessModel}.
- Day 6: Score each response against willingness to pay, urgency, and substitute pain.
- Day 7: Update the verdict only if buyer behavior changes, not because the story sounds better.

## Interview Questions
- What happened the last time this problem appeared, and what did it cost in time, money, or risk?
- Which substitute did you use: manual process, spreadsheet, consultant, internal tool, or another product?
- Who owns budget or approval for solving this workflow?
- What evidence would make you trust this output enough to act on it?
- Would you prepay, pilot, or introduce another buyer if the MVP solved only this wedge?

## Pivot/Kill Triggers
- Pivot if buyers like the concept but repeatedly name a narrower workflow than the current product scope.
- Pivot if the budget owner is different from the daily user.
- Kill if buyers will not spend time reviewing a concierge output.
- Kill if the strongest substitute is already good enough and switching urgency is low.`,
    marketBrief: `# Market Brief

## Category
${context.subject} sits in the category of founder decision tooling: tools that help a builder decide whether to proceed, pivot, pause, or kill before investing build time.

## Target Segment
The initial segment is ${context.customer} in ${context.geography}. They should have a recent trigger, a visible current substitute, and enough authority to act on a recommendation.

## Substitutes
- Manual research, spreadsheets, notes, and founder instinct.
- General AI chat or research tools that produce advice without a quality gate.
- Templates, accelerators, consultants, or community feedback loops.
- Internal workflows already trusted by the buyer.

## Evidence
- ${context.evidenceLine}
- Sourced claims can support category, timing, or workflow constraints.
- Unsourced competitor, pricing, market size, and willingness-to-pay claims stay in the assumption ledger.

## Assumptions
${bullets(context.assumptions.slice(0, 4))}

## Market Risks
${bullets(context.risks.slice(0, 4))}

## Validation Plan
- Identify 20 potential buyers who match the target segment and have faced the problem in the last 30 days.
- Ask each buyer to name the substitute they used before showing the solution.
- Treat willingness to pay as unproven until the buyer commits money, a pilot, data, or a warm referral.
- Replace every assumption in this brief with a source, interview quote, or negative finding before moving to Proceed.`,
    prd: `# Product Requirements Document

## Personas
- Primary user: ${context.customer}, trying to decide whether the problem deserves immediate build or budget.
- Economic buyer: the person who can approve ${context.businessModel}.
- Skeptical reviewer: a partner, teammate, or advisor checking whether the evidence supports the verdict.

## Workflows
- Intake: capture the idea, customer, geography, business model, problem, and current assumptions.
- Sprint: simulate or generate specialist findings while keeping sources separate from assumptions.
- Decision: show verdict, scorecard, wedge, risks, and next actions only after the sprint completes.
- Artifact review: open each artifact and verify it uses the same verdict, ICP, assumptions, and risks.

## MVP Features
- Structured intake with sensible founder defaults.
- Live sprint status with specialist summaries and log lines.
- Evidence ledger that separates sourced claims from assumptions.
- Quality gates for missing citations, generic filler, unsupported numbers, contradictions, weak assumptions, and overclaims.
- Founder artifacts with executive and detailed depth controls.
- Deterministic fallback data when live generation fails.

## Non-Goals
- Client-side API keys or browser-side model calls.
- Full CRM, saved workspaces, authentication, billing, export automation, or database persistence.
- Market sizing, revenue forecasts, or competitor claims presented as facts without evidence.

## Acceptance Criteria
- A founder can start from the intake and reach all seven artifacts without an API key.
- Live generation runs only from the server and returns to deterministic fallback on failure.
- Each artifact includes concrete sections and does not contradict the final verdict.
- The evidence ledger visibly labels source-backed claims and assumptions.
- Mobile layout has no horizontal overflow and all artifact controls remain usable.

## Metrics
- Activation: percent of users who start a sprint after entering a brief.
- Artifact engagement: number of artifact tabs opened per run.
- Trust: percent of users who can identify which claims are assumptions.
- Validation conversion: percent of users who run the 7-day plan or book interviews.
- Revenue signal: percent who prepay or request a deeper report.

## Edge Cases
- Empty or vague idea should still generate a conservative brief and ask for sharper input.
- Missing business model should label pricing as an assumption, not a proven plan.
- Live API timeout should show fallback output and a nonfatal warning.
- Evidence without a valid URL should be treated as an assumption.
- Long artifact text should wrap without clipping controls on mobile.`,
    pitchDeck: `# Pitch Deck Outline

### Slide 1: Problem
- ${context.customer} face a decision before they commit build time or budget.
- The current process is often informal, optimistic, and weak on evidence.
- Bad decisions waste a weekend, delay sharper ideas, or create products nobody pays for.
Speaker notes: Open with the cost of building before the founder knows what must be true.

### Slide 2: Target User
- Initial ICP: ${context.customer}.
- Geography: ${context.geography}.
- Trigger: they are about to spend time, money, or credibility on a new build.
Speaker notes: Keep the buyer narrow enough that the validation plan can reach them this week.

### Slide 3: Current Substitutes
- Manual research, spreadsheets, advisors, generic AI chat, and community feedback.
- Substitutes may be fast, but they often mix sourced claims and assumptions.
- The key gap is not more text; it is decision-quality structure.
Speaker notes: Name substitutes as categories unless sourced competitor evidence exists.

### Slide 4: Solution
- ${context.solution}
- The product returns a verdict, evidence ledger, quality gates, red-team critique, and artifacts.
- The founder sees what should change before building.
Speaker notes: Position this as a pre-build decision system, not generic startup coaching.

### Slide 5: Wedge
- ${verdict.strongestWedge}
- Start with one workflow and one buyer segment.
- Win trust by making assumptions visible instead of hiding them.
Speaker notes: Explain why the wedge is narrow enough to validate quickly.

### Slide 6: Product Workflow
- Intake captures idea, customer, geography, and business model.
- Specialist agents produce market, customer, product, business, GTM, and red-team findings.
- Artifact tabs turn the same blueprint into founder-ready deliverables.
Speaker notes: Show the workflow as a quality-gated sprint with consistent outputs.

### Slide 7: Evidence And Trust
- ${context.evidenceLine}
- Quality gates flag unsupported numbers, missing citations, generic filler, and overclaims.
- Red-team objections make the output more credible.
Speaker notes: The trust layer is the product, not a side panel.

### Slide 8: Business Model
- Hypothesis: ${context.businessModel}.
- Free or lightweight runs can create activation.
- Paid deep reports, team workspaces, or evidence-backed exports can monetize serious users.
Speaker notes: Be explicit that pricing is a hypothesis until buyers commit budget.

### Slide 9: Risks And Kill Criteria
${bullets(context.risks.slice(0, 3))}
- The idea should not move to Proceed until the riskiest assumptions are tested.
Speaker notes: A credible deck should make failure conditions visible.

### Slide 10: Ask And Next Step
${bullets(context.nextActions.slice(0, 3))}
- Ask for access to target buyers, distribution channels, or validation partners.
Speaker notes: End with the next seven days, not a vague roadmap.`,
    unitEconomics: `# Unit Economics

## Pricing Assumptions
- Current hypothesis: ${context.businessModel}.
- A free or low-friction run should qualify users before a paid deep report.
- Paid conversion depends on whether ${context.customer} believe the output saves time, risk, or wasted build spend.
- Team or workspace pricing should wait until repeated usage is observed.

## Cost Drivers
- Model tokens for generating the sprint and artifact source blueprint.
- Search or evidence collection calls when live research is connected.
- Human review or support if the product enters sensitive decision categories.
- Onboarding, customer education, and artifact export infrastructure.
- Liability controls when users could misread assumptions as facts.

## Simple Scenarios
- Conservative: 100 free runs create 5 paid reports at a low one-time price; viability depends on low model and support cost.
- Base: 20 percent of serious users buy a deeper report after seeing sourced claims and red-team critique.
- Upside: repeat founders or small teams pay monthly for saved runs, history, and collaboration.
- Downside: users consume the free report but do not value pre-build critique enough to pay.

## Sensitivity Risks
${bullets(context.risks.slice(0, 4))}
- Gross margin is most sensitive to live evidence cost, model retries, and support burden.
- Conversion is most sensitive to whether the report changes a real build decision.`,
    gtmPlan: `# GTM Plan

## ICP
${context.customer} in ${context.geography}, especially users with a current build decision and a painful substitute.

## Positioning
${context.subject} is the pre-build decision layer: it helps the founder decide what must be true, what evidence exists, what remains an assumption, and what would change the verdict.

## Channels
- Direct founder outreach tied to the current substitute workflow.
- Indie hacker, hackathon, and builder communities where weekend MVP decisions are common.
- Partner channels with accelerators, founder groups, or technical communities.
- Build-in-public teardown posts showing a real idea moving from generic to decision-ready.

## First 10 Users Plan
- Recruit 10 users from the target segment who are considering a build in the next two weeks.
- Run a concierge Preflight for each idea and record whether the verdict changes behavior.
- Ask every user to identify the most useful artifact and the least trusted claim.
- Convert at least three users into a paid or committed follow-up before scaling channels.

## Experiments
- Test whether a blunt Pivot/Pause verdict increases trust or reduces motivation.
- Test whether evidence labels improve willingness to share the report with a cofounder or advisor.
- Test whether the 7-day validation plan leads to interviews, payment, or abandonment.
- Test one pricing page against a manual invoice for a deeper report.

## Messaging
- "Before you build it, put it through Preflight."
- "Know what must be true before you spend the weekend."
- "A verdict, evidence ledger, red team, and founder artifacts from one sprint."
- "Sources and assumptions stay separate."

## Success Metrics
- 10 qualified users complete a run.
- 7 users open at least three artifacts.
- 5 users can name the riskiest assumption after reading.
- 3 users complete a validation action within seven days.
- 2 users commit money, referrals, or repeat usage for a deeper report.`,
    redTeamMemo: `# Red-Team Memo

## Strongest Objections
${bullets(context.risks.slice(0, 4))}
- ${context.customer} may prefer fast optimistic advice over a product that challenges the idea.
- A polished artifact pack may create false confidence if source coverage is weak.

## Failure Modes
- The product becomes a generic advice generator instead of a decision system.
- Users skim artifacts but do not run validation, so the output feels like content rather than action.
- Live generation produces confident language while evidence remains thin.
- The first ICP is too broad, making interviews and channel tests noisy.

## Evidence Gaps
${bullets(context.unknowns.slice(0, 4))}
- Direct competitor names, pricing, and market-size claims need real URLs before they become sourced evidence.
- Willingness to pay is unproven until buyers commit budget or meaningful time.

## Ways To Disprove The Idea
- Interview ${context.customer} and find they do not remember a recent painful trigger.
- Offer the concierge report and see users refuse to trade time, data, referrals, or money.
- Show the evidence ledger and find users do not value source/assumption separation.
- Test the narrow wedge against substitutes and find the substitute is already good enough.
- Run the 7-day plan and see no change in user behavior, urgency, or payment intent.`
  };
}

function cleanText(value: string | undefined, fallback: string): string {
  const text = value?.trim();
  return text ? text : fallback;
}

function ensureList(value: string[], fallback: string[]): string[] {
  const items = value.map((item) => item.trim()).filter(Boolean);
  return items.length ? items : fallback;
}

function bullets(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}
