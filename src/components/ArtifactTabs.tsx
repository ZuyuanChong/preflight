"use client";

import { useEffect, useMemo, useState } from "react";
import { buildArtifacts } from "@/lib/artifacts";
import type { Artifact, ArtifactDepth, FinalVerdict, VentureBrief } from "@/types/preflight";

function renderMarkdown(markdown: string) {
  return markdown.split("\n").map((line, index) => {
    if (line.startsWith("# ")) {
      return <h3 key={index}>{line.replace("# ", "")}</h3>;
    }
    if (line.startsWith("## ")) {
      return <h4 key={index}>{line.replace("## ", "")}</h4>;
    }
    if (line.startsWith("### ")) {
      return <h5 key={index}>{line.replace("### ", "")}</h5>;
    }
    if (line.startsWith("- ")) {
      return <li key={index}>{line.replace("- ", "")}</li>;
    }
    if (/^\d+\./.test(line)) {
      return <li key={index}>{line}</li>;
    }
    if (!line.trim()) {
      return <span className="markdown-space" key={index} />;
    }
    return <p key={index}>{line}</p>;
  });
}

interface ArtifactTabsProps {
  artifacts: Artifact[];
  brief: VentureBrief;
  verdict: FinalVerdict;
  evidenceIds: string[];
}

const depthOptions: Array<{ value: ArtifactDepth; label: string }> = [
  { value: "executive", label: "Executive Summary" },
  { value: "detailed", label: "Detailed Report" }
];

export function ArtifactTabs({ artifacts, brief, verdict, evidenceIds }: ArtifactTabsProps) {
  const [activeId, setActiveId] = useState(artifacts[0]?.id);
  const [depth, setDepth] = useState<ArtifactDepth>("detailed");
  const renderedArtifacts = useMemo(() => {
    if (!artifacts.length) {
      return [];
    }

    return buildArtifacts(brief, verdict, evidenceIds, { depth });
  }, [artifacts.length, brief, depth, evidenceIds, verdict]);
  const active = renderedArtifacts.find((artifact) => artifact.id === activeId) ?? renderedArtifacts[0];

  useEffect(() => {
    if (renderedArtifacts.some((artifact) => artifact.id === activeId)) {
      return;
    }

    const nextActiveId = renderedArtifacts[0]?.id;
    if (activeId !== nextActiveId) {
      setActiveId(nextActiveId);
    }
  }, [activeId, renderedArtifacts]);

  return (
    <section className="panel artifacts-panel" aria-labelledby="artifacts-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Founder artifacts</p>
          <h2 id="artifacts-heading">Aligned outputs</h2>
        </div>
        <div className="depth-toggle" role="group" aria-label="Output depth">
          {depthOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={depth === option.value ? "active" : ""}
              onClick={() => setDepth(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <p className="artifact-subtitle">Every artifact is generated from the same verdict, evidence ledger, and quality gates.</p>

      {active ? (
        <>
          <div className="tabs" role="tablist" aria-label="Artifact tabs">
            {renderedArtifacts.map((artifact) => (
              <button
                key={artifact.id}
                className={artifact.id === active.id ? "active" : ""}
                onClick={() => setActiveId(artifact.id)}
                role="tab"
                aria-selected={artifact.id === active.id}
              >
                {artifact.title}
              </button>
            ))}
          </div>

          <article className="artifact-preview">
            <div className="artifact-meta">
              <span className={`severity-dot severity-${active.qualityStatus}`} />
              Quality: {active.qualityStatus}
              <span>{active.citationIds.length} linked evidence item(s)</span>
            </div>
            <div className="markdown-body">{renderMarkdown(active.markdown)}</div>
          </article>
        </>
      ) : (
        <div className="locked-state">
          <strong>No founder artifacts generated</strong>
          <p>Run Preflight or load the completed demo to unlock the artifact packet.</p>
        </div>
      )}
    </section>
  );
}
