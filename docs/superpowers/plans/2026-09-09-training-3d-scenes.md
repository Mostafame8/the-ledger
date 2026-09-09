# Training 3D Scenes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "the table", a lazy-loaded Three.js scene that draws a list or string as glowing blocks with pointer pins, ranges and value marks, animating as the learner answers trace stops and looping on the explain step that introduces the trick.

**Architecture:** A pure model (`src/scene/model.js`) turns a `scene` descriptor plus a frame's `state` into a resolved picture; a Three.js stage (`stage.js`, `cells.js`) renders and tweens it; `SceneView.vue` hosts the canvas and falls back to nothing when WebGL is missing. Content authors add one `scene` object to a trace step and one to an explain step; the validator checks every descriptor against the frames.

**Tech Stack:** Vue 3, Vite 5, `three` 0.186 (dynamic import → own chunk), `node --test` for pure logic, Chrome for visual checks.

**Spec:** `docs/superpowers/specs/2026-09-09-training-3d-scenes-design.md`

## Global Constraints

- All CSS goes in `src/style.css`. No per-component `<style>`.
- Only `three` is added as a dependency. It must load via dynamic `import()` so heist mode never downloads it.
- No WebGL (or the import fails) ⇒ the step renders exactly as today. No console errors.
- `prefers-reduced-motion: reduce` ⇒ no auto-orbit, pointers snap instead of slide.
- Scenes only on `trace` and `explain` steps. Validator fails a `scene` on spot/blank/mini.
- Wave 1 kind: `cells` only. Unknown kind ⇒ `resolve()` returns `null`, nothing renders.
- Pointer values must be `None` or an integer in `[-1, len]` (`-1` = walked off the front, `len` = past the end). Out of range fails validation.
- Cell text is at most 6 characters, longer values get `…` (spec amended from 4 to fit `torch`, `cutter`).
- Colours from `:root` tokens: panel `#0c162e`, edge `#3fa9ff`, glow `#7fd4ff`, violet `#8b5cf6`, ok `#5ef0b0`, gold `#ffb454`, faint `#2a3b5e`, dim `#6e83a6`.
- Explain-step prose, missions and hints never name the technique; scene `labels` use Marguerite's words already in that lesson's prose.
- Run `npm run check && npm test` after every content change. Commit after every task.

---

### Task 1: Spec amendments the data forces

**Files:**
- Modify: `docs/superpowers/specs/2026-09-09-training-3d-scenes-design.md`

The frame dump of the fifteen wave-1 items showed four things the spec did not allow: `digit-arrays` and `sorting` run a pointer to `-1`; `loops`, `tracking`, `sets`, `bits`, `heaps` have no index pointer but do have a current *value*; `sliding-window` has only the right edge `r` in state; `tool-list` cells read `torch`/`cutter`. Amend the spec before code so it stays the source of truth.

- [ ] **Step 1: Amend the descriptor shape**

In the "Scene descriptor" code block, replace the block with:

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

- [ ] **Step 2: Amend the rules list**

Replace the bullet starting "`data` as a literal draws" with:

```
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
```

Replace "anything else is stringified and truncated to four characters" with "anything else is stringified and truncated to six characters with `…`".

- [ ] **Step 3: Amend the validator section**

Add bullets:

```
- When `data` is a state key, `init` is present and is an array or string.
- `marks` keys each appear in at least one frame (trace) or state (explain).
- Pointer and range ints are in `[-1, len]` where `len` is the row length at that
  frame (after applying the frame's own list if `data` is a key).
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-09-09-training-3d-scenes-design.md
git commit -m "docs(spec): 3D scenes — init, marks, window ranges, -1 pointers, 6-char cells"
```

---

### Task 2: Pure scene model

**Files:**
- Create: `src/scene/model.js`
- Test: `tests/scene-model.test.mjs`

**Interfaces:**
- Produces: `KINDS` (array), `CELL_TEXT_MAX = 6`, `cellText(v) → string`, `normalize(scene) → scene` (pointers object → keys + `states`), `resolve(scene, state, prev) → Resolved | null` where
  `Resolved = { kind: 'cells', cells: [{ index, text }], pointers: [{ key, index, label }], ranges: [{ from, to }], marks: number[], changed: number[], source }`.
- Later tasks: `cells.js` consumes `Resolved`; the validator uses `resolve` and `normalize`; `StepExplain.vue` uses `normalize(scene).states`.

- [ ] **Step 1: Write the failing tests**

```js
// tests/scene-model.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { KINDS, CELL_TEXT_MAX, cellText, normalize, resolve } from '../src/scene/model.js'

const two = { kind: 'cells', data: [1, 3, 4, 6, 9], pointers: ['i', 'j'], labels: { i: 'small hand' } }

test('constants: cells is the one wave-1 kind; text caps at six', () => {
  assert.deepEqual(KINDS, ['cells'])
  assert.equal(CELL_TEXT_MAX, 6)
})

test('cellText: Python-looking text for the values traces carry', () => {
  assert.equal(cellText(7), '7')
  assert.equal(cellText('a'), 'a')
  assert.equal(cellText(true), 'True')
  assert.equal(cellText(null), 'None')
  assert.equal(cellText('cutter'), 'cutter')
  assert.equal(cellText('longword'), 'longw…')
  assert.equal(cellText({ py: '(1, 3)' }), '(1, 3)')
})

test('resolve: literal data, pointers with labels, unknown keys hidden', () => {
  const r = resolve(two, { i: 0, j: 4, s: 10 })
  assert.equal(r.kind, 'cells')
  assert.deepEqual(r.cells.map(c => c.text), ['1', '3', '4', '6', '9'])
  assert.deepEqual(r.pointers, [{ key: 'i', index: 0, label: 'i · small hand' }, { key: 'j', index: 4, label: 'j' }])
  assert.deepEqual(r.ranges, [])
  assert.deepEqual(r.marks, [])
  assert.deepEqual(r.changed, [0, 1, 2, 3, 4])   // no prev: everything is new
})

test('resolve: pointer missing from state or None is hidden; -1 and len are kept', () => {
  assert.deepEqual(resolve(two, { j: null }).pointers, [])
  assert.deepEqual(resolve(two, { i: -1, j: 5 }).pointers.map(p => p.index), [-1, 5])
  assert.deepEqual(resolve(two, { i: 7 }).pointers, [])   // out of range: hidden (validator will fail it)
})

test('resolve: string data is one cell per character', () => {
  const r = resolve({ kind: 'cells', data: 'HB44' }, {})
  assert.deepEqual(r.cells.map(c => c.text), ['H', 'B', '4', '4'])
})

test('resolve: data as a state key reads the frame, falls back to prev, then init', () => {
  const sc = { kind: 'cells', data: 'nums', init: [0, 4, 0, 7], pointers: ['w'] }
  const r0 = resolve(sc, { w: 0 })
  assert.deepEqual(r0.cells.map(c => c.text), ['0', '4', '0', '7'])
  const r1 = resolve(sc, { w: 1, nums: [4, 4, 0, 7] }, r0)
  assert.deepEqual(r1.cells.map(c => c.text), ['4', '4', '0', '7'])
  assert.deepEqual(r1.changed, [0])
  const r2 = resolve(sc, { w: 2 }, r1)               // frame without the key: previous list stays
  assert.deepEqual(r2.cells.map(c => c.text), ['4', '4', '0', '7'])
  assert.deepEqual(r2.changed, [])
})

test('resolve: changed compares by index against prev and grows/shrinks safely', () => {
  const sc = { kind: 'cells', data: 'heap', init: [] }
  const r0 = resolve(sc, { heap: [5] })
  assert.deepEqual(r0.changed, [0])
  const r1 = resolve(sc, { heap: [1, 5] }, r0)
  assert.deepEqual(r1.changed, [0, 1])
  const r2 = resolve(sc, { heap: [4, 5] }, r1)
  assert.deepEqual(r2.changed, [0])
})

test('resolve: ranges from keys, ints, and a window ending at a key; clamped; inverted dropped', () => {
  const sc = { kind: 'cells', data: [2, 1, 5, 1, 3], ranges: [['lo', 'hi'], [0, 1], { end: 'r', width: 3 }] }
  const r = resolve(sc, { lo: 3, hi: 9, r: 4 })
  assert.deepEqual(r.ranges, [{ from: 3, to: 4 }, { from: 0, to: 1 }, { from: 2, to: 4 }])
  assert.deepEqual(resolve(sc, { lo: 4, hi: 1, r: 0 }).ranges, [{ from: 0, to: 1 }, { from: 0, to: 0 }])
  assert.deepEqual(resolve(sc, {}).ranges, [{ from: 0, to: 1 }])
})

test('resolve: marks light every cell whose text equals the value', () => {
  const r = resolve({ kind: 'cells', data: [4, 7, 4], marks: ['n'] }, { n: 4 })
  assert.deepEqual(r.marks, [0, 2])
  assert.deepEqual(resolve({ kind: 'cells', data: [4, 7, 4], marks: ['n'] }, {}).marks, [])
})

test('resolve: unknown kind is null', () => {
  assert.equal(resolve({ kind: 'tree', data: [] }, {}), null)
})

test('normalize: pointer object becomes keys plus a one-state loop; arrays pass through', () => {
  const n = normalize({ kind: 'cells', data: [1, 2], pointers: { i: 0, j: 1 } })
  assert.deepEqual(n.pointers, ['i', 'j'])
  assert.deepEqual(n.states, [{ i: 0, j: 1 }])
  const m = normalize({ kind: 'cells', data: 'HB', ranges: [[0, 1]] })
  assert.deepEqual(m.states, [{}])
  assert.deepEqual(normalize(two).states, [{}])
  assert.deepEqual(normalize({ ...two, states: [{ i: 1 }] }).states, [{ i: 1 }])
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/scene-model.test.mjs`
Expected: FAIL, `Cannot find module '.../src/scene/model.js'`.

