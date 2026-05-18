import type {
  AgentActivityLog,
  AgentContract,
  AgentRun,
  AgentTool,
  EvidenceItem,
  FinalVerdict,
  MultiAgentSystem,
  PreflightRun,
  QualityIssue,
  VentureBrief
} from "@/types/preflight";

function tool(
  id: string,
  label: string,
  category: AgentTool["category"],
  purpose: string,
  availability: AgentTool["availability"] = "always"
): AgentTool {
  return { id, label, category, purpose, availability };
}

const TOOLS = {
  runPlanner: tool("run-planner", "Run planner", "orchestration", "Breaks the founder request into ordered agent work."),
  sharedMemory: tool("shared-memory", "Shared memory", "memory", "Stores assumptions, preferences, decisions, and reviewer state."),
  conflictResolver: tool("conflict-resolver", "Conflict resolver", "orchestration", "Compares agent outputs and records the resolution path."),
  briefParser: tool("brief-parser", "Brief parser", "research_synthesis", "Extracts idea, customer, market, business model, assumptions, and unknowns."),
  clarificationScanner: tool("clarification-scanner", "Clarification scanner", "quality_review", "Identifies missing inputs that would block a useful run."),
  hypothesisMapper: tool("hypothesis-mapper", "Hypothesis mapper", "research_synthesis", "Turns a brief into testable assumptions and specialist questions."),
  webSearch: tool("web-search", "Web search", "web_search", "Finds external sources, market signals, substitutes, and competitor context.", "optional_live"),
  seededEvidence: tool("seeded-evidence", "Seeded evidence", "web_search", "Uses verified source citations when live search is unavailable.", "demo_seeded"),
  sourceVerifier: tool("source-verifier", "Source verifier", "quality_review", "Keeps URL-backed claims separate from assumptions."),
  customerResearch: tool("customer-research", "Customer research synthesis", "research_synthesis", "Synthesizes ICP, pain, buying trigger, and interview questions."),
  interviewPlanner: tool("interview-planner", "Interview planner", "research_synthesis", "Produces customer-discovery questions and validation prompts."),
  prdReviewer: tool("prd-reviewer", "PRD reviewer", "document_review", "Checks MVP scope, workflows, acceptance criteria, and non-goals."),
  feasibilityDebugger: tool("feasibility-debugger", "Technical feasibility debugger", "technical_debugging", "Flags UX, implementation, and run reliability risks."),
  unitEconomics: tool("unit-economics-sheet", "Unit economics worksheet", "data_analysis", "Models pricing assumptions, cost drivers, and sensitivity risk."),
  pricingSensitivity: tool("pricing-sensitivity", "Pricing sensitivity analysis", "data_analysis", "Stress-tests monetization claims and unsupported numbers."),
  channelResearch: tool("channel-research", "Channel research", "web_search", "Checks channel/substitute context when live search is available.", "optional_live"),
  experimentPlanner: tool("experiment-planner", "Experiment planner", "research_synthesis", "Turns risks into validation experiments and first-user actions."),
  contradictionScanner: tool("contradiction-scanner", "Contradiction scanner", "quality_review", "Finds conflicts between evidence, claims, verdict, and artifacts."),
  disproofPlanner: tool("disproof-planner", "Disproof test planner", "research_synthesis", "Creates kill tests and red-team objections."),
  citationAudit: tool("citation-audit", "Citation audit", "document_review", "Checks that artifact claims map back to evidence IDs."),
  artifactConsistency: tool("artifact-consistency", "Artifact consistency checker", "quality_review", "Verifies that all outputs share one verdict and risk posture."),
  documentAssembler: tool("document-assembler", "Document assembler", "artifact_generation", "Formats approved blueprint material into founder artifacts."),
  reportReviewer: tool("report-reviewer", "Report reviewer", "document_review", "Checks final reports for clarity, uncertainty, and source labeling.")
};

