# Implementation Log

## 2026-05-17 API Route Merge Conflict Fix

### Issue

`src/app/api/runs/route.ts` still contained Git merge conflict markers around the OpenAI failure response. Next.js stopped compiling the route with `Merge conflict marker encountered`, which caused `POST /api/runs`, `/`, and `/sw.js` to return 500s during dev compilation.

Root cause: a conflict between the retryable error behavior and the deterministic demo fallback behavior was left unresolved in the API route.

### Fix

- Removed the conflict block from `src/app/api/runs/route.ts`.
- Kept the current branch behavior: live OpenAI failures return a retryable deterministic demo fallback run, with assumptions kept separate from sourced claims.

### Verification

```powershell
rg -n '<<<<<<<|=======|>>>>>>>' src static-demo tests package.json package-lock.json tsconfig.json next.config.mjs .env.example .gitignore README.md PLAN.md CODEX_HANDOVER.md AGENTS.md RALPH_LOOP_LAUNCH.md
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Results:

- Source conflict marker scan found no matches.
- `npm.cmd run typecheck` passed with exit code 0.
- `npm.cmd run build` passed with exit code 0 after stopping stale concurrent Next dev servers that were all writing `.next`.
- Foreground `npm.cmd run dev -- --hostname 127.0.0.1 --port 3000` reached `Ready in 1374ms`; the verification command timed out because a dev server stays open by design.

Note: five stale Preflight dev servers on ports `3000`, `3111`, `3120`, `3121`, and `3122` were stopped because they were serving `/api/runs` but returning `500` on `/` from corrupted concurrent `.next` state.

## 2026-05-17 Warmup Button Release Fix

### Issue

After adding backend warmup, the `Start preflight` button could remain greyed out after the page appeared done loading.

Root cause: the client warmup request to `GET /api/runs` had no timeout. If that warmup request hung during a dev-server cold compile or network/runtime hiccup, `finally` never ran and `isPreparing` stayed `true`, leaving the primary button disabled.

### Fix

- Added `BACKEND_WARMUP_TIMEOUT_MS = 6000` in `src/app/page.tsx`.
- Wrapped the warmup `fetch("/api/runs")` with `AbortController`.
- Always clears `isPreparing` after success, failure, or timeout.
- On timeout, the UI now enables `Start preflight` and explains that the route will retry on click.

### Verification

```powershell
npm.cmd run typecheck
npm.cmd run build
```

Both passed.

Browser cold-load verification on port `3122`:

```text
initial button: Preparing backend, disabled: true
GET /api/runs 200 in 472ms
released button: Start preflight, disabled: false
status: Start preflight uses server-side OpenAI when available. Load completed demo remains the explicit fallback.
browser console errors/warnings: none
```

## 2026-05-17 First-Load Warmup Fix

### Issue

After `npm run dev`, the first visible page load sometimes required a manual browser refresh before `Start preflight` reliably kicked off the backend LLM path.

Root cause: in Next.js dev mode, `/api/runs` was compiled lazily on the first `POST /api/runs`. The first button click was doing both route compilation/import warmup and the live OpenAI request. On a cold dev server, that made the first click fragile and made it look like the backend did not start until after a refresh.

### Fix

- Added lightweight `GET /api/runs` health/warmup response.
- Added a client-side warmup call after hydration.
- Disabled the primary button as `Preparing backend` until the route warmup completes.
- Kept the explicit demo fallback button available.

### Verification

Browser cold-load verification on port `3121`:

```text
early button: Preparing backend, disabled: true
GET /api/runs 200 in 561ms
ready button: Start preflight, disabled: false
```

First enabled click verification:

```text
POST /api/runs 502 in 92ms
```

The `502` is expected in the Browser sandbox because outbound OpenAI access is restricted there. The important check is that the first enabled click reached the warmed backend route immediately, with no second API route compilation.

## 2026-05-17 OpenAI Timeout Reliability Update

### Issue

`Start preflight` sometimes returned:

```text
OpenAI generation failed, so Preflight used demo fallback output. OpenAI request timed out.
```

Root cause: `src/lib/openai-preflight.ts` aborted the OpenAI request after a hardcoded 45 seconds while asking the model to produce a large strict JSON payload including seven full artifacts. The API route caught that timeout and returned a completed seeded demo run, so the UI looked successful but showed demo content.

### Fix

- Replaced the hardcoded 45-second timeout with `PREFLIGHT_OPENAI_TIMEOUT_MS`, defaulting to `120000`.
- Clamped timeout values between `30000` and `180000` to avoid accidental near-zero or indefinitely long requests.
- Reduced the OpenAI response size by removing seven full artifacts from the structured model schema.
- Kept OpenAI responsible for the core blueprint: brief, agent summaries, evidence/assumptions, quality issues, scorecard, verdict, and red-team objections.
- Built the seven founder artifacts locally from the generated blueprint so they stay dynamic without forcing a huge model response.
- Changed live OpenAI failures to return `502` or `504` with a retry message instead of returning a completed demo run.
- Updated the client so failed live generation leaves the current run state intact and tells the user to retry or explicitly load the completed demo.

### Verification

```powershell
npm.cmd run typecheck
```

Result: passed with exit code 0 after the reliability update.

```powershell
npm.cmd run build
```

Result: passed with exit code 0. Next.js built `/` and `/api/runs`. Webpack emitted cache snapshot warnings, but the production build completed.

Note: one parallel verification attempt ran `typecheck` and `build` simultaneously and caused `typecheck` to read `.next/types` while `next build` was regenerating that directory. Rerunning `typecheck` by itself passed.

Live smoke test with OpenAI network access on port `3110`:

```text
mode: live
decision: Pivot
firstRisk: Integrations with dental practice management systems may be more difficult than expected.
firstArtifact: Founder Memo
artifactMentionsDental: true
POST /api/runs 200 in 22501ms
```

Rendered failure UX test through Browser on port `3111`:

```text
POST /api/runs 502 in 548ms
hasRetryMessage: true
stillIdle: true
notCompletedDemo: true
```

This confirms failed live generation no longer auto-renders the completed demo fallback.

Git checkpoint attempt:

```powershell
git -c safe.directory=C:/Users/zuyua/OneDrive/Desktop/digital-app/preflight add .env.example IMPLEMENTATION_LOG.md README.md src/app/page.tsx src/app/api/runs/route.ts src/components/IntakePanel.tsx src/lib/artifacts.ts src/lib/openai-preflight.ts
```

Result:

```text
fatal: Unable to create 'C:/Users/zuyua/OneDrive/Desktop/digital-app/preflight/.git/index.lock': Permission denied
```

## 2026-05-17 Dynamic OpenAI Update

### Skills And Tools Used

- `openai-developers:openai-platform-api-key` credential gate: checked for `OPENAI_API_KEY` without printing secrets, then continued after the user confirmed `.env.local` contains the key.
- `openai-docs`: checked current OpenAI API guidance for structured Responses API output.
- `superpowers:executing-plans` for executing the project plan inline.
- `build-web-apps:frontend-app-builder` and `build-web-apps:frontend-testing-debugging` for the Next.js UI/API update and rendered route verification.
- `build-web-apps:react-best-practices` after editing React/Next.js files.
- `superpowers:systematic-debugging` for dev-server and API smoke-test failures.
- `superpowers:verification-before-completion` before claiming completion.

### What Changed

- Added `POST /api/runs` as a server-side Next.js route.
- Added server-only OpenAI Responses API generation in `src/lib/openai-preflight.ts`.
- Updated the React intake flow so `Start preflight` requests a generated run from the server before animating the sprint.
- Preserved demo fallback for missing keys, `demo-only` mode, OpenAI failures, and static fallback usage.
- Added dynamic red-team objections to the shared `PreflightRun` contract.
- Updated `.env.example` and README guidance for `OPENAI_API_KEY`, `OPENAI_MODEL`, and `PREFLIGHT_MODE`.
- OpenAI-generated evidence is treated as assumptions by default because no verified web evidence provider is connected yet.

### How To Run Dynamic Mode

Create or update `.env.local`:

```powershell
OPENAI_API_KEY=your_key_here
PREFLIGHT_MODE=auto
```

Then run:

```powershell
npm.cmd run dev
```

Open `http://127.0.0.1:3000` or the URL printed by Next.js, enter a non-demo idea, and click `Start preflight`.