- [ ] **Step 3: Implement the model**

```js
// src/scene/model.js
// Pure: turn a scene descriptor plus one frame's state into a picture the renderer can draw.
// No DOM, no three. See docs/superpowers/specs/2026-09-09-training-3d-scenes-design.md.

export const KINDS = ['cells']
export const CELL_TEXT_MAX = 6
// A string `data` is a state key when it looks like an identifier; content literals ('HB4417') never do.
export const KEY_RE = /^[a-z_][a-z0-9_]*$/

// Text for one cell, Python-flavoured like the state panel.
export function cellText(v) {
  let s
  if (v === null || v === undefined) s = 'None'
  else if (v === true) s = 'True'
  else if (v === false) s = 'False'
  else if (typeof v === 'object' && typeof v.py === 'string') s = v.py
  else if (typeof v === 'object') s = JSON.stringify(v)
  else s = String(v)
  return s.length > CELL_TEXT_MAX ? s.slice(0, CELL_TEXT_MAX - 1) + '…' : s
}

// Explain steps have no frames. Give every scene a `states` loop (length 1 = static)
// and make `pointers` always an array of keys.
export function normalize(scene) {
  if (!scene) return scene
  const p = scene.pointers
  if (p && !Array.isArray(p) && typeof p === 'object') {
    return { ...scene, pointers: Object.keys(p), states: scene.states ?? [{ ...p }] }
  }
  return { ...scene, states: scene.states?.length ? scene.states : [{}] }
}

const isList = v => Array.isArray(v) || typeof v === 'string'
const toCells = src => Array.from(src, (v, index) => ({ index, text: cellText(v) }))

// The row for this frame: the literal; else the frame's own list, else the previous frame's, else init.
function rowFor(scene, state, prev) {
  const d = scene.data
  if (Array.isArray(d)) return d
  if (typeof d === 'string' && !KEY_RE.test(d)) return d
  const v = state?.[d]
  if (isList(v)) return v
  if (prev?.source !== undefined) return prev.source
  return scene.init ?? []
}

const intAt = (state, k) => (typeof k === 'number' ? k : state?.[k])
const inRow = (v, len) => Number.isInteger(v) && v >= -1 && v <= len

export function resolve(scene, state = {}, prev = null) {
  if (!scene || scene.kind !== 'cells') return null
  const source = rowFor(scene, state, prev)
  const cells = toCells(source)
  const len = cells.length

  const pointers = []
  for (const key of Array.isArray(scene.pointers) ? scene.pointers : []) {
    const v = state[key]
    if (!inRow(v, len)) continue
    const cap = scene.labels?.[key]
    pointers.push({ key, index: v, label: cap ? `${key} · ${cap}` : key })
  }

  const ranges = []
  for (const r of scene.ranges || []) {
    let from, to
    if (Array.isArray(r)) { from = intAt(state, r[0]); to = intAt(state, r[1]) }
    else if (r && typeof r === 'object') { to = intAt(state, r.end); from = Number.isInteger(to) ? to - (r.width ?? 1) + 1 : undefined }
    if (!Number.isInteger(from) || !Number.isInteger(to)) continue
    from = Math.max(0, from); to = Math.min(len - 1, to)
    if (from > to) continue
    ranges.push({ from, to })
  }

  const marks = []
  for (const key of scene.marks || []) {
    if (!(key in state) || state[key] === null || state[key] === undefined) continue
    const t = cellText(state[key])
    cells.forEach(c => { if (c.text === t && !marks.includes(c.index)) marks.push(c.index) })
  }
  marks.sort((a, b) => a - b)

  const changed = []
  if (prev?.kind === 'cells') {
    for (let i = 0; i < len; i++) if (prev.cells[i]?.text !== cells[i].text) changed.push(i)
  } else {
    cells.forEach(c => changed.push(c.index))
  }

  return { kind: 'cells', cells, pointers, ranges, marks, changed, source }
}
```

- [ ] **Step 4: Run the tests**

Run: `node --test tests/scene-model.test.mjs`
Expected: 11 pass.

Hand-check two subtleties: `resolve(two, { i: 7 })` gives no pointer (7 > len 5). `resolve({ kind:'cells', data:'HB44' }, {})` gives four cells because `'HB44'` fails `KEY_RE` and is a literal.

- [ ] **Step 5: Commit**

```bash
git add src/scene/model.js tests/scene-model.test.mjs
git commit -m "feat(scene): pure model that resolves a cells scene from a frame's state"
```

---

### Task 3: Constructor option and validator rules

**Files:**
- Modify: `src/data/training/node.js:13` (the `trace` constructor)
- Create: `src/scene/validate.js`
- Modify: `scripts/check-training.mjs:4,12-14` (import; first line of `validateStep`)
- Test: `tests/scene-validate.test.mjs`

