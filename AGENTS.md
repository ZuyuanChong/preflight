# AGENTS.md - Preflight Autonomous Codex Operating Manual

This file is mandatory project context for all Codex runs in this repository.

## Mission

Build Preflight as a demo-ready AI Venture Preflight app for Ralphthon Impact track. The first autonomous run must produce a reliable local demo before optional live API, search, deployment, document export, or presentation export work.

## Required Reading Order

Before implementation, read:

1. `AGENTS.md`
2. `README.md`
3. `PLAN.md`
4. `CODEX_HANDOVER.md`
5. `RALPH_LOOP_LAUNCH.md`

If instructions conflict, use this priority:

1. User's latest direct instruction
2. `AGENTS.md`
3. `CODEX_HANDOVER.md`
4. `PLAN.md`
5. `README.md`

## Mandatory Skill And Plugin Trigger Matrix

These capabilities are expected to be available in this Codex environment. Use the matching skill or plugin automatically when the trigger condition appears. Do not wait for user confirmation.

| Trigger condition | Required skill/plugin | Required behavior |
|---|---|---|
| Starting project implementation from this plan | `superpowers:executing-plans` or `superpowers:subagent-driven-development` | Execute task-by-task with checkpoints. Use subagents only when explicitly authorized by the active Codex environment; otherwise execute inline. |
| Splitting independent implementation tasks | `superpowers:subagent-driven-development` | Split by disjoint files/responsibilities. Do not create conflicting workers. Review outputs before accepting. |
| Building or redesigning the web app UI | `build-web-apps:frontend-app-builder` | Build the actual product surface first, not a landing page. Use polished SaaS/productivity UI standards. |
| Debugging broken rendering, layout, build, typecheck, or tests | `superpowers:systematic-debugging` plus `build-web-apps:frontend-testing-debugging` | Reproduce, isolate, fix, rerun verification. Do not guess. |
| After editing React/Next.js files | `build-web-apps:react-best-practices` when available | Review for component structure, state, accessibility, and performance issues. |
| Local UI verification | Browser plugin first, then `playwright` or `webapp-testing` fallback | Open the local app, exercise the core demo path, and inspect desktop and mobile layouts. |
| Before claiming completion | `superpowers:verification-before-completion` | Run fresh verification commands and inspect output before any completion claim. |
| Adding model-generated product behavior | Codex Goals via ChatGPT Pro subscription | Do not require `OPENAI_API_KEY` for the first implementation. Codex itself is the autonomous coding agent. App runtime AI generation is optional later work only. |
| Adding web evidence or citations | Tavily skills: `tavily-search`, `tavily-extract`, or `tavily-research` | Use server-side Tavily with `TAVILY_API_KEY`, falling back to `TAVILY_API` if present. Gather real URLs and summaries. If unavailable, keep assumption labels and seeded citations. |
| Deploying | Vercel plugin or `vercel-deploy` | Deploy only after local build passes and auth is already available. Do not break local demo mode for deployment. |
| Publishing repo work | GitHub plugin, `github:yeet`, or local `git` | Commit and push autonomously when the checkpoint rules below say to do so and a remote/auth are available. Preserve user changes. |

If a required skill or plugin is unavailable, record that in `IMPLEMENTATION_LOG.md`, use the closest local fallback, and continue unless the missing capability makes both Next.js and static fallback impossible.

## Execution Priorities

Use this strict order:

1. Working demo mode.
2. Polished founder-facing UI.
3. Typed domain data and deterministic sprint simulation.
4. Evidence ledger, quality gates, red-team critique, and artifacts.
5. Responsive verification.
6. Optional server-side live generation.
7. Optional web evidence provider.
8. Optional deployment.

Do not start optional live runtime AI, Tavily, Vercel, Supabase, Figma, PPTX, PDF, auth, database, or generated product deployment until the local Preflight demo works. The implementation agent itself runs through Codex Goals using the user's ChatGPT Pro subscription, not through app-side OpenAI API usage.

## Autonomous Decision Rules

- Do not ask the user for clarification during the Ralph loop.
- Make the smallest conservative decision that preserves the demo.
- Prefer deterministic demo data over fragile live calls.
- Prefer simple local state over a database.
- Prefer a static fallback over stopping if dependency installation is blocked.
- Treat missing Tavily keys, missing network, or missing deployment auth as expected conditions.
- Record every blocker and fallback in `IMPLEMENTATION_LOG.md`.
- Never invent fake citations. Unsourced claims must be marked as assumptions.
- Never expose API keys in client code.
- Never commit `.env`, `.env.local`, or real secrets. `.env.example` is the only env file that may be committed.
- Never present planning docs as shipped hackathon product code.

## Autonomous GitHub Checkpoint Rules

