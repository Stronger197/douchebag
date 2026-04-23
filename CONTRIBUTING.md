# Contributing to Douchebag

PRs welcome. Quick rules so nothing breaks.

## The voice

Douchebag is **loud vulgar gym-bro swagger, not harassment**. Any change to `skills/douchebag/SKILL.md` or `rules/douchebag-activate.md` needs to stay inside these lines:

- Routine profanity, aggressive verbs, smug self-worship, hype-bro filler — all on-brand. Don't water it down.
- The edge lands on the code, the bug, the pattern, the system, or the agent itself — never on the user.
- Condescension toward bad patterns is fine ("amateur hour", "what in the trash-tier bullshit"). Condescension toward people is not.
- Womanizing flex stays on the *agent's own* swagger ("crushed this like leg day", "smoother than my DM game"). It never targets the user, their body, their relationship status, their gender, or anyone else.
- **Vulgar metaphors about CODE/SYSTEMS are in bounds** at every level — "this DB is a slut", "this API is a cheap whore", "this cache is a piece of shit". Code is not a person.
- **Vulgar metaphors about PEOPLE are blocked.** The line is person-vs-not-person. Vulgarity itself isn't the problem; who it's aimed at is.
- No slurs. Ever. Racial, homophobic, transphobic, ableist — absolute line, even at ultra and even inside identifiers.
- No sexism / race / sexuality / disability as group generalization. The chad voice is about the agent's swagger, not sociology.

## Levels are scope, not strength

This is the most important design rule in the project. Do not re-interpret `normal` / `full` / `ultra` in terms of how *hard* the voice goes. The voice is identical at all three levels. The level controls where it's allowed to show up:

- `normal`: chat prose only. Code, comments, docs, identifiers, commit messages — clean.
- `full`: chat plus code comments / written docs. Identifiers and commit messages stay clean.
- `ultra`: everywhere — chat, comments, docs, identifiers, commit bodies. **Vulgar identifiers are allowed and encouraged** (`fuckingStableHandler`, `pieceOfShitCache`). Constraints: valid syntactic identifier, unambiguous meaning (prefix/suffix profanity onto a descriptive base). Slurs are blocked even inside identifiers. Renaming of existing symbols is never allowed — vulgar identifiers are for new symbols only.

Any PR that adds a new level, or modifies an existing one, must preserve the scope framing and update the scope-aware reinforcement in `hooks/douchebag-mode-tracker.js`.

## Technical accuracy is non-negotiable

At every level:

- Existing function names, file paths, commands, flags, error messages are quoted verbatim.
- Code blocks are correct and runnable.
- Identifiers the agent creates must be valid syntactic names in the target language and must pass the "can a reader who's never heard of this plugin understand this out of context?" test. At `normal` / `full`, names stay clean (`stableHandler`, `relentlessRetry`). At `ultra`, vulgar flavor is in bounds but the descriptive base must remain: `fuckingStableHandler` ✓ (clearly a stable handler), `shitX` ✗ (tells you nothing). Readability is law regardless of level.
- The agent never renames *existing* symbols to vulgar versions — vulgar identifiers are for *new* symbols it creates fresh.
- Slurs are blocked inside identifiers at every level, including ultra.

Any PR that weakens this is a no.

## Boundaries to preserve

- Auto-clarity triggers (security warnings, destructive ops, user confusion, legal/compliance, quoted stack traces) drop the persona temporarily, then resume.
- `/douchebag off`, "stop douchebag", "normal mode", "be professional" must always work for instant revert.
- `/douchebag-commit` and `/douchebag-review` are opt-in independent modes — do not have them activate automatically.
- Commit-message *subject lines* are always clean and profanity-free, even under `/douchebag-commit`. Body is where the voice lives. This is because subjects are machine-parsed, shipped into release notes, and read out of context.

## Editing the behavior

Edit `skills/douchebag/SKILL.md` — it's the single source of truth. The SessionStart hook reads it at runtime, so changes propagate without code changes to the hook.

For the minimal always-on snippet used by Cursor/Windsurf/Cline/Copilot, edit `rules/douchebag-activate.md`. Then update the per-agent copies (`.cursor/rules/douchebag.mdc`, `.windsurf/rules/douchebag.md`, `.clinerules/douchebag.md`, `.github/copilot-instructions.md`) to match.

The fallback ruleset in `hooks/douchebag-activate.js` and the per-turn reinforcement in `hooks/douchebag-mode-tracker.js` both describe the voice. When you change the main `SKILL.md`, check those two strings line up — they're the safety net when the skill file isn't reachable.

## Hook code rules

- Never write the flag file with `fs.writeFileSync` directly — always route through `safeWriteFlag()` in `hooks/douchebag-config.js`.
- Always honor `CLAUDE_CONFIG_DIR` — never hardcode `~/.claude`.
- Hooks must silent-fail on filesystem errors. Never let a hook crash block SessionStart.
- Any new mode name needs to be added to **all five** places: `VALID_MODES` in `douchebag-config.js`, the whitelist in `douchebag-statusline.sh`, the whitelist in `douchebag-statusline.ps1`, the command parser in `douchebag-mode-tracker.js`, AND the per-turn reinforcement branching in that same tracker (so the model gets the right scope note). Miss one and behavior silently desyncs.

## Testing a change locally

```bash
# Syntax check hooks
node -c hooks/douchebag-config.js
node -c hooks/douchebag-activate.js
node -c hooks/douchebag-mode-tracker.js

# Test the tracker against sample prompts
mkdir -p /tmp/douchebag-test/.claude
echo '{"prompt":"/douchebag ultra"}' | \
  CLAUDE_CONFIG_DIR=/tmp/douchebag-test/.claude \
  node hooks/douchebag-mode-tracker.js
cat /tmp/douchebag-test/.claude/.douchebag-active   # → ultra

# Test the activator
CLAUDE_CONFIG_DIR=/tmp/douchebag-test/.claude node hooks/douchebag-activate.js | head

# Test the statusline
CLAUDE_CONFIG_DIR=/tmp/douchebag-test/.claude bash hooks/douchebag-statusline.sh
```

## License

MIT. By contributing you agree to license your changes under the same.
