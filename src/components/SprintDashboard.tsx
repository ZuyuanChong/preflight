import type { PreflightRun } from "@/types/preflight";

interface SprintDashboardProps {
  run: PreflightRun;
}

export function SprintDashboard({ run }: SprintDashboardProps) {
  const completed = run.agents.filter((agent) => agent.status === "complete").length;
  const starting = run.agents.filter((agent) => agent.status === "starting").length;
  const progress = Math.round((completed / run.agents.length) * 100);
  const displayProgress = run.status === "starting" ? 12 : progress;
  const activeLogs = run.agents.flatMap((agent) => agent.logs.map((log) => ({ agent: agent.agentName, log })));
  const activeAgent = run.agents.find((agent) => agent.status === "running");
  const statusLabel = {
    idle: "Idle",
    starting: "Starting",
    running: "Running",
    complete: "Complete",
    failed: "Needs attention"
  }[run.status];

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

      <div className="progress-row">
        <div>
          <strong>{run.status === "starting" ? "Initializing workspace" : `${progress}% complete`}</strong>
          <span>
            {run.status === "starting"
              ? `${starting || run.agents.length} agents provisioning. First active pass starts after setup.`
              : `${completed} of ${run.agents.length} agents finished`}
          </span>
        </div>
        <div
          className="progress-track"
          aria-label={
            run.status === "starting" ? `Startup readiness ${displayProgress}%` : `Sprint progress ${progress}%`
          }
        >
          <span style={{ width: `${displayProgress}%` }} />
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
