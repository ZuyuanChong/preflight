import type { PreflightRun, VentureScorecard } from "@/types/preflight";

const scoreLabels: Record<keyof VentureScorecard, string> = {
  pain: "Pain",
  buyerClarity: "Buyer clarity",
  timing: "Timing",
  competition: "Competition pressure",
  distribution: "Distribution",
  monetization: "Monetization",
  feasibility: "Feasibility",
  evidenceQuality: "Evidence quality",
  redTeamSeverity: "Red-team severity"
};

export function BlueprintPanel({ run }: { run: PreflightRun }) {
  return (
    <section className="panel blueprint-panel" aria-labelledby="blueprint-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Blueprint</p>
          <h2 id="blueprint-heading">Final verdict</h2>
        </div>
        <span className="verdict-badge">{run.finalVerdict.decision}</span>
      </div>

      {run.status !== "complete" ? (
        <div className="locked-state">
          <strong>Verdict locked during sprint</strong>
          <p>Preflight reveals the final verdict only after the specialist agents complete their pass.</p>
        </div>
      ) : (
        <>
          <p className="verdict-copy">{run.finalVerdict.rationale}</p>
          <div className="wedge-callout">
            <span>Strongest wedge</span>
            <strong>{run.finalVerdict.strongestWedge}</strong>
          </div>

          <div className="score-grid">
            {Object.entries(run.scorecard).map(([key, value]) => (
              <div className="score-row" key={key}>
                <span>{scoreLabels[key as keyof VentureScorecard]}</span>
                <div className="score-bar">
                  <span style={{ width: `${value}%` }} />
                </div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="blueprint-columns">
            <div>
              <h3>Next actions</h3>
              <ul>
                {run.finalVerdict.nextActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Risks</h3>
              <ul>
                {run.finalVerdict.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
