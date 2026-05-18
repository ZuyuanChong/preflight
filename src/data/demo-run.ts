import { buildArtifacts } from "@/lib/artifacts";
import { buildAgentRunsFromContracts, buildMultiAgentSystem } from "@/lib/multi-agent";
import { demoQualityIssues } from "@/lib/quality";
import type { EvidenceItem, FinalVerdict, PreflightRun, VentureBrief, VentureScorecard } from "@/types/preflight";

export const demoBrief: VentureBrief = {
  idea: "A web app where solo founders enter one sentence and an AI venture studio produces an evidence-backed company blueprint.",
  targetCustomer: "Solo technical founders and indie hackers before they spend a weekend building.",
  geography: "Global, English-speaking startup communities.",
  businessModel: "Freemium with paid deep-dive reports and team workspaces.",
  problem: "Founders often build before they know what must be true for the idea to deserve a prototype.",
  solution: "Run the idea through a venture studio workflow that returns verdict, evidence, critique, and consistent artifacts.",
  assumptions: [
    "Solo technical founders value decision confidence before a build weekend.",
    "A visible evidence ledger increases trust in AI-generated venture advice.",
    "Red-team critique makes the product feel more useful, not discouraging."
  ],
  unknowns: [
    "Which founder segment pays first?",
    "How much live web evidence is required before the report feels credible?",
    "Whether founders prefer a blunt Pivot/Pause verdict over optimistic coaching."
  ]
};

export const demoVerdict: FinalVerdict = {
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

export const demoAgents = buildAgentRunsFromContracts({
  "Managing Partner": "Keep the run focused on pre-build decision quality rather than broad startup advice.",
  "Intake and Clarification": "The founder brief is complete enough to run without interrupting the sprint.",
  "Venture Framer": "The critical unknown is whether founders pay for confidence before they build.",
  "Market Evidence": "Use sourced hackathon constraints and label competitor categories as assumptions until live search is added.",
  "Customer and ICP": "The first ICP is a solo builder deciding whether to spend a weekend on an MVP.",
  "Product Strategy": "Ship the product surface before optional live research or export infrastructure.",
  "Business Modeler": "Pricing remains a hypothesis until founders prove they pay for pre-build confidence.",
  "Growth Strategist": "Start with indie hacker and hackathon communities where weekend MVP decisions are frequent.",
  "Red Team Critic": "Preflight must own quality-gated decisions or substitutes can imitate the workflow.",
  "Quality Control": "Unsupported pricing and competitor claims stay blocked from Proceed until evidence improves.",
  "Artifact Producer": "Every artifact reinforces Pivot and does not contradict the risk profile."
});

export const demoEvidence: EvidenceItem[] = [
  {
    id: "ev-ralphthon-impact",
    kind: "source",
    claim: "Ralphthon Impact projects are evaluated on business value, UX polish, and whether the product is useful enough for real users.",
    sourceUrl: "https://ralphthon.team-attention.com/guide",
    sourceTitle: "Ralphthon Singapore Participant Guide",
    summary: "The guide frames Impact around market value, product polish, and AI serving a human user.",
    confidence: "high",
    freshness: "2026-05-17",
    agentName: "Market Evidence"
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
    agentName: "Venture Framer"
  },
  {
    id: "ev-assumption-founder-wtp",
    kind: "assumption",
    claim: "Solo founders may pay for stronger pre-build decision confidence if the report saves a weekend of wasted build time.",
    summary: "This is the riskiest monetization assumption and must be tested with customer interviews.",
    confidence: "medium",
    agentName: "Business Modeler"
  },
  {
    id: "ev-assumption-substitutes",
    kind: "assumption",
    claim: "General AI research tools, pitch helpers, and startup templates are substitute categories until exact competitors are sourced.",
    summary: "Live evidence mode should replace this with real competitor URLs before submission claims are made.",
    confidence: "medium",
    agentName: "Market Evidence"
  }
];

export const demoScorecard: VentureScorecard = {
  pain: 78,
  buyerClarity: 72,
  timing: 76,
  competition: 44,
  distribution: 64,
  monetization: 48,
  feasibility: 86,
  evidenceQuality: 62,
  redTeamSeverity: 81
};

export const demoRedTeamObjections = [
  "Founders may want momentum and affirmation more than a blunt critique.",
  "General AI research tools can imitate the workflow unless Preflight owns the quality-gated decision layer.",
  "The willingness-to-pay story is unproven until founders pay for a report before they build.",
  "Evidence trust breaks if assumptions and sourced claims are mixed together.",
  "A Pivot verdict must feel useful enough that the founder still wants the artifact package."
];

export const demoMultiAgentSystem = buildMultiAgentSystem({
  brief: demoBrief,
  mode: "demo",
  evidence: demoEvidence,
  qualityIssues: demoQualityIssues,
  verdict: demoVerdict,
  redTeamObjections: demoRedTeamObjections
});

export const demoRun: PreflightRun = {
  id: "demo-preflight-001",
  mode: "demo",
  status: "complete",
  brief: demoBrief,
  agents: demoAgents,
  multiAgentSystem: demoMultiAgentSystem,
  evidence: demoEvidence,
  qualityIssues: demoQualityIssues,
  scorecard: demoScorecard,
  finalVerdict: demoVerdict,
  redTeamObjections: demoRedTeamObjections,
  artifacts: buildArtifacts(demoBrief, demoVerdict)
};
