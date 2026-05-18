import { AGENT_CONTRACTS } from "@/lib/multi-agent";
import type {
  AgentConfidence,
  AgentExecutionResult,
  AgentFinding,
  AgentSourceReference,
  AgentStudioReport,
  AgentTaskAssignment,
  EvidenceItem,
  FinalVerdict,
  QualityIssue,
  VentureBrief,
  VentureScorecard
} from "@/types/preflight";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const TAVILY_SEARCH_URL = "https://api.tavily.com/search";
const DEFAULT_TIMEOUT_MS = 120000;
const MIN_TIMEOUT_MS = 30000;
const MAX_TIMEOUT_MS = 180000;
const SEARCH_TIMEOUT_MS = 15000;
const TODAY = "2026-05-18";

const SPECIALIST_GROUP = "specialist-analysis";

const AGENT_OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "findings", "assumptions", "limitations", "confidence"],
  properties: {
    summary: { type: "string" },
    findings: {
      type: "array",
      minItems: 2,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["claim", "summary", "sourceIds", "confidence", "limitations"],
        properties: {
          claim: { type: "string" },
          summary: { type: "string" },
          sourceIds: { type: "array", items: { type: "string" } },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
          limitations: { type: "array", items: { type: "string" } }
        }
      }
    },
    assumptions: { type: "array", minItems: 1, maxItems: 6, items: { type: "string" } },
    limitations: { type: "array", minItems: 1, maxItems: 6, items: { type: "string" } },
    confidence: { type: "string", enum: ["low", "medium", "high"] }
  }
} as const;

const FINAL_SYNTHESIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["brief", "scorecard", "finalVerdict", "redTeamObjections", "qualityIssues", "confidence"],
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
        decision: { type: "string", enum: ["Proceed", "Pivot", "Pause", "Kill"] },
        rationale: { type: "string" },
        strongestWedge: { type: "string" },
        nextActions: { type: "array", minItems: 4, items: { type: "string" } },
        risks: { type: "array", minItems: 4, items: { type: "string" } }
      }
    },
    redTeamObjections: { type: "array", minItems: 5, items: { type: "string" } },
    qualityIssues: {
      type: "array",
      minItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["artifactId", "severity", "type", "message", "suggestedFix"],
        properties: {
          artifactId: { type: "string" },
          severity: { type: "string", enum: ["pass", "warn", "fail"] },
          type: {
            type: "string",
            enum: [
              "missing_citation",
              "generic_filler",
              "unsupported_number",
              "uncertain_competitor",
              "contradiction",
              "weak_assumption",
              "overclaim"
            ]
          },
          message: { type: "string" },
          suggestedFix: { type: "string" }
        }
      }
    },
    confidence: { type: "string", enum: ["low", "medium", "high"] }
  }
} as const;

export interface AgentExecutionSpec extends AgentTaskAssignment {
  systemPrompt: string;
  searchQueries: string[];
}

interface AgentModelOutput {
  summary: string;
  findings: Array<{
    claim: string;
    summary: string;
    sourceIds: string[];
    confidence: AgentConfidence;
    limitations: string[];
  }>;
  assumptions: string[];
  limitations: string[];
  confidence: AgentConfidence;
}

interface FinalSynthesisOutput {
  brief: VentureBrief;
  scorecard: VentureScorecard;
  finalVerdict: FinalVerdict;
  redTeamObjections: string[];
  qualityIssues: Array<Omit<QualityIssue, "id">>;
  confidence: AgentConfidence;
}

export interface IndependentAgentStudioResult {
  generated: {
    brief: VentureBrief;
    agentSummaries: Array<{
      agentName: string;
      summary: string;
      executionThreadId: string;
      taskObjective: string;
      sourceCount: number;
      confidence: AgentConfidence;
      limitations: string[];
      toolsUsed: string[];
    }>;
    evidence: EvidenceItem[];
    qualityIssues: Array<Omit<QualityIssue, "id">>;
    scorecard: VentureScorecard;
    finalVerdict: FinalVerdict;
    redTeamObjections: string[];
  };
  report: AgentStudioReport;
}

