const demoBrief = {
  idea: "A web app where solo founders enter one sentence and an AI venture studio produces an evidence-backed company blueprint.",
  targetCustomer: "Solo technical founders and indie hackers before they spend a weekend building.",
  geography: "Global, English-speaking startup communities.",
  businessModel: "Freemium with paid deep-dive reports and team workspaces.",
  problem: "The founder needs a pre-build read on whether this idea deserves focused build time."
};

const emptyBrief = {
  idea: "",
  targetCustomer: "",
  geography: "",
  businessModel: "",
  problem: "Enter a startup idea to frame the first preflight pass."
};

const verdict = {
  decision: "Pivot",
  rationale:
    "The wedge is strong, but the generic AI startup advisor market is crowded. The sharper opportunity is not idea validation; it is a pre-build decision system that makes evidence quality, red-team objections, and artifact consistency visible.",
  strongestWedge: "A founder can see what would have to be true before investing a weekend in the build.",
  nextActions: [
    "Narrow the initial ICP to solo technical founders doing weekend MVPs.",
    "Validate whether founders pay for pre-build decision confidence or only use free tools.",
    "Add live evidence collection for market and competitor claims.",
    "Turn quality gates into the product's trust layer."
  ],
  risks: [
    "Founders may prefer speed and optimism over critique.",
    "Existing AI research tools can imitate parts of the workflow.",
    "Live evidence quality can degrade under search or API failure."
  ]
};

const scorecard = {
  Pain: 78,
  "Buyer clarity": 72,
  Timing: 76,
  "Competition pressure": 44,
  Distribution: 64,
  Monetization: 48,
  Feasibility: 86,
  "Evidence quality": 62,
  "Red-team severity": 81
};

const scorecardGroups = [
  ["Market signal", "Pain, timing, and competitive pressure", ["Pain", "Timing", "Competition pressure"]],
  ["Customer clarity", "Buyer definition and reachable distribution", ["Buyer clarity", "Distribution"]],
  ["Business risk", "Monetization risk against build feasibility", ["Monetization", "Feasibility"]],
  ["Evidence quality", "Trust level and red-team pressure", ["Evidence quality", "Red-team severity"]]
];

