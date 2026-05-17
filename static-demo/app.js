const demoBrief = {
  idea: "A web app where solo founders enter one sentence and an AI venture studio produces an evidence-backed company blueprint.",
  targetCustomer: "Solo technical founders and indie hackers before they spend a weekend building.",
  geography: "Global, English-speaking startup communities.",
  businessModel: "Freemium with paid deep-dive reports and team workspaces.",
  problem: "The founder needs a pre-build read on whether this idea deserves focused build time."
};

const verdict = {
  decision: "Pivot",
  rationale:
    "The wedge is strong, but the generic AI startup advisor market is crowded. The sharper opportunity is not idea validation; it is a pre-build decision system that makes evidence quality, red-team objections, and artifact consistency visible.",
  strongestWedge: "A founder can see what would have to be true before investing a weekend in the build.",
  nextActions: [
    "Narrow the initial ICP to solo technical founders doing weekend MVPs.",
    "Validate whether founders pay for pre-build decision confidence or only use free tools.",
    "Add live evidence collection for market and competitor claims.",
    "Turn quality gates into the product's trust layer."
  ],
  risks: [
    "Founders may prefer speed and optimism over critique.",
    "Existing AI research tools can imitate parts of the workflow.",
    "Live evidence quality can degrade under search or API failure."
  ]
};

const scorecard = {
  Pain: 78,
  "Buyer clarity": 72,
  Timing: 76,
  "Competition pressure": 44,
  Distribution: 64,
  Monetization: 48,
  Feasibility: 86,
  "Evidence quality": 62,
  "Red-team severity": 81
};

const agents = [
  ["Managing Partner", "Orchestrates, synthesizes, and decides the final verdict.", "Keep the demo focused on pre-build decision quality rather than broad startup advice."],
  ["Framer", "Converts raw idea into structured venture brief and assumptions.", "The critical unknown is whether founders pay for confidence before they build."],
  ["Market Scout", "Finds market signals, competitors, substitutes, pricing, and demand evidence.", "Use sourced hackathon constraints and label competitor categories as assumptions until live search is added."],
  ["Customer Analyst", "Defines ICP, pains, workflows, objections, and interview questions.", "The first ICP is a solo builder deciding whether to spend a weekend on an MVP."],
  ["Product Architect", "Scopes MVP, user journey, features, and non-goals.", "Ship the product surface before optional live research or export infrastructure."],
  ["Business Modeler", "Models pricing, unit economics, cost drivers, and monetization risk.", "Pricing remains a hypothesis until founders prove they pay for pre-build confidence."],
  ["Growth Strategist", "Creates launch channels, validation experiments, and GTM plan.", "Start with indie hacker and hackathon communities where weekend MVP decisions are frequent."],
  ["Red Team Critic", "Attacks assumptions, moat, urgency, willingness to pay, and evidence quality.", "Preflight must own quality-gated decisions or substitutes can imitate the workflow."],
  ["Artifact Producer", "Formats final outputs.", "Every artifact reinforces Pivot and does not contradict the risk profile."]
].map(([name, role, summary], index) => ({
  id: `agent-${index}`,
  name,
  role,
  summary,
  status: "queued",
  logs: []
}));

const logs = [
  "Managing Partner opened the sprint and set the decision bar.",
  "Framer converted the raw idea into assumptions and unknowns.",
  "Market Scout separated cited event constraints from unsourced market assumptions.",
  "Customer Analyst narrowed ICP to solo technical founders.",
  "Product Architect scoped the MVP to intake, sprint, evidence, gates, and artifacts.",
  "Business Modeler flagged willingness-to-pay as the highest-risk assumption.",
  "Growth Strategist chose community-led founder workflows as the first channel.",
  "Red Team challenged the generic AI advisor positioning.",
  "Artifact Producer aligned all outputs to the same verdict."
];

const evidence = [
  {
    kind: "source",
    claim: "Ralphthon Impact projects are evaluated on business value, UX polish, and whether the product is useful enough for real users.",
    title: "Ralphthon Singapore Participant Guide",
    url: "https://ralphthon.team-attention.com/guide",
    summary: "The guide frames Impact around market value, product polish, and AI serving a human user.",
    confidence: "high",
    agent: "Market Scout"
  },
  {
    kind: "source",
    claim: "Codex Goals are useful when a task needs a persistent objective, verification surface, and evidence-based completion.",
    title: "Using Goals in Codex",
    url: "https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex",
    summary: "OpenAI describes Goals as scoped completion contracts that keep a thread working toward an auditable outcome.",
    confidence: "high",
    agent: "Framer"
  },
  {
    kind: "assumption",
    claim: "Solo founders may pay for stronger pre-build decision confidence if the report saves a weekend of wasted build time.",
    summary: "This is the riskiest monetization assumption and must be tested with customer interviews.",
    confidence: "medium",
    agent: "Business Modeler"
  },
  {
    kind: "assumption",
    claim: "General AI research tools, pitch helpers, and startup templates are substitute categories, not sourced direct competitors in demo mode.",
    summary: "Live evidence mode should replace this with real competitor URLs before submission claims are made.",
    confidence: "medium",
    agent: "Market Scout"
  }
];

