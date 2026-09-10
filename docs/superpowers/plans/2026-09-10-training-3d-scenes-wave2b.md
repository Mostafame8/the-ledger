# Training 3D Scenes — Wave 2b Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two kinds to "the table": `grid` (flat tiles on the floor with a cursor pin, marks and heads; booleans as lit/dark tiles) and `line` (a number rail with lanes of interval bars, ticks, a span plate and value pins), and put scenes on nine more items.

**Architecture:** The violet pin and the canvas-text helper move into `pin.js` and `text.js` so row, grid and line share them (row.js unchanged visually). `model.js` gains `resolveGrid`/`resolveLine`; `validate.js` gains `gridErrors`/`lineErrors`; `grid.js` and `line.js` render; `SceneView.vue` dispatches through a kind map.

**Tech Stack:** Vue 3, Vite 5, three 0.186, `node --test`, Chrome for visual checks.

**Spec:** `docs/superpowers/specs/2026-09-10-training-3d-scenes-wave2b-design.md` (with waves 1 and 2a).

## Global Constraints

- No new dependencies; three only through `stage.js`'s dynamic import. No CSS changes. No auto-orbit or idle camera motion. No story-prop skins or emoji.
- `grid.data` is a rectangular 2-D list or a state key with a rectangular `init`; `cursor` is exactly two keys; cursor ints satisfy `0 ≤ r < rows`, `0 ≤ c < cols` wherever both keys are present; `True`/`False` tiles draw lit gold / dark with no text; row 0 is the far row.
- `line.axis` is two ascending ints; 1–2 lanes with unique labels; every literal bar, tick, pin and span value lies within the axis; bars have `start ≤ end`.
- Wave-1 and wave-2a scenes must render exactly as before after the pin extraction.
- The trace step keeps hiding the asked value (`sceneState` in `StepTrace.vue`); untouched here.
- Run `npm run check && npm test` after every content change. Commit after every task.

---

### Task 1: Extract `text.js` and `pin.js`; row.js uses them (no visual change)

**Files:**
- Create: `src/scene/text.js`, `src/scene/pin.js`
- Modify: `src/scene/row.js`

**Interfaces:**
- `text.js`: `makeText(THREE, cache, text, color, px = 64) → SpriteMaterial` (moved verbatim from row.js; row.js re-exports it so `rows.js` and any importer keep working).
- `pin.js`: `createPin(stage, parent, cache, label) → { group, sprite, setLabel(text), stack(k), show(targetVector3, snap), hide(), get visible, tick(dt, bob), dispose() }`.

- [ ] **Step 1: `text.js`**

```js
// src/scene/text.js
// Canvas text → sprite material. Cached per (text, colour, size) so re-renders never re-rasterise.
export function makeText(THREE, cache, text, color, px = 64) {
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
```

- [ ] **Step 2: `pin.js`**

```js
// src/scene/pin.js
// The violet pin: a beam with a glowing tip and a label sprite, tweened between targets over 300 ms.
// Shared by rows (above a cell / beside a pile cell), grids (above a tile) and lines (on the rail).
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'

export const TWEEN = 0.3
const ease = t => 1 - Math.pow(1 - t, 3)

export function createPin(stage, parent, cache, label) {
  const { THREE } = stage
  const pinGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.1, 12)
  const tipGeo = new THREE.ConeGeometry(0.11, 0.26, 16)
  const g = new THREE.Group()
  const beam = new THREE.Mesh(pinGeo, new THREE.MeshStandardMaterial({ color: C.violet, emissive: C.violet, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 }))
  beam.position.y = 0.55
  const tip = new THREE.Mesh(tipGeo, new THREE.MeshStandardMaterial({ color: C.violet, emissive: C.violet, emissiveIntensity: 1.2 }))
  tip.rotation.x = Math.PI; tip.position.y = -0.13
  const sprite = new THREE.Sprite(makeText(THREE, cache, label, '#c9b8ff', 44)); sprite.scale.set(1.9, 0.5, 1); sprite.position.y = 1.35
  g.add(beam, tip, sprite)
  g.visible = false
  parent.add(g)
  const from = new THREE.Vector3(), to = new THREE.Vector3()
  let t = 1, text = label
  return {
    group: g, sprite,
    get visible() { return g.visible },
    setLabel(l) { if (l !== text) { sprite.material = makeText(THREE, cache, l, '#c9b8ff', 44); text = l } },
    stack(k) { sprite.position.y = 1.35 + k * 0.5 },
    // Move to `target`: snap when hidden or asked to, else start a tween from the current position.
    show(target, snap) {
      if (!g.visible || snap) { to.copy(target); from.copy(target); t = 1; g.position.copy(target) }
      else if (!to.equals(target)) { from.copy(g.position); to.copy(target); t = 0 }
      g.visible = true
    },
    hide() { g.visible = false },
    // Advance the tween; when idle, `bob` (a y offset, 0 to disable) gives the gentle float.
    tick(dt, bob = 0) {
      if (t < 1) { t = Math.min(1, t + dt / TWEEN); g.position.lerpVectors(from, to, ease(t)) }
      else if (bob) g.position.y = to.y + bob
    },
    dispose() { parent.remove(g); beam.material.dispose(); tip.material.dispose(); pinGeo.dispose(); tipGeo.dispose() },
  }
}
```

- [ ] **Step 3: row.js switches to them**

In `src/scene/row.js`:
- Replace the `makeText` function with `import { makeText } from './text.js'` and `export { makeText }` (keep `extentOf`, `GAP`, `CHAIN_GAP`, `PILE_STEP`, `SIZE` exports).
- Add `import { createPin } from './pin.js'`. Remove `pinGeo`, `tipGeo`, `TWEEN`, `ease`.
- Replace `pinFor` with:
```js
  function pinFor(key) {
    if (!pins.has(key)) pins.set(key, createPin(stage, group, cache, key))
    return pins.get(key)
  }
```
- In `update`, the pointer loop becomes:
```js
    for (const p of r.pointers) {
      const n = (reps.get(p.key) ?? 0) + 1; reps.set(p.key, n)
      const id = n === 1 ? p.key : `${p.key}#${n}`
      const pin = pinFor(id); seen.add(id)
      pin.group.rotation.z = pile ? -Math.PI / 2 : 0
      pin.setLabel(p.label)
      pin.show(pinTarget(p.index, count), snap || rebuilt)
      const k = onCell.get(p.index) ?? 0; onCell.set(p.index, k + 1)
      pin.stack(k)
    }
    for (const [key, pin] of pins) if (!seen.has(key)) pin.hide()