const agentDefinitions = [
  {
    name: "Managing Partner",
    type: "orchestrator",
    role: "Owns dispatch, conflict resolution, and the final verdict.",
    llmProfile: "Orchestration LLM for planning, dispatch, conflict resolution, and final decision control.",
    capabilities: ["run orchestration", "conflict resolution", "decision synthesis"],
    tools: ["Run planner", "Shared memory", "Conflict resolver"],
    summary: "Keep the demo focused on pre-build decision quality rather than broad startup advice.",
    activity: {
      task: "Create the run plan, dispatch bounded agents, and hold final verdict authority.",
      reasoning: ["Split the run into intake, framing, specialist work, review, and finalization.", "Kept the verdict gated by evidence quality."],
      output: "Approved a Pivot decision path with explicit unresolved risks."
    }
  },
  {
    name: "Intake and Clarification",
    type: "intake",
    role: "Converts founder input into a usable venture brief.",
    llmProfile: "Intake LLM for founder intent extraction and clarification checks.",
    capabilities: ["brief parsing", "clarification detection", "preference capture"],
    tools: ["Brief parser", "Clarification scanner", "Shared memory"],
    summary: "The founder brief is complete enough to run without interrupting the demo.",
    activity: {
      task: "Turn raw founder input into a structured venture brief.",
      reasoning: ["Captured idea, ICP, geography, and business model.", "Recorded uncertainty as assumptions instead of invented detail."],
      output: "Created a founder brief for the venture sprint."
    }
  },
  {
    name: "Venture Framer",
    type: "specialist",
    role: "Frames hypotheses, assumptions, unknowns, and specialist questions.",
    llmProfile: "Research-framing LLM for hypotheses, unknowns, and specialist task design.",
    capabilities: ["hypothesis framing", "research synthesis", "assumption mapping"],
    tools: ["Hypothesis mapper", "Shared memory"],
    summary: "The critical unknown is whether founders pay for confidence before they build.",
    activity: {
      task: "Frame hypotheses, unknowns, and specialist questions.",
      reasoning: ["Identified willingness to pay as the first critical assumption.", "Routed different questions to specialist agents."],
      output: "Produced the specialist question set."
    }
  },
  {
    name: "Market Evidence",
    type: "specialist",
    role: "Separates source-backed market claims from assumptions.",
    llmProfile: "Evidence LLM with web-search capability for market signals and source verification.",
    capabilities: ["web search", "source verification", "market evidence review"],
    tools: ["Web search", "Seeded evidence", "Source verifier"],
    summary: "Use sourced hackathon constraints and label competitor categories as assumptions until live search is added.",
    activity: {
      task: "Separate source-backed market evidence from assumptions.",
      reasoning: ["Used seeded verified citations in demo mode.", "Kept live web search as optional server-side capability."],
      output: "Classified 2 sources and 2 assumptions in the evidence ledger."
    }
  },
  {
    name: "Customer and ICP",
    type: "specialist",
    role: "Defines ICP, pains, workflows, objections, and interviews.",
    llmProfile: "Customer-research LLM for ICP definition, buyer workflow, and interviews.",
    capabilities: ["customer research synthesis", "interview planning", "buyer workflow analysis"],
    tools: ["Customer research synthesis", "Interview planner", "Shared memory"],
    summary: "The first ICP is a solo builder deciding whether to spend a weekend on an MVP.",
    activity: {
      task: "Define the first customer segment and discovery plan.",
      reasoning: ["Narrowed the user to founders with a near-term build decision.", "Converted uncertainty into interview questions."],
      output: "Produced ICP, objections, and interview-plan notes."
    }
  },
  {
    name: "Product Strategy",
    type: "specialist",
    role: "Scopes MVP, user journey, features, and non-goals.",
    llmProfile: "Product and technical-analysis LLM for MVP scope and feasibility debugging.",
    capabilities: ["document review", "technical debugging", "MVP scoping"],
    tools: ["PRD reviewer", "Technical feasibility debugger"],
    summary: "Ship the product surface before optional live research or export infrastructure.",
    activity: {
      task: "Review MVP scope and implementation risks.",
      reasoning: ["Kept the product focused on intake, sprint state, evidence, gates, verdict, and artifacts.", "Flagged live search and exports as later infrastructure."],
      output: "Produced MVP scope, non-goals, and feasibility risks."
    }
  },
  {
    name: "Business Modeler",
    type: "specialist",
    role: "Models pricing, unit economics, cost drivers, and monetization risk.",
    llmProfile: "Data-analysis LLM for pricing, unit economics, and sensitivity risk.",
    capabilities: ["data analysis", "pricing sensitivity", "unit economics modeling"],
    tools: ["Unit economics worksheet", "Pricing sensitivity analysis"],
    summary: "Pricing remains a hypothesis until founders prove they pay for pre-build confidence.",
    activity: {
      task: "Analyze pricing, unit economics, and willingness-to-pay risk.",
      reasoning: ["Treated paid reports as hypotheses.", "Flagged unsupported pricing as a blocker."],
      output: "Produced pricing assumptions, cost drivers, and a willingness-to-pay validation need."
    }
  },
  {
    name: "Growth Strategist",
    type: "specialist",
    role: "Creates launch channels, validation experiments, and GTM plan.",
    llmProfile: "Growth-research LLM with optional web search for channels and launch experiments.",
    capabilities: ["web search", "research synthesis", "experiment planning"],
    tools: ["Channel research", "Experiment planner", "Shared memory"],
    summary: "Start with indie hacker and hackathon communities where weekend MVP decisions are frequent.",
    activity: {
      task: "Create channels, first-user actions, and validation experiments.",
      reasoning: ["Matched channels to solo founder communities.", "Mapped risks to experiments that could change the verdict."],
      output: "Produced first-user plan, messaging, experiments, and metrics."
    }
  },
  {
    name: "Red Team Critic",
    type: "review",
    role: "Attacks assumptions, moat, urgency, willingness to pay, and evidence quality.",
    llmProfile: "Adversarial review LLM for contradictions, failure modes, and disproof tests.",
    capabilities: ["contradiction analysis", "risk review", "disproof testing"],
    tools: ["Contradiction scanner", "Disproof test planner", "Source verifier"],
    summary: "Preflight must own quality-gated decisions or substitutes can imitate the workflow.",
    activity: {
      task: "Pressure-test the venture thesis and identify failure modes.",
      reasoning: ["Checked whether the verdict contradicts evidence quality.", "Pressed on substitute risk and willingness to pay."],
      output: "Produced red-team objections and disproof tests."
    }
  },
  {
    name: "Quality Control",
    type: "review",
    role: "Checks accuracy, completeness, consistency, and unsupported claims.",
    llmProfile: "Quality-control LLM for document review, citation audit, and revision requests.",
    capabilities: ["document review", "citation audit", "quality review"],
    tools: ["Citation audit", "Artifact consistency checker", "Report reviewer"],
    summary: "Unsupported pricing and competitor claims stay blocked from Proceed until evidence improves.",
    activity: {
      task: "Review outputs for unsupported claims, contradictions, and usefulness.",
      reasoning: ["Checked assumptions remain labeled.", "Returned revision pressure to monetization and competitor claims."],
      output: "Produced reviewer findings and approval conditions."
    }
  },
  {
    name: "Artifact Producer",
    type: "finalization",
    role: "Formats approved blueprint material into founder artifacts.",
    llmProfile: "Finalization LLM for assembling approved claims into founder-ready documents.",
    capabilities: ["artifact generation", "document review", "citation mapping"],
    tools: ["Document assembler", "Citation audit", "Report reviewer"],
    summary: "Every artifact reinforces Pivot and does not contradict the risk profile.",
    activity: {
      task: "Assemble founder-ready artifacts from approved material only.",
      reasoning: ["Used the approved verdict and evidence IDs as source of truth.", "Kept uncertainty visible in the documents."],
      output: "Produced aligned founder artifacts."
    }
  }
];

const agents = agentDefinitions.map((agent, index) => ({
  id: `agent-${index}`,
  ...agent,
  status: "queued",
  logs: []
}));

const logs = [
  "Managing Partner opened the sprint, assigned agents, and set the decision bar.",
  "Intake and Clarification converted founder input into a complete venture brief.",
  "Venture Framer turned the brief into hypotheses, assumptions, and unknowns.",
  "Market Evidence separated sourced claims from assumptions and evidence gaps.",
  "Customer and ICP narrowed the buyer, workflow, and interview questions.",
  "Product Strategy scoped the MVP, user journey, features, and non-goals.",
  "Business Modeler flagged willingness-to-pay as the highest-risk assumption.",
  "Growth Strategist mapped channels, validation experiments, and first-user actions.",
  "Red Team Critic challenged positioning, urgency, moat, and evidence quality.",
  "Quality Control requested fixes for unsupported pricing and unsourced competitor claims.",
  "Artifact Producer aligned all founder artifacts to the approved verdict."
];

const evidence = [
  {
    kind: "source",
    claim: "Ralphthon Impact projects are evaluated on business value, UX polish, and whether the product is useful enough for real users.",
    title: "Ralphthon Singapore Participant Guide",
    url: "https://ralphthon.team-attention.com/guide",
    summary: "The guide frames Impact around market value, product polish, and AI serving a human user.",
    confidence: "high",
    agent: "Market Evidence"
  },
  {
    kind: "source",
    claim: "Codex Goals are useful when a task needs a persistent objective, verification surface, and evidence-based completion.",
    title: "Using Goals in Codex",
    url: "https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex",
    summary: "OpenAI describes Goals as scoped completion contracts that keep a thread working toward an auditable outcome.",
    confidence: "high",
    agent: "Venture Framer"
  },
  {
    kind: "assumption",
    claim: "Solo founders may pay for stronger pre-build decision confidence if the report saves a weekend of wasted build time.",
    summary: "This is the riskiest monetization assumption and must be tested with customer interviews.",
    confidence: "medium",
    agent: "Business Modeler"
  },
  {
    kind: "assumption",
    claim: "General AI research tools, pitch helpers, and startup templates are substitute categories, not sourced direct competitors in demo mode.",
    summary: "Live evidence mode should replace this with real competitor URLs before submission claims are made.",
    confidence: "medium",
    agent: "Market Evidence"
  }
];

