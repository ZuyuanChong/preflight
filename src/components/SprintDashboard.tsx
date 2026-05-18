import type { PreflightRun } from "@/types/preflight";

interface SprintDashboardProps {
  run: PreflightRun;
}

export function SprintDashboard({ run }: SprintDashboardProps) {
  const completed = run.agents.filter((agent) => agent.status === "complete").length;
  const starting = run.agents.filter((agent) => agent.status === "starting").length;
  const running = run.agents.filter((agent) => agent.status === "running").length;
  const blocked = run.agents.filter((agent) => agent.status === "blocked" || agent.status === "failed").length;
  const progress = Math.round((completed / run.agents.length) * 100);
  const displayProgress = run.status === "starting" ? 12 : progress;
  const activeLogs = run.agents.flatMap((agent) => agent.logs.map((log) => ({ agent: agent.agentName, log })));
  const activeAgent = run.agents.find((agent) => agent.status === "running");
  const activeAgentIndex = run.agents.findIndex((agent) => agent.status === "running");
  const currentStageIndex =
    activeAgentIndex >= 0
      ? activeAgentIndex
      : run.status === "complete"
        ? run.agents.length - 1
        : run.status === "idle"
          ? 0
          : Math.min(completed, run.agents.length - 1);
  const remainingAgents = Math.max(run.agents.length - completed, 0);
  const statusLabel = {
    idle: "Idle",
    starting: "Starting",
    running: "Running",
    complete: "Complete",
    failed: "Needs attention"
  }[run.status];
  const progressHeadline = activeAgent
    ? `Running ${activeAgent.agentName}`
    : run.status === "starting"
      ? "Preparing backend run package"
      : run.status === "complete"
        ? "Agent sprint complete"
        : run.status === "failed"
          ? "Backend startup needs attention"
          : "Ready to dispatch agents";
  const progressDetail = activeAgent
    ? `Stage ${currentStageIndex + 1} of ${run.agents.length}. ${remainingAgents} specialist pass${remainingAgents === 1 ? "" : "es"} remaining.`
    : run.status === "starting"
      ? "Provisioning agent workspaces and waiting for the run package."
      : run.status === "complete"
        ? "All specialist passes are complete and the blueprint is unlocked."
        : run.status === "failed"
          ? "Retry Start Preflight or load the completed demo when you want a deterministic fallback."
          : "Start Preflight to begin the backend agent workflow.";

  const missionTitle = activeAgent
    ? activeAgent.agentName
    : run.status === "starting"
      ? "Initializing workspace"
      : run.status === "complete"
        ? "Sprint complete"
        : run.status === "failed"
          ? "Startup needs attention"
          : "Awaiting dispatch";

  const missionDetail = activeAgent
    ? activeAgent.summary || activeAgent.role
    : run.status === "starting"
      ? `${starting || run.agents.length} specialist agents are starting. Preflight is validating the brief and waiting for the run package before the first active pass.`
      : run.status === "complete"
        ? "All specialist passes are complete. The blueprint and artifacts are unlocked."
        : run.status === "failed"
          ? "The last startup attempt failed before agents could run. Retry Start Preflight or load the completed demo."
          : "Start the preflight to dispatch the venture studio agents.";

  function agentDescription(agent: PreflightRun["agents"][number]) {
    if (agent.status === "starting") {
      return "Starting agent workspace and loading role context.";
    }

    if (agent.status === "blocked") {
      return "Waiting for a successful startup before this specialist can run.";
    }

    return agent.summary || agent.role;
  }

  return (
    <section className={`panel sprint-panel sprint-panel-${run.status}`} aria-labelledby="sprint-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Live sprint</p>
          <h2 id="sprint-heading">Agent studio</h2>
        </div>
        <span className={`status-pill status-${run.status}`}>{statusLabel}</span>
      </div>

      <div className="progress-dashboard" aria-label="Backend agent progress">
        <div className="progress-head">
          <div>
            <span>Backend activity</span>
            <strong>{progressHeadline}</strong>
            <p>{progressDetail}</p>
          </div>
          <strong className="progress-percent">{displayProgress}%</strong>
        </div>

        <div
          className="progress-track progress-track-enhanced"
          aria-label={
            run.status === "starting" ? `Startup readiness ${displayProgress}%` : `Sprint progress ${progress}%`
          }
        >
          <span className="progress-fill" style={{ width: `${displayProgress}%` }} />
        </div>

        <div className="agent-step-rail" aria-label="Agent step status">
          {run.agents.map((agent, index) => (
            <span
              aria-label={`${index + 1}. ${agent.agentName}: ${agent.status}`}
              className={`agent-step agent-step-${agent.status}`}
              key={agent.id}
              title={`${agent.agentName}: ${agent.status}`}
            >
              <span>{index + 1}</span>
            </span>
          ))}
        </div>

        <div className="progress-foot">
          <span>Current: {run.status === "idle" ? "Not started" : run.agents[currentStageIndex]?.agentName}</span>
          <span>{completed}/{run.agents.length} finished</span>
          <span>{remainingAgents} remaining</span>
        </div>
      </div>

      {run.status === "starting" ? (
        <div className="startup-cues" aria-label="Startup readiness cues">
          <div className="startup-cue">
            <span aria-hidden="true" />
            <strong>Workspace</strong>
            <small>Initializing</small>
          </div>
          <div className="startup-cue">
            <span aria-hidden="true" />
            <strong>Agents</strong>
            <small>Starting</small>
          </div>
          <div className="startup-cue">
            <span aria-hidden="true" />
            <strong>Run package</strong>
            <small>Waiting</small>
          </div>
        </div>
      ) : null}

      <div className="active-agent-card" aria-live="polite">
        <span>Current mission</span>
        <strong>{missionTitle}</strong>
        <p>{missionDetail}</p>
      </div>

      <details className="agent-roster">
        <summary className="agent-roster-summary">
          <span>
            <strong>Agent roster</strong>
            <small>{completed} complete / {running || starting} active / {blocked} blocked</small>
          </span>
          <span className="collapse-indicator" aria-hidden="true" />
        </summary>
        <div className="agent-list">
          {run.agents.map((agent) => (
            <article className={`agent-row agent-row-${agent.status}`} key={agent.id}>
              <span className={`status-dot dot-${agent.status}`} aria-hidden="true" />
              <div>
                <div className="agent-title">
                  <strong>{agent.agentName}</strong>
                  <span className="role-chip">{agent.status}</span>
                </div>
                <p>{agentDescription(agent)}</p>
              </div>
            </article>
          ))}
        </div>
      </details>

      <div className="log-panel" aria-live="polite">
        <strong>Sprint log</strong>
        {activeLogs.length === 0 ? (
          <p>
            {run.status === "starting"
              ? "Initializing workspace. Agents are provisioning in the background before the first sprint log lands."
              : "No sprint logs yet. Start the preflight to dispatch agents."}
          </p>
        ) : (
          <ul>
            {activeLogs.slice(-6).map((entry, index) => (
              <li key={`${entry.agent}-${index}`}>
                <span>{entry.agent}</span>
                {entry.log}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
