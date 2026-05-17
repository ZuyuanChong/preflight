import type { PreflightRun } from "@/types/preflight";

export function RedTeamPanel({ run }: { run: PreflightRun }) {
  const objections = [
    "Founders may want momentum and affirmation more than a blunt critique.",
    "General AI research tools can imitate the workflow unless Preflight owns the quality-gated decision layer.",
    "The willingness-to-pay story is unproven until founders pay for a report before they build.",
    "Evidence trust breaks if assumptions and sourced claims are mixed together.",
    "A Pivot verdict must feel useful enough that the founder still wants the artifact package."
  ];

  return (
    <section className="panel red-team-panel" aria-labelledby="red-team-heading">
      <div className="panel-heading">
        <div>
          <p className="section-label">Red team</p>
          <h2 id="red-team-heading">Pressure test</h2>
        </div>
      </div>

      <p className="verdict-copy">
        Red Team is intentionally specific to {run.brief.idea}. The purpose is to raise trust by showing what could break.
      </p>

      <ol className="red-team-list">
        {objections.map((objection) => (
          <li key={objection}>{objection}</li>
        ))}
      </ol>
    </section>
  );
}