### Verification

Commands run:

```powershell
npm.cmd run typecheck
```

Result: passed with exit code 0 after the OpenAI route and client changes. Re-run before handoff: passed with exit code 0.

```powershell
npm.cmd run build
```

Result: passed with exit code 0. Next.js built `/` and dynamic route `/api/runs`. Webpack emitted cache snapshot warnings, but the build completed successfully.

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3100
```

Result: dev server returned HTTP 200 for `/`.

Live route smoke test with escalated network access:

```powershell
POST http://127.0.0.1:3100/api/runs
```

Input idea: `An AI scheduling copilot for small dental clinics that fills last-minute cancellations from a patient waitlist.`

Result: returned `mode: live`, no warning, dynamic dental-clinic-specific verdict, risks, assumptions, and artifact title.

Observed summary:

```text
mode: live
decision: Pivot
sources: 0
assumptions: 6
firstRisk: The pain may be real but not urgent enough to displace existing manual workflows.
firstArtifact: Founder Memo: Cancellation Fill Copilot for Dental Clinics
```

Rendered Browser verification:

- Browser plugin path connected through the in-app Browser runtime.
- Desktop 1280px check: intake present first, evidence, quality gates, red team, and artifacts present, no framework overlay, no relevant console warnings/errors, and no horizontal overflow.
- Artifact tabs check: all seven tabs were present and each tab became active when clicked.
- Mobile 390px check: intake and primary controls were visible, and no horizontal overflow was detected.
- Browser-run server could not reach OpenAI from the restricted sandbox and correctly fell back to demo mode with `fetch failed`; live OpenAI behavior was verified separately through the escalated route smoke test above.

Git checkpoint attempt:

```powershell
git -c safe.directory=C:/Users/zuyua/OneDrive/Desktop/digital-app/preflight add .env.example IMPLEMENTATION_LOG.md README.md src/app/globals.css src/app/page.tsx src/app/api/runs/route.ts src/components/IntakePanel.tsx src/components/RedTeamPanel.tsx src/data/demo-run.ts src/lib/openai-preflight.ts src/lib/sprint.ts src/types/preflight.ts
```

Result:

```text
fatal: Unable to create 'C:/Users/zuyua/OneDrive/Desktop/digital-app/preflight/.git/index.lock': Permission denied
```

### Known Gaps

- OpenAI dynamic generation is live, but source evidence is not verified web research. Generated evidence is therefore displayed as assumptions unless a future Tavily or verified evidence provider is added.
- Static fallback remains deterministic by design because putting an OpenAI key in browser-only static files would expose the secret.
- Git checkpoint status from the earlier run still applies: `.git` writes are blocked by local permissions.

## Skills And Tools Used

- `superpowers:executing-plans` for inline task execution against the written plan.
- `build-web-apps:frontend-app-builder` for the product UI build.
- `superpowers:systematic-debugging` for Git/npm/browser issues.
- `browser:browser` was read first for local UI verification, but its required Node REPL browser-control tool was not exposed in this session.
- `build-web-apps:frontend-testing-debugging` for fallback rendered UI verification.
- `build-web-apps:react-best-practices` after editing React/Next.js files.
- Codex Goal execution through the user's ChatGPT Pro environment. The first build did not require app-side `OPENAI_API_KEY`; this update adds optional server-side OpenAI runtime generation.

## What Was Built

- Hackathon-built Preflight demo surface with Intake, Live Sprint, Blueprint, Quality Gates, Red Team, Evidence Ledger, and Artifacts.
- Preferred Next.js App Router source was scaffolded under `src/` with TypeScript data contracts and components.
- Next.js and the approved static fallback are both present. The static fallback remains available as a no-dependency recovery path.
- Static fallback includes deterministic browser-only sprint simulation, completed demo mode, source-vs-assumption evidence ledger, seven quality issue types, specific red-team objections, and seven artifact tabs.
- Review fixes applied after QA: generated `.verification/` browser profiles were removed and ignored, the static Blueprint badge now stays `Locked` until completion, and Next.js sprint log lines now match the agent order.
- No Tavily, Vercel, Supabase, database, auth, or generated export was added. Server-side OpenAI API generation was added in the dynamic update above.

## How To Run

Next.js app:

```powershell
npm.cmd install
npm.cmd run dev
```

Verified fallback:

```powershell
static-demo\index.html
```

Optional local browser check:

```powershell
$uri = ([System.Uri](Resolve-Path static-demo\index.html).Path).AbsoluteUri
Start-Process $uri
```

The fallback is still useful if dependency installation is blocked in a fresh environment.

## Verification

Commands run:

```powershell
node --check static-demo\app.js
```

Result: passed with exit code 0.

```powershell
npm.cmd install
```

Initial result: command timed out after 120 seconds.

```powershell
npm.cmd install --no-audit --no-fund
```

Initial result: command timed out after 300 seconds, but `node_modules` and `package-lock.json` later appeared in the workspace, likely after the timed-out install process completed.

```powershell
npm.cmd run typecheck
```

Result after dependencies appeared: passed with exit code 0.

```powershell
npm.cmd run build
```

Result after dependencies appeared: passed with exit code 0. Next.js 15.0.4 compiled successfully and generated the static route `/`.

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Result: local dev server returned HTTP 200 for `http://127.0.0.1:3000`, then the job was stopped.