export const AGENT_CONTRACTS: AgentContract[] = [
  {
    id: "agent-managing-partner",
    agentName: "Managing Partner",
    agentType: "orchestrator",
    llmProfile: "Orchestration LLM focused on planning, dispatch, conflict resolution, and final decision control.",
    purpose: "Own the full Preflight workflow, dispatch specialists, resolve conflicts, and approve the final verdict.",
    capabilities: ["run orchestration", "conflict resolution", "decision synthesis", "shared memory control"],
    tools: [TOOLS.runPlanner, TOOLS.sharedMemory, TOOLS.conflictResolver],
    coreResponsibilities: [
      "Interpret the founder request and decide the run plan.",
      "Assign work to specialist, review, and finalization agents.",
      "Maintain the canonical run state, assumption register, evidence ledger, and decision log.",
      "Resolve conflicts using evidence strength, specificity, and founder usefulness.",
      "Approve Proceed, Pivot, Pause, or Kill only after review feedback is handled."
    ],
    inputs: ["Founder request", "Structured venture brief", "Specialist outputs", "Evidence ledger", "QC findings"],
    outputs: ["Run plan", "Agent assignments", "Conflict resolutions", "Final verdict", "Approved blueprint"],
    toolsOrDataSources: ["Shared run memory", "Evidence ledger", "Quality gates", "Decision log"],
    mustNotDo: [
      "Invent market proof.",
      "Hide specialist disagreement.",
      "Override a reviewer without recording the reason."
    ],
    handoffConditions: [
      "Send raw input to Intake and Clarification before any specialist work.",
      "Send framed hypotheses to all specialists after the Venture Framer completes.",
      "Send the merged thesis to Red Team and Quality Control before finalization."
    ],
    successCriteria: [
      "Every required agent has a clear output.",
      "Contradictions are resolved or disclosed.",
      "The final verdict matches the evidence and red-team pressure."
    ]
  },
  {
    id: "agent-intake",
    agentName: "Intake and Clarification",
    agentType: "intake",
    llmProfile: "Intake LLM focused on extracting founder intent, preserving constraints, and deciding whether clarification is required.",
    purpose: "Convert the founder's raw idea into a usable venture brief without evaluating the business.",
    capabilities: ["brief parsing", "clarification detection", "user preference capture"],
    tools: [TOOLS.briefParser, TOOLS.clarificationScanner, TOOLS.sharedMemory],
    coreResponsibilities: [
      "Extract idea, target customer, geography, business model, problem, and solution.",
      "Identify missing critical details.",
      "Decide whether to ask one clarification question or proceed with recorded assumptions.",
      "Preserve user preferences and constraints."
    ],
    inputs: ["Founder text", "Form fields", "Known run constraints"],
    outputs: ["Structured venture brief", "Clarification need", "User preference notes"],
    toolsOrDataSources: ["Venture brief schema", "User preference memory"],
    mustNotDo: ["Score the business.", "Create the final strategy.", "Add fake customer detail."],
    handoffConditions: [
      "Pass to Venture Framer when the brief has a concrete idea and at least an inferred customer.",
      "Escalate to Managing Partner if the idea or user objective is missing."
    ],
    successCriteria: [
      "The venture brief is specific enough for specialists.",
      "Missing details are either clarified or written to the assumption register."
    ]
  },
  {
    id: "agent-framer",
    agentName: "Venture Framer",
    agentType: "specialist",
    llmProfile: "Research-framing LLM focused on hypotheses, unknowns, assumption registers, and specialist task design.",
    purpose: "Turn the venture brief into hypotheses, assumptions, unknowns, and evaluation criteria.",
    capabilities: ["hypothesis framing", "research synthesis", "assumption mapping"],
    tools: [TOOLS.hypothesisMapper, TOOLS.sharedMemory],
    coreResponsibilities: [
      "Identify the problem, solution, critical assumptions, and unknowns.",
      "Define the questions each specialist must answer.",
      "Mark business-critical assumptions before analysis begins."
    ],
    inputs: ["Structured venture brief", "User preference notes"],
    outputs: ["Framing memo", "Assumption register", "Specialist question set"],
    toolsOrDataSources: ["Shared assumption register", "Decision criteria"],
    mustNotDo: ["Invent evidence.", "Choose the final verdict.", "Write founder artifacts."],
    handoffConditions: ["Pass framed hypotheses to all specialist agents."],
    successCriteria: [
      "Every specialist receives a clear task.",
      "Critical assumptions and unknowns are visible before synthesis."
    ]
  },
  {
    id: "agent-market",
    agentName: "Market Evidence",
    agentType: "specialist",
    llmProfile: "Evidence LLM with web-search capability for market signals, source verification, and assumption labeling.",
    purpose: "Separate sourced market claims from assumptions and evidence gaps.",
    capabilities: ["web search", "source verification", "market evidence review", "competitor/substitute mapping"],
    tools: [TOOLS.webSearch, TOOLS.seededEvidence, TOOLS.sourceVerifier],
    coreResponsibilities: [
      "Collect or label market signals, substitutes, competitor categories, and demand claims.",
      "Attach URLs only when the source is known to be real.",
      "Mark unsourced market, pricing, and competitor claims as assumptions."
    ],
    inputs: ["Venture brief", "Framing memo", "Allowed source list"],
    outputs: ["Evidence ledger entries", "Market risk notes", "Competitor or substitute labels"],
    toolsOrDataSources: ["Seeded evidence", "Tavily or web search when available", "Evidence validation rules"],
    mustNotDo: ["Invent citations.", "Treat generated text as sourced research.", "Decide the final verdict."],
    handoffConditions: ["Pass the evidence ledger to Customer, Business/GTM, Red Team, and Quality Control."],
    successCriteria: ["Every market claim is either sourced or clearly labeled as an assumption."]
  },
  {
    id: "agent-customer",
    agentName: "Customer and ICP",
    agentType: "specialist",
    llmProfile: "Customer-research LLM focused on ICP definition, pain analysis, buyer workflow, and interview design.",
    purpose: "Define the target customer, painful workflow, buying trigger, objections, and interview plan.",
    capabilities: ["customer research synthesis", "interview planning", "buyer workflow analysis"],
    tools: [TOOLS.customerResearch, TOOLS.interviewPlanner, TOOLS.sharedMemory],
    coreResponsibilities: [
      "Narrow the ICP to a testable segment.",
      "Describe pain intensity, workflow, buyer, objections, and validation questions.",
      "Flag whether the customer has budget or authority."
    ],
    inputs: ["Venture brief", "Framing memo", "Evidence ledger"],
    outputs: ["ICP analysis", "Pain map", "Objection list", "Interview plan"],
    toolsOrDataSources: ["Customer research template", "Assumption register"],
    mustNotDo: ["Own pricing strategy.", "Write the GTM plan.", "Declare willingness to pay proven."],
    handoffConditions: ["Pass customer findings to Product Strategy and Business/GTM agents."],
    successCriteria: ["The ICP is narrow, testable, and tied to concrete buyer behavior."]
  },
  {
    id: "agent-product",
    agentName: "Product Strategy",
    agentType: "specialist",
    llmProfile: "Product and technical-analysis LLM focused on MVP scope, PRD quality, and feasibility debugging.",
    purpose: "Define the MVP, user journey, feature priorities, non-goals, and feasibility risks.",
    capabilities: ["document review", "technical debugging", "MVP scoping", "acceptance-criteria analysis"],
    tools: [TOOLS.prdReviewer, TOOLS.feasibilityDebugger],
    coreResponsibilities: [
      "Scope the minimum product surface needed for the decision workflow.",
      "Separate MVP features from later infrastructure.",
      "Identify UX or technical risks that could weaken the product promise."
    ],
    inputs: ["Venture brief", "ICP analysis", "Evidence ledger"],
    outputs: ["MVP scope", "User journey", "Feature priorities", "Non-goals", "Feasibility risks"],
    toolsOrDataSources: ["Product requirements template", "Demo acceptance criteria"],
    mustNotDo: ["Invent market claims.", "Own monetization.", "Add features outside the decision workflow."],
    handoffConditions: ["Pass product scope to Business/GTM, Red Team, Quality Control, and Finalization."],
    successCriteria: ["The MVP is feasible, narrow, and aligned with the founder decision."]
  },
  {
    id: "agent-business",
    agentName: "Business Modeler",
    agentType: "specialist",
    llmProfile: "Data-analysis LLM focused on pricing, unit economics, cost drivers, and sensitivity risk.",
    purpose: "Model pricing, unit economics assumptions, cost drivers, and monetization risk.",
    capabilities: ["data analysis", "pricing sensitivity", "unit economics modeling"],
    tools: [TOOLS.unitEconomics, TOOLS.pricingSensitivity],
    coreResponsibilities: [
      "Create pricing hypotheses without presenting them as validation.",
      "List cost drivers and sensitivity risks.",
      "Identify the riskiest willingness-to-pay assumption."
    ],
    inputs: ["Customer findings", "Market evidence", "Product scope"],
    outputs: ["Pricing hypothesis", "Unit economics assumptions", "Monetization risk notes"],
    toolsOrDataSources: ["Pricing assumption register", "Cost driver checklist"],
    mustNotDo: ["Claim revenue proof.", "Invent TAM or conversion numbers.", "Own launch-channel selection."],
    handoffConditions: ["Pass monetization risk to Growth, Red Team, and Quality Control."],
    successCriteria: ["Pricing is explicit, testable, and labeled as unvalidated until evidence exists."]
  },
  {
    id: "agent-growth",
    agentName: "Growth Strategist",
    agentType: "specialist",
    llmProfile: "Growth-research LLM with optional web search for channels, launch experiments, and first-user strategy.",
    purpose: "Create the launch path, validation experiments, channels, messaging, and first-user plan.",
    capabilities: ["web search", "research synthesis", "experiment planning", "channel analysis"],
    tools: [TOOLS.channelResearch, TOOLS.experimentPlanner, TOOLS.sharedMemory],
    coreResponsibilities: [
      "Pick channels that match the ICP and trigger.",
      "Define validation experiments that can change the verdict.",
      "Turn risks into founder actions."
    ],
    inputs: ["ICP analysis", "Market evidence", "Business model risks", "Product scope"],
    outputs: ["GTM plan", "First 10 users plan", "Validation experiments", "Messaging"],
    toolsOrDataSources: ["GTM template", "Decision log", "Assumption register"],
    mustNotDo: ["Pretend channel fit is proven.", "Replace customer research.", "Add broad brand campaigns before wedge validation."],
    handoffConditions: ["Pass validation plan to Red Team, Quality Control, and Finalization."],
    successCriteria: ["The GTM plan names channels, actions, and metrics that can validate or weaken the idea."]
  },
  {
    id: "agent-red-team",
    agentName: "Red Team Critic",
    agentType: "review",
    llmProfile: "Adversarial review LLM focused on contradictions, failure modes, substitute threats, and disproof tests.",
    purpose: "Attack the venture thesis before the final verdict is approved.",
    capabilities: ["contradiction analysis", "research synthesis", "risk review", "disproof testing"],
    tools: [TOOLS.contradictionScanner, TOOLS.disproofPlanner, TOOLS.sourceVerifier],
    coreResponsibilities: [
      "Challenge urgency, willingness to pay, moat, substitutes, and evidence quality.",
      "Identify failure modes and disproof tests.",
      "Pressure the verdict so optimism does not outrun proof."
    ],
    inputs: ["All specialist outputs", "Evidence ledger", "Assumption register"],
    outputs: ["Red-team objections", "Severity notes", "Disproof tests"],
    toolsOrDataSources: ["Shared run state", "Evidence ledger", "Contradiction checklist"],
    mustNotDo: ["Rewrite the business plan.", "Create unsupported claims.", "Approve the final report alone."],
    handoffConditions: ["Pass objections to Managing Partner and Quality Control before finalization."],
    successCriteria: ["The critique is specific enough to influence the verdict or next actions."]
  },
  {
    id: "agent-quality",
    agentName: "Quality Control",
    agentType: "review",
    llmProfile: "Quality-control LLM focused on document review, citation audit, consistency checks, and revision requests.",
    purpose: "Review all outputs for accuracy, completeness, consistency, and usefulness.",
    capabilities: ["document review", "citation audit", "quality review", "artifact consistency"],
    tools: [TOOLS.citationAudit, TOOLS.artifactConsistency, TOOLS.reportReviewer],
    coreResponsibilities: [
      "Check unsupported claims, fake citations, duplicate work, contradictions, and weak reasoning.",
      "Send revision requests to the responsible agent.",
      "Approve finalization only when issues are fixed, downgraded, or explicitly disclosed."
    ],
    inputs: ["All agent outputs", "Evidence ledger", "Quality issues", "Draft artifacts"],
    outputs: ["Approval report", "Revision requests", "Residual risk notes"],
    toolsOrDataSources: ["Quality gate rules", "Evidence ledger", "Final output checklist"],
    mustNotDo: ["Invent new strategy.", "Hide unresolved failures.", "Approve Proceed when blocking issues remain."],
    handoffConditions: [
      "Return work to specialists when evidence, pricing, or artifact consistency fails.",
      "Pass approved synthesis to Artifact Producer."
    ],
    successCriteria: ["No critical unsupported claim or contradiction is left undisclosed."]
  },
  {
    id: "agent-artifact",
    agentName: "Artifact Producer",
    agentType: "finalization",
    llmProfile: "Finalization LLM focused on assembling approved claims into consistent founder-ready documents.",
    purpose: "Package the approved blueprint into founder-ready artifacts without adding new claims.",
    capabilities: ["artifact generation", "document review", "citation mapping"],
    tools: [TOOLS.documentAssembler, TOOLS.citationAudit, TOOLS.reportReviewer],
    coreResponsibilities: [
      "Format memo, market brief, PRD, deck outline, unit economics, GTM plan, and red-team memo.",
      "Use the same verdict, assumptions, and evidence IDs across every artifact.",
      "Preserve uncertainty and source labels."
    ],
    inputs: ["Approved synthesis", "Evidence ledger", "QC feedback", "Artifact templates"],
    outputs: ["Founder artifact packet", "Citation mapping", "Final output consistency notes"],
    toolsOrDataSources: ["Artifact templates", "Canonical run state", "Citation IDs"],
    mustNotDo: ["Change the verdict.", "Invent new evidence.", "Remove assumptions that affect the decision."],
    handoffConditions: ["Send final artifacts to Quality Control for the final review pass."],
    successCriteria: ["Artifacts are consistent with the verdict, quality gates, evidence ledger, and red-team critique."]
  }
];