**Interfaces:**
- Consumes: `resolve`, `normalize`, `KINDS`, `KEY_RE` from `src/scene/model.js`.
- Produces: `sceneErrors(step) → string[]` (empty = valid). `trace(code, input, frames, opts = {})` spreads `opts` (so `{ scene }` lands on the step).

- [ ] **Step 1: Write the failing tests**

```js
// tests/scene-validate.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sceneErrors } from '../src/scene/validate.js'

const frames = (...states) => states.map(state => ({ line: 1, state, ask: Object.keys(state)[0] ?? 'x', note: 'n' }))
const tr = (scene, ...states) => ({ type: 'trace', code: 'x', input: 'f()', frames: frames(...states), scene })
const ex = scene => ({ type: 'explain', lines: ['a', '“b”'], scene })

test('no scene: no errors; scene on spot/blank/mini: error', () => {
  assert.deepEqual(sceneErrors({ type: 'trace', frames: [] }), [])
  assert.match(sceneErrors({ type: 'spot', scene: { kind: 'cells', data: [1] } })[0], /spot/)
})

test('unknown kind and bad data fail', () => {
  assert.match(sceneErrors(ex({ kind: 'tree', data: [1] }))[0], /kind/)
  assert.match(sceneErrors(ex({ kind: 'cells', data: 5 }))[0], /data/)
  assert.match(sceneErrors(ex({ kind: 'cells', data: [] }))[0], /empty/)
})

test('data as a key needs init and the key in at least one frame', () => {
  assert.match(sceneErrors(tr({ kind: 'cells', data: 'nums' }, { w: 0 }, { w: 1 }, { w: 1 }))[0], /init/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: 'nums', init: [1] }, { w: 0 }, { w: 1 }, { w: 1 }))[0], /never appears/)
  assert.deepEqual(sceneErrors(tr({ kind: 'cells', data: 'nums', init: [1, 2] }, { w: 0 }, { nums: [2, 1] }, { w: 1 })), [])
})

test('pointer keys must appear somewhere and stay in [-1, len]', () => {
  const good = tr({ kind: 'cells', data: [1, 2, 3], pointers: ['i'] }, { i: -1 }, { i: 0 }, { i: 3 })
  assert.deepEqual(sceneErrors(good), [])
  const never = tr({ kind: 'cells', data: [1, 2, 3], pointers: ['i', 'q'] }, { i: 0 }, { i: 1 }, { i: 2 })
  assert.match(sceneErrors(never)[0], /'q' never/)
  const far = tr({ kind: 'cells', data: [1, 2, 3], pointers: ['i'] }, { i: 0 }, { i: 4 }, { i: 1 })
  assert.match(sceneErrors(far)[0], /frame 1/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1], pointers: 'i' }, { i: 0 }, { i: 0 }, { i: 0 }))[0], /pointers/)
})

test('len tracks the frame list when data is a key', () => {
  const s = tr({ kind: 'cells', data: 'heap', init: [], marks: ['x'] }, { x: 5, heap: [5] }, { x: 1, heap: [1, 5] }, { x: 4, heap: [4, 5] })
  assert.deepEqual(sceneErrors(s), [])
  const p = tr({ kind: 'cells', data: 'heap', init: [], pointers: ['i'] }, { i: 0, heap: [5] }, { i: 2, heap: [1, 5] }, { i: 1, heap: [4, 5] })
  assert.deepEqual(sceneErrors(p), [])   // i: 2 with len 2 is "past the end", allowed
})

test('ranges, marks, labels', () => {
  assert.deepEqual(sceneErrors(tr({ kind: 'cells', data: [1, 2, 3], ranges: [['lo', 'hi'], [0, 1], { end: 'r', width: 2 }] }, { lo: 0, hi: 2, r: 1 }, { lo: 1, hi: 2 }, { r: 2 })), [])
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1, 2], ranges: [['lo', 'hi']] }, { lo: 0, hi: 9 }, { lo: 0 }, { lo: 0 }))[0], /'hi'.*frame 0/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1, 2], ranges: [{ width: 2 }] }, { r: 1 }, { r: 1 }, { r: 1 }))[0], /range/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1, 2], marks: ['n'] }, { a: 1 }, { a: 1 }, { a: 1 }))[0], /'n' never/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1, 2], pointers: ['i'], labels: { j: 'x' } }, { i: 0 }, { i: 0 }, { i: 0 }))[0], /labels/)
})

test('explain: pointers as object or states loop are checked against literal data; states must be non-empty', () => {
  assert.deepEqual(sceneErrors(ex({ kind: 'cells', data: [1, 2, 3], pointers: { i: 0, j: 3 } })), [])
  assert.match(sceneErrors(ex({ kind: 'cells', data: [1, 2, 3], pointers: { i: 4 } }))[0], /state 0/)
  assert.deepEqual(sceneErrors(ex({ kind: 'cells', data: [1, 2, 3], pointers: ['i'], states: [{ i: 0 }, { i: 2 }] })), [])
  assert.match(sceneErrors(ex({ kind: 'cells', data: [1, 2, 3], pointers: ['i'], states: [] }))[0], /states/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1], states: [{}] }, { i: 0 }, { i: 0 }, { i: 0 }))[0], /states.*explain/)
  assert.deepEqual(sceneErrors(ex({ kind: 'cells', data: 'nums', init: [0, 4], pointers: ['w'], states: [{ w: 0 }, { w: 1, nums: [4, 4] }] })), [])
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/scene-validate.test.mjs`
Expected: FAIL, cannot find `src/scene/validate.js`.

- [ ] **Step 3: Implement `validate.js`**

```js
// src/scene/validate.js
// Content-time checks for a step's `scene`. Pure; used by scripts/check-training.mjs and tests.
import { KINDS, KEY_RE, normalize, resolve } from './model.js'

const isList = v => Array.isArray(v) || typeof v === 'string'
const keyish = v => typeof v === 'string'

export function sceneErrors(step) {
  const sc = step?.scene
  if (!sc) return []
  const errs = []
  const bad = m => errs.push(`scene: ${m}`)
  if (step.type !== 'trace' && step.type !== 'explain') { bad(`not allowed on a ${step.type} step`); return errs }
  if (!KINDS.includes(sc.kind)) { bad(`unknown kind '${sc.kind}'`); return errs }

  // data / init
  const dataIsKey = typeof sc.data === 'string' && KEY_RE.test(sc.data)
  if (!isList(sc.data)) bad('data must be a list, a string, or a state key')
  else if (!dataIsKey && sc.data.length === 0) bad('data is empty')
  if (dataIsKey && !isList(sc.init)) bad(`data is the state key '${sc.data}' so init (the list before the first frame) is required`)

  // shapes
  if (sc.pointers !== undefined && !Array.isArray(sc.pointers) && (typeof sc.pointers !== 'object' || sc.pointers === null)) bad('pointers must be an array of state keys or an object of ints')
  if (step.type === 'trace' && sc.pointers && !Array.isArray(sc.pointers)) bad('pointers on a trace must be an array of state keys')
  if (step.type === 'trace' && sc.states) bad('states only belong on an explain scene')
  if (step.type === 'explain' && sc.states !== undefined && (!Array.isArray(sc.states) || sc.states.length === 0)) bad('states must be a non-empty array')
  for (const r of sc.ranges || []) {
    const ok = (Array.isArray(r) && r.length === 2 && r.every(x => keyish(x) || Number.isInteger(x)))
      || (r && typeof r === 'object' && !Array.isArray(r) && (keyish(r.end) || Number.isInteger(r.end)))
    if (!ok) bad(`range ${JSON.stringify(r)} must be [a, b] or { end, width }`)
  }
  const n = normalize(sc)
  const pointerKeys = Array.isArray(n.pointers) ? n.pointers : []
  for (const k of Object.keys(sc.labels || {})) if (!pointerKeys.includes(k)) bad(`labels names '${k}' which is not a pointer`)
  if (errs.length) return errs

  // Walk the frames (trace) or states (explain) the way the renderer will.
  const states = step.type === 'trace' ? (step.frames || []).map(f => f.state || {}) : n.states
  const where = step.type === 'trace' ? 'frame' : 'state'
  const keyed = [...pointerKeys, ...(sc.marks || []), ...(dataIsKey ? [sc.data] : [])]
  for (const r of sc.ranges || []) for (const x of Array.isArray(r) ? r : [r.end]) if (keyish(x)) keyed.push(x)
  for (const k of new Set(keyed)) if (!states.some(st => k in st)) bad(`'${k}' never appears in any ${where}`)

  let prev = null
  states.forEach((st, k) => {
    const r = resolve({ ...n, states: undefined }, st, prev)
    const len = r.cells.length
    const check = (key, v) => {
      if (v === null || v === undefined) return
      if (!(Number.isInteger(v) && v >= -1 && v <= len)) bad(`'${key}' is ${JSON.stringify(v)} at ${where} ${k}, outside -1..${len}`)
    }
    for (const key of pointerKeys) if (key in st) check(key, st[key])
    for (const rg of sc.ranges || []) {
      const ends = Array.isArray(rg) ? rg : [rg.end]
      for (const x of ends) if (keyish(x) && x in st) check(x, st[x])
      for (const x of ends) if (Number.isInteger(x)) check(String(x), x)
    }
    prev = r
  })
  return errs
}
```

