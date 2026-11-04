# AGENTS.md

This repository is governed by `REPO_RULES.md`. Read it before any work.

Non-negotiable gates:
- Branch-only workflow. No direct pushes or commits to `main`.
- CI gate must be green (secret-scan, build, test, doc-freshness, deploy-dry) to merge.
- Update docs in the same pass as code (Rule 2).
- Save audits under `audits/` using `YYYY-MM-DD_<Agent>_<Scope>_Audit.md` (Rule 6).
- Record deferred work in `docs/governance/DEFERRED_WORK.md` (Rule 12).
- No file deletion without Shayan's approval (Rule 14).
- No paid API / infra spend without Shayan's approval (Rule 24).

Before planning, editing, or reporting completion, every agent must read:

1. **[Baseline Rules](#baseline)** — Foundational agent rules (adapted from RemoteCliControl)
2. [README.md](./README.md)
3. [docs/START_HERE.md](./docs/START_HERE.md): current state, launch blockers, and where everything lives
4. [docs/governance/DEFERRED_WORK.md](./docs/governance/DEFERRED_WORK.md): open and deferred items (newest first)
5. [Next.js-specific rules](#nextjs-specific-rules) below

Docs live under `docs/` (index: [docs/README.md](./docs/README.md)). The repo root keeps only README, AGENTS/CLAUDE, REPO_RULES, REPO_DIRECTIVE and tool config files. Put new docs in the matching `docs/` subfolder, not at the root.

## Baseline

All repositories follow the foundational agent rules established in the RemoteCliControl project:

- Keep docs findable and current while work is in progress
- Do not claim completion without verification
- Do not silently skip requested steps
- Record deferred work in appropriate documentation
- Keep the repo stable, review existing failures, and report what was pre-existing
- Code changes must be actually applied and tested
- Documentation must be updated in the same pass as code changes
- Verification must be run (or concrete blockers reported)

For full details, see RemoteCliControl/AGENTS.md (sibling repo, not included in this clone).

## TapCash-Specific Context

**Project**: Payment/e-commerce platform with Next.js 14, Firebase, and mobile support

**Key Traits**:
- Massive feature set with complex workflows
- Multiple deployment phases completed
- Mobile app (Expo) alongside web
- Financial/payment operations (high-stakes correctness requirement)

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This repository is governed by `REPO_RULES.md`. Read it before any work.

Non-negotiable gates:
- Branch-only workflow. No direct pushes or commits to `main`.
- CI gate must be green (secret-scan, build, test, doc-freshness, deploy-dry, directive-lint) to merge.
- Update docs in the same pass as code (Rule 2).
- Save audits under `audits/` using `YYYY-MM-DD_<Agent>_<Scope>_Audit.md` (Rule 6).
- Record deferred work in `docs/governance/DEFERRED_WORK.md` (Rule 12).
- No file deletion without Shayan's approval (Rule 14).
- No paid API / infra spend without Shayan's approval (Rule 24).

Run verification with `bash scripts/verify.sh` (or `pwsh scripts/verify.ps1`).
