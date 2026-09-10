# Training 3D Scenes — Wave 2a Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend "the table" with value pins (`at`), standing piles, chained rows with arrows, and a new `rows` kind of up to four labelled lanes, then put scenes on twenty more lessons and tools.

**Architecture:** `model.js` grows a per-row resolver shared by `cells` and the new `rows` kind; `validate.js` gets a per-row checker; the block renderer moves from `cells.js` into `row.js` (positioned group, optional pile/chain/label), `cells.js` becomes one row, `rows.js` composes lanes and piles, and `stage.frame()` fits width, depth and height. `SceneView.vue` picks the renderer from the resolved kind.

**Tech Stack:** Vue 3, Vite 5, three 0.186, `node --test`, Chrome for visual checks.

**Spec:** `docs/superpowers/specs/2026-09-09-training-3d-scenes-wave2a-design.md` (builds on `2026-09-09-training-3d-scenes-design.md`)

## Global Constraints

- All CSS in `src/style.css`; no `<style>` blocks. (No CSS change is expected in this wave.)
- No new dependencies. three loads only via the existing dynamic import in `stage.js`.
- No auto-orbit and no idle camera motion. Motion happens only when a stop is answered or the learner drags.
- No story-prop skins, no emoji glyphs.
- Key rule: a string `data` is a state key when it matches `/^[a-z_][a-z0-9_]*$/` OR `init` is present. Literals like `'HB4417'`, `'ok go'`, `'(()'` have no `init`.
- `pile` and `chain` are booleans, mutually exclusive; a pile has no `pointers` and no `ranges`.
- `rows`: 1–4 rows, each with a unique string `label`, no `kind`, no `states`. First row farthest from the camera; piles stand at the right end aligned with the front lane.
- Pointer ints stay in `[-1, len]`. `at` keys are matched by cell text, never range-checked.
- Wave-1 scenes (13 lessons, 2 tools) must render exactly as before after the refactor.
- The trace step keeps hiding the asked value (`sceneState` in `StepTrace.vue`); nothing in this wave touches that.
- Run `npm run check && npm test` after every content change. Commit after every task.

---

### Task 1: Model — key rule, `at`, flags, and the `rows` kind

**Files:**
- Modify: `src/scene/model.js`
- Test: `tests/scene-model.test.mjs` (append)

**Interfaces:**
- Produces: `KINDS = ['cells', 'rows']`; `dataIsKey(row) → boolean`; `resolveRow(row, state, prev) → ResolvedRow`; `resolve(scene, state, prev)` returns `ResolvedRow` for `cells` (now with `pile`, `chain`, `label`) or `{ kind: 'rows', rows: ResolvedRow[] }` for `rows`.
- `ResolvedRow = { kind: 'cells', label, pile, chain, cells, pointers, ranges, marks, changed, source }` — `pointers` includes `at` pins (`{ key, index, label }`) after the index pins.
- Consumed by Task 2 (validator), Task 3 (row.js/rows.js/SceneView).

- [ ] **Step 1: Append the failing tests**

```js
// append to tests/scene-model.test.mjs
import { dataIsKey, resolveRow } from '../src/scene/model.js'

test('KINDS: cells and rows', () => {
  assert.deepEqual(KINDS, ['cells', 'rows'])
})

test('dataIsKey: identifier, or any string when init is present; literals otherwise', () => {
  assert.equal(dataIsKey({ data: 'nums' }), true)
  assert.equal(dataIsKey({ data: 'list(line)', init: [] }), true)
  assert.equal(dataIsKey({ data: 'list(line)' }), false)
  assert.equal(dataIsKey({ data: 'HB4417' }), false)
  assert.equal(dataIsKey({ data: 'ok go' }), false)
  assert.equal(dataIsKey({ data: [1, 2] }), false)
})

test('resolve: a non-identifier key with init reads the frame and falls back to init', () => {
  const sc = { kind: 'cells', data: 'list(line)', init: ['ana', 'boyd'], marks: ['first'] }
  assert.deepEqual(resolve(sc, {}).cells.map(c => c.text), ['ana', 'boyd'])
  const r = resolve(sc, { first: 'ana', 'list(line)': ['boyd', 'cass'] })
  assert.deepEqual(r.cells.map(c => c.text), ['boyd', 'cass'])
  assert.deepEqual(r.marks, [])
})

test('resolve: at pins land on every cell whose text equals the value; missing or None hides them', () => {
  const sc = { kind: 'cells', chain: true, data: [1, 2, 3, 4, 5], at: ['slow.val', 'fast.val'], labels: { 'slow.val': 'slow' } }
  const r = resolve(sc, { 'slow.val': 1, 'fast.val': 3 })
  assert.deepEqual(r.pointers, [{ key: 'slow.val', index: 0, label: 'slow.val · slow' }, { key: 'fast.val', index: 2, label: 'fast.val' }])
  assert.deepEqual(resolve(sc, { 'slow.val': 3, fast: null }).pointers.map(p => p.key), ['slow.val'])
  assert.deepEqual(resolve(sc, { 'slow.val': null }).pointers, [])
  const dup = resolve({ kind: 'cells', data: [7, 1, 7], at: ['x'] }, { x: 7 })
  assert.deepEqual(dup.pointers.map(p => p.index), [0, 2])
  assert.equal(r.chain, true)
  assert.equal(r.pile, false)
})

test('resolve: index pins come before at pins', () => {
  const r = resolve({ kind: 'cells', data: [5, 6], pointers: ['i'], at: ['v'] }, { i: 1, v: 5 })
  assert.deepEqual(r.pointers.map(p => `${p.key}@${p.index}`), ['i@1', 'v@0'])
})

test('resolve: pile flag passes through and a pile still resolves marks', () => {
  const r = resolve({ kind: 'cells', data: 'tray', init: [], pile: true, marks: ['taken'] }, { taken: 'badge', tray: ['papers', 'badge'] })
  assert.equal(r.pile, true)
  assert.deepEqual(r.marks, [1])
})

test('resolve: rows resolves each row against the same state, with per-row changed and prev', () => {
  const sc = { kind: 'rows', rows: [
    { label: 'a', data: [1, 4], pointers: ['i'] },
    { label: 'b', data: [2, 3], pointers: ['j'] },
    { label: 'out', data: 'out', init: [] },
  ] }
  const r0 = resolve(sc, { i: 0, j: 0 })
  assert.equal(r0.kind, 'rows')
  assert.deepEqual(r0.rows.map(r => r.label), ['a', 'b', 'out'])
  assert.deepEqual(r0.rows[0].pointers.map(p => p.index), [0])
  assert.deepEqual(r0.rows[2].cells, [])
  const r1 = resolve(sc, { i: 1, j: 0, out: [1] }, r0)
  assert.deepEqual(r1.rows[2].cells.map(c => c.text), ['1'])
  assert.deepEqual(r1.rows[2].changed, [0])
  assert.deepEqual(r1.rows[0].changed, [])
  const r2 = resolve(sc, { i: 1, j: 1 }, r1)           // out missing: previous row stays
  assert.deepEqual(r2.rows[2].cells.map(c => c.text), ['1'])
  assert.deepEqual(r2.rows[2].changed, [])
})

test('resolve: rows ignores a prev of a different kind', () => {
  const sc = { kind: 'rows', rows: [{ label: 'x', data: [1] }] }
  const r = resolve(sc, {}, resolve({ kind: 'cells', data: [1] }, {}))
  assert.deepEqual(r.rows[0].changed, [0])
})

test('resolveRow: a row carries its label and defaults', () => {
  const r = resolveRow({ label: 'out', data: [9] }, {}, null)
  assert.equal(r.label, 'out')
  assert.equal(r.pile, false)
  assert.equal(r.chain, false)
  assert.equal(resolveRow({ data: [9] }, {}, null).label, null)
})
```