Review-specific verification:

- `Test-Path .verification` returned `False` after cleanup.
- `.gitignore` now contains `.verification/` and `*.tsbuildinfo`.
- Static initial DOM check returned `INITIAL_BADGE_LOCKED`.
- Static completed DOM check returned `COMPLETED_BADGE_PIVOT`.
- `src/lib/sprint.ts` log order starts with Managing Partner and matches `demoAgents`.

Rendered verification:

- Browser plugin path was attempted by reading the Browser skill first, but the required Node REPL browser-control tool was unavailable in this session.
- Fallback local browser verification used Microsoft Edge headless by absolute path.
- Captured and inspected:
  - Desktop completed demo at 1440x1100.
  - Mobile completed demo at 390x1100.
  - Desktop autostart sprint state at 1440x1100.
- Initial screenshot attempt exposed a file URL encoding issue; recapture used `[System.Uri](Resolve-Path static-demo\index.html).Path).AbsoluteUri`.
- Visual checks after recapture: intake appears first, completed demo state renders, sprint autostart shows running state, verdict/evidence/gates are visible, desktop panels do not overlap, and mobile stacks without visible panel overlap.
- Edge `--dump-dom` verification confirmed all seven artifact tabs are present: Founder Memo, Market Brief, PRD, Pitch Deck Outline, Unit Economics, GTM Plan, and Red-Team Memo.

