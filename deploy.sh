#!/usr/bin/env bash
# deploy.sh — regenerate index, commit all, push, open live site
set -e
cd "$(dirname "$0")"

echo "→ regenerating blog index …"
python3 gen_index.py

echo "→ staging …"
git add -A

if git diff --cached --quiet; then
  echo "→ nothing to commit"
else
  MSG="${1:-deploy: $(date '+%Y-%m-%d %H:%M')}"
  git commit -m "$MSG

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  echo "→ pushing …"
  git push
fi

echo "→ opening site (wait ~30s for GH Pages to build) …"
sleep 30 && open "https://eisenjiang37-gif.github.io" &
echo "Done."