const issues = [
  ["fail", "missing citation", "Competitor and substitute claims need live sources before they can be treated as market proof.", "Keep substitutes labeled as assumptions until a Tavily-backed source is attached."],
  ["fail", "unsupported number", "Paid report pricing and team pricing are hypotheses, not validated revenue evidence.", "Run 10 founder willingness-to-pay interviews before presenting pricing as validated."],
  ["warn", "generic filler", "Phrases like AI-powered insights are too broad unless tied to a concrete founder decision.", "Use decision-language: proceed, pivot, pause, kill, and what must be true."],
  ["warn", "uncertain competitor", "General AI research tools are substitute categories until direct competitors are sourced.", "Categorize as substitutes in demo mode and source exact competitors in live evidence mode."],
  ["fail", "weak assumption", "Willingness to pay is business-critical and still untested.", "Make willingness to pay the first validation experiment after the demo."],
  ["warn", "overclaim", "Avoid words like validated or proven unless customer evidence exists.", "Use supported by early evidence or still an assumption until sourced."],
  ["warn", "contradiction", "A Proceed verdict would contradict the severe willingness-to-pay and evidence-quality risks.", "Keep the verdict at Pivot until customer payment proof and live source coverage improve."]
];

const redTeam = [
  "Founders may want momentum and affirmation more than a blunt critique.",
  "General AI research tools can imitate the workflow unless Preflight owns the quality-gated decision layer.",
  "The willingness-to-pay story is unproven until founders pay for a report before they build.",
  "Evidence trust breaks if assumptions and sourced claims are mixed together.",
  "A Pivot verdict must feel useful enough that the founder still wants the artifact package."
];

