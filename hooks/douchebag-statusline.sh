#!/bin/bash
# douchebag — statusline badge script for Claude Code
# Reads the douchebag mode flag file and outputs a colored badge.
#
# Usage in ~/.claude/settings.json:
#   "statusLine": { "type": "command", "command": "bash /path/to/douchebag-statusline.sh" }

FLAG="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.douchebag-active"

# Refuse symlinks — prevents a local attacker from redirecting the flag at
# ~/.ssh/id_rsa and having the statusline render its bytes (including ANSI
# escape sequences) to the terminal every keystroke.
[ -L "$FLAG" ] && exit 0
[ ! -f "$FLAG" ] && exit 0

# Hard-cap the read at 64 bytes and strip anything outside [a-z0-9-] — blocks
# terminal-escape injection and OSC hyperlink spoofing via the flag contents.
MODE=$(head -c 64 "$FLAG" 2>/dev/null | tr -d '\n\r' | tr '[:upper:]' '[:lower:]')
MODE=$(printf '%s' "$MODE" | tr -cd 'a-z0-9-')

case "$MODE" in
  off|normal|full|ultra|commit|review) ;;
  *) exit 0 ;;
esac

if [ -z "$MODE" ] || [ "$MODE" = "normal" ]; then
  printf '\033[38;5;165m[DOUCHEBAG]\033[0m'
else
  SUFFIX=$(printf '%s' "$MODE" | tr '[:lower:]' '[:upper:]')
  printf '\033[38;5;165m[DOUCHEBAG:%s]\033[0m' "$SUFFIX"
fi
