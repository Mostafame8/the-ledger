# Training room — 3D scenes

Date: 2026-09-09
Status: implemented (wave 1, cells) — see docs/superpowers/plans/2026-09-09-training-3d-scenes.md

## Purpose

Trace drills already carry, per stop, the highlighted line and the value of every
live variable. Explain steps carry Marguerite's picture in words plus a code block.
Neither shows the learner the *shape* of what the code does. This adds a real-time
3D scene ("the table": Marguerite lays the serials out on the table) that draws the
data structure and animates pointers and cells as the learner answers each stop, and
a looping illustration of the same picture on the explain step that introduces the
trick.

The learner chose WebGL 3D over 2D SVG knowing the trade-offs (bundle size, GPU,
harder text). This spec keeps those costs contained: one lazy-loaded chunk, a hard
fallback to the current text-only panel, and no lesson that *requires* the scene
to be answerable.

## Non-goals

- No scene on spot, blank, or mini steps, and none on heist gates.
- Wave 1 draws one structure kind, `cells` (a flat list or string with index
  pointers and ranges). Stacks, queues, heaps, grids, dicts, sets, trees, graphs,
  linked chains, and multi-row layouts (merging, prefix sums) are wave 2 and get
  their own kinds later; this spec fixes the descriptor shape they will reuse.
- No free-form camera work per lesson. One camera, one orbit, one zoom range.
- No physics, no particle effects, no sound.
- Per-component CSS stays out; everything goes in `src/style.css`.
- The scene never carries information the state panel does not. It is a picture of
  the state, never a substitute for it.

## Content model

### Scene descriptor

A `scene` object may sit on a `trace` step and on an `explain` step. Constructors
in `src/data/training/node.js` gain an options argument:

```js
trace(code, input, frames, { scene })        // scene is optional
explain(lines, { move, code, scene })        // as today, plus scene
```

Shape, wave 1:

```js
scene: {
  kind: 'cells',
  data: [1, 3, 4, 6, 9] | 'HB4417' | 'nums',      // literal list/string, or a state key
  init: [0, 4, 0, 7],                              // required when data is a state key: the list before frame 1
  pointers: ['i', 'j'],                            // state keys whose values are indices (-1 .. len)
  ranges: [['lo', 'hi'], [0, 1], { end: 'r', width: 3 }],   // inclusive; keys or ints; or a window ending at a key
  marks: ['n'],                                    // state keys whose *value* lights every cell holding it
  labels: { i: 'small hand', j: 'big hand' },      // plain-word captions on the pins
  states: [{ i: 0, j: 4 }, { i: 0, j: 3 }],        // explain only: a loop of states to cycle
}
```

Rules:

- `data` as a literal draws that list or string. `data` as a string names a state
  key when it looks like an identifier (`/^[a-z_][a-z0-9_]*$/`); then `init` must
  give the list before the first frame, and the renderer reads the list from each
  frame's `state` so in-place traces (fill_front, insertion_sort, reverse_range)
  show the list changing. If a frame lacks the key, the previous frame's list
  stays. `init` may be empty (a heap starts empty). Literal strings in content
  (`'HB4417'`) never match the identifier rule.
- A pointer value of `-1` draws the pin one slot before the first cell and `len`
  one slot after the last, so "walked off the end" is visible.
- `marks` light, in gold, every cell whose text equals the state value's text.
  This is how lessons with a current value but no index (loops, tracking, sets,
  bits, heaps) get a picture.
- A range entry is `[a, b]` (each a state key or an int) or `{ end, width }`
  meaning `[end - width + 1, end]`. Ranges clamp to the row; an empty or inverted
  range draws nothing.
- On a `trace`, pointer and range values come from each frame's `state`. A pointer
  whose key is absent in a frame is hidden for that frame. `None` hides it too.
- On an `explain`, there are no frames, so `states` supplies the values; the scene
  cycles them every ~1.6 s with a smooth move, looping. Without `states` the scene
  is static, pointers drawn from the descriptor's own `pointers` if they are given
  as an object `{ i: 0, j: 4 }` rather than key names.
- A string `data` draws one cell per character. Numbers and single characters are
  the only cell contents in wave 1; anything else is stringified and truncated to
  six characters with `…`.
- Wave 2 kinds reuse `kind`, `data`, and `states`; each adds its own fields. The
  renderer dispatches on `kind` and ignores kinds it does not know (renders nothing,
  logs once in dev).

### Which lessons get scenes (wave 1)

Every lesson and tool whose trace input is a single flat list or string and whose
frames carry index pointers gets a `cells` scene on both its trace and its
code-bearing explain step:

`loops`, `two-pointers`, `arrays-in-place`, `binary-search`, `digit-arrays`,
`sliding-window`, `rotation`, `sorting`, `tracking`, `hash-maps`, `sets`, `heaps`,
`bits`, and the tools `tool-list` and `tool-string`.

Lessons whose trace is a list but whose pointer is not an index (e.g.
`search-the-answer` walks a value range) wait for a `number-line` kind in wave 2.

### Story and voice

The scene is "the table". The caption over the canvas reads `The table` in the
sys-title style. Pointer captions use Marguerite's words already in the prose
("small hand", "big hand", "the window"), never variable names alone, though the
variable name is always shown too: pin text reads `i · small hand`.

## Rendering

### Files

