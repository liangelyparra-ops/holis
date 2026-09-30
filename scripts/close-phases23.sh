#!/bin/bash
set -euo pipefail

ROOT="/Users/liangely/holis"
export PATH="/Users/liangely/.local/node-v24.18.0/bin:$PATH"
cd "$ROOT"

# Only publish this task's files; never include unrelated staged work.
FILES=(
  GUIDE_MOCKUPS.md index.html package.json
  src/App.tsx src/data/useCases.ts src/data/caseStudyDemos.ts
  src/components/portfolio/CaseStudyCard.tsx
  src/components/portfolio/CaseStudyModal.tsx
  src/components/portfolio/CustomCaseBlocks.tsx
  docs/content-evidence-register.md docs/next-steps.md
  scripts/portfolio-cases.test.mjs scripts/close-phases23.sh
)

echo '=== Git safety check ==='
test "$(git branch --show-current)" = main || { echo 'STOP: expected main.'; exit 1; }
git diff --cached --quiet || { echo 'STOP: pre-existing staged changes; nothing published.'; exit 1; }
while IFS= read -r line; do
  test -z "$line" && continue
  path="${line:3}"
  allowed=false
  for expected in "${FILES[@]}"; do
    if test "$path" = "$expected"; then allowed=true; break; fi
  done
  if test "$allowed" = false; then
    echo "STOP: unexpected change: $path"
    echo 'No commit or push performed.'
    exit 1
  fi
done < <(git status --short --untracked-files=all)

echo '=== TypeScript / build / portfolio tests ==='
npm run lint
npm run build
npm run test:portfolio
git diff --check

echo '=== Commit ==='
git add -- "${FILES[@]}"
if git diff --cached --quiet; then
  echo 'No new task changes to commit.'
else
  git diff --cached --stat
  git commit -m "feat(portfolio): consolidate evidence-aware case studies and local demos"
fi

echo '=== Push (no force) ==='
GIT_TERMINAL_PROMPT=0 git push origin main
echo '=== GitHub comparison ==='
LOCAL="$(git rev-parse HEAD)"
REMOTE="$(GIT_TERMINAL_PROMPT=0 git ls-remote --exit-code origin refs/heads/main | awk '{print $1}')"
printf 'Local:  %s\nRemote: %s\n' "$LOCAL" "$REMOTE"
test "$LOCAL" = "$REMOTE" || { echo 'STOP: local and remote differ.'; exit 1; }
test -z "$(git status --porcelain)" || { echo 'STOP: worktree is not clean.'; exit 1; }
git log -1 --oneline
echo 'PHASES 2+3 CLOSE OK: validation, tests, commit and push confirmed.'
echo 'Public deployment and real-browser visual checks are separate and not confirmed here.'