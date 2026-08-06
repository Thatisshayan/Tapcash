#!/usr/bin/env bash
# Repo-adaptive governance verification.
# Implements REPO_RULES.md checks: secret-scan, doc-freshness, build, test, deploy-dry.
# Emits GitHub Actions annotations (::error / ::notice) when run in CI.
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0
notice() { echo "::notice title=$1::$2"; }
error()  { echo "::error title=$1::$2"; FAIL=1; }

# ---------------------------------------------------------------- 1. secret-scan
echo "== secret-scan =="
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks detect --no-banner --redact || error "secret-scan" "gitleaks found secrets"
else
  # (a) filename-based: private key / credential files must not be committed.
  #     Exclude dependency / generated dirs (.venv, node_modules, dist, build,
  #     _repo_clone, .cache, coverage) — library files there are not first-party.
  bad_files=$(find . -type f \( -name '*.p8' -o -name '*.p12' -o -name '*credential*' \
    -o -name '*.pem' -o -name '*.key' \) \
    -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/audits/private/*' \
    -not -path '*/.venv/*' -not -path '*/_repo_clone/*' -not -path '*/dist/*' \
    -not -path '*/build/*' -not -path '*/.cache/*' -not -path '*/coverage/*' 2>/dev/null || true)
  if [ -n "$bad_files" ]; then error "secret-scan" "secret files present: $bad_files"; fi
  # (b) content-based: only scan first-party code/config, require an ASSIGNED VALUE.
  #     Exclude dependency / generated dirs so library files don't false-positive.
  #     Test/spec files intentionally contain mock credentials (e.g.
  #     PAYPAL_CLIENT_SECRET='test_client_secret') — never real secrets — so they
  #     are excluded from the content scan to avoid false positives.
  # Multiple repeated --exclude=<glob> flags are unreliable across grep
  # implementations (only the last one may be honored) — exclude the whole
  # __tests__/__mocks__ directories instead, since that's robust everywhere
  # these mock-credential test files actually live.
  hits=$(grep -rIlE "(API_KEY|SECRET|PRIVATE_KEY|TOKEN|PASSWORD)[[:space:]]*[=:][[:space:]]*[\"']?[A-Za-z0-9/+_-]{8,}" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=audits/private \
    --exclude-dir=.venv --exclude-dir=_repo_clone --exclude-dir=dist --exclude-dir=build \
    --exclude-dir=.cache --exclude-dir=coverage --exclude-dir=__tests__ --exclude-dir=__mocks__ \
    --exclude-dir=docs --exclude-dir=.superpowers \
    --include='*.json' --include='*.env' --include='*.ts' --include='*.js' --include='*.py' \
    --include='*.yml' --include='*.yaml' --include='*.toml' --include='*.sh' . 2>/dev/null || true)
  if [ -n "$hits" ]; then error "secret-scan" "possible hardcoded secrets in: $hits"; fi
fi

# ---------------------------------------------------------------- 2. doc-freshness
echo "== doc-freshness =="
[ -f README.md ] || error "doc-freshness" "README.md missing"
# link integrity
# Skip dependency/generated dirs with -prune so we never walk node_modules.
# (a) best-effort external tool if present
if command -v markdown-link-check >/dev/null 2>&1; then
  find . \( -name node_modules -o -name .git -o -path './docs/superpowers' \) -prune -o \
    -name '*.md' -print0 2>/dev/null \
    | xargs -0 -r -n1 markdown-link-check || error "doc-freshness" "broken doc links"
fi
# (b) built-in relative-link check (no external dep): every relative link
#     to a .md/.md#frag must resolve to an existing file. Catches broken
#     repo-relative paths like ../../audits/ from a subdir doc.
link_broken=0
while IFS= read -r md; do
  dir=$(dirname "$md")
  for target in $(grep -oE '\]\([^)]+\)' "$md" | sed -E 's/^\]\(//; s/\)$//' \
                 | grep -E '^\.{1,2}/' | sed 's/#.*$//'); do
    resolved=$(cd "$dir" && readlink -f "$target" 2>/dev/null || true)
    if [ -z "$resolved" ] || [ ! -e "$resolved" ]; then
      error "doc-freshness" "broken relative link in $md -> $target"
      link_broken=1
    fi
  done
done < <(find . \( -name node_modules -o -name .git -o -path './docs/superpowers' \) -prune -o \
           -name '*.md' -print 2>/dev/null || true)
if [ "$link_broken" -eq 0 ]; then notice "doc-freshness" "relative links ok"; fi
# audit age (≤ 30 days) — use the newest valid ISO date parsed from an
# audits/*.md FILENAME (not mtime) so the check is deterministic across clones.
newest_ts=0
while IFS= read -r f; do
  bn=$(basename "$f")
  d=$(echo "$bn" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | head -1)
  [ -z "$d" ] && continue
  t=$(date -d "$d" +%s 2>/dev/null || true)
  [ -z "$t" ] && continue
  if [ "$t" -gt "$newest_ts" ]; then newest_ts=$t; fi
done < <(find audits -name '*.md' -not -path '*/private/*' 2>/dev/null || true)
if [ "$newest_ts" -eq 0 ]; then
  error "doc-freshness" "no dated audit found under audits/ (expected YYYY-MM-DD in filename)"
else
  now=$(date +%s)
  age=$(( (now - newest_ts) / 86400 ))
  if [ "$age" -gt 30 ]; then error "doc-freshness" "newest audit is $age days old (>30)"; fi
fi
# doc baseline — must exist (committed). Missing baseline fails CI so docs
# deletions can't silently pass; regenerate only via a reviewed bootstrap step.
base_path="docs/_baseline.json"
if [ ! -f "$base_path" ]; then
  error "doc-freshness" "docs/_baseline.json missing — commit it (or run a reviewed bootstrap) so deletions are detectable"
else
  base=$(grep -o '"md_count": *[0-9]*' "$base_path" | grep -o '[0-9]*$')
  cur=$(find docs -name '*.md' 2>/dev/null | wc -l)
  if [ "${cur:-0}" -lt "${base:-0}" ]; then
    error "doc-freshness" "docs md count $cur < baseline $base (deletion without approval)"
  fi
fi

# ---------------------------------------------------------------- 3. build / test
echo "== build / test =="
# pick the package manager from lockfiles (respect pnpm/yarn, don't assume npm)
PM=""
if [ -f pnpm-lock.yaml ]; then PM=pnpm
elif [ -f yarn.lock ]; then PM=yarn
elif [ -f package-lock.json ]; then PM=npm
fi
run_with_timeout() { # $1=seconds $2=label $3..=cmd
  local t="$1"; shift; local label="$1"; shift
  local out; out=$(timeout "$t" "$@" 2>&1); local rc=$?
  if [ $rc -eq 124 ]; then error "$label" "timed out after ${t}s (likely network/install hang)"; return; fi
  if [ $rc -ne 0 ]; then error "$label" "failed (rc=$rc): $(printf '%s' "$out" | tail -3)"; return; fi
  notice "$label" "ok"
}
if [ -n "$PM" ]; then
  case "$PM" in
    pnpm) run_with_timeout 300 build pnpm install --frozen-lockfile
          pnpm run build --if-present 2>&1 | tail -3 ;;
    yarn) run_with_timeout 300 build yarn install --frozen-lockfile ;;
    npm)  run_with_timeout 300 build npm ci ;;
  esac
  if [ $FAIL -eq 0 ]; then
    (npm run build --if-present || pnpm run build --if-present || yarn build) >/dev/null 2>&1 && notice build "build ok" || error build "build failed"
    (npm test --if-present || pnpm test --if-present || yarn test) >/dev/null 2>&1 && notice test "test ok" || error test "test failed"
  fi
elif [ -f pyproject.toml ] || [ -f requirements.txt ]; then
  pip install -q -r requirements.txt 2>/dev/null || true
  pytest -q || error "test" "pytest failed"
elif [ -f Cargo.toml ]; then
  cargo build --release || error "build" "cargo build failed"
  cargo test --release || error "test" "cargo test failed"
else
  notice "build" "no build system detected; docs/static repo — skipping build/test"
fi

# ---------------------------------------------------------------- 4. deploy-dry
echo "== deploy-dry =="
if [ -f vercel.json ]; then
  # A vercel dry-run needs auth; without VERCEL_TOKEN in CI it cannot succeed.
  # Skip (notice, not error) so the gate doesn't red-break on missing creds —
  # the real deploy is gated separately by the production workflow.
  if [ -z "${VERCEL_TOKEN:-}" ]; then
    notice "deploy" "vercel dry-run skipped (no VERCEL_TOKEN in environment)"
  else
    vercel build --dry-run >/dev/null 2>&1 || error "deploy" "vercel dry-run failed"
  fi
elif [ -f railway.json ] || [ -f railway.toml ]; then
  notice "deploy" "railway target present; run 'railway up --detach' manually"
elif [ -f eas.json ]; then
  npx eas build --platform all --local --no-wait --non-interactive >/dev/null 2>&1 \
    || error "deploy" "eas dry build failed"
elif [ -f netlify.toml ]; then
  notice "deploy" "netlify target present; manual deploy"
else
  notice "deploy" "no deploy target; smoke build already covered"
fi

# ---------------------------------------------------------------- 5. directive-lint
# REPO_DIRECTIVE.md is the goal-layer constitution. Every task must trace to a
# Phase/Sprint/Epic id defined in the same file. Orphan tasks = divergence risk.
# ROLLOUT NOTE: missing directive is a `notice` (not `error`) during P8 rollout
# so repos without one yet don't red-break main. Flip to `error` once every
# portfolio repo has a linted REPO_DIRECTIVE.md (see project-sentinel P8).
echo "== directive-lint =="
if [ ! -f REPO_DIRECTIVE.md ]; then
  notice "directive-lint" "REPO_DIRECTIVE.md not present yet (required after P8 rollout)"
else
  # collect defined ids: P<num>, S<num>, E<num>
  defined=$(grep -oE '\b(P[0-9]+|S[0-9]+|E[0-9]+)\b' REPO_DIRECTIVE.md | sort -u)
  # find task lines: "- [ ] T..." and require a traces-to: with a defined P, S, AND E.
  orphans=0
  while IFS= read -r line; do
    if echo "$line" | grep -qE '^[[:space:]]*- \[ \] T[0-9]+'; then
      if ! echo "$line" | grep -qE 'traces-to:'; then
        error "directive-lint" "orphan task (no traces-to): ${line:0:80}"
        orphans=1
      else
        ref=$(echo "$line" | grep -oE 'traces-to:[^|]*' | sed 's/traces-to://' | tr -d ' ')
        # each referenced id must be defined in the directive
        bad=""
        for id in $(echo "$ref" | tr '/' ' '); do
          if ! echo "$defined" | grep -qx "$id"; then bad="$bad $id"; fi
        done
        if [ -n "$bad" ]; then
          error "directive-lint" "task references undefined id(s):$bad : ${line:0:80}"
          orphans=1
        else
          # require at least one P, one S, and one E among the referenced ids
          hasP=$(echo "$ref" | grep -oE '\bP[0-9]+' | head -1)
          hasS=$(echo "$ref" | grep -oE '\bS[0-9]+' | head -1)
          hasE=$(echo "$ref" | grep -oE '\bE[0-9]+' | head -1)
          if [ -z "$hasP" ] || [ -z "$hasS" ] || [ -z "$hasE" ]; then
            error "directive-lint" "task must trace to a Phase (P), Sprint (S) AND Epic (E): ${line:0:80}"
            orphans=1
          fi
        fi
      fi
    fi
  done < <(grep -E '^[[:space:]]*- \[ \] T[0-9]+' REPO_DIRECTIVE.md)
  if [ "$orphans" -eq 0 ]; then notice "directive-lint" "all tasks trace to a defined phase/sprint/epic"; fi
fi

if [ "$FAIL" -ne 0 ]; then
  echo "VERIFY FAILED"
  exit 1
fi
echo "VERIFY PASSED"