- [ ] **Step 4: Run the tests**

Run: `node --test tests/scene-model.test.mjs tests/scene-validate.test.mjs`
Expected: 18 pass. If the "explain pointers object" case reports `'i' never appears`: `normalize` must have produced `states: [{ i: 0, j: 3 }]` — check `normalize` is called before the `keyed` loop (it is, `n` is defined above).

- [ ] **Step 5: Add the option to `trace()` and call the validator**

In `src/data/training/node.js` replace the `trace` comment and line:

```js
// trace(code, input, frames, { scene? })   frames: [{ line, state, ask, note }]
export const trace = (code, input, frames, opts = {}) => ({ type: 'trace', code, input, frames, ...opts })
```

In `scripts/check-training.mjs` add after the `MOVES` import:

```js
import { sceneErrors } from '../src/scene/validate.js'
```

and at the top of `validateStep`, right after `const at = …`:

```js
  for (const e of sceneErrors(s)) fail(`${at}: ${e}`)
```

- [ ] **Step 6: Run the whole check and test suite**

Run: `npm run check && npm test`
Expected: check passes (no content has scenes yet); tests pass (32 existing + 18 new).

- [ ] **Step 7: Commit**

```bash
git add src/data/training/node.js src/scene/validate.js scripts/check-training.mjs tests/scene-validate.test.mjs
git commit -m "feat(scene): trace() options, scene validator wired into check-training"
```

---

### Task 4: Three.js stage

**Files:**
- Modify: `package.json` (add dependency)
- Create: `src/scene/stage.js`

**Interfaces:**
- Produces: `preload() → Promise<{ THREE, OrbitControls }>`; `COLORS`; `createStage(host: HTMLElement) → Promise<Stage>` where
  `Stage = { THREE, scene, camera, renderer, controls, reduced, frameCells(count), onTick(fn), start(), stop(), dispose() }`.
  Throws if WebGL is unavailable.
- `frameCells(count)` places the camera to show `count` unit-spaced cells centred on x = 0.

- [ ] **Step 1: Add the dependency**

Run: `npm install three@^0.186.0`
Expected: `package.json` gains `"three": "^0.186.0"` under `dependencies`; `package-lock.json` updates.

- [ ] **Step 2: Write `stage.js`**

```js
// src/scene/stage.js
// Renderer, camera, lights, floor and orbit for "the table". Browser only; loads three lazily so
// heist mode never downloads it. One stage per mounted SceneView.

let mods = null
export function preload() {
  mods ??= Promise.all([import('three'), import('three/examples/jsm/controls/OrbitControls.js')])
    .then(([THREE, oc]) => ({ THREE, OrbitControls: oc.OrbitControls }))
  return mods
}

export const COLORS = { panel: 0x0c162e, edge: 0x3fa9ff, glow: 0x7fd4ff, violet: 0x8b5cf6, ok: 0x5ef0b0, gold: 0xffb454, faint: 0x2a3b5e, grid: 0x172542 }
const C = COLORS

export async function createStage(host) {
  const { THREE, OrbitControls } = await preload()
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })   // throws without WebGL
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  scene.add(new THREE.HemisphereLight(0x9fc8ff, 0x0a1020, 1.1))
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(4, 8, 6); scene.add(key)
  const grid = new THREE.GridHelper(24, 24, C.faint, C.grid); grid.position.y = -0.5; scene.add(grid)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.enableDamping = true
  controls.minDistance = 3
  controls.maxDistance = 24
  controls.maxPolarAngle = Math.PI * 0.49
  controls.autoRotate = !reduced
  controls.autoRotateSpeed = 1.5           // one turn in ~40 s

  function frameCells(count) {
    const span = Math.max(count, 3)
    const dist = span * 0.95 + 3
    camera.position.set(dist * 0.35, dist * 0.55, dist * 0.95)
    controls.target.set(0, 0, 0)
    controls.update()
  }

  function resize() {
    const w = host.clientWidth, h = host.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize); ro.observe(host); resize()

  // Render loop: only while running, on screen, and the tab is visible.
  const ticks = new Set()
  let raf = 0, running = false, onScreen = true
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting }, { threshold: 0 }); io.observe(host)
  const onVis = () => { if (running && !document.hidden && !raf) loop() }
  document.addEventListener('visibilitychange', onVis)
  let last = performance.now()
  function loop(now = performance.now()) {
    raf = 0
    if (!running || document.hidden) return
    const dt = Math.min(0.1, (now - last) / 1000); last = now
    if (onScreen) {
      for (const fn of ticks) fn(dt, now)
      controls.update()
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(loop)
  }
  const start = () => { if (running) return; running = true; last = performance.now(); loop() }
  const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0 }

  function dispose() {
    stop()
    ro.disconnect(); io.disconnect()
    document.removeEventListener('visibilitychange', onVis)
    controls.dispose()
    scene.traverse(o => {
      o.geometry?.dispose?.()
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
      for (const m of mats) { m.map?.dispose?.(); m.dispose?.() }
    })
    renderer.dispose()
    renderer.domElement.remove()
  }

  return { THREE, scene, camera, renderer, controls, reduced, frameCells, onTick: fn => ticks.add(fn), start, stop, dispose }
}
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build 2>&1 | tail -6`
Expected: build passes. No `three` chunk yet (nothing imports `stage.js`); that is checked in Task 6.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/scene/stage.js
git commit -m "feat(scene): three.js stage — lazy import, camera, lights, orbit, disposal"
```

---

### Task 5: Cells renderer

**Files:**
- Create: `src/scene/cells.js`

**Interfaces:**
- Consumes: `Stage` from Task 4, `Resolved` from Task 2.
- Produces: `createCells(stage) → { update(resolved, { instant = false } = {}), dispose() }`.

- [ ] **Step 1: Write `cells.js`**

```js
// src/scene/cells.js
// Draws a Resolved `cells` picture: a row of blocks, pointer pins, lit ranges, gold marks, and a
// green flash on cells whose value changed. Tweens pointer positions over 300 ms.
import { COLORS as C } from './stage.js'

