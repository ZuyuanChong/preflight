import type { ReactNode } from "react";
import type { AgentType, PreflightRun } from "@/types/preflight";

const typeLabels: Record<AgentType, string> = {
  orchestrator: "Orchestrator",
  intake: "Intake",
  specialist: "Specialist",
  review: "Review",
  finalization: "Finalization"
};

interface MultiAgentSystemPanelProps {
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  run: PreflightRun;
}

export function MultiAgentSystemPanel({ onOpenChange, open, run }: MultiAgentSystemPanelProps) {
  const system = run.multiAgentSystem;
  const revisionCount = system.handoffs.filter((handoff) => handoff.status === "revision_requested").length;
  const sharedMemoryCount = system.memory.filter((item) => item.visibility === "shared").length;
  const agentsByType = system.agents.reduce<Record<AgentType, typeof system.agents>>(
    (groups, agent) => {
      groups[agent.agentType].push(agent);
      return groups;
    },
    {
      orchestrator: [],
      intake: [],
      specialist: [],
      review: [],
      finalization: []
    }
  );

  return (
    <details
      className="panel multi-agent-panel collapsible-panel"
      id="agents"
      aria-labelledby="multi-agent-heading"
      onToggle={(event) => onOpenChange?.(event.currentTarget.open)}
      open={open}
    >
      <summary className="collapsible-summary">
        <div>
          <p className="section-label">Multi-agent system</p>
          <h2 id="multi-agent-heading">Operating architecture</h2>
          <p>{system.overview}</p>
        </div>
        <span className="summary-actions">
          <span className="preview-chip">{system.operatingMode.replace("-", " ")}</span>
          <span className="collapse-indicator" aria-hidden="true" />
        </span>
      </summary>

      <div className="collapsible-body">
        <div className="metric-grid multi-agent-metrics">
          <div>
            <span>Agents</span>
            <strong>{system.agents.length}</strong>
          </div>
          <div>
            <span>Handoffs</span>
            <strong>{system.handoffs.length}</strong>
          </div>
          <div>
            <span>Shared memory</span>
            <strong>{sharedMemoryCount}</strong>
          </div>
          <div>
            <span>Revision loops</span>
            <strong>{revisionCount}</strong>
          </div>
        </div>

        <div className="architecture-grid">
          <CollapsibleCard title="Agent ownership" subtitle="No overlapping owners" defaultOpen>
            <div className="agent-contract-groups">
              {(Object.keys(agentsByType) as AgentType[]).map((type) => (
                <div className="contract-group" key={type}>
                  <span>{typeLabels[type]}</span>
                  {agentsByType[type].map((agent) => (
                    <article key={agent.id}>
                      <strong>{agent.agentName}</strong>
                      <p>{agent.purpose}</p>
                      <small>Must not: {agent.mustNotDo[0]}</small>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="Workflow map" subtitle="Sequential and parallel passes">
            <ol className="workflow-list">
              {system.workflow.map((step) => (
                <li key={step.id}>
                  <div>
                    <span>{step.mode}</span>
                    <strong>{step.title}</strong>
                  </div>
                  <p>{step.output}</p>
                  <small>{step.agents.join(" -> ")}</small>
                </li>
              ))}
            </ol>
          </CollapsibleCard>
        </div>

        <div className="architecture-grid lower-architecture-grid">
          <CollapsibleCard title="Handoff protocol" subtitle="Explicit transfer of work">
            <div className="handoff-list">
              {system.handoffs.map((handoff) => (
                <article className={`handoff-card handoff-${handoff.status}`} key={handoff.id}>
                  <div>
                    <span>{handoff.status.replace("_", " ")}</span>
                    <strong>
                      {handoff.fromAgent} to {handoff.toAgent}
                    </strong>
                  </div>
                  <p>{handoff.taskCompleted}</p>
                  <small>Next: {handoff.recommendedNextStep}</small>
                </article>
              ))}
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="Shared context" subtitle="Memory and reviewer loop">
            <div className="memory-list">
              {system.memory.map((item) => (
                <article key={item.id}>
                  <div>
                    <span>{item.kind.replace("_", " ")}</span>
                    <strong>{item.title}</strong>
                  </div>
                  <p>{item.detail}</p>
                  <small>
                    {item.ownerAgent} / {item.visibility}
                  </small>
                </article>
              ))}
            </div>
          </CollapsibleCard>
        </div>

        <CollapsibleCard title="Quality-control loop" subtitle="Approve or revise" className="review-loop-card">
          <div className="review-finding-grid">
            {system.reviewFindings.map((finding) => (
              <article className={`review-finding severity-${finding.severity}`} key={finding.id}>
                <span>{finding.status.replace("_", " ")}</span>
                <strong>{finding.check}</strong>
                <p>{finding.finding}</p>
                <small>{finding.requiredAction}</small>
              </article>
            ))}
          </div>
        </CollapsibleCard>
      </div>
    </details>
  );
}

function CollapsibleCard({
  children,
  className,
  defaultOpen = false,
  subtitle,
  title
}: {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  subtitle: string;
  title: string;
}) {
  return (
    <details className={`architecture-card collapsible-card ${className ?? ""}`} open={defaultOpen}>
      <summary className="architecture-heading collapsible-card-summary">
        <span>
          <h3>{title}</h3>
          <small>{subtitle}</small>
        </span>
        <span className="collapse-indicator" aria-hidden="true" />
      </summary>
      <div className="collapsible-card-body">{children}</div>
    </details>
  );
}
