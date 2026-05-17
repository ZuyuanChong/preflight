import type { QualityIssue } from "@/types/preflight";

export const demoQualityIssues: QualityIssue[] = [
  {
    id: "q-missing-citation",
    artifactId: "artifact-market-brief",
    severity: "fail",
    type: "missing_citation",
    message: "Competitor and substitute claims need live sources before they can be treated as market proof.",
    suggestedFix: "Keep substitutes labeled as assumptions until a Tavily-backed source is attached."
  },
  {
    id: "q-unsupported-number",
    artifactId: "artifact-unit-economics",
    severity: "fail",
    type: "unsupported_number",
    message: "Paid report pricing and team pricing are hypotheses, not validated revenue evidence.",
    suggestedFix: "Run 10 founder willingness-to-pay interviews before presenting pricing as validated."
  },
  {
    id: "q-generic-filler",
    artifactId: "artifact-founder-memo",
    severity: "warn",
    type: "generic_filler",
    message: "Phrases like AI-powered insights are too broad unless tied to a concrete founder decision.",
    suggestedFix: "Use decision-language: proceed, pivot, pause, kill, and what must be true."
  },
  {
    id: "q-uncertain-competitor",
    artifactId: "artifact-market-brief",
    severity: "warn",
    type: "uncertain_competitor",
    message: "General AI research tools are substitute categories until direct competitors are sourced.",
    suggestedFix: "Categorize as substitutes in demo mode and source exact competitors in live evidence mode."
  },
  {
    id: "q-weak-assumption",
    artifactId: "artifact-unit-economics",
    severity: "fail",
    type: "weak_assumption",
    message: "Willingness to pay is business-critical and still untested.",
    suggestedFix: "Make willingness to pay the first validation experiment after the demo."
  },
  {
    id: "q-overclaim",
    artifactId: "artifact-pitch-deck",
    severity: "warn",
    type: "overclaim",
    message: "Avoid words like validated or proven unless customer evidence exists.",
    suggestedFix: "Use supported by early evidence or still an assumption until sourced."
  },
  {
    id: "q-contradiction",
    artifactId: "artifact-founder-memo",
    severity: "warn",
    type: "contradiction",
    message: "A Proceed verdict would contradict the severe willingness-to-pay and evidence-quality risks.",
    suggestedFix: "Keep the verdict at Pivot until customer payment proof and live source coverage improve."
  }
];
