# BRANCH_STRATEGY.md — TapCash Document Branch Strategy & Update Policy

**Generated:** July 6, 2026  
**Purpose:** Define branch strategy for all 10 documents and ongoing update policy  

---

## 1. BRANCH STRATEGY

### 1.1 Branch Naming Convention
```
docs/<document-slug>
```

### 1.2 Document → Branch Mapping

| # | Document | Branch Name | Source File |
|---|----------|-------------|-------------|
| 1 | ALLINREPORT.md | `docs/allinreport` | `ALLINREPORT.md` |
| 2 | PROPOSALFORALLINREPORT.md | `docs/proposal-launch-readiness` | `PROPOSALFORALLINREPORT.md` |
| 3 | PROPOSALFORALLINREPORTACTION.md | `docs/proposal-action-plan` | `PROPOSALFORALLINREPORTACTION.md` |
| 4 | UIUX_PROPOSAL.md | `docs/proposal-uiux` | `UIUX_PROPOSAL.md` |
| 5 | UIUX_GENERATION_PREP.md | `docs/proposal-uiux-prep` | `UIUX_GENERATION_PREP.md` |
| 6 | PROPOSALALLINREPORTMOBILE.md | `docs/proposal-mobile-combined` | `PROPOSALALLINREPORTMOBILE.md` |
| 7 | PROPOSALALLINREPORTMOBILEIOS.md | `docs/proposal-mobile-ios` | `PROPOSALALLINREPORTMOBILEIOS.md` |
| 8 | PROPOSALALLINREPORTMOBILEANDROIDE.md | `docs/proposal-mobile-android` | `PROPOSALALLINREPORTMOBILEANDROIDE.md` |
| 9 | BRANCH_STRATEGY.md | `docs/branch-strategy` | `BRANCH_STRATEGY.md` |
| 10 | (Future) LAUNCH_CHECKLIST.md | `docs/launch-checklist` | `LAUNCH_CHECKLIST.md` |

### 1.3 Branch Creation Order
```bash
# Create all branches from main
git checkout main
git checkout -b docs/allinreport
git add ALLINREPORT.md && git commit -m "docs: add ALLINREPORT synthesis"

git checkout main
git checkout -b docs/proposal-launch-readiness
git add PROPOSALFORALLINREPORT.md && git commit -m "docs: add launch readiness proposal"

git checkout main
git checkout -b docs/proposal-action-plan
git add PROPOSALFORALLINREPORTACTION.md && git commit -m "docs: add action plan with sprints"

git checkout main
git checkout -b docs/proposal-uiux
git add UIUX_PROPOSAL.md && git commit -m "docs: add UI/UX proposal"

git checkout main
git checkout -b docs/proposal-uiux-prep
git add UIUX_GENERATION_PREP.md && git commit -m "docs: add UI/UX generation prep"

git checkout main
git checkout -b docs/proposal-mobile-combined
git add PROPOSALALLINREPORTMOBILE.md && git commit -m "docs: add combined mobile plan"

git checkout main
git checkout -b docs/proposal-mobile-ios
git add PROPOSALALLINREPORTMOBILEIOS.md && git commit -m "docs: add iOS-specific plan"

git checkout main
git checkout -b docs/proposal-mobile-android
git add PROPOSALALLINREPORTMOBILEANDROIDE.md && git commit -m "docs: add Android-specific plan"

git checkout main
git checkout -b docs/branch-strategy
git add BRANCH_STRATEGY.md && git commit -m "docs: add branch strategy and update policy"
```

### 1.4 Merge Strategy
- Each document branch is independent
- Merge to `main` after review and approval
- Use `--no-ff` to preserve merge history
- Delete branch after merge

```bash
# Merge a document branch
git checkout main
git merge --no-ff docs/allinreport -m "Merge docs/allinreport into main"
git push origin main
git branch -d docs/allinreport
git push origin --delete docs/allinreport
```

### 1.5 Parallel Development
All document branches can be developed in parallel since they are independent files. No cross-branch dependencies.

---

## 2. DOCUMENT UPDATE POLICY

### 2.1 Update Frequency

| Document | Update Trigger | Frequency |
|----------|---------------|-----------|
| ALLINREPORT.md | New findings, competitor changes, audit updates | Monthly or on重大 discovery |
| PROPOSALFORALLINREPORT.md | Sprint completion, new gaps identified, scope changes | End of each sprint |
| PROPOSALFORALLINREPORTACTION.md | Task completion, scope changes, timeline adjustments | Weekly during active sprints |
| UIUX_PROPOSAL.md | Design changes, competitor updates, user feedback | Bi-weekly during design phase |
| UIUX_GENERATION_PREP.md | Component changes, new dependencies, build order changes | As needed during implementation |
| PROPOSALALLINREPORTMOBILE.md | Scope changes, timeline adjustments | Weekly during mobile sprints |
| PROPOSALALLINREPORTMOBILEIOS.md | iOS-specific changes, build issues, App Store updates | As needed |
| PROPOSALALLINREPORTMOBILEANDROIDE.md | Android-specific changes, build issues, Play Store updates | As needed |
| BRANCH_STRATEGY.md | New documents added, branch strategy changes | As needed |
| LAUNCH_CHECKLIST.md | Checklist items completed, new items added | Weekly during launch prep |

