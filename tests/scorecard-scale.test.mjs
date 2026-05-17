import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const agentNames = [
  "Managing Partner",
  "Intake and Clarification",
  "Venture Framer",
  "Market Evidence",
  "Customer and ICP",
  "Product Strategy",
  "Business Modeler",
  "Growth Strategist",
  "Red Team Critic",
  "Quality Control",
  "Artifact Producer"
];

function loadOpenAIPreflightModule() {
  const source = readFileSync(new URL("../src/lib/openai-preflight.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    }
  }).outputText;
  const module = { exports: {} };
  const require = (id) => {
    if (id === "@/lib/artifacts") {
      return { buildArtifacts: () => [] };
    }

    if (id === "@/lib/multi-agent") {
      return { buildMultiAgentSystem: () => ({}) };
    }

    if (id === "@/data/demo-run") {
      return { demoAgents: agentNames.map((agentName) => ({ agentName })) };
    }

    throw new Error(`Unexpected import in test: ${id}`);
  };
  const fn = new Function("exports", "module", "require", compiled);
  fn(module.exports, module, require);
  return module.exports;
}

const { normalizeScorecard } = loadOpenAIPreflightModule();

test("live ten-point scorecards are promoted to the displayed 0-100 scale", () => {
  assert.deepEqual(
    normalizeScorecard({
      pain: 8,
      buyerClarity: 7,
      timing: 6,
      competition: 5,
      distribution: 4,
      monetization: 3,
      feasibility: 10,
      evidenceQuality: 6.5,
      redTeamSeverity: 8.2
    }),
    {
      pain: 80,
      buyerClarity: 70,
      timing: 60,
      competition: 50,
      distribution: 40,
      monetization: 30,
      feasibility: 100,
      evidenceQuality: 65,
      redTeamSeverity: 82
    }
  );
});

test("percentage scorecards remain percentages and still clamp to display bounds", () => {
  assert.deepEqual(
    normalizeScorecard({
      pain: 78,
      buyerClarity: 72,
      timing: 76,
      competition: -4,
      distribution: 64,
      monetization: 48,
      feasibility: 86,
      evidenceQuality: 62,
      redTeamSeverity: 104
    }),
    {
      pain: 78,
      buyerClarity: 72,
      timing: 76,
      competition: 0,
      distribution: 64,
      monetization: 48,
      feasibility: 86,
      evidenceQuality: 62,
      redTeamSeverity: 100
    }
  );
});

test("generation prompt explicitly rejects ten-point scorecard output", () => {
  const source = readFileSync(new URL("../src/lib/openai-preflight.ts", import.meta.url), "utf8");

  assert.match(source, /0 to 100/);
  assert.match(source, /Do not use a 0-10 scale/);
  assert.match(source, /return 80 for an eight-out-of-ten signal, not 8/);
});