const GAP = 1.0, SIZE = 0.8, TWEEN = 0.3, FLASH = 0.4
const PIN_BASE = SIZE / 2 + 1.5           // y of a pin group's origin above the row
const xOf = (i, n) => (i - (n - 1) / 2) * GAP
const ease = t => 1 - Math.pow(1 - t, 3)

// Canvas text → sprite material. Cached per (text, colour, size) so re-renders never re-rasterise.
function makeText(THREE, cache, text, color, px = 64) {
  const key = `${text}|${color}|${px}`
  if (cache.has(key)) return cache.get(key)
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128
  const g = cv.getContext('2d')
  g.font = `700 ${px}px "Rajdhani", system-ui, sans-serif`
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.shadowColor = color; g.shadowBlur = 12
  g.fillStyle = color; g.fillText(text, 128, 64, 240)
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  cache.set(key, mat)
  return mat
}

export function createCells(stage) {
  const { THREE, scene } = stage
  const cache = new Map()
  const group = new THREE.Group(); scene.add(group)
  const boxGeo = new THREE.BoxGeometry(SIZE, SIZE, SIZE)
  const edgeGeo = new THREE.EdgesGeometry(boxGeo)
  const pinGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.1, 12)
  const tipGeo = new THREE.ConeGeometry(0.11, 0.26, 16)
  const cells = []         // { mesh, edges, valueSprite, indexSprite, text, flashT, marked }
  const pins = new Map()   // key -> { group, sprite, x, fromX, t, label }
  const rangeMeshes = []
  let count = -1, elapsed = 0

  function buildCells(n) {
    for (const c of cells) group.remove(c.mesh, c.edges, c.valueSprite, c.indexSprite)
    cells.length = 0
    for (let i = 0; i < n; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.12, roughness: 0.35, metalness: 0.2 })
      const mesh = new THREE.Mesh(boxGeo, mat)
      const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.8 }))
      const valueSprite = new THREE.Sprite(makeText(THREE, cache, '', '#d7e6ff')); valueSprite.scale.set(1.1, 0.55, 1)
      const indexSprite = new THREE.Sprite(makeText(THREE, cache, String(i), '#6e83a6', 40)); indexSprite.scale.set(0.8, 0.4, 1)
      const x = xOf(i, n)
      mesh.position.set(x, 0, 0); edges.position.copy(mesh.position)
      valueSprite.position.set(x, SIZE / 2 + 0.36, 0)
      indexSprite.position.set(x, -SIZE / 2 + 0.02, SIZE / 2 + 0.42)
      group.add(mesh, edges, valueSprite, indexSprite)
      cells.push({ mesh, edges, valueSprite, indexSprite, text: null, flashT: 0, marked: false })
    }
    count = n
    stage.frameCells(n)
  }

  function pinFor(key) {
    if (pins.has(key)) return pins.get(key)
    const g = new THREE.Group()
    const beam = new THREE.Mesh(pinGeo, new THREE.MeshStandardMaterial({ color: C.violet, emissive: C.violet, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 }))
    beam.position.y = 0.55
    const tip = new THREE.Mesh(tipGeo, new THREE.MeshStandardMaterial({ color: C.violet, emissive: C.violet, emissiveIntensity: 1.2 }))
    tip.rotation.x = Math.PI; tip.position.y = -0.13
    const sprite = new THREE.Sprite(makeText(THREE, cache, key, '#c9b8ff', 44)); sprite.scale.set(1.9, 0.5, 1); sprite.position.y = 1.35
    g.add(beam, tip, sprite)
    g.position.y = PIN_BASE
    scene.add(g)
    const p = { group: g, sprite, x: 0, fromX: 0, t: 1, label: key }
    pins.set(key, p)
    return p
  }

  function baseLook(cell) {
    cell.mesh.material.emissive.setHex(cell.marked ? C.gold : C.edge)
    cell.mesh.material.emissiveIntensity = cell.marked ? 0.75 : 0.12
    cell.edges.material.color.setHex(cell.marked ? C.gold : C.edge)
  }

  function update(r, { instant = false } = {}) {
    if (!r) return
    const rebuilt = r.cells.length !== count
    if (rebuilt) buildCells(r.cells.length)
    const snap = instant || stage.reduced
    r.cells.forEach((c, i) => {
      const cell = cells[i]
      if (cell.text !== c.text) { cell.valueSprite.material = makeText(THREE, cache, c.text, '#d7e6ff'); cell.text = c.text }
      cell.marked = r.marks.includes(i)
      baseLook(cell)
      if (!snap && !rebuilt && r.changed.includes(i)) cell.flashT = FLASH
    })
    // Pins: show the ones present, slide them, hide the rest. Stack labels sharing a cell.
    const seen = new Set(), onCell = new Map()
    for (const p of r.pointers) {
      const pin = pinFor(p.key); seen.add(p.key)
      const x = xOf(p.index, count)
      if (pin.label !== p.label) { pin.sprite.material = makeText(THREE, cache, p.label, '#c9b8ff', 44); pin.label = p.label }
      if (!pin.group.visible || snap || rebuilt) { pin.x = pin.fromX = x; pin.t = 1; pin.group.position.x = x }
      else if (pin.x !== x) { pin.fromX = pin.group.position.x; pin.x = x; pin.t = 0 }
      pin.group.visible = true
      const k = onCell.get(p.index) ?? 0; onCell.set(p.index, k + 1)
      pin.sprite.position.y = 1.35 + k * 0.5
    }
    for (const [key, pin] of pins) if (!seen.has(key)) pin.group.visible = false
    // Ranges: thin lit plates under the covered cells.
    for (const m of rangeMeshes) { scene.remove(m); m.geometry.dispose(); m.material.dispose() }
    rangeMeshes.length = 0
    for (const g of r.ranges) {
      const w = (g.to - g.from) * GAP + SIZE + 0.24
      const plate = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, SIZE + 0.3),
        new THREE.MeshBasicMaterial({ color: C.glow, transparent: true, opacity: 0.22 }))
      plate.position.set((xOf(g.from, count) + xOf(g.to, count)) / 2, -SIZE / 2 - 0.02, 0)
      scene.add(plate); rangeMeshes.push(plate)
    }
  }

  stage.onTick(dt => {
    elapsed += dt
    for (const pin of pins.values()) {
      if (pin.t < 1) { pin.t = Math.min(1, pin.t + dt / TWEEN); pin.group.position.x = pin.fromX + (pin.x - pin.fromX) * ease(pin.t) }
      pin.group.position.y = PIN_BASE + Math.sin(elapsed * 2.2) * 0.04
    }
    for (const cell of cells) {
      if (cell.flashT > 0) {
        cell.flashT = Math.max(0, cell.flashT - dt)
        const k = cell.flashT / FLASH
        cell.mesh.material.emissive.setHex(C.ok); cell.mesh.material.emissiveIntensity = 0.12 + 0.9 * k
        if (cell.flashT === 0) baseLook(cell)
      }
    }
  })

  function dispose() {
    for (const m of rangeMeshes) { m.geometry.dispose(); m.material.dispose() }
    for (const mat of cache.values()) { mat.map.dispose(); mat.dispose() }
    boxGeo.dispose(); edgeGeo.dispose(); pinGeo.dispose(); tipGeo.dispose()
    scene.remove(group); for (const p of pins.values()) scene.remove(p.group)
  }

  return { update, dispose }
}
```

Behaviour notes: a rebuild (row length changed) snaps pins and skips the flash so a growing heap does not flash every cell; a flash on a marked cell returns to gold when it ends (`baseLook`).

- [ ] **Step 2: Build**

Run: `npm run build 2>&1 | tail -4`
Expected: passes (still unreferenced from the app).

- [ ] **Step 3: Commit**

```bash
git add src/scene/cells.js
git commit -m "feat(scene): cells renderer — blocks, pins, ranges, marks, change flash"
```

---

### Task 6: SceneView, step wiring, CSS, first content (two-pointers) and browser check

**Files:**
- Create: `src/scene/SceneView.vue`
- Modify: `src/components/StepTrace.vue` (import + one element)
- Modify: `src/components/StepExplain.vue` (script + one element)
- Modify: `src/components/LessonWindow.vue:1-12` (prefetch)
- Modify: `src/style.css` (after the `.var.ask code` rule, line ~214)
- Modify: `src/data/training/two-pointers.js` (explain[1] and trace get `scene`)

**Interfaces:**
- Consumes: `createStage`, `preload` (Task 4); `createCells` (Task 5); `resolve`, `normalize` (Task 2).
- Produces: `<SceneView :scene :state />`. Props: `scene` (Object, required), `state` (Object, default `{}`).

- [ ] **Step 1: Write `SceneView.vue`**

```vue
<script setup>
// The table: a lazy Three.js view of one scene descriptor at one state. Falls back to nothing
// (v-if="ok") when three cannot load or WebGL is unavailable, leaving the step exactly as before.
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { resolve } from '../scene/model.js'
const props = defineProps({ scene: { type: Object, required: true }, state: { type: Object, default: () => ({}) } })
const host = ref(null)
const ok = ref(true)
let stage = null, cells = null, prev = null, dead = false

