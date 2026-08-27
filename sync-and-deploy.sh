#!/bin/bash
# Sync vault content -> Quartz content dir, commit, push (GitHub Actions builds & deploys Pages)
set -euo pipefail
REPO="$(cd "$(dirname "$0")" && pwd)"
VAULT="$HOME/Documents/Obsidian Vault/AVL Surveillance Watch"

rsync -av --delete --exclude '.obsidian' --delete-excluded --exclude 'private' "$VAULT/" "$REPO/content/"

OPS_REPO="$(cd "$REPO/../repo" && pwd)"
python3 "$OPS_REPO/tools/name_gate.py" "$REPO/content"
python3 "$OPS_REPO/tools/tag_lint.py" "$REPO/content"

cd "$REPO"
git add -A
if git diff --cached --quiet; then
  echo "No changes to deploy."
  exit 0
fi
git commit -m "Content update $(date +%Y-%m-%d)"
git push origin main
echo "Pushed. Build: https://github.com/WNC-Watch/wncwatch.org/actions"