The user has explicitly authorized autonomous GitHub pushes for this project when needed during implementation.

When a Git remote exists and authentication is available, commit and push without waiting for user approval at these checkpoints:

1. After the initial demo shell or static fallback is runnable.
2. After P0 demo mode passes local verification.
3. Before starting risky optional live API/search/deployment work.
4. After final verification for the current Goal.
5. Before stopping for budget exhaustion, so remote GitHub contains the latest useful state.

Commit rules:

- Stage only project files that belong to the current implementation.
- Do not stage unrelated user changes.
- Use short, descriptive commit messages such as `docs: harden autonomous handoff`, `feat: build preflight demo shell`, or `chore: checkpoint verified demo`.
- If checks fail but the state is still a useful recovery checkpoint, commit with a message that includes `checkpoint` and record failing checks in `IMPLEMENTATION_LOG.md`.
- Push the current branch to `origin` with upstream tracking when needed.
- If push fails due to network/auth/protection, log the exact error in `IMPLEMENTATION_LOG.md` and continue with local work.

## Technical Defaults

Preferred app stack:

- Next.js App Router
- TypeScript
- CSS or Tailwind
- Local typed demo data
- Codex Goals through ChatGPT Pro for implementation work
- Optional server-side Tavily search/evidence provider

Do not require `OPENAI_API_KEY` for the primary autonomous implementation. If future app-runtime AI generation is added, it must be an explicit later enhancement and must not break demo mode.

If Next.js cannot be installed or started, create:

- `static-demo/index.html`
- `static-demo/styles.css`
- `static-demo/app.js`
- `static-demo/README.md`

The static fallback must still implement intake, sprint progress, blueprint, evidence ledger, quality gates, red-team critique, and artifact tabs.

## Orchestration Logic

For the first autonomous build, use deterministic in-app orchestration:

1. Intake creates or resets a `PreflightRun`.
2. Sprint simulation moves agents from `queued` to `running` to `complete`.
3. Each agent appends a visible log line.
4. Evidence and quality gates are visible during or after the sprint.
5. Final verdict appears only after the sprint completes or the user loads completed demo mode.
6. Artifact tabs render from the same source blueprint to avoid contradictions.

Do not build a Python Codex subprocess orchestrator for the first hour. It is lower priority than the visible product demo.

## Retry And Self-Correction Rules

For implementation failures:

- Build/typecheck failure: inspect the exact error, patch the smallest relevant code, rerun the same command. Retry up to three focused cycles before switching to fallback.
- Dev server failure: inspect logs, fix config/dependency issues, rerun. If install/network/auth blocks progress, switch to static fallback.
- Browser/layout failure: fix overflow, clipped text, broken controls, and mobile stacking, then re-open the app.
- Live app-runtime AI failure: keep demo mode active, show a nonfatal live-mode warning, and log the blocker.
- Tavily/search/citation failure: keep source-ready evidence UI, retain seeded real citations, and label unsourced claims as assumptions.
- Deployment failure: keep local demo as canonical, log the error, and do not spend more time unless local demo remains verified.
- Git push failure: keep local commits, log the exact error, and continue. Do not block the demo on remote publishing unless final submission explicitly requires it.

## Quality Standards

The demo fails if any of these are true:

- First screen is a marketing landing page instead of usable intake.
- Demo requires API keys.
- Claims appear sourced when they are not.
- Quality gates are absent or only cosmetic.
- Red-team critique is generic.
- Artifacts contradict the final verdict.
- Mobile layout has horizontal overflow.
- Desktop layout has overlapping panels or clipped primary text.
- App cannot be run or opened locally.
- Verification evidence is missing from `IMPLEMENTATION_LOG.md`.

## Required Verification

Run the strongest available verification before completion:

```powershell
npm run typecheck
npm run build
npm run dev
```

Then verify with Browser, Playwright, or webapp-testing:

- Intake loads first.
- Start sprint works.
- Completed demo mode works without API keys.
- Evidence ledger separates sources and assumptions.
- Quality gates show multiple issue types.
- Red-team critique is specific.
- All artifact tabs open.
- Mobile width has no horizontal overflow.
- Desktop layout has no overlapping key content.

If using static fallback, verify `static-demo/index.html` opens and the same manual checks pass.

## Completion Contract

A Goal may be marked complete only when:

- A working Next.js app or static fallback exists.
- The core demo path works end to end.
- Verification commands or fallback manual checks have been run.
- `IMPLEMENTATION_LOG.md` records what was built, how to run it, verification evidence, known gaps, and next best Goal.
- Latest useful checkpoint is committed and pushed to `origin` when remote/auth are available, or the push blocker is recorded.

Budget exhaustion is not completion. If budget is reached, stop substantive work and summarize current state, verified evidence, blockers, and the next concrete step.