onMounted(async () => {
  try {
    const { createStage } = await import('../scene/stage.js')
    const { createCells } = await import('../scene/cells.js')
    if (dead) return
    stage = await createStage(host.value)
    if (dead) { stage.dispose(); stage = null; return }
    cells = createCells(stage)
    prev = resolve(props.scene, props.state, null)
    cells.update(prev, { instant: true })
    stage.start()
  } catch (e) {
    if (import.meta.env.DEV) console.warn('The table could not open (no WebGL?):', e)
    ok.value = false
  }
})
watch(() => [props.scene, props.state], ([scene, state]) => {
  if (!cells) return
  const r = resolve(scene, state, prev)
  if (!r) return
  cells.update(r)
  prev = r
}, { deep: true })
onBeforeUnmount(() => { dead = true; cells?.dispose(); stage?.dispose(); cells = stage = null })
</script>

<template>
  <div v-if="ok" class="table">
    <div class="table-cap"><i></i> The table <small>drag to turn · wheel to zoom</small></div>
    <div ref="host" class="table-host" aria-hidden="true"></div>
  </div>
</template>
```

- [ ] **Step 2: Wire the trace step**

In `src/components/StepTrace.vue` add to the imports:

```js
import SceneView from './SceneView.vue'
```

and as the first child inside `<div class="trace">` (before `<pre class="trace-code">`):

```html
    <SceneView v-if="step.scene" :scene="step.scene" :state="frame.state" />
```

- [ ] **Step 3: Wire the explain step**

Replace `src/components/StepExplain.vue` entirely:

```vue
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { normalize } from '../scene/model.js'
import SceneView from './SceneView.vue'
const props = defineProps({ step: { type: Object, required: true } })
// Explain scenes loop through `states` every 1.6 s (a single state just sits still).
const scene = computed(() => props.step.scene ? normalize(props.step.scene) : null)
const tick = ref(0)
let timer = null
onMounted(() => {
  if ((scene.value?.states.length ?? 0) > 1) timer = setInterval(() => { tick.value += 1 }, 1600)
})
onBeforeUnmount(() => clearInterval(timer))
const state = computed(() => scene.value ? scene.value.states[tick.value % scene.value.states.length] : {})
</script>

<template>
  <div class="story">
    <p v-for="(line, k) in step.lines" :key="k" :class="{ voice: line.startsWith('“') }">{{ line }}</p>
  </div>
  <SceneView v-if="scene" :scene="scene" :state="state" />
  <pre v-if="step.code">{{ step.code }}</pre>
</template>
```

- [ ] **Step 4: Prefetch three when a lesson with scenes opens**

In `src/components/LessonWindow.vue` change the Vue import to `import { computed, watch } from 'vue'` and add after `const isTool = …`:

```js
// Warm the three.js chunk as soon as a lesson with a scene opens, so the trace step never waits.
watch(() => s.activeNode.value?.id, () => {
  if (s.activeNode.value?.steps.some(st => st.scene)) import('../scene/stage.js').then(m => m.preload()).catch(() => {})
}, { immediate: true })
```

- [ ] **Step 5: CSS**

Append after `.var.ask code{…}` in `src/style.css`:

```css
  .table{border:1px solid rgba(63,169,255,.3);background:rgba(5,10,22,.55);display:grid}
  .trace .table{grid-column:1/-1}
  .table-cap{display:flex;align-items:center;gap:8px;padding:6px 12px;color:var(--glow);font-weight:700;font-size:13px;letter-spacing:.06em;border-bottom:1px solid rgba(63,169,255,.18)}
  .table-cap i{width:6px;height:6px;background:var(--glow);box-shadow:0 0 8px var(--glow);transform:rotate(45deg)}
  .table-cap small{margin-left:auto;color:var(--faint);font-weight:500;letter-spacing:0}
  .table-host{height:260px;position:relative;cursor:grab}
  .table-host:active{cursor:grabbing}
  .table-host canvas{display:block;width:100%!important;height:100%!important}
  @media (max-width:700px){.table-host{height:200px}}
```

- [ ] **Step 6: First content — two-pointers**

In `src/data/training/two-pointers.js`, the second `explain([...], { move: 'name the waste', code: …})`: add to its options object, after the `code:` template string, a `scene`:

```js
      scene: { kind: 'cells', data: [1, 3, 4, 6, 9], pointers: ['i', 'j'], labels: { i: 'small hand', j: 'big hand' },
        states: [{ i: 0, j: 4 }, { i: 0, j: 3 }, { i: 1, j: 3 }] },
```

and give the `trace(...)` a fourth argument after the frames array's closing `]`:

```js
      { scene: { kind: 'cells', data: [1, 3, 4, 6, 9], pointers: ['i', 'j'], labels: { i: 'small hand', j: 'big hand' } } }),
```

- [ ] **Step 7: Check, test, build, look at the chunk**

Run: `npm run check && npm test && npm run build 2>&1 | grep -E "\.js|✓ built"`
Expected: check passes; tests pass; the build lists a separate chunk for the stage/three (hundreds of kB) beside `index-*.js` and `pyworker-*.js`, and `✓ built`.

- [ ] **Step 8: Browser check**

Run `npx vite --port 5199 --strictPort` in the background and open `http://localhost:5199/` in Chrome. Create a save file. Seed progress in the DevTools console so the lesson is open, then reload:

