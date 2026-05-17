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

const scoreGroups: Array<{
  title: string;
  signal: string;
  keys: Array<keyof VentureScorecard>;
}> = [
  {
    title: "Market signal",
    signal: "Pain, timing, and competitive pressure",
    keys: ["pain", "timing", "competition"]
  },
  {
    title: "Customer clarity",
    signal: "Buyer definition and reachable distribution",
    keys: ["buyerClarity", "distribution"]
  },
  {
    title: "Business risk",
    signal: "Monetization risk against build feasibility",
    keys: ["monetization", "feasibility"]
  },
  {
    title: "Evidence quality",
    signal: "Trust level and red-team pressure",
    keys: ["evidenceQuality", "redTeamSeverity"]
  }
];

export function BlueprintPanel({ run }: { run: PreflightRun }) {
  const topAction = run.finalVerdict.nextActions[0];

  return (
    <section className="panel blueprint-panel" aria-labelledby="blueprint-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Blueprint</p>
          <h2 id="blueprint-heading">Final verdict</h2>
        </div>
        <span className="verdict-badge">{run.status === "complete" ? run.finalVerdict.decision : "Locked"}</span>
      </div>

      {run.status !== "complete" ? (
        <div className="locked-state">
          <strong>Verdict locked during sprint</strong>
          <p>Preflight reveals the final verdict only after the specialist agents complete their pass.</p>
        </div>
      ) : (
        <>
          <div className="verdict-hero">
            <span>Verdict</span>
            <strong>{run.finalVerdict.decision}</strong>
            <p>{run.finalVerdict.rationale}</p>
          </div>
          <div className="verdict-insights">
            <div>
              <span>Why not Proceed yet</span>
              <strong>Evidence and willingness-to-pay still need live proof.</strong>
            </div>
            <div>
              <span>Next best action</span>
              <strong>{topAction}</strong>
            </div>
          </div>
          <div className="wedge-callout">
            <span>Strongest wedge</span>
            <strong>{run.finalVerdict.strongestWedge}</strong>
          </div>

          <div className="scorecard-section" aria-labelledby="scorecard-heading">
            <div className="scorecard-heading">
              <h3 id="scorecard-heading">Venture scorecard</h3>
              <span>0-100 confidence read</span>
            </div>
            <div className="score-group-grid">
              {scoreGroups.map((group) => (
                <article className="score-group" key={group.title}>
                  <div className="score-group-heading">
                    <strong>{group.title}</strong>
                    <span>{group.signal}</span>
                  </div>
                  <div className="score-grid">
                    {group.keys.map((key) => (
                      <div className="score-row" key={key}>
                        <span>{scoreLabels[key]}</span>
                        <div className="score-bar">
                          <span style={{ width: `${run.scorecard[key]}%` }} />
                        </div>
                        <strong>{run.scorecard[key]}</strong>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
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
