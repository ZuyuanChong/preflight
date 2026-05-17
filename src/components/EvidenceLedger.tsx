import type { EvidenceItem } from "@/types/preflight";

export function EvidenceLedger({ evidence }: { evidence: EvidenceItem[] }) {
  return (
    <section className="panel" aria-labelledby="evidence-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Evidence ledger</p>
          <h2 id="evidence-heading">Sources vs assumptions</h2>
        </div>
      </div>

      <div className="evidence-table">
        {evidence.map((item) => (
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
