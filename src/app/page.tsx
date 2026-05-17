"use client";

import { useEffect, useMemo, useState } from "react";
import { ArtifactTabs } from "@/components/ArtifactTabs";
import { BlueprintPanel } from "@/components/BlueprintPanel";
import { EvidenceLedger } from "@/components/EvidenceLedger";
import { IntakePanel } from "@/components/IntakePanel";
import { QualityGatePanel } from "@/components/QualityGatePanel";
import { RedTeamPanel } from "@/components/RedTeamPanel";
import { SprintDashboard } from "@/components/SprintDashboard";
import { demoBrief } from "@/data/demo-run";
import { applySprintStep, createIdleRun, createRunFromBrief, loadCompletedRun } from "@/lib/sprint";
import type { PreflightRun, VentureBrief } from "@/types/preflight";

export default function Home() {
  const [brief, setBrief] = useState<VentureBrief>(demoBrief);
  const [run, setRun] = useState<PreflightRun>(() => createIdleRun());
  const [step, setStep] = useState(0);

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
  const signalCounts = useMemo(
    () => ({
      sources: run.evidence.filter((item) => item.kind === "source").length,
      assumptions: run.evidence.filter((item) => item.kind === "assumption").length,
      gateIssues: run.qualityIssues.length
    }),
    [run.evidence, run.qualityIssues]
  );

  function startSprint() {
    const nextRun = createRunFromBrief(brief);
    setRun(applySprintStep(nextRun, 0));
    setStep(1);
  }

  function resetDemo() {
    setBrief(demoBrief);
    setRun(createIdleRun());
    setStep(0);
  }

  function loadComplete() {
    setRun(loadCompletedRun(brief));
    setStep(0);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <strong>Preflight</strong>
          <span>AI Venture Preflight</span>
        </div>
        <nav aria-label="Demo sections">
          <a href="#sprint-heading">Sprint</a>
          <a href="#blueprint-heading">Blueprint</a>
          <a href="#evidence-heading">Evidence</a>
          <a href="#artifacts-heading">Artifacts</a>
        </nav>
      </header>

      <section className="workspace-grid" aria-label="Preflight workspace">
        <IntakePanel
          brief={brief}
          isRunning={isRunning}
          onBriefChange={setBrief}
          onStart={startSprint}
          onLoadComplete={loadComplete}
          onReset={resetDemo}
        />

        <section className="panel summary-panel" aria-label="Preflight summary">
          <div className="panel-heading">
            <div>
              <p className="section-label">Decision system</p>
              <h2>Pre-build readout</h2>
            </div>
          </div>
          <p>
            Run the idea through a deterministic venture studio sprint. Demo mode works locally with no API keys and keeps
            sources separate from assumptions.
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
            <p>{run.brief.targetCustomer}</p>
            <strong>Business model hypothesis</strong>
            <p>{run.brief.businessModel || "Not provided"}</p>
          </div>
        </section>
      </section>

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
        <ArtifactTabs artifacts={run.artifacts} />
      </section>
    </main>
  );
}
