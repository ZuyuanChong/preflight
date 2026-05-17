import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

function loadArtifactModule() {
  const source = readFileSync(new URL("../src/lib/artifacts.ts", import.meta.url), "utf8");
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

const { buildArtifacts } = loadArtifactModule();

const brief = {
  idea: "AI compliance copilot for small healthcare clinics",
  targetCustomer: "clinic owners with 5-25 staff who manage HIPAA paperwork manually",
  geography: "United States outpatient clinics",
  businessModel: "$199/month per clinic plus onboarding",
  problem: "Owners lose admin hours translating changing compliance tasks into staff workflows.",
  solution: "A workflow copilot that turns compliance obligations into weekly checklists and evidence logs.",
  assumptions: [
    "Clinic owners consider compliance admin urgent enough to pay before a fine occurs.",
    "A lightweight checklist workflow can earn trust without replacing legal counsel.",
    "A narrow HIPAA paperwork wedge can expand into staff training and audit prep."
  ],
  unknowns: [
    "Which clinic role owns the budget?",
    "Which substitute is most painful: consultants, spreadsheets, or EHR add-ons?",
    "What proof is needed before buyers trust AI-generated compliance guidance?"
  ]
};

const verdict = {
  decision: "Pivot",
  rationale: "The pain is concrete, but the wedge should move from broad compliance advice to auditable weekly evidence logs.",
  strongestWedge: "Weekly compliance checklists tied to evidence logs for a single clinic role.",
  nextActions: [
    "Interview five clinic owners about the last compliance task they delayed.",
    "Prototype one weekly evidence log for HIPAA training documentation.",
    "Test whether owners will prepay for an audit-readiness report."
  ],
  risks: [
    "Buyers may require legal assurance before trusting AI output.",
    "EHR vendors and consultants may already own the workflow.",
    "Compliance claims can create liability if assumptions look like legal advice."
  ]
};

function artifactById(artifacts, id) {
  const artifact = artifacts.find((item) => item.id === id);
  assert.ok(artifact, `missing ${id}`);
  return artifact.markdown;
}

test("detailed artifacts contain required founder-ready sections", () => {
  const artifacts = buildArtifacts(brief, verdict, ["ev-source"], { depth: "detailed" });

  assert.equal(artifacts.length, 7);

  const founderMemo = artifactById(artifacts, "artifact-founder-memo");
  for (const heading of [
    "## Decision",
    "## Rationale",
    "## What Must Be True",
    "## Wedge",
    "## Risks",
    "## 7-Day Validation Plan",
    "## Interview Questions",
    "## Pivot/Kill Triggers"
  ]) {
    assert.match(founderMemo, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const marketBrief = artifactById(artifacts, "artifact-market-brief");
  for (const heading of [
    "## Category",
    "## Target Segment",
    "## Substitutes",
    "## Evidence",
    "## Assumptions",
    "## Market Risks",
    "## Validation Plan"
  ]) {
    assert.match(marketBrief, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const prd = artifactById(artifacts, "artifact-prd");
  for (const heading of [
    "## Personas",
    "## Workflows",
    "## MVP Features",
    "## Non-Goals",
    "## Acceptance Criteria",
    "## Metrics",
    "## Edge Cases"
  ]) {
    assert.match(prd, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const deck = artifactById(artifacts, "artifact-pitch-deck");
  assert.equal((deck.match(/^### Slide \d+:/gm) ?? []).length, 10);
  assert.equal((deck.match(/Speaker notes:/g) ?? []).length, 10);

  const unitEconomics = artifactById(artifacts, "artifact-unit-economics");
  for (const heading of ["## Pricing Assumptions", "## Cost Drivers", "## Simple Scenarios", "## Sensitivity Risks"]) {
    assert.match(unitEconomics, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const gtm = artifactById(artifacts, "artifact-gtm");
  for (const heading of [
    "## ICP",
    "## Positioning",
    "## Channels",
    "## First 10 Users Plan",
    "## Experiments",
    "## Messaging",
    "## Success Metrics"
  ]) {
    assert.match(gtm, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const redTeam = artifactById(artifacts, "artifact-red-team");
  for (const heading of [
    "## Strongest Objections",
    "## Failure Modes",
    "## Evidence Gaps",
    "## Ways To Disprove The Idea"
  ]) {
    assert.match(redTeam, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("executive artifacts stay shorter while preserving the key decision frame", () => {
  const executive = buildArtifacts(brief, verdict, ["ev-source"], { depth: "executive" });
  const detailed = buildArtifacts(brief, verdict, ["ev-source"], { depth: "detailed" });
  const executiveMemo = artifactById(executive, "artifact-founder-memo");
  const detailedMemo = artifactById(detailed, "artifact-founder-memo");

  assert.match(executiveMemo, /## Decision/);
  assert.match(executiveMemo, /## What Must Be True/);
  assert.ok(detailedMemo.length > executiveMemo.length * 1.5);
  assert.doesNotMatch(executiveMemo, /## 7-Day Validation Plan/);
});