- [ ] **Step 2: Run to verify RED**

Run: `node --test tests/scene-model.test.mjs`
Expected: FAIL — `does not provide an export named 'dataIsKey'`.

- [ ] **Step 3: Implement**

In `src/scene/model.js` replace the `KINDS`/`CELL_TEXT_MAX`/`KEY_RE` block with:

```js
export const KINDS = ['cells', 'rows']
export const CELL_TEXT_MAX = 6
// A string `data` is a state key when it looks like an identifier, or when the row gives an `init`
// (the list before the first frame). Content literals ('HB4417', 'ok go', '(()') have no init.
export const KEY_RE = /^[a-z_][a-z0-9_]*$/
export const dataIsKey = row => typeof row?.data === 'string' && (row.init !== undefined || KEY_RE.test(row.data))
```

Keep `cellText` and `normalize` exactly as they are. Replace everything from `const isList = …` to the end of the file with:

```js
const isList = v => Array.isArray(v) || typeof v === 'string'
const toCells = src => Array.from(src, (v, index) => ({ index, text: cellText(v) }))

// The row for this frame: the literal; else the frame's own list, else the previous frame's, else init.
function rowFor(row, state, prev) {
  const d = row.data
  if (Array.isArray(d)) return d
  if (!dataIsKey(row)) return d
  const v = state?.[d]
  if (isList(v)) return v
  if (prev?.source !== undefined) return prev.source
  return row.init ?? []
}

const intAt = (state, k) => (typeof k === 'number' ? k : state?.[k])
const inRow = (v, len) => Number.isInteger(v) && v >= -1 && v <= len
const present = (state, key) => key in state && state[key] !== null && state[key] !== undefined
const captioned = (row, key) => { const cap = row.labels?.[key]; return cap ? `${key} · ${cap}` : key }

// One row of cells: shared by kind 'cells' (one row) and kind 'rows' (each lane or pile).
export function resolveRow(row, state = {}, prev = null) {
  const source = rowFor(row, state, prev)
  const cells = toCells(source)
  const len = cells.length

  const pointers = []
  for (const key of Array.isArray(row.pointers) ? row.pointers : []) {
    const v = state[key]
    if (!inRow(v, len)) continue
    pointers.push({ key, index: v, label: captioned(row, key) })
  }
  for (const key of row.at || []) {                 // value pins: one per matching cell
    if (!present(state, key)) continue
    const t = cellText(state[key])
    for (const c of cells) if (c.text === t) pointers.push({ key, index: c.index, label: captioned(row, key) })
  }

  const ranges = []
  for (const r of row.ranges || []) {
    let from, to
    if (Array.isArray(r)) { from = intAt(state, r[0]); to = intAt(state, r[1]) }
    else if (r && typeof r === 'object') { to = intAt(state, r.end); from = Number.isInteger(to) ? to - (r.width ?? 1) + 1 : undefined }
    if (!Number.isInteger(from) || !Number.isInteger(to)) continue
    from = Math.max(0, from); to = Math.min(len - 1, to)
    if (from > to) continue
    ranges.push({ from, to })
  }

  const marks = []
  for (const key of row.marks || []) {
    if (!present(state, key)) continue
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

  return { kind: 'cells', label: row.label ?? null, pile: !!row.pile, chain: !!row.chain, cells, pointers, ranges, marks, changed, source }
}

export function resolve(scene, state = {}, prev = null) {
  if (!scene) return null
  if (scene.kind === 'cells') return resolveRow(scene, state, prev?.kind === 'cells' ? prev : null)
  if (scene.kind === 'rows') {
    const rows = (scene.rows || []).map((row, i) => resolveRow(row, state, prev?.kind === 'rows' ? prev.rows[i] ?? null : null))
    return { kind: 'rows', rows }
  }
  return null
}
```

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/scene-model.test.mjs`
Expected: all pass (11 old + 9 new = 20). `resolve: unknown kind is null` still holds. If the old `resolve(two, { i: 7 })` case breaks, `inRow` was altered — it must not be.

- [ ] **Step 5: Full suite and commit**

Run: `npm test` — validator tests still pass (`validate.js` still imports `KINDS, KEY_RE, normalize, resolve`; no content uses `rows` yet).

```bash
git add src/scene/model.js tests/scene-model.test.mjs
git commit -m "feat(scene): model — relaxed key rule, at pins, pile/chain flags, rows kind"
```

---

### Task 2: Validator — per-row checker and rows rules

**Files:**
- Rewrite: `src/scene/validate.js`
- Test: `tests/scene-validate.test.mjs` (append)

**Interfaces:**
- Consumes: `KINDS`, `dataIsKey`, `normalize`, `resolve`, `resolveRow` from model.js.
- Produces: `sceneErrors(step) → string[]` (same signature; rows messages are prefixed ``row 'label': ``).

- [ ] **Step 1: Append the failing tests**

```js
// append to tests/scene-validate.test.mjs
test('key rule: a non-identifier data with init is a key; without init it is a literal', () => {
  assert.deepEqual(sceneErrors(tr({ kind: 'cells', data: 'list(line)', init: ['a'], marks: ['first'] }, { 'list(line)': ['a', 'b'] }, { first: 'a' }, { first: 'a' })), [])
  assert.deepEqual(sceneErrors(ex({ kind: 'cells', data: 'ok go', pointers: { i: 2 } })), [])
})

test('at: array of keys that appear somewhere; never range-checked; labels may name them', () => {
  const good = tr({ kind: 'cells', chain: true, data: [1, 2, 3], at: ['slow.val'], labels: { 'slow.val': 'slow' } }, { 'slow.val': 1 }, { 'slow.val': 2 }, { 'slow.val': 99 })
  assert.deepEqual(sceneErrors(good), [])
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1], at: ['q'] }, { a: 1 }, { a: 1 }, { a: 1 }))[0], /'q' never/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1], at: 'q' }, { q: 1 }, { q: 1 }, { q: 1 }))[0], /at must/)
})

test('pile and chain: booleans, exclusive; a pile has no pointers or ranges', () => {
  assert.deepEqual(sceneErrors(tr({ kind: 'cells', data: 'tray', init: [], pile: true, marks: ['taken'] }, { tray: ['p'] }, { taken: 'p', tray: [] }, { tray: [] })), [])
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1], pile: true, chain: true }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /both/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1], pile: 'yes' }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /pile/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1, 2], pile: true, pointers: ['i'] }, { i: 0 }, { i: 1 }, { i: 1 }))[0], /pile.*pointers/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1, 2], pile: true, ranges: [[0, 1]] }, { x: 0 }, { x: 1 }, { x: 1 }))[0], /pile.*ranges/)
})

