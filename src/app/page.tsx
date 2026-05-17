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
import { applySprintStep, createIdleRun, loadCompletedRun, prepareRunForSprint } from "@/lib/sprint";
import type { PreflightRun, VentureBrief } from "@/types/preflight";

interface RunResponse {
  mode: "demo" | "live" | "error";
  run?: PreflightRun;
  retryable?: boolean;
  warning?: string;
}

const journeySteps = [
  ["01", "Intake", "Founder brief"],
  ["02", "Agent Sprint", "Specialist pass"],
  ["03", "Quality Gates", "Trust checks"],
  ["04", "Founder Blueprint", "Decision packet"]
];

export default function Home() {
  const [brief, setBrief] = useState<VentureBrief>(demoBrief);
  const [run, setRun] = useState<PreflightRun>(() => createIdleRun());
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState<string | undefined>(
    "Start Preflight requests the server when clicked. Load completed demo remains the explicit fallback."
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
  const signalCounts = useMemo(
    () => ({
      sources: run.evidence.filter((item) => item.kind === "source").length,
      assumptions: run.evidence.filter((item) => item.kind === "assumption").length,
      gateIssues: run.qualityIssues.length
    }),
    [run.evidence, run.qualityIssues]
  );

  async function startSprint() {
    setIsGenerating(true);
    setNotice("Asking the server to generate a venture preflight from this intake.");

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
        setNotice(payload.warning || "OpenAI generation did not finish. Retry Start Preflight or load the completed demo.");
        return;
      }

      if (!payload.run) {
        setNotice(payload.warning || "The server did not return a run. Retry Start Preflight or load the completed demo.");
        return;
      }

      const nextRun = prepareRunForSprint(payload.run);
      setRun(applySprintStep(nextRun, 0));
      setStep(1);
      setNotice(
        payload.warning ||
          (payload.mode === "live"
            ? "OpenAI generated this run from the current intake. Sources without URLs remain labeled as assumptions."
            : "Demo fallback generated this run because live mode is unavailable.")
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? `Live generation failed before a response was returned: ${error.message}. Retry Start Preflight or load the completed demo.`
          : "Live generation failed before a response was returned. Retry Start Preflight or load the completed demo."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function resetDemo() {
    setBrief(demoBrief);
    setRun(createIdleRun());
    setStep(0);
    setNotice("Demo reset. Start Preflight will use OpenAI if the server can read OPENAI_API_KEY.");
  }

  function loadComplete() {
    setRun(loadCompletedRun(brief));
    setStep(0);
    setNotice("Loaded deterministic completed demo. Use Start Preflight for OpenAI-generated output.");
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

      <section className="journey-strip" aria-label="Preflight journey">
        {journeySteps.map(([number, title, caption]) => (
          <article key={title}>
            <span>{number}</span>
            <strong>{title}</strong>
            <small>{caption}</small>
          </article>
        ))}
      </section>

      <section className="workspace-grid" aria-label="Preflight workspace">
        <IntakePanel
          brief={brief}
          isRunning={isRunning}
          isGenerating={isGenerating}
          modeLabel={run.mode === "live" ? "OpenAI live" : "Demo fallback"}
          notice={notice}
          onBriefChange={setBrief}
          onStart={startSprint}
          onLoadComplete={loadComplete}
          onReset={resetDemo}
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
            founder packet from one aligned blueprint. Server-side OpenAI generates the readout when available; demo
            fallback remains explicit.
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