```
- In the tick: `for (const pin of pins.values()) pin.tick(dt, (!stage.reduced && !pile) ? Math.sin(elapsed * 2.2) * 0.04 : 0)`.
- In `dispose`: `for (const p of pins.values()) p.dispose()` (drop the manual material disposal), and drop `pinGeo.dispose(); tipGeo.dispose()`.

- [ ] **Step 4: Build and browser regression**

`npm test && npm run build 2>&1 | tail -3` pass. Dev server; seed a save (as in earlier waves); open `two-pointers` (pins slide on answers, labels stacked), `monotonic` (lanes and pile as before), `linked-lists` (two value pins hop). Nothing looks different. Stop the server.

- [ ] **Step 5: Commit**
```bash
git add src/scene/text.js src/scene/pin.js src/scene/row.js
git commit -m "refactor(scene): shared pin.js and text.js; row.js unchanged visually"
```

---

### Task 2: Model — `resolveGrid`, `resolveLine`

**Files:** Modify `src/scene/model.js`; append to `tests/scene-model.test.mjs` (and update the first test's `KINDS` assertion and title to the four kinds).

**Interfaces:**
- `KINDS = ['cells', 'rows', 'grid', 'line']`.
- `resolveGrid(scene, state, prev) → { kind: 'grid', rows, cols, tiles: [{ r, c, text, bool }], cursor: { r, c, label } | null, marks: [[r, c]], changed: [[r, c]], heads, source }`.
- `resolveLine(scene, state, prev) → { kind: 'line', axis, lanes: [{ label, bars: [{ from, to }], changed: [k], source }], ticks, span: { from, to } | null, pins: [{ key, at, label }] }`.
- `resolve()` dispatches on kind.

- [ ] **Step 1: Failing tests**

```js
// append to tests/scene-model.test.mjs
import { resolveGrid, resolveLine } from '../src/scene/model.js'

test('resolveGrid: literal grid → tiles by row/col; bools flagged; text otherwise', () => {
  const r = resolve({ kind: 'grid', data: [[1, 2], [true, false]] }, {})
  assert.equal(r.kind, 'grid'); assert.equal(r.rows, 2); assert.equal(r.cols, 2)
  assert.deepEqual(r.tiles.map(t => [t.r, t.c, t.text, t.bool]), [[0, 0, '1', null], [0, 1, '2', null], [1, 0, 'True', true], [1, 1, 'False', false]])
  assert.equal(r.cursor, null); assert.deepEqual(r.marks, []); assert.equal(r.changed.length, 4)
})

test('resolveGrid: keyed grid reads the frame, falls back to prev then init; changed by position', () => {
  const sc = { kind: 'grid', data: 'grid', init: [[0, 0], [0, 0]], cursor: ['r', 'c'] }
  const r0 = resolve(sc, { r: 0, c: 0 })
  assert.deepEqual(r0.tiles.map(t => t.text), ['0', '0', '0', '0'])
  assert.deepEqual(r0.cursor, { r: 0, c: 0, label: 'r, c' })
  const r1 = resolve(sc, { r: 1, c: 0, grid: [[5, 0], [0, 0]] }, r0)
  assert.deepEqual(r1.changed, [[0, 0]])
  const r2 = resolve(sc, { r: 1, c: 1 }, r1)
  assert.deepEqual(r2.tiles.map(t => t.text), ['5', '0', '0', '0']); assert.deepEqual(r2.changed, [])
})

test('resolveGrid: cursor hidden when a key is missing, None, or out of range; labels caption the keys', () => {
  const sc = { kind: 'grid', data: [[0, 0, 0], [0, 1, 0]], cursor: ['r', 'c'], labels: { r: 'row', c: 'col' } }
  assert.equal(resolve(sc, { r: 1 }).cursor, null)
  assert.equal(resolve(sc, { r: 1, c: null }).cursor, null)
  assert.equal(resolve(sc, { r: 2, c: 0 }).cursor, null)
  assert.deepEqual(resolve(sc, { r: 1, c: 2 }).cursor, { r: 1, c: 2, label: 'r · row, c · col' })
})

test('resolveGrid: marks by value; heads pass through', () => {
  const r = resolve({ kind: 'grid', data: [[1, 2], [3, 2]], marks: ['v'], heads: { rows: ['x', 'y'], cols: ['p', 'q'] } }, { v: 2 })
  assert.deepEqual(r.marks, [[0, 1], [1, 1]])
  assert.deepEqual(r.heads, { rows: ['x', 'y'], cols: ['p', 'q'] })
})

test('resolveLine: literal and keyed lanes, span, pins, ticks; changed bars per lane', () => {
  const sc = { kind: 'line', axis: [0, 8], lanes: [{ label: 'given', bars: [[1, 3], [2, 4], [6, 7]] }, { label: 'kept', bars: 'out', init: [] }], span: ['start', 'end'], pins: ['mid'], ticks: [3, 6] }
  const r0 = resolve(sc, { start: 1, end: 3 })
  assert.equal(r0.kind, 'line'); assert.deepEqual(r0.axis, [0, 8]); assert.deepEqual(r0.ticks, [3, 6])
  assert.deepEqual(r0.lanes[0].bars, [{ from: 1, to: 3 }, { from: 2, to: 4 }, { from: 6, to: 7 }])
  assert.deepEqual(r0.lanes[1].bars, []); assert.deepEqual(r0.span, { from: 1, to: 3 }); assert.deepEqual(r0.pins, [])
  const r1 = resolve(sc, { start: 2, end: 4, out: [[1, 3]], mid: 5 }, r0)
  assert.deepEqual(r1.lanes[1].bars, [{ from: 1, to: 3 }]); assert.deepEqual(r1.lanes[1].changed, [0]); assert.deepEqual(r1.lanes[0].changed, [])
  assert.deepEqual(r1.pins, [{ key: 'mid', at: 5, label: 'mid' }])
  const r2 = resolve(sc, { start: 6, end: 7 }, r1)
  assert.deepEqual(r2.lanes[1].bars, [{ from: 1, to: 3 }]); assert.deepEqual(r2.lanes[1].changed, [])
  const r3 = resolve(sc, { start: 6, end: 7, out: [[1, 4]] }, r2)
  assert.deepEqual(r3.lanes[1].changed, [0])
})

