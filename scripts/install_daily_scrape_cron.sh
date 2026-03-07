#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN="${NODE_BIN:-$(command -v node || true)}"

if [ -z "${NODE_BIN}" ]; then
  echo "[ERROR] node not found in PATH."
  exit 1
fi

CRON_EXPR="${CRON_EXPR:-15 8 * * *}"
LOG_FILE="$PROJECT_ROOT/scraper/scraper.log"
MARKER="# canada-immigration-history-scraper"
CMD="cd \"$PROJECT_ROOT\" && \"$NODE_BIN\" \"$PROJECT_ROOT/scraper/scraper.js\" >> \"$LOG_FILE\" 2>&1"
NEW_LINE="$CRON_EXPR $CMD $MARKER"

EXISTING="$(crontab -l 2>/dev/null || true)"
FILTERED="$(printf '%s\n' "$EXISTING" | grep -v "$MARKER" || true)"

if [ -n "$FILTERED" ]; then
  printf '%s\n%s\n' "$FILTERED" "$NEW_LINE" | crontab -
else
  printf '%s\n' "$NEW_LINE" | crontab -
fi

echo "Installed cron job:"
echo "$NEW_LINE"
echo "Use 'crontab -l' to verify."
