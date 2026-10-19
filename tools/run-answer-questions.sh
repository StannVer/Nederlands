#!/usr/bin/env bash
# Run the "answer the learner's questions" task once, headless. Meant for a daily scheduled run
# (Windows Task Scheduler → wsl.exe → this script). The Claude session may only run the questions
# script, read the course, and write lesson drafts to a temporary folder.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
for d in "$HOME"/.local/bin "$HOME"/.npm-global/bin "$HOME"/.nvm/versions/node/*/bin; do [ -d "$d" ] && PATH="$d:$PATH"; done
export PATH
LOG="$HOME/.local/share/nederlands/answer-questions.log"
mkdir -p "$(dirname "$LOG")" /tmp/nederlands-lessons
# Nothing to do: do not start a Claude session at all.
if [ "$(python3 tools/questions.py pending)" = "[]" ]; then echo "$(date -Is) no new questions" >> "$LOG"; exit 0; fi
{
  echo "=== $(date -Is)"
  claude -p "$(cat tools/answer-questions.md)

Write lesson files under /tmp/nederlands-lessons/." \
    --allowedTools "Bash(python3 tools/questions.py:*)" "Read" "Edit(//tmp/nederlands-lessons/**)" "Glob" "Grep"
} >> "$LOG" 2>&1
# A question claimed but left without a draft (an interrupted run) goes back to the queue.
python3 tools/questions.py release >> "$LOG" 2>&1
tail -5 "$LOG"
