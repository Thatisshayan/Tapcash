# Docs

Index of project documentation. Every important doc must have an inbound link here (Rule 1). New here? Read **[START_HERE.md](START_HERE.md)** first.

> The repo is public, so the **Operations, Status, Plans and Archive** sections below (and `audits/legacy/`) are gitignored and exist only on Shayan's machine. They are listed so agents working locally can find them.

## Governance (root)
- [../REPO_RULES.md](../REPO_RULES.md): repository rules
- [../REPO_DIRECTIVE.md](../REPO_DIRECTIVE.md): goal-layer directive (read by CI `directive-lint`)
- [../AGENTS.md](../AGENTS.md): instructions for AI agents

## Guides
- [guides/DEVELOPER_GUIDE.md](guides/DEVELOPER_GUIDE.md)
- [guides/API_DOCUMENTATION.md](guides/API_DOCUMENTATION.md)
- [guides/DEPLOYMENT_GUIDE.md](guides/DEPLOYMENT_GUIDE.md) and [guides/DEPLOYMENT.md](guides/DEPLOYMENT.md)
- [guides/MOBILE_BUILD_GUIDE.md](guides/MOBILE_BUILD_GUIDE.md)
- [guides/USER_GUIDE.md](guides/USER_GUIDE.md)

## Operations
- LAUNCH_CHECKLIST.md (internal, local only: `docs/operations/LAUNCH_CHECKLIST.md`): launch readiness (Aug 2026)
- PRODUCTION_CHECKLIST.md (internal, local only: `docs/operations/PRODUCTION_CHECKLIST.md`): infrastructure / config tasks
- PRODUCTION_READINESS_CHECKLIST.md (internal, local only: `docs/operations/PRODUCTION_READINESS_CHECKLIST.md`): full readiness checklist (June 2026)
- SECURITY_OPS.md (internal, local only: `docs/operations/SECURITY_OPS.md`): manual security operations (key rotation etc.)
- SECURITY_DOCUMENTATION.md (internal, local only: `docs/operations/SECURITY_DOCUMENTATION.md`)
- PAYOUT_STATUS.md (internal, local only: `docs/operations/PAYOUT_STATUS.md`)

## Status snapshots (June 2026, not current; see START_HERE)
- GROUNDTRUTH.md (internal, local only: `docs/status/GROUNDTRUTH.md`)
- TODO.md (internal, local only: `docs/status/TODO.md`)
- TAPCASH_STATUS.json (internal, local only: `docs/status/TAPCASH_STATUS.json`)
- TAPCASH_HANDOFF.md (internal, local only: `docs/status/TAPCASH_HANDOFF.md`)
- TEST_COVERAGE_REPORT.md (internal, local only: `docs/status/TEST_COVERAGE_REPORT.md`)
- SECURITY_STATUS.md (internal, local only: `docs/status/SECURITY_STATUS.md`)

## Governance
- [governance/BRANCH_POLICY.md](governance/BRANCH_POLICY.md): branch and CI policy
- [governance/DEFERRED_WORK.md](governance/DEFERRED_WORK.md): deferred work register
- [governance/BRANCH_STRATEGY.md](governance/BRANCH_STRATEGY.md): doc branch strategy

## Plans
- ALLINREPORT.md (internal, local only: `docs/plans/ALLINREPORT.md`): comprehensive synthesis report
- Web: WEBPROPOSEDPLAN.md (internal, local only: `docs/plans/WEBPROPOSEDPLAN.md`), WEBPROPOSEDPLAN2.md (internal, local only: `docs/plans/WEBPROPOSEDPLAN2.md`)
- Mobile: MOBILEPROPOSEPLAN.md (internal, local only: `docs/plans/MOBILEPROPOSEPLAN.md`), MOBILEPROPOSEPLAN2.md (internal, local only: `docs/plans/MOBILEPROPOSEPLAN2.md`), PROPOSALALLINREPORTMOBILE.md (internal, local only: `docs/plans/PROPOSALALLINREPORTMOBILE.md`), PROPOSALALLINREPORTMOBILEANDROIDE.md (internal, local only: `docs/plans/PROPOSALALLINREPORTMOBILEANDROIDE.md`), PROPOSALALLINREPORTMOBILEIOS.md (internal, local only: `docs/plans/PROPOSALALLINREPORTMOBILEIOS.md`)
- Launch: PROPOSALFORALLINREPORT.md (internal, local only: `docs/plans/PROPOSALFORALLINREPORT.md`), PROPOSALFORALLINREPORTACTION.md (internal, local only: `docs/plans/PROPOSALFORALLINREPORTACTION.md`)
- UI/UX: UIUX_PROPOSAL.md (internal, local only: `docs/plans/UIUX_PROPOSAL.md`), UIUX_GENERATION_PREP.md (internal, local only: `docs/plans/UIUX_GENERATION_PREP.md`)
- Implementation plans (Aug 2026): [superpowers/plans/2026-08-06-track2-uiux-redesign.md](superpowers/plans/2026-08-06-track2-uiux-redesign.md), [superpowers/plans/2026-08-06-track3-mobile-rebuild.md](superpowers/plans/2026-08-06-track3-mobile-rebuild.md)

## Archive (history only)
- `archive/2026-06_june-sprint/`: phase 1-5 summaries, builder message, June audit and sprint plan
- `archive/reports/`: completion reports (implementation, backend, payments, performance, UI)
- `archive/AGENT_HANDOFF.md`: old ACC v2 / Antigravity coordination template (integration no longer planned)
- `archive/netlify/`: unused Netlify config (CI deploys to Vercel)

## Audits
- [../audits/](../audits/): dated audits. `audits/legacy/` holds older non-markdown audits.

When you add a new doc, link it from this index. Do not leave important docs orphaned.