test('resolveLine: span needs both keys as ints and is ordered; pins hide on missing/None', () => {
  const sc = { kind: 'line', axis: [0, 12], lanes: [{ label: 'a', bars: [] }], span: ['s', 'e'], pins: ['lo', 'hi'], labels: { lo: 'low' } }
  assert.equal(resolve(sc, { s: 2 }).span, null)
  assert.deepEqual(resolve(sc, { s: 5, e: 2 }).span, { from: 2, to: 5 })
  assert.deepEqual(resolve(sc, { lo: 1, hi: null }).pins, [{ key: 'lo', at: 1, label: 'lo · low' }])
})

test('resolveLine: a lane whose key is missing keeps the previous bars', () => {
  const sc = { kind: 'line', axis: [0, 5], lanes: [{ label: 'k', bars: 'out', init: [[0, 1]] }] }
  const r0 = resolve(sc, {}); assert.deepEqual(r0.lanes[0].bars, [{ from: 0, to: 1 }])
  const r1 = resolve(sc, { out: [[2, 3]] }, r0); const r2 = resolve(sc, {}, r1)
  assert.deepEqual(r2.lanes[0].bars, [{ from: 2, to: 3 }])
})
```

Also edit the first test: title `'constants: KINDS is cells, rows, grid, line; text caps at six'` and `assert.deepEqual(KINDS, ['cells', 'rows', 'grid', 'line'])`.

- [ ] **Step 2: RED** — `node --test tests/scene-model.test.mjs` fails: `resolveGrid` not exported.

- [ ] **Step 3: Implement** — in `model.js` set `export const KINDS = ['cells', 'rows', 'grid', 'line']` and add before `resolve`:

```js
const isGrid = v => Array.isArray(v) && v.every(Array.isArray)
const pairs = v => Array.isArray(v) && v.every(p => Array.isArray(p) && p.length === 2)

// The grid for this frame: literal; else the frame's own grid, else the previous frame's, else init.
function gridFor(scene, state, prev) {
  if (isGrid(scene.data)) return scene.data
  const v = state?.[scene.data]
  if (isGrid(v)) return v
  if (prev?.source !== undefined) return prev.source
  return scene.init ?? []
}

export function resolveGrid(scene, state = {}, prev = null) {
  const source = gridFor(scene, state, prev)
  const rows = source.length, cols = rows ? Math.max(...source.map(r => r.length)) : 0
  const tiles = []
  source.forEach((row, r) => row.forEach((v, c) => tiles.push({ r, c, text: cellText(v), bool: v === true ? true : v === false ? false : null })))
  let cursor = null
  if (Array.isArray(scene.cursor) && scene.cursor.length === 2) {
    const [rk, ck] = scene.cursor, r = state[rk], c = state[ck]
    if (Number.isInteger(r) && Number.isInteger(c) && r >= 0 && r < rows && c >= 0 && c < cols) cursor = { r, c, label: `${captioned(scene, rk)}, ${captioned(scene, ck)}` }
  }
  const marks = []
  for (const key of scene.marks || []) {
    if (!present(state, key)) continue
    const t = cellText(state[key])
    for (const tl of tiles) if (tl.text === t) marks.push([tl.r, tl.c])
  }
  const before = prev?.kind === 'grid' ? new Map(prev.tiles.map(t => [`${t.r},${t.c}`, t.text])) : null
  const changed = tiles.filter(tl => !before || before.get(`${tl.r},${tl.c}`) !== tl.text).map(tl => [tl.r, tl.c])
  return { kind: 'grid', rows, cols, tiles, cursor, marks, changed, heads: scene.heads ?? null, source }
}

function barsFor(lane, state, prevLane) {
  if (pairs(lane.bars)) return lane.bars
  const v = state?.[lane.bars]
  if (pairs(v)) return v
  if (prevLane?.source !== undefined) return prevLane.source
  return lane.init ?? []
}

export function resolveLine(scene, state = {}, prev = null) {
  const lanes = (scene.lanes || []).map((lane, i) => {
    const prevLane = prev?.kind === 'line' ? prev.lanes[i] ?? null : null
    const source = barsFor(lane, state, prevLane)
    const bars = source.map(([from, to]) => ({ from, to }))
    const changed = []
    bars.forEach((b, k) => { const pb = prevLane?.bars[k]; if (!pb || pb.from !== b.from || pb.to !== b.to) changed.push(k) })
    return { label: lane.label ?? null, bars, changed, source }
  })
  let span = null
  if (Array.isArray(scene.span) && scene.span.length === 2) {
    const a = state[scene.span[0]], b = state[scene.span[1]]
    if (Number.isInteger(a) && Number.isInteger(b)) span = { from: Math.min(a, b), to: Math.max(a, b) }
  }
  const pins = []
  for (const key of scene.pins || []) { const v = state[key]; if (Number.isInteger(v)) pins.push({ key, at: v, label: captioned(scene, key) }) }
  return { kind: 'line', axis: scene.axis, lanes, ticks: scene.ticks ?? [], span, pins }
}
```

and extend `resolve`:

```js
  if (scene.kind === 'grid') return resolveGrid(scene, state, prev?.kind === 'grid' ? prev : null)
  if (scene.kind === 'line') return resolveLine(scene, state, prev?.kind === 'line' ? prev : null)
```

(`captioned` and `present` already exist from wave 2a.)

- [ ] **Step 4: GREEN** — model tests pass (previous count + 7). `npm test` passes.
- [ ] **Step 5: Commit** — `feat(scene): model — grid and line kinds`

---

### Task 3: Validator — grid and line rules

**Files:** Modify `src/scene/validate.js`; append to `tests/scene-validate.test.mjs`.

- [ ] **Step 1: Failing tests**

```js
// append to tests/scene-validate.test.mjs
const G = (scene, ...states) => tr({ kind: 'grid', ...scene }, ...states)
const L = (scene, ...states) => tr({ kind: 'line', ...scene }, ...states)