const R = (rows, ...states) => tr({ kind: 'rows', rows }, ...states)
test('rows: a valid three-row scene passes; per-row bounds errors name the row', () => {
  const rows = [{ label: 'a', data: [1, 4], pointers: ['i'] }, { label: 'b', data: [2, 3], pointers: ['j'] }, { label: 'out', data: 'out', init: [] }]
  assert.deepEqual(sceneErrors(R(rows, { i: 0, j: 0 }, { i: 1, j: 0, out: [1] }, { i: 2, j: 2, out: [1, 2, 3, 4] })), [])
  assert.match(sceneErrors(R(rows, { i: 0, j: 0 }, { i: 5, j: 0, out: [1] }, { i: 2, j: 2 }))[0], /row 'a'.*'i' is 5 at frame 1/)
})

test('rows: shape rules', () => {
  const st = [{ x: 1 }, { x: 1 }, { x: 1 }]
  assert.match(sceneErrors(R([], ...st))[0], /1.*4 rows/)
  assert.match(sceneErrors(R([1, 2, 3, 4, 5].map(n => ({ label: 'r' + n, data: [n] })), ...st))[0], /1.*4 rows/)
  assert.match(sceneErrors(R([{ data: [1] }], ...st))[0], /label/)
  assert.match(sceneErrors(R([{ label: 'a', data: [1] }, { label: 'a', data: [2] }], ...st))[0], /unique/)
  assert.match(sceneErrors(R([{ label: 'a', data: [1], kind: 'cells' }], ...st))[0], /kind/)
  assert.match(sceneErrors(R([{ label: 'a', data: [1], states: [{}] }], ...st))[0], /states/)
  assert.match(sceneErrors(R([{ label: 'a', data: 'out' }], ...st))[0], /row 'a'.*init/)
  assert.match(sceneErrors(tr({ kind: 'rows' }, ...st))[0], /rows must/)
})

test('rows on explain: states loop is checked against every row', () => {
  const sc = { kind: 'rows', rows: [{ label: 'a', data: [1, 2], pointers: ['i'] }, { label: 'p', data: 'chosen', init: [], pile: true }], states: [{ i: 0, chosen: [1] }, { i: 2, chosen: [] }] }
  assert.deepEqual(sceneErrors(ex(sc)), [])
  assert.match(sceneErrors(ex({ ...sc, states: [{ i: 3, chosen: [] }] }))[0], /row 'a'.*state 0/)
})
```

- [ ] **Step 2: Run to verify RED**

Run: `node --test tests/scene-validate.test.mjs`
Expected: the new tests fail (assertion mismatches, e.g. a rows scene reporting `data must be a list`, or no `at must` message); the old seven still pass.

- [ ] **Step 3: Rewrite `validate.js`**

```js
// src/scene/validate.js
// Content-time checks for a step's `scene`. Pure; used by scripts/check-training.mjs and tests.
import { KINDS, dataIsKey, normalize, resolveRow } from './model.js'

const isList = v => Array.isArray(v) || typeof v === 'string'
const keyish = v => typeof v === 'string'
const strings = v => Array.isArray(v) && v.every(keyish)

// Shape rules for one row (a `cells` scene or one entry of `rows`). Returns messages.
function rowShape(row, { explain }) {
  const errs = []
  const bad = m => errs.push(m)
  const isKey = dataIsKey(row)
  if (!isList(row.data)) bad('data must be a list, a string, or a state key')
  else if (!isKey && row.data.length === 0) bad('data is empty')
  if (isKey && !isList(row.init)) bad(`data is the state key '${row.data}' so init (the list before the first frame) is required`)
  if (row.pointers !== undefined && !Array.isArray(row.pointers) && !(explain && row.pointers && typeof row.pointers === 'object')) bad('pointers must be an array of state keys' + (explain ? ' or an object of ints' : ''))
  if (row.at !== undefined && !strings(row.at)) bad('at must be an array of state keys')
  if (row.marks !== undefined && !strings(row.marks)) bad('marks must be an array of state keys')
  for (const f of ['pile', 'chain']) if (row[f] !== undefined && typeof row[f] !== 'boolean') bad(`${f} must be true or false`)
  if (row.pile && row.chain) bad('a row cannot be both a pile and a chain')
  if (row.pile && row.pointers?.length) bad('a pile has no index pointers (use at or marks)')
  if (row.pile && row.ranges?.length) bad('a pile has no ranges')
  for (const r of row.ranges || []) {
    const ok = (Array.isArray(r) && r.length === 2 && r.every(x => keyish(x) || Number.isInteger(x)))
      || (r && typeof r === 'object' && !Array.isArray(r) && (keyish(r.end) || Number.isInteger(r.end))
        && (r.width === undefined || (Number.isInteger(r.width) && r.width > 0)))
    if (!ok) bad(`range ${JSON.stringify(r)} must be [a, b] or { end, width } with a positive integer width`)
  }
  const pointerKeys = Array.isArray(row.pointers) ? row.pointers : Object.keys(row.pointers || {})
  const pinKeys = [...pointerKeys, ...(Array.isArray(row.at) ? row.at : [])]
  for (const k of Object.keys(row.labels || {})) if (!pinKeys.includes(k)) bad(`labels names '${k}' which is not a pointer or an at key`)
  return errs
}

// Walk the states the way the renderer will; bounds-check pins and ranges. `row.pointers` must be an
// array here. Returns messages.
function rowWalk(row, states, where) {
  const errs = []
  const bad = m => errs.push(m)
  const pointerKeys = Array.isArray(row.pointers) ? row.pointers : []
  const keyed = [...pointerKeys, ...(row.at || []), ...(row.marks || []), ...(dataIsKey(row) ? [row.data] : [])]
  for (const r of row.ranges || []) for (const x of Array.isArray(r) ? r : [r.end]) if (keyish(x)) keyed.push(x)
  for (const k of new Set(keyed)) if (!states.some(st => k in st)) bad(`'${k}' never appears in any ${where}`)
  let prev = null
  states.forEach((st, k) => {
    const r = resolveRow(row, st, prev)
    const len = r.cells.length
    const check = (key, v) => {
      if (v === null || v === undefined) return
      if (!(Number.isInteger(v) && v >= -1 && v <= len)) bad(`'${key}' is ${JSON.stringify(v)} at ${where} ${k}, outside -1..${len}`)
    }
    for (const key of pointerKeys) if (key in st) check(key, st[key])
    for (const rg of row.ranges || []) {
      const ends = Array.isArray(rg) ? rg : [rg.end]
      for (const x of ends) if (keyish(x) && x in st) check(x, st[x])
      for (const x of ends) if (Number.isInteger(x)) check(String(x), x)
    }
    prev = r
  })
  return errs
}

