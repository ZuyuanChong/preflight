"use client";

import { useEffect, useMemo, useState } from "react";
import { ArtifactTabs } from "@/components/ArtifactTabs";
import { BlueprintPanel } from "@/components/BlueprintPanel";
import { EvidenceLedger } from "@/components/EvidenceLedger";
import { IntakePanel } from "@/components/IntakePanel";
import { MultiAgentSystemPanel } from "@/components/MultiAgentSystemPanel";
import { QualityGatePanel } from "@/components/QualityGatePanel";
import { RedTeamPanel } from "@/components/RedTeamPanel";
import { SprintDashboard } from "@/components/SprintDashboard";
import {
  applySprintStep,
  createIdleRun,
  emptyBrief,
  markRunStartupFailed,
  prepareRunForSprint,
  prepareRunForStartup
} from "@/lib/sprint";
import type { PreflightRun, VentureBrief } from "@/types/preflight";

interface RunResponse {
  mode: "demo" | "live" | "error";
  run?: PreflightRun;
  retryable?: boolean;
  warning?: string;
}

export default function Home() {
  const [brief, setBrief] = useState<VentureBrief>(emptyBrief);
  const [run, setRun] = useState<PreflightRun>(() => createIdleRun(emptyBrief));
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isArchitectureOpen, setArchitectureOpen] = useState(false);
  const [notice, setNotice] = useState<string | undefined>(
    "Enter a startup idea, then start Preflight to dispatch the agent sprint."
  );

  useEffect(() => {
    if (run.status !== "running") {
      return;
    }

    const timer = window.setTimeout(() => {
      setRun((currentRun) => applySprintStep(currentRun, step));
      setStep((currentStep) => currentStep + 1);
    }, step === 0 ? 250 : 720);

    return () => window.clearTimeout(timer);
  }, [run.status, step]);

  const isRunning = run.status === "running";
  const completedAgents = useMemo(
    () => run.agents.filter((agent) => agent.status === "complete").length,
    [run.agents]
  );
  const sprintProgress = Math.round((completedAgents / run.agents.length) * 100);
  const runStatusLabel = {
    idle: "Idle",
    starting: "Starting",
    running: "Running",
    complete: "Complete",
    failed: "Needs attention"
  }[run.status];
  const signalCounts = useMemo(
    () => ({
      sources: run.evidence.filter((item) => item.kind === "source").length,
      assumptions: run.evidence.filter((item) => item.kind === "assumption").length,
      gateIssues: run.qualityIssues.length
    }),
    [run.evidence, run.qualityIssues]
  );
  const evidenceIds = useMemo(() => run.evidence.map((item) => item.id), [run.evidence]);
  const sectionRailItems = useMemo(
    () => [
      {
        number: "01",
        targetId: "intake-heading",
        title: "Intake",
        caption: "Edit founder brief",
        status: brief.idea.trim() ? "Ready" : "Needs idea",
        tone: brief.idea.trim() ? "ready" : "attention"
      },
      {
        number: "02",
        targetId: "agents",
        title: "Agents",
        caption: `${run.multiAgentSystem.agents.length} role contracts`,
        status: isArchitectureOpen ? "Open" : "Review",
        tone: isArchitectureOpen ? "active" : "ready"
      },
      {
        number: "03",
        targetId: "sprint-heading",
        title: "Sprint",
        caption: `${completedAgents}/${run.agents.length} agents complete`,
        status: run.status === "running" || run.status === "starting" ? `${sprintProgress}%` : runStatusLabel,
        tone: run.status === "running" || run.status === "starting" ? "active" : "ready"
      },
      {
        number: "04",
        targetId: "evidence-heading",
        title: "Evidence",
        caption: `${signalCounts.sources} sources / ${signalCounts.assumptions} assumptions`,
        status: `${signalCounts.gateIssues} gate issues`,
        tone: signalCounts.gateIssues > 0 ? "attention" : "ready"
      },
      {
        number: "05",
        targetId: "blueprint-heading",
        title: "Blueprint",
        caption: run.status === "complete" ? run.finalVerdict.decision : "Verdict locked",
        status: run.status === "complete" ? "Unlocked" : "Locked",
        tone: run.status === "complete" ? "active" : "locked"
      },
      {
        number: "06",
        targetId: "artifacts-heading",
        title: "Artifacts",
        caption: `${run.artifacts.length} founder outputs`,
        status: run.status === "complete" ? "Ready" : "Preview",
        tone: run.status === "complete" ? "active" : "ready"
      }
    ],
    [
      brief.idea,
      completedAgents,
      isArchitectureOpen,
      run.agents.length,
      run.artifacts.length,
      run.finalVerdict.decision,
      run.multiAgentSystem.agents.length,
      run.status,
      runStatusLabel,
      signalCounts.assumptions,
      signalCounts.gateIssues,
      signalCounts.sources,
      sprintProgress
    ]
  );

  function handleSectionRailClick(targetId: string) {
    if (targetId === "agents") {
      setArchitectureOpen(true);
    }

    window.history.replaceState(null, "", `#${targetId}`);
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function startSprint() {
    const startupStartedAt = performance.now();

    async function holdStartupFrame() {
      const remainingMs = Math.max(0, 450 - (performance.now() - startupStartedAt));

      if (remainingMs > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingMs));
      }
    }

    setIsGenerating(true);
    setRun(prepareRunForStartup(createIdleRun(brief)));
    setStep(0);
    setNotice("Initializing workspace. Agents are starting while the server prepares the venture preflight.");

    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ brief })
      });

      const payload = (await response.json()) as RunResponse;

      if (!response.ok) {
        const warning = payload.warning || "Preflight could not start. Check the brief and try again.";
        await holdStartupFrame();
        setRun((currentRun) => markRunStartupFailed(currentRun, warning));
        setNotice(warning);
        return;
      }

      if (!payload.run) {
        const warning = payload.warning || "The server did not return a run. Retry Start Preflight to try again.";
        await holdStartupFrame();
        setRun((currentRun) => markRunStartupFailed(currentRun, warning));
        setNotice(warning);
        return;
      }

      const nextRun = prepareRunForSprint(payload.run);
      await holdStartupFrame();
      setRun(applySprintStep(nextRun, 0));
      setStep(1);
      setNotice(
        payload.mode === "live"
          ? "OpenAI generated this run from the current intake. Sources without URLs remain labeled as assumptions."
          : "Preflight generated a local run package from the current intake."
      );
    } catch (error) {
      const warning =
        error instanceof Error
          ? `Live generation failed before a response was returned: ${error.message}. Retry Start Preflight to try again.`
          : "Live generation failed before a response was returned. Retry Start Preflight to try again.";
      await holdStartupFrame();
      setRun((currentRun) => markRunStartupFailed(currentRun, warning));
      setNotice(warning);
    } finally {
      setIsGenerating(false);
    }
  }

  function resetWorkspace() {
    setBrief(emptyBrief);
    setRun(createIdleRun(emptyBrief));
    setStep(0);
    setNotice("Workspace reset. Enter a new idea to start a fresh preflight.");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <strong>Preflight</strong>
          <span>AI Venture Preflight</span>
        </div>
        <div className="topbar-status" aria-label="Run status summary">
          <span className={`status-pill status-${run.status}`}>{runStatusLabel}</span>
          <span>{completedAgents}/{run.agents.length} agents</span>
          <span>{signalCounts.sources} sources</span>
        </div>
      </header>

      <nav className="journey-strip section-rail" aria-label="Preflight workspace shortcuts">
        {sectionRailItems.map((item) => (
          <button
            aria-label={`Go to ${item.title}: ${item.caption}`}
            className={`journey-card journey-card-${item.tone}`}
            data-target={item.targetId}
            key={item.title}
            onClick={() => handleSectionRailClick(item.targetId)}
            type="button"
          >
            <span>{item.number}</span>
            <strong>{item.title}</strong>
            <small>{item.caption}</small>
            <em>{item.status}</em>
          </button>
        ))}
      </nav>

      <section className="workspace-grid" aria-label="Preflight workspace">
        <IntakePanel
          brief={brief}
          isRunning={isRunning}
          isGenerating={isGenerating}
          notice={notice}
          onBriefChange={setBrief}
          onStart={startSprint}
          onReset={resetWorkspace}
        />

        <section className="panel summary-panel" aria-label="Preflight summary">
          <div className="panel-heading">
            <div>
              <p className="section-label">Decision preview</p>
              <h2>Pre-build readout</h2>
            </div>
            <span className="preview-chip">Command center</span>
          </div>
          <p>
            Run the idea through a live venture studio sprint, then inspect the verdict, evidence, trust checks, and
            founder packet from one aligned blueprint. The operating layer now exposes agent ownership, handoffs,
            shared memory, and reviewer feedback loops.
          </p>
          <div className="metric-grid">
            <div>
              <span>Verdict</span>
              <strong>{run.status === "complete" ? run.finalVerdict.decision : "Locked"}</strong>
            </div>
            <div>
              <span>Sources</span>
              <strong>{signalCounts.sources}</strong>
            </div>
            <div>
              <span>Assumptions</span>
              <strong>{signalCounts.assumptions}</strong>
            </div>
            <div>
              <span>Gate issues</span>
              <strong>{signalCounts.gateIssues}</strong>
            </div>
          </div>
          <div className="brief-stack">
            <strong>Current ICP</strong>
            <p>{brief.targetCustomer || "Not provided"}</p>
            <strong>Business model hypothesis</strong>
            <p>{brief.businessModel || "Not provided"}</p>
          </div>
        </section>
      </section>

      <MultiAgentSystemPanel run={run} open={isArchitectureOpen} onOpenChange={setArchitectureOpen} />

      <section className="content-grid">
        <SprintDashboard run={run} />
        <BlueprintPanel run={run} />
      </section>

      <section className="content-grid lower-grid">
        <EvidenceLedger evidence={run.evidence} />
        <QualityGatePanel issues={run.qualityIssues} />
      </section>

      <section className="content-grid lower-grid">
        <RedTeamPanel run={run} />
        <ArtifactTabs
          artifacts={run.artifacts}
          brief={run.brief}
          verdict={run.finalVerdict}
          evidenceIds={evidenceIds}
        />
      </section>
    </main>
  );
}