```js
const f = JSON.parse(localStorage.getItem('ledger-saves-v1'))
const s = f.slots.find(x => x.id === f.current)
s.data.mode = 'training'
s.data.training.nodes.method = { step: 0, cleared: true }
for (const t of ['tool-list', 'tool-string']) s.data.training.tools[t] = { step: 0, cleared: true }
localStorage.setItem('ledger-saves-v1', JSON.stringify(f)); location.reload()
```

(If the two-pointers lesson still shows `needs: …`, add the named lessons/tools to `nodes`/`tools` the same way.) Open tier F → the two-pointers lesson. Confirm:
1. Step 2 (explain with code) shows "The table" with five blocks and two violet pins labelled `i · small hand` and `j · big hand`, moving every 1.6 s.
2. Step 3 (trace): pins on 0 and 4. Type `4` for `j`, `10` for `s`, then `3` for `j`: the big hand slides left one cell.
3. Drag turns the table; wheel zooms. With DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` and a reload, the table does not turn on its own.
4. WebGL-off fallback: in the console run `HTMLCanvasElement.prototype.getContext = () => null`, then Back and Next to re-enter the step. The step shows without "The table" and with no console errors (a dev-only warning is fine).
5. Network panel: the three-bearing chunk is requested only after opening the lesson, never on the heist screen.
6. No console errors.

Stop the dev server afterwards.

- [ ] **Step 9: Commit**

```bash
git add src/scene/SceneView.vue src/components/StepTrace.vue src/components/StepExplain.vue src/components/LessonWindow.vue src/style.css src/data/training/two-pointers.js
git commit -m "feat(training): the table — 3D scene on trace and explain steps, first on two-pointers"
```

---

### Task 7: Content batch A — index-pointer lessons

**Files:**
- Modify: `src/data/training/loops.js`, `arrays-in-place.js`, `binary-search.js`, `digit-arrays.js`, `sliding-window.js`, `rotation.js`, `sorting.js`

Each file: add `scene:` to the options object of the **second** `explain` (the one carrying `code:`), and a fourth argument `{ scene: … }` to `trace(...)`. Do not touch frames, asks or notes. Add `labels` only where the quoted word already appears in that file's explain lines (check with `grep -n "<word>" <file>`); otherwise leave labels out.

- [ ] **Step 1: loops**

```js
// explain[1]
scene: { kind: 'cells', data: [3, 5, 6, 7, 9], marks: ['n'], states: [{ n: 3 }, { n: 5 }, { n: 6 }, { n: 7 }, { n: 9 }] },
// trace 4th arg
{ scene: { kind: 'cells', data: [3, 5, 6, 7, 9], marks: ['n'] } }
```

- [ ] **Step 2: arrays-in-place**

```js
// explain[1]
scene: { kind: 'cells', data: 'nums', init: [0, 4, 0, 7], pointers: ['r', 'w'],
  states: [{ r: 0, w: 0, nums: [0, 4, 0, 7] }, { r: 1, w: 1, nums: [4, 4, 0, 7] }, { r: 3, w: 2, nums: [4, 7, 0, 7] }, { r: 3, w: 4, nums: [4, 7, 0, 0] }] },
// trace 4th arg
{ scene: { kind: 'cells', data: 'nums', init: [0, 4, 0, 7], pointers: ['r', 'w'] } }
```

If `grep -n "reader\|writer" src/data/training/arrays-in-place.js` finds both words in explain lines, add `labels: { r: 'reader', w: 'writer' }` to both scenes.

- [ ] **Step 3: binary-search**

```js
// explain[1]
scene: { kind: 'cells', data: [1, 3, 5, 7, 9, 11], pointers: ['lo', 'hi', 'mid'], ranges: [['lo', 'hi']],
  states: [{ lo: 0, hi: 5 }, { lo: 0, hi: 5, mid: 2 }, { lo: 3, hi: 5 }, { lo: 3, hi: 5, mid: 4 }] },
// trace 4th arg
{ scene: { kind: 'cells', data: [1, 3, 5, 7, 9, 11], pointers: ['lo', 'hi', 'mid'], ranges: [['lo', 'hi']] } }
```

- [ ] **Step 4: digit-arrays**

```js
// explain[1]
scene: { kind: 'cells', data: 'digits', init: [1, 9, 9], pointers: ['i'],
  states: [{ i: 2, digits: [1, 9, 9] }, { i: 2, digits: [1, 9, 0] }, { i: 1, digits: [1, 0, 0] }, { i: 0, digits: [2, 0, 0] }, { i: -1, digits: [2, 0, 0] }] },
// trace 4th arg
{ scene: { kind: 'cells', data: 'digits', init: [1, 9, 9], pointers: ['i'] } }
```

- [ ] **Step 5: sliding-window**

```js
// explain[1]
scene: { kind: 'cells', data: [2, 1, 5, 1, 3], pointers: ['r'], ranges: [{ end: 'r', width: 3 }],
  states: [{ r: 2 }, { r: 3 }, { r: 4 }] },
// trace 4th arg
{ scene: { kind: 'cells', data: [2, 1, 5, 1, 3], pointers: ['r'], ranges: [{ end: 'r', width: 3 }] } }
```

(The first two trace frames carry no `r`, so the window appears from stop 3 on. Acceptable.)

- [ ] **Step 6: rotation**

```js
// explain[1]
scene: { kind: 'cells', data: 'nums', init: [1, 2, 3, 4, 5], pointers: ['i', 'j'],
  states: [{ i: 0, j: 4, nums: [1, 2, 3, 4, 5] }, { i: 1, j: 3, nums: [5, 2, 3, 4, 1] }, { i: 2, j: 2, nums: [5, 4, 3, 2, 1] }] },
// trace 4th arg
{ scene: { kind: 'cells', data: 'nums', init: [1, 2, 3, 4, 5], pointers: ['i', 'j'] } }
```

- [ ] **Step 7: sorting**

```js
// explain[1]
scene: { kind: 'cells', data: 'nums', init: [3, 1, 2], pointers: ['i', 'j'],
  states: [{ i: 1, j: 0, nums: [3, 1, 2] }, { i: 1, j: -1, nums: [1, 3, 2] }, { i: 2, j: 1, nums: [1, 3, 3] }, { i: 2, j: 0, nums: [1, 2, 3] }] },
// trace 4th arg
{ scene: { kind: 'cells', data: 'nums', init: [3, 1, 2], pointers: ['i', 'j'] } }
```

- [ ] **Step 8: Check and test**

Run: `npm run check && npm test`
Expected: pass. Any `outside -1..len` message names the lesson, step, frame and key: fix the descriptor, never the frames.

- [ ] **Step 9: Browser spot-check**

Start the dev server, seed a save as in Task 6 Step 8 (mark the lesson you want as `cleared` in `training.nodes` if it is locked; cleared lessons reopen from the top), open `sorting` and `digit-arrays`. Confirm cells reorder with a green flash and the `i` pin in digit-arrays ends one slot left of the row on the last stop. Stop the server.

- [ ] **Step 10: Commit**

```bash
git add src/data/training/loops.js src/data/training/arrays-in-place.js src/data/training/binary-search.js src/data/training/digit-arrays.js src/data/training/sliding-window.js src/data/training/rotation.js src/data/training/sorting.js
git commit -m "content(training): table scenes for loops, in-place, binary search, digits, window, rotation, sorting"
```

---

### Task 8: Content batch B — value-mark lessons and the two tools

**Files:**
- Modify: `src/data/training/tracking.js`, `hash-maps.js`, `sets.js`, `heaps.js`, `bits.js`
- Modify: the two tool files for ids `tool-list` and `tool-string` under `src/data/training/tools/` (confirm names with `ls src/data/training/tools`)

Tools carry their code on the **first** explain (`explain code: true,false` in the frame dump), so the tool scene goes on `explain[0]`.

- [ ] **Step 1: tracking**

```js
// explain[1]
scene: { kind: 'cells', data: [7, 1, 5, 3, 6], marks: ['p', 'low'],
  states: [{ p: 7, low: 7 }, { p: 1, low: 1 }, { p: 5, low: 1 }, { p: 3, low: 1 }, { p: 6, low: 1 }] },