test('grid: rectangular data or keyed data with rectangular init', () => {
  assert.deepEqual(sceneErrors(G({ data: [[1, 2], [3, 4]] }, { x: 1 }, { x: 1 }, { x: 1 })), [])
  assert.match(sceneErrors(G({ data: [[1, 2], [3]] }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /rectangular/)
  assert.match(sceneErrors(G({ data: 'grid' }, { grid: [[1]] }, { x: 1 }, { x: 1 }))[0], /init/)
  assert.deepEqual(sceneErrors(G({ data: 'grid', init: [[0, 0], [0, 0]] }, { grid: [[5, 0], [0, 0]] }, { x: 1 }, { x: 1 })), [])
})

test('grid: cursor is two keys that appear; out-of-range names the frame; labels ⊆ cursor', () => {
  const g = { data: [[0, 0, 0], [0, 1, 0]], cursor: ['r', 'c'] }
  assert.deepEqual(sceneErrors(G(g, { r: 0, c: 0 }, { r: 1 }, { r: 1, c: 2 })), [])
  assert.match(sceneErrors(G(g, { r: 0, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 2 }))[0], /cursor.*frame 1/)
  assert.match(sceneErrors(G({ ...g, cursor: ['r'] }, { r: 0 }, { r: 0 }, { r: 0 }))[0], /cursor/)
  assert.match(sceneErrors(G(g, { r: 0 }, { r: 0 }, { r: 0 }))[0], /'c' never/)
  assert.match(sceneErrors(G({ ...g, labels: { q: 'x' } }, { r: 0, c: 0 }, { r: 0, c: 0 }, { r: 0, c: 0 }))[0], /labels/)
})

test('grid: heads lengths match; marks appear', () => {
  const g = { data: [[1, 2], [3, 4]], heads: { rows: ['', 'a'], cols: ['x'] } }
  assert.match(sceneErrors(G(g, { x: 1 }, { x: 1 }, { x: 1 }))[0], /heads.cols must have 2/)
  assert.deepEqual(sceneErrors(G({ data: [[1, 2], [3, 4]], heads: { rows: ['', 'a'], cols: ['x', 'y'] }, marks: ['v'] }, { v: 1 }, { v: 2 }, { v: 3 })), [])
  assert.match(sceneErrors(G({ data: [[1]], marks: ['v'] }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /'v' never/)
})

test('line: axis ascending ints; 1–2 lanes with unique labels; bars within the axis', () => {
  const ok = { axis: [0, 8], lanes: [{ label: 'given', bars: [[1, 3], [6, 7]] }, { label: 'kept', bars: 'out', init: [] }], span: ['start', 'end'] }
  assert.deepEqual(sceneErrors(L(ok, { start: 1, end: 3 }, { out: [[1, 3]] }, { out: [[1, 4]] })), [])
  assert.match(sceneErrors(L({ ...ok, axis: [8, 0] }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /axis/)
  assert.match(sceneErrors(L({ ...ok, lanes: [...ok.lanes, { label: 'z', bars: [] }] }, { start: 1, end: 3 }, { out: [] }, { out: [] }))[0], /1 or 2 lanes/)
  assert.match(sceneErrors(L({ ...ok, lanes: [{ label: 'a', bars: [[1, 9]] }] }, { start: 1, end: 3 }, { x: 1 }, { x: 1 }))[0], /outside the axis/)
  assert.match(sceneErrors(L({ ...ok, lanes: [{ label: 'a', bars: [[4, 2]] }] }, { start: 1, end: 3 }, { x: 1 }, { x: 1 }))[0], /reversed/)
  assert.match(sceneErrors(L({ ...ok, lanes: [{ label: 'a', bars: [] }, { label: 'a', bars: [] }] }, { start: 1, end: 3 }, { x: 1 }, { x: 1 }))[0], /unique/)
})

test('line: span two keys; pins within axis at each frame; ticks within axis; labels ⊆ pins ∪ span', () => {
  const l = { axis: [0, 12], lanes: [{ label: 'a', bars: [] }], pins: ['lo', 'hi'], ticks: [3, 6, 7, 11], labels: { lo: 'low' } }
  assert.deepEqual(sceneErrors(L(l, { lo: 1, hi: 11 }, { lo: 1, hi: 6 }, { lo: 4, hi: 4 })), [])
  assert.match(sceneErrors(L(l, { lo: 1, hi: 13 }, { lo: 1 }, { lo: 1 }))[0], /'hi' is 13 at frame 0/)
  assert.match(sceneErrors(L({ ...l, ticks: [14] }, { lo: 1, hi: 2 }, { lo: 1 }, { lo: 1 }))[0], /ticks/)
  assert.match(sceneErrors(L({ ...l, span: ['s'] }, { lo: 1, hi: 2 }, { lo: 1 }, { lo: 1 }))[0], /span/)
  assert.match(sceneErrors(L({ ...l, labels: { q: 'x' } }, { lo: 1, hi: 2 }, { lo: 1 }, { lo: 1 }))[0], /labels/)
})
```

- [ ] **Step 2: RED** — new tests fail (a `grid` scene currently falls into the `rows` branch and reports `rows must…`).

- [ ] **Step 3: Implement** — in `validate.js` add `resolveGrid` to the model import and these functions before `sceneErrors`:

```js
const rect = g => Array.isArray(g) && g.length > 0 && g.every(r => Array.isArray(r) && r.length > 0 && r.length === g[0].length)
const pairsOk = v => Array.isArray(v) && v.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isInteger))

function gridErrors(sc, states, where) {
  const errs = [], bad = m => errs.push(m)
  const isKey = typeof sc.data === 'string'
  if (!isKey && !rect(sc.data)) bad('data must be a rectangular 2-D list or a state key')
  if (isKey && !rect(sc.init)) bad(`data is the state key '${sc.data}' so a rectangular init is required`)
  if (sc.cursor !== undefined && !(strings(sc.cursor) && sc.cursor.length === 2)) bad('cursor must be two state keys [row, col]')
  if (sc.marks !== undefined && !strings(sc.marks)) bad('marks must be an array of state keys')
  const cursorKeys = Array.isArray(sc.cursor) ? sc.cursor : []
  for (const k of Object.keys(sc.labels || {})) if (!cursorKeys.includes(k)) bad(`labels names '${k}' which is not a cursor key`)
  const base = isKey ? sc.init : sc.data
  if (sc.heads !== undefined && rect(base)) {
    if (sc.heads.rows !== undefined && !(strings(sc.heads.rows) && sc.heads.rows.length === base.length)) bad(`heads.rows must have ${base.length} entries`)
    if (sc.heads.cols !== undefined && !(strings(sc.heads.cols) && sc.heads.cols.length === base[0].length)) bad(`heads.cols must have ${base[0].length} entries`)
  }
  if (errs.length) return errs
  const keyed = [...cursorKeys, ...(sc.marks || []), ...(isKey ? [sc.data] : [])]
  for (const k of new Set(keyed)) if (!states.some(st => k in st)) bad(`'${k}' never appears in any ${where}`)
  let prev = null
  states.forEach((st, k) => {
    const r = resolveGrid(sc, st, prev)
    if (cursorKeys.length === 2 && cursorKeys.every(x => x in st)) {
      const [a, b] = cursorKeys.map(x => st[x])
      const skip = [a, b].some(v => v === null || v === undefined)
      if (!skip && !(Number.isInteger(a) && Number.isInteger(b) && a >= 0 && a < r.rows && b >= 0 && b < r.cols)) bad(`cursor (${JSON.stringify(a)}, ${JSON.stringify(b)}) at ${where} ${k} is outside the ${r.rows}×${r.cols} grid`)
    }
    prev = r
  })
  return errs
}

function lineErrors(sc, states, where) {
  const errs = [], bad = m => errs.push(m)
  const ax = sc.axis
  if (!(Array.isArray(ax) && ax.length === 2 && ax.every(Number.isInteger) && ax[0] < ax[1])) { bad('axis must be two ascending integers'); return errs }
  const inAxis = v => Number.isInteger(v) && v >= ax[0] && v <= ax[1]
  const barOk = (tag, [a, b], at = '') => { if (!(inAxis(a) && inAxis(b))) bad(`${tag}: bar [${a}, ${b}]${at} is outside the axis`); else if (a > b) bad(`${tag}: bar [${a}, ${b}]${at} is reversed`) }
  const lanes = Array.isArray(sc.lanes) ? sc.lanes : []
  if (lanes.length < 1 || lanes.length > 2) bad('lanes must be an array of 1 or 2 lanes')
  const labels = new Set()
  lanes.forEach((lane, i) => {
    const tag = `lane ${typeof lane?.label === 'string' ? `'${lane.label}'` : i}`
    if (typeof lane?.label !== 'string' || !lane.label) bad(`${tag}: needs a string label`)
    else if (labels.has(lane.label)) bad(`${tag}: labels must be unique`)
    labels.add(lane?.label)
    const isKey = typeof lane?.bars === 'string'
    const lit = isKey ? lane.init : lane?.bars
    if (isKey && lane.init === undefined) bad(`${tag}: bars is the state key '${lane.bars}' so init is required`)
    else if (!pairsOk(lit)) bad(`${tag}: bars must be [start, end] integer pairs`)
    else for (const p of lit) barOk(tag, p)
  })
  if (sc.ticks !== undefined && !(Array.isArray(sc.ticks) && sc.ticks.every(inAxis))) bad('ticks must be integers within the axis')
  if (sc.span !== undefined && !(strings(sc.span) && sc.span.length === 2)) bad('span must be two state keys')
  if (sc.pins !== undefined && !strings(sc.pins)) bad('pins must be an array of state keys')
  const pinKeys = [...(Array.isArray(sc.pins) ? sc.pins : []), ...(Array.isArray(sc.span) && sc.span.length === 2 ? sc.span : [])]
  for (const k of Object.keys(sc.labels || {})) if (!pinKeys.includes(k)) bad(`labels names '${k}' which is not a pin or span key`)
  if (errs.length) return errs
  const keyed = [...pinKeys, ...lanes.filter(l => typeof l.bars === 'string').map(l => l.bars)]
  for (const k of new Set(keyed)) if (!states.some(st => k in st)) bad(`'${k}' never appears in any ${where}`)
  states.forEach((st, k) => {
    for (const key of pinKeys) if (key in st && st[key] !== null && st[key] !== undefined && !inAxis(st[key])) bad(`'${key}' is ${JSON.stringify(st[key])} at ${where} ${k}, outside the axis ${ax[0]}..${ax[1]}`)
    for (const lane of lanes) if (typeof lane.bars === 'string' && pairsOk(st[lane.bars])) for (const p of st[lane.bars]) barOk(`lane '${lane.label}'`, p, ` at ${where} ${k}`)
  })
  return errs
}
```

In `sceneErrors`, after the `cells` branch add:

```js
  const walkStates = () => explain ? normalize(sc).states : (step.frames || []).map(f => f.state || {})
  if (sc.kind === 'grid') { for (const m of gridErrors(sc, walkStates(), explain ? 'state' : 'frame')) bad(m); return errs }
  if (sc.kind === 'line') { for (const m of lineErrors(sc, walkStates(), explain ? 'state' : 'frame')) bad(m); return errs }
```

- [ ] **Step 4: GREEN** — both test files pass. `npm run check && npm test` pass.
- [ ] **Step 5: Commit** — `feat(scene): validator — grid and line rules`

---

### Task 4: Renderers — grid.js, line.js, SceneView dispatch, first content (flood-fill, intervals)

**Files:** Create `src/scene/grid.js`, `src/scene/line.js`; modify `src/components/SceneView.vue`, `src/data/training/flood-fill.js`, `src/data/training/intervals.js`.

- [ ] **Step 1: `grid.js`**

```js
// src/scene/grid.js
// Kind 'grid': flat tiles on the floor (row 0 farthest), row/column heads or indices, a cursor pin
// above tile (r, c), gold marks by value, lit/dark boolean tiles, green flashes on changed tiles.
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'
import { createPin } from './pin.js'

const GAP = 1.0, TILE = 0.8, H = 0.16, FLASH = 0.4

export function createGrid(stage) {
  const { THREE, scene } = stage
  const cache = new Map()
  const group = new THREE.Group(); scene.add(group)
  const tileGeo = new THREE.BoxGeometry(TILE, H, TILE)
  const edgeGeo = new THREE.EdgesGeometry(tileGeo)
  let tiles = [], heads = [], rows = -1, cols = -1, headsKey = '', cursor = null, elapsed = 0
  const xOf = c => (c - (cols - 1) / 2) * GAP
  const zOf = r => (r - (rows - 1) / 2) * GAP          // row 0 farthest (most negative z)

  const free = () => {
    for (const t of tiles) { group.remove(t.mesh, t.edges, t.sprite); t.mesh.material.dispose(); t.edges.material.dispose() }
    tiles = []
    for (const s of heads) group.remove(s)
    heads = []
  }
  const head = (text, x, z) => {
    if (!text) return
    const s = new THREE.Sprite(makeText(THREE, cache, text, '#6e83a6', 44)); s.scale.set(0.8, 0.4, 1); s.position.set(x, 0.1, z)
    group.add(s); heads.push(s)
  }
  function build(r) {
    free(); rows = r.rows; cols = r.cols
    for (const tl of r.tiles) {
      const mat = new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.12, roughness: 0.4, metalness: 0.15 })
      const mesh = new THREE.Mesh(tileGeo, mat)
      const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.8 }))
      const sprite = new THREE.Sprite(makeText(THREE, cache, '', '#d7e6ff')); sprite.scale.set(0.9, 0.45, 1)
      mesh.position.set(xOf(tl.c), 0, zOf(tl.r)); edges.position.copy(mesh.position); sprite.position.set(xOf(tl.c), H / 2 + 0.3, zOf(tl.r))
      group.add(mesh, edges, sprite)
      tiles.push({ r: tl.r, c: tl.c, mesh, edges, sprite, text: null, bool: null, marked: false, flashT: 0 })
    }
    const rh = r.heads?.rows ?? Array.from({ length: rows }, (_, i) => String(i))
    const ch = r.heads?.cols ?? Array.from({ length: cols }, (_, j) => String(j))
    rh.forEach((t, i) => head(t, xOf(0) - 0.9, zOf(i)))
    ch.forEach((t, j) => head(t, xOf(j), zOf(0) - 0.9))
    stage.frame({ width: cols, depth: rows + 1 })
  }
  const at = (r, c) => tiles.find(t => t.r === r && t.c === c)
  function look(t) {
    const gold = t.marked || t.bool === true, dark = t.bool === false
    t.mesh.material.color.setHex(dark ? 0x070b16 : C.panel)
    t.mesh.material.emissive.setHex(gold ? C.gold : C.edge)
    t.mesh.material.emissiveIntensity = gold ? 0.75 : dark ? 0.04 : 0.12
    t.edges.material.color.setHex(gold ? C.gold : C.edge)
    t.edges.material.opacity = dark ? 0.3 : 0.8
    t.sprite.visible = t.bool === null
  }

  function update(r, { instant = false } = {}) {
    if (!r || r.kind !== 'grid') return
    const hk = JSON.stringify(r.heads ?? null)
    if (r.rows !== rows || r.cols !== cols || hk !== headsKey) { headsKey = hk; build(r) }
    const snap = instant || stage.reduced
    const changed = new Set(r.changed.map(p => p.join(','))), marks = new Set(r.marks.map(p => p.join(',')))
    for (const tl of r.tiles) {
      const t = at(tl.r, tl.c); if (!t) continue
      if (t.text !== tl.text) { t.sprite.material = makeText(THREE, cache, tl.text, '#d7e6ff'); t.text = tl.text }
      t.bool = tl.bool; t.marked = marks.has(`${tl.r},${tl.c}`); look(t)
      if (!snap && changed.has(`${tl.r},${tl.c}`)) t.flashT = FLASH
    }
    if (r.cursor) {
      cursor ??= createPin(stage, group, cache, r.cursor.label)
      cursor.setLabel(r.cursor.label)
      cursor.show(new THREE.Vector3(xOf(r.cursor.c), H / 2 + 1.5, zOf(r.cursor.r)), snap)
    } else cursor?.hide()
  }

  const off = stage.onTick(dt => {
    elapsed += dt
    cursor?.tick(dt, stage.reduced ? 0 : Math.sin(elapsed * 2.2) * 0.04)
    for (const t of tiles) if (t.flashT > 0) {
      t.flashT = Math.max(0, t.flashT - dt)
      const k = t.flashT / FLASH
      t.mesh.material.emissive.setHex(C.ok); t.mesh.material.emissiveIntensity = 0.12 + 0.9 * k
      if (t.flashT === 0) look(t)
    }
  })

  function dispose() {
    off?.(); free(); cursor?.dispose(); cursor = null
    for (const m of cache.values()) { m.map.dispose(); m.dispose() }
    cache.clear(); tileGeo.dispose(); edgeGeo.dispose(); scene.remove(group)
  }
  return { update, dispose }
}
```

- [ ] **Step 2: `line.js`**

```js
// src/scene/line.js
// Kind 'line': a number rail with an integer under every unit, lanes of interval bars behind it
// (first lane farthest), dim tick posts, a glow plate for the span, and pins standing at values.
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'
import { createPin } from './pin.js'

