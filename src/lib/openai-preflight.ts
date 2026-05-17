import { buildArtifacts } from "@/lib/artifacts";
import { demoAgents } from "@/data/demo-run";
import type {
  AgentRun,
  Artifact,
  EvidenceItem,
  FinalVerdict,
  PreflightRun,
  QualityIssue,
  QualitySeverity,
  VentureBrief,
  VentureScorecard,
  VerdictDecision
} from "@/types/preflight";

type AgentName = (typeof demoAgents)[number]["agentName"];

interface GeneratedAgentSummary {
  agentName: AgentName;
  summary: string;
}

interface GeneratedPreflight {
  brief: VentureBrief;
  agentSummaries: GeneratedAgentSummary[];
  evidence: EvidenceItem[];
  qualityIssues: Array<Omit<QualityIssue, "id">>;
  scorecard: VentureScorecard;
  finalVerdict: FinalVerdict;
  redTeamObjections: string[];
}

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL_CANDIDATES = ["gpt-5.4-mini", "gpt-4o-mini"];
const DEFAULT_OPENAI_TIMEOUT_MS = 120000;
const MIN_OPENAI_TIMEOUT_MS = 30000;
const MAX_OPENAI_TIMEOUT_MS = 180000;
const QUALITY_TYPES: QualityIssue["type"][] = [
  "missing_citation",
  "generic_filler",
  "unsupported_number",
  "uncertain_competitor",
  "contradiction",
  "weak_assumption",
  "overclaim"
];
const QUALITY_SEVERITIES: QualitySeverity[] = ["pass", "warn", "fail"];
const VERDICTS: VerdictDecision[] = ["Proceed", "Pivot", "Pause", "Kill"];
const TODAY = "2026-05-17";

const SYSTEM_PROMPT = `You are Preflight, an AI venture studio that pressure-tests startup ideas before a founder builds.

Generate a founder-facing venture preflight run from the submitted intake. The output must be specific to the user's idea, customer, geography, and business model.

Rules:
- Return only JSON that matches the schema.
- Do not reuse the seeded Preflight demo content unless the submitted idea is actually about Preflight.
- Do not invent fake citations or fake URLs. If you are not certain a URL is real, set kind to "assumption" and leave sourceUrl, sourceTitle, and freshness as empty strings.
- Use "source" evidence only for claims with a real URL. Otherwise use "assumption".
- Separate sourced claims from assumptions in every evidence item and in the wording of the final verdict. Never imply an assumption is proven.
- Quality issues should call out missing citations, unsupported numbers, vague claims, contradictions, weak assumptions, and overclaims in this specific venture.
- Evidence must have stable lowercase ids.
- For quality issue artifactId, use one of: artifact-founder-memo, artifact-market-brief, artifact-prd, artifact-pitch-deck, artifact-unit-economics, artifact-gtm, artifact-red-team.
- Do not generate the final artifacts. The application will format artifacts locally from your blueprint, so your JSON must contain concrete source material for founder-ready deliverables.
- Write for a founder deciding what to do next, not for a generic advice blog.
- Include at least 4 specific assumptions, 4 unknowns, 4 next actions, 4 risks, 4 evidence items, 5 quality issues, and 5 red-team objections.
- Make the blueprint rich enough to support these artifact sections: Founder Memo decision, rationale, what must be true, wedge, risks, 7-day validation plan, interview questions, pivot/kill triggers; Market Brief category, target segment, substitutes, evidence, assumptions, market risks, validation plan; PRD personas, workflows, MVP features, non-goals, acceptance criteria, metrics, edge cases; Pitch Deck 10 slides; Unit Economics pricing assumptions, cost drivers, scenarios, sensitivity risks; GTM ICP, positioning, channels, first 10 users, experiments, messaging, metrics; Red-Team strongest objections, failure modes, evidence gaps, disproof tests.
- Scorecard values must be integer confidence scores from 0 to 100 because the product displays them as a 0-100 confidence read. Do not use a 0-10 scale; return 80 for an eight-out-of-ten signal, not 8.
- Make a hard decision: Proceed, Pivot, Pause, or Kill. Avoid generic optimism.
- Be concrete about the user's segment, substitute workflow, buying trigger, and validation behavior.`;

