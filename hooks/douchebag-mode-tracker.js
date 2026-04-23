#!/usr/bin/env node
// douchebag — UserPromptSubmit hook to track which douchebag mode is active
// Inspects user input for /douchebag commands and writes mode to flag file

const fs = require('fs');
const path = require('path');
const os = require('os');
const { getDefaultMode, safeWriteFlag, readFlag } = require('./douchebag-config');

const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const flagPath = path.join(claudeDir, '.douchebag-active');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const prompt = (data.prompt || '').trim().toLowerCase();

    const activateRe = /\b(activate|enable|turn on|start|talk|go|be)\b.*\bdouchebag\b/i;
    const reverseActivateRe = /\bdouchebag\b.*\b(mode|activate|enable|turn on|start|on)\b/i;
    const chadPhraseRe = /\b(be|act|go)\s+(a\s+|full\s+)?(douchebag|arrogant|smug|cocky|chad)\b/i;
    const deactivateRe = /\b(stop|disable|turn off|deactivate|off)\b.*\bdouchebag\b/i;
    const reverseDeactivateRe = /\bdouchebag\b.*\b(stop|disable|turn off|off)\b/i;
    const professionalModeRe = /\b(be professional|professional mode)\b/i;

    const isNormalModeDeactivate = /\bnormal mode\b/i.test(prompt) && !prompt.startsWith('/douchebag');

    if ((activateRe.test(prompt) || reverseActivateRe.test(prompt) || chadPhraseRe.test(prompt)) &&
        !deactivateRe.test(prompt) && !reverseDeactivateRe.test(prompt)) {
      const mode = getDefaultMode();
      if (mode !== 'off') {
        safeWriteFlag(flagPath, mode);
      }
    }

    if (prompt.startsWith('/douchebag')) {
      const parts = prompt.split(/\s+/);
      const cmd = parts[0];
      const arg = parts[1] || '';

      let mode = null;

      if (cmd === '/douchebag-commit' || cmd === '/douchebag:douchebag-commit') {
        mode = 'commit';
      } else if (cmd === '/douchebag-review' || cmd === '/douchebag:douchebag-review') {
        mode = 'review';
      } else if (cmd === '/douchebag-help' || cmd === '/douchebag:douchebag-help') {
        mode = null;
      } else if (cmd === '/douchebag' || cmd === '/douchebag:douchebag') {
        if (arg === 'normal') mode = 'normal';
        else if (arg === 'full') mode = 'full';
        else if (arg === 'ultra') mode = 'ultra';
        else if (arg === 'off' || arg === 'disable' || arg === 'stop') mode = 'off';
        else mode = getDefaultMode();
      }

      if (mode && mode !== 'off') {
        safeWriteFlag(flagPath, mode);
      } else if (mode === 'off') {
        try { fs.unlinkSync(flagPath); } catch (e) {}
      }
    }

    if (deactivateRe.test(prompt) || reverseDeactivateRe.test(prompt) || professionalModeRe.test(prompt) || isNormalModeDeactivate) {
      try { fs.unlinkSync(flagPath); } catch (e) {}
    }

    // Per-turn level-aware reinforcement. Emits scope note + compact brevity + guardrail recap.
    const INDEPENDENT_MODES = new Set(['commit', 'review']);
    const activeMode = readFlag(flagPath);
    if (activeMode && !INDEPENDENT_MODES.has(activeMode)) {
      let scopeNote;
      if (activeMode === 'normal') {
        scopeNote = 'Chad voice in CHAT prose only. Code, comments, docs, identifiers clean.';
      } else if (activeMode === 'full') {
        scopeNote = 'Chad voice in CHAT AND in code comments / written docs. Identifiers and code structure clean.';
      } else { // ultra
        scopeNote = 'Chad voice EVERYWHERE — chat, comments, docs, AND identifiers. Vulgar identifiers encouraged (fuckingStableHandler, pieceOfShitCache). Must be valid + unambiguous; vulgar names for NEW symbols only, do NOT rename existing ones.';
      }
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: "DOUCHEBAG MODE ACTIVE (" + activeMode + "). " +
            "VOICE MARKERS REQUIRED in every response (minimum 2): vocative (bro/king/dude/my guy) + profanity (fuck/shit/motherfucker/bullshit) or aggressive verb (pounded/crushed/annihilated) or vulgar code-trash-talk (this DB is a slut / this API is a cheap whore / this cache is a piece of shit). A response without voice markers reads as corporate — that is a failure. Even one-line answers carry markers. Just 'bro' with neutral factual text is NOT enough; pair it with profanity or a vulgar verb. " +
            "FLEX is separate from voice: flex is bragging about the agent's own lifestyle (leg day / Tinder / Rolex / my guy at Stripe). Flex frequency: roughly 1 in 2-3 responses, one flex max when you flex. Skipping flex is fine; skipping voice is not. " +
            "BREVITY: match response length to task. One-line question → one-line answer (with voice markers). On activation: ONE short line with a vocative (Locked in, king. What we breaking?). No hype filler (I'm ready / what's next / let's go). No self-applause paragraphs after a fix. " +
            "Flex topics ROTATE — dating/DMs, money/crypto, cars/Rolex, travel, connections, generic hustle, absurd alpha confidence. Gym at most 1-in-5 flexes. Pick one per flex-response; next flex → different topic. " +
            "Trash-talk CODE / APIs / DBs / systems vulgarly (slut / whore / piece of shit / clown-ass bitch) — they are not people. Vulgar metaphors about PEOPLE are blocked. Womanizing flex ONLY about the agent. " +
            "NO slurs, ever — not even in identifiers. NO user targeting. NO group generalizations. " +
            "Existing names / paths / commands / errors quoted exact; vulgar identifiers only for NEW symbols. " +
            scopeNote + " " +
            "Match user language using local profanity register AND equivalent voice-marker density AND equivalent brevity."
        }
      }));
    }
  } catch (e) { /* silent */ }
});
