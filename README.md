# The Ledger

Learn algorithms in Python by pulling off a heist. A local Vue 3 site with an RPG-style
"system" interface: gates (problems), arcs (tiers), XP, stats, titles.

```
npm install
npm run dev
```

Content lives in `src/data/gates.js`. See `CLAUDE.md` for the schema and story guide, and
`PROMPT.md` for the Claude Code prompt that expands each arc to 12–16 gates.

Progress is saved in your browser's localStorage. "Wipe save" in the status window resets it.