export function buildAgentExecutionPlan(brief: VentureBrief): AgentExecutionSpec[] {
  return AGENT_CONTRACTS.map((contract) => {
    const taskObjective = taskObjectiveFor(contract.agentName, brief);
    const dependsOn = dependenciesFor(contract.agentName);

    return {
      agentName: contract.agentName,
      taskObjective,
      requiredContext: requiredContextFor(contract.agentName),
      toolPolicy: contract.tools.map((agentTool) => `${agentTool.label}: ${agentTool.purpose}`),
      dependsOn,
      runsInParallelGroup: specialistAgentNames().includes(contract.agentName) ? SPECIALIST_GROUP : undefined,
      systemPrompt: systemPromptFor(contract.agentName, contract.purpose),
      searchQueries: searchQueriesFor(contract.agentName, brief)
    };
  });
}

export async function runIndependentAgentStudio(
  brief: VentureBrief,
  apiKey: string,
  model: string
): Promise<IndependentAgentStudioResult> {
  const plan = buildAgentExecutionPlan(brief);
  const intake = await executeAgent(requiredSpec(plan, "Intake and Clarification"), brief, [], apiKey, model);
  const framer = await executeAgent(requiredSpec(plan, "Venture Framer"), brief, [intake], apiKey, model);
  const specialists = await Promise.all(
    specialistAgentNames().map((agentName) => executeAgent(requiredSpec(plan, agentName), brief, [intake, framer], apiKey, model))
  );
  const redTeam = await executeAgent(
    requiredSpec(plan, "Red Team Critic"),
    brief,
    [intake, framer, ...specialists],
    apiKey,
    model
  );
  const quality = await executeAgent(
    requiredSpec(plan, "Quality Control"),
    brief,
    [intake, framer, ...specialists, redTeam],
    apiKey,
    model
  );
  const artifact = await executeAgent(
    requiredSpec(plan, "Artifact Producer"),
    brief,
    [intake, framer, ...specialists, redTeam, quality],
    apiKey,
    model
  );

  const preSynthesisExecutions = [intake, framer, ...specialists, redTeam, quality, artifact];
  const evidence = mergeAgentEvidence(preSynthesisExecutions);
  const validation = buildCrossAgentValidation(preSynthesisExecutions, evidence);
  const synthesis = await executeFinalSynthesis(
    requiredSpec(plan, "Managing Partner"),
    brief,
    preSynthesisExecutions,
    evidence,
    validation,
    apiKey,
    model
  );
  const managingPartner = buildManagingPartnerExecution(
    requiredSpec(plan, "Managing Partner"),
    synthesis,
    evidence,
    validation
  );
  const agentExecutions = sortExecutionsByPlan([managingPartner, ...preSynthesisExecutions], plan);
  const allQualityIssues = [...validation.qualityIssues, ...synthesis.qualityIssues];
  const report = buildAgentStudioReport(plan, agentExecutions, evidence, validation, synthesis.confidence);

  return {
    generated: {
      brief: synthesis.brief,
      agentSummaries: agentExecutions.map((execution) => ({
        agentName: execution.agentName,
        summary: execution.summary,
        executionThreadId: execution.executionThreadId,
        taskObjective: execution.taskObjective,
        sourceCount: execution.sources.length,
        confidence: execution.confidence,
        limitations: execution.limitations,
        toolsUsed: execution.toolsRequested
      })),
      evidence,
      qualityIssues: allQualityIssues,
      scorecard: synthesis.scorecard,
      finalVerdict: synthesis.finalVerdict,
      redTeamObjections: synthesis.redTeamObjections
    },
    report
  };
}

