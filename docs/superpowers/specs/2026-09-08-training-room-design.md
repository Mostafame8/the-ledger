# Training room — design

Date: 2026-09-08
Status: approved in brainstorm, awaiting implementation plan

## Purpose

Gates test whether the learner can solve a problem. Nothing yet teaches them how.
The training room is a second mode of the site where Marguerite teaches each
technique before it is ever needed in a gate, and teaches one problem-solving
method that every lesson rehearses. It is fully separate from gates: its own tab,
its own XP, its own rank. Gates never lock on it and it never references gate
progress.

First version: the engine, the method lesson, and the techniques used in
Arcs I–II (ranks F–D). Later tiers are added as content, the way arcs were.

## Non-goals

- No live Python tracing. Trace drills use authored state tables.
- No effect on gate unlocking, gate XP, or heist titles.
- No per-component CSS. Everything stays in `src/style.css`.
- No new dependencies.

## Content model

### Node

One file per technique in `src/data/training/<id>.js`, built with a `node()`
helper mirroring `g()` in `gates.js`. `src/data/training/index.js` imports all
node files and exports `NODES` in display order.

```js
node('two-pointers', {
  tier: 'F',                       // F | E | D (later: C B A S). Tier of the gates it prepares for.
  title: 'Two hands on the rope',  // scene name, story voice, never the technique name
  algo: 'Two pointers',            // plain technique name
  requires: ['arrays-in-place'],   // prerequisite node ids; [] for roots
  gates: ['palin', 'squares', 'rmdup', 'twoptr'],  // gate ids this prepares; shown as "used in"
  xp: 60,                          // F 40–60, E 60–80, D 90–100
  steps: [ /* typed steps, see below */ ],
})
```

Rules: `id` lowercase kebab, unique. `requires` must reference existing nodes,
no cycles. `gates` must reference existing gate ids. Every node except `method`
has at least one `trace`, one `spot`, one `blank`, one `mini`. `method` has
`explain` and `spot` steps only.

### Steps

Each step is a plain object with a `type`. Steps run in order.

**explain** — read, then Next.
```js
{ type: 'explain', move: 'brute force',        // optional: which method move this rehearses
  lines: ['…', '“…”'],                          // 2–5 lines; dialogue starts with “
  code: `…` }                                    // optional Python block
```

**trace** — predict a variable at each authored frame.
```js
{ type: 'trace',
  code: `def two_sum_sorted(nums, target):\n    i, j = 0, len(nums) - 1\n    while i < j: …`,
  input: 'two_sum_sorted([1, 3, 4, 6, 9], 10)',
  frames: [
    { line: 3, state: { i: 0, j: 4 }, ask: 'j', note: 'Start at both ends.' },
    { line: 3, state: { i: 1, j: 4 }, ask: 'i', note: '1 + 9 = 10 is too small, so i moves.' },
    …
  ] }
```
The learner sees `code` with `line` highlighted, the state with the asked
variable hidden, and types its value. Comparison is on Python-literal text
after normalising whitespace: `[1, 2]`, `'ab'`, `3`, `True`, `None`. Wrong
answer reveals the true value and `note`; the learner must enter the right
value to advance. Every frame must be answered.

**spot** — pick the technique.
```js
{ type: 'spot',
  problem: 'Sorted list of badge ids, find two that sum to a target.',
  options: ['Two pointers', 'Hash map', 'Binary search', 'Stack'],
  answer: 0,
  why: 'Sorted input plus a pair condition: move inward from both ends.' }
```
Wrong choice shows `why` and lets the learner pick again. Must choose correctly
to advance.

**blank** — fill missing lines.
```js
{ type: 'blank',
  intro: '“Finish it. The pointers are yours.”',
  template: `def is_palindrome(s):\n    i, j = 0, len(s) - 1\n    while ___:\n        if s[i] != s[j]:\n            return False\n        ___\n    return True`,
  tests: `check("is_palindrome('abba')", True)\n…` }
```
Template opens in the code editor with `___` markers left in place. Learner
edits freely; the whole text is run with `tests` through the existing runner.
Passing all checks completes the step.

**mini** — small problem from scratch.
```js
{ type: 'mini',
  mission: 'Write squares_sorted(nums) …',
  hint: 'Largest square is at one end or the other.',
  tests: `check(…)` }
```
Same runner as gates. Easier than any gate that uses the technique.

### Method node

`method` is the root: tier F, no prerequisites, 8–10 steps of `explain` and
`spot`. It teaches Marguerite's six moves:

1. Restate — say the problem in your own words, name input and output.
2. Examples — write two small ones and one edge case by hand.
3. Brute force — say the obvious way and its cost. Dax's move.
4. Name the waste — what does brute force recompute or revisit?
5. Pick the pattern — which technique removes that waste?
6. Verify — run the examples, then the edge case.

Every later `explain` step may set `move` to one of these names; the UI shows
it as a small tag so the method is rehearsed across every lesson.

## Progression

### Save

`store.js` adds a `training` slice to the existing save object under the same
localStorage key: `{ xp: 0, nodes: { [id]: { step: n, cleared: bool } }, active: id | null }`.
Missing slice on load means fresh training state; existing saves keep working.

### Rank

Training XP maps to ranks F E D C B A S. Thresholds are derived from the sum of
node XP per tier, so adding nodes never breaks the ladder:
rank R is reached when XP ≥ total XP of all nodes in tiers below R. With only
F–D content the reachable maximum is D until more tiers ship.

### Unlocking and clearing

- A node is open when every id in `requires` is cleared. `method` is always open.
- Steps advance only when satisfied: `explain` on Next, drills on a correct answer.
- Clearing the last step clears the node, adds its `xp`, and fires the level flash.
- Cleared nodes can be reopened and any step redone; no extra XP.
- `active` and each node's `step` persist, so a half-done lesson resumes.