### 2.2 Update Process

1. **Identify change** — What needs updating and why
2. **Create branch** — `git checkout -b docs/update-<document-slug>`
3. **Make changes** — Update the document
4. **Commit** — `git commit -m "docs: update <document> — <reason>"`
5. **Push** — `git push origin docs/update-<document-slug>`
6. **Merge** — After review, merge to main
7. **Clean up** — Delete feature branch

### 2.3 Versioning

Each document has a version number in its header:

```markdown
**Version:** 1.0  
**Last Updated:** July 6, 2026  
**Change Summary:** Initial creation  
```

Version increments:
- **Major (1.0 → 2.0):** Significant restructuring, scope changes
- **Minor (1.0 → 1.1):** New sections, updates to existing content
- **Patch (1.0 → 1.0.1):** Typo fixes, formatting, small corrections

### 2.4 Changelog

Each document should maintain a changelog at the bottom:

```markdown
---

## CHANGELOG

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-06 | Agent | Initial creation |
| 1.1 | 2026-07-13 | Agent | Updated sprint 1 tasks |
| 2.0 | 2026-07-20 | Agent | Restructured proposal sections |
```

---

## 3. DOCUMENT DEPENDENCIES

### 3.1 Dependency Graph
```
ALLINREPORT.md
    ↓
PROPOSALFORALLINREPORT.md ────→ PROPOSALFORALLINREPORTACTION.md
    ↓                                    ↓
UIUX_PROPOSAL.md                       ↓
    ↓                                    ↓
UIUX_GENERATION_PREP.md                 ↓
                                        ↓
PROPOSALALLINREPORTMOBILE.md
    ↓                    ↓
    ↓                    ↓
    ↓            PROPOSALALLINREPORTMOBILEIOS.md
    ↓                    ↓
    ↓            PROPOSALALLINREPORTMOBILEANDROIDE.md
    ↓
BRANCH_STRATEGY.md
```

### 3.2 Update Cascade Rules
- If `ALLINREPORT.md` changes → review `PROPOSALFORALLINREPORT.md` for alignment
- If `PROPOSALFORALLINREPORT.md` changes → review `PROPOSALFORALLINREPORTACTION.md` for alignment
- If `UIUX_PROPOSAL.md` changes → review `UIUX_GENERATION_PREP.md` for alignment
- Mobile documents are independent from each other but depend on `PROPOSALALLINREPORTMOBILE.md`

---

## 4. REVIEW PROCESS

### 4.1 Review Checklist
| Check | Criteria |
|-------|----------|
| Accuracy | All facts verified against codebase |
| Completeness | No gaps in coverage |
| Consistency | No contradictions between documents |
| Clarity | Clear, actionable language |
| Dependencies | All cross-references valid |
| Formatting | Markdown renders correctly |
| Spelling | No typos or grammar errors |

### 4.2 Approval
- Each document needs at least one review before merge
- Reviewer signs off in PR description
- No merge conflicts (documents are independent files)

---

## 5. GITHUB ISSUES TRACKING

### 5.1 Create Issues for Each Document
```bash
# Create tracking issues
gh issue create --title "Create ALLINREPORT.md" --label "docs" --body "Branch: docs/allinreport"
gh issue create --title "Create PROPOSALFORALLINREPORT.md" --label "docs" --body "Branch: docs/proposal-launch-readiness"
gh issue create --title "Create PROPOSALFORALLINREPORTACTION.md" --label "docs" --body "Branch: docs/proposal-action-plan"
gh issue create --title "Create UIUX_PROPOSAL.md" --label "docs" --body "Branch: docs/proposal-uiux"
gh issue create --title "Create UIUX_GENERATION_PREP.md" --label "docs" --body "Branch: docs/proposal-uiux-prep"
gh issue create --title "Create PROPOSALALLINREPORTMOBILE.md" --label "docs" --body "Branch: docs/proposal-mobile-combined"
gh issue create --title "Create PROPOSALALLINREPORTMOBILEIOS.md" --label "docs" --body "Branch: docs/proposal-mobile-ios"
gh issue create --title "Create PROPOSALALLINREPORTMOBILEANDROIDE.md" --label "docs" --body "Branch: docs/proposal-mobile-android"
gh issue create --title "Create BRANCH_STRATEGY.md" --label "docs" --body "Branch: docs/branch-strategy"
```

### 5.2 Issue Labels
| Label | Color | Description |
|-------|-------|-------------|
| docs | #0075CA | Documentation tasks |
| docs-update | #C5DEF5 | Documentation updates |
| docs-review | #FBCA04 | Documentation review needed |
| docs-approved | #0E8A16 | Documentation approved |

---

*End of BRANCH_STRATEGY.md — Follow this strategy for all 10 documents. Each document gets its own branch before merging to main.*