async function executeAgent(
  spec: AgentExecutionSpec,
  brief: VentureBrief,
  priorResults: AgentExecutionResult[],
  apiKey: string,
  model: string
): Promise<AgentExecutionResult> {
  const threadId = executionThreadId(spec.agentName);
  const searchContext = await searchForAgent(spec, brief);
  const userPrompt = buildAgentPrompt(spec, brief, priorResults, searchContext.sources, searchContext.limitations);

  try {
    const output = await requestJsonFromOpenAI<AgentModelOutput>({
      apiKey,
      model,
      systemPrompt: spec.systemPrompt,
      userPrompt,
      schemaName: "agent_studio_agent_output",
      schema: AGENT_OUTPUT_SCHEMA,
      maxOutputTokens: 2200
    });

    return normalizeAgentResult(spec, threadId, output, searchContext.sources, searchContext.limitations);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent execution failed.";
    if (isFatalOpenAIError(message)) {
      throw error;
    }

    return {
      agentName: spec.agentName,
      executionThreadId: threadId,
      taskObjective: spec.taskObjective,
      toolsRequested: spec.toolPolicy,
      sources: searchContext.sources,
      findings: [],
      assumptions: [],
      limitations: [`${spec.agentName} could not complete its independent LLM call: ${message}`],
      confidence: "low",
      summary: `${spec.agentName} failed independently and was excluded from verified synthesis.`
    };
  }
}

async function executeFinalSynthesis(
  spec: AgentExecutionSpec,
  brief: VentureBrief,
  executions: AgentExecutionResult[],
  evidence: EvidenceItem[],
  validation: CrossAgentValidation,
  apiKey: string,
  model: string
): Promise<FinalSynthesisOutput> {
  const sourceCount = evidence.filter((item) => item.kind === "source").length;
  const assumptionCount = evidence.filter((item) => item.kind === "assumption").length;
  const prompt = [
    `Today is ${TODAY}.`,
    "You are the final source-aware summarizer for Agent Studio.",
    "Use only the structured outputs below. Do not invent citations or URLs.",
    "Make the final verdict reflect source count, assumption count, contradictions, unsupported claims, confidence, and limitations.",
    "A Proceed verdict is blocked when source-backed evidence is thin or willingness-to-pay remains unsupported.",
    `Source count: ${sourceCount}. Assumption count: ${assumptionCount}.`,
    `Founder brief:\n${JSON.stringify(brief, null, 2)}`,
    `Agent outputs:\n${JSON.stringify(compactExecutions(executions), null, 2)}`,
    `Evidence ledger:\n${JSON.stringify(evidence, null, 2)}`,
    `Cross-agent validation:\n${JSON.stringify(validation, null, 2)}`
  ].join("\n\n");

  return requestJsonFromOpenAI<FinalSynthesisOutput>({
    apiKey,
    model,
    systemPrompt: spec.systemPrompt,
    userPrompt: prompt,
    schemaName: "agent_studio_final_synthesis",
    schema: FINAL_SYNTHESIS_SCHEMA,
    maxOutputTokens: 4500
  });
}

interface CrossAgentValidation {
  unsupportedClaims: string[];
  contradictions: string[];
  qualityIssues: Array<Omit<QualityIssue, "id">>;
}

export function mergeAgentEvidence(executions: AgentExecutionResult[]): EvidenceItem[] {
  const bySourceUrl = new Map<string, EvidenceItem>();
  const assumptions: EvidenceItem[] = [];
  let index = 1;

  for (const execution of executions) {
    const sourcesById = new Map(execution.sources.map((source) => [source.id, source]));

    for (const finding of execution.findings) {
      const usableSources = finding.sourceIds
        .map((sourceId) => sourcesById.get(sourceId))
        .filter((source): source is AgentSourceReference => source !== undefined && isHttpUrl(source.url));

      if (!usableSources.length) {
        assumptions.push({
          id: `ev-agent-assumption-${index++}`,
          kind: "assumption",
          claim: finding.claim,
          summary: `${finding.summary} Limitation: ${finding.limitations[0] ?? "No source-backed proof was attached."}`,
          confidence: finding.confidence,
          agentName: execution.agentName
        });
        continue;
      }

      for (const source of usableSources) {
        const key = normalizeSourceUrl(source.url);
        const existing = bySourceUrl.get(key);

        if (existing) {
          bySourceUrl.set(key, {
            ...existing,
            claim: mergeText(existing.claim, finding.claim),
            summary: mergeText(existing.summary, finding.summary),
            confidence: lowestConfidence(existing.confidence, finding.confidence)
          });
          continue;
        }

        bySourceUrl.set(key, {
          id: `ev-agent-source-${bySourceUrl.size + 1}`,
          kind: "source",
          claim: finding.claim,
          sourceUrl: source.url,
          sourceTitle: source.title,
          summary: finding.summary || source.summary,
          confidence: finding.confidence,
          freshness: source.publishedDate || TODAY,
          agentName: execution.agentName
        });
      }
    }
  }

  return [...bySourceUrl.values(), ...assumptions];
}

