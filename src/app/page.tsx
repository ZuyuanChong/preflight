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

const BACKEND_WARMUP_TIMEOUT_MS = 6000;

export default function Home() {
  const [brief, setBrief] = useState<VentureBrief>(demoBrief);
  const [run, setRun] = useState<PreflightRun>(() => createIdleRun());
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);
  const [notice, setNotice] = useState<string | undefined>(
    "Preparing the backend route for the first live run."
  );

  useEffect(() => {
    let cancelled = false;

    async function warmRunsRoute() {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), BACKEND_WARMUP_TIMEOUT_MS);

      try {
        const response = await fetch("/api/runs", {
          cache: "no-store",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Warmup returned HTTP ${response.status}.`);
        }

        if (!cancelled) {
          setNotice("Start preflight uses server-side OpenAI when available. Load completed demo remains the explicit fallback.");
        }
      } catch (error) {
        if (!cancelled) {
          const isAbort = error instanceof DOMException && error.name === "AbortError";
          setNotice(
            isAbort
              ? "Backend warmup is taking longer than expected. Start preflight is enabled and will retry the route."
              : error instanceof Error
              ? `Backend warmup did not finish cleanly: ${error.message}. Start preflight can still retry the route.`
              : "Backend warmup did not finish cleanly. Start preflight can still retry the route."
          );
        }
      } finally {
        window.clearTimeout(timeout);
        if (!cancelled) {
          setIsPreparing(false);
        }
      }
    }

    warmRunsRoute();

    return () => {
      cancelled = true;
    };
  }, []);

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
  const evidenceIds = useMemo(() => run.evidence.map((item) => item.id), [run.evidence]);

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
        setNotice(payload.warning || "OpenAI generation did not finish. Retry Start preflight or load the completed demo.");
        return;
      }

      if (!payload.run) {
        setNotice(payload.warning || "The server did not return a run. Retry Start preflight or load the completed demo.");
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
          ? `Live generation failed before a response was returned: ${error.message}. Retry Start preflight or load the completed demo.`
          : "Live generation failed before a response was returned. Retry Start preflight or load the completed demo."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function resetDemo() {
    setBrief(demoBrief);
    setRun(createIdleRun());
    setStep(0);
    setNotice("Demo reset. Start preflight will use OpenAI if the server can read OPENAI_API_KEY.");
  }

  function loadComplete() {
    setRun(loadCompletedRun(brief));
    setStep(0);
    setNotice("Loaded deterministic completed demo. Use Start preflight for OpenAI-generated output.");
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
          isGenerating={isGenerating}
          isPreparing={isPreparing}
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
              <p className="section-label">Decision system</p>
              <h2>Pre-build readout</h2>
            </div>
          </div>
          <p>
            Run the idea through a venture studio sprint. When the server has an OpenAI key, the readout is generated
            from the current intake; demo fallback still works with no keys.
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
