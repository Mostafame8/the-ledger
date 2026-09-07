# The Ledger — project notes for Claude Code

A local Vue 3 + Vite site that teaches algorithms in Python through a heist story.
The learner works through "gates" (problems) grouped into "arcs" (difficulty tiers).
Clearing a gate grants XP, raises a stat, and unlocks the next gate.

## Run
- `npm install`, then `npm run dev`
- `npm run check` validates all gate data. Run it after every content change.

## Layout
- `src/data/gates.js` — ALL gate content lives here (the `ARCS` array). Story text, missions, hints.
- `src/data/index.js` — derived lists, XP per level, title thresholds.
- `src/store.js` — progress state, persisted to localStorage.
- `src/components/` — StatusWindow, GateList, QuestWindow. Presentation only.
- `src/style.css` — the "System window" look. Do not add per-component CSS; keep it here.
- `scripts/check-gates.mjs` — content validator.

## Gate schema
Use the `g(...)` helper in gates.js:
`g(id, rank, xp, stat, title, algo, story, mission, hint, code?)`
- `id` — short, lowercase, unique across ALL arcs (kebab-case if needed).
- `rank` — F E D C B A S. Ranks rise through an arc; an arc spans at most two adjacent ranks.
- `xp` — F 40–50, E 60–80, D 90–100, C 120–140, B 160–180, A 200–240, S 280–400.
- `stat` — which stat this trains: `logic` (reasoning/recursion), `speed` (efficiency/pointers/greedy), `memory` (hashing/DP/caching).
- `title` — the scene name in the story, NOT the algorithm name ("The bracket lock", not "Valid Parentheses").
- `algo` — the technique in plain words ("Stacks", "Sliding window").
- `story` — 2–4 strings. At least one line is dialogue and MUST start with a curly opening quote `“` (the UI styles those as spoken lines). Keep each line one or two sentences.
- `mission` — the precise task, function name included, plus one stretch question or follow-up.
- `hint` — one or two sentences pointing at the key insight, never the full solution.
- `code` — optional. Example calls with expected output, or a small harness. Use a template string. Include it for roughly every second gate in Arc I–II; optional later.

## The story (keep it consistent)
- Setting: a contemporary city, a heist on Halden Bank, and a book of payments called the Ledger.
- Cast: **Marguerite** — the fixer, dry, precise, never wastes words; she gives the missions and the hints. **Dax** — the muscle, blunt, proposes the naive/brute-force approach so the learner can beat it. **The fence** — unnamed woman who buys what the crew steals. The learner is "the systems person".
- Arcs: I Recruitment (warm-ups) · II Casing the bank (patterns, search, linear structures, trees) · III The job (graphs on grids, sorting, recursion, backtracking) · IV The escape (weighted graphs, union-find, introductory DP) · V The Ledger (hard DP, strings, tries, finale).
- Voice: short, wry, concrete. Every problem is a thing the crew needs, framed in the world (keys, guards, cameras, serials, routes, bribes). No lecture tone; the algorithm name appears only in `algo`.
- Do not reference any real anime, manga, game, or their characters. This is an original story with an RPG "system" aesthetic.

## Content rules
- Problems should be classic, well-known algorithm exercises (the kind found in any interview-prep set), each mapped to a scene. Order within an arc must go from easier to harder and each gate should build on an earlier one where possible.
- Never repeat a technique twice in a row; vary logic/speed/memory.
- Missions must be checkable: named function, stated input/output.
- After editing gates.js: run `npm run check`, then `npm run dev` and open two or three new gates to confirm they render.
