"use client";

import type { VentureBrief } from "@/types/preflight";

interface IntakePanelProps {
  brief: VentureBrief;
  isRunning: boolean;
  isGenerating: boolean;
  isPreparing: boolean;
  modeLabel: string;
  notice?: string;
  onBriefChange: (brief: VentureBrief) => void;
  onStart: () => void;
  onLoadComplete: () => void;
  onReset: () => void;
}

export function IntakePanel({
  brief,
  isRunning,
  isGenerating,
  isPreparing,
  modeLabel,
  notice,
  onBriefChange,
  onStart,
  onLoadComplete,
  onReset
}: IntakePanelProps) {
  function updateField(field: keyof VentureBrief, value: string) {
    onBriefChange({
      ...brief,
      [field]: value,
      problem:
        field === "idea"
          ? "The founder needs a pre-build read on whether this idea deserves focused build time."
          : brief.problem,
      solution:
        field === "idea"
          ? "Run an AI venture preflight that returns evidence, gates, critique, and artifacts."
          : brief.solution
    });
  }

  return (
    <section className="panel intake-panel" aria-labelledby="intake-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Preflight console</p>
          <h1 id="intake-heading">Intake</h1>
        </div>
        <span className="mode-chip">{modeLabel}</span>
      </div>

      <label>
        Startup idea
        <textarea
          value={brief.idea}
          onChange={(event) => updateField("idea", event.target.value)}
          rows={4}
          placeholder="Describe the startup idea in one or two sentences."
        />
      </label>

      <label>
        Target customer
        <input
          value={brief.targetCustomer}
          onChange={(event) => updateField("targetCustomer", event.target.value)}
          placeholder="Who feels the pain first?"
        />
      </label>

      <div className="two-column-inputs">
        <label>
          Geography
          <input
            value={brief.geography}
            onChange={(event) => updateField("geography", event.target.value)}
            placeholder="Market or community"
          />
        </label>
        <label>
          Business model
          <input
            value={brief.businessModel ?? ""}
            onChange={(event) => updateField("businessModel", event.target.value)}
            placeholder="Optional"
          />
        </label>
      </div>

      <div className="button-row">
        <button
          className="primary-button"
          onClick={onStart}
          disabled={isPreparing || isRunning || isGenerating || !brief.idea.trim()}
        >
          {isPreparing ? "Preparing backend" : isGenerating ? "Generating live run" : isRunning ? "Sprint running" : "Start preflight"}
        </button>
        <button className="secondary-button" onClick={onLoadComplete} disabled={isRunning || isGenerating}>
          Load completed demo
        </button>
        <button className="ghost-button" onClick={onReset} disabled={isRunning || isGenerating}>
          Reset
        </button>
      </div>

      {notice ? (
        <div className="notice-strip" role="status">
          {notice}
        </div>
      ) : null}

      <div className="assumption-strip">
        <strong>Brief framing</strong>
        <span>{brief.problem}</span>
      </div>
    </section>
  );
}