export function buildCrossAgentValidation(
  executions: AgentExecutionResult[],
  evidence: EvidenceItem[]
): CrossAgentValidation {
  const unsupportedClaims: string[] = [];
  const contradictions: string[] = [];
  const qualityIssues: Array<Omit<QualityIssue, "id">> = [];
  const sourceCount = evidence.filter((item) => item.kind === "source").length;

  for (const execution of executions) {
    for (const finding of execution.findings) {
      const hasSource = finding.sourceIds.length > 0;

      if (!hasSource && needsCitation(finding.claim)) {
        unsupportedClaims.push(`${execution.agentName}: ${finding.claim}`);
        qualityIssues.push({
          artifactId: "artifact-market-brief",
          severity: "fail",
          type: "missing_citation",
          message: `${execution.agentName} made a source-sensitive claim without an attached source: ${finding.claim}`,
          suggestedFix: "Keep the claim in the assumption ledger until a source URL is retrieved and verified."
        });
      }

      if (!hasSource && containsUnsupportedNumber(finding.claim)) {
        unsupportedClaims.push(`${execution.agentName}: ${finding.claim}`);
        qualityIssues.push({
          artifactId: "artifact-unit-economics",
          severity: "fail",
          type: "unsupported_number",
          message: `${execution.agentName} included a number without source evidence: ${finding.claim}`,
          suggestedFix: "Remove the number, cite a real source, or label it as an explicit scenario assumption."
        });
      }

      if (mentionsContradiction(finding.claim) || mentionsContradiction(finding.summary)) {
        contradictions.push(`${execution.agentName}: ${finding.claim}`);
      }
    }

    for (const limitation of execution.limitations) {
      if (mentionsContradiction(limitation)) {
        contradictions.push(`${execution.agentName}: ${limitation}`);
      }
    }
  }

  if (sourceCount === 0) {
    qualityIssues.push({
      artifactId: "artifact-founder-memo",
      severity: "warn",
      type: "weak_assumption",
      message: "No source-backed evidence was collected; the final synthesis must treat the run as assumption-led.",
      suggestedFix: "Enable server-side Tavily search with TAVILY_API_KEY or TAVILY_API and rerun search-capable agents."
    });
  }

  if (contradictions.length) {
    qualityIssues.push({
      artifactId: "artifact-red-team",
      severity: "warn",
      type: "contradiction",
      message: "Cross-agent validation found unresolved tension between specialist outputs.",
      suggestedFix: "Resolve the conflict in the Managing Partner synthesis or disclose it as a residual risk."
    });
  }

  return {
    unsupportedClaims: unique(unsupportedClaims).slice(0, 8),
    contradictions: unique(contradictions).slice(0, 8),
    qualityIssues
  };
}