const artifactSets = {
  executive: [
    ["Founder Memo", "warn", 2, "# Founder Memo\n\n## Decision\nPivot from generic AI startup advisor toward AI Venture Preflight.\n\n## Rationale\nThe sharper value is forcing an evidence-backed decision before a founder spends time building.\n\n## What Must Be True\n- Founders feel enough pain from wasted build weekends.\n- They trust a report that separates sources from assumptions.\n- Red-team critique increases trust instead of reducing motivation.\n\n## Next Move\nRun 10 founder interviews around whether a pre-build verdict changes behavior."],
    ["Market Brief", "warn", 2, "# Market Brief\n\n## Category\nPre-build venture decision workflow.\n\n## Target Segment\nSolo technical founders and indie hackers before they spend a weekend building.\n\n## Evidence And Assumptions\nSourced claims are limited to linked event and Codex Goals context. Competitor, pricing, and willingness-to-pay claims remain assumptions.\n\n## Validation Priority\nFind whether critique and evidence labels make founders more likely to act."],
    ["PRD", "pass", 0, "# Product Requirements Document\n\n## Personas\n- Solo technical founder deciding whether to build.\n- Reviewer checking whether the verdict is evidence-backed.\n\n## MVP Features\n- Intake form\n- Live sprint dashboard\n- Evidence ledger\n- Quality gate panel\n- Final blueprint\n- Artifact tabs with depth controls\n\n## Non-Goals\n- Authentication\n- Multi-run collaboration\n- PPTX export\n- Full web-search automation"],
    ["Pitch Deck Outline", "warn", 1, "# Pitch Deck Outline\n\n## 10-Slide Summary\n1. Problem: Founders build before they know what must be true.\n2. User: Solo technical founder choosing a weekend MVP.\n3. Solution: AI Venture Preflight with evidence, critique, and artifacts.\n4. Workflow: Intake, agents, evidence, quality gates, verdict, artifacts.\n5. Trust: Sources and assumptions are separated.\n6. Wedge: Pre-build decision, not post-build pitch polish.\n7. Business Model: Freemium plus paid reports.\n8. Risks: Crowded AI research space and willingness to pay.\n9. Roadmap: Live evidence and interview generator.\n10. Ask: Validate with founders and ship live evidence collection."],
    ["Unit Economics", "fail", 1, "# Unit Economics\n\n## Pricing Assumptions\nFree demo run, $19-49 deep report, and $99/month team workspace remain unvalidated hypotheses.\n\n## Cost Drivers\n- Model tokens\n- Search calls\n- Support and evidence review\n\n## Sensitivity Risks\nPricing fails if founders value speed and optimism more than pre-build critique."],
    ["GTM Plan", "warn", 0, "# GTM Plan\n\n## ICP\nSolo technical founders building weekend MVPs.\n\n## Positioning\nBefore you build it, put it through Preflight.\n\n## First 10 Users Plan\nOffer concierge Preflight reports and measure whether founders change, pause, or sharpen their build plan."],
    ["Red-Team Memo", "warn", 1, "# Red-Team Memo\n\n## Strongest Objections\n- Founders may want confidence and momentum more than honest critique.\n- General AI research tools can imitate parts of the workflow.\n\n## Evidence Gaps\n- Willingness to pay is unproven.\n- Direct competitors are not sourced in demo mode.\n\n## Kill Test\nKill or pause if founders will not trade time, money, referrals, or data for the report."]
  ],
  detailed: [
    ["Founder Memo", "warn", 2, `# Founder Memo

## Decision
Pivot from generic AI startup advisor toward AI Venture Preflight.

## Rationale
The wedge is strong, but generic AI advice is crowded. The differentiated product is a pre-build decision system that shows evidence, assumptions, gates, critique, and aligned founder artifacts.

## What Must Be True
- Founders feel enough pain from wasted build weekends.
- They trust a report that separates sources from assumptions.
- Red-team critique increases trust instead of reducing motivation.
- A narrow solo-founder workflow is valuable before broader workspace features.

## Wedge
A founder can see what would have to be true before investing a weekend in the build.

## Risks
- Founders may prefer speed and optimism over critique.
- Existing AI research tools can imitate parts of the workflow.
- Live evidence quality can degrade under search or API failure.
- Pricing remains unvalidated until founders pay for pre-build confidence.

## 7-Day Validation Plan
- Day 1: Rewrite Preflight around one decision: should this weekend build happen?
- Day 2: Recruit 10 solo technical founders with active ideas.
- Day 3: Run five interviews about recent wasted build time.
- Day 4: Deliver two concierge Preflight reports.
- Day 5: Test willingness to pay for a deeper report.
- Day 6: Score behavior change, trust, and artifact usefulness.
- Day 7: Keep Pivot unless founders commit time, money, or warm referrals.

## Interview Questions
- What was the last idea you built before validating demand?
- What made you decide to keep building or stop?
- Which parts of a pre-build report would you trust?
- Would a blunt Pivot verdict help or discourage you?
- What would make this worth paying for before you build?

## Pivot/Kill Triggers
- Pivot if founders want only one artifact or a narrower workflow.
- Pivot if evidence quality matters more than agent theater.
- Kill if founders will not trade time, money, referrals, or data for the report.
- Kill if generic chat tools are already good enough for the target segment.`],
    ["Market Brief", "warn", 2, `# Market Brief

## Category
AI Venture Preflight is founder decision tooling: it helps a builder decide whether to proceed, pivot, pause, or kill before investing build time.

## Target Segment
Solo technical founders and indie hackers in global English-speaking startup communities before they spend a weekend building.

## Substitutes
- Manual research, spreadsheets, notes, and founder instinct.
- Generic AI chat and research tools.
- Startup templates, pitch deck tools, accelerators, and community feedback.
- Consultant or advisor conversations.

## Evidence
- Ralphthon Impact context supports useful, polished AI-native products.
- Codex Goals context supports scoped autonomous work with verification.
- Competitor, pricing, and willingness-to-pay claims are assumptions until live evidence is added.

## Assumptions
- Solo founders value pre-build decision confidence.
- Separating sources from assumptions increases trust.
- Red-team critique makes the report feel more useful.
- A paid deep report can convert from a free demo run.

## Market Risks
- The category can collapse into generic AI advice.
- Founder optimism may beat disciplined critique.
- Search/API failures can weaken trust.
- Substitutes may be good enough for casual validation.

## Validation Plan
- Interview 20 founders with current build decisions.
- Ask what substitute they used before showing Preflight.
- Measure whether the report changes build, pivot, or pause behavior.
- Replace assumptions with sourced evidence before claiming market proof.`],
    ["PRD", "pass", 0, `# Product Requirements Document

## Personas
- Solo technical founder deciding whether to build.
- Skeptical reviewer checking evidence quality.
- Future teammate comparing artifacts against the verdict.

## Workflows
- Intake captures idea, customer, geography, and business model.
- Sprint shows specialist agents and logs.
- Blueprint reveals verdict, scorecard, wedge, risks, and next actions.
- Evidence ledger separates source-backed claims from assumptions.
- Artifacts render executive or detailed founder outputs.

## MVP Features
- Deterministic demo mode.
- Optional server-side live generation.
- Evidence ledger.
- Quality gates.
- Red-team critique.
- Seven artifact tabs.
- Output depth controls.

## Non-Goals
- Browser-side API keys.
- Authentication and billing.
- Database-backed workspaces.
- PPTX/PDF export before HTML artifacts work.

## Acceptance Criteria
- Demo works without API keys.
- Live API failures return deterministic fallback.
- All artifact tabs open in both depth modes.
- Evidence and assumptions remain visually separate.
- Mobile has no horizontal overflow.

## Metrics
- Sprint starts per intake.
- Artifact tabs opened per run.
- Users who can name the riskiest assumption.
- Interviews or validation actions completed within seven days.
- Paid report intent or prepayment.

## Edge Cases
- Missing business model becomes an assumption.
- Invalid source URLs remain assumptions.
- Long artifact text wraps.
- Live API timeout is nonfatal.
- Generic claims trigger quality gates.`],
    ["Pitch Deck Outline", "warn", 1, `# Pitch Deck Outline

### Slide 1: Problem
- Founders build before they know what must be true.
- Wasted weekends create opportunity cost and false momentum.
Speaker notes: Lead with the cost of building too early.

### Slide 2: Target User
- Solo technical founders and indie hackers.
- Trigger: deciding whether a weekend MVP deserves time.
Speaker notes: Keep the first user narrow and reachable.

### Slide 3: Substitutes
- Generic AI chat, manual research, templates, advisors, and community feedback.
- Most substitutes do not quality-gate evidence.
Speaker notes: Treat competitors as substitute categories until sourced.

### Slide 4: Solution
- AI Venture Preflight returns a verdict, evidence ledger, critique, and artifacts.
- It helps decide before the build.
Speaker notes: Do not pitch this as a chatbot.

### Slide 5: Wedge
- Pre-build decision quality, not post-build pitch polish.
- Sources and assumptions stay separate.
Speaker notes: The trust layer is the wedge.

### Slide 6: Workflow
- Intake, sprint, evidence, quality gates, verdict, artifacts.
- Depth controls fit founder and detailed review modes.
Speaker notes: Show the product path in under three minutes.

### Slide 7: Trust
- Quality gates catch unsupported numbers and vague advice.
- Red team makes the output more credible.
Speaker notes: Explain why critique creates confidence.

### Slide 8: Business Model
- Free demo run.
- Paid deep-dive report.
- Team workspace later.
Speaker notes: Pricing remains a hypothesis.

### Slide 9: Risks
- Founders may prefer optimism.
- Generic tools may imitate the workflow.
- Evidence quality can break trust.
Speaker notes: State what could kill the idea.

### Slide 10: Ask
- Interview founders.
- Validate willingness to pay.
- Add live evidence collection.
Speaker notes: End with the next seven days.`],
    ["Unit Economics", "fail", 1, `# Unit Economics

## Pricing Assumptions
- Free: one demo preflight.
- Paid: $19-49 for a deeper evidence-backed report.
- Team: $99/month for saved runs and collaboration.
- Pricing is unvalidated until founders pay before building.

## Cost Drivers
- Model tokens and retries.
- Live search/evidence collection.
- Support for confusing or sensitive claims.
- Artifact export and workspace infrastructure.
- Founder education around evidence quality.

## Simple Scenarios
- Conservative: many free runs, low paid conversion, acceptable only if model cost stays low.
- Base: serious founders buy a paid report after the free verdict changes behavior.
- Upside: repeat builders and teams pay monthly for saved runs.
- Downside: users enjoy free critique but do not pay.

## Sensitivity Risks
- Gross margin falls if live search retries are frequent.
- Conversion falls if founders dislike blunt verdicts.
- Support costs rise if assumptions are mistaken for sourced claims.
- Team pricing fails without repeat usage.`],
    ["GTM Plan", "warn", 0, `# GTM Plan

## ICP
Solo technical founders and indie hackers deciding whether to spend a weekend building.

## Positioning
Before you build it, put it through Preflight: a verdict, evidence ledger, red team, and founder artifacts from one sprint.

## Channels
- Indie hacker communities.
- Hackathon builders.
- Founder Discords and Slack groups.
- Build-in-public teardown posts.
- Accelerator and maker community partners.

## First 10 Users Plan
- Recruit 10 founders with active ideas.
- Run concierge reports manually if needed.
- Ask each user what changed after the verdict.
- Track which artifact they share or ignore.
- Ask for payment, referral, or a second run.

## Experiments
- Blunt Pivot/Pause verdict versus optimistic coaching.
- Evidence labels versus unlabeled advice.
- Founder memo first versus pitch deck first.
- One-time paid report versus subscription waitlist.

## Messaging
- Before you build it, put it through Preflight.
- Know what must be true before the weekend.
- Sources and assumptions stay separate.
- A red team before you spend build time.

## Success Metrics
- 10 qualified runs.
- 7 users open three or more artifacts.
- 5 users name the riskiest assumption.
- 3 users complete a validation action.
- 2 users commit money, referrals, or repeat usage.`],
    ["Red-Team Memo", "warn", 1, `# Red-Team Memo

## Strongest Objections
- Founders may want confidence and momentum more than honest critique.
- General AI research tools can imitate the workflow.
- Willingness to pay is unproven.
- The product loses trust if assumptions look sourced.

## Failure Modes
- Preflight becomes a generic advice generator.
- Artifacts feel polished but do not change behavior.
- Live generation adds confident language without evidence.
- The ICP stays too broad for useful interviews.

## Evidence Gaps
- Direct competitors and substitute pricing need real sources.
- Willingness to pay needs behavior, not opinions.
- The value of a Pivot verdict needs proof.
- Search/API reliability needs stress testing.

## Ways To Disprove The Idea
- Founders cannot recall a painful wasted-build moment.
- Users refuse to trade time, money, referrals, or data for a report.
- Evidence labels do not change trust.
- Generic chat tools are good enough.
- The 7-day validation plan produces no behavior change.`]
  ]
};

