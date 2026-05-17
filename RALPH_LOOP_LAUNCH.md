# Ralph Loop Launch Checklist

Use this checklist immediately before starting the autonomous Codex Goals implementation run.

## What Is Already Ready

The implementation specs are prepared in:

- `AGENTS.md` - mandatory Codex operating rules, skill/plugin triggers, autonomous checkpoint pushes, fallbacks, and verification gates.
- `README.md` - public project overview and project-level Goal prompt.
- `PLAN.md` - product plan, data contracts, file map, quality gates, and acceptance checklist.
- `CODEX_HANDOVER.md` - one-hour execution runbook, seeded demo content, verification expectations, and final log format.

The implementation should not require your clarification during the Ralph loop.

## Step 1: Confirm You Are In The Right Repo

Open Codex in this folder:

```text
C:\Users\zuyua\OneDrive\Desktop\digital-app\preflight
```

Confirm the repo has these files:

```text
AGENTS.md
README.md
PLAN.md
CODEX_HANDOVER.md
RALPH_LOOP_LAUNCH.md
```

## Step 2: Confirm GitHub Is Ready

The remote should be:

```text
https://github.com/ZuyuanChong/preflight.git
```

Run or ask Codex to run:

```powershell
git status --short --branch
git remote -v
git log --oneline -3
```

Expected:

- Branch is `main`.
- `origin` points to `https://github.com/ZuyuanChong/preflight.git`.
- Latest docs commit is present.

During implementation, Codex is authorized by `AGENTS.md` to commit and push useful checkpoints to `origin` when remote/auth are available.

## Step 3: Decide Runtime Credential Mode

For the first autonomous hour, use demo mode.

No OpenAI API key is required for the first successful build. You will be running implementation through Codex Goals using your ChatGPT Pro subscription, not app-side OpenAI API usage.

Optional Tavily live-evidence env vars for later:

```text
TAVILY_API_KEY=
TAVILY_API=
PREFLIGHT_MODE=demo
```

Use `TAVILY_API_KEY` if possible. If your local environment already uses `TAVILY_API`, Codex is instructed to support it as a fallback alias. Do not commit the real Tavily key. Put it in `.env.local` or the Codex runtime environment only.

Do not block the first run on OpenAI API, Tavily, Vercel, Supabase, auth, or database setup. The documentation instructs Codex to build the local demo first and treat missing optional integrations as nonfatal.

## Step 4: Pre-Approve Or Avoid Runtime Permission Blocks

Because you will not supervise the device during the Ralph loop, remove avoidable permission blockers before starting.

Check these are usable or acceptable to skip:

- GitHub push auth is already working.
- Internet is available.
- The machine will not sleep.
- Codex has permission to write files in this repo.
- Codex can run package install/build commands, or can fall back to `static-demo`.

If Codex asks for permission before you walk away, approve only scoped commands that match the project:

```text
npm install
npm run build
npm run dev
git push
```

Do not worry if live API or Vercel auth is missing. The first run should still succeed in demo mode.

## Step 5: Start The Primary Goal

Paste this exact Goal into Codex Goals for the Ralph loop:

```text
/goal Build a demo-ready Preflight web app in this repository within the current autonomous work window. First read and follow AGENTS.md, PLAN.md, CODEX_HANDOVER.md, README.md, and RALPH_LOOP_LAUNCH.md. Invoke the required skills/plugins in AGENTS.md when their trigger conditions appear. Implement using Codex Goals through the user's ChatGPT Pro subscription; do not require OPENAI_API_KEY or app-side OpenAI API usage for the primary build. The app must let a judge enter a startup idea, run or simulate an AI venture preflight sprint, and show a polished Intake, Live Sprint, Blueprint, Quality Gate, Red Team, Evidence Ledger, and Artifacts experience. Build demo mode first and keep it working without API keys. If Tavily evidence is added after demo mode works, use TAVILY_API_KEY server-side and fall back to TAVILY_API if present; never expose or commit secrets. Verify by running the local app, checking desktop and mobile layouts with Browser/Playwright/webapp-testing, and running typecheck/build where available. Commit and push useful checkpoints to origin according to AGENTS.md when remote/auth are available. Preserve README.md, PLAN.md, CODEX_HANDOVER.md, AGENTS.md, RALPH_LOOP_LAUNCH.md, .gitignore, and .env.example. Document generated work as hackathon-built, avoid Streamlit/basic RAG framing, and record commands, verification evidence, fallbacks, GitHub push status, and known gaps in IMPLEMENTATION_LOG.md. If dependency installation or dev server startup is blocked, create a static fallback demo and document the exact blocker and launch command.
```

## Step 6: Walk Away Rules

After starting the Goal:

- Do not edit files manually.
- Do not steer the implementation unless Codex explicitly stops as blocked.
- Do not interrupt if Codex switches to static fallback. That is an approved recovery path.
- Do not expect app-side live AI, Tavily, or Vercel unless P0 demo mode is already complete.

The intended one-hour result is a working local demo, not a fully live venture research backend.

## Step 7: What Codex Should Produce

At minimum:

- Working Next.js app or `static-demo` fallback.
- Intake first screen.
- Deterministic demo run without API keys.
- Live Sprint view.
- Blueprint view.
- Evidence ledger with sources vs assumptions.
- Quality gates with multiple issue types.
- Red-team critique.
- Seven artifact tabs.
- Responsive desktop and mobile layout.
- `IMPLEMENTATION_LOG.md` with commands, verification, fallbacks, GitHub checkpoint, and next Goal.
- GitHub checkpoint pushed to `origin` if auth/network allow.

## Step 8: After The Goal Finishes

Open `IMPLEMENTATION_LOG.md` first.

Check:

- How to run the app.
- Which verification commands passed.
- Whether Browser/Playwright/webapp-testing checks were done.
- Whether the latest checkpoint was pushed to GitHub.
- Known gaps and next recommended Goal.

Then run the app locally using the command in the log.

## Step 9: Next Goal Options

If the app works locally and you still have time for live evidence, use this:

```text
/goal Add optional live Tavily-backed evidence collection to the existing Preflight demo without breaking demo mode. First read AGENTS.md and use Tavily skills when available. Use TAVILY_API_KEY server-side, falling back to TAVILY_API if present, return structured evidence items matching the existing types, keep seeded fallback active when credentials or network are unavailable, and verify one live or fallback evidence run renders fully. Commit and push the checkpoint to origin when verified.
```

If the app is already demoable and you need submission polish, use this:

```text
/goal Make Preflight submission-ready by verifying setup from a fresh terminal, documenting env vars and demo mode, adding a 3-minute demo script to README.md, and deploying only if Vercel authentication is already available. First read AGENTS.md and use Browser/Playwright/webapp-testing for verification. Do not break the local demo while attempting deployment. Commit and push the checkpoint to origin when verified.
```

## Step 10: If Codex Stops Blocked

Only intervene if Codex stops and says it is blocked.

Common acceptable blockers:

- Filesystem write permission denied.
- Neither Next.js nor static fallback can be created.
- GitHub auth blocks a final push.
- The repo cannot be inspected.

Common non-blockers:

- Missing `TAVILY_API_KEY`.
- Missing `TAVILY_API`.
- Missing Vercel auth.
- Failed deployment.
- Search API unavailable.

For non-blockers, the docs instruct Codex to keep demo mode working and continue.