function buildManagingPartnerExecution(
  spec: AgentExecutionSpec,
  synthesis: FinalSynthesisOutput,
  evidence: EvidenceItem[],
  validation: CrossAgentValidation
): AgentExecutionResult {
  const sourceEvidence = evidence.filter((item) => item.kind === "source");
  const sourceReferences: AgentSourceReference[] = sourceEvidence.map((item, index) => ({
    id: `managing-partner-source-${index + 1}`,
    agentName: spec.agentName,
    query: "Merged specialist evidence ledger",
    url: item.sourceUrl || "",
    title: item.sourceTitle || item.sourceUrl || "Source",
    summary: item.summary,
    publishedDate: item.freshness
  }));

  return {
    agentName: spec.agentName,
    executionThreadId: executionThreadId(spec.agentName),
    taskObjective: spec.taskObjective,
    toolsRequested: spec.toolPolicy,
    sources: sourceReferences,
    findings: [
      {
        id: "managing-partner-verdict",
        agentName: spec.agentName,
        claim: `${synthesis.finalVerdict.decision}: ${synthesis.finalVerdict.rationale}`,
        summary: synthesis.finalVerdict.strongestWedge,
        sourceIds: sourceReferences.map((source) => source.id),
        confidence: synthesis.confidence,
        limitations: validation.unsupportedClaims.slice(0, 3)
      }
    ],
    assumptions: synthesis.brief.assumptions,
    limitations: [
      ...validation.unsupportedClaims.slice(0, 3),
      ...validation.contradictions.slice(0, 3)
    ].filter(Boolean),
    confidence: synthesis.confidence,
    summary: `Synthesized the final ${synthesis.finalVerdict.decision} verdict from independent agent outputs, ${sourceEvidence.length} source-backed item(s), and ${validation.unsupportedClaims.length} unsupported claim flag(s).`
  };
}

function buildAgentStudioReport(
  plan: AgentExecutionSpec[],
  executions: AgentExecutionResult[],
  evidence: EvidenceItem[],
  validation: CrossAgentValidation,
  synthesisConfidence: AgentConfidence
): AgentStudioReport {
  const sourceEvidence = evidence.filter((item) => item.kind === "source");
  const assumptionEvidence = evidence.filter((item) => item.kind === "assumption");

  return {
    taskDecomposition: plan.map(({ systemPrompt: _systemPrompt, searchQueries: _searchQueries, ...assignment }) => assignment),
    agentExecutions: executions,
    sourceCount: sourceEvidence.length,
    assumptionCount: assumptionEvidence.length,
    mergedSourceUrls: unique(sourceEvidence.map((item) => item.sourceUrl).filter((url): url is string => Boolean(url))),
    unsupportedClaims: validation.unsupportedClaims,
    contradictions: validation.contradictions,
    synthesisConfidence,
    limitations: unique(executions.flatMap((execution) => execution.limitations)).slice(0, 12)
  };
}

function normalizeAgentResult(
  spec: AgentExecutionSpec,
  threadId: string,
  output: AgentModelOutput,
  sources: AgentSourceReference[],
  searchLimitations: string[]
): AgentExecutionResult {
  const allowedSourceIds = new Set(sources.map((source) => source.id));
  const findings = output.findings.map<AgentFinding>((finding, index) => ({
    id: `${slug(spec.agentName)}-finding-${index + 1}`,
    agentName: spec.agentName,
    claim: safeText(finding.claim, "Finding requires review."),
    summary: safeText(finding.summary, "No finding summary was provided."),
    sourceIds: unique(finding.sourceIds.filter((sourceId) => allowedSourceIds.has(sourceId))),
    confidence: normalizeConfidence(finding.confidence),
    limitations: cleanList(finding.limitations, ["No limitation was provided."])
  }));

  return {
    agentName: spec.agentName,
    executionThreadId: threadId,
    taskObjective: spec.taskObjective,
    toolsRequested: spec.toolPolicy,
    sources,
    findings,
    assumptions: cleanList(output.assumptions, ["This output needs founder validation."]),
    limitations: [...searchLimitations, ...cleanList(output.limitations, [])],
    confidence: normalizeConfidence(output.confidence),
    summary: safeText(output.summary, `${spec.agentName} completed its assigned task.`)
  };
}

async function searchForAgent(
  spec: AgentExecutionSpec,
  brief: VentureBrief
): Promise<{ sources: AgentSourceReference[]; limitations: string[] }> {
  if (!spec.searchQueries.length) {
    return { sources: [], limitations: [] };
  }

  const apiKey = process.env.TAVILY_API_KEY?.trim() || process.env.TAVILY_API?.trim();
  if (!apiKey) {
    return {
      sources: [],
      limitations: [`${spec.agentName} requested web search, but no TAVILY_API_KEY or TAVILY_API was available.`]
    };
  }

  const settled = await Promise.allSettled(
    spec.searchQueries.map((query) => requestTavilySearch(query, spec.agentName, apiKey, brief))
  );
  const sources = settled.flatMap((result) => (result.status === "fulfilled" ? result.value.sources : []));
  const limitations = settled.flatMap((result) =>
    result.status === "fulfilled" ? result.value.limitations : [result.reason instanceof Error ? result.reason.message : "Tavily search failed."]
  );

  return {
    sources: dedupeSources(sources).slice(0, 6),
    limitations
  };
}