export const agentSprintLogLines = AGENT_CONTRACTS.map((agent) => {
  const logs: Record<string, string> = {
    "Managing Partner": "Managing Partner opened the sprint, assigned agents, and set the decision bar.",
    "Intake and Clarification": "Intake and Clarification converted founder input into a complete venture brief.",
    "Venture Framer": "Venture Framer turned the brief into hypotheses, assumptions, and unknowns.",
    "Market Evidence": "Market Evidence separated sourced claims from assumptions and evidence gaps.",
    "Customer and ICP": "Customer and ICP narrowed the buyer, workflow, and interview questions.",
    "Product Strategy": "Product Strategy scoped the MVP, user journey, features, and non-goals.",
    "Business Modeler": "Business Modeler flagged willingness-to-pay as the highest-risk assumption.",
    "Growth Strategist": "Growth Strategist mapped channels, validation experiments, and first-user actions.",
    "Red Team Critic": "Red Team Critic challenged positioning, urgency, moat, and evidence quality.",
    "Quality Control": "Quality Control requested fixes for unsupported pricing and unsourced competitor claims.",
    "Artifact Producer": "Artifact Producer aligned all founder artifacts to the approved verdict."
  };

  return logs[agent.agentName];
});

export function buildAgentActivityLogs(input: {
  brief: VentureBrief;
  evidence: EvidenceItem[];
  qualityIssues: QualityIssue[];
  verdict: FinalVerdict;
  redTeamObjections: string[];
}): AgentActivityLog[] {
  const sourceCount = input.evidence.filter((item) => item.kind === "source").length;
  const assumptionCount = input.evidence.filter((item) => item.kind === "assumption").length;
  const blockerCount = input.qualityIssues.filter((issue) => issue.severity === "fail").length;
  const topAssumption = input.brief.assumptions[0] ?? "Critical assumption still needs validation.";
  const topUnknown = input.brief.unknowns[0] ?? "Primary validation question is still unresolved.";
  const topRedTeam = input.redTeamObjections[0] ?? "No specific red-team objection was recorded.";

  const logs: Record<string, Omit<AgentActivityLog, "id" | "agentId" | "agentName" | "status">> = {
    "Managing Partner": {
      task: "Create the run plan, dispatch bounded agents, and hold final verdict authority.",
      toolsUsed: ["Run planner", "Shared memory", "Conflict resolver"],
      reasoningSummary: [
        "Split the founder request into intake, framing, parallel specialist work, review, and finalization.",
        "Kept the final verdict gated by evidence quality and reviewer objections."
      ],
      output: `Approved a ${input.verdict.decision} decision path with explicit unresolved risks.`,
      handoffTo: "Intake and Clarification"
    },
    "Intake and Clarification": {
      task: "Turn raw founder input into a structured venture brief.",
      toolsUsed: ["Brief parser", "Clarification scanner", "Shared memory"],
      reasoningSummary: [
        `Captured the target customer as ${input.brief.targetCustomer}.`,
        "Recorded missing or uncertain facts as assumptions instead of silently filling them in."
      ],
      output: `Created the brief for: ${input.brief.idea}`,
      handoffTo: "Venture Framer"
    },
    "Venture Framer": {
      task: "Frame hypotheses, unknowns, and specialist questions.",
      toolsUsed: ["Hypothesis mapper", "Shared memory"],
      reasoningSummary: [
        `Top assumption: ${topAssumption}`,
        `Top unknown: ${topUnknown}`
      ],
      output: "Produced a specialist question set for market, customer, product, business, and growth agents.",
      handoffTo: "Specialist Agents"
    },
    "Market Evidence": {
      task: "Separate source-backed market evidence from assumptions.",
      toolsUsed: ["Web search", "Seeded evidence", "Source verifier"],
      reasoningSummary: [
        "Used available verified citations and kept live web search as an optional server-side capability.",
        `Classified ${sourceCount} source-backed claim(s) and ${assumptionCount} assumption(s).`
      ],
      output: "Updated the evidence ledger with source labels, assumption labels, and validation gaps.",
      handoffTo: "Quality Control"
    },
    "Customer and ICP": {
      task: "Define the first customer segment and discovery plan.",
      toolsUsed: ["Customer research synthesis", "Interview planner", "Shared memory"],
      reasoningSummary: [
        "Narrowed the buyer segment to a founder with a near-term build decision.",
        "Converted customer uncertainty into interview questions rather than proof claims."
      ],
      output: "Produced ICP, buying-trigger, objection, and interview-plan notes.",
      handoffTo: "Product Strategy"
    },
    "Product Strategy": {
      task: "Review MVP scope and implementation risks.",
      toolsUsed: ["PRD reviewer", "Technical feasibility debugger"],
      reasoningSummary: [
        "Kept the first product surface focused on intake, sprint state, evidence, gates, verdict, and artifacts.",
        "Flagged live search, exports, auth, and persistence as later infrastructure unless the local run remains reliable."
      ],
      output: "Produced MVP scope, non-goals, acceptance criteria, and feasibility risks.",
      handoffTo: "Quality Control"
    },
    "Business Modeler": {
      task: "Analyze pricing, unit economics, and willingness-to-pay risk.",
      toolsUsed: ["Unit economics worksheet", "Pricing sensitivity analysis"],
      reasoningSummary: [
        "Treated paid report and workspace pricing as hypotheses, not validated revenue.",
        `Found ${blockerCount} blocking quality issue(s) that affect monetization confidence.`
      ],
      output: "Produced pricing assumptions, cost drivers, sensitivity risks, and a willingness-to-pay validation need.",
      handoffTo: "Growth Strategist"
    },
    "Growth Strategist": {
      task: "Create channels, first-user actions, and validation experiments.",
      toolsUsed: ["Channel research", "Experiment planner", "Shared memory"],
      reasoningSummary: [
        "Matched channels to solo founder communities and near-term build decisions.",
        "Mapped the riskiest assumptions to experiments that could change the verdict."
      ],
      output: "Produced first-user plan, messaging, experiments, and success metrics.",
      handoffTo: "Red Team Critic"
    },
    "Red Team Critic": {
      task: "Pressure-test the venture thesis and identify failure modes.",
      toolsUsed: ["Contradiction scanner", "Disproof test planner", "Source verifier"],
      reasoningSummary: [
        topRedTeam,
        "Checked whether the verdict would contradict evidence quality, pricing uncertainty, or substitute risk."
      ],
      output: "Produced red-team objections, failure modes, and disproof tests.",
      handoffTo: "Quality Control"
    },
    "Quality Control": {
      task: "Review outputs for unsupported claims, contradictions, formatting gaps, and usefulness.",
      toolsUsed: ["Citation audit", "Artifact consistency checker", "Report reviewer"],
      reasoningSummary: [
        "Checked that assumptions stay labeled and URLs are not invented.",
        "Returned revision pressure to monetization and competitor claims before finalization."
      ],
      output: "Produced reviewer findings and approval conditions for the final artifact packet.",
      handoffTo: "Artifact Producer"
    },
    "Artifact Producer": {
      task: "Assemble founder-ready artifacts from approved material only.",
      toolsUsed: ["Document assembler", "Citation audit", "Report reviewer"],
      reasoningSummary: [
        "Used the approved verdict, evidence IDs, red-team objections, and quality gates as the source of truth.",
        "Kept uncertainty visible instead of smoothing it out of the founder-facing documents."
      ],
      output: "Produced aligned founder memo, market brief, PRD, pitch outline, unit economics, GTM plan, and red-team memo.",
      handoffTo: "Quality Control"
    }
  };

  return AGENT_CONTRACTS.map((agent, index) => ({
    id: `activity-${agent.id}`,
    agentId: agent.id,
    agentName: agent.agentName,
    status: "complete",
    ...logs[agent.agentName],
    handoffTo: logs[agent.agentName].handoffTo ?? AGENT_CONTRACTS[index + 1]?.agentName
  }));
}