const PRELIGHT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "brief",
    "agentSummaries",
    "evidence",
    "qualityIssues",
    "scorecard",
    "finalVerdict",
    "redTeamObjections"
  ],
  properties: {
    brief: {
      type: "object",
      additionalProperties: false,
      required: ["idea", "targetCustomer", "geography", "businessModel", "problem", "solution", "assumptions", "unknowns"],
      properties: {
        idea: { type: "string" },
        targetCustomer: { type: "string" },
        geography: { type: "string" },
        businessModel: { type: "string" },
        problem: { type: "string" },
        solution: { type: "string" },
        assumptions: { type: "array", minItems: 4, items: { type: "string" } },
        unknowns: { type: "array", minItems: 4, items: { type: "string" } }
      }
    },
    agentSummaries: {
      type: "array",
      minItems: 9,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["agentName", "summary"],
        properties: {
          agentName: {
            type: "string",
            enum: demoAgents.map((agent) => agent.agentName)
          },
          summary: { type: "string" }
        }
      }
    },
    evidence: {
      type: "array",
      minItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "kind", "claim", "sourceUrl", "sourceTitle", "summary", "confidence", "freshness", "agentName"],
        properties: {
          id: { type: "string" },
          kind: { type: "string", enum: ["source", "assumption"] },
          claim: { type: "string" },
          sourceUrl: { type: "string" },
          sourceTitle: { type: "string" },
          summary: { type: "string" },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
          freshness: { type: "string" },
          agentName: { type: "string" }
        }
      }
    },
    qualityIssues: {
      type: "array",
      minItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["artifactId", "severity", "type", "message", "suggestedFix"],
        properties: {
          artifactId: { type: "string" },
          severity: { type: "string", enum: QUALITY_SEVERITIES },
          type: { type: "string", enum: QUALITY_TYPES },
          message: { type: "string" },
          suggestedFix: { type: "string" }
        }
      }
    },
    scorecard: {
      type: "object",
      additionalProperties: false,
      required: [
        "pain",
        "buyerClarity",
        "timing",
        "competition",
        "distribution",
        "monetization",
        "feasibility",
        "evidenceQuality",
        "redTeamSeverity"
      ],
      properties: {
        pain: { type: "number" },
        buyerClarity: { type: "number" },
        timing: { type: "number" },
        competition: { type: "number" },
        distribution: { type: "number" },
        monetization: { type: "number" },
        feasibility: { type: "number" },
        evidenceQuality: { type: "number" },
        redTeamSeverity: { type: "number" }
      }
    },
    finalVerdict: {
      type: "object",
      additionalProperties: false,
      required: ["decision", "rationale", "strongestWedge", "nextActions", "risks"],
      properties: {
        decision: { type: "string", enum: VERDICTS },
        rationale: { type: "string" },
        strongestWedge: { type: "string" },
        nextActions: { type: "array", minItems: 4, items: { type: "string" } },
        risks: { type: "array", minItems: 4, items: { type: "string" } }
      }
    },
    redTeamObjections: {
      type: "array",
      minItems: 5,
      items: { type: "string" }
    }
  }
} as const;