const UNIT = 1.0, LANE_STEP = 0.9, BAR_H = 0.4, FLASH = 0.4

export function createLine(stage) {
  const { THREE, scene } = stage
  const cache = new Map()
  const group = new THREE.Group(); scene.add(group)
  let axis = null, fixed = [], lanes = [], span = null, elapsed = 0
  const pins = new Map()
  const xOf = v => (v - (axis[0] + axis[1]) / 2) * UNIT
  const zOfLane = (i, n) => -(n - i) * LANE_STEP        // lanes behind the rail; first lane farthest

  const freeFixed = () => { for (const o of fixed) { group.remove(o); o.geometry?.dispose?.(); o.material?.dispose?.() } fixed = [] }
  const freeBars = L => { for (const b of L.bars) { group.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose() } L.bars = [] }
  const freeLanes = () => { for (const L of lanes) { freeBars(L); if (L.label) group.remove(L.label) } lanes = [] }

  function buildRail(r) {
    freeFixed(); axis = r.axis
    const len = (axis[1] - axis[0]) * UNIT + 0.4
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, 0.3), new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.25 }))
    group.add(rail); fixed.push(rail)
    for (let v = axis[0]; v <= axis[1]; v++) {
      const s = new THREE.Sprite(makeText(THREE, cache, String(v), '#6e83a6', 40)); s.scale.set(0.7, 0.35, 1); s.position.set(xOf(v), -0.05, 0.5)
      group.add(s); fixed.push(s)
    }
    for (const v of r.ticks) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), new THREE.MeshStandardMaterial({ color: C.glow, emissive: C.glow, emissiveIntensity: 0.6 }))
      post.position.set(xOf(v), 0.23, 0); group.add(post); fixed.push(post)
    }
    stage.frame({ width: axis[1] - axis[0] + 2, depth: r.lanes.length + 1 })
  }
  function buildLanes(r) {
    freeLanes()
    lanes = r.lanes.map((lane, i) => {
      const z = zOfLane(i, r.lanes.length)
      let label = null
      if (lane.label) { label = new THREE.Sprite(makeText(THREE, cache, lane.label, '#6e83a6', 44)); label.scale.set(1.4, 0.36, 1); label.position.set(xOf(axis[0]) - 1.1, 0.2, z); group.add(label) }
      return { z, label, bars: [] }
    })
  }
  const barMesh = (b, z) => {
    const w = b.to > b.from ? (b.to - b.from) * UNIT : 0.3
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, BAR_H, 0.5), new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.3, roughness: 0.4 }))
    m.position.set((xOf(b.from) + xOf(b.to)) / 2, BAR_H / 2, z)
    return m
  }
  const baseLook = b => { b.mesh.material.emissive.setHex(C.edge); b.mesh.material.emissiveIntensity = 0.3 }

  function update(r, { instant = false } = {}) {
    if (!r || r.kind !== 'line') return
    const snap = instant || stage.reduced
    if (!axis || axis[0] !== r.axis[0] || axis[1] !== r.axis[1] || lanes.length !== r.lanes.length) { buildRail(r); buildLanes(r) }
    r.lanes.forEach((lane, i) => {
      const L = lanes[i]
      const same = L.bars.length === lane.bars.length && L.bars.every((b, k) => b.from === lane.bars[k].from && b.to === lane.bars[k].to)
      if (!same) {
        freeBars(L)
        L.bars = lane.bars.map(b => ({ from: b.from, to: b.to, mesh: barMesh(b, L.z), flashT: 0 }))
        for (const b of L.bars) group.add(b.mesh)
        if (!snap) for (const k of lane.changed) if (L.bars[k]) L.bars[k].flashT = FLASH
      }
    })
    if (span) { group.remove(span); span.geometry.dispose(); span.material.dispose(); span = null }
    if (r.span) {
      const w = (r.span.to - r.span.from) * UNIT + 0.3
      span = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.5), new THREE.MeshBasicMaterial({ color: C.glow, transparent: true, opacity: 0.28 }))
      span.position.set((xOf(r.span.from) + xOf(r.span.to)) / 2, 0.04, 0); group.add(span)
    }
    const seen = new Set()
    for (const p of r.pins) {
      if (!pins.has(p.key)) pins.set(p.key, createPin(stage, group, cache, p.label))
      const pin = pins.get(p.key); seen.add(p.key)
      pin.setLabel(p.label)
      pin.show(new THREE.Vector3(xOf(p.at), 1.5, 0), snap)
    }
    for (const [k, pin] of pins) if (!seen.has(k)) pin.hide()
  }

  const off = stage.onTick(dt => {
    elapsed += dt
    for (const pin of pins.values()) pin.tick(dt, stage.reduced ? 0 : Math.sin(elapsed * 2.2) * 0.04)
    for (const L of lanes) for (const b of L.bars) if (b.flashT > 0) {
      b.flashT = Math.max(0, b.flashT - dt); const k = b.flashT / FLASH
      b.mesh.material.emissive.setHex(C.ok); b.mesh.material.emissiveIntensity = 0.3 + 0.9 * k
      if (b.flashT === 0) baseLook(b)
    }
  })

  function dispose() {
    off?.(); freeLanes(); freeFixed()
    if (span) { group.remove(span); span.geometry.dispose(); span.material.dispose(); span = null }
    for (const p of pins.values()) p.dispose(); pins.clear()
    for (const m of cache.values()) { m.map.dispose(); m.dispose() }
    cache.clear(); scene.remove(group)
  }
  return { update, dispose }
}
```

- [ ] **Step 3: SceneView dispatch** — replace the renderer lines in `onMounted` with:

```js
    const { createStage } = await import('../scene/stage.js')
    const [{ createCells }, { createRows }, { createGrid }, { createLine }] = await Promise.all([
      import('../scene/cells.js'), import('../scene/rows.js'), import('../scene/grid.js'), import('../scene/line.js')])
    if (dead) return
    stage = await createStage(host.value)
    if (dead) { stage.dispose(); stage = null; return }
    prev = resolve(props.scene, props.state, null)
    const make = { cells: createCells, rows: createRows, grid: createGrid, line: createLine }
    cells = (make[prev?.kind] ?? createCells)(stage)
    if (prev) cells.update(prev, { instant: true })
    stage.start()