export function sceneErrors(step) {
  const sc = step?.scene
  if (!sc) return []
  const errs = []
  const bad = m => errs.push(`scene: ${m}`)
  const explain = step.type === 'explain'
  if (step.type !== 'trace' && !explain) { bad(`not allowed on a ${step.type} step`); return errs }
  if (!KINDS.includes(sc.kind)) { bad(`unknown kind '${sc.kind}'`); return errs }
  if (!explain && sc.states) bad('states only belong on an explain scene')
  if (explain && sc.states !== undefined && (!Array.isArray(sc.states) || sc.states.length === 0)) bad('states must be a non-empty array')

  if (sc.kind === 'cells') {
    for (const m of rowShape(sc, { explain })) bad(m)
    if (errs.length) return errs
    const n = normalize(sc)
    const states = explain ? n.states : (step.frames || []).map(f => f.state || {})
    for (const m of rowWalk({ ...n, states: undefined }, states, explain ? 'state' : 'frame')) bad(m)
    return errs
  }

  // rows
  if (!Array.isArray(sc.rows) || sc.rows.length < 1 || sc.rows.length > 4) { bad('rows must be an array of 1 to 4 rows'); return errs }
  const labels = new Set()
  sc.rows.forEach((row, i) => {
    const tag = `row ${typeof row?.label === 'string' ? `'${row.label}'` : i}`
    if (!row || typeof row !== 'object') { bad(`${tag}: must be an object`); return }
    if (typeof row.label !== 'string' || !row.label) bad(`${tag}: needs a string label`)
    else if (labels.has(row.label)) bad(`${tag}: labels must be unique`)
    labels.add(row.label)
    if ('kind' in row) bad(`${tag}: rows carry no kind`)
    if ('states' in row) bad(`${tag}: states belong on the scene, not a row`)
    for (const m of rowShape(row, { explain: false })) bad(`${tag}: ${m}`)
  })
  if (errs.length) return errs
  const states = explain ? normalize(sc).states : (step.frames || []).map(f => f.state || {})
  const where = explain ? 'state' : 'frame'
  for (const row of sc.rows) for (const m of rowWalk(row, states, where)) bad(`row '${row.label}': ${m}`)
  return errs
}
```

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/scene-model.test.mjs tests/scene-validate.test.mjs`
Expected: all pass (20 + 13). Old validator regexes still match the new wording: `/pointers/`, `/'hi'.*frame 0/`, `/range/`, `/'n' never/`, `/labels/`, `/state 0/`, `/states.*explain/`, `/width/`, `/init/`, `/never appears/`, `/frame 1/`, `/kind/`, `/data/`, `/empty/`, `/spot/`.

- [ ] **Step 5: Full check and commit**

Run: `npm run check && npm test` — all wave-1 content still validates.

```bash
git add src/scene/validate.js tests/scene-validate.test.mjs
git commit -m "feat(scene): validator — per-row checker, at/pile/chain rules, rows kind"
```

---

### Task 3: Renderer — row.js extraction, rows.js, stage.frame, SceneView dispatch, first rows lesson

**Files:**
- Create: `src/scene/row.js`, `src/scene/rows.js`
- Rewrite: `src/scene/cells.js` (thin)
- Modify: `src/scene/stage.js` (`frame`, keep `frameCells`)
- Modify: `src/components/SceneView.vue` (dispatch on kind)
- Modify: `src/data/training/merging.js` (first `rows` content, used for the browser check)

**Interfaces:**
- `stage.frame({ width, depth, height })` — width in cell units, depth in lanes, height in pile cells.
- `createRow(stage, parent, { label }) → { update(resolvedRow, { instant }), setPosition(x, z), dispose() }` — `parent` is the `THREE.Object3D` the row group is added to.
- `createCells(stage)` / `createRows(stage)` → `{ update(resolved, { instant }), dispose() }` (unchanged contract for SceneView).

- [ ] **Step 1: `stage.frame`**

In `src/scene/stage.js` replace the `frameCells` function with:

```js
  // Fit the picture: `width` in cell units, `depth` in lanes, `height` in pile cells.
  function frame({ width = 3, depth = 1, height = 1 } = {}) {
    const span = Math.max(width, 3) + Math.max(0, depth - 1) * 1.3 + Math.max(0, height - 1) * 0.5
    const dist = span * 1.0 + 4
    camera.position.set(dist * 0.3, dist * 0.55, dist * 0.9)
    controls.target.set(0, 0.6 + Math.max(0, height - 1) * 0.3, 0)
    controls.update()
  }
  const frameCells = count => frame({ width: count })
```

and add `frame` to the returned object: `{ THREE, scene, camera, renderer, controls, reduced, frame, frameCells, onTick: fn => ticks.add(fn), start, stop, dispose }`.

- [ ] **Step 2: Write `row.js`**

