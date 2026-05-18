import type { QualityIssue } from "@/types/preflight";

export function QualityGatePanel({ issues }: { issues: QualityIssue[] }) {
  const failCount = issues.filter((issue) => issue.severity === "fail").length;
  const warnCount = issues.filter((issue) => issue.severity === "warn").length;
  const hasIssues = issues.length > 0;

  return (
    <section className="panel quality-panel" aria-labelledby="quality-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Quality gates</p>
          <h2 id="quality-heading">Trust checks</h2>
        </div>
        <span className="quality-summary">{hasIssues ? `${failCount} fail / ${warnCount} warn` : "Not run"}</span>
      </div>

      <div className="trust-layer-callout">
        <span>Trust layer</span>
        <strong>
          {hasIssues
            ? failCount > 0
              ? "Blocks Proceed until proof improves"
              : "Proceed allowed by current checks"
            : "Awaiting sprint output"}
        </strong>
        <p>
          {hasIssues
            ? "Preflight marks weak claims before they become founder decisions."
            : "Quality gates appear after a preflight run creates claims to review."}
        </p>
      </div>

      <div className="issue-list">
        {hasIssues ? (
          issues.map((issue) => (
            <article className={`issue-card severity-${issue.severity}`} key={issue.id}>
              <div>
                <span>{issue.type.replaceAll("_", " ")}</span>
                <strong>{issue.message}</strong>
              </div>
              <em>{issue.severity === "fail" ? "Blocks Proceed" : "Review before claim"}</em>
              <p>{issue.suggestedFix}</p>
            </article>
          ))
        ) : (
          <div className="locked-state">
            <strong>No quality issues recorded</strong>
            <p>Run Preflight to generate claims, checks, and suggested fixes.</p>
          </div>
        )}
      </div>
    </section>
  );
}
