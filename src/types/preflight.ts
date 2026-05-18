export type VerdictDecision = "Proceed" | "Pivot" | "Pause" | "Kill";
export type AgentStatus = "queued" | "starting" | "running" | "blocked" | "complete" | "failed";
export type EvidenceKind = "source" | "assumption";
export type QualitySeverity = "pass" | "warn" | "fail";
export type RunStatus = "idle" | "starting" | "running" | "complete" | "failed";
export type ArtifactDepth = "executive" | "detailed";
export type AgentType = "orchestrator" | "intake" | "specialist" | "review" | "finalization";
export type WorkflowMode = "sequential" | "parallel";
export type HandoffStatus = "queued" | "sent" | "accepted" | "revision_requested" | "blocked";
export type MemoryVisibility = "shared" | "local";
export type MemoryKind = "user_preference" | "assumption" | "decision" | "evidence_rule" | "local_note";
export type AgentToolCategory =
  | "orchestration"
  | "web_search"
  | "document_review"
  | "data_analysis"
  | "research_synthesis"
  | "technical_debugging"
  | "quality_review"
  | "artifact_generation"
  | "memory";
export type AgentToolAvailability = "always" | "demo_seeded" | "optional_live";
export type AgentActivityStatus = "queued" | "running" | "complete" | "blocked";
export type AgentConfidence = "low" | "medium" | "high";

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
  agentType: AgentType;
  role: string;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  logs: string[];
  activityLogs: AgentActivityLog[];
  summary: string;
  toolUseSummary: string[];
  executionThreadId?: string;
  taskObjective?: string;
  sourceCount?: number;
  confidence?: AgentConfidence;
  limitations?: string[];
}

export interface AgentTool {
  id: string;
  label: string;
  category: AgentToolCategory;
  purpose: string;
  availability: AgentToolAvailability;
}

export interface AgentContract {
  id: string;
  agentName: string;
  agentType: AgentType;
  llmProfile: string;
  purpose: string;
  capabilities: string[];
  tools: AgentTool[];
  coreResponsibilities: string[];
  inputs: string[];
  outputs: string[];
  toolsOrDataSources: string[];
  mustNotDo: string[];
  handoffConditions: string[];
  successCriteria: string[];
  worksInParallelWith?: string[];
}

export interface OrchestrationStep {
  id: string;
  order: number;
  title: string;
  mode: WorkflowMode;
  agents: string[];
  trigger: string;
  output: string;
  status: "ready" | "running" | "complete";
}

export interface AgentHandoff {
  id: string;
  fromAgent: string;
  toAgent: string;
  taskCompleted: string;
  keyFindings: string[];
  remainingIssues: string[];
  assumptions: string[];
  recommendedNextStep: string;
  status: HandoffStatus;
}

export interface MemoryItem {
  id: string;
  kind: MemoryKind;
  ownerAgent: string;
  title: string;
  detail: string;
  visibility: MemoryVisibility;
}

export interface ReviewFinding {
  id: string;
  reviewerAgent: string;
  severity: QualitySeverity;
  check: string;
  finding: string;
  requiredAction: string;
  status: "approved" | "revision_required" | "resolved";
}

export interface AgentActivityLog {
  id: string;
  agentId: string;
  agentName: string;
  status: AgentActivityStatus;
  task: string;
  toolsUsed: string[];
  reasoningSummary: string[];
  output: string;
  handoffTo?: string;
}

export interface MultiAgentSystem {
  overview: string;
  operatingMode: "demo-deterministic" | "live-server" | "static-fallback";
  agents: AgentContract[];
  workflow: OrchestrationStep[];
  handoffs: AgentHandoff[];
  memory: MemoryItem[];
  reviewFindings: ReviewFinding[];
  activityLogs: AgentActivityLog[];
  communicationProtocol: string[];
  finalOutputRules: string[];
}

export interface AgentTaskAssignment {
  agentName: string;
  taskObjective: string;
  requiredContext: string[];
  toolPolicy: string[];
  dependsOn: string[];
  runsInParallelGroup?: string;
}

export interface AgentFinding {
  id: string;
  agentName: string;
  claim: string;
  summary: string;
  sourceIds: string[];
  confidence: AgentConfidence;
  limitations: string[];
}

export interface AgentSourceReference {
  id: string;
  agentName: string;
  query: string;
  url: string;
  title: string;
  summary: string;
  publishedDate?: string;
  score?: number;
}

export interface AgentExecutionResult {
  agentName: string;
  executionThreadId: string;
  taskObjective: string;
  toolsRequested: string[];
  sources: AgentSourceReference[];
  findings: AgentFinding[];
  assumptions: string[];
  limitations: string[];
  confidence: AgentConfidence;
  summary: string;
}

export interface AgentStudioReport {
  taskDecomposition: AgentTaskAssignment[];
  agentExecutions: AgentExecutionResult[];
  sourceCount: number;
  assumptionCount: number;
  mergedSourceUrls: string[];
  unsupportedClaims: string[];
  contradictions: string[];
  synthesisConfidence: AgentConfidence;
  limitations: string[];
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
  multiAgentSystem: MultiAgentSystem;
  agentStudioReport?: AgentStudioReport;
  evidence: EvidenceItem[];
  qualityIssues: QualityIssue[];
  scorecard: VentureScorecard;
  finalVerdict: FinalVerdict;
  redTeamObjections: string[];
  artifacts: Artifact[];
}