```js
// src/scene/row.js
// One row of blocks — a lane, a standing pile, or a chain with arrows — plus its pins, range plates,
// gold marks, change flashes and an optional label. cells.js draws one; rows.js composes several.
import { COLORS as C } from './stage.js'

export const GAP = 1.0, CHAIN_GAP = 1.5, PILE_STEP = 0.9, SIZE = 0.8
const TWEEN = 0.3, FLASH = 0.4
const PIN_BASE = SIZE / 2 + 1.5
const ease = t => 1 - Math.pow(1 - t, 3)

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

// Camera-fitting size of a resolved row, in cell units (width) and pile cells (height).
export function extentOf(r) {
  if (r.pile) return { width: 1.6, height: Math.max(1, r.cells.length) }
  return { width: r.cells.length * (r.chain ? CHAIN_GAP : GAP), height: 1 }
}

export function createRow(stage, parent, { label = null } = {}) {
  const { THREE } = stage
  const cache = new Map()
  const group = new THREE.Group(); parent.add(group)
  const boxGeo = new THREE.BoxGeometry(SIZE, SIZE, SIZE)
  const edgeGeo = new THREE.EdgesGeometry(boxGeo)
  const pinGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.1, 12)
  const tipGeo = new THREE.ConeGeometry(0.11, 0.26, 16)
  const arrowGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.42, 10)
  const headGeo = new THREE.ConeGeometry(0.09, 0.2, 12)
  const cells = []         // { mesh, edges, valueSprite, indexSprite, text, flashT, marked }
  const arrows = []        // meshes between chained blocks (shaft + head per gap, one shared material per gap)
  const pins = new Map()   // key -> { group, sprite, beam, tip, from, to, t, label }
  const rangeMeshes = []
  let count = -1, pile = false, chain = false, elapsed = 0
  let labelSprite = null

  const gap = () => (chain ? CHAIN_GAP : GAP)
  // Position of cell i: along x for a lane/chain, up y for a pile (index 0 at the bottom).
  const posOf = (i, n) => pile ? new THREE.Vector3(0, i * PILE_STEP, 0) : new THREE.Vector3((i - (n - 1) / 2) * gap(), 0, 0)

  const freeCells = () => {
    for (const c of cells) { group.remove(c.mesh, c.edges, c.valueSprite, c.indexSprite); c.mesh.material.dispose(); c.edges.material.dispose() }
    cells.length = 0
    for (const a of arrows) { group.remove(a.shaft, a.head); a.mat.dispose() }
    arrows.length = 0
  }

  function buildCells(n) {
    freeCells()
    for (let i = 0; i < n; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.12, roughness: 0.35, metalness: 0.2 })
      const mesh = new THREE.Mesh(boxGeo, mat)
      const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.8 }))
      const valueSprite = new THREE.Sprite(makeText(THREE, cache, '', '#d7e6ff')); valueSprite.scale.set(1.1, 0.55, 1)
      const indexSprite = new THREE.Sprite(makeText(THREE, cache, String(i), '#6e83a6', 40)); indexSprite.scale.set(0.8, 0.4, 1)
      const p = posOf(i, n)
      mesh.position.copy(p); edges.position.copy(p)
      if (pile) {
        valueSprite.position.set(p.x, p.y, SIZE / 2 + 0.3)                  // on the front face
        indexSprite.position.set(p.x - SIZE / 2 - 0.35, p.y, 0)              // beside the left face
      } else {
        valueSprite.position.set(p.x, SIZE / 2 + 0.36, 0)
        indexSprite.position.set(p.x, -SIZE / 2 + 0.02, SIZE / 2 + 0.42)
      }
      group.add(mesh, edges, valueSprite, indexSprite)
      cells.push({ mesh, edges, valueSprite, indexSprite, text: null, flashT: 0, marked: false })
    }
    if (chain) for (let i = 0; i < n - 1; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: C.violet, emissive: C.violet, emissiveIntensity: 0.9 })
      const shaft = new THREE.Mesh(arrowGeo, mat); shaft.rotation.z = -Math.PI / 2
      const head = new THREE.Mesh(headGeo, mat); head.rotation.z = -Math.PI / 2
      const mid = (posOf(i, n).x + posOf(i + 1, n).x) / 2
      shaft.position.set(mid - 0.08, 0, 0); head.position.set(mid + 0.2, 0, 0)
      group.add(shaft, head); arrows.push({ shaft, head, mat })
    }
    if (labelSprite) { group.remove(labelSprite); labelSprite = null }
    if (label) {
      labelSprite = new THREE.Sprite(makeText(THREE, cache, label, '#6e83a6', 44)); labelSprite.scale.set(1.6, 0.42, 1)
      if (pile) labelSprite.position.set(0, Math.max(n, 1) * PILE_STEP + 0.2, 0)
      else labelSprite.position.set(posOf(0, n).x - gap() * 0.5 - 0.9, 0.1, 0)
      group.add(labelSprite)
    }
    count = n
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
    g.visible = false
    group.add(g)
    const p = { group: g, sprite, beam, tip, from: new THREE.Vector3(), to: new THREE.Vector3(), t: 1, label: key }
    pins.set(key, p)
    return p
  }
  // Where a pin for cell i sits: above a lane cell; pointing in from the right of a pile cell.
  const pinTarget = (i, n) => {
    const p = posOf(i, n)
    return pile ? new THREE.Vector3(1.1, p.y, 0) : new THREE.Vector3(p.x, PIN_BASE, 0)
  }

  function baseLook(cell) {
    cell.mesh.material.emissive.setHex(cell.marked ? C.gold : C.edge)
    cell.mesh.material.emissiveIntensity = cell.marked ? 0.75 : 0.12
    cell.edges.material.color.setHex(cell.marked ? C.gold : C.edge)
  }

  function update(r, { instant = false } = {}) {
    if (!r) return
    const reshape = !!r.pile !== pile || !!r.chain !== chain
    pile = !!r.pile; chain = !!r.chain
    const rebuilt = reshape || r.cells.length !== count
    if (rebuilt) buildCells(r.cells.length)
    const snap = instant || stage.reduced
    r.cells.forEach((c, i) => {
      const cell = cells[i]
      if (cell.text !== c.text) { cell.valueSprite.material = makeText(THREE, cache, c.text, '#d7e6ff'); cell.text = c.text }
      cell.marked = r.marks.includes(i)
      baseLook(cell)
      if (!snap && !rebuilt && r.changed.includes(i)) cell.flashT = FLASH
    })
    const seen = new Set(), onCell = new Map()
    for (const p of r.pointers) {
      const pin = pinFor(p.key); seen.add(p.key)
      const target = pinTarget(p.index, count)
      pin.group.rotation.z = pile ? -Math.PI / 2 : 0
      if (pin.label !== p.label) { pin.sprite.material = makeText(THREE, cache, p.label, '#c9b8ff', 44); pin.label = p.label }
      if (!pin.group.visible || snap || rebuilt) { pin.to.copy(target); pin.from.copy(target); pin.t = 1; pin.group.position.copy(target) }
      else if (!pin.to.equals(target)) { pin.from.copy(pin.group.position); pin.to.copy(target); pin.t = 0 }
      pin.group.visible = true
      const k = onCell.get(p.index) ?? 0; onCell.set(p.index, k + 1)
      pin.sprite.position.y = 1.35 + k * 0.5
    }
    for (const [key, pin] of pins) if (!seen.has(key)) pin.group.visible = false
    for (const m of rangeMeshes) { group.remove(m); m.geometry.dispose(); m.material.dispose() }
    rangeMeshes.length = 0
    if (!pile) for (const g of r.ranges) {
      const w = (g.to - g.from) * gap() + SIZE + 0.24
      const plate = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, SIZE + 0.3),
        new THREE.MeshBasicMaterial({ color: C.glow, transparent: true, opacity: 0.22 }))
      plate.position.set((posOf(g.from, count).x + posOf(g.to, count).x) / 2, -SIZE / 2 - 0.02, 0)
      group.add(plate); rangeMeshes.push(plate)
    }
  }

  const off = stage.onTick(dt => {
    elapsed += dt
    for (const pin of pins.values()) {
      if (pin.t < 1) { pin.t = Math.min(1, pin.t + dt / TWEEN); pin.group.position.lerpVectors(pin.from, pin.to, ease(pin.t)) }
      else if (!stage.reduced && !pile) pin.group.position.y = pin.to.y + Math.sin(elapsed * 2.2) * 0.04
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

  const setPosition = (x, z) => { group.position.set(x, 0, z) }
  const extent = () => extentOf({ pile, chain, cells })

  function dispose() {
    off?.()
    for (const m of rangeMeshes) { group.remove(m); m.geometry.dispose(); m.material.dispose() }
    rangeMeshes.length = 0
    freeCells()
    for (const p of pins.values()) { group.remove(p.group); p.beam.material.dispose(); p.tip.material.dispose() }
    pins.clear()
    for (const mat of cache.values()) { mat.map.dispose(); mat.dispose() }
    cache.clear()
    boxGeo.dispose(); edgeGeo.dispose(); pinGeo.dispose(); tipGeo.dispose(); arrowGeo.dispose(); headGeo.dispose()
    parent.remove(group)
  }

  return { update, setPosition, extent, dispose }
}
```

`stage.onTick` currently returns `undefined` (a `Set.add` result). Change it in `stage.js` to return an unsubscribe: `onTick: fn => { ticks.add(fn); return () => ticks.delete(fn) }`. This closes a deferred wave-1 minor and is required now that rows come and go.

The pile pin group is rotated `-π/2` about z: its beam lies horizontal to the right of the block, its tip points left at the block, and its label sits farther right.

- [ ] **Step 3: Rewrite `cells.js`**

```js
// src/scene/cells.js
// Kind 'cells': one row at the origin. Re-frames the camera when the row's shape changes.
import { createRow, extentOf } from './row.js'

export function createCells(stage) {
  const row = createRow(stage, stage.scene)
  let shape = ''
  return {
    update(r, opts) {
      if (!r || r.kind !== 'cells') return
      const s = `${r.pile}|${r.chain}|${r.cells.length}`
      if (s !== shape) { shape = s; const e = extentOf(r); stage.frame({ width: e.width, height: e.height }) }
      row.update(r, opts)
    },
    dispose: () => row.dispose(),
  }
}
```

- [ ] **Step 4: Write `rows.js`**