let runStatus = "idle";
let currentStep = 0;
let timer = null;
let activeArtifact = 0;
let evidenceFilter = "all";
let artifactDepth = "detailed";
let outputsVisible = false;

const $ = (id) => document.getElementById(id);
const currentEvidence = () => (outputsVisible ? evidence : []);
const currentIssues = () => (outputsVisible ? issues : []);
const currentRedTeam = () => (outputsVisible ? redTeam : []);
const currentArtifacts = () => (outputsVisible ? artifactSets[artifactDepth] : []);

function setFormValues(brief = demoBrief) {
  $("idea").value = brief.idea;
  $("customer").value = brief.targetCustomer;
  $("geography").value = brief.geography;
  $("businessModel").value = brief.businessModel;
  $("briefFraming").textContent = brief.problem;
  updateSummary();
}

function currentBrief() {
  return {
    idea: $("idea").value.trim(),
    targetCustomer: $("customer").value.trim(),
    geography: $("geography").value.trim(),
    businessModel: $("businessModel").value.trim(),
    problem: "The founder needs a pre-build read on whether this idea deserves focused build time."
  };
}

function updateSummary() {
  $("summaryCustomer").textContent = $("customer").value || "Not provided";
  $("summaryBusiness").textContent = $("businessModel").value || "Not provided";
}

function resetAgents() {
  agents.forEach((agent) => {
    agent.status = "queued";
    agent.logs = [];
  });
}

function startAgents() {
  agents.forEach((agent) => {
    agent.status = "starting";
    agent.logs = [];
  });
}

function renderActiveAgent() {
  const activeAgent = agents.find((agent) => agent.status === "running");
  const starting = agents.filter((agent) => agent.status === "starting").length;
  const title = activeAgent
    ? activeAgent.name
    : runStatus === "starting"
      ? "Initializing workspace"
      : runStatus === "complete"
        ? "Sprint complete"
        : "Awaiting dispatch";
  const detail = activeAgent
    ? activeAgent.summary
    : runStatus === "starting"
      ? `${starting || agents.length} specialist agents are starting. Preflight is preparing the workspace before the first active pass.`
      : runStatus === "complete"
        ? "All specialist passes are complete. The blueprint and artifacts are unlocked."
        : "Start the preflight to dispatch the venture studio agents.";

  $("activeAgentCard").innerHTML = `<span>Current mission</span><strong>${title}</strong><p>${detail}</p>`;
}

function agentDescription(agent) {
  if (agent.status === "starting") {
    return "Starting agent workspace and loading role context.";
  }

  return agent.summary;
}

