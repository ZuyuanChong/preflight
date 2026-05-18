import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

function loadMultiAgentModule() {
  const source = readFileSync(new URL("../src/lib/multi-agent.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    }
  }).outputText;
  const module = { exports: {} };
  const fn = new Function("exports", "module", compiled);
  fn(module.exports, module);
  return module.exports;
}

const { AGENT_CONTRACTS, buildMultiAgentSystem } = loadMultiAgentModule();

function loadAgentStudioRuntime() {
  const source = readFileSync(new URL("../src/lib/agent-studio-runtime.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    }
  }).outputText;
  const module = { exports: {} };
  const fn = new Function("exports", "module", "require", compiled);
  fn(module.exports, module, (specifier) => {
    if (specifier === "@/lib/multi-agent") {
      return { AGENT_CONTRACTS };
    }
    return {};
  });
  return module.exports;
}

const { buildAgentExecutionPlan, mergeAgentEvidence, buildCrossAgentValidation } = loadAgentStudioRuntime();

const brief = {
  idea: "AI preflight for founder ideas",
  targetCustomer: "solo technical founders",
  geography: "global startup communities",
  businessModel: "paid reports",
  problem: "Founders build before validating what must be true.",
  solution: "Run a pre-build decision sprint.",
  assumptions: ["Founders value critique before building.", "Evidence labels increase trust."],
  unknowns: ["Will founders pay before they build?", "Which substitute do they use today?"]
};

const evidence = [
  {
    id: "ev-source",
    kind: "source",
    claim: "Sourced claim",
    sourceUrl: "https://example.com",
    sourceTitle: "Example",
    summary: "Source-backed context.",
    confidence: "high",
    agentName: "Market Evidence"
  },
  {
    id: "ev-assumption",
    kind: "assumption",
    claim: "Assumption claim",
    summary: "Needs validation.",
    confidence: "medium",
    agentName: "Business Modeler"
  }
];

const qualityIssues = [
  {
    id: "q-price",
    artifactId: "artifact-unit-economics",
    severity: "fail",
    type: "weak_assumption",
    message: "Willingness to pay is untested.",
    suggestedFix: "Interview target buyers."
  }
];

const verdict = {
  decision: "Pivot",
  rationale: "The wedge is useful but evidence remains thin.",
  strongestWedge: "Pre-build decision quality.",
  nextActions: ["Interview founders"],
  risks: ["Founders may prefer optimism"]
};

test("multi-agent contracts include required ownership roles", () => {
  const types = new Set(AGENT_CONTRACTS.map((agent) => agent.agentType));

  for (const type of ["orchestrator", "intake", "specialist", "review", "finalization"]) {
    assert.ok(types.has(type), `missing ${type}`);
  }

  assert.ok(AGENT_CONTRACTS.length >= 10);
  assert.equal(new Set(AGENT_CONTRACTS.map((agent) => agent.id)).size, AGENT_CONTRACTS.length);
  assert.ok(AGENT_CONTRACTS.every((agent) => agent.mustNotDo.length > 0));
  assert.ok(AGENT_CONTRACTS.every((agent) => agent.successCriteria.length > 0));
  assert.ok(AGENT_CONTRACTS.every((agent) => agent.llmProfile.length > 0));
  assert.ok(AGENT_CONTRACTS.every((agent) => agent.capabilities.length > 0));
  assert.ok(AGENT_CONTRACTS.every((agent) => agent.tools.length > 0));
  assert.ok(
    AGENT_CONTRACTS.some((agent) => agent.tools.some((tool) => tool.category === "web_search")),
    "at least one agent needs web search capability"
  );
  assert.ok(
    AGENT_CONTRACTS.some((agent) => agent.tools.some((tool) => tool.category === "data_analysis")),
    "at least one agent needs data analysis capability"
  );
  assert.ok(
    AGENT_CONTRACTS.some((agent) => agent.tools.some((tool) => tool.category === "document_review")),
    "at least one agent needs document review capability"
  );
});

test("multi-agent system exposes workflow, handoffs, memory, and review loop", () => {
  const system = buildMultiAgentSystem({
    brief,
    mode: "demo",
    evidence,
    qualityIssues,
    verdict,
    redTeamObjections: ["Generic AI tools can imitate the workflow."]
  });

  assert.equal(system.workflow.some((step) => step.mode === "parallel"), true);
  assert.equal(system.handoffs.some((handoff) => handoff.status === "revision_requested"), true);
  assert.equal(system.memory.some((item) => item.visibility === "shared"), true);
  assert.equal(system.reviewFindings.some((finding) => finding.status === "revision_required"), true);
  assert.equal(system.activityLogs.length, AGENT_CONTRACTS.length);
  assert.ok(system.activityLogs.every((log) => log.task && log.output));
  assert.ok(system.activityLogs.every((log) => log.toolsUsed.length > 0));
  assert.ok(system.activityLogs.every((log) => log.reasoningSummary.length > 0));
  assert.ok(system.communicationProtocol.includes("Handoff From"));
  assert.ok(system.finalOutputRules.some((rule) => rule.includes("assumptions")));
});

