import type { PreflightRun } from "@/types/preflight";

export function RedTeamPanel({ run }: { run: PreflightRun }) {
  const objections = run.redTeamObjections;
  const hasObjections = objections.length > 0;

  return (
    <section className="panel red-team-panel" aria-labelledby="red-team-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Red team</p>
          <h2 id="red-team-heading">Pressure test</h2>
        </div>
      </div>

      <p className="verdict-copy">
        {hasObjections
          ? `Red Team is intentionally specific to ${run.brief.idea}. The purpose is to raise trust by showing what could break.`
          : "Red Team critique appears after a completed preflight run."}
      </p>

      {hasObjections ? (
        <ol className="red-team-list">
          {objections.map((objection) => (
            <li key={objection}>{objection}</li>
          ))}
        </ol>
      ) : (
        <div className="locked-state">
          <strong>No critique recorded</strong>
          <p>Start a sprint or load the completed demo to reveal the pressure test.</p>
        </div>
      )}
    </section>
  );
}