function renderAgents() {
  $("agentList").innerHTML = agents
    .map(
      (agent) => `<article class="agent-row agent-row-${agent.status}">
        <span class="status-dot dot-${agent.status}" aria-hidden="true"></span>
        <div>
          <div class="agent-title"><strong>${agent.name}</strong><span class="role-chip">${agent.status}</span></div>
          <p>${agentDescription(agent)}</p>
        </div>
      </article>`
    )
    .join("");

  const completed = agents.filter((agent) => agent.status === "complete").length;
  const starting = agents.filter((agent) => agent.status === "starting").length;
  const progress = Math.round((completed / agents.length) * 100);
  const displayProgress = runStatus === "starting" ? 12 : progress;
  $("progressLabel").textContent = runStatus === "starting" ? "Initializing workspace" : `${progress}% complete`;
  $("progressAgents").textContent =
    runStatus === "starting"
      ? `${starting || agents.length} agents provisioning. First active pass starts after setup.`
      : `${completed} of ${agents.length} agents finished`;
  $("progressBar").style.width = `${displayProgress}%`;
}

function renderAgentContracts() {
  const labels = {
    orchestrator: "Orchestrator",
    intake: "Intake",
    specialist: "Specialist",
    review: "Review",
    finalization: "Finalization"
  };

  $("agentContracts").innerHTML = Object.keys(labels)
    .map((type) => {
      const groupAgents = agents.filter((agent) => agent.type === type);

      return `<div class="contract-group">
        <span>${labels[type]}</span>
        ${groupAgents
          .map(
            (agent) => `<article>
              <strong>${agent.name}</strong>
              <em>${agent.llmProfile}</em>
              <p>${agent.role}</p>
              <div class="capability-chip-list">${agent.capabilities
                .map((capability) => `<span class="capability-chip">${capability}</span>`)
                .join("")}</div>
              <small>Must not overlap with another agent owner.</small>
            </article>`
          )
          .join("")}
      </div>`;
    })
    .join("");
}

function renderAgentCapabilities() {
  $("agentCapabilityMatrix").innerHTML = agents
    .map(
      (agent) => `<article>
        <div><span>${agent.type}</span><strong>${agent.name}</strong></div>
        <p>${agent.llmProfile}</p>
        <div class="tool-chip-list">${agent.tools.map((toolName) => `<span class="tool-chip">${toolName}</span>`).join("")}</div>
      </article>`
    )
    .join("");
}

function renderAgentActivityLogs() {
  $("agentActivityLogs").innerHTML = agents
    .map(
      (agent) => `<details class="agent-activity-card">
        <summary>
          <span><strong>${agent.name}</strong><small>${agent.llmProfile}</small></span>
          <em>${agent.status === "queued" ? "complete" : agent.status}</em>
        </summary>
        <div class="agent-activity-body">
          <div><span>Task handled</span><p>${agent.activity.task}</p></div>
          <div><span>Tools used</span><div class="tool-chip-list">${agent.tools
            .map((toolName) => `<span class="tool-chip">${toolName}</span>`)
            .join("")}</div></div>
          <div><span>Reasoning summary</span><ul>${agent.activity.reasoning.map((item) => `<li>${item}</li>`).join("")}</ul></div>
          <div><span>Output</span><p>${agent.activity.output}</p></div>
        </div>
      </details>`
    )
    .join("");
}

function renderLogs() {
  const rows = agents.flatMap((agent) => agent.logs.map((log) => `<li><span>${agent.name}</span>${log}</li>`));
  $("logList").innerHTML = rows.length
    ? rows.slice(-6).join("")
    : runStatus === "starting"
      ? "<li>Initializing workspace. Agents are provisioning in the background before the first sprint log lands.</li>"
      : "<li>No sprint logs yet. Start the preflight to dispatch agents.</li>";
}

function renderStatus() {
  const pill = $("runStatus");
  const labels = {
    idle: "Idle",
    starting: "Starting",
    running: "Running",
    complete: "Complete",
    failed: "Needs attention"
  };
  pill.textContent = labels[runStatus] || runStatus;
  pill.className = `status-pill status-${runStatus}`;
  $("sprint").className = `panel sprint-panel sprint-panel-${runStatus}`;
  $("metricVerdict").textContent = runStatus === "complete" ? verdict.decision : "Locked";
  $("metricSources").textContent = currentEvidence().filter((item) => item.kind === "source").length;
  $("metricAssumptions").textContent = currentEvidence().filter((item) => item.kind === "assumption").length;
  $("metricIssues").textContent = currentIssues().length;
  $("blueprintVerdictBadge").textContent = runStatus === "complete" ? verdict.decision : "Locked";
  $("startButton").disabled = runStatus === "running" || runStatus === "starting" || !$("idea").value.trim();
  $("completeButton").disabled = runStatus === "running" || runStatus === "starting";
  $("resetButton").disabled = runStatus === "running" || runStatus === "starting";
}

function applyRailTone(statusId, tone) {
  const status = $(statusId);
  const card = status.closest(".journey-card");
  if (card) {
    card.className = `journey-card journey-card-${tone}`;
  }
}