test("agent studio backend decomposes work into independent execution contexts", () => {
  const plan = buildAgentExecutionPlan(brief);
  const byAgent = new Map(plan.map((assignment) => [assignment.agentName, assignment]));
  const promptCount = new Set(plan.map((assignment) => assignment.systemPrompt)).size;

  assert.equal(plan.length, AGENT_CONTRACTS.length);
  assert.equal(promptCount, plan.length, "each agent must have a distinct system prompt");
  assert.ok(plan.every((assignment) => assignment.taskObjective.length > 20));
  assert.ok(plan.every((assignment) => assignment.requiredContext.length > 0));
  assert.ok(plan.every((assignment) => assignment.toolPolicy.length > 0));
  assert.ok(byAgent.get("Managing Partner").dependsOn.includes("Quality Control"));
  assert.ok(byAgent.get("Venture Framer").dependsOn.includes("Intake and Clarification"));

  const parallelAgents = plan.filter((assignment) => assignment.runsInParallelGroup === "specialist-analysis");
  assert.deepEqual(
    parallelAgents.map((assignment) => assignment.agentName),
    ["Market Evidence", "Customer and ICP", "Product Strategy", "Business Modeler", "Growth Strategist"]
  );

  const searchAgents = plan.filter((assignment) => assignment.searchQueries.length > 0);
  assert.deepEqual(searchAgents.map((assignment) => assignment.agentName), ["Market Evidence", "Growth Strategist"]);
  assert.ok(searchAgents.every((assignment) => assignment.searchQueries.every((query) => query.length <= 390)));
});

test("agent studio backend preserves sources and flags unsupported claims", () => {
  const source = {
    id: "market-source-1",
    agentName: "Market Evidence",
    query: "founder validation market evidence",
    url: "https://example.com/report#section",
    title: "Market Report",
    summary: "Source-backed market context.",
    publishedDate: "2026-05-18",
    score: 0.9
  };
  const duplicateSource = {
    ...source,
    id: "growth-source-1",
    agentName: "Growth Strategist",
    query: "founder channels"
  };
  const executions = [
    {
      agentName: "Market Evidence",
      executionThreadId: "market-thread",
      taskObjective: "Collect market evidence.",
      toolsRequested: ["Web search"],
      sources: [source],
      findings: [
        {
          id: "market-finding-1",
          agentName: "Market Evidence",
          claim: "The target market has visible demand signals.",
          summary: "The source describes relevant market behavior.",
          sourceIds: ["market-source-1"],
          confidence: "high",
          limitations: []
        }
      ],
      assumptions: [],
      limitations: [],
      confidence: "high",
      summary: "Market evidence completed."
    },
    {
      agentName: "Growth Strategist",
      executionThreadId: "growth-thread",
      taskObjective: "Collect channel evidence.",
      toolsRequested: ["Web search"],
      sources: [duplicateSource],
      findings: [
        {
          id: "growth-finding-1",
          agentName: "Growth Strategist",
          claim: "The same source supports a channel test.",
          summary: "The source also informs distribution.",
          sourceIds: ["growth-source-1"],
          confidence: "medium",
          limitations: []
        },
        {
          id: "growth-finding-2",
          agentName: "Growth Strategist",
          claim: "A 25% conversion rate is likely from founder communities.",
          summary: "This is a forecast and has no cited proof.",
          sourceIds: [],
          confidence: "low",
          limitations: ["No source-backed conversion evidence."]
        }
      ],
      assumptions: ["Founder communities may convert."],
      limitations: [],
      confidence: "medium",
      summary: "Growth strategy completed."
    }
  ];

  const evidence = mergeAgentEvidence(executions);
  const validation = buildCrossAgentValidation(executions, evidence);

  assert.equal(evidence.filter((item) => item.kind === "source").length, 1, "duplicate URLs should merge");
  assert.equal(evidence.filter((item) => item.kind === "assumption").length, 1, "unsourced findings become assumptions");
  assert.ok(validation.unsupportedClaims.some((claim) => claim.includes("25% conversion rate")));
  assert.ok(validation.qualityIssues.some((issue) => issue.type === "missing_citation"));
  assert.ok(validation.qualityIssues.some((issue) => issue.type === "unsupported_number"));
});