```
src/scene/
  model.js       pure: resolve(scene, state, prev) -> { cells, pointers, ranges, marks, changed, source }
  validate.js    content rules for scene descriptors, used by check-training.mjs
  stage.js       renderer, camera, lights, floor grid, orbit, resize, dispose
  cells.js       build/update meshes for kind 'cells'; tweens between resolved frames
src/components/
  SceneView.vue  canvas host, lazy-loads three, owns one renderer per mounted view
```

`model.js` has no DOM or three imports and is unit-tested in
`tests/scene-model.test.mjs`. Everything else is verified in the browser.

### Dependency and loading

`three` becomes a runtime dependency. `SceneView.vue` does
`const THREE = await import('three')` (plus `OrbitControls` from
`three/examples/jsm/controls/OrbitControls.js`) on mount, so Vite emits one chunk
and heist mode never downloads it. `LessonWindow.vue` prefetches that chunk when the
opened node has any step with a `scene`, so by the time the learner reaches the
trace the module is warm.

### Look

Matches the System-window aesthetic:

- Transparent canvas over the panel background; a faint floor grid in `--faint`.
- Cells are rounded boxes in `--panel` blue with a subtle emissive edge in
  `--edge`; the value is a canvas-text sprite on the front face; the index is a
  dimmer sprite on the floor in front of each cell.
- A pointer is a slim violet (`--violet`) beam from above with a glowing tip and a
  sprite label `i · small hand`. Two pointers on one cell stack their labels.
- A range bathes its cells in `--glow` at low opacity.
- A cell whose value changed since the previous stop flashes `--ok` for 400 ms.
- Camera sits front-high, slightly off-axis, framing all cells with margin. Orbit
  by drag, zoom by wheel within limits, no pan. No auto-orbit: the table holds
  still until the learner turns it (user preference, 2026-09-09).
- Transitions: pointers slide, changed cells pulse, all via a 300 ms ease-out lerp
  driven in the render loop. `prefers-reduced-motion` snaps instead.

### Layout

- Trace step: the `.trace` grid gains a first full-width row holding the scene
  (height 260 px, 200 px under 700 px wide); code and state panel stay below as
  today.
- Explain step: the scene sits between the story lines and the code block, same
  height.
- Canvas resizes with a `ResizeObserver`; renderer size follows its host.

### Fallbacks and disposal

- No WebGL (context creation fails or `three` import rejects): the scene host is
  removed and the step renders exactly as it does today. Nothing else changes.
- Leaving the step or closing the lesson disposes geometry, materials, textures and
  the renderer; the render loop stops when the canvas is not on screen
  (`IntersectionObserver`) and when the tab is hidden.
- One renderer per mounted `SceneView`; at most one view is mounted at a time.

## Data flow

```
frames[k].state  ─┐
scene descriptor ─┼─ model.resolve() ─► { cells, pointers, ranges, marks, changed }
prev resolved    ─┘                            │
                                               ▼
                                     cells.update(resolved)  ─► tween ─► render loop
```

`StepTrace.vue` already tracks `k` (stops answered). It passes
`step.scene` and `frames[min(k, total-1)].state` to `<SceneView>`; the view
resolves and updates. `StepExplain.vue` passes `step.scene` with a ticking index
into `scene.states`.

## Validation (`scripts/check-training.mjs`)

For every step carrying `scene`:

- `kind` is a known kind (`cells` in wave 1). Unknown kind fails.
- `cells`: `data` is a non-empty array or string, or a string that is a key present
  in the first frame's `state` (trace) whose value there is an array or string.
- `pointers` is an array of state keys whenever there are frames or `states` to
  read from (every trace; an explain with `states`). On an explain without `states`
  it is an object of literal ints. On a trace, every pointer key appears in at least
  one frame, and wherever it appears its value is `None` or an integer in
  `[0, len(data)]` (`len` allowed for "past the end"). Out-of-range fails with the
  frame index in the message.
- `ranges` entries are two pointer-like keys; same bounds rule.
- `labels` keys are a subset of `pointers`.
- `states` is explain-only and non-empty when present; each entry's values obey
  the pointer bounds rule against the literal `data`.
- A `scene` on a spot, blank, or mini step fails.
- When `data` is a state key, `init` is present and is an array or string.
- `marks` keys each appear in at least one frame (trace) or state (explain).
- Pointer and range ints are in `[-1, len]` where `len` is the row length at that
  frame (after applying the frame's own list if `data` is a key).

## Testing

- `tests/scene-model.test.mjs`: resolve with literal data; with a state key that
  changes; hidden pointer on missing key and on `None`; ranges; `changed` set
  between two frames; string data splits to characters; unknown kind returns
  `null`.
- `npm run check` covers every descriptor in content.
- Browser: open `two-pointers`, answer stops, confirm pins move and the last stop
  shows both pins on the pair; open `sorting` and confirm cells reorder and flash;
  open the explain step and confirm the loop; block WebGL via DevTools and confirm
  the plain panel; check no console errors and that the chunk loads only in
  training.

## Rollout

1. Engine: `model.js` + tests, `stage.js`, `cells.js`, `SceneView.vue`, CSS,
   constructor options, validator rules.
2. Content: descriptors on the fifteen wave-1 lessons and tools listed above.
3. Wave 2 (separate spec): `stack`, `grid`, `rows`, `number-line`, then
   `dict`, `tree`, `graph`.
