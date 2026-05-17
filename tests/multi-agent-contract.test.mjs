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
  assert.ok(system.communicationProtocol.includes("Handoff From"));
  assert.ok(system.finalOutputRules.some((rule) => rule.includes("assumptions")));
});
