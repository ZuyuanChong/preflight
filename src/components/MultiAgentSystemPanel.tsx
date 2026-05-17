import type { ReactNode } from "react";
import type { AgentTool, AgentType, PreflightRun } from "@/types/preflight";

const typeLabels: Record<AgentType, string> = {
  orchestrator: "Orchestrator",
  intake: "Intake",
  specialist: "Specialist",
  review: "Review",
  finalization: "Finalization"
};

const availabilityLabels: Record<AgentTool["availability"], string> = {
  always: "always on",
  demo_seeded: "demo seeded",
  optional_live: "optional live"
};

interface MultiAgentSystemPanelProps {
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  run: PreflightRun;
}

export function MultiAgentSystemPanel({ onOpenChange, open, run }: MultiAgentSystemPanelProps) {
  const system = run.multiAgentSystem;
  const revisionCount = system.handoffs.filter((handoff) => handoff.status === "revision_requested").length;
  const toolCount = new Set(system.agents.flatMap((agent) => agent.tools.map((toolItem) => toolItem.id))).size;
  const logsByAgent = new Map(system.activityLogs.map((log) => [log.agentId, log]));
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
            <span>Tool profiles</span>
            <strong>{toolCount}</strong>
          </div>
          <div>
            <span>Inspectable logs</span>
            <strong>{system.activityLogs.length}</strong>
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
                      <em>{agent.llmProfile}</em>
                      <p>{agent.purpose}</p>
                      <div className="capability-chip-list" aria-label={`${agent.agentName} capabilities`}>
                        {agent.capabilities.slice(0, 3).map((capability) => (
                          <span className="capability-chip" key={capability}>
                            {capability}
                          </span>
                        ))}
                      </div>
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

        <CollapsibleCard title="Specialized tool access" subtitle="Role-specific LLM capabilities" className="tool-access-card">
          <div className="tool-matrix">
            {system.agents.map((agent) => (
              <article key={agent.id}>
                <div>
                  <span>{typeLabels[agent.agentType]}</span>
                  <strong>{agent.agentName}</strong>
                </div>
                <p>{agent.llmProfile}</p>
                <div className="tool-chip-list" aria-label={`${agent.agentName} tools`}>
                  {agent.tools.map((toolItem) => (
                    <span className={`tool-chip tool-${toolItem.category}`} key={toolItem.id}>
                      {toolItem.label}
                      <small>{availabilityLabels[toolItem.availability]}</small>
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </CollapsibleCard>

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

        <CollapsibleCard title="Agent activity logs" subtitle="Inspectable independent LLM work" className="activity-log-section">
          <div className="agent-activity-list">
            {system.agents.map((agent) => {
              const activityLog = logsByAgent.get(agent.id);

              return (
                <details className="agent-activity-card" key={agent.id}>
                  <summary>
                    <span>
                      <strong>{agent.agentName}</strong>
                      <small>{agent.llmProfile}</small>
                    </span>
                    <em>{activityLog?.status ?? "queued"}</em>
                  </summary>
                  {activityLog ? (
                    <div className="agent-activity-body">
                      <div>
                        <span>Task handled</span>
                        <p>{activityLog.task}</p>
                      </div>
                      <div>
                        <span>Tools used</span>
                        <div className="tool-chip-list">
                          {activityLog.toolsUsed.map((toolName) => (
                            <span className="tool-chip" key={toolName}>
                              {toolName}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span>Reasoning summary</span>
                        <ul>
                          {activityLog.reasoningSummary.map((summary) => (
                            <li key={summary}>{summary}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span>Output</span>
                        <p>{activityLog.output}</p>
                      </div>
                      {activityLog.handoffTo ? <small>Handoff to: {activityLog.handoffTo}</small> : null}
                    </div>
                  ) : (
                    <div className="agent-activity-body">
                      <p>No activity has been recorded for this agent yet.</p>
                    </div>
                  )}
                </details>
              );
            })}
          </div>
        </CollapsibleCard>

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
