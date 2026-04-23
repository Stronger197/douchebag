# Douchebag Hooks

These hooks are **bundled with the douchebag plugin** and activate automatically when the plugin is installed. No manual setup required.

If you installed douchebag standalone (without the plugin), use `bash hooks/install.sh` to wire them into your `settings.json` manually.

## What's included

### `douchebag-activate.js` — SessionStart hook

- Runs once when Claude Code starts.
- Writes the active level (default `normal`) to `~/.claude/.douchebag-active` (flag file).
- Emits the douchebag ruleset as hidden SessionStart context — Claude sees it, users don't.
- Detects missing statusline config and emits a setup nudge. Claude will offer to wire it up on first interaction.

### `douchebag-mode-tracker.js` — UserPromptSubmit hook

- Fires on every user prompt, checks for `/douchebag` commands and natural-language triggers.
- Writes the active level to the flag file when a douchebag command is detected.
- Removes the flag when the user says "stop douchebag", "normal mode", "be professional", or `/douchebag off`.
- Re-injects a short level-specific reminder on every turn so the persona — and its scope rules — survive competing instructions from other plugins.

Supported levels: `normal`, `full`, `ultra`, `commit`, `review`.

### `douchebag-statusline.sh` / `douchebag-statusline.ps1` — Statusline badge

- Reads `~/.claude/.douchebag-active` and outputs a colored badge.
- Shows `[DOUCHEBAG]`, `[DOUCHEBAG:FULL]`, `[DOUCHEBAG:ULTRA]`, `[DOUCHEBAG:COMMIT]`, `[DOUCHEBAG:REVIEW]`.
- Symlink-refusing, whitelist-validated, size-capped — safe to render in the terminal.

### `douchebag-config.js` — shared module

Exports:

- `getDefaultMode()` — resolves default level from `DOUCHEBAG_DEFAULT_MODE` env var, then `$XDG_CONFIG_HOME/douchebag/config.json` / `~/.config/douchebag/config.json` / `%APPDATA%\douchebag\config.json`, then `'normal'`.
- `safeWriteFlag(flagPath, content)` — symlink-safe, atomic, `0600`-permission flag write.
- `readFlag(flagPath)` — symlink-safe, whitelist-validated, size-capped flag read.

## Statusline badge setup

**Plugin install:** if you do not already have a `statusLine` configured, Claude will detect that on your first session and offer to set it up. Accept and you're done. If you already have a custom statusline, douchebag does not overwrite it.

**Standalone install:** `install.sh` / `install.ps1` wires the statusline automatically when no custom one exists.

**Manual setup:** add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash /path/to/douchebag-statusline.sh"
  }
}
```

or on Windows:

```json
{
  "statusLine": {
    "type": "command",
    "command": "powershell -ExecutionPolicy Bypass -File C:\\path\\to\\douchebag-statusline.ps1"
  }
}
```

**Custom statusline:** append to your existing statusline script:

```bash
douchebag_text=""
douchebag_flag="$HOME/.claude/.douchebag-active"
if [ -f "$douchebag_flag" ]; then
  douchebag_mode=$(cat "$douchebag_flag" 2>/dev/null)
  if [ "$douchebag_mode" = "normal" ] || [ -z "$douchebag_mode" ]; then
    douchebag_text=$'\033[38;5;165m[DOUCHEBAG]\033[0m'
  else
    douchebag_suffix=$(echo "$douchebag_mode" | tr '[:lower:]' '[:upper:]')
    douchebag_text=$'\033[38;5;165m[DOUCHEBAG:'"${douchebag_suffix}"$']\033[0m'
  fi
fi
```

Badge examples:
- `/douchebag` → `[DOUCHEBAG]`
- `/douchebag full` → `[DOUCHEBAG:FULL]`
- `/douchebag ultra` → `[DOUCHEBAG:ULTRA]`
- `/douchebag-commit` → `[DOUCHEBAG:COMMIT]`
- `/douchebag-review` → `[DOUCHEBAG:REVIEW]`

## How it works

```
SessionStart hook ──writes "normal"──▶ ~/.claude/.douchebag-active ◀──writes mode── UserPromptSubmit hook
                                               │
                                            reads
                                               ▼
                                      Statusline script
                                     [DOUCHEBAG:ULTRA] │ ...
```

SessionStart stdout is injected as hidden system context — Claude sees it, users don't. The statusline runs as a separate process. The flag file is the bridge.

## Uninstall

If installed via plugin: disable the plugin — hooks deactivate automatically.

If installed via `install.sh`:

```bash
bash hooks/uninstall.sh
```

Or manually:

1. Remove `~/.claude/hooks/douchebag-*.js`, `~/.claude/hooks/douchebag-statusline.*`, `~/.claude/hooks/douchebag-config.js`, and `~/.claude/hooks/package.json` (if only used for douchebag).
2. Remove the SessionStart, UserPromptSubmit, and statusLine entries referencing douchebag from `~/.claude/settings.json`.
3. Delete `~/.claude/.douchebag-active`.
