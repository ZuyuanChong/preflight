"use client";

import { useState } from "react";
import type { Artifact } from "@/types/preflight";

function renderMarkdown(markdown: string) {
  return markdown.split("\n").map((line, index) => {
    if (line.startsWith("# ")) {
      return <h3 key={index}>{line.replace("# ", "")}</h3>;
    }
    if (line.startsWith("## ")) {
      return <h4 key={index}>{line.replace("## ", "")}</h4>;
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

export function ArtifactTabs({ artifacts }: { artifacts: Artifact[] }) {
  const [activeId, setActiveId] = useState(artifacts[0]?.id);
  const active = artifacts.find((artifact) => artifact.id === activeId) ?? artifacts[0];

  return (
    <section className="panel artifacts-panel" aria-labelledby="artifacts-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Founder artifacts</p>
          <h2 id="artifacts-heading">Aligned outputs</h2>
        </div>
      </div>
      <p className="artifact-subtitle">Every artifact is generated from the same verdict, evidence ledger, and quality gates.</p>

      <div className="tabs" role="tablist" aria-label="Artifact tabs">
        {artifacts.map((artifact) => (
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
    </section>
  );
}