export function buildAgentRunsFromContracts(summaries: Partial<Record<string, string>> = {}): AgentRun[] {
  return AGENT_CONTRACTS.map((agent) => ({
    id: agent.id,
    agentName: agent.agentName,
    agentType: agent.agentType,
    role: agent.purpose,
    status: "complete",
    logs: [agentSprintLogLines[AGENT_CONTRACTS.indexOf(agent)]],
    activityLogs: [],
    summary: summaries[agent.agentName] ?? defaultSummaryForAgent(agent.agentName),
    toolUseSummary: agent.tools.map((item) => item.label)
  }));
}

export function buildMultiAgentSystem(input: {
  brief: VentureBrief;
  mode: PreflightRun["mode"];
  evidence: EvidenceItem[];
  qualityIssues: QualityIssue[];
  verdict: FinalVerdict;
  redTeamObjections: string[];
}): MultiAgentSystem {
  const sourceCount = input.evidence.filter((item) => item.kind === "source").length;
  const assumptionCount = input.evidence.filter((item) => item.kind === "assumption").length;
  const failCount = input.qualityIssues.filter((issue) => issue.severity === "fail").length;
  const topAssumption = input.brief.assumptions[0] ?? "The founder has a business-critical assumption that still needs validation.";
  const topUnknown = input.brief.unknowns[0] ?? "The first validation question is still unresolved.";
  const topRedTeam = input.redTeamObjections[0] ?? "The red-team pass did not find a specific objection.";
  const activityLogs = buildAgentActivityLogs(input);

  return {
    overview:
      "Preflight now runs as a lean multi-agent decision system: intake creates the brief, specialists answer bounded questions, reviewers pressure-test the work, and finalization packages only approved claims.",
    operatingMode: input.mode === "live" ? "live-server" : "demo-deterministic",
    agents: AGENT_CONTRACTS,
    workflow: [
      {
        id: "workflow-intake",
        order: 1,
        title: "Interpret request and create brief",
        mode: "sequential",
        agents: ["Managing Partner", "Intake and Clarification"],
        trigger: "Founder submits idea, target customer, geography, or business model.",
        output: "Structured venture brief plus any recorded assumptions.",
        status: "complete"
      },
      {
        id: "workflow-frame",
        order: 2,
        title: "Frame hypotheses and unknowns",
        mode: "sequential",
        agents: ["Venture Framer"],
        trigger: "A usable venture brief exists.",
        output: "Assumption register, unknowns, and specialist question set.",
        status: "complete"
      },
      {
        id: "workflow-specialists",
        order: 3,
        title: "Run specialist analysis",
        mode: "parallel",
        agents: ["Market Evidence", "Customer and ICP", "Product Strategy", "Business Modeler", "Growth Strategist"],
        trigger: "Framing memo is approved by the Managing Partner.",
        output: "Evidence ledger, ICP, MVP scope, pricing hypothesis, and validation plan.",
        status: "complete"
      },
      {
        id: "workflow-review",
        order: 4,
        title: "Pressure-test and review",
        mode: "sequential",
        agents: ["Red Team Critic", "Quality Control"],
        trigger: "Specialist outputs are merged into the shared run state.",
        output: "Red-team critique, revision requests, and quality gate status.",
        status: "complete"
      },
      {
        id: "workflow-finalize",
        order: 5,
        title: "Synthesize verdict and artifacts",
        mode: "sequential",
        agents: ["Managing Partner", "Artifact Producer", "Quality Control"],
        trigger: "Reviewer issues are resolved, downgraded, or disclosed.",
        output: "Founder-ready blueprint and artifact packet.",
        status: "complete"
      }
    ],
    handoffs: [
      {
        id: "handoff-intake-frame",
        fromAgent: "Intake and Clarification",
        toAgent: "Venture Framer",
        taskCompleted: "Structured the founder input into a venture brief.",
        keyFindings: [
          `Idea: ${input.brief.idea}`,
          `Target customer: ${input.brief.targetCustomer}`,
          `Business model: ${input.brief.businessModel || "Not provided"}`
        ],
        remainingIssues: [topUnknown],
        assumptions: [topAssumption],
        recommendedNextStep: "Frame the idea as assumptions, unknowns, and specialist questions.",
        status: "accepted"
      },
      {
        id: "handoff-frame-specialists",
        fromAgent: "Venture Framer",
        toAgent: "Specialist Agents",
        taskCompleted: "Converted the brief into a bounded specialist work plan.",
        keyFindings: input.brief.assumptions.slice(0, 3),
        remainingIssues: input.brief.unknowns.slice(0, 3),
        assumptions: input.brief.assumptions.slice(0, 2),
        recommendedNextStep: "Run market, customer, product, business, and growth analysis in parallel.",
        status: "accepted"
      },
      {
        id: "handoff-market-qc",
        fromAgent: "Market Evidence",
        toAgent: "Quality Control",
        taskCompleted: "Built the evidence ledger and separated sources from assumptions.",
        keyFindings: [
          `${sourceCount} source-backed claim(s) are available.`,
          `${assumptionCount} claim(s) still require validation.`
        ],
        remainingIssues: input.qualityIssues
          .filter((issue) => issue.type === "missing_citation" || issue.type === "uncertain_competitor")
          .map((issue) => issue.message)
          .slice(0, 2),
        assumptions: input.evidence.filter((item) => item.kind === "assumption").map((item) => item.claim).slice(0, 2),
        recommendedNextStep: "Treat unsourced competitor and demand claims as assumptions until live evidence is attached.",
        status: "accepted"
      },
      {
        id: "handoff-qc-business",
        fromAgent: "Quality Control",
        toAgent: "Business Modeler",
        taskCompleted: "Reviewed monetization and pricing claims.",
        keyFindings: ["Pricing can be shown as a hypothesis, not validation."],
        remainingIssues: input.qualityIssues
          .filter((issue) => issue.type === "unsupported_number" || issue.type === "weak_assumption")
          .map((issue) => issue.message)
          .slice(0, 2),
        assumptions: [topAssumption],
        recommendedNextStep: "Keep willingness-to-pay as the first validation experiment before any Proceed verdict.",
        status: failCount > 0 ? "revision_requested" : "accepted"
      },
      {
        id: "handoff-review-final",
        fromAgent: "Quality Control",
        toAgent: "Artifact Producer",
        taskCompleted: "Approved finalization with unresolved risks disclosed in the artifact packet.",
        keyFindings: [
          `Verdict remains ${input.verdict.decision}.`,
          "Artifacts must use the same evidence IDs, assumptions, and red-team objections."
        ],
        remainingIssues: [topRedTeam],
        assumptions: input.brief.assumptions.slice(0, 2),
        recommendedNextStep: "Package the founder memo, market brief, PRD, pitch outline, unit economics, GTM plan, and red-team memo.",
        status: "accepted"
      }
    ],
    memory: [
      {
        id: "memory-user-run",
        kind: "user_preference",
        ownerAgent: "Intake and Clarification",
        title: "Run reliability",
        detail: "The local run must work without exposing API keys and must keep output deterministic when live services are unavailable.",
        visibility: "shared"
      },
      {
        id: "memory-assumption-critical",
        kind: "assumption",
        ownerAgent: "Venture Framer",
        title: "Critical assumption",
        detail: topAssumption,
        visibility: "shared"
      },
      {
        id: "memory-evidence-boundary",
        kind: "evidence_rule",
        ownerAgent: "Market Evidence",
        title: "Evidence boundary",
        detail: "Only claims with real URLs can be source-backed. Model-generated claims stay assumptions until verified.",
        visibility: "shared"
      },
      {
        id: "memory-verdict",
        kind: "decision",
        ownerAgent: "Managing Partner",
        title: `Verdict: ${input.verdict.decision}`,
        detail: input.verdict.rationale,
        visibility: "shared"
      },
      {
        id: "memory-local-artifact",
        kind: "local_note",
        ownerAgent: "Artifact Producer",
        title: "Local formatting note",
        detail: "Draft artifact phrasing stays local until the final QC pass approves consistency.",
        visibility: "local"
      }
    ],
    reviewFindings: [
      {
        id: "review-evidence",
        reviewerAgent: "Quality Control",
        severity: sourceCount > 0 ? "pass" : "warn",
        check: "Evidence separation",
        finding: `${sourceCount} source-backed claim(s) and ${assumptionCount} assumption(s) are separated in the ledger.`,
        requiredAction: "Do not promote assumptions to sourced proof without live evidence.",
        status: "resolved"
      },
      {
        id: "review-pricing",
        reviewerAgent: "Quality Control",
        severity: failCount > 0 ? "fail" : "warn",
        check: "Unsupported numbers and willingness to pay",
        finding: "Pricing and willingness-to-pay claims remain business-critical assumptions.",
        requiredAction: "Keep the verdict at Pivot/Pause unless buyer behavior proves payment intent.",
        status: failCount > 0 ? "revision_required" : "approved"
      },
      {
        id: "review-red-team",
        reviewerAgent: "Red Team Critic",
        severity: "warn",
        check: "Venture pressure test",
        finding: topRedTeam,
        requiredAction: "Reflect this objection in the risks, next actions, and final verdict.",
        status: "resolved"
      },
      {
        id: "review-artifacts",
        reviewerAgent: "Quality Control",
        severity: "pass",
        check: "Artifact consistency",
        finding: "Final artifacts are generated from the same brief, verdict, evidence IDs, and quality gates.",
        requiredAction: "Do not let artifacts introduce new strategy after approval.",
        status: "approved"
      }
    ],
    activityLogs,
    communicationProtocol: [
      "Handoff From",
      "Handoff To",
      "Task Completed",
      "Key Findings",
      "Evidence Used",
      "Assumptions",
      "Open Questions",
      "Risks or Blockers",
      "Conflicts With Other Outputs",
      "Recommended Next Step",
      "Completion Status"
    ],
    finalOutputRules: [
      "Final output must disclose assumptions and uncertainty.",
      "Artifacts must not introduce claims that are absent from the approved blueprint.",
      "A Proceed verdict is blocked while critical evidence or willingness-to-pay issues remain unresolved.",
      "Reviewer objections must be reflected in either the final verdict or the residual risk list."
    ]
  };
}

function defaultSummaryForAgent(agentName: string): string {
  const summaries: Record<string, string> = {
    "Managing Partner": "Keeps the workflow aligned to a founder decision and approves the final verdict.",
    "Intake and Clarification": "Turns raw founder input into a structured brief and records any safe assumptions.",
    "Venture Framer": "Frames the idea into hypotheses, unknowns, and the questions specialists must answer.",
    "Market Evidence": "Separates sourced signals from assumptions so the report does not overclaim.",
    "Customer and ICP": "Narrows the first buyer segment and identifies the painful workflow to test.",
    "Product Strategy": "Cuts the MVP to the minimum product surface needed to prove the decision workflow.",
    "Business Modeler": "Keeps pricing and willingness to pay in hypothesis status until customers prove demand.",
    "Growth Strategist": "Turns the wedge into first-user channels, experiments, and validation metrics.",
    "Red Team Critic": "Attacks urgency, moat, substitutes, and evidence quality before synthesis.",
    "Quality Control": "Checks accuracy, completeness, internal consistency, and unsupported claims.",
    "Artifact Producer": "Formats the approved blueprint into consistent founder-ready artifacts."
  };

  return summaries[agentName] ?? "Specialist output is ready for orchestration.";
}
