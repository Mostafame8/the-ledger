# Training room — 3D scenes, wave 2a: rows, piles, chains, and the cells rollout

Date: 2026-09-09
Status: implemented — see docs/superpowers/plans/2026-09-09-training-3d-scenes-wave2a.md
Builds on: `2026-09-09-training-3d-scenes-design.md` (wave 1, kind `cells`)

## Purpose

Wave 1 drew one row of blocks. Twenty more lessons and tools have traces whose state is
still lists and strings, but in two or three of them at once (a source list, an output list,
a stack), or as a chain of nodes. This wave draws those with the same block language:
rows laid front to back, a pile standing at the end, arrows between linked blocks. It also
turns on plain `cells` scenes for the items that already fit them.

Grids, number lines, dicts, graphs and trees are wave 2b and 2c. Lessons whose state is
Python text rather than data (`caches`, `tries`, `hash-maps`' `seen`) stay undrawn until
their frames carry real values.

## Non-goals

- No auto-motion of the camera (user preference, wave 1). Motion only when the learner
  answers a stop or drags.
- No story-prop skins or emoji glyphs (tried and rejected).
- No per-lesson camera work: one framing rule from the scene's width and depth.
- Nothing on spot, blank, mini, or gates.

## Content model

### `cells` gains three options

```js
scene: {
  kind: 'cells',
  data: [1, 2, 3, 4, 5] | 'ok go' | 'list(line)',   // literal list/string, or a state key
  init: ['ana', 'boyd'],       // required when data is a state key
  pointers: ['i'],             // index pins (wave 1)
  at: ['slow.val', 'fast.val'],// NEW: value pins — a pin over every cell whose text equals the state value
  marks: ['first'],            // gold cells by value (wave 1)
  ranges: [...],               // (wave 1)
  labels: { 'slow.val': 'slow', 'fast.val': 'fast' },   // captions for pointers AND at keys
  pile: true,                  // NEW: stand the row up — index 0 at the bottom, last on top
  chain: true,                 // NEW: draw an arrow from each block to the next
  states: [...],               // explain only (wave 1)
}
```

Rules:

- **Key rule relaxed.** A string `data` is a state key when it matches
  `/^[a-z_][a-z0-9_]*$/` **or** when `init` is present. So `data: 'list(line)', init: [...]`
  reads the tool-queue frames, while `'HB4417'` and `'ok go'` (no `init`) stay literals.
- `at` keys are looked up in the frame like `marks`; every cell whose text equals the value
  gets a pin labelled `key · caption` (or the key alone). A missing key or `None` hides the
  pin. `at` values are never range-checked; the validator only requires each key to appear
  in at least one frame. `labels` keys must be a subset of `pointers ∪ at`.
- `pile` and `chain` are booleans, default false, mutually exclusive. A pile has no index
  pins or ranges (validator rejects them); marks and `at` still work. A chain is a normal row
  drawn with a wider gap and an arrow cone in each gap; it accepts everything a row does.
- Wave-1 behaviour is unchanged for scenes that use none of the new options.

### New kind `rows`

```js
scene: {
  kind: 'rows',
  rows: [
    { label: 'a',     data: [1, 4], pointers: ['i'] },
    { label: 'b',     data: [2, 3], pointers: ['j'] },
    { label: 'out',   data: 'out', init: [] },
    { label: 'stack', data: 'stack', init: [], pile: true },
  ],
  states: [...],   // explain only; one state feeds every row
}
```

- One to four rows. Each row is a `cells` descriptor without `kind`/`states`, plus a
  required `label` (a short word; the variable name is fine). All cells rules apply per row.
- Rows are laid front to back in file order: the first row farthest from the camera, the
  last nearest. A `pile` row does not take a lane; it stands at the right end of the rows,
  aligned with the front row.
- `changed` flashes are per row. A `states` loop feeds the same state to every row.

### Resolution

`resolve()` returns, for `cells`, the wave-1 shape plus `at` pins merged into `pointers`
(each with `key`, `index`, `label`) and the flags `pile`, `chain`; for `rows`,
`{ kind: 'rows', rows: [ResolvedCells...] }` where each row also carries `label`. The
previous-row fallback (`prev.source`) works per row by position.

### Which items get scenes

Plain `cells` (9): `strings` (`'ok go'`, pin `i`), `dp-line` (`table`, pin `i`),
`dp-choices` (`table`, pin `a`), `union-find` (`parent`, pins `a b ra rb`),
`search-the-answer` (`[3, 6, 7, 11]`, mark `p`), `tool-queue` (`list(line)`, mark
`first`), `tool-heap` (`drawer`, mark `first`), `tool-stack` (`tray`, pile, mark `taken`),
`tool-set` (`sorted(seen)`, mark `p`).

`rows` (9): `merging` (a, b, out), `monotonic` (nums, out, stack pile), `knapsack-dp`
(weights, values, row), `enumeration` (serials, chosen pile), `backtracking` (coins,
chosen pile), `stacks` (card, pile), `prefix-sums` (serials with mark `n`, pre with pins
`i j` and range), `string-search` (pat with pins `i k`, table), `topo-order` (indeg with
pins `node nxt`, queue). `string-search`'s pattern is written as `['a', 'b', 'a', 'b']`,
a literal array, because the string `'abab'` would match the key-identifier rule.

`chain` (2): `linked-lists` (`[1, 2, 3, 4, 5]`, at `slow.val fast.val`, captions slow /
fast), `tool-linked-node` (`['meet', 'pay', 'burn']`, at `a.next.val b.next.val`). The
arrows show the original chain; the pins show what the code's references point at. The
tool's splice is visible as the pin moving from `pay` to `burn`.

Every item also gets an explain-step loop of two to five states on its code-bearing
explain, as in wave 1. Twenty items in all.

## Rendering

### Files

```
src/scene/
  model.js     resolve() handles kinds cells (with at/pile/chain) and rows
  validate.js  rules above; a shared per-row checker
  stage.js     frame({ width, depth, height }) replaces frameCells(count); onTick returns an unsubscribe
  row.js       createRow(stage, parent, { label }) — the block renderer, moved out of cells.js; pile/chain come from the resolved row passed to update(), position via setPosition(x, z)
  cells.js     createCells(stage): one row at z = 0
  rows.js      createRows(stage): lanes front to back, piles at the right end
src/components/SceneView.vue  dispatches on resolved.kind → cells.js or rows.js
```

### Look

- A lane is one wave-1 row. Lanes sit 1.6 units apart along depth; each has a dim label
  sprite at its left end reading the row's `label`.
- A pile is the same blocks stacked vertically (0.9 units apart), index sprites on the
  left face, label sprite above the top block, standing 1.5 units right of the longest lane.
- A chain uses a 1.5-unit gap with a short violet arrow (cylinder + cone) centred in each
  gap, pointing right.
- Value pins (`at`) look exactly like index pins.
- Camera: `frame({ width, depth, height })` places the camera front-high so the widest
  lane, the deepest lane and the tallest pile fit with margin; the target sits at the
  centre of the lanes. Still no auto-orbit.

### Behaviour

- A change in row count, any row's length, or the pile height rebuilds that structure and
  re-frames the camera; pins snap on rebuild, and cells whose text changed still flash (so a
  growing lane or pile lights its new block).
- Disposal releases every row's materials and the label and arrow meshes.
- Explain loops, reduced motion, WebGL fallback, and the trace-step masking of the asked
  value all carry over unchanged.

## Validation (`scripts/check-training.mjs`)

Per scene:

- `cells`: wave-1 rules, plus: `at` is an array of strings each present in some frame or
  state; `labels` ⊆ `pointers ∪ at`; `pile`/`chain` booleans, not both; a `pile` has no
  `pointers` and no `ranges`.
- `rows`: `rows` is an array of 1–4 objects, each with a string `label`, no `kind`, no
  `states`, and passing the cells checks; `states` allowed on explain only. Labels unique
  within a scene.
- The relaxed key rule: a string `data` with `init` is a key; the validator then requires
  the key in at least one frame/state.

## Testing

- `tests/scene-model.test.mjs`: `at` pins by value (multiple matches, missing, None);
  key rule with `init` for a non-identifier key; `pile`/`chain` flags pass through; `rows`
  resolves per row with per-row `changed` and per-row prev fallback.
- `tests/scene-validate.test.mjs`: pile with pointers rejected; both flags rejected; `at`
  key never appearing rejected; rows with duplicate labels, missing label, five rows, or a
  nested `states` rejected; a valid three-row scene passes.
- `npm run check` covers all twenty descriptors.
- Browser: `merging` (three lanes, `out` grows nearest the camera), `monotonic` (pile
  grows and shrinks), `linked-lists` (two pins hop along the chain, `fast` disappears on
  the last stop), `tool-queue` (non-identifier key), reduced motion, WebGL off, no console
  errors, heist screen still makes no three request.

## Rollout

1. Engine: model + validator (TDD), `row.js` extraction with `cells.js` unchanged in
   behaviour, `rows.js`, stage framing, SceneView dispatch.
2. Content: the nine `cells` items, then the nine `rows` items, then the two chains.
3. Docs: CLAUDE.md scene bullet, spec statuses.