## Demo Path

1. Open `static-demo\index.html`.
2. Confirm Intake is the first usable product surface.
3. Click `Start preflight` to run the sprint animation.
4. Use `Load completed demo` for judge-safe immediate completion.
5. Inspect:
   - Live Sprint agent statuses and logs.
   - Blueprint Pivot verdict and scorecard.
   - Evidence Ledger with source and assumption rows.
   - Quality Gates with missing citation, unsupported number, generic filler, uncertain competitor, weak assumption, overclaim, and contradiction.
   - Red Team pressure test.
   - All seven Founder Artifacts tabs.

## Known Gaps

- Initial dependency installation timed out twice before `node_modules` became available; a fresh environment may still need patience during install.
- Static fallback remains the canonical no-dependency demo recovery path.
- No live Tavily evidence provider was added; seeded sources and assumptions remain clearly labeled.
- No deployment was attempted because local demo mode had priority.
- Browser plugin automation was not available; verification used Edge headless fallback.

## GitHub Checkpoint

Blocked locally by `.git` write permissions.

Git requires per-command `safe.directory` because the repo owner SID differs from the current user SID. Commands should use:

```powershell
git -c safe.directory=C:/Users/zuyua/OneDrive/Desktop/digital-app/preflight ...
```

Checkpoint attempt:

```powershell
git -c safe.directory=C:/Users/zuyua/OneDrive/Desktop/digital-app/preflight add .gitignore IMPLEMENTATION_LOG.md package.json package-lock.json next.config.mjs tsconfig.json next-env.d.ts src static-demo
```

Result:

```text
fatal: Unable to create 'C:/Users/zuyua/OneDrive/Desktop/digital-app/preflight/.git/index.lock': Permission denied
```

Additional probe:

```powershell
New-Item -Path .git\codex_write_probe -ItemType File -Force
```

Result:

```text
Access to the path 'C:\Users\zuyua\OneDrive\Desktop\digital-app\preflight\.git\codex_write_probe' is denied.
```

No commit or push was created. The latest useful state is present in the working tree.

## Next Best Goal

```text
/goal Make Preflight submission-ready by verifying setup from a fresh terminal, documenting env vars and demo mode, adding a 3-minute demo script to README.md, and deploying only if Vercel authentication is already available. First read AGENTS.md and use Browser/Playwright/webapp-testing for verification. Do not break the local demo while attempting deployment. Commit and push the checkpoint to origin when verified.
```

## Artifact Depth Merge Checkpoint - 2026-05-17

Branch work:

