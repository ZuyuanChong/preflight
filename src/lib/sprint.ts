import type { AgentRun, PreflightRun, VentureBrief } from "@/types/preflight";
import { demoRun } from "@/data/demo-run";
import { buildArtifacts } from "@/lib/artifacts";
import { agentSprintLogLines, buildMultiAgentSystem } from "@/lib/multi-agent";

export const sprintLogLines = agentSprintLogLines;

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
    artifacts: buildArtifacts(brief, demoRun.finalVerdict),
    multiAgentSystem: buildMultiAgentSystem({
      brief,
      mode: "demo",
      evidence: demoRun.evidence,
      qualityIssues: demoRun.qualityIssues,
      verdict: demoRun.finalVerdict,
      redTeamObjections: demoRun.redTeamObjections
    })
  };
}

export function prepareRunForSprint(run: PreflightRun): PreflightRun {
  return {
    ...run,
    status: "idle",
    agents: run.agents.map((agent) => ({
      ...agent,
      status: "queued",
      startedAt: undefined,
      completedAt: undefined,
      logs: []
    }))
  };
}

export function prepareRunForStartup(run: PreflightRun): PreflightRun {
  const now = new Date().toISOString();

  return {
    ...run,
    status: "starting",
    agents: run.agents.map((agent) => ({
      ...agent,
      status: "starting",
      startedAt: now,
      completedAt: undefined,
      logs: []
    }))
  };
}

export function markRunStartupFailed(run: PreflightRun, message: string): PreflightRun {
  const now = new Date().toISOString();

  return {
    ...run,
    status: "failed",
    agents: run.agents.map((agent, index) => ({
      ...agent,
      status: index === 0 ? "failed" : "blocked",
      startedAt: index === 0 ? agent.startedAt ?? now : undefined,
      completedAt: index === 0 ? now : undefined,
      logs: index === 0 ? [message] : [],
      summary:
        index === 0
          ? "Startup failed before the venture studio could dispatch. Retry or load the completed demo."
          : "Waiting for a successful startup before this specialist can run."
    }))
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
