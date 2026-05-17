import type { QualityIssue } from "@/types/preflight";

export function QualityGatePanel({ issues }: { issues: QualityIssue[] }) {
  const failCount = issues.filter((issue) => issue.severity === "fail").length;
  const warnCount = issues.filter((issue) => issue.severity === "warn").length;

  return (
    <section className="panel" aria-labelledby="quality-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Quality gates</p>
          <h2 id="quality-heading">Trust checks</h2>
        </div>
        <span className="quality-summary">{failCount} fail / {warnCount} warn</span>
      </div>

      <div className="issue-list">
        {issues.map((issue) => (
          <article className={`issue-card severity-${issue.severity}`} key={issue.id}>
            <div>
              <span>{issue.type.replaceAll("_", " ")}</span>
              <strong>{issue.message}</strong>
            </div>
            <p>{issue.suggestedFix}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
