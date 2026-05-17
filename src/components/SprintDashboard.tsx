import type { PreflightRun } from "@/types/preflight";

interface SprintDashboardProps {
  run: PreflightRun;
}

export function SprintDashboard({ run }: SprintDashboardProps) {
  const completed = run.agents.filter((agent) => agent.status === "complete").length;
  const progress = Math.round((completed / run.agents.length) * 100);
  const activeLogs = run.agents.flatMap((agent) => agent.logs.map((log) => ({ agent: agent.agentName, log })));
  const activeAgent = run.agents.find((agent) => agent.status === "running");

  return (
    <section className="panel sprint-panel" aria-labelledby="sprint-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Live sprint</p>
          <h2 id="sprint-heading">Agent studio</h2>
        </div>
        <span className={`status-pill status-${run.status}`}>{run.status}</span>
      </div>

      <div className="progress-row">
        <div>
          <strong>{progress}% complete</strong>
          <span>{completed} of {run.agents.length} agents finished</span>
        </div>
        <div className="progress-track" aria-label={`Sprint progress ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="active-agent-card">
        <span>Current mission</span>
        <strong>{activeAgent ? activeAgent.agentName : run.status === "complete" ? "Sprint complete" : "Awaiting dispatch"}</strong>
        <p>
          {activeAgent
            ? activeAgent.summary || activeAgent.role
            : run.status === "complete"
              ? "All specialist passes are complete. The blueprint and artifacts are unlocked."
              : "Start the preflight to dispatch the venture studio agents."}
        </p>
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
              <p>{agent.summary || agent.role}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="log-panel">
        <strong>Sprint log</strong>
        {activeLogs.length === 0 ? (
          <p>No sprint logs yet. Start the preflight to dispatch agents.</p>
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
