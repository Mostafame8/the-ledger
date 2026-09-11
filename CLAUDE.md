# The Ledger — project notes for Claude Code

A local Vue 3 + Vite site that teaches algorithms in Python through a heist story.
The learner works through "gates" (problems) grouped into "arcs" (difficulty tiers).
Clearing a gate grants XP, raises a stat, and unlocks the next gate.

## Run
- `npm install`, then `npm run dev`
- `npm run check` validates all gate and training data, including every `scene`. `npm test` runs the unit tests in `tests/` and proves every gate and drill against reference solutions. Run both after every content change.

## Layout
- `src/courses/index.js` — the course registry (`COURSES`, `courseById`, `DEFAULT_COURSE`, `RUNNERS`). One folder per course; the store reads all content through the active course. Components never import from `src/courses/`.
- `src/courses/algorithms/` — the algorithms course: `course.js` (the course object: id, title, algo, runner, three `stats`, arcs/gates, training, xp ladder, blurbs), `gates.js` (ALL gate content, the `ARCS` array: story text, missions, hints), `index.js` (derived lists, XP per level, title thresholds), `tests.js` (Python tests per gate).
- `src/training/` — the training engine shared by courses: `node.js` (step constructors), `progress.js` and `answers.js` (pure logic, unit-tested in `tests/`).
- `src/store.js` — progress state, persisted to localStorage as named save files (slots) under `ledger-saves-v1`; the old single save `ledger-save-v2` migrates into slot 1 once. Slot data is `{ player: { name }, course, courses: { <id>: block } }`, one block (xp, stats, cleared, notes, tab, mode, training) per course; the old flat shape is upgraded on read by `upgradeData` in `saves.js`.
- `src/saves.js` — pure slot logic (create/select/delete/rename/write, legacy migration, v1→v2 upgrade), unit-tested in `tests/saves.test.mjs`. `SaveFiles.vue` is the slot screen; it opens from the Status window and is forced open while no slot is selected. `CourseSelect.vue` is the Jobs screen (pick a course); it opens from the Status window and is forced open on a fresh slot.
- `src/components/` — StatusWindow, GateList, QuestWindow, TestResults (shared by QuestWindow and the training presentation). Presentation only.
- `src/style.css` — the "System window" look. Do not add per-component CSS; keep it here.
- `scripts/check-gates.mjs` — content validator, runs over every course. `scripts/solutions/<course>/` — reference solutions for that course's gates, blocks `# === <gate-id>`.
- `src/courses/algorithms/training/` — training room content. One file per technique node, `index.js` lists them in order. Constructors come from `src/training/node.js`.
- `src/courses/algorithms/training/tools/` — armoury content. One file per tool, `index.js` lists all twelve in a fixed order (list, string, dict, set, stack, queue, heap, recursion, linked-node, tree-node, graph, table).
- `src/components/SkillTree.vue`, `LessonWindow.vue`, `Step*.vue` — training presentation. `SkillTree.vue` also renders the Armoury tab (tools list, kit progress) and, on lesson rows, tool chips (red/locked until the tool is cleared).
- `scripts/check-training.mjs` — training validator, runs over every course. `scripts/solutions/<course>/training/` — reference solutions for that course's drills, blocks `# === <node-id>/<step-index>`.
- `src/scene/` — "the table", the 3D view on training steps. `model.js` (pure: descriptor + state → picture, unit-tested), `validate.js` (content rules, used by `check-training`), `stage.js`, `text.js` and `pin.js` (shared sprite text and the violet pin), `row.js` (the block renderer: lane, pile or chain), `cells.js` and `rows.js` (lanes and piles), `grid.js` (the tile floor, one or two grids), `line.js` (the number rail), `graph.js` (nodes at authored positions with edge rods), `tree.js` (binary trees and tries, tidy layout) (three.js, lazy-loaded). `src/components/SceneView.vue` is the canvas host; it hides itself without WebGL.

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

