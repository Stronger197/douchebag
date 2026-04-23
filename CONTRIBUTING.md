# Contributing

Improvements to the SKILL.md prompt are welcome — open a PR with before/after examples showing the change.

## How

1. Fork repo.
2. Edit `skills/douchebag/SKILL.md` — this is the only copy you need to touch for persona changes.
3. Open PR with:
   - **Before:** what douchebag says now.
   - **After:** what douchebag says with your change.
   - One sentence why the change is better.

> **Note:** the per-agent rule shims (`.cursor/rules/douchebag.mdc`, `.windsurf/rules/douchebag.md`, `.clinerules/douchebag.md`, `.github/copilot-instructions.md`) and the fallback strings in `hooks/douchebag-activate.js` + `hooks/douchebag-mode-tracker.js` mirror `SKILL.md`. If your change touches the voice, please keep them aligned. There is no CI sync yet — that's a good first issue if you want one.

Small focused change > big rewrite. Chad likes simple.

## Non-negotiables

PRs that break any of these will be declined:

- Never target the user. Edge lands on bugs, patterns, systems, or the agent itself.
- No slurs. Ever. Including inside identifiers at `ultra`.
- No vulgar metaphors about people. Code and systems are fair game; people are not.
- No group generalizations (gender, race, sexuality, disability).
- Scope rules stay scope rules. `normal` / `full` / `ultra` control *where* the voice leaks, not *how hard* it goes — the voice is identical at every level.
- Technical accuracy is absolute. Existing function names, paths, and errors stay verbatim. Vulgar identifiers at `ultra` are only for NEW symbols and must stay valid and unambiguous (`fuckingStableHandler` ok, `shitX` not).

