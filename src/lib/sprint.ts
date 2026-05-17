import type { AgentRun, PreflightRun, VentureBrief } from "@/types/preflight";
import { demoRun } from "@/data/demo-run";
import { buildArtifacts } from "@/lib/artifacts";

export const sprintLogLines = [
  "Managing Partner opened the sprint and set the decision bar.",
  "Framer converted the raw idea into assumptions and unknowns.",
  "Market Scout separated cited event constraints from unsourced market assumptions.",
  "Customer Analyst narrowed ICP to solo technical founders.",
  "Product Architect scoped the MVP to intake, sprint, evidence, gates, and artifacts.",
  "Business Modeler flagged willingness-to-pay as the highest-risk assumption.",
  "Growth Strategist chose community-led founder workflows as the first channel.",
  "Red Team challenged the generic AI advisor positioning.",
  "Artifact Producer aligned all outputs to the same verdict."
];

export function createIdleRun(): PreflightRun {
  return {
    ...demoRun,
    status: "idle",
    agents: demoRun.agents.map((agent) => ({
      ...agent,
      status: "queued",
      startedAt: undefined,
      completedAt: undefined,
      logs: []
    }))
  };
}

export function createRunFromBrief(brief: VentureBrief): PreflightRun {
  return {
    ...createIdleRun(),
    id: `demo-${Date.now()}`,
    brief,
    artifacts: buildArtifacts(brief, demoRun.finalVerdict)
  };
}

export function applySprintStep(run: PreflightRun, step: number): PreflightRun {
  const now = new Date().toISOString();
  const agents = run.agents.map<AgentRun>((agent, index) => {
    if (index < step) {
      return {
        ...agent,
        status: "complete",
        completedAt: agent.completedAt ?? now,
        logs: agent.logs.length ? agent.logs : [sprintLogLines[index]]
      };
    }

    if (index === step) {
      return {
        ...agent,
        status: "running",
        startedAt: agent.startedAt ?? now,
        logs: agent.logs.length ? agent.logs : [sprintLogLines[index]]
      };
    }

    return {
      ...agent,
      status: "queued"
    };
  });

  const isComplete = step >= run.agents.length;

  return {
    ...run,
    status: isComplete ? "complete" : "running",
    agents: isComplete
      ? agents.map((agent, index) => ({
          ...agent,
          status: "complete",
          completedAt: agent.completedAt ?? now,
          logs: agent.logs.length ? agent.logs : [sprintLogLines[index]]
        }))
      : agents
  };
}

export function loadCompletedRun(brief?: VentureBrief): PreflightRun {
  const run = brief ? createRunFromBrief(brief) : createIdleRun();

  return {
    ...run,
    status: "complete",
    agents: run.agents.map((agent, index) => ({
      ...agent,
      status: "complete",
      startedAt: agent.startedAt ?? "2026-05-17T09:00:00.000Z",
      completedAt: agent.completedAt ?? "2026-05-17T09:12:00.000Z",
      logs: [sprintLogLines[index]]
    }))
  };
}
