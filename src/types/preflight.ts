export type VerdictDecision = "Proceed" | "Pivot" | "Pause" | "Kill";
export type AgentStatus = "queued" | "running" | "blocked" | "complete" | "failed";
export type EvidenceKind = "source" | "assumption";
export type QualitySeverity = "pass" | "warn" | "fail";
export type RunStatus = "idle" | "running" | "complete" | "failed";
export type ArtifactDepth = "executive" | "detailed";

export interface VentureBrief {
  idea: string;
  targetCustomer: string;
  geography: string;
  businessModel?: string;
  problem: string;
  solution: string;
  assumptions: string[];
  unknowns: string[];
}

export interface AgentRun {
  id: string;
  agentName: string;
  role: string;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  logs: string[];
  summary: string;
}

export interface EvidenceItem {
  id: string;
  kind: EvidenceKind;
  claim: string;
  sourceUrl?: string;
  sourceTitle?: string;
  summary: string;
  confidence: "low" | "medium" | "high";
  freshness?: string;
  agentName: string;
}

export interface QualityIssue {
  id: string;
  artifactId: string;
  severity: QualitySeverity;
  type:
    | "missing_citation"
    | "generic_filler"
    | "unsupported_number"
    | "uncertain_competitor"
    | "contradiction"
    | "weak_assumption"
    | "overclaim";
  message: string;
  suggestedFix: string;
}

export interface VentureScorecard {
  pain: number;
  buyerClarity: number;
  timing: number;
  competition: number;
  distribution: number;
  monetization: number;
  feasibility: number;
  evidenceQuality: number;
  redTeamSeverity: number;
}

export interface Artifact {
  id: string;
  type:
    | "founder_memo"
    | "market_brief"
    | "prd"
    | "pitch_deck_outline"
    | "unit_economics"
    | "gtm_plan"
    | "red_team_memo";
  title: string;
  markdown: string;
  citationIds: string[];
  qualityStatus: QualitySeverity;
}

export interface FinalVerdict {
  decision: VerdictDecision;
  rationale: string;
  strongestWedge: string;
  nextActions: string[];
  risks: string[];
}

export interface PreflightRun {
  id: string;
  mode: "demo" | "live";
  status: RunStatus;
  brief: VentureBrief;
  agents: AgentRun[];
  evidence: EvidenceItem[];
  qualityIssues: QualityIssue[];
  scorecard: VentureScorecard;
  finalVerdict: FinalVerdict;
  redTeamObjections: string[];
  artifacts: Artifact[];
}