```

- [ ] **Step 4: First content**

`flood-fill.js` — explain[1]: `scene: { kind: 'grid', data: 'grid', init: [[0, 0], [0, 0]], cursor: ['r', 'c'], states: [{ r: 0, c: 0, grid: [[0, 0], [0, 0]] }, { r: 0, c: 0, grid: [[5, 0], [0, 0]] }, { r: 1, c: 0, grid: [[5, 0], [5, 0]] }, { r: 1, c: 1, grid: [[5, 0], [5, 5]] }, { r: 0, c: 1, grid: [[5, 5], [5, 5]] }] },` and trace 4th arg `{ scene: { kind: 'grid', data: 'grid', init: [[0, 0], [0, 0]], cursor: ['r', 'c'] } }`.

`intervals.js` — explain[1]: `scene: { kind: 'line', axis: [0, 8], lanes: [{ label: 'given', bars: [[1, 3], [2, 4], [6, 7]] }, { label: 'kept', bars: 'out', init: [] }], span: ['start', 'end'], states: [{ start: 1, end: 3, out: [] }, { start: 1, end: 3, out: [[1, 3]] }, { start: 2, end: 4, out: [[1, 4]] }, { start: 6, end: 7, out: [[1, 4], [6, 7]] }] },` and trace 4th arg `{ scene: { kind: 'line', axis: [0, 8], lanes: [{ label: 'given', bars: [[1, 3], [2, 4], [6, 7]] }, { label: 'kept', bars: 'out', init: [] }], span: ['start', 'end'] } }`.

- [ ] **Step 5: Check, test, build, browser**

`npm run check && npm test && npm run build 2>&1 | grep -E "grid|line|✓ built"`. Browser (seed as in earlier waves; add prerequisites as `needs:` lines demand): `flood-fill` explain: a 2×2 floor of tiles, cursor pin hopping, tiles turning 0→5 with flashes; trace stop 1 shows all zeros (asked `grid` hidden) with the cursor at (0,0). `intervals` explain: rail 0..8 with numbers, `given` lane of three bars far, `kept` lane near growing, span plate moving. `two-pointers` unchanged. Reduced motion snaps. No console errors. Stop the server.

- [ ] **Step 6: Commit** — `feat(scene): grid and line kinds — renderers, dispatch; flood-fill and intervals`

---

### Task 5: Content — seven more items

**Files:** `grids.js`, `grid-bfs.js`, `two-strings.js`, `interval-dp.js`, `dp-grid.js`, `greedy.js`, `search-the-answer.js` (all under `src/data/training/`).

Lessons: `scene` on the second `explain` and a 4th argument on `trace`. `search-the-answer` REPLACES its existing wave-2a scenes (both). Never edit frames, notes, prose or tests.

- [ ] **grids**
```js
scene: { kind: 'grid', data: [[1, 2], [3, 4]], marks: ['v'], states: [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }] },
{ scene: { kind: 'grid', data: [[1, 2], [3, 4]], marks: ['v'] } }
```
- [ ] **grid-bfs**
```js
scene: { kind: 'grid', data: [[0, 0, 0], [0, 1, 0]], cursor: ['r', 'c'], states: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 2 }] },
{ scene: { kind: 'grid', data: [[0, 0, 0], [0, 1, 0]], cursor: ['r', 'c'] } }
```
- [ ] **two-strings**
```js
scene: { kind: 'grid', data: 'table', init: [[0, 0], [0, 0], [0, 0]], cursor: ['i', 'j'], heads: { rows: ['', 'a', 'b'], cols: ['', 'b'] },
  states: [{ table: [[0, 0], [0, 0], [0, 0]] }, { i: 1, j: 1, table: [[0, 0], [0, 0], [0, 0]] }, { i: 2, j: 1, table: [[0, 0], [0, 0], [0, 1]] }] },
{ scene: { kind: 'grid', data: 'table', init: [[0, 0], [0, 0], [0, 0]], cursor: ['i', 'j'], heads: { rows: ['', 'a', 'b'], cols: ['', 'b'] } } }
```
- [ ] **interval-dp**
```js
scene: { kind: 'grid', data: 'table', init: [[false, false, false], [false, false, false], [false, false, false]], cursor: ['i', 'j'], heads: { rows: ['a', 'b', 'a'], cols: ['a', 'b', 'a'] },
  states: [{ i: 0, table: [[true, false, false], [false, false, false], [false, false, false]] }, { i: 2, table: [[true, false, false], [false, true, false], [false, false, true]] }, { i: 1, j: 2, table: [[true, false, false], [false, true, false], [false, false, true]] }, { i: 0, j: 2, table: [[true, false, true], [false, true, false], [false, false, true]] }] },
{ scene: { kind: 'grid', data: 'table', init: [[false, false, false], [false, false, false], [false, false, false]], cursor: ['i', 'j'], heads: { rows: ['a', 'b', 'a'], cols: ['a', 'b', 'a'] } } }
```
- [ ] **dp-grid**
```js
scene: { kind: 'cells', data: 'row', init: [], pointers: ['c'], states: [{ row: [1, 1, 1] }, { c: 1, row: [1, 2, 1] }, { c: 2, row: [1, 2, 3] }] },
{ scene: { kind: 'cells', data: 'row', init: [], pointers: ['c'] } }
```
- [ ] **greedy**
```js
scene: { kind: 'line', axis: [0, 7], lanes: [{ label: 'events', bars: [[1, 4], [2, 3], [3, 5], [5, 6]] }], span: ['s', 'e'], pins: ['end'],
  states: [{ s: 2, e: 3, end: 3 }, { s: 1, e: 4, end: 3 }, { s: 3, e: 5, end: 5 }, { s: 5, e: 6, end: 6 }] },
{ scene: { kind: 'line', axis: [0, 7], lanes: [{ label: 'events', bars: [[1, 4], [2, 3], [3, 5], [5, 6]] }], span: ['s', 'e'], pins: ['end'] } }
```
- [ ] **search-the-answer** (replace both existing scenes)
```js
scene: { kind: 'line', axis: [0, 12], lanes: [{ label: 'piles', bars: [[0, 3], [0, 6], [0, 7], [0, 11]] }], pins: ['lo', 'hi', 'mid'],
  states: [{ lo: 1, hi: 11, mid: 6 }, { lo: 1, hi: 6, mid: 3 }, { lo: 4, hi: 4 }] },
{ scene: { kind: 'line', axis: [0, 12], lanes: [{ label: 'piles', bars: [[0, 3], [0, 6], [0, 7], [0, 11]] }], pins: ['lo', 'hi', 'mid'] } }
```
(The four piles are drawn as bars from 0 to their size on one lane, so the eye compares pile sizes against the speed pins; `ticks` is not needed.)

- [ ] **Check, test, browser spot-check, commit**

`npm run check && npm test`. Browser: `interval-dp` (boolean pattern: lit diagonal, then the corners), `two-strings` (heads `a`,`b` left and `b` above), `search-the-answer` (four bars and three pins narrowing), `dp-grid` (row grows from empty on stop 1). Stop the server.

```bash
git add src/data/training/grids.js src/data/training/grid-bfs.js src/data/training/two-strings.js src/data/training/interval-dp.js src/data/training/dp-grid.js src/data/training/greedy.js src/data/training/search-the-answer.js
git commit -m "content(training): grid scenes for grids, BFS, LCS and palindrome tables; line scenes for greedy and search-the-answer; dp-grid row"
```

---

### Task 6: Docs and final verification

- [ ] `CLAUDE.md`: Layout `src/scene/` bullet gains `text.js`, `pin.js`, `grid.js`, `line.js`; the `scene` bullet gains: "Kind `grid`: `{ kind: 'grid', data: [[..]] | 'key', init?, cursor?: ['r','c'], marks?, heads?: { rows, cols } }` (row 0 far; `True`/`False` tiles lit/dark). Kind `line`: `{ kind: 'line', axis: [a, b], lanes: [{ label, bars: [[s,e]] | 'key', init? }], ticks?, span?: ['s','e'], pins?: ['lo'] }`. See the wave-2b spec."
- [ ] Wave-2b spec Status → implemented; note `text.js` in its Files block; note the `search-the-answer` piles-as-bars choice.
- [ ] `npm run check && npm test && npm run build 2>&1 | tail -6`; `npm run preview`: heist screen makes no scene request; open `flood-fill` and `intervals` in the production build; no console errors. Stop the server.
- [ ] Commit (no push): `docs: the table wave 2b — grid floor and number line`

---

## Self-review notes

- **Spec coverage:** pin/text extraction (T1), grid and line resolution (T2), validation (T3), renderers, dispatch, look and camera (T4), nine items (T4 two + T5 seven), docs (T6). `tool-table` and the BFS queue excluded as the spec says.
- **Types:** `resolveGrid` result fields (`rows, cols, tiles[].{r,c,text,bool}, cursor{r,c,label}, marks, changed, heads, source`) used identically by validate (`resolveGrid` walk) and grid.js; `resolveLine` fields (`axis, lanes[].{label,bars[].{from,to},changed,source}, ticks, span{from,to}, pins[].{key,at,label}`) used by line.js; `createPin` contract used by row.js, grid.js, line.js.
- **Judgement calls:** `text.js` added beyond the spec's file list (row.js re-exports `makeText`); `search-the-answer` draws piles as bars from 0 instead of ticks; cursor label reads `r, c` (with captions when given); the grid cursor hides for the two `interval-dp` frames that carry only `i`.