const issues = [
  ["fail", "missing citation", "Competitor and substitute claims need live sources before they can be treated as market proof.", "Keep substitutes labeled as assumptions until a Tavily-backed source is attached."],
  ["fail", "unsupported number", "Paid report pricing and team pricing are hypotheses, not validated revenue evidence.", "Run 10 founder willingness-to-pay interviews before presenting pricing as validated."],
  ["warn", "generic filler", "Phrases like AI-powered insights are too broad unless tied to a concrete founder decision.", "Use decision-language: proceed, pivot, pause, kill, and what must be true."],
  ["warn", "uncertain competitor", "General AI research tools are substitute categories until direct competitors are sourced.", "Categorize as substitutes in demo mode and source exact competitors in live evidence mode."],
  ["fail", "weak assumption", "Willingness to pay is business-critical and still untested.", "Make willingness to pay the first validation experiment after the demo."],
  ["warn", "overclaim", "Avoid words like validated or proven unless customer evidence exists.", "Use supported by early evidence or still an assumption until sourced."],
  ["warn", "contradiction", "A Proceed verdict would contradict the severe willingness-to-pay and evidence-quality risks.", "Keep the verdict at Pivot until customer payment proof and live source coverage improve."]
];

const redTeam = [
  "Founders may want momentum and affirmation more than a blunt critique.",
  "General AI research tools can imitate the workflow unless Preflight owns the quality-gated decision layer.",
  "The willingness-to-pay story is unproven until founders pay for a report before they build.",
  "Evidence trust breaks if assumptions and sourced claims are mixed together.",
  "A Pivot verdict must feel useful enough that the founder still wants the artifact package."
];

const artifacts = [
  ["Founder Memo", "warn", 2, "# Founder Memo\n\n## Decision\nPivot from generic AI startup advisor toward AI Venture Preflight.\n\n## Why\nThe sharper value is not generating more startup content. It is forcing an evidence-backed decision before a founder spends time building.\n\n## What Must Be True\n- Founders feel enough pain from wasted build weekends.\n- They trust a report that separates sources from assumptions.\n- Red-team critique increases trust instead of reducing motivation."],
  ["Market Brief", "warn", 2, "# Market Brief\n\n## Market Thesis\nSolo founders already use AI tools for research and drafting, but the unmet need is a disciplined pre-build decision workflow.\n\n## Evidence\n- Ralphthon Impact scoring rewards useful, polished AI-native products.\n- Codex Goals support evidence-checked autonomous build loops.\n\n## Open Questions\n- Which founder segment pays first?\n- Are substitutes good enough for one-off validation?\n- Does critique improve conversion or scare users away?"],
  ["PRD", "pass", 0, "# Product Requirements Document\n\n## MVP\n- Intake form\n- Live sprint dashboard\n- Evidence ledger\n- Quality gate panel\n- Final blueprint\n- Artifact tabs\n\n## Non-Goals\n- Authentication\n- Multi-run collaboration\n- PPTX export\n- Full web-search automation"],
  ["Pitch Deck Outline", "warn", 1, "# Pitch Deck Outline\n\n1. Problem: Founders build before they know what must be true.\n2. User: Solo technical founder choosing a weekend MVP.\n3. Solution: AI Venture Preflight with evidence, critique, and artifacts.\n4. Workflow: Intake, agents, evidence, quality gates, verdict, artifacts.\n5. Trust: Sources and assumptions are separated.\n6. Wedge: Pre-build decision, not post-build pitch polish.\n7. Business Model: Freemium plus paid deep reports.\n8. Risks: Crowded AI research space and willingness to pay.\n9. Roadmap: Live evidence, interview generator, workspace history.\n10. Ask: Validate with founders and ship live evidence collection."],
  ["Unit Economics", "fail", 1, "# Unit Economics\n\n## Assumptions\n- Free demo run uses seeded or lightweight model output.\n- Paid report uses deeper model calls and web evidence collection.\n- Main cost drivers are model tokens and search calls.\n\n## Pricing Hypothesis\n- Free: one demo preflight.\n- Paid: $19-49 for a deep-dive report.\n- Team: $99/month for saved runs and collaboration.\n\n## Risk\nPricing is unvalidated until founders show willingness to pay."],
  ["GTM Plan", "warn", 0, "# GTM Plan\n\n## First Segment\nSolo technical founders building weekend MVPs.\n\n## Channels\n- Indie hacker communities\n- Hackathon builders\n- Founder Discords and Slack groups\n- Build-in-public posts\n\n## First Experiment\nOffer 20 manual Preflight reports and measure whether founders change, pause, or sharpen their build plan."],
  ["Red-Team Memo", "warn", 1, "# Red-Team Memo\n\n## Strongest Objection\nFounders may want confidence and momentum more than honest critique.\n\n## Competitive Risk\nGeneral AI research tools can imitate parts of the workflow unless Preflight owns the quality-gated decision layer.\n\n## Evidence Risk\nThe product loses trust if it presents assumptions as facts.\n\n## Verdict Pressure\nThe demo must prove that Pivot or Pause can feel valuable, not disappointing."]
];

