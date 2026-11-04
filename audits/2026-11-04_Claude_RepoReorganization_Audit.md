# Repo Reorganization Audit

**Date:** 2026-11-04
**Agent:** Claude Code (Opus 5.5)
**Scope:** Move the ~40 loose root documents into a structured `docs/` tree so the stalled project can be picked up, and write a current-state entry point. No code changes. Done at Shayan's request; layout, Netlify archiving, ACC-handoff archiving and the "get web live" focus were each confirmed by Shayan in-session.

## Before

The repo root held 39 tracked markdown/status files (phase summaries, proposals, sprint plans, checklists, "implementation complete" reports) next to config files, plus a separate `audit/` folder alongside `audits/`. `docs/` held 25 more files in one flat list. Several docs contradicted each other, and the self-declared "single source of truth" (`GROUNDTRUTH.md`) was last verified 2026-06-22. `AGENTS.md` told agents to read `AGENT_HANDOFF.md`, an unfilled template for an integration that is no longer planned.

## What changed

- **63 files moved with `git mv`** (history preserved; all show as renames). Full map: root keeps `README.md`, `AGENTS.md`, `CLAUDE.md`, `REPO_RULES.md`, `REPO_DIRECTIVE.md` (CI `directive-lint` reads it at the root) and tool config files.
  - `docs/guides/`: API, developer, deployment, mobile build, user guides.
  - `docs/operations/`: launch and production checklists, security ops/documentation, payout status. The two different `PRODUCTION_CHECKLIST.md` files are kept: the root one (infra tasks) keeps its name, the 448-line `docs/` one became `PRODUCTION_READINESS_CHECKLIST.md`.
  - `docs/status/`: June 2026 snapshots (GROUNDTRUTH, TODO, TAPCASH_STATUS.json, handoff, test coverage, security status).
  - `docs/governance/`: adds BRANCH_STRATEGY next to BRANCH_POLICY and DEFERRED_WORK.
  - `docs/plans/`: web, mobile, launch and UI/UX plans and proposals.
  - `docs/archive/`: June sprint material, completion reports, the old ACC/Antigravity `AGENT_HANDOFF.md`, and the unused Netlify files (`netlify.toml`, `netlify-env.txt`, `set-netlify-env.sh`).
  - `audit/` merged into `audits/`: `REPO_AUDIT_2026-06-13.md` → `audits/2026-06-13_Legacy_Repo_Audit.md`, the strategic-audit PDF → `audits/legacy/`.
  - `docs/superpowers/plans/` left in place: agent planning tools write there by default.
- **Links:** a script resolved every relative markdown link against each file's old location and rewrote it for the new one (18 links in 5 files). Links that were already broken before the move were left unchanged: about 40 `path:line` style references in the archived `PROJECT_SUMMARY_90_100.md`, which CI's link check doesn't evaluate (it only checks `./` and `../` links).
- **New:** `docs/START_HERE.md` (current state verified today, ordered "get web live" blockers, how to run, where things are). `docs/README.md` rewritten as a full index.
- **Updated:** `README.md` (structure section, docs pointer), `AGENTS.md` (reading list now points to START_HERE and DEFERRED_WORK instead of the archived handoff and phase summaries; new docs go in `docs/` subfolders), `GROUNDTRUTH.md` (snapshot notice at the top).
- **Not moved:** non-markdown references to moved files were searched for. The only one is a `netlify.toml` existence check in `scripts/verify.sh`/`verify.ps1`, a generic deploy-target fallback that only prints a notice and sits after the `vercel.json` check, so archiving the file has no effect.
- Nothing deleted. `docs/` markdown count goes up (doc-freshness baseline is recursive).

## Facts verified for START_HERE (2026-11-04)

- `tapcash.online`: NXDOMAIN on 8.8.8.8 and 1.1.1.1.
- Vercel: three projects (`tapcash`, `tapcash-8z9f`, `tapcash-zyd5`) each have a production deploy of `1544e01` today, all responding `HTTP 302`. Vercel's Git integration deploys every `main` push even though the GitHub Actions `Deploy to Production` job is skipped. Logged in DEFERRED_WORK.
- `main` branch protection: GitHub returns "Branch not protected", contrary to REPO_RULES Appendix A. Logged in DEFERRED_WORK.
- No `serviceAccountKey.json` / `*service-account*.json` / `firebase-admin*.json` in git history (`git log --all`), so the LAUNCH_CHECKLIST "purge compromised key" item may already be done. Key rotation is unconfirmable from the repo.

## Verification

- `git status` shows 63 renames, no deletions.
- Ran the `doc-freshness` relative-link check from `scripts/verify.sh` against this branch (results in the PR).
- CI `gate` on the PR is authoritative.