## UI

### Mode

`App.vue` gains a mode: `heist` (current screen) or `training`. A two-button
toggle sits in the StatusWindow header. Mode is persisted in the save.

### Components (presentation only, CSS in `style.css`)

- `SkillTree.vue` — columns per tier (F, E, D). Within a column, nodes ordered by
  dependency depth then index order. Prerequisite links drawn as inline SVG
  lines between cards. Card shows title, technique, "used in N gates", and state
  (locked / open / cleared). Click opens an open or cleared node.
- `LessonWindow.vue` — takes QuestWindow's place in training mode. Header: title,
  technique, `step k / n`, `move` tag if set. Body: one step component. Footer:
  Back, Next (disabled until the step is satisfied), Close.
- `StepExplain.vue`, `StepTrace.vue`, `StepSpot.vue`, `StepCode.vue` — one per
  step type; `blank` and `mini` both use StepCode, which reuses `editor.js` and
  renders test results the way QuestWindow does.
- `StatusWindow.vue` — in training mode shows training rank, training XP bar,
  nodes cleared / total. In heist mode unchanged.

### Store API additions

`mode`, `setMode`, `trainingXp`, `trainingRank`, `nodeState(id)`,
`nodeOpen(id)`, `openNode(id)`, `closeNode()`, `activeNode`, `activeStep`,
`stepIndex`, `answer(payload)` (marks current step satisfied when correct),
`next()`, `back()`, `runStepTests(code)`.

## Validation and tests

- `scripts/check-training.mjs` — schema, unique ids, prerequisite ids exist and
  form a DAG, gate ids exist, required step mix per node, trace frames have
  `ask` present in `state`, spot `answer` in range, dialogue lines start with “.
  Wired into `npm run check` alongside `check-gates.mjs`.
- `scripts/test-solutions.mjs` — also runs every `blank` and `mini` step's
  `tests` against reference solutions in `scripts/solutions/training/<node>.py`,
  blocks introduced by `# === <node-id>/<step-index>`.
- Manual: `npm run dev`, switch mode, clear `method` and `two-pointers` end to
  end, reload mid-lesson and confirm resume.

## Content plan (first version)

20 nodes (method plus 19 techniques). Rough dependency order; exact `requires` set during authoring.

| Tier | Node id | Technique | Prepares gates |
|---|---|---|---|
| F | method | The six moves | all |
| F | loops | Loops & conditionals | fizz |
| F | arrays-in-place | In-place writes, swaps | zeros, rmdup |
| F | grids | 2-D lists & indices | transpose |
| F | two-pointers | Two pointers | palin, squares, rmdup, twoptr |
| F | strings | Slicing, split/join, reversal | reverse, palin |
| F | digit-arrays | Carries, digit lists | plusone |
| F | hash-maps | Dict lookups | twosum, anagram, firstuniq |
| F | frequency | Counting with dict/Counter | anagram, firstuniq, majority |
| F | bits | XOR and bit tricks | xor |
| F | sets | Membership and dedupe | dupes |
| E | tracking | Single-pass running min/max | stocks, majority |
| E | stacks | Push/pop matching | parens |
| E | binary-search | Halving on sorted / yes-no | halden, firstbad, rotsearch |
| E | rotation | Reversal tricks | rotate |
| E | merging | Merging sorted sequences | merge, mergell |
| D | sliding-window | Fixed and variable windows | window, minsub |
| D | prefix-sums | Prefix/suffix accumulation | prefix, product, kadane |
| D | linked-lists | Nodes, slow/fast pointer | linked, mergell |
| D | trees | Traversal, BST, LCA | tree, bst, lca |

Each technique node: 1–2 `explain`, 1 `trace`, 1 `spot`, 1 `blank`, 1 `mini`.
About six steps, five to ten minutes.

## Build order

1. Engine: data helper, index, store slice, mode toggle, SkillTree,
   LessonWindow, four step components, check and test script extensions.
   Content: `method` and `two-pointers` only.
2. Browser review of those two nodes.
3. Content batches: remaining F nodes, then E, then D. Each batch runs
   `npm run check` and `npm test` and gets a browser look at two nodes.

## Story notes

Same world and voice as `CLAUDE.md`. Training is what the crew does between
jobs, in a back room Marguerite rents above a laundromat. She teaches; Dax sits
in and proposes brute force; the fence occasionally supplies a prop. Technique
names appear only in `algo`. No references to real anime, manga, or games.

## Content plan, tiers C–S (added 2026-09-08 after user review)

The first version shipped tiers F–D. The user asked for the full ladder, and for
the lesson list to use tier tabs like the gate list instead of columns with
drawn prerequisite lines. Both are now part of the design:

- **Lesson list**: tier tabs (populated tiers only) with `trained / total`, then
  one row per lesson ordered by prerequisite depth: tier badge, scene title,
  technique, "used in N gates", and on locked rows "needs: <titles>". No drawn
  links.
- **Tiers C–S**: 24 more nodes mapped to Arc III–V techniques. XP ranges follow
  the gate table (C 120–140, B 160–180, A 200–240, S 280–400). Node ids and
  their gates: C — grid-bfs, flood-fill, recursion. B — graphs, topo-order,
  intervals, heaps, sorting, enumeration. A — backtracking, greedy,
  weighted-graphs, union-find, dp-line, dp-grid, dp-choices. S — knapsack-dp,
  two-strings, monotonic, caches, tries, string-search, search-the-answer,
  interval-dp. Full tables live in
  `docs/superpowers/plans/2026-09-08-training-room-tiers-c-s.md`.