let runStatus = "idle";
let currentStep = 0;
let timer = null;
let activeArtifact = 0;

const $ = (id) => document.getElementById(id);

function setFormValues(brief = demoBrief) {
  $("idea").value = brief.idea;
  $("customer").value = brief.targetCustomer;
  $("geography").value = brief.geography;
  $("businessModel").value = brief.businessModel;
  $("briefFraming").textContent = brief.problem;
  updateSummary();
}

function currentBrief() {
  return {
    idea: $("idea").value.trim(),
    targetCustomer: $("customer").value.trim(),
    geography: $("geography").value.trim(),
    businessModel: $("businessModel").value.trim(),
    problem: "The founder needs a pre-build read on whether this idea deserves focused build time."
  };
}

function updateSummary() {
  $("summaryCustomer").textContent = $("customer").value || "Not provided";
  $("summaryBusiness").textContent = $("businessModel").value || "Not provided";
}

function resetAgents() {
  agents.forEach((agent) => {
    agent.status = "queued";
    agent.logs = [];
  });
}

function renderAgents() {
  $("agentList").innerHTML = agents
    .map(
      (agent) => `<article class="agent-row">
        <span class="status-dot dot-${agent.status}" aria-hidden="true"></span>
        <div>
          <div class="agent-title"><strong>${agent.name}</strong><span>${agent.status}</span></div>
          <p>${agent.summary}</p>
        </div>
      </article>`
    )
    .join("");

  const completed = agents.filter((agent) => agent.status === "complete").length;
  const progress = Math.round((completed / agents.length) * 100);
  $("progressLabel").textContent = `${progress}% complete`;
  $("progressAgents").textContent = `${completed} of ${agents.length} agents finished`;
  $("progressBar").style.width = `${progress}%`;
}

function renderLogs() {
  const rows = agents.flatMap((agent) => agent.logs.map((log) => `<li><span>${agent.name}</span>${log}</li>`));
  $("logList").innerHTML = rows.length ? rows.slice(-6).join("") : "<li>No sprint logs yet. Start the preflight to dispatch agents.</li>";
}

function renderStatus() {
  const pill = $("runStatus");
  pill.textContent = runStatus;
  pill.className = `status-pill status-${runStatus}`;
  $("metricVerdict").textContent = runStatus === "complete" ? verdict.decision : "Locked";
  $("blueprintVerdictBadge").textContent = runStatus === "complete" ? verdict.decision : "Locked";
  $("startButton").disabled = runStatus === "running" || !$("idea").value.trim();
  $("completeButton").disabled = runStatus === "running";
  $("resetButton").disabled = runStatus === "running";
}

function renderBlueprint() {
  const complete = runStatus === "complete";
  $("lockedState").hidden = complete;
  $("blueprintBody").hidden = !complete;
  if (!complete) return;

  const scoreRows = Object.entries(scorecard)
    .map(
      ([label, value]) => `<div class="score-row">
        <span>${label}</span>
        <div class="score-bar"><span style="width:${value}%"></span></div>
        <strong>${value}</strong>
      </div>`
    )
    .join("");

  $("blueprintBody").innerHTML = `
    <p class="verdict-copy">${verdict.rationale}</p>
    <div class="wedge-callout"><span>Strongest wedge</span><strong>${verdict.strongestWedge}</strong></div>
    <div class="score-grid">${scoreRows}</div>
    <div class="blueprint-columns">
      <div><h3>Next actions</h3><ul>${verdict.nextActions.map((item) => `<li>${item}</li>`).join("")}</ul></div>
      <div><h3>Risks</h3><ul>${verdict.risks.map((item) => `<li>${item}</li>`).join("")}</ul></div>
    </div>`;
}