export class OpenAIPreflightTimeoutError extends Error {
  constructor(readonly timeoutMs: number) {
    super(`OpenAI request timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    this.name = "OpenAIPreflightTimeoutError";
  }
}

export function normalizeBrief(input: Partial<VentureBrief>): VentureBrief {
  const idea = safeText(input.idea, "Untitled startup idea");
  const targetCustomer = safeText(input.targetCustomer, "Early target customer not specified");
  const geography = safeText(input.geography, "Unspecified geography");
  const businessModel = safeText(input.businessModel, "Business model not specified");

  return {
    idea,
    targetCustomer,
    geography,
    businessModel,
    problem: safeText(input.problem, `${targetCustomer} may have an unresolved workflow or budget pain.`),
    solution: safeText(input.solution, `A focused product concept that tests whether ${idea} deserves build time.`),
    assumptions: cleanList(input.assumptions, [
      `${targetCustomer} feel this problem often enough to change behavior.`,
      "The buyer has budget or authority for the proposed solution.",
      "The MVP can prove value before expensive infrastructure or integrations."
    ]),
    unknowns: cleanList(input.unknowns, [
      "Which buyer segment has the most urgent trigger?",
      "Which substitute is currently used when the pain appears?",
      "What evidence proves willingness to pay?"
    ])
  };
}

export async function generateOpenAIPreflight(input: VentureBrief, apiKey: string): Promise<PreflightRun> {
  const brief = normalizeBrief(input);
  const generated = await requestGeneratedPreflight(brief, apiKey);
  const normalizedBrief = normalizeGeneratedBrief(generated.brief, brief);
  const finalVerdict = normalizeFinalVerdict(generated.finalVerdict);
  const evidence = normalizeEvidence(generated.evidence);
  const artifacts = buildArtifacts(
    normalizedBrief,
    finalVerdict,
    evidence.map((item) => item.id)
  );

  return {
    id: `live-${Date.now()}`,
    mode: "live",
    status: "complete",
    brief: normalizedBrief,
    agents: buildAgentRuns(generated.agentSummaries),
    evidence,
    qualityIssues: normalizeQualityIssues(generated.qualityIssues, artifacts),
    scorecard: normalizeScorecard(generated.scorecard),
    finalVerdict,
    redTeamObjections: cleanList(generated.redTeamObjections, fallbackRedTeamObjections(normalizedBrief)),
    artifacts
  };
}

async function requestGeneratedPreflight(brief: VentureBrief, apiKey: string): Promise<GeneratedPreflight> {
  const models = process.env.OPENAI_MODEL?.trim() ? [process.env.OPENAI_MODEL.trim()] : DEFAULT_MODEL_CANDIDATES;
  let lastError: Error | undefined;

  for (const model of models) {
    try {
      return await requestGeneratedPreflightWithModel(brief, apiKey, model);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("OpenAI generation failed.");
      const message = lastError.message.toLowerCase();
      const canRetryModel =
        !process.env.OPENAI_MODEL?.trim() &&
        (message.includes("model") || message.includes("unsupported") || message.includes("not found"));

      if (!canRetryModel) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error("OpenAI generation failed.");
}

async function requestGeneratedPreflightWithModel(
  brief: VentureBrief,
  apiKey: string,
  model: string
): Promise<GeneratedPreflight> {
  const controller = new AbortController();
  const timeoutMs = getOpenAITimeoutMs();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: `Generate a complete Preflight run for this intake. Today is ${TODAY}.\n\n${JSON.stringify(brief)}`
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "preflight_generation",
            strict: true,
            schema: PRELIGHT_SCHEMA
          }
        },
        max_output_tokens: 7000
      }),
      signal: controller.signal
    });

    const data = (await response.json()) as unknown;
    if (!response.ok) {
      throw new Error(extractOpenAIError(data) || `OpenAI request failed with HTTP ${response.status}.`);
    }

    const outputText = extractOutputText(data);
    if (!outputText) {
      throw new Error("OpenAI returned no structured output text.");
    }

    return JSON.parse(outputText) as GeneratedPreflight;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new OpenAIPreflightTimeoutError(timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function buildAgentRuns(summaries: GeneratedAgentSummary[]): AgentRun[] {
  return demoAgents.map((agent) => {
    const match = summaries.find((summary) => summary.agentName === agent.agentName);

    return {
      ...agent,
      status: "complete",
      startedAt: undefined,
      completedAt: undefined,
      logs: [],
      summary: safeText(match?.summary, agent.summary)
    };
  });
}

function normalizeGeneratedBrief(candidate: Partial<VentureBrief>, fallback: VentureBrief): VentureBrief {
  const normalized = normalizeBrief({
    ...fallback,
    ...candidate
  });

  return {
    ...normalized,
    assumptions: cleanList(candidate.assumptions, fallback.assumptions),
    unknowns: cleanList(candidate.unknowns, fallback.unknowns)
  };
}

function normalizeEvidence(items: Array<Partial<EvidenceItem>>): EvidenceItem[] {
  const allowModelSources = process.env.PREFLIGHT_ALLOW_MODEL_SOURCES === "true";
  const normalized = items
    .map((item, index) => {
      const sourceUrl = safeText(item.sourceUrl, "");
      const hasValidUrl = isHttpUrl(sourceUrl);
      const kind = allowModelSources && item.kind === "source" && hasValidUrl ? "source" : "assumption";

      return {
        id: safeIdentifier(item.id, `ev-live-${index + 1}`),
        kind,
        claim: safeText(item.claim, "Claim needs validation."),
        sourceUrl: kind === "source" ? sourceUrl : undefined,
        sourceTitle: kind === "source" ? safeText(item.sourceTitle, sourceUrl) : undefined,
        summary: safeText(item.summary, "No source-backed summary was provided."),
        confidence: normalizeConfidence(item.confidence),
        freshness: kind === "source" ? safeText(item.freshness, TODAY) : undefined,
        agentName: safeText(item.agentName, "Market Scout")
      } satisfies EvidenceItem;
    })
    .filter((item) => item.claim.length > 0);

  if (normalized.length) {
    return normalized;
  }

  return [
    {
      id: "ev-live-assumption-1",
      kind: "assumption",
      claim: "This venture needs live market validation before its demand claims can be trusted.",
      summary: "The OpenAI generator did not return usable source evidence, so Preflight keeps the claim in assumption status.",
      confidence: "medium",
      agentName: "Quality Gate"
    }
  ];
}

function normalizeQualityIssues(items: Array<Partial<QualityIssue>>, artifacts: Artifact[]): QualityIssue[] {
  const knownArtifactIds = new Set(artifacts.map((artifact) => artifact.id));
  const normalized = items
    .map((item, index) => {
      const type = QUALITY_TYPES.includes(item.type as QualityIssue["type"])
        ? (item.type as QualityIssue["type"])
        : "weak_assumption";
      const severity = QUALITY_SEVERITIES.includes(item.severity as QualitySeverity)
        ? (item.severity as QualitySeverity)
        : "warn";
      const artifactId = safeText(item.artifactId, artifacts[0]?.id || "artifact-founder-memo");

      return {
        id: `q-live-${index + 1}`,
        artifactId: knownArtifactIds.has(artifactId) ? artifactId : artifacts[0]?.id || artifactId,
        severity,
        type,
        message: safeText(item.message, "This claim needs stronger evidence before it should guide the build decision."),
        suggestedFix: safeText(item.suggestedFix, "Turn the claim into an assumption or attach source-backed evidence.")
      } satisfies QualityIssue;
    })
    .filter((item) => item.message.length > 0);

  if (normalized.length) {
    return normalized;
  }

  return [
    {
      id: "q-live-missing-citation",
      artifactId: artifacts[0]?.id || "artifact-founder-memo",
      severity: "fail",
      type: "missing_citation",
      message: "Market and competitor claims need real source URLs before they become evidence.",
      suggestedFix: "Keep the claims in the assumption ledger until live web evidence is attached."
    }
  ];
}

function normalizeFinalVerdict(candidate: Partial<FinalVerdict>): FinalVerdict {
  const decision = VERDICTS.includes(candidate.decision as VerdictDecision)
    ? (candidate.decision as VerdictDecision)
    : "Pause";

  return {
    decision,
    rationale: safeText(
      candidate.rationale,
      "The venture needs sharper evidence before the founder invests serious build time."
    ),
    strongestWedge: safeText(candidate.strongestWedge, "A focused wedge can make the idea testable before full buildout."),
    nextActions: cleanList(candidate.nextActions, [
      "Interview five target buyers about the urgent trigger.",
      "Identify the strongest current substitute.",
      "Run one no-code or concierge validation experiment."
    ]),
    risks: cleanList(candidate.risks, [
      "Demand may be weaker than the founder expects.",
      "The buyer may not control budget.",
      "The MVP may not prove willingness to pay."
    ])
  };
}

export function normalizeScorecard(candidate: Partial<VentureScorecard>): VentureScorecard {
  const usesTenPointScale = scorecardUsesTenPointScale(candidate);

  return {
    pain: score(candidate.pain, usesTenPointScale),
    buyerClarity: score(candidate.buyerClarity, usesTenPointScale),
    timing: score(candidate.timing, usesTenPointScale),
    competition: score(candidate.competition, usesTenPointScale),
    distribution: score(candidate.distribution, usesTenPointScale),
    monetization: score(candidate.monetization, usesTenPointScale),
    feasibility: score(candidate.feasibility, usesTenPointScale),
    evidenceQuality: score(candidate.evidenceQuality, usesTenPointScale),
    redTeamSeverity: score(candidate.redTeamSeverity, usesTenPointScale)
  };
}

function fallbackRedTeamObjections(brief: VentureBrief): string[] {
  return [
    `${brief.targetCustomer} may not feel enough urgency to change workflow.`,
    "The strongest substitute may be manual process, not a direct software competitor.",
    "The business model remains unproven until a buyer pays before the product is fully built.",
    "The venture loses trust if sourced claims and assumptions are mixed.",
    "The MVP must prove a narrow behavior change before adding broad AI features."
  ];
}

function cleanList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value.map((item) => safeText(item, "")).filter(Boolean);
  return items.length ? items.slice(0, 8) : fallback;
}

function safeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const text = value.trim();
  return text.length ? text : fallback;
}

function safeIdentifier(value: unknown, fallback: string): string {
  const text = safeText(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return text || fallback;
}

function getOpenAITimeoutMs(): number {
  const raw = Number.parseInt(process.env.PREFLIGHT_OPENAI_TIMEOUT_MS || "", 10);

  if (Number.isNaN(raw)) {
    return DEFAULT_OPENAI_TIMEOUT_MS;
  }

  return Math.max(MIN_OPENAI_TIMEOUT_MS, Math.min(MAX_OPENAI_TIMEOUT_MS, raw));
}

function normalizeConfidence(value: unknown): EvidenceItem["confidence"] {
  return value === "low" || value === "medium" || value === "high" ? value : "medium";
}

function scorecardUsesTenPointScale(candidate: Partial<VentureScorecard>): boolean {
  const values = [
    candidate.pain,
    candidate.buyerClarity,
    candidate.timing,
    candidate.competition,
    candidate.distribution,
    candidate.monetization,
    candidate.feasibility,
    candidate.evidenceQuality,
    candidate.redTeamSeverity
  ].filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  return values.length >= 5 && values.every((value) => value >= 0 && value <= 10) && values.some((value) => value > 0);
}

function score(value: unknown, usesTenPointScale = false): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 50;
  }

  const scaledValue = usesTenPointScale ? value * 10 : value;

  return Math.max(0, Math.min(100, Math.round(scaledValue)));
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function extractOpenAIError(data: unknown): string | undefined {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    data.error &&
    typeof data.error === "object" &&
    "message" in data.error &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }

  return undefined;
}

function extractOutputText(data: unknown): string | undefined {
  if (data && typeof data === "object" && "output_text" in data && typeof data.output_text === "string") {
    return data.output_text;
  }

  if (!data || typeof data !== "object" || !("output" in data) || !Array.isArray(data.output)) {
    return undefined;
  }

  const chunks: string[] = [];

  for (const output of data.output) {
    if (!output || typeof output !== "object" || !("content" in output) || !Array.isArray(output.content)) {
      continue;
    }

    for (const content of output.content) {
      if (
        content &&
        typeof content === "object" &&
        "text" in content &&
        typeof content.text === "string"
      ) {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("").trim() || undefined;
}
