"use client";

import { useMemo, useState } from "react";
import type { EvidenceItem } from "@/types/preflight";

export function EvidenceLedger({ evidence }: { evidence: EvidenceItem[] }) {
  const [filter, setFilter] = useState<"all" | "source" | "assumption" | "needs-validation">("all");
  const sourceCount = evidence.filter((item) => item.kind === "source").length;
  const assumptionCount = evidence.filter((item) => item.kind === "assumption").length;
  const needsValidationCount = evidence.filter((item) => !item.sourceUrl).length;
  const filteredEvidence = useMemo(() => {
    if (filter === "all") {
      return evidence;
    }
    if (filter === "needs-validation") {
      return evidence.filter((item) => !item.sourceUrl);
    }
    return evidence.filter((item) => item.kind === filter);
  }, [evidence, filter]);

  return (
    <section className="panel" aria-labelledby="evidence-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Evidence ledger</p>
          <h2 id="evidence-heading">Sources vs assumptions</h2>
        </div>
      </div>

      <div className="filter-chips" aria-label="Evidence filters">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
          All {evidence.length}
        </button>
        <button className={filter === "source" ? "active" : ""} onClick={() => setFilter("source")}>
          Sources {sourceCount}
        </button>
        <button className={filter === "assumption" ? "active" : ""} onClick={() => setFilter("assumption")}>
          Assumptions {assumptionCount}
        </button>
        <button
          className={filter === "needs-validation" ? "active" : ""}
          onClick={() => setFilter("needs-validation")}
        >
          Needs validation {needsValidationCount}
        </button>
      </div>

      <div className="evidence-table">
        {filteredEvidence.map((item) => (
          <article className="evidence-row" key={item.id}>
            <div>
              <span className={`kind-chip kind-${item.kind}`}>{item.kind}</span>
              <strong>{item.claim}</strong>
              <p>{item.summary}</p>
            </div>
            <div className="evidence-meta">
              <span>{item.agentName}</span>
              <span>Confidence: {item.confidence}</span>
              {item.sourceUrl ? (
                <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                  {item.sourceTitle}
                </a>
              ) : (
                <span>Needs validation</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