async function requestTavilySearch(
  query: string,
  agentName: string,
  apiKey: string,
  brief: VentureBrief
): Promise<{ sources: AgentSourceReference[]; limitations: string[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  try {
    const response = await fetch(TAVILY_SEARCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: clampSearchQuery(query),
        search_depth: "basic",
        max_results: 4,
        include_answer: false,
        include_raw_content: false
      }),
      signal: controller.signal
    });
    const data = (await response.json()) as unknown;

    if (!response.ok) {
      return {
        sources: [],
        limitations: [`${agentName} Tavily search failed with HTTP ${response.status}.`]
      };
    }

    return {
      sources: parseTavilySources(data, agentName, query),
      limitations: []
    };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? `${agentName} Tavily search timed out.`
        : `${agentName} Tavily search failed for ${brief.idea}: ${error instanceof Error ? error.message : "Unknown error."}`;
    return { sources: [], limitations: [message] };
  } finally {
    clearTimeout(timeout);
  }
}

function parseTavilySources(data: unknown, agentName: string, query: string): AgentSourceReference[] {
  if (!data || typeof data !== "object" || !("results" in data) || !Array.isArray(data.results)) {
    return [];
  }

  return data.results
    .map((result, index): AgentSourceReference | undefined => {
      if (!result || typeof result !== "object") {
        return undefined;
      }

      const url = "url" in result && typeof result.url === "string" ? result.url : "";
      const score = "score" in result && typeof result.score === "number" ? result.score : undefined;

      if (!isHttpUrl(url) || (typeof score === "number" && score < 0.35)) {
        return undefined;
      }

      const title = "title" in result && typeof result.title === "string" ? result.title.trim() : url;
      const content = "content" in result && typeof result.content === "string" ? result.content.trim() : "";
      const publishedDate =
        "published_date" in result && typeof result.published_date === "string" ? result.published_date : undefined;

      return {
        id: `${slug(agentName)}-source-${index + 1}`,
        agentName,
        query,
        url,
        title: title || url,
        summary: content.slice(0, 600) || "Search result did not include a content snippet.",
        publishedDate,
        score
      } satisfies AgentSourceReference;
    })
    .filter((source): source is AgentSourceReference => Boolean(source));
}

function buildAgentPrompt(
  spec: AgentExecutionSpec,
  brief: VentureBrief,
  priorResults: AgentExecutionResult[],
  sources: AgentSourceReference[],
  searchLimitations: string[]
): string {
  return [
    `Today is ${TODAY}.`,
    `Founder brief:\n${JSON.stringify(brief, null, 2)}`,
    `Your task objective:\n${spec.taskObjective}`,
    `Required context boundaries:\n${spec.requiredContext.join("\n")}`,
    `Your tools and data policy:\n${spec.toolPolicy.join("\n") || "No tools were assigned."}`,
    `Prior agent outputs available to you as structured handoff data only:\n${JSON.stringify(compactExecutions(priorResults), null, 2)}`,
    `Web search results retrieved for this agent only:\n${JSON.stringify(sources, null, 2)}`,
    `Search limitations:\n${JSON.stringify(searchLimitations, null, 2)}`,
    "Return findings with sourceIds only when they refer to the listed search result IDs. Never create a URL or source ID yourself.",
    "Claims without sourceIds are assumptions and must include a limitation."
  ].join("\n\n");
}