## Training node schema
Use `node(id, {...})` and the step constructors from `src/training/node.js`:
- `tier` F–S, `xp` in the tier's range (F 40–60, E 60–80, D 90–100, C 120–140, B 160–180, A 200–240, S 280–400), `requires` node ids, `gates` gate ids it prepares.
- `tools` — array of `tool-…` ids from the armoury, at most two. A lesson opens only once every `requires` node is cleared AND every listed tool is cleared. Lessons that need no structure (`method`, `bits`, `tracking`, `search-the-answer`) still carry `tools: []`.
- `title` is a scene name, `algo` the plain technique name.
- Steps in order: `explain(lines, {move?, code?, scene?})`, `trace(code, input, frames, {scene?})`, `spot(problem, options, answer, why)`, `blank(intro, template, tests)`, `mini(mission, hint, tests)`.
- Every technique node has at least one trace, spot, blank, and mini. `method` has explain and spot only.
- Trace frames: `{ line, state, ask, note }`; `line` is 1-based into `code`; `ask` names a key of `state`; values are JS literals or `{ py: '(1, 3)' }` for tuples.
- Drill `tests` use the same `check()` dialect as gates. Add a reference block per drill in `scripts/solutions/<course>/training/<node-id>.py`.
- Content order in a lesson: two explain steps (Dax's brute force, then the waste named or the pattern shown, with a code block), then trace, spot, blank, mini.
- Exception to the `algo`-only rule: `spot` options, a spot's `problem` and `why`, the `method` lesson, mandated function names, and unavoidable interpreter vocabulary (e.g. Python's own error text) may name techniques. Explain lines, missions, and hints may not.
- The lesson list is tier tabs (populated tiers only) with one row per lesson ordered by prerequisite depth; locked rows show `needs: <titles>`. No drawn links.
- `scene` — optional on `trace` (4th arg `{ scene }`) and `explain` (in the options). Wave 1 kind `cells`: `{ kind: 'cells', data: [..] | 'HB4417' | 'stateKey', init?, pointers?: ['i'], ranges?: [['lo','hi'] | [0,1] | { end:'r', width:3 }], marks?: ['n'], labels?: { i: 'small hand' }, states?: [...] }`. `states` is explain-only (a loop). Pointer ints must be in `-1..len`. Labels reuse words from that lesson's prose. Also `at?: ['slow.val']` (pins by value), `pile?: true`, `chain?: true`; and kind `rows`: `{ kind: 'rows', rows: [{ label, ...cells fields }] }` (1–4 rows, first farthest, piles at the right). A string `data` with `init` is a state key even when it is not an identifier. Kind `grid`: `{ kind: 'grid', data: [[..]] | 'key', init?, cursor?: ['r','c'], marks?, heads?: { rows, cols } }` (row 0 far; `True`/`False` tiles lit/dark). Kind `line`: `{ kind: 'line', axis: [a, b], lanes?: [{ label, bars: [[s,e]] | 'key', init? }], ticks?, span?: ['s','e'], pins?: ['lo'] }` (0–2 lanes; omit for a bare axis). State values may be twins `{ py, val }`: answers read `py`, the table reads `val` (`val` only beside `py`, never nested). `cells` `data` may be an object or a key with `init: {}` (keyed blocks, key text under each; `at` matches keys too; no `pointers`/`ranges`). Kind `grid` also takes `grids: [{ label, data, init? }]` (1–2, side by side; no `cursor`/`heads` in that form). Kind `graph`: `{ kind: 'graph', adj: [[nbr | [nbr, w]]] | 'key', init?, pos: [[x, z]], names?, directed?, at?: ['node'], marks?: ['seen'], badges?: 'dist' }` (one `pos` per node; the edge between two pinned nodes glows). Kind `tree`: `{ kind: 'tree', data: { val, left?, right? } | { key: {...}, '#': true } | 'key', init?, at?, marks? }` (auto layout, path ids, a `true` child lights its parent; depth ≤ 6, nodes ≤ 31). Recursion lessons draw the call stack as a `rows` pile over a `calls` key. See `docs/superpowers/specs/2026-09-09-training-3d-scenes-design.md`, `docs/superpowers/specs/2026-09-09-training-3d-scenes-wave2a-design.md`, `docs/superpowers/specs/2026-09-10-training-3d-scenes-wave2b-design.md` and `docs/superpowers/specs/2026-09-11-training-3d-scenes-wave2c-design.md`.

### Tool schema
Use `tool(id, {...})` from `src/training/node.js`, one file per tool in `src/courses/<course>/training/tools/`:
- `tool(id, { xp, title, algo, steps })` — `id` is `tool-<name>` (kebab), `xp` 20–40 (use 30), `title` the scene name, `algo` the plain structure name (e.g. `List`, `Heap`). No `tier`, `requires`, or `gates` — tools are flat, ungated drills.
- Steps in order: `explain, explain, trace, blank` (no spot, no mini). Unlike lesson prose, tool prose may name its own structure — the structure is the drill's subject.
- Add a reference block per drill in `scripts/solutions/<course>/training/<tool-id>.py`, headed `# === tool-<name>/<step-index>`.
- Kit xp (the sum of cleared tools' `xp`) is a separate pool that never enters `training.xp` and never touches the rank ladder (`rankFor`, `rankProgress`, `depthOf` read lesson fields only).

## The story (keep it consistent)
- Setting: a contemporary city, a heist on Halden Bank, and a book of payments called the Ledger.
- Cast: **Marguerite** — the fixer, dry, precise, never wastes words; she gives the missions and the hints. **Dax** — the muscle, blunt, proposes the naive/brute-force approach so the learner can beat it. **The fence** — unnamed woman who buys what the crew steals. The learner is "the systems person".
- Arcs: I Recruitment (warm-ups) · II Casing the bank (patterns, search, linear structures, trees) · III The job (graphs on grids, sorting, recursion, backtracking) · IV The escape (weighted graphs, union-find, introductory DP) · V The Ledger (hard DP, strings, tries, finale).
- Training room: a rented room above a laundromat where the crew trains between jobs. Marguerite teaches the six moves (restate, examples, brute force, name the waste, pick the pattern, verify) and one technique per lesson. Training is separate from gates: own XP, own rank F–S.
- Voice: short, wry, concrete. Every problem is a thing the crew needs, framed in the world (keys, guards, cameras, serials, routes, bribes). No lecture tone; the algorithm name appears only in `algo`.
- Do not reference any real anime, manga, game, or their characters. This is an original story with an RPG "system" aesthetic.

## Content rules
- Problems should be classic, well-known algorithm exercises (the kind found in any interview-prep set), each mapped to a scene. Order within an arc must go from easier to harder and each gate should build on an earlier one where possible.
- Never repeat a technique twice in a row; vary logic/speed/memory.
- Missions must be checkable: named function, stated input/output.
- After editing gates.js: run `npm run check`, then `npm run dev` and open two or three new gates to confirm they render.
