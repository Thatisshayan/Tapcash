# Shayan — Action Items for TapCash Public Launch

**Last updated:** 2026-08-06
**Purpose:** One place for exactly what needs YOUR input/action across the whole launch push. Everything else is agent work (Claude Code / Vertex / Codex / Hermes) and doesn't need you until a PR is ready for review.

This supersedes nothing — `NEEDSHAYANINPUT.md` still has the full detail per service. This file is the prioritized, current-status version of it, plus everything new that came up during planning.

---

## Do these now (not blocked on anything)

### 1. Verify the security incident is actually closed
`NEEDSHAYANINPUT.md` §15 describes a compromised key that needed purging from git history + rotating across 8 services. You said you believe this is done — **please confirm, don't assume**:
- [ ] Check git history no longer contains the old key (`git log -p -- <the flagged file>` or ask me to check a specific file if you recall which one)
- [ ] Confirm all 8 services' keys were actually regenerated: Firebase Service Account, RapidoReach, ProxyCheck, Resend, PayPal, Tremendous, Upstash, Sentry

### 2. Verify third-party account setup
You said you believe this is done too. Go through `NEEDSHAYANINPUT.md` §1-14 and check off what's actually configured in the Vercel dashboard right now — Firebase, Vercel env vars, DNS, RapidoReach, ProxyCheck, Resend, PayPal, Tremendous, Upstash, Sentry, Better Uptime. File: `D:\AgentDevWork\repos\tapcash\NEEDSHAYANINPUT.md`

### 3. Legal review of Privacy Policy / ToS
Still open, unscheduled. Pages exist (`src/app/privacy`, `src/app/terms`) but haven't been reviewed by counsel. Not agent work — needs an actual lawyer.

### 3a. Confirm Firebase project is upgraded to Identity Platform (blocking for TASK-037's Functions deploy)
TASK-037 migrates `functions/src/index.ts`'s `onUserCreated` to `beforeUserCreated` (Firebase Functions v2's blocking-function API). Per Firebase's own docs, v2 blocking functions require the project to be upgraded to Firebase Authentication with Identity Platform in the Firebase console — this is a project-level setting I can't verify or change from the repo. If it's not already upgraded, `onUserCreated` will fail to deploy. Please confirm (or perform the upgrade) before this PR's Functions changes are deployed.

---

## Do these when I tell you a specific PR/task is ready (not yet — nothing's ready right now)

### 4. Review and merge PRs as they land
Per boardroom rules, you're the only one who merges to `main`. I'll tell you exactly when each of these is ready:
- **PR #56** (Hermes's token checkpoint) — currently blocked by a repo-wide CI issue I'm fixing right now as part of TASK-036. I'll ping you when it's green.
- **TASK-036** (build fix, running now) — will open its own PR when done.
- **TASK-037/038/039** — same pattern, each opens a PR when its work is verified.

### 5. Decide when to hand off asset generation
TASK-038 (UI/UX) and TASK-039 (mobile) both have an asset-generation step you said should go to your content-creator agent or Hermes, not me. Those steps are written and ready — you just need to say "go" on them whenever you want that work to start (can be now, in parallel with TASK-036, or later — your call).

### 6. Approve the new UI before mobile rebuilds against it or anything goes to app stores
Once TASK-038 (UI/UX redesign) lands, you personally review the result before: (a) Track 3 rebuilds mobile screens to match, (b) anything gets submitted to Apple/Google. This is the gate you set explicitly ("not submitting with this UI/UX").

---

## Nothing else is blocked on you right now
TASK-036 (build fix + CI gate fix) is executing now. I'll report back when it's done and tell you exactly what's next.