function compactExecutions(executions: AgentExecutionResult[]) {
  return executions.map((execution) => ({
    agentName: execution.agentName,
    executionThreadId: execution.executionThreadId,
    taskObjective: execution.taskObjective,
    summary: execution.summary,
    findings: execution.findings.map((finding) => ({
      claim: finding.claim,
      summary: finding.summary,
      sourceIds: finding.sourceIds,
      confidence: finding.confidence,
      limitations: finding.limitations
    })),
    assumptions: execution.assumptions,
    limitations: execution.limitations,
    confidence: execution.confidence,
    sourceCount: execution.sources.length
  }));
}

async function requestJsonFromOpenAI<T>(input: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  schemaName: string;
  schema: unknown;
  maxOutputTokens: number;
}): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = getTimeoutMs();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: input.model,
        input: [
          {
            role: "system",
            content: input.systemPrompt
          },
          {
            role: "user",
            content: input.userPrompt
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: input.schemaName,
            strict: true,
            schema: input.schema
          }
        },
        max_output_tokens: input.maxOutputTokens
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

    return JSON.parse(outputText) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`OpenAI request timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function systemPromptFor(agentName: string, purpose: string): string {
  return [
    `You are ${agentName}, one independent Agent Studio worker.`,
    purpose,
    "You have your own LLM execution context. Do not assume another agent's hidden reasoning.",
    "Use only the founder brief, structured handoff outputs, and search results provided in this call.",
    "Do not invent citations, URLs, customers, competitors, market sizes, or source-backed claims.",
    "Return concise structured JSON only. Mention limitations directly."
  ].join(" ");
}

function taskObjectiveFor(agentName: string, brief: VentureBrief): string {
  const objectives: Record<string, string> = {
    "Managing Partner": `Synthesize a final source-aware verdict for "${brief.idea}", resolve contradictions, and preserve unsupported claims as assumptions.`,
    "Intake and Clarification": "Extract the venture brief, missing inputs, founder constraints, safe assumptions, and clarification risks.",
    "Venture Framer": "Turn the brief into hypotheses, critical assumptions, unknowns, and specialist research questions.",
    "Market Evidence": "Independently retrieve and assess source-backed market, competitor, substitute, and demand evidence.",
    "Customer and ICP": "Define the first buyer segment, workflow pain, buying trigger, objections, and interview plan.",
    "Product Strategy": "Scope the MVP, non-goals, user journey, feasibility risks, and acceptance criteria.",
    "Business Modeler": "Analyze pricing, unit economics assumptions, cost drivers, and willingness-to-pay risk.",
    "Growth Strategist": "Independently assess launch channels, validation experiments, first-user actions, and channel risks.",
    "Red Team Critic": "Challenge urgency, moat, substitutes, willingness to pay, evidence quality, and verdict pressure.",
    "Quality Control": "Audit all agent outputs for missing citations, unsupported numbers, contradictions, overclaims, and revision needs.",
    "Artifact Producer": "Prepare artifact-ready material from approved claims only, without adding new evidence."
  };

  return objectives[agentName] ?? `Analyze ${brief.idea} from the ${agentName} role.`;
}

function requiredContextFor(agentName: string): string[] {
  const shared = ["Use the founder brief exactly as provided.", "Use prior outputs only as structured handoff data."];
  const context: Record<string, string[]> = {
    "Market Evidence": [...shared, "Use only this agent's search results for source-backed claims."],
    "Growth Strategist": [...shared, "Use only this agent's search results for channel or community claims."],
    "Quality Control": [...shared, "Treat missing sources as validation failures, not as minor wording issues."],
    "Managing Partner": [...shared, "Use merged evidence, source counts, contradiction flags, and limitations."]
  };

  return context[agentName] ?? shared;
}

function dependenciesFor(agentName: string): string[] {
  const dependencies: Record<string, string[]> = {
    "Managing Partner": [
      "Intake and Clarification",
      "Venture Framer",
      "Market Evidence",
      "Customer and ICP",
      "Product Strategy",
      "Business Modeler",
      "Growth Strategist",
      "Red Team Critic",
      "Quality Control",
      "Artifact Producer"
    ],
    "Intake and Clarification": [],
    "Venture Framer": ["Intake and Clarification"],
    "Red Team Critic": specialistAgentNames(),
    "Quality Control": [...specialistAgentNames(), "Red Team Critic"],
    "Artifact Producer": ["Quality Control"]
  };

  return dependencies[agentName] ?? ["Venture Framer"];
}

function searchQueriesFor(agentName: string, brief: VentureBrief): string[] {
  const idea = brief.idea || "startup idea";
  const customer = brief.targetCustomer || "target customer";
  const geography = brief.geography || "global";

  if (agentName === "Market Evidence") {
    return [
      `${idea} ${customer} competitors substitutes market evidence ${geography}`,
      `${customer} workflow pain demand evidence ${idea}`
    ].map(clampSearchQuery);
  }

  if (agentName === "Growth Strategist") {
    return [
      `${customer} communities launch channels startup ${geography}`,
      `${idea} validation experiment first users ${customer}`
    ].map(clampSearchQuery);
  }

  return [];
}

function specialistAgentNames(): string[] {
  return ["Market Evidence", "Customer and ICP", "Product Strategy", "Business Modeler", "Growth Strategist"];
}

function requiredSpec(plan: AgentExecutionSpec[], agentName: string): AgentExecutionSpec {
  const spec = plan.find((item) => item.agentName === agentName);
  if (!spec) {
    throw new Error(`Missing Agent Studio execution spec for ${agentName}.`);
  }
  return spec;
}

function sortExecutionsByPlan(executions: AgentExecutionResult[], plan: AgentExecutionSpec[]): AgentExecutionResult[] {
  const byName = new Map(executions.map((execution) => [execution.agentName, execution]));
  return plan.map((spec) => byName.get(spec.agentName)).filter((execution): execution is AgentExecutionResult => Boolean(execution));
}

function dedupeSources(sources: AgentSourceReference[]): AgentSourceReference[] {
  const byUrl = new Map<string, AgentSourceReference>();

  for (const source of sources) {
    const key = normalizeSourceUrl(source.url);
    const existing = byUrl.get(key);
    if (!existing || (source.score ?? 0) > (existing.score ?? 0)) {
      byUrl.set(key, source);
    }
  }

  return [...byUrl.values()];
}

function executionThreadId(agentName: string): string {
  return `${slug(agentName)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function needsCitation(value: string): boolean {
  return /\b(market|competitor|substitute|pricing|revenue|growth|demand|willingness to pay|paid|channel|community|conversion|tam|sam|som|cagr)\b/i.test(
    value
  );
}

function containsUnsupportedNumber(value: string): boolean {
  return /(\$|%|\b\d+(?:\.\d+)?\s?(x|k|m|b|million|billion|users|customers|revenue|conversion|cagr)\b)/i.test(value);
}

function mentionsContradiction(value: string): boolean {
  return /\b(contradict|conflict|tension|inconsistent|however|but no evidence|not enough evidence)\b/i.test(value);
}

function normalizeSourceUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = "";
    url.searchParams.sort();
    return url.toString().replace(/\/$/, "");
  } catch {
    return value.trim().toLowerCase();
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function mergeText(left: string, right: string): string {
  if (!right || left.includes(right)) {
    return left;
  }
  if (!left) {
    return right;
  }
  return `${left} ${right}`;
}

function lowestConfidence(left: AgentConfidence, right: AgentConfidence): AgentConfidence {
  const order: AgentConfidence[] = ["low", "medium", "high"];
  return order[Math.min(order.indexOf(left), order.indexOf(right))] ?? "medium";
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

function normalizeConfidence(value: unknown): AgentConfidence {
  return value === "low" || value === "medium" || value === "high" ? value : "medium";
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function clampSearchQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim().slice(0, 390);
}

function getTimeoutMs(): number {
  const raw = Number.parseInt(process.env.PREFLIGHT_OPENAI_TIMEOUT_MS || "", 10);

  if (Number.isNaN(raw)) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.max(MIN_TIMEOUT_MS, Math.min(MAX_TIMEOUT_MS, raw));
}

function isFatalOpenAIError(message: string): boolean {
  return /401|403|invalid api key|incorrect api key|unauthorized|permission denied/i.test(message);
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
      if (content && typeof content === "object" && "text" in content && typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("").trim() || undefined;
}