function renderHeaderRail() {
  const labels = {
    idle: "Idle",
    starting: "Starting",
    running: "Running",
    complete: "Complete",
    failed: "Needs attention"
  };
  const completed = agents.filter((agent) => agent.status === "complete").length;
  const progress = Math.round((completed / agents.length) * 100);
  const visibleEvidence = currentEvidence();
  const visibleIssues = currentIssues();
  const visibleArtifacts = currentArtifacts();
  const sources = visibleEvidence.filter((item) => item.kind === "source").length;
  const assumptions = visibleEvidence.filter((item) => item.kind === "assumption").length;

  $("headerStatus").textContent = labels[runStatus] || runStatus;
  $("headerStatus").className = `status-pill status-${runStatus}`;
  $("headerProgress").textContent = `${completed}/${agents.length} agents`;
  $("headerEvidence").textContent = `${sources} sources`;

  $("railIntakeStatus").textContent = $("idea").value.trim() ? "Ready" : "Needs idea";
  applyRailTone("railIntakeStatus", $("idea").value.trim() ? "ready" : "attention");

  $("railAgentsStatus").textContent = $("agents").open ? "Open" : "Review";
  applyRailTone("railAgentsStatus", $("agents").open ? "active" : "ready");

  $("railSprintCaption").textContent = `${completed}/${agents.length} agents complete`;
  $("railSprintStatus").textContent =
    runStatus === "running" || runStatus === "starting" ? `${progress}%` : labels[runStatus];
  applyRailTone("railSprintStatus", runStatus === "running" || runStatus === "starting" ? "active" : "ready");

  $("railEvidenceCaption").textContent = `${sources} sources / ${assumptions} assumptions`;
  $("railEvidenceStatus").textContent = `${visibleIssues.length} gate issues`;
  applyRailTone("railEvidenceStatus", visibleIssues.length > 0 ? "attention" : "ready");

  $("railBlueprintCaption").textContent = runStatus === "complete" ? verdict.decision : "Verdict locked";
  $("railBlueprintStatus").textContent = runStatus === "complete" ? "Unlocked" : "Locked";
  applyRailTone("railBlueprintStatus", runStatus === "complete" ? "active" : "locked");

  $("railArtifactsStatus").textContent = runStatus === "complete" ? "Ready" : visibleArtifacts.length ? "Preview" : "Locked";
  applyRailTone("railArtifactsStatus", runStatus === "complete" ? "active" : visibleArtifacts.length ? "ready" : "locked");
}

function renderBlueprint() {
  const complete = runStatus === "complete";
  $("lockedState").hidden = complete;
  $("blueprintBody").hidden = !complete;
  if (!complete) return;

  const scoreGroups = scorecardGroups
    .map(
      ([title, signal, keys]) => `<article class="score-group">
        <div class="score-group-heading"><strong>${title}</strong><span>${signal}</span></div>
        <div class="score-grid">${keys
          .map(
            (label) => `<div class="score-row">
              <span>${label}</span>
              <div class="score-bar"><span style="width:${scorecard[label]}%"></span></div>
              <strong>${scorecard[label]}</strong>
            </div>`
          )
          .join("")}</div>
      </article>`
    )
    .join("");

  $("blueprintBody").innerHTML = `
    <div class="verdict-hero">
      <span>Verdict</span>
      <strong>${verdict.decision}</strong>
      <p>${verdict.rationale}</p>
    </div>
    <div class="verdict-insights">
      <div><span>Why not Proceed yet</span><strong>Evidence and willingness-to-pay still need live proof.</strong></div>
      <div><span>Next best action</span><strong>${verdict.nextActions[0]}</strong></div>
    </div>
    <div class="wedge-callout"><span>Strongest wedge</span><strong>${verdict.strongestWedge}</strong></div>
    <div class="scorecard-section" aria-labelledby="scorecard-title">
      <div class="scorecard-heading">
        <h3 id="scorecard-title">Venture scorecard</h3>
        <span>0-100 confidence read</span>
      </div>
      <div class="score-group-grid">${scoreGroups}</div>
    </div>
    <div class="blueprint-columns">
      <div><h3>Next actions</h3><ul>${verdict.nextActions.map((item) => `<li>${item}</li>`).join("")}</ul></div>
      <div><h3>Risks</h3><ul>${verdict.risks.map((item) => `<li>${item}</li>`).join("")}</ul></div>
    </div>`;
}

function renderEvidence() {
  const visibleEvidence = currentEvidence();
  const sourceCount = visibleEvidence.filter((item) => item.kind === "source").length;
  const assumptionCount = visibleEvidence.filter((item) => item.kind === "assumption").length;
  const needsValidationCount = visibleEvidence.filter((item) => !item.url).length;
  const filters = [
    ["all", `All ${visibleEvidence.length}`],
    ["source", `Sources ${sourceCount}`],
    ["assumption", `Assumptions ${assumptionCount}`],
    ["needs-validation", `Needs validation ${needsValidationCount}`]
  ];
  const filteredEvidence = visibleEvidence.filter((item) => {
    if (evidenceFilter === "all") return true;
    if (evidenceFilter === "needs-validation") return !item.url;
    return item.kind === evidenceFilter;
  });

  $("evidenceFilters").innerHTML = filters
    .map(([id, label]) => `<button class="${evidenceFilter === id ? "active" : ""}" data-evidence-filter="${id}">${label}</button>`)
    .join("");

  $("evidenceTable").innerHTML = filteredEvidence.length
    ? filteredEvidence
      .map(
        (item) => `<article class="evidence-row">
        <div>
          <span class="kind-chip kind-${item.kind}">${item.kind}</span>
          <strong>${item.claim}</strong>
          <p>${item.summary}</p>
        </div>
        <div class="evidence-meta">
          <span>${item.agent}</span>
          <span>Confidence: ${item.confidence}</span>
          ${item.url ? `<a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a>` : "<span>Needs validation</span>"}
        </div>
      </article>`
      )
      .join("")
    : `<div class="locked-state">
        <strong>No evidence recorded</strong>
        <p>Start a preflight or load the completed demo to populate source-backed claims and assumptions.</p>
      </div>`;

  document.querySelectorAll("[data-evidence-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      evidenceFilter = button.getAttribute("data-evidence-filter");
      renderEvidence();
    });
  });
}

function renderIssues() {
  const visibleIssues = currentIssues();
  const failCount = visibleIssues.filter(([severity]) => severity === "fail").length;
  const warnCount = visibleIssues.filter(([severity]) => severity === "warn").length;
  $("qualitySummary").textContent = visibleIssues.length ? `${failCount} fail / ${warnCount} warn` : "Not run";
  $("qualityBlocker").innerHTML = `<span>Trust layer</span><strong>${
    visibleIssues.length
      ? failCount > 0
        ? "Blocks Proceed until proof improves"
        : "Proceed allowed by current checks"
      : "Awaiting sprint output"
  }</strong><p>${
    visibleIssues.length
      ? "Preflight marks weak claims before they become founder decisions."
      : "Quality gates appear after a preflight run creates claims to review."
  }</p>`;

  $("issueList").innerHTML = visibleIssues.length
    ? visibleIssues
      .map(
        ([severity, type, message, fix]) => `<article class="issue-card severity-${severity}">
        <div><span>${type}</span><strong>${message}</strong></div>
        <em>${severity === "fail" ? "Blocks Proceed" : "Review before claim"}</em>
        <p>${fix}</p>
      </article>`
      )
      .join("")
    : `<div class="locked-state">
        <strong>No quality issues recorded</strong>
        <p>Run Preflight to generate claims, checks, and suggested fixes.</p>
      </div>`;
}