// trace 4th arg
{ scene: { kind: 'cells', data: [7, 1, 5, 3, 6], marks: ['p', 'low'] } }
```

- [ ] **Step 2: hash-maps**

```js
// explain[1]
scene: { kind: 'cells', data: [4, 7, 4], pointers: ['i'], marks: ['n'], states: [{ i: 0, n: 4 }, { i: 1, n: 7 }, { i: 2, n: 4 }] },
// trace 4th arg
{ scene: { kind: 'cells', data: [4, 7, 4], pointers: ['i'], marks: ['n'] } }
```

- [ ] **Step 3: sets**

```js
// explain[1]
scene: { kind: 'cells', data: [2, 5, 2], marks: ['n'], states: [{ n: 2 }, { n: 5 }, { n: 2 }] },
// trace 4th arg
{ scene: { kind: 'cells', data: [2, 5, 2], marks: ['n'] } }
```

- [ ] **Step 4: heaps**

```js
// explain[1]
scene: { kind: 'cells', data: 'heap', init: [], marks: ['x'],
  states: [{ x: 5, heap: [5] }, { x: 1, heap: [1, 5] }, { x: 4, heap: [1, 5, 4] }, { x: 4, heap: [4, 5] }] },
// trace 4th arg
{ scene: { kind: 'cells', data: 'heap', init: [], marks: ['x'] } }
```

- [ ] **Step 5: bits**

```js
// explain[1]
scene: { kind: 'cells', data: [3, 5, 3], marks: ['n'], states: [{ n: 3 }, { n: 5 }, { n: 3 }] },
// trace 4th arg
{ scene: { kind: 'cells', data: [3, 5, 3], marks: ['n'] } }
```

- [ ] **Step 6: tool-list**

```js
// explain[0]
scene: { kind: 'cells', data: 'crate', init: ['torch', 'cutter'],
  states: [{ crate: ['torch', 'cutter'] }, { crate: ['torch', 'cutter', 'radio'] }, { crate: ['jack', 'torch', 'cutter', 'radio'] }, { crate: ['jack', 'torch', 'cutter'] }] },
// trace 4th arg
{ scene: { kind: 'cells', data: 'crate', init: ['torch', 'cutter'] } }
```

- [ ] **Step 7: tool-string**

```js
// explain[0]
scene: { kind: 'cells', data: 'HB4417', ranges: [[0, 1], [2, 5]] },
// trace 4th arg
{ scene: { kind: 'cells', data: 'HB4417', ranges: [[0, 1], [2, 5]] } }
```

- [ ] **Step 8: Check and test**

Run: `npm run check && npm test`
Expected: pass. `'HB4417'` has uppercase so it is a literal, not a key.

- [ ] **Step 9: Browser spot-check**

Armoury → the list tool: the crate grows to four blocks and shrinks to three with flashes; the string tool shows two lit plates under `HB` and `4417`. Open `heaps`: the row starts empty and grows. Stop the server.

- [ ] **Step 10: Commit**

```bash
git add src/data/training/tracking.js src/data/training/hash-maps.js src/data/training/sets.js src/data/training/heaps.js src/data/training/bits.js src/data/training/tools
git commit -m "content(training): table scenes for tracking, hash maps, sets, heaps, bits, list and string tools"
```

---

### Task 9: Docs, final verification, push

**Files:**
- Modify: `CLAUDE.md` (Run, Layout, Training node schema sections)
- Modify: `docs/superpowers/specs/2026-09-09-training-3d-scenes-design.md` (Status line)

- [ ] **Step 1: CLAUDE.md**

Under **Layout** add:

```
- `src/scene/` — "the table", the 3D view on training steps. `model.js` (pure: descriptor + state → picture, unit-tested), `validate.js` (content rules, used by `check-training`), `stage.js` and `cells.js` (three.js, lazy-loaded), `SceneView.vue` (canvas host, hides itself without WebGL).
```

Under **Training node schema** add a bullet:

```
- `scene` — optional on `trace` (4th arg `{ scene }`) and `explain` (in the options). Wave 1 kind `cells`: `{ kind: 'cells', data: [..] | 'HB4417' | 'stateKey', init?, pointers?: ['i'], ranges?: [['lo','hi'] | [0,1] | { end:'r', width:3 }], marks?: ['n'], labels?: { i: 'small hand' }, states?: [...] }`. `states` is explain-only (a loop). Pointer ints must be in `-1..len`. Labels reuse words from that lesson's prose. See `docs/superpowers/specs/2026-09-09-training-3d-scenes-design.md`.
```

Under **Run**, change the check sentence to: "`npm run check` validates all gate and training data, including every `scene`."

- [ ] **Step 2: Spec status**

Change `Status: approved in brainstorm, awaiting implementation plan` to `Status: implemented (wave 1, cells) — see docs/superpowers/plans/2026-09-09-training-3d-scenes.md`.

- [ ] **Step 3: Full verification**

Run: `npm run check && npm test && npm run build 2>&1 | tail -8`
Expected: all pass; the build prints the app chunk and a separate three-bearing chunk. Run `npm run preview`, open it, go to Training, open one lesson with a scene and confirm the table renders in the production build. Confirm the heist screen makes no request for the three chunk. Stop the preview server.

- [ ] **Step 4: Commit and push**

```bash
git add CLAUDE.md docs/superpowers/specs/2026-09-09-training-3d-scenes-design.md
git commit -m "docs: the table — layout notes, scene schema, spec status"
git push
```

---

## Self-review notes

- **Spec coverage:** descriptor and rules (Tasks 1–3), lazy chunk + prefetch (4, 6), look (5), layout/CSS (6), fallbacks and disposal (4, 6), data flow (6), validation (3), model tests (2), browser checks (6–9), content for all fifteen items (6–8), rollout docs (9). Wave 2 is out of scope by design.
- **Types:** `Resolved` fields (`cells[].text`, `pointers[].{key,index,label}`, `ranges[].{from,to}`, `marks`, `changed`, `source`) are used identically in `model.js`, `cells.js`, `validate.js`. `Stage` fields (`THREE, scene, reduced, frameCells, onTick, start, stop, dispose`) match between `stage.js`, `cells.js` and `SceneView.vue`. `preload` and `COLORS` are exported from `stage.js` and consumed by `LessonWindow.vue` and `cells.js`. `KEY_RE` is exported from `model.js` and used by `validate.js`.
- **Judgement calls:** a string `data` is a state key only when it matches `/^[a-z_][a-z0-9_]*$/`; content literals (`'HB4417'`) never do. A row-length change snaps pins and skips flashes. Sliding-window shows its window only once `r` exists in state.