```js
// src/scene/rows.js
// Kind 'rows': lanes laid front to back (first row farthest), piles standing at the right end of the
// front lane. Re-frames the camera when any row's shape changes.
import { createRow, extentOf } from './row.js'

const LANE_STEP = 1.6, PILE_STEP_X = 1.6

export function createRows(stage) {
  const { THREE } = stage
  const root = new THREE.Group(); stage.scene.add(root)
  let rows = []        // createRow handles, by position
  let shape = ''

  // Place lanes and piles; return the extent for stage.frame.
  function layout(r) {
    const lanes = r.rows.filter(x => !x.pile), piles = r.rows.filter(x => x.pile)
    const widest = Math.max(1, ...lanes.map(x => extentOf(x).width))
    const L = lanes.length
    const frontZ = ((L - 1) / 2) * LANE_STEP
    let lane = 0, pileN = 0
    r.rows.forEach((x, i) => {
      if (x.pile) { rows[i].setPosition(widest / 2 + 1.5 + pileN * PILE_STEP_X, frontZ); pileN++ }
      else { rows[i].setPosition(0, (lane - (L - 1) / 2) * LANE_STEP); lane++ }
    })
    return { width: widest + piles.length * PILE_STEP_X, depth: Math.max(1, L), height: Math.max(1, ...piles.map(x => x.cells.length)) }
  }

  return {
    update(r, opts) {
      if (!r || r.kind !== 'rows') return
      if (rows.length !== r.rows.length) {
        for (const h of rows) h.dispose()
        rows = r.rows.map(x => createRow(stage, root, { label: x.label }))
      }
      const s = r.rows.map(x => `${x.pile}|${x.chain}|${x.cells.length}`).join(';')
      if (s !== shape) { shape = s; stage.frame(layout(r)) }
      r.rows.forEach((x, i) => rows[i].update(x, opts))
    },
    dispose() {
      for (const h of rows) h.dispose()
      rows = []
      stage.scene.remove(root)
    },
  }
}
```

- [ ] **Step 5: SceneView dispatch**

In `src/components/SceneView.vue` replace the renderer lines inside `onMounted`'s `try` with:

```js
    const { createStage } = await import('../scene/stage.js')
    const [{ createCells }, { createRows }] = await Promise.all([import('../scene/cells.js'), import('../scene/rows.js')])
    if (dead) return
    stage = await createStage(host.value)
    if (dead) { stage.dispose(); stage = null; return }
    prev = resolve(props.scene, props.state, null)
    cells = (prev?.kind === 'rows' ? createRows : createCells)(stage)
    if (prev) cells.update(prev, { instant: true })
    stage.start()
```

(the variable stays named `cells`; the watch and unmount code do not change).

- [ ] **Step 6: First rows content — merging**

In `src/data/training/merging.js`, the second `explain` (with `code:`) gets:

```js
      scene: { kind: 'rows', rows: [
        { label: 'a', data: [1, 4], pointers: ['i'] },
        { label: 'b', data: [2, 3], pointers: ['j'] },
        { label: 'out', data: 'out', init: [] },
      ], states: [{ i: 0, j: 0, out: [] }, { i: 1, j: 0, out: [1] }, { i: 1, j: 1, out: [1, 2] }, { i: 1, j: 2, out: [1, 2, 3] }, { i: 2, j: 2, out: [1, 2, 3, 4] }] },
```

and the `trace(...)` a fourth argument:

```js
      { scene: { kind: 'rows', rows: [
        { label: 'a', data: [1, 4], pointers: ['i'] },
        { label: 'b', data: [2, 3], pointers: ['j'] },
        { label: 'out', data: 'out', init: [] },
      ] } }),
```

- [ ] **Step 7: Check, test, build**

Run: `npm run check && npm test && npm run build 2>&1 | grep -E "row|cells|✓ built"`
Expected: all pass; the build lists chunks for the scene modules and `✓ built`.

- [ ] **Step 8: Browser check**

Dev server on 5199; create a save; seed in the console and reload:

```js
const f = JSON.parse(localStorage.getItem('ledger-saves-v1')); const s = f.slots.find(x => x.id === f.current)
s.data.mode = 'training'
for (const n of ['method','loops','arrays-in-place','two-pointers','binary-search','sorting','tracking','hash-maps','stacks','sets','strings','frequency','prefix-sums']) s.data.training.nodes[n] = { step: 0, cleared: true }
for (const t of ['tool-list','tool-string','tool-dict','tool-set','tool-stack','tool-queue','tool-heap','tool-recursion','tool-linked-node','tool-tree-node','tool-graph','tool-table']) s.data.training.tools[t] = { step: 0, cleared: true }
localStorage.setItem('ledger-saves-v1', JSON.stringify(f)); location.reload()
```

(add any lesson a `needs:` line names). Confirm:
1. Wave-1 regression: `two-pointers` explain and trace look as before (one row, two pins, labels; pins slide on answers; nothing turns on its own).
2. `merging` explain: three lanes, labels `a`, `b`, `out` at the left ends, `out` nearest the camera and growing through the loop; pins `i`, `j` on the back lanes.
3. `merging` trace: stop 1 shows `a` and `b` with pins and an empty `out`; after each answer `out` grows with a green flash on the new block.
4. Reduced-motion emulation: pins snap, no bobbing.
5. No console errors. Stop the server.

- [ ] **Step 9: Commit**

```bash
git add src/scene/row.js src/scene/rows.js src/scene/cells.js src/scene/stage.js src/components/SceneView.vue src/data/training/merging.js
git commit -m "feat(scene): rows kind — row.js renderer, lanes and piles, stage.frame; merging gets three lanes"
```

---

### Task 4: Content batch — the nine `cells` items

**Files:** `src/data/training/strings.js`, `dp-line.js`, `dp-choices.js`, `union-find.js`, `search-the-answer.js`, `tools/tool-queue.js`, `tools/tool-heap.js`, `tools/tool-stack.js`, `tools/tool-set.js`

Lessons: `scene` on the second `explain` (with `code:`) and a 4th argument on `trace`. Tools: `scene` on the first `explain` (their code is there). Never edit frames, notes, prose or tests. Two scenes per file, exactly as below.