- Created and committed `codex/artifact-output-depth` from `main` in `.verification/worktrees/artifact-output-depth`.
- Commit: `80a6495 feat: deepen founder artifact outputs`.
- Merged the feature branch into `product-demo`.
- Resolved conflicts in `src/app/api/runs/route.ts` and `static-demo/app.js`.

What changed:

- Added Executive Summary and Detailed Report output depth controls.
- Rebuilt the artifact generator around founder-ready structured sections for the memo, market brief, PRD, deck outline, unit economics, GTM plan, and red-team memo.
- Tightened live OpenAI instructions for concrete founder deliverables, evidence/assumption separation, and minimum structured detail.
- Preserved deterministic fallback output when live generation fails.
- Updated static fallback artifacts and depth controls.
- Added `tests/artifact-depth.test.mjs` and `npm run test:artifacts`.

Verification:

- `npm.cmd run test:artifacts` passed: 2/2 tests.
- `npm.cmd run build` passed after rerunning serially.
- `npm.cmd run typecheck` passed after rerunning serially.
- A parallel `typecheck`/`build` attempt failed because both touched `.next` at the same time; rerunning serially resolved it.

Known notes:

- Browser plugin was not available in this session.
- Playwright CLI fallback required an `npx` package approval that was not granted, so verification focused on automated artifact contracts and Next.js build/typecheck.

## Scorecard Scale Fix - 2026-05-17

Branch:

- Confirmed working branch with `git -c safe.directory=C:/Users/zuyua/OneDrive/Desktop/digital-app/preflight status --short --branch`: `main...origin/main`.

Root cause:

- The demo scorecard data and UI label already use a 0-100 confidence scale, but the live OpenAI generation prompt did not explicitly reject 0-10-style scores.
- The live scorecard normalizer clamped values to 0-100 but did not promote a full ten-point response, so generated values like 8, 7, and 6 could render beside the `0-100 confidence read` label.

What changed:

- Added explicit live-generation instruction in `src/lib/openai-preflight.ts`: scorecard values must be 0-100 integer confidence scores, not 0-10 scores.
- Exported and hardened `normalizeScorecard` so a full ten-point-shaped scorecard is promoted to the UI's 0-100 scale while already-percentage scorecards remain unchanged and clamped.
- Added `tests/scorecard-scale.test.mjs` and `npm run test:scorecard` to cover the regression.

Verification:

- `npm.cmd run test:scorecard` passed: 3/3 tests.
- `npm.cmd run test:artifacts` passed: 2/2 tests.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed. Build emitted nonfatal Webpack cache snapshot warnings after successful route generation.
- `npm.cmd run dev -- --hostname 127.0.0.1 --port 3000` attempted through the dev script and failed with `Error: listen EACCES: permission denied 127.0.0.1:3000`.
- `npm.cmd run dev -- --hostname 127.0.0.1 --port 3001` started successfully at `http://127.0.0.1:3001` and reported `Ready in 1855ms`.
- Browser plugin verification on `http://127.0.0.1:3001`:
  - Page identity: title `Preflight`, URL `http://127.0.0.1:3001/`.
  - Completed demo interaction: clicked `Load completed demo`.
  - Scorecard rows rendered 0-100 values and matching widths: Pain 78/78%, Timing 76/76%, Competition pressure 44/44%, Buyer clarity 72/72%, Distribution 64/64%, Monetization 48/48%, Feasibility 86/86%, Evidence quality 62/62%, Red-team severity 81/81%.
  - Desktop viewport check: `innerWidth` 1280, `scrollWidth` 1265, no relevant console errors or warnings.
  - Mobile viewport check: `innerWidth` 390, `scrollWidth` 375, same 0-100 scorecard values and no relevant console errors or warnings.

Known notes:

- The live OpenAI endpoint was not called during verification because the regression is covered by the normalizer contract and prompt text without requiring API/network availability.
- `Start-Process` hit the existing Windows `Path`/`PATH` environment collision, so the dev server was launched through the Node-backed browser verification runtime instead.

GitHub checkpoint:

- Commit/push was attempted from `main` after verification.
- Staging command:

```powershell
git -c safe.directory=C:/Users/zuyua/OneDrive/Desktop/digital-app/preflight add IMPLEMENTATION_LOG.md package.json src/lib/openai-preflight.ts tests/scorecard-scale.test.mjs
```

- Result:

```text
fatal: Unable to create 'C:/Users/zuyua/OneDrive/Desktop/digital-app/preflight/.git/index.lock': Permission denied
```

- No commit or push was created. The latest useful state is present in the working tree on `main`.