function renderRedTeam() {
  const visibleRedTeam = currentRedTeam();
  $("redTeamIntro").textContent = visibleRedTeam.length
    ? `Red Team is intentionally specific to ${$("idea").value}. The purpose is to raise trust by showing what could break.`
    : "Red Team critique appears after a completed preflight run.";
  $("redTeamList").innerHTML = visibleRedTeam.length
    ? visibleRedTeam.map((item) => `<li>${item}</li>`).join("")
    : `<li class="locked-state">
        <strong>No critique recorded</strong>
        <p>Start a sprint or load the completed demo to reveal the pressure test.</p>
      </li>`;
}

function renderMarkdown(markdown) {
  return markdown
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return `<h3>${line.slice(2)}</h3>`;
      if (line.startsWith("## ")) return `<h4>${line.slice(3)}</h4>`;
      if (line.startsWith("### ")) return `<h5>${line.slice(4)}</h5>`;
      if (line.startsWith("- ") || /^\d+\./.test(line)) return `<li>${line.replace("- ", "")}</li>`;
      if (!line.trim()) return '<span class="markdown-space"></span>';
      return `<p>${line}</p>`;
    })
    .join("");
}

function renderArtifacts() {
  const artifacts = currentArtifacts();
  $("depthToggle").innerHTML = [
    ["executive", "Executive Summary"],
    ["detailed", "Detailed Report"]
  ]
    .map(
      ([value, label]) => `<button class="${artifactDepth === value ? "active" : ""}" type="button" data-depth="${value}">${label}</button>`
    )
    .join("");

  $("artifactTabs").innerHTML = artifacts
    .map(
      ([title], index) => `<button class="${index === activeArtifact ? "active" : ""}" role="tab" aria-selected="${index === activeArtifact}" data-artifact="${index}">${title}</button>`
    )
    .join("");

  if (!artifacts.length) {
    $("artifactMeta").innerHTML = "";
    $("artifactBody").innerHTML = `<div class="locked-state">
      <strong>No founder artifacts generated</strong>
      <p>Run Preflight or load the completed demo to unlock the artifact packet.</p>
    </div>`;
    return;
  }

  const [title, status, citations, markdown] = artifacts[activeArtifact];
  $("artifactMeta").innerHTML = `<span class="severity-dot severity-${status}"></span> Quality: ${status}<span>${citations} linked evidence item(s)</span>`;
  $("artifactBody").innerHTML = renderMarkdown(markdown);

  document.querySelectorAll("[data-artifact]").forEach((button) => {
    button.addEventListener("click", () => {
      activeArtifact = Number(button.getAttribute("data-artifact"));
      renderArtifacts();
    });
  });
  document.querySelectorAll("[data-depth]").forEach((button) => {
    button.addEventListener("click", () => {
      artifactDepth = button.getAttribute("data-depth");
      renderArtifacts();
    });
  });
}

function renderAll() {
  updateSummary();
  renderStatus();
  renderHeaderRail();
  renderActiveAgent();
  renderAgents();
  renderAgentContracts();
  renderAgentCapabilities();
  renderAgentActivityLogs();
  renderLogs();
  renderBlueprint();
  renderEvidence();
  renderIssues();
  renderRedTeam();
  renderArtifacts();
}

function completeRun() {
  if (!$("idea").value.trim()) {
    setFormValues(demoBrief);
  }
  outputsVisible = true;
  runStatus = "complete";
  agents.forEach((agent, index) => {
    agent.status = "complete";
    agent.logs = [logs[index]];
  });
  renderAll();
}

function stepSprint() {
  if (currentStep >= agents.length) {
    completeRun();
    return;
  }

  agents.forEach((agent, index) => {
    if (index < currentStep) agent.status = "complete";
    if (index === currentStep) {
      agent.status = "running";
      agent.logs = [logs[index]];
    }
    if (index > currentStep) agent.status = "queued";
  });

  renderAll();
  currentStep += 1;
  timer = window.setTimeout(stepSprint, 680);
}

function startSprint() {
  window.clearTimeout(timer);
  outputsVisible = true;
  resetAgents();
  startAgents();
  runStatus = "starting";
  currentStep = 0;
  renderAll();
  timer = window.setTimeout(() => {
    runStatus = "running";
    stepSprint();
  }, 520);
}

function resetDemo() {
  window.clearTimeout(timer);
  runStatus = "idle";
  currentStep = 0;
  activeArtifact = 0;
  evidenceFilter = "all";
  outputsVisible = false;
  resetAgents();
  setFormValues(emptyBrief);
  renderAll();
}

$("startButton").addEventListener("click", startSprint);
$("completeButton").addEventListener("click", completeRun);
$("resetButton").addEventListener("click", resetDemo);
document.querySelectorAll(".section-rail [data-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-target");
    if (!targetId) return;

    if (button.hasAttribute("data-open-agents")) {
      $("agents").open = true;
    }

    window.history.replaceState(null, "", `#${targetId}`);
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    renderHeaderRail();
  });
});
$("agents").addEventListener("toggle", renderHeaderRail);
["idea", "customer", "geography", "businessModel"].forEach((id) => {
  $(id).addEventListener("input", () => {
    $("briefFraming").textContent = currentBrief().problem;
    renderStatus();
    renderHeaderRail();
    updateSummary();
    renderRedTeam();
  });
});

setFormValues();

const params = new URLSearchParams(window.location.search);
if (params.get("completed") === "1") {
  completeRun();
} else if (params.get("autostart") === "1") {
  startSprint();
} else {
  renderAll();
}