- [ ] **strings**
```js
// explain[1]
scene: { kind: 'cells', data: 'ok go', pointers: ['i'], states: [{ i: 0 }, { i: 1 }, { i: 2 }] },
// trace
{ scene: { kind: 'cells', data: 'ok go', pointers: ['i'] } }
```
- [ ] **dp-line**
```js
scene: { kind: 'cells', data: 'table', init: [0, 1, 0, 0, 0, 0], pointers: ['i'],
  states: [{ table: [0, 1, 0, 0, 0, 0] }, { i: 2, table: [0, 1, 1, 0, 0, 0] }, { i: 3, table: [0, 1, 1, 2, 0, 0] }, { i: 4, table: [0, 1, 1, 2, 3, 0] }, { i: 5, table: [0, 1, 1, 2, 3, 5] }] },
{ scene: { kind: 'cells', data: 'table', init: [0, 1, 0, 0, 0, 0], pointers: ['i'] } }
```
- [ ] **dp-choices**
```js
scene: { kind: 'cells', data: 'table', init: [1, 0, 0, 0, 0], pointers: ['a'],
  states: [{ table: [1, 0, 0, 0, 0] }, { a: 1, table: [1, 1, 0, 0, 0] }, { a: 2, table: [1, 1, 2, 0, 0] }, { a: 3, table: [1, 1, 2, 3, 0] }, { a: 4, table: [1, 1, 2, 3, 5] }] },
{ scene: { kind: 'cells', data: 'table', init: [1, 0, 0, 0, 0], pointers: ['a'] } }
```
- [ ] **union-find**
```js
scene: { kind: 'cells', data: 'parent', init: [0, 1, 2, 3, 4], pointers: ['a', 'b', 'ra', 'rb'],
  states: [{ a: 0, b: 1, ra: 0, rb: 1, parent: [0, 1, 2, 3, 4] }, { a: 0, b: 1, parent: [0, 0, 2, 3, 4] }, { a: 2, b: 3, ra: 2, rb: 3, parent: [0, 0, 2, 2, 4] }, { a: 1, b: 3, ra: 0, rb: 2, parent: [0, 0, 0, 2, 4] }] },
{ scene: { kind: 'cells', data: 'parent', init: [0, 1, 2, 3, 4], pointers: ['a', 'b', 'ra', 'rb'] } }
```
- [ ] **search-the-answer**
```js
scene: { kind: 'cells', data: [3, 6, 7, 11], marks: ['p'], states: [{ p: 3 }, { p: 6 }, { p: 7 }, { p: 11 }] },
{ scene: { kind: 'cells', data: [3, 6, 7, 11], marks: ['p'] } }
```
- [ ] **tool-queue** (explain[0])
```js
scene: { kind: 'cells', data: 'list(line)', init: ['ana', 'boyd'], marks: ['first'],
  states: [{ 'list(line)': ['ana', 'boyd'] }, { 'list(line)': ['ana', 'boyd', 'cass'] }, { first: 'ana', 'list(line)': ['boyd', 'cass'] }, { first: 'ana', 'list(line)': ['boyd', 'cass', 'dov'] }] },
{ scene: { kind: 'cells', data: 'list(line)', init: ['ana', 'boyd'], marks: ['first'] } }
```
- [ ] **tool-heap** (explain[0])
```js
scene: { kind: 'cells', data: 'drawer', init: [4, 9], marks: ['first'],
  states: [{ drawer: [4, 9] }, { drawer: [4, 9, 5] }, { drawer: [2, 4, 5, 9] }, { first: 2, drawer: [4, 9, 5] }] },
{ scene: { kind: 'cells', data: 'drawer', init: [4, 9], marks: ['first'] } }
```
- [ ] **tool-stack** (explain[0])
```js
scene: { kind: 'cells', data: 'tray', init: [], pile: true, marks: ['taken'],
  states: [{ tray: [] }, { tray: ['papers'] }, { tray: ['papers', 'badge'] }, { taken: 'badge', tray: ['papers'] }] },
{ scene: { kind: 'cells', data: 'tray', init: [], pile: true, marks: ['taken'] } }
```
- [ ] **tool-set** (explain[0])
```js
scene: { kind: 'cells', data: 'sorted(seen)', init: [], marks: ['p'],
  states: [{ p: 'HB44', 'sorted(seen)': ['HB44'] }, { p: 'KT19', 'sorted(seen)': ['HB44', 'KT19'] }, { p: 'HB44', 'sorted(seen)': ['HB44', 'KT19'] }] },
{ scene: { kind: 'cells', data: 'sorted(seen)', init: [], marks: ['p'] } }
```
- [ ] **Check, test, browser spot-check, commit**

`npm run check && npm test`. Browser: `tool-stack` (a standing pile that grows then loses its top; the `taken` mark lights the popped word on the explain loop), `tool-queue` (the non-identifier key reads the frames; the `first` mark lights `ana`). Stop the server.

```bash
git add src/data/training/strings.js src/data/training/dp-line.js src/data/training/dp-choices.js src/data/training/union-find.js src/data/training/search-the-answer.js src/data/training/tools/tool-queue.js src/data/training/tools/tool-heap.js src/data/training/tools/tool-stack.js src/data/training/tools/tool-set.js
git commit -m "content(training): table scenes for strings, dp line/choices, union-find, search-the-answer, queue/heap/stack/set tools"
```

---

### Task 5: Content batch — eight `rows` items and two chains

**Files:** `src/data/training/monotonic.js`, `knapsack-dp.js`, `enumeration.js`, `backtracking.js`, `stacks.js`, `prefix-sums.js`, `string-search.js`, `topo-order.js`, `linked-lists.js`, `tools/tool-linked-node.js`

Same placement rules as Task 4.