function renderEvidence() {
  $("evidenceTable").innerHTML = evidence
    .map(
      (item) => `<article class="evidence-row">
        <div>
          <span class="kind-chip kind-${item.kind}">${item.kind}</span>
          <strong>${item.claim}</strong>
          <p>${item.summary}</p>
        </div>
        <div class="evidence-meta">
          <span>${item.agent}</span>
          <span>Confidence: ${item.confidence}</span>
          ${item.url ? `<a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a>` : "<span>Needs validation</span>"}
        </div>
      </article>`
    )
    .join("");
}

function renderIssues() {
  $("issueList").innerHTML = issues
    .map(
      ([severity, type, message, fix]) => `<article class="issue-card severity-${severity}">
        <div><span>${type}</span><strong>${message}</strong></div>
        <p>${fix}</p>
      </article>`
    )
    .join("");
}

function renderRedTeam() {
  $("redTeamIntro").textContent = `Red Team is intentionally specific to ${$("idea").value}. The purpose is to raise trust by showing what could break.`;
  $("redTeamList").innerHTML = redTeam.map((item) => `<li>${item}</li>`).join("");
}

function renderMarkdown(markdown) {
  return markdown
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return `<h3>${line.slice(2)}</h3>`;
      if (line.startsWith("## ")) return `<h4>${line.slice(3)}</h4>`;
      if (line.startsWith("- ") || /^\d+\./.test(line)) return `<li>${line.replace("- ", "")}</li>`;
      if (!line.trim()) return '<span class="markdown-space"></span>';
      return `<p>${line}</p>`;
    })
    .join("");
}

function renderArtifacts() {
  $("artifactTabs").innerHTML = artifacts
    .map(
      ([title], index) => `<button class="${index === activeArtifact ? "active" : ""}" role="tab" aria-selected="${index === activeArtifact}" data-artifact="${index}">${title}</button>`
    )
    .join("");

  const [title, status, citations, markdown] = artifacts[activeArtifact];
  $("artifactMeta").innerHTML = `<span class="severity-dot severity-${status}"></span> Quality: ${status}<span>${citations} linked evidence item(s)</span>`;
  $("artifactBody").innerHTML = renderMarkdown(markdown);

  document.querySelectorAll("[data-artifact]").forEach((button) => {
    button.addEventListener("click", () => {
      activeArtifact = Number(button.getAttribute("data-artifact"));
      renderArtifacts();
    });
  });
}

function renderAll() {
  updateSummary();
  renderStatus();
  renderAgents();
  renderLogs();
  renderBlueprint();
  renderEvidence();
  renderIssues();
  renderRedTeam();
  renderArtifacts();
}

function completeRun() {
  runStatus = "complete";
  agents.forEach((agent, index) => {
    agent.status = "complete";
    agent.logs = [logs[index]];
  });
  renderAll();
}

function stepSprint() {
  if (currentStep >= agents.length) {
    completeRun();
    return;
  }

  agents.forEach((agent, index) => {
    if (index < currentStep) agent.status = "complete";
    if (index === currentStep) {
      agent.status = "running";
      agent.logs = [logs[index]];
    }
    if (index > currentStep) agent.status = "queued";
  });

  renderAll();
  currentStep += 1;
  timer = window.setTimeout(stepSprint, 680);
}

function startSprint() {
  window.clearTimeout(timer);
  resetAgents();
  runStatus = "running";
  currentStep = 0;
  stepSprint();
}

function resetDemo() {
  window.clearTimeout(timer);
  runStatus = "idle";
  currentStep = 0;
  activeArtifact = 0;
  resetAgents();
  setFormValues();
  renderAll();
}

$("startButton").addEventListener("click", startSprint);
$("completeButton").addEventListener("click", completeRun);
$("resetButton").addEventListener("click", resetDemo);
["idea", "customer", "geography", "businessModel"].forEach((id) => {
  $(id).addEventListener("input", () => {
    $("briefFraming").textContent = currentBrief().problem;
    renderStatus();
    updateSummary();
    renderRedTeam();
  });
});

setFormValues();

const params = new URLSearchParams(window.location.search);
if (params.get("completed") === "1") {
  completeRun();
} else if (params.get("autostart") === "1") {
  startSprint();
} else {
  renderAll();
}
