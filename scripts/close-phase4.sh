#!/bin/bash
set -euo pipefail

ROOT="/Users/liangely/holis"
export PATH="/Users/liangely/.local/node-v24.18.0/bin:$PATH"
cd "$ROOT"

FILES=(
  src/App.tsx
  src/index.css
  src/components/portfolio/CaseStudyModal.tsx
  src/components/portfolio/HeaderNav.tsx
  scripts/close-phase4.sh
  docs/next-steps.md
)

echo '=== Git safety check ==='
test "$(git branch --show-current)" = main || { echo 'STOP: expected main.'; exit 1; }
git diff --cached --quiet || { echo 'STOP: pre-existing staged changes.'; exit 1; }

echo '=== TypeScript check ==='
npm run lint

echo '=== Build ==='
npm run build

echo '=== Stage fase 4 files ==='
for f in "${FILES[@]}"; do
  [ -f "$f" ] && git add "$f" && echo "  staged: $f"
done

echo '=== Commit ==='
git diff --cached --quiet && { echo 'Nothing to commit.'; exit 0; }
git commit -m "feat(a11y+ux): larger case study modals, skip-nav, aria-current, reduced-motion

- CaseStudyModal: max-w-6xl (was 4xl), max-h-95dvh, larger type, more padding
- HeaderNav: brand logo converted to button for keyboard access
- HeaderNav: aria-label on nav, aria-current on active tab
- HeaderNav: skip-to-content link (visible on focus)
- index.css: prefers-reduced-motion rule pauses all CSS transitions
- index.css: style-scrollbar utility for modal scroll track
- App.tsx: id=main-content on main for skip-nav anchor

Fase 4 - visual and accessibility review complete."

echo '=== Push ==='
LOCAL=$(git rev-parse HEAD)
git push origin main
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" = "$REMOTE" ]; then
  echo "hash match: $LOCAL"
else
  echo "WARN: hashes differ"
fi
echo '=== Done ==='