- [ ] **monotonic**
```js
scene: { kind: 'rows', rows: [
  { label: 'nums', data: [2, 1, 3], pointers: ['i'] },
  { label: 'out', data: 'out', init: [-1, -1, -1] },
  { label: 'stack', data: 'stack', init: [], pile: true },
], states: [{ i: 0, out: [-1, -1, -1], stack: [0] }, { i: 1, out: [-1, -1, -1], stack: [0, 1] }, { i: 2, out: [-1, 3, -1], stack: [0] }, { i: 2, out: [3, 3, -1], stack: [] }, { out: [3, 3, -1], stack: [2] }] },
{ scene: { kind: 'rows', rows: [
  { label: 'nums', data: [2, 1, 3], pointers: ['i'] },
  { label: 'out', data: 'out', init: [-1, -1, -1] },
  { label: 'stack', data: 'stack', init: [], pile: true },
] } }
```
- [ ] **knapsack-dp**
```js
scene: { kind: 'rows', rows: [
  { label: 'weights', data: [1, 2], pointers: ['i'] },
  { label: 'values', data: [1, 3], pointers: ['i'] },
  { label: 'row', data: 'row', init: [0, 0, 0, 0], pointers: ['c'] },
], states: [{ row: [0, 0, 0, 0] }, { i: 0, c: 1, row: [0, 1, 1, 1] }, { i: 1, c: 2, row: [0, 1, 3, 4] }] },
{ scene: { kind: 'rows', rows: [
  { label: 'weights', data: [1, 2], pointers: ['i'] },
  { label: 'values', data: [1, 3], pointers: ['i'] },
  { label: 'row', data: 'row', init: [0, 0, 0, 0], pointers: ['c'] },
] } }
```
- [ ] **enumeration**
```js
scene: { kind: 'rows', rows: [
  { label: 'serials', data: [1, 2], pointers: ['i'] },
  { label: 'chosen', data: 'chosen', init: [], pile: true },
], states: [{ i: 0, chosen: [1] }, { i: 2, chosen: [1, 2] }, { i: 1, chosen: [1] }, { i: 0, chosen: [] }, { i: 2, chosen: [] }] },
{ scene: { kind: 'rows', rows: [
  { label: 'serials', data: [1, 2], pointers: ['i'] },
  { label: 'chosen', data: 'chosen', init: [], pile: true },
] } }
```
- [ ] **backtracking**
```js
scene: { kind: 'rows', rows: [
  { label: 'coins', data: [2, 3], pointers: ['i'] },
  { label: 'chosen', data: 'chosen', init: [], pile: true },
], states: [{ i: 0, chosen: [2] }, { i: 1, chosen: [2, 3] }, { i: 1, chosen: [2] }, { i: 0, chosen: [] }, { i: 1, chosen: [3] }] },
{ scene: { kind: 'rows', rows: [
  { label: 'coins', data: [2, 3], pointers: ['i'] },
  { label: 'chosen', data: 'chosen', init: [], pile: true },
] } }
```
- [ ] **stacks**
```js
scene: { kind: 'rows', rows: [
  { label: 'card', data: '(()' },
  { label: 'pile', data: 'stack', init: [], pile: true },
], states: [{ stack: ['('] }, { stack: ['(', '('] }, { stack: ['('] }] },
{ scene: { kind: 'rows', rows: [
  { label: 'card', data: '(()' },
  { label: 'pile', data: 'stack', init: [], pile: true },
] } }
```
- [ ] **prefix-sums**
```js
scene: { kind: 'rows', rows: [
  { label: 'serials', data: [3, 1, 4], marks: ['n'] },
  { label: 'pre', data: 'pre', init: [0], pointers: ['i', 'j'], ranges: [['i', 'j']] },
], states: [{ n: 3, pre: [0, 3] }, { n: 1, pre: [0, 3, 4] }, { n: 4, pre: [0, 3, 4, 8] }, { pre: [0, 3, 4, 8], i: 1, j: 3 }] },
{ scene: { kind: 'rows', rows: [
  { label: 'serials', data: [3, 1, 4], marks: ['n'] },
  { label: 'pre', data: 'pre', init: [0], pointers: ['i', 'j'], ranges: [['i', 'j']] },
] } }
```
- [ ] **string-search**
```js
scene: { kind: 'rows', rows: [
  { label: 'pat', data: 'abab', pointers: ['i', 'k'] },
  { label: 'table', data: 'table', init: [0, 0, 0, 0] },
], states: [{ i: 1, k: 0, table: [0, 0, 0, 0] }, { i: 2, k: 1, table: [0, 0, 1, 0] }, { i: 3, k: 2, table: [0, 0, 1, 2] }] },
{ scene: { kind: 'rows', rows: [
  { label: 'pat', data: 'abab', pointers: ['i', 'k'] },
  { label: 'table', data: 'table', init: [0, 0, 0, 0] },
] } }
```
- [ ] **topo-order**
```js
scene: { kind: 'rows', rows: [
  { label: 'indeg', data: 'indeg', init: [0, 1, 1, 2], pointers: ['node', 'nxt'] },
  { label: 'queue', data: 'queue', init: [0] },
], states: [{ indeg: [0, 1, 1, 2], queue: [0] }, { node: 0, nxt: 2, indeg: [0, 0, 0, 2], queue: [1, 2] }, { node: 1, nxt: 3, indeg: [0, 0, 0, 1], queue: [2] }, { node: 2, nxt: 3, indeg: [0, 0, 0, 0], queue: [3] }] },
{ scene: { kind: 'rows', rows: [
  { label: 'indeg', data: 'indeg', init: [0, 1, 1, 2], pointers: ['node', 'nxt'] },
  { label: 'queue', data: 'queue', init: [0] },
] } }
```
- [ ] **linked-lists** (chain)
```js
scene: { kind: 'cells', chain: true, data: [1, 2, 3, 4, 5], at: ['slow.val', 'fast.val'], labels: { 'slow.val': 'slow', 'fast.val': 'fast' },
  states: [{ 'slow.val': 1, 'fast.val': 1 }, { 'slow.val': 1, 'fast.val': 3 }, { 'slow.val': 2, 'fast.val': 3 }, { 'slow.val': 3, 'fast.val': 5 }, { 'slow.val': 3 }] },
{ scene: { kind: 'cells', chain: true, data: [1, 2, 3, 4, 5], at: ['slow.val', 'fast.val'], labels: { 'slow.val': 'slow', 'fast.val': 'fast' } } }
```
- [ ] **tool-linked-node** (chain, explain[0])
```js
scene: { kind: 'cells', chain: true, data: ['meet', 'pay', 'burn'], at: ['a.next.val', 'b.next.val'], labels: { 'a.next.val': 'a.next', 'b.next.val': 'b.next' },
  states: [{ 'a.next.val': 'pay' }, { 'a.next.val': 'pay', 'a.next.next.val': 'burn' }, { 'a.next.val': 'burn', 'b.next.val': 'burn' }] },
{ scene: { kind: 'cells', chain: true, data: ['meet', 'pay', 'burn'], at: ['a.next.val', 'b.next.val'], labels: { 'a.next.val': 'a.next', 'b.next.val': 'b.next' } } }
```
- [ ] **Check, test, browser spot-check, commit**

`npm run check && npm test`. Browser: `monotonic` (two lanes plus a pile at the right that grows and empties), `linked-lists` (five chained blocks with arrows; two pins hop along; `fast` vanishes on the last stop), `prefix-sums` (range plate under `pre` from 1 to 3 on the last state). Stop the server.

```bash
git add src/data/training/monotonic.js src/data/training/knapsack-dp.js src/data/training/enumeration.js src/data/training/backtracking.js src/data/training/stacks.js src/data/training/prefix-sums.js src/data/training/string-search.js src/data/training/topo-order.js src/data/training/linked-lists.js src/data/training/tools/tool-linked-node.js
git commit -m "content(training): table scenes — rows for monotonic, knapsack, enumeration, backtracking, stacks, prefix sums, string search, topo; chains for linked lists"
```

---

### Task 6: Docs and final verification

**Files:** `CLAUDE.md`, both 3D specs.

- [ ] **CLAUDE.md**: in the Layout `src/scene/` bullet add `row.js` (the block renderer: lane, pile or chain) and `rows.js` (lanes and piles); in the Training node schema `scene` bullet, after the `cells` descriptor sentence add: "Also `at?: ['slow.val']` (pins by value), `pile?: true`, `chain?: true`; and kind `rows`: `{ kind: 'rows', rows: [{ label, ...cells fields }] }` (1–4 rows, first farthest, piles at the right). A string `data` with `init` is a state key even when it is not an identifier."
- [ ] **Specs**: wave-2a Status → `implemented — see docs/superpowers/plans/2026-09-09-training-3d-scenes-wave2a.md`; wave-1 spec Files block gains `row.js`, `rows.js`.
- [ ] **Verify**: `npm run check && npm test && npm run build 2>&1 | tail -6`. `npm run preview`: heist screen makes no three request; open one `rows` lesson and one chain in the production build; no console errors. Stop the server.
- [ ] **Commit** (no push — the finishing step decides):
```bash
git add CLAUDE.md docs/superpowers/specs/2026-09-09-training-3d-scenes-design.md docs/superpowers/specs/2026-09-09-training-3d-scenes-wave2a-design.md
git commit -m "docs: the table wave 2a — rows, piles, chains, at pins"
```

---

## Self-review notes

- **Spec coverage:** key rule (T1, T2), `at` (T1, T2, T5), pile/chain (T1–T3, T4 stack tool, T5), rows kind and layout (T1–T3, T5), camera framing (T3), no auto-orbit (unchanged), validation rules (T2), tests (T1, T2), browser checks (T3–T6), twenty items (T3 merging + T4 nine + T5 ten = 20), docs (T6).
- **Types:** `ResolvedRow` fields (`label, pile, chain, cells, pointers, ranges, marks, changed, source`) used identically in model, validate (`resolveRow`), row.js (`extentOf`, `update`); `createRow(stage, parent, { label })` used by cells.js (`stage.scene`) and rows.js (`root`); `stage.frame({ width, depth, height })` and the new `onTick` unsubscribe used by row.js; SceneView's `cells.update(resolved, { instant })` contract unchanged.
- **Judgement calls:** pile pins point in from the right; `at` pins never range-check; the chain's arrows are static (recorded in the spec); `frame()` is a heuristic (span grows with depth and height) to be tuned by eye in Task 3's browser check; `onTick` now returns an unsubscribe (closes a wave-1 deferred minor).
