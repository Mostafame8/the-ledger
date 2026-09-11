# Training 3D Scenes — Wave 2c Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put a picture on the last twelve scene-less training items: dicts as keyed rows, graphs with authored positions, trees (binary and trie) with automatic layout, a call-stack pile for recursion, and a two-grid pair for the table tool.

**Architecture:** One content-model rule, the twin value `{ py, val }`, lets a frame keep its Python answer text and hand the table a literal; `model.js` reads every state value through `valueOf`. `cells` grows a dict form (row.js swaps the index sprite for the key). `grid` grows a `grids` pair. Two new kinds, `graph` and `tree`, get resolvers in `model.js`, rules in `validate.js`, and renderers `graph.js`/`tree.js`; `SceneView.vue` adds them to its kind map. `validate.js` also exports `stateErrors` (the twin-value rule), which `check-training` runs on every step.

**Tech Stack:** Vue 3, Vite 5, three 0.186, `node --test`, Chrome for visual checks.

**Spec:** `docs/superpowers/specs/2026-09-11-training-3d-scenes-wave2c-design.md` (with waves 1, 2a, 2b).

## Global Constraints

- No new dependencies; three only through `stage.js`'s dynamic import. No CSS changes. No auto-orbit or idle camera motion. No story-prop skins or emoji.
- The table never reads a `py` string; a value that only has `py` is Python text and is never drawn as a structure.
- `val` appears only beside `py`; `val` never carries `py` itself.
- Graph: `pos` has one `[x, z]` int pair per node; `adj` has `pos.length` entries; neighbours are ints in `0..n-1`; no mixing plain and weighted entries.
- Tree: binary node `{ val, left?, right? }` or map node; map keys non-empty, no whitespace; depth ≤ 6, nodes ≤ 31.
- Grid pair: 1–2 entries, unique labels, `cursor`/`heads` only in the single form; never both `data` and `grids`.
- Content edits to existing frames are additive only: a `val` beside an existing `py`, or a new `calls` key. No `ask`, `py`, note, prose, or reference-solution changes.
- Every wave-1/2a/2b scene renders exactly as before.
- Run `npm run check && npm test` after every content change. Commit after every task.

---

### Task 1: Twin values and dict rows — model, validator, row.js

**Files:**
- Modify: `src/scene/model.js`, `src/scene/validate.js`, `src/scene/row.js`, `scripts/check-training.mjs`
- Test: `tests/scene-model.test.mjs`, `tests/scene-validate.test.mjs`

**Interfaces:**
- Produces: `valueOf(v)` and `read(state, key)` (exported from `model.js`; every later resolver uses `read`). `isDict(v)` exported. `resolveRow` result gains `keyed: boolean` and, on dict rows, `key` on each cell. `stateErrors(step) → string[]` exported from `validate.js`, called by `check-training`.

- [ ] **Step 1: Failing model tests** — append to `tests/scene-model.test.mjs` (also add `valueOf, read, isDict` to the import line):

```js
test('valueOf/read: a twin value hands the table its val; everything else passes through', () => {
  assert.deepEqual(valueOf({ py: '{0, 1}', val: [0, 1] }), [0, 1])
  assert.deepEqual(valueOf({ py: '(1, 3)' }), { py: '(1, 3)' })
  assert.equal(valueOf(7), 7); assert.equal(valueOf(null), null)
  assert.deepEqual(read({ seen: { py: '{0}', val: [0] } }, 'seen'), [0])
  assert.equal(read(undefined, 'x'), undefined)
})

test('isDict: plain objects only — not arrays, not py text, not twins', () => {
  assert.equal(isDict({ a: 1 }), true); assert.equal(isDict({}), true)
  assert.equal(isDict([1]), false); assert.equal(isDict({ py: '{}' }), false); assert.equal(isDict({ py: '{}', val: {} }), false); assert.equal(isDict(null), false)
})

test('resolveRow: dict row — entries in order with keys; at matches a key or a value; growth and change flagged', () => {
  const sc = { kind: 'cells', data: 'tally', init: {}, at: ['ch'] }
  const r0 = resolve(sc, {})
  assert.equal(r0.keyed, true); assert.deepEqual(r0.cells, [])
  const r1 = resolve(sc, { ch: 'a', tally: { a: 1 } }, r0)
  assert.deepEqual(r1.cells, [{ index: 0, text: '1', key: 'a' }]); assert.deepEqual(r1.changed, [0])
  assert.deepEqual(r1.pointers, [{ key: 'ch', index: 0, label: 'ch' }])
  const r2 = resolve(sc, { ch: 'b', tally: { a: 1, b: 1 } }, r1)
  assert.deepEqual(r2.cells.map(c => c.key), ['a', 'b']); assert.deepEqual(r2.changed, [1])
  const r3 = resolve(sc, { ch: 'a', tally: { a: 2, b: 1 } }, r2)
  assert.deepEqual(r3.changed, [0]); assert.deepEqual(r3.pointers.map(p => p.index), [0])
  const r4 = resolve({ kind: 'cells', data: { x: 5, y: 5 }, at: ['v'] }, { v: 5 })
  assert.deepEqual(r4.pointers.map(p => p.index), [0, 1])      // value match still works
})

test('resolveRow: a twin value drives marks and at; a py-only value never becomes the row', () => {
  const r = resolve({ kind: 'cells', data: [0, 1, 2, 3], marks: ['seen'] }, { seen: { py: '{0, 2}', val: 2 } })
  assert.deepEqual(r.marks, [2])
  const sc = { kind: 'cells', data: 'store', init: {} }
  const r0 = resolve(sc, { store: { py: '{1: 1}', val: { 1: 1 } } })
  assert.deepEqual(r0.cells, [{ index: 0, text: '1', key: '1' }])
  const r1 = resolve(sc, { store: { py: '{1: 1, 2: 2}' } }, r0)   // no val: previous row stays
  assert.deepEqual(r1.cells.map(c => c.key), ['1'])
})

test('resolveRow: list rows keep keyed false and no key on cells', () => {
  const r = resolve({ kind: 'cells', data: [1, 2] }, {})
  assert.equal(r.keyed, false); assert.equal('key' in r.cells[0], false)
})
```

- [ ] **Step 2: Failing validator tests** — append to `tests/scene-validate.test.mjs` (add `stateErrors` to the import):

```js
test('dict rows: literal object or key with object init; no pointers or ranges; frame shape must match', () => {
  assert.deepEqual(sceneErrors(tr({ kind: 'cells', data: 'tally', init: {}, at: ['ch'] }, { ch: 'a', tally: { a: 1 } }, { ch: 'b', tally: { a: 1, b: 1 } }, { ch: 'a', tally: { a: 2, b: 1 } })), [])
  assert.deepEqual(sceneErrors(ex({ kind: 'cells', data: { a: 1, b: 2 }, at: ['k'], states: [{ k: 'a' }] })), [])
  assert.match(sceneErrors(ex({ kind: 'cells', data: {} }))[0], /empty/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: 'tally', init: {}, pointers: ['i'] }, { i: 0, tally: {} }, { i: 0 }, { i: 0 }))[0], /dict row has no index pointers/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: 'tally', init: {}, ranges: [[0, 1]] }, { tally: {} }, { tally: {} }, { tally: {} }))[0], /dict row has no ranges/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: 'tally', init: {} }, { tally: [1] }, { tally: {} }, { tally: {} }))[0], /'tally' is a list at frame 0/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: 'nums', init: [] }, { nums: { a: 1 } }, { nums: [] }, { nums: [] }))[0], /'nums' is a dict at frame 0/)
  assert.match(sceneErrors(tr({ kind: 'cells', data: 'store', init: {} }, { store: { py: '{1: 1}' } }, { store: {} }, { store: {} }))[0], /'store' at frame 0 is Python text/)
})

test('stateErrors: val only beside py; val never carries py; checked on frames and explain states', () => {
  assert.deepEqual(stateErrors(tr(undefined, { seen: { py: '{0}', val: [0] } }, { x: 1 }, { x: 1 })), [])
  assert.match(stateErrors(tr(undefined, { seen: { val: [0] } }, { x: 1 }, { x: 1 }))[0], /'seen' at frame 0 has val without py/)
  assert.match(stateErrors(tr(undefined, { x: 1 }, { d: { py: '[inf]', val: { py: 'inf' } } }, { x: 1 }))[0], /'d' at frame 1: val must not carry py/)
  assert.match(stateErrors(ex({ kind: 'cells', data: [1], states: [{ q: { val: 1 } }] }))[0], /'q' at state 0 has val without py/)
  assert.deepEqual(stateErrors({ type: 'spot', options: [] }), [])
})
```

- [ ] **Step 3: RED** — `node --test tests/scene-model.test.mjs tests/scene-validate.test.mjs` fails: `valueOf`/`stateErrors` not exported.

- [ ] **Step 4: model.js** — add after `dataIsKey`:

```js
// A twin value carries the Python answer text in `py` and a drawable literal in `val`.
// The table takes `val`; anything else passes through untouched.
export const valueOf = v => (v && typeof v === 'object' && !Array.isArray(v) && 'py' in v && 'val' in v) ? v.val : v
export const read = (state, key) => valueOf(state?.[key])
// A plain object the table may draw as a dict: not a list, not Python text, not a twin.
export const isDict = v => !!v && typeof v === 'object' && !Array.isArray(v) && !('py' in v)
```

Then replace, in order:

```js
// rowFor
function rowFor(row, state, prev) {
  const d = row.data
  if (Array.isArray(d) || isDict(d)) return d
  if (!dataIsKey(row)) return d
  const v = read(state, d)
  if (isList(v) || isDict(v)) return v
  if (prev?.source !== undefined) return prev.source
  return row.init ?? []
}
// toCells
const toCells = src => isDict(src)
  ? Object.entries(src).map(([key, v], index) => ({ index, text: cellText(v), key }))
  : Array.from(src, (v, index) => ({ index, text: cellText(v) }))
// helpers
const intAt = (state, k) => (typeof k === 'number' ? k : read(state, k))
const present = (state, key) => key in state && read(state, key) !== null && read(state, key) !== undefined
```

In `resolveRow`: `const keyed = isDict(source)` after `source`; pointers loop reads `const v = read(state, key)`; the `at` loop becomes

```js
  for (const key of row.at || []) {                 // value pins: one per matching cell (a dict row also matches its keys)
    if (!present(state, key)) continue
    const t = cellText(read(state, key))
    for (const c of cells) if (c.text === t || (keyed && c.key === t)) pointers.push({ key, index: c.index, label: captioned(row, key) })
  }
```

marks loop: `const t = cellText(read(state, key))`. `changed` compares a signature so a key swap counts:

```js
  const sig = c => (c.key !== undefined ? `${c.key}=${c.text}` : c.text)
  const changed = []
  if (prev?.kind === 'cells') {
    for (let i = 0; i < len; i++) if (!prev.cells[i] || sig(prev.cells[i]) !== sig(cells[i])) changed.push(i)
  } else cells.forEach(c => changed.push(c.index))
  return { kind: 'cells', label: row.label ?? null, pile: !!row.pile, chain: !!row.chain, keyed, cells, pointers, ranges, marks, changed, source }
```

Also switch the remaining direct reads in `resolveGrid` (`gridFor`'s `state?.[scene.data]`, cursor `state[rk]`/`state[ck]`, marks `cellText(read(state, key))`) and `resolveLine` (`barsFor`, span, pins) to `read(state, …)`. Behaviour for non-twin values is identical.

- [ ] **Step 5: validate.js** — import `read, isDict` from model; add helpers and rules:

```js
const pyOnly = v => !!v && typeof v === 'object' && !Array.isArray(v) && 'py' in v && !('val' in v)
const size = v => (Array.isArray(v) || typeof v === 'string') ? v.length : Object.keys(v).length
```

In `rowShape`:

```js
  const isKey = dataIsKey(row)
  if (!isList(row.data) && !isDict(row.data)) bad('data must be a list, a string, an object, or a state key')
  else if (!isKey && size(row.data) === 0) bad('data is empty')
  if (isKey && !isList(row.init) && !isDict(row.init)) bad(`data is the state key '${row.data}' so init (the list or dict before the first frame) is required`)
  const dictRow = isDict(isKey ? row.init : row.data)
  if (dictRow && (Array.isArray(row.pointers) ? row.pointers.length : Object.keys(row.pointers || {}).length)) bad('a dict row has no index pointers (use at or marks)')
  if (dictRow && row.ranges?.length) bad('a dict row has no ranges')
```

In `rowWalk`, inside the per-frame loop before `prev = r`:

```js
    if (dataIsKey(row)) {
      const raw = st[row.data], v = read(st, row.data)
      const dictRow = isDict(row.init)
      if (pyOnly(raw)) bad(`'${row.data}' at ${where} ${k} is Python text; add a val beside py`)
      else if (v !== undefined && v !== null) {
        if (dictRow && isList(v)) bad(`'${row.data}' is a list at ${where} ${k} but the row is a dict`)
        if (!dictRow && isDict(v)) bad(`'${row.data}' is a dict at ${where} ${k} but the row is a list`)
      }
    }
```

New export, after `sceneErrors`:

```js
// Twin-value rule for every state a step carries: `val` only beside `py`, and never nested in itself.
export function stateErrors(step) {
  const errs = []
  const check = (state, where) => {
    for (const [k, v] of Object.entries(state || {})) {
      if (!v || typeof v !== 'object' || Array.isArray(v)) continue
      if ('val' in v && !('py' in v)) errs.push(`'${k}' at ${where} has val without py`)
      if ('py' in v && typeof v.py !== 'string') errs.push(`'${k}' at ${where}: py must be a string`)
      if ('val' in v && v.val && typeof v.val === 'object' && !Array.isArray(v.val) && 'py' in v.val) errs.push(`'${k}' at ${where}: val must not carry py`)
    }
  }
  if (step?.type === 'trace') (step.frames || []).forEach((f, i) => check(f.state, `frame ${i}`))
  if (step?.type === 'explain') (step.scene?.states || []).forEach((s, i) => check(s, `state ${i}`))
  return errs
}
```

`scripts/check-training.mjs`: import `stateErrors` beside `sceneErrors` and add `for (const e of stateErrors(s)) fail(`${at}: ${e}`)` right after the `sceneErrors` loop.

- [ ] **Step 6: row.js** — the index sprite shows the key on a dict row. In `buildCells` push `keyText: null` into the cell record. In `update`, inside `r.cells.forEach`, after the text swap:

```js
      const want = c.key !== undefined ? c.key : null
      if (cell.keyText !== want) {
        cell.indexSprite.material = makeText(THREE, cache, want ?? String(i), want ? '#9fb3d9' : '#6e83a6', 40)
        cell.keyText = want
      }
```

- [ ] **Step 7: GREEN** — `npm test` passes (model + validator new tests, every older test unchanged). `npm run check` passes (no content uses the new forms yet).

- [ ] **Step 8: Spec note** — in the wave-2c spec's "Kind `cells` — dict form" section add the sentence: "On a dict row `at` also matches a block whose key equals the value's text, so `at: ['ch']` pins the letter's card." (Implementation choice: pinning by key is what every dict lesson needs.)

- [ ] **Step 9: Commit**

```bash
git add src/scene/model.js src/scene/validate.js src/scene/row.js scripts/check-training.mjs tests/scene-model.test.mjs tests/scene-validate.test.mjs docs/superpowers/specs/2026-09-11-training-3d-scenes-wave2c-design.md
git commit -m "feat(scene): twin values and dict rows — valueOf, keyed cells, stateErrors"
```

---

### Task 2: Grid pair — model, validator, grid.js

**Files:**
- Modify: `src/scene/model.js` (`resolveGrid`), `src/scene/validate.js` (`gridErrors`), `src/scene/grid.js`
- Test: `tests/scene-model.test.mjs`, `tests/scene-validate.test.mjs`

**Interfaces:**
- Produces: `resolveGrid` → `{ kind: 'grid', grids: [{ label, rows, cols, tiles, marks, changed, source }], cursor, heads, rows, cols, tiles, marks, changed, source }` where the top-level `rows…source` mirror `grids[0]` (older tests, the validator walk and `heads` handling keep working). `grid.js` reads `grids` only.

- [ ] **Step 1: Failing model tests**

```js
test('resolveGrid: grids pair — two entries side by side, each with its own tiles, marks and changed; top level mirrors entry 0', () => {
  const sc = { kind: 'grid', grids: [{ label: 'good', data: 'good', init: [[0, 0], [0, 0]] }, { label: 'bad', data: 'bad', init: [[0, 0], [0, 0]] }], marks: ['v'] }
  const r0 = resolve(sc, { good: [[0, 0], [0, 0]] })
  assert.equal(r0.grids.length, 2); assert.deepEqual(r0.grids.map(g => g.label), ['good', 'bad'])
  assert.equal(r0.rows, 2); assert.deepEqual(r0.tiles, r0.grids[0].tiles)
  const r1 = resolve(sc, { good: [[0, 0], [0, 7]], bad: [[0, 7], [0, 7]], v: 7 }, r0)
  assert.deepEqual(r1.grids[0].changed, [[1, 1]]); assert.deepEqual(r1.grids[1].changed, [[0, 1], [1, 1]])
  assert.deepEqual(r1.grids[0].marks, [[1, 1]]); assert.deepEqual(r1.grids[1].marks, [[0, 1], [1, 1]]); assert.deepEqual(r1.marks, [[1, 1]])
  const r2 = resolve(sc, { v: 7 }, r1)
  assert.deepEqual(r2.grids[1].tiles.map(t => t.text), ['0', '7', '0', '7']); assert.deepEqual(r2.grids[1].changed, [])
})

test('resolveGrid: the single form is one unlabelled entry', () => {
  const r = resolve({ kind: 'grid', data: [[1, 2]] }, {})
  assert.equal(r.grids.length, 1); assert.equal(r.grids[0].label, null); assert.deepEqual(r.grids[0].tiles, r.tiles)
})
```

- [ ] **Step 2: Failing validator tests**

```js
test('grid pair: 1–2 entries with unique labels, each rectangular; cursor/heads only in the single form; not both data and grids', () => {
  const pair = { grids: [{ label: 'good', data: 'good', init: [[0, 0, 0], [0, 0, 0]] }, { label: 'bad', data: 'bad', init: [[0, 0, 0], [0, 0, 0]] }] }
  assert.deepEqual(sceneErrors(G(pair, { good: [[0, 0, 0], [0, 0, 0]] }, { bad: [[0, 0, 0], [0, 0, 0]] }, { good: [[0, 0, 0], [0, 0, 7]] })), [])
  assert.match(sceneErrors(G({ grids: [...pair.grids, { label: 'c', data: [[1]] }] }, { good: [[1]] }, { bad: [[1]] }, { x: 1 }))[0], /1 or 2 grids/)
  assert.match(sceneErrors(G({ grids: [pair.grids[0], { ...pair.grids[1], label: 'good' }] }, { good: [[1]] }, { bad: [[1]] }, { x: 1 }))[0], /unique/)
  assert.match(sceneErrors(G({ grids: [{ label: 'a', data: [[1, 2], [3]] }] }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /grid 'a'.*rectangular/)
  assert.match(sceneErrors(G({ ...pair, cursor: ['r', 'c'] }, { r: 0, c: 0, good: [[1]] }, { bad: [[1]] }, { x: 1 }))[0], /cursor belongs to the single-grid form/)
  assert.match(sceneErrors(G({ ...pair, heads: { rows: ['a', 'b'] } }, { good: [[1]] }, { bad: [[1]] }, { x: 1 }))[0], /heads belong to the single-grid form/)
  assert.match(sceneErrors(G({ ...pair, data: [[1]] }, { good: [[1]] }, { bad: [[1]] }, { x: 1 }))[0], /data and grids/)
  assert.match(sceneErrors(G({ grids: [{ label: 'g', data: 'g', init: [[0]] }] }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /'g' never/)
})
```

- [ ] **Step 3: RED** — both files fail (`r0.grids` undefined; pair errors absent).

- [ ] **Step 4: model.js `resolveGrid`**

```js
// The grid entries of a scene: `grids` as given, or the single form as one unlabelled entry.
const gridEntries = scene => Array.isArray(scene.grids) ? scene.grids : [{ label: null, data: scene.data, init: scene.init }]

function gridFor(g, state, prev) {
  if (isGrid(g.data)) return g.data
  const v = read(state, g.data)
  if (isGrid(v)) return v
  if (prev?.source !== undefined) return prev.source
  return g.init ?? []
}

export function resolveGrid(scene, state = {}, prev = null) {
  const markTexts = (scene.marks || []).filter(key => present(state, key)).map(key => cellText(read(state, key)))
  const grids = gridEntries(scene).map((g, i) => {
    const pg = prev?.kind === 'grid' ? prev.grids?.[i] ?? null : null
    const source = gridFor(g, state, pg)
    const rows = source.length, cols = rows ? Math.max(...source.map(r => r.length)) : 0
    const tiles = []
    source.forEach((row, r) => row.forEach((v, c) => tiles.push({ r, c, text: cellText(v), bool: v === true ? true : v === false ? false : null })))
    const marks = []
    for (const t of markTexts) for (const tl of tiles) if (tl.text === t) marks.push([tl.r, tl.c])
    const before = pg ? new Map(pg.tiles.map(t => [`${t.r},${t.c}`, t.text])) : null
    const changed = tiles.filter(tl => !before || before.get(`${tl.r},${tl.c}`) !== tl.text).map(tl => [tl.r, tl.c])
    return { label: g.label ?? null, rows, cols, tiles, marks, changed, source }
  })
  const g0 = grids[0]
  let cursor = null
  if (Array.isArray(scene.cursor) && scene.cursor.length === 2) {
    const [rk, ck] = scene.cursor, r = read(state, rk), c = read(state, ck)
    if (Number.isInteger(r) && Number.isInteger(c) && r >= 0 && r < g0.rows && c >= 0 && c < g0.cols) cursor = { r, c, label: `${captioned(scene, rk)}, ${captioned(scene, ck)}` }
  }
  return { kind: 'grid', grids, cursor, heads: scene.heads ?? null, rows: g0.rows, cols: g0.cols, tiles: g0.tiles, marks: g0.marks, changed: g0.changed, source: g0.source }
}
```

(The wave-2b marks test expects `[[0, 1], [1, 1]]` for one grid — the mirror keeps it.)

- [ ] **Step 5: validate.js `gridErrors`** — at the top of the function, before the existing `isKey` line:

```js
  const pair = sc.grids !== undefined
  if (pair) {
    if (sc.data !== undefined) bad('data and grids cannot both be given')
    if (sc.cursor !== undefined) bad('cursor belongs to the single-grid form')
    if (sc.heads !== undefined) bad('heads belong to the single-grid form')
    if (!Array.isArray(sc.grids) || sc.grids.length < 1 || sc.grids.length > 2) { bad('grids must be an array of 1 or 2 grids'); return errs }
    const labels = new Set()
    sc.grids.forEach((g, i) => {
      const tag = `grid ${typeof g?.label === 'string' ? `'${g.label}'` : i}`
      if (typeof g?.label !== 'string' || !g.label) bad(`${tag}: needs a string label`)
      else if (labels.has(g.label)) bad(`${tag}: labels must be unique`)
      labels.add(g?.label)
      const k = typeof g?.data === 'string'
      if (!k && !rect(g?.data)) bad(`${tag}: data must be a rectangular 2-D list or a state key`)
      if (k && !rect(g.init)) bad(`${tag}: data is the state key '${g.data}' so a rectangular init is required`)
    })
    if (sc.marks !== undefined && !strings(sc.marks)) bad('marks must be an array of state keys')
    if (Object.keys(sc.labels || {}).length) bad('labels belong to the single-grid form')
    if (errs.length) return errs
    const keyed = [...(sc.marks || []), ...sc.grids.filter(g => typeof g.data === 'string').map(g => g.data)]
    for (const k of new Set(keyed)) if (!states.some(st => k in st)) bad(`'${k}' never appears in any ${where}`)
    states.forEach((st, k) => { for (const g of sc.grids) if (typeof g.data === 'string' && pyOnly(st[g.data])) bad(`'${g.data}' at ${where} ${k} is Python text; add a val beside py`) })
    return errs
  }
```

The single-form code below it stays as is.

- [ ] **Step 6: grid.js** — one sub-group per entry, laid left to right `1.0` apart, a label sprite in front of each; cursor on entry 0. Replace the file:

```js
// src/scene/grid.js
// Kind 'grid': one or two grids of flat tiles on the floor (row 0 farthest), side by side, each with
// row/column heads or indices and a label; a cursor pin above tile (r, c) of the first grid; gold marks
// by value; lit/dark boolean tiles; green flashes on changed tiles.
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'
import { createPin } from './pin.js'

const GAP = 1.0, TILE = 0.8, H = 0.16, FLASH = 0.4, PAIR_GAP = 1.0

export function createGrid(stage) {
  const { THREE, scene } = stage
  const cache = new Map()
  const root = new THREE.Group(); scene.add(root)
  const tileGeo = new THREE.BoxGeometry(TILE, H, TILE)
  const edgeGeo = new THREE.EdgesGeometry(tileGeo)
  let parts = []            // one per grid entry: { group, tiles, sprites, rows, cols, x0 }
  let shape = '', cursor = null, elapsed = 0
  const xOf = (p, c) => p.x0 + (c - (p.cols - 1) / 2) * GAP
  const zOf = (p, r) => (r - (p.rows - 1) / 2) * GAP          // row 0 farthest (most negative z)

  const free = () => {
    for (const p of parts) {
      for (const t of p.tiles) { p.group.remove(t.mesh, t.edges, t.sprite); t.mesh.material.dispose(); t.edges.material.dispose() }
      for (const s of p.sprites) p.group.remove(s)
      root.remove(p.group)
    }
    parts = []
  }
  const label = (p, text, x, z, color = '#6e83a6') => {
    if (!text) return
    const s = new THREE.Sprite(makeText(THREE, cache, text, color, 44)); s.scale.set(0.9, 0.45, 1); s.position.set(x, 0.1, z)
    p.group.add(s); p.sprites.push(s)
  }
  function build(r) {
    free()
    const widths = r.grids.map(g => Math.max(1, g.cols) * GAP)
    const total = widths.reduce((a, b) => a + b, 0) + (r.grids.length - 1) * PAIR_GAP
    let x = -total / 2
    r.grids.forEach((g, i) => {
      const p = { group: new THREE.Group(), tiles: [], sprites: [], rows: g.rows, cols: g.cols, x0: x + widths[i] / 2 }
      root.add(p.group); parts.push(p)
      for (const tl of g.tiles) {
        const mat = new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.12, roughness: 0.4, metalness: 0.15 })
        const mesh = new THREE.Mesh(tileGeo, mat)
        const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.8 }))
        const sprite = new THREE.Sprite(makeText(THREE, cache, '', '#d7e6ff')); sprite.scale.set(0.9, 0.45, 1)
        mesh.position.set(xOf(p, tl.c), 0, zOf(p, tl.r)); edges.position.copy(mesh.position); sprite.position.set(xOf(p, tl.c), H / 2 + 0.3, zOf(p, tl.r))
        p.group.add(mesh, edges, sprite)
        p.tiles.push({ r: tl.r, c: tl.c, mesh, edges, sprite, text: null, bool: null, marked: false, flashT: 0 })
      }
      const heads = i === 0 ? r.heads : null
      const rh = heads?.rows ?? Array.from({ length: g.rows }, (_, k) => String(k))
      const ch = heads?.cols ?? Array.from({ length: g.cols }, (_, k) => String(k))
      rh.forEach((t, k) => label(p, t, xOf(p, 0) - 0.9, zOf(p, k)))
      ch.forEach((t, k) => label(p, t, xOf(p, k), zOf(p, 0) - 0.9))
      if (g.label) label(p, g.label, p.x0, zOf(p, g.rows - 1) + 0.95, '#9fb3d9')
      x += widths[i] + PAIR_GAP
    })
    const rows = Math.max(1, ...r.grids.map(g => g.rows))
    stage.frame({ width: total / GAP, depth: rows + 1 })
  }
  const at = (p, r, c) => p.tiles.find(t => t.r === r && t.c === c)
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
    const s = r.grids.map(g => `${g.label}|${g.rows}x${g.cols}`).join(';') + '|' + JSON.stringify(r.heads ?? null)
    if (s !== shape) { shape = s; build(r) }
    const snap = instant || stage.reduced
    r.grids.forEach((g, i) => {
      const p = parts[i]
      const changed = new Set(g.changed.map(q => q.join(','))), marks = new Set(g.marks.map(q => q.join(',')))
      for (const tl of g.tiles) {
        const t = at(p, tl.r, tl.c); if (!t) continue
        if (t.text !== tl.text) { t.sprite.material = makeText(THREE, cache, tl.text, '#d7e6ff'); t.text = tl.text }
        t.bool = tl.bool; t.marked = marks.has(`${tl.r},${tl.c}`); look(t)
        if (!snap && changed.has(`${tl.r},${tl.c}`)) t.flashT = FLASH
      }
    })
    if (r.cursor) {
      const p = parts[0]
      cursor ??= createPin(stage, root, cache, r.cursor.label)
      cursor.setLabel(r.cursor.label)
      cursor.show(new THREE.Vector3(xOf(p, r.cursor.c), H / 2 + 1.5, zOf(p, r.cursor.r)), snap)
    } else cursor?.hide()
  }

  const off = stage.onTick(dt => {
    elapsed += dt
    cursor?.tick(dt, stage.reduced ? 0 : Math.sin(elapsed * 2.2) * 0.04)
    for (const p of parts) for (const t of p.tiles) if (t.flashT > 0) {
      t.flashT = Math.max(0, t.flashT - dt)
      const k = t.flashT / FLASH
      t.mesh.material.emissive.setHex(C.ok); t.mesh.material.emissiveIntensity = 0.12 + 0.9 * k
      if (t.flashT === 0) look(t)
    }
  })

  function dispose() {
    off?.(); free(); cursor?.dispose(); cursor = null
    for (const m of cache.values()) { m.map.dispose(); m.dispose() }
    cache.clear(); tileGeo.dispose(); edgeGeo.dispose(); scene.remove(root)
  }
  return { update, dispose }
}
```

- [ ] **Step 7: GREEN + browser** — `npm test` and `npm run check` pass. `npm run dev`; open training `flood-fill`, `two-strings`, `interval-dp`: identical to before (single grid, heads, cursor). Stop the server.

- [ ] **Step 8: Commit**

```bash
git add src/scene/model.js src/scene/validate.js src/scene/grid.js tests/scene-model.test.mjs tests/scene-validate.test.mjs
git commit -m "feat(scene): grid pair — grids entries side by side; single form unchanged"
```

---

### Task 3: Graph — model and validator

**Files:**
- Modify: `src/scene/model.js` (`KINDS`, `resolveGraph`, dispatch), `src/scene/validate.js` (`graphErrors`, dispatch)
- Test: `tests/scene-model.test.mjs`, `tests/scene-validate.test.mjs`

**Interfaces:**
- Produces: `resolveGraph(scene, state, prev)` → `{ kind: 'graph', directed, nodes: [{ i, name, pos: [x, z], badge: string|null, marked }], edges: [{ u, v, w: int|null, glow, changed }], pins: [{ key, node, label }], source }`. `KINDS` becomes `['cells', 'rows', 'grid', 'line', 'graph', 'tree']` (the `tree` resolver lands in Task 5; set the array now and update the "constants" test in this task).

- [ ] **Step 1: Failing model tests** — update the constants test to `['cells', 'rows', 'grid', 'line', 'graph', 'tree']` and append (add `resolveGraph` to the import):

```js
const napkin = { kind: 'graph', adj: [[1, 2], [0, 3], [0], [1]], pos: [[0, 0], [2, 0], [0, 2], [2, 2]], at: ['node', 'nxt'], marks: ['seen'], labels: { nxt: 'next' } }

test('resolveGraph: literal adjacency → merged undirected edges, nodes with pos and default names', () => {
  const r = resolve(napkin, {})
  assert.equal(r.kind, 'graph'); assert.equal(r.directed, false)
  assert.deepEqual(r.nodes.map(n => [n.i, n.name, n.pos, n.badge, n.marked]), [[0, '0', [0, 0], null, false], [1, '1', [2, 0], null, false], [2, '2', [0, 2], null, false], [3, '3', [2, 2], null, false]])
  assert.deepEqual(r.edges.map(e => [e.u, e.v, e.w]), [[0, 1, null], [0, 2, null], [1, 3, null]])
  assert.ok(r.edges.every(e => e.changed)); assert.deepEqual(r.pins, [])
})

test('resolveGraph: pins by node index with labels; the edge between two pinned nodes glows; marks from a twin list', () => {
  const r = resolve(napkin, { node: 0, nxt: 2, seen: { py: '{0, 1, 2}', val: [0, 1, 2] } })
  assert.deepEqual(r.pins, [{ key: 'node', node: 0, label: 'node' }, { key: 'nxt', node: 2, label: 'nxt · next' }])
  assert.deepEqual(r.edges.filter(e => e.glow).map(e => [e.u, e.v]), [[0, 2]])
  assert.deepEqual(r.nodes.filter(n => n.marked).map(n => n.i), [0, 1, 2])
  assert.deepEqual(resolve(napkin, { node: 7, nxt: null }).pins, [])
})

test('resolveGraph: weighted pairs carry w; badges text under each node; names override', () => {
  const sc = { kind: 'graph', adj: [[[1, 1], [2, 4]], [[0, 1], [2, 2]], [[0, 4], [1, 2], [3, 1]], [[2, 1]]], pos: [[0, 0], [2, 0], [1, 2], [3, 2]], badges: 'dist', names: ['a', 'b', 'c', 'd'] }
  const r = resolve(sc, { dist: { py: '[0, 1, 4, inf]', val: [0, 1, 4, { py: 'inf' }] } })
  assert.deepEqual(r.edges.map(e => [e.u, e.v, e.w]), [[0, 1, 1], [0, 2, 4], [1, 2, 2], [2, 3, 1]])
  assert.deepEqual(r.nodes.map(n => n.badge), ['0', '1', '4', 'inf']); assert.deepEqual(r.nodes.map(n => n.name), ['a', 'b', 'c', 'd'])
  assert.deepEqual(resolve(sc, {}).nodes.map(n => n.badge), [null, null, null, null])
})

test('resolveGraph: keyed adjacency grows; only new edges are changed; missing key keeps the previous graph; directed keeps both arrows', () => {
  const sc = { kind: 'graph', adj: 'adj', init: [[], [], [], []], pos: [[0, 0], [2, 0], [2, 2], [0, 2]] }
  const r0 = resolve(sc, {}); assert.deepEqual(r0.edges, [])
  const r1 = resolve(sc, { adj: [[1], [0], [], []] }, r0); assert.deepEqual(r1.edges.map(e => [e.u, e.v, e.changed]), [[0, 1, true]])
  const r2 = resolve(sc, { adj: [[1], [0, 2], [1], []] }, r1); assert.deepEqual(r2.edges.map(e => [e.u, e.v, e.changed]), [[0, 1, false], [1, 2, true]])
  const r3 = resolve(sc, {}, r2); assert.deepEqual(r3.edges.map(e => [e.u, e.v]), [[0, 1], [1, 2]])
  const d = resolve({ kind: 'graph', adj: [[1], [0]], pos: [[0, 0], [1, 0]], directed: true }, {})
  assert.deepEqual(d.edges.map(e => [e.u, e.v]), [[0, 1], [1, 0]]); assert.equal(d.directed, true)
})
```

- [ ] **Step 2: Failing validator tests** — add a helper beside `G`/`L` and tests. Also change the existing `unknown kind` fixture from `{ kind: 'tree', data: [1] }` to `{ kind: 'blob', data: [1] }` since `tree` becomes a kind.

```js
const GR = (sc, ...states) => tr({ kind: 'graph', ...sc }, ...states)

test('graph: pos per node; adj length and neighbours in range; no mixed weights; names length; directed boolean', () => {
  const ok = { adj: [[1, 2], [0, 3], [0], [1]], pos: [[0, 0], [2, 0], [0, 2], [2, 2]], at: ['node'] }
  assert.deepEqual(sceneErrors(GR(ok, { node: 0 }, { node: 1 }, { node: 3 })), [])
  assert.match(sceneErrors(GR({ ...ok, pos: [[0, 0], [2, 0]] }, { node: 0 }, { node: 0 }, { node: 0 }))[0], /adj must have 2 entries/)
  assert.match(sceneErrors(GR({ ...ok, adj: [[1, 9], [0], [0], [1]] }, { node: 0 }, { node: 0 }, { node: 0 }))[0], /neighbour 9/)
  assert.match(sceneErrors(GR({ ...ok, adj: [[[1, 2]], [0], [], []] }, { node: 0 }, { node: 0 }, { node: 0 }))[0], /mix/)
  assert.match(sceneErrors(GR({ ...ok, pos: [[0, 0], [2, 0], [0, 2], [2]] }, { node: 0 }, { node: 0 }, { node: 0 }))[0], /pos/)
  assert.match(sceneErrors(GR({ ...ok, names: ['a'] }, { node: 0 }, { node: 0 }, { node: 0 }))[0], /names must have 4/)
  assert.match(sceneErrors(GR({ ...ok, directed: 'yes' }, { node: 0 }, { node: 0 }, { node: 0 }))[0], /directed/)
  assert.match(sceneErrors(GR({ ...ok, labels: { q: 'x' } }, { node: 0 }, { node: 0 }, { node: 0 }))[0], /labels/)
})

test('graph: keyed adj needs init and appears; per-frame at range, marks lists, badges length; py-only adj named', () => {
  const k = { adj: 'adj', init: [[], [], [], []], pos: [[0, 0], [2, 0], [2, 2], [0, 2]], at: ['u', 'v'], marks: ['seen'], badges: 'dist' }
  assert.deepEqual(sceneErrors(GR(k, { adj: [[], [], [], []], seen: [0], dist: [0, 1, 2, 3] }, { u: 0, v: 1, adj: [[1], [0], [], []] }, { u: 1, v: 2 })), [])
  assert.match(sceneErrors(GR({ ...k, init: undefined }, { adj: [[], [], [], []], seen: [0], dist: [0, 0, 0, 0] }, { u: 0, v: 1 }, { u: 1, v: 2 }))[0], /init/)
  assert.match(sceneErrors(GR(k, { adj: [[], [], [], []], seen: [0], dist: [0, 0, 0, 0] }, { u: 0, v: 4 }, { u: 1, v: 2 }))[0], /'v' is 4 at frame 1/)
  assert.match(sceneErrors(GR(k, { adj: [[], [], [], []], seen: [0, 9], dist: [0, 0, 0, 0] }, { u: 0, v: 1 }, { u: 1, v: 2 }))[0], /'seen'.*frame 0/)
  assert.match(sceneErrors(GR(k, { adj: [[], [], [], []], seen: [0], dist: [0, 0] }, { u: 0, v: 1 }, { u: 1, v: 2 }))[0], /'dist' must have 4 entries at frame 0/)
  assert.match(sceneErrors(GR(k, { adj: { py: '[[1]]' }, seen: [0], dist: [0, 0, 0, 0] }, { u: 0, v: 1 }, { u: 1, v: 2 }))[0], /'adj' at frame 0 is Python text/)
  assert.match(sceneErrors(GR(k, { seen: [0], dist: [0, 0, 0, 0] }, { u: 0, v: 1 }, { u: 1, v: 2 }))[0], /'adj' never/)
})
```

- [ ] **Step 3: RED** — `resolveGraph` not exported; graph scenes report `unknown kind`.

- [ ] **Step 4: model.js** — `export const KINDS = ['cells', 'rows', 'grid', 'line', 'graph', 'tree']` and, before `resolve`:

```js
const isAdj = v => Array.isArray(v) && v.every(Array.isArray)
function adjFor(scene, state, prev) {
  if (isAdj(scene.adj)) return scene.adj
  const v = read(state, scene.adj)
  if (isAdj(v)) return v
  if (prev?.source !== undefined) return prev.source
  return scene.init ?? []
}

export function resolveGraph(scene, state = {}, prev = null) {
  const source = adjFor(scene, state, prev)
  const n = Array.isArray(scene.pos) ? scene.pos.length : 0
  const directed = !!scene.directed
  const edges = [], ids = new Set()
  source.forEach((list, u) => {
    if (u >= n) return
    for (const e of list || []) {
      const v = Array.isArray(e) ? e[0] : e, w = Array.isArray(e) && Number.isInteger(e[1]) ? e[1] : null
      if (!Number.isInteger(v) || v < 0 || v >= n) continue
      const a = directed ? u : Math.min(u, v), b = directed ? v : Math.max(u, v), id = `${a}-${b}`
      if (ids.has(id)) continue
      ids.add(id); edges.push({ u: a, v: b, w, glow: false, changed: false })
    }
  })
  const pins = []
  for (const key of scene.at || []) {
    const v = read(state, key)
    if (Number.isInteger(v) && v >= 0 && v < n) pins.push({ key, node: v, label: captioned(scene, key) })
  }
  const pinned = new Set(pins.map(p => p.node))
  for (const e of edges) if (e.u !== e.v && pinned.has(e.u) && pinned.has(e.v)) e.glow = true
  const marked = new Set()
  for (const key of scene.marks || []) {
    const v = read(state, key)
    if (Array.isArray(v)) for (const i of v) if (Number.isInteger(i) && i >= 0 && i < n) marked.add(i)
  }
  const badges = scene.badges ? read(state, scene.badges) : undefined
  const nodes = Array.from({ length: n }, (_, i) => ({
    i, name: scene.names?.[i] ?? String(i), pos: scene.pos[i],
    badge: Array.isArray(badges) && i < badges.length ? cellText(badges[i]) : null, marked: marked.has(i),
  }))
  const before = prev?.kind === 'graph' ? new Set(prev.edges.map(e => `${e.u}-${e.v}`)) : null
  for (const e of edges) e.changed = !before || !before.has(`${e.u}-${e.v}`)
  return { kind: 'graph', directed, nodes, edges, pins, source }
}
```

In `resolve` add `if (scene.kind === 'graph') return resolveGraph(scene, state, prev?.kind === 'graph' ? prev : null)`.

- [ ] **Step 5: validate.js `graphErrors`** — import `resolveGraph` is not needed (the walk re-checks shapes directly); add before `sceneErrors`:

```js
// One adjacency list against n nodes. Returns messages; `weighted` is decided by the first entry seen.
function adjErrors(adj, n, tag) {
  const errs = [], bad = m => errs.push(m)
  if (!Array.isArray(adj) || !adj.every(Array.isArray)) { bad(`${tag}: adj must be a list of neighbour lists`); return errs }
  if (adj.length !== n) { bad(`${tag}: adj must have ${n} entries, one per pos`); return errs }
  let weighted = null
  adj.forEach((list, u) => { for (const e of list) {
    const isPair = Array.isArray(e)
    if (weighted === null) weighted = isPair
    else if (weighted !== isPair) { bad(`${tag}: adj must not mix plain neighbours and [neighbour, weight] pairs`); return }
    const v = isPair ? e[0] : e
    if (isPair && !(e.length === 2 && Number.isInteger(e[1]))) bad(`${tag}: entry ${JSON.stringify(e)} of node ${u} must be [neighbour, weight]`)
    if (!(Number.isInteger(v) && v >= 0 && v < n)) bad(`${tag}: neighbour ${JSON.stringify(v)} of node ${u} is outside 0..${n - 1}`)
  } })
  return errs
}

function graphErrors(sc, states, where) {
  const errs = [], bad = m => errs.push(m)
  if (!(pairsOk(sc.pos) && sc.pos.length > 0)) { bad('pos must be a non-empty list of [x, z] integer pairs, one per node'); return errs }
  const n = sc.pos.length
  const isKey = typeof sc.adj === 'string'
  if (isKey && sc.init === undefined) bad(`adj is the state key '${sc.adj}' so init is required`)
  else for (const m of adjErrors(isKey ? sc.init : sc.adj, n, isKey ? 'init' : 'adj')) bad(m)
  if (sc.names !== undefined && !(strings(sc.names) && sc.names.length === n)) bad(`names must have ${n} entries`)
  if (sc.directed !== undefined && typeof sc.directed !== 'boolean') bad('directed must be true or false')
  if (sc.at !== undefined && !strings(sc.at)) bad('at must be an array of state keys')
  if (sc.marks !== undefined && !strings(sc.marks)) bad('marks must be an array of state keys')
  if (sc.badges !== undefined && !keyish(sc.badges)) bad('badges must be one state key')
  const atKeys = Array.isArray(sc.at) ? sc.at : []
  for (const k of Object.keys(sc.labels || {})) if (!atKeys.includes(k)) bad(`labels names '${k}' which is not an at key`)
  if (errs.length) return errs
  const keyed = [...atKeys, ...(sc.marks || []), ...(sc.badges ? [sc.badges] : []), ...(isKey ? [sc.adj] : [])]
  for (const k of new Set(keyed)) if (!states.some(st => k in st)) bad(`'${k}' never appears in any ${where}`)
  states.forEach((st, k) => {
    const at = ` at ${where} ${k}`
    for (const key of atKeys) { const v = read(st, key); if (key in st && v !== null && v !== undefined && !(Number.isInteger(v) && v >= 0 && v < n)) bad(`'${key}' is ${JSON.stringify(v)}${at}, outside 0..${n - 1}`) }
    for (const key of sc.marks || []) { const v = read(st, key); if (key in st && v !== null && v !== undefined && !(Array.isArray(v) && v.every(i => Number.isInteger(i) && i >= 0 && i < n))) bad(`'${key}' must be a list of node indices${at}`) }
    if (sc.badges && sc.badges in st) { const v = read(st, sc.badges); if (v !== null && v !== undefined && !(Array.isArray(v) && v.length === n)) bad(`'${sc.badges}' must have ${n} entries${at}`) }
    if (isKey && sc.adj in st) {
      if (pyOnly(st[sc.adj])) bad(`'${sc.adj}'${at} is Python text; add a val beside py`)
      else { const v = read(st, sc.adj); if (v !== null && v !== undefined) for (const m of adjErrors(v, n, `'${sc.adj}'${at}`)) bad(m) }
    }
  })
  return errs
}
```

In `sceneErrors`, beside the grid/line dispatch: `if (sc.kind === 'graph') { for (const m of graphErrors(sc, walkStates(), explain ? 'state' : 'frame')) bad(m); return errs }`.

- [ ] **Step 6: GREEN** — `npm test` passes; `npm run check` passes.

- [ ] **Step 7: Commit**

```bash
git add src/scene/model.js src/scene/validate.js tests/scene-model.test.mjs tests/scene-validate.test.mjs
git commit -m "feat(scene): model and validator — graph kind"
```

---

### Task 4: Graph renderer, SceneView dispatch, first content (graphs, tool-graph)

**Files:**
- Create: `src/scene/graph.js`, `src/scene/tree.js` (stub, replaced in Task 6)
- Modify: `src/components/SceneView.vue`, `src/data/training/graphs.js`, `src/data/training/tools/tool-graph.js`

**Interfaces:**
- Consumes: `resolveGraph` result from Task 3; `createPin`, `makeText`, `COLORS`, `stage.frame/onTick/reduced`.
- Produces: `createGraph(stage) → { update(r, { instant }), dispose() }`.

- [ ] **Step 1: `graph.js`**

```js
// src/scene/graph.js
// Kind 'graph': node blocks at authored floor positions, edge rods between them (a weight sprite at the
// midpoint, a cone when directed), badge text under each node, gold marks, violet pins on nodes, a glow
// on the edge joining two pinned nodes, green flashes on new edges.
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'
import { createPin } from './pin.js'

const UNIT = 1.0, SIZE = 0.8, ROD = 0.05, FLASH = 0.4, PIN_BASE = SIZE / 2 + 1.5

export function createGraph(stage) {
  const { THREE, scene } = stage
  const cache = new Map()
  const group = new THREE.Group(); scene.add(group)
  const boxGeo = new THREE.BoxGeometry(SIZE, SIZE, SIZE)
  const edgeGeo = new THREE.EdgesGeometry(boxGeo)
  const coneGeo = new THREE.ConeGeometry(0.1, 0.24, 12)
  let nodes = [], edges = new Map(), nodeKey = '', elapsed = 0
  const pins = new Map()
  let centre = { x: 0, z: 0 }
  const at = i => new THREE.Vector3((nodes[i].pos[0] - centre.x) * UNIT, 0, (nodes[i].pos[1] - centre.z) * UNIT)

  const freeNodes = () => {
    for (const nd of nodes) { group.remove(nd.mesh, nd.edges, nd.name, nd.badge); nd.mesh.material.dispose(); nd.edges.material.dispose() }
    nodes = []
  }
  const freeEdge = e => { group.remove(e.rod, e.weight, e.cone); e.rod.geometry.dispose(); e.mat.dispose() }
  const freeEdges = () => { for (const e of edges.values()) freeEdge(e); edges.clear() }

  function buildNodes(r) {
    freeNodes(); freeEdges()
    const xs = r.nodes.map(n => n.pos[0]), zs = r.nodes.map(n => n.pos[1])
    centre = { x: (Math.min(...xs) + Math.max(...xs)) / 2, z: (Math.min(...zs) + Math.max(...zs)) / 2 }
    nodes = r.nodes.map(n => ({ pos: n.pos, mesh: null, edges: null, name: null, badge: null, badgeText: null, marked: false }))
    r.nodes.forEach((n, i) => {
      const nd = nodes[i], p = at(i)
      nd.mesh = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.12, roughness: 0.35, metalness: 0.2 }))
      nd.edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.8 }))
      nd.mesh.position.copy(p); nd.edges.position.copy(p)
      nd.name = new THREE.Sprite(makeText(THREE, cache, n.name, '#d7e6ff')); nd.name.scale.set(1.1, 0.55, 1); nd.name.position.set(p.x, SIZE / 2 + 0.36, p.z)
      nd.badge = new THREE.Sprite(makeText(THREE, cache, '', '#ffb454', 40)); nd.badge.scale.set(0.9, 0.45, 1); nd.badge.position.set(p.x, -SIZE / 2 + 0.02, p.z + SIZE / 2 + 0.42)
      group.add(nd.mesh, nd.edges, nd.name, nd.badge)
    })
    const w = (Math.max(...xs) - Math.min(...xs)) * UNIT + SIZE, d = (Math.max(...zs) - Math.min(...zs)) * UNIT + SIZE
    stage.frame({ width: w + 1, depth: d + 1 })
  }

  function addEdge(e, r) {
    const a = at(e.u), b = at(e.v), dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz)
    const mat = new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.35 })
    const rod = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.1, len - SIZE), ROD, ROD), mat)
    rod.position.set((a.x + b.x) / 2, -SIZE / 2 + 0.06, (a.z + b.z) / 2); rod.rotation.y = -Math.atan2(dz, dx)
    const weight = new THREE.Sprite(makeText(THREE, cache, e.w === null ? '' : String(e.w), '#9fb3d9', 40)); weight.scale.set(0.7, 0.35, 1)
    weight.position.set((a.x + b.x) / 2, 0.12, (a.z + b.z) / 2); weight.visible = e.w !== null
    const cone = new THREE.Mesh(coneGeo, mat)
    const k = (len - SIZE / 2 - 0.12) / len
    cone.position.set(a.x + dx * k, -SIZE / 2 + 0.06, a.z + dz * k); cone.rotation.set(0, -Math.atan2(dz, dx), -Math.PI / 2); cone.visible = r.directed
    group.add(rod, weight, cone)
    return { rod, weight, cone, mat, glow: false, flashT: 0 }
  }
  const look = e => { e.mat.emissive.setHex(e.glow ? C.glow : C.edge); e.mat.emissiveIntensity = e.glow ? 1.0 : 0.35 }
  const nodeLook = nd => {
    nd.mesh.material.emissive.setHex(nd.marked ? C.gold : C.edge); nd.mesh.material.emissiveIntensity = nd.marked ? 0.75 : 0.12
    nd.edges.material.color.setHex(nd.marked ? C.gold : C.edge)
  }

  function update(r, { instant = false } = {}) {
    if (!r || r.kind !== 'graph') return
    const nk = JSON.stringify(r.nodes.map(n => [n.name, n.pos]))
    const rebuilt = nk !== nodeKey
    if (rebuilt) { nodeKey = nk; buildNodes(r) }
    const snap = instant || stage.reduced
    r.nodes.forEach((n, i) => {
      const nd = nodes[i]
      const bt = n.badge ?? ''
      if (nd.badgeText !== bt) { nd.badge.material = makeText(THREE, cache, bt, '#ffb454', 40); nd.badgeText = bt }
      nd.marked = n.marked; nodeLook(nd)
    })
    const want = new Set(r.edges.map(e => `${e.u}-${e.v}`))
    for (const [id, e] of edges) if (!want.has(id)) { freeEdge(e); edges.delete(id) }
    for (const e of r.edges) {
      const id = `${e.u}-${e.v}`
      if (!edges.has(id)) edges.set(id, addEdge(e, r))
      const ge = edges.get(id)
      ge.glow = e.glow; look(ge)
      if (!snap && e.changed && !rebuilt) ge.flashT = FLASH
    }
    const seen = new Set(), reps = new Map(), onNode = new Map()
    for (const p of r.pins) {
      const n = (reps.get(p.key) ?? 0) + 1; reps.set(p.key, n)
      const id = n === 1 ? p.key : `${p.key}#${n}`
      if (!pins.has(id)) pins.set(id, createPin(stage, group, cache, id))
      const pin = pins.get(id); seen.add(id)
      pin.setLabel(p.label)
      const t = at(p.node); t.y = PIN_BASE
      pin.show(t, snap || rebuilt)
      const k = onNode.get(p.node) ?? 0; onNode.set(p.node, k + 1); pin.stack(k)
    }
    for (const [id, pin] of pins) if (!seen.has(id)) pin.hide()
  }

  const off = stage.onTick(dt => {
    elapsed += dt
    for (const pin of pins.values()) pin.tick(dt, stage.reduced ? 0 : Math.sin(elapsed * 2.2) * 0.04)
    for (const e of edges.values()) if (e.flashT > 0) {
      e.flashT = Math.max(0, e.flashT - dt)
      e.mat.emissive.setHex(C.ok); e.mat.emissiveIntensity = 0.35 + 0.9 * (e.flashT / FLASH)
      if (e.flashT === 0) look(e)
    }
  })

  function dispose() {
    off?.(); freeEdges(); freeNodes()
    for (const p of pins.values()) p.dispose()
    pins.clear()
    for (const m of cache.values()) { m.map.dispose(); m.dispose() }
    cache.clear(); boxGeo.dispose(); edgeGeo.dispose(); coneGeo.dispose(); scene.remove(group)
  }
  return { update, dispose }
}
```

- [ ] **Step 2: Stub `tree.js`** so the dispatch import resolves before Task 6:

```js
// src/scene/tree.js — replaced in Task 6.
export function createTree() { return { update() {}, dispose() {} } }
```

- [ ] **Step 3: SceneView dispatch** — replace the two renderer lines in `onMounted`:

```js
    const [{ createCells }, { createRows }, { createGrid }, { createLine }, { createGraph }, { createTree }] = await Promise.all([
      import('../scene/cells.js'), import('../scene/rows.js'), import('../scene/grid.js'), import('../scene/line.js'), import('../scene/graph.js'), import('../scene/tree.js')])
```
and `const make = { cells: createCells, rows: createRows, grid: createGrid, line: createLine, graph: createGraph, tree: createTree }`.

- [ ] **Step 4: First content** — `graphs.js`: on the second `explain`'s options add `scene:` after `code:`; on `trace` add the 4th argument; add `val` to every `seen`:

```js
// explain (second), after the `code:` template string
scene: { kind: 'graph', adj: [[1, 2], [0, 3], [0], [1]], pos: [[0, 0], [2, 0], [0, 2], [2, 2]], at: ['node', 'nxt'], marks: ['seen'],
  states: [{ node: 0, seen: [0] }, { node: 0, nxt: 2, seen: [0, 1, 2] }, { node: 1, nxt: 3, seen: [0, 1, 2, 3] }, { node: 3, seen: [0, 1, 2, 3] }] }
// trace 4th arg
{ scene: { kind: 'graph', adj: [[1, 2], [0, 3], [0], [1]], pos: [[0, 0], [2, 0], [0, 2], [2, 2]], at: ['node', 'nxt'], marks: ['seen'] } }
// frames: seen values become twins
seen: { py: '{0}', val: [0] }
seen: { py: '{0, 1, 2}', val: [0, 1, 2] }         // frames 2 and 3
seen: { py: '{0, 1, 2, 3}', val: [0, 1, 2, 3] }   // frames 4 and 5
```

`tool-graph.js`: scene on the first `explain` (the code-bearing one) and on `trace`:

```js
scene: { kind: 'graph', adj: 'adj', init: [[], [], [], []], pos: [[0, 0], [2, 0], [2, 2], [0, 2]], at: ['u', 'v'],
  states: [{ adj: [[], [], [], []] }, { u: 0, v: 1, adj: [[1], [0], [], []] }, { u: 1, v: 2, adj: [[1], [0, 2], [1], []] }, { u: 0, v: 3, adj: [[1, 3], [0, 2], [1], [0]] }] }
{ scene: { kind: 'graph', adj: 'adj', init: [[], [], [], []], pos: [[0, 0], [2, 0], [2, 2], [0, 2]], at: ['u', 'v'] } }
```

- [ ] **Step 5: Check, test, build, browser** — `npm run check && npm test && npm run build 2>&1 | tail -4`. `npm run dev`: `graphs` explain loops (square with three edges, gold spreads, pin hops, the edge under node→nxt glows); trace stop 2 (`seen` asked, so marks hide; pins on 0 and 2 with the 0–2 edge lit). `tool-graph`: edges appear one by one with a flash, `u`/`v` pins on the ends. Reduced motion: no flashes, pins snap. No console errors. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add src/scene/graph.js src/scene/tree.js src/components/SceneView.vue src/data/training/graphs.js src/data/training/tools/tool-graph.js
git commit -m "feat(scene): graph kind — renderer, dispatch; napkin network and safehouse map"
```

---

### Task 5: Tree — model and validator

**Files:**
- Modify: `src/scene/model.js` (`layoutTree`, `resolveTree`, dispatch), `src/scene/validate.js` (`treeErrors`, dispatch)
- Test: `tests/scene-model.test.mjs`, `tests/scene-validate.test.mjs`

**Interfaces:**
- Produces: `layoutTree(root) → { nodes: [{ id, text, depth, parent, x, end }], width, height }`; `resolveTree(scene, state, prev) → { kind: 'tree', nodes, pins: [{ key, id, label }], marks: [id], changed: [id], width, height, source }`; `isTree(v)` exported. Node `x` is in leaf units from the left edge (`0..width`), root `depth` 0.

- [ ] **Step 1: Failing model tests** (add `layoutTree, resolveTree` to the import)

```js
test('layoutTree: binary tree — ids by L/R path, parent centred over children, leaves one unit wide', () => {
  const t = layoutTree({ val: 1, left: { val: 2 }, right: { val: 3 } })
  assert.deepEqual(t.nodes.map(n => [n.id, n.text, n.depth, n.parent, n.x, n.end]), [['', '1', 0, null, 1, false], ['L', '2', 1, '', 0.5, false], ['R', '3', 1, '', 1.5, false]])
  assert.equal(t.width, 2); assert.equal(t.height, 2)
  const one = layoutTree({ val: 'a', left: { val: 'b' } })         // a lone left child keeps its side
  assert.deepEqual(one.nodes.map(n => [n.id, n.x]), [['', 1], ['L', 0.5]]); assert.equal(one.width, 2)
})

test('layoutTree: map tree — keys are node text and id steps; a true child lights its parent; empty root is one node', () => {
  const t = layoutTree({ t: { o: { '#': true }, e: { a: { '#': true } } } })
  assert.deepEqual(t.nodes.map(n => [n.id, n.text, n.depth, n.end]), [['', '·', 0, false], ['t', 't', 1, false], ['t.o', 'o', 2, true], ['t.e', 'e', 2, false], ['t.e.a', 'a', 3, true]])
  assert.equal(t.width, 2); assert.equal(t.height, 4)
  assert.deepEqual(layoutTree({}).nodes.map(n => n.id), [''])
})

test('resolveTree: literal data with pins by text; marks by text', () => {
  const sc = { kind: 'tree', data: { val: 1, left: { val: 2 }, right: { val: 3 } }, at: ['root.val'], marks: ['hit'], labels: { 'root.val': 'here' } }
  const r = resolve(sc, { 'root.val': 2, hit: 3 })
  assert.equal(r.kind, 'tree'); assert.deepEqual(r.pins, [{ key: 'root.val', id: 'L', label: 'root.val · here' }]); assert.deepEqual(r.marks, ['R'])
  assert.deepEqual(resolve(sc, { 'root.val': null }).pins, [])
  assert.deepEqual(resolve(sc, {}).changed, ['', 'L', 'R'])
})

test('resolveTree: keyed data grows with stable ids; only new nodes are changed; missing key or py-only keeps the previous tree', () => {
  const sc = { kind: 'tree', data: 'root', init: {}, at: ['ch'] }
  const r0 = resolve(sc, { root: { py: '{}', val: {} } })
  assert.deepEqual(r0.nodes.map(n => n.id), [''])
  const r1 = resolve(sc, { root: { py: "{'t': {'o': {'#': True}}}", val: { t: { o: { '#': true } } } } }, r0)
  assert.deepEqual(r1.changed, ['t', 't.o']); assert.equal(r1.nodes.find(n => n.id === 't.o').end, true)
  const r2 = resolve(sc, { ch: 'e', root: { py: 'x', val: { t: { o: { '#': true }, e: {} } } } }, r1)
  assert.deepEqual(r2.changed, ['t.e']); assert.deepEqual(r2.pins, [{ key: 'ch', id: 't.e', label: 'ch' }])
  const r3 = resolve(sc, { root: { py: 'x' } }, r2)
  assert.deepEqual(r3.nodes.map(n => n.id), ['', 't', 't.o', 't.e']); assert.deepEqual(r3.changed, [])
})
```

- [ ] **Step 2: Failing validator tests**

```js
const T = (sc, ...states) => tr({ kind: 'tree', ...sc }, ...states)

test('tree: binary or map nodes; bad node shapes, deep or big trees rejected; keyed data needs init; labels ⊆ at ∪ marks', () => {
  assert.deepEqual(sceneErrors(T({ data: { val: 1, left: { val: 2 }, right: { val: 3 } }, at: ['root.val'] }, { 'root.val': 2 }, { x: 1 }, { 'root.val': 1 })), [])
  assert.deepEqual(sceneErrors(T({ data: 'root', init: {}, at: ['ch'] }, { root: {} }, { ch: 'e', root: { t: { e: {} } } }, { root: { t: { '#': true } } })), [])
  assert.match(sceneErrors(T({ data: { val: 1, kids: [] } }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /node '' has val and other keys/)
  assert.match(sceneErrors(T({ data: { 'a b': {} } }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /key 'a b'/)
  assert.match(sceneErrors(T({ data: { val: 1, left: 5 } }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /node 'L' must be an object or null/)
  assert.match(sceneErrors(T({ data: { a: { b: { c: { d: { e: { f: { g: {} } } } } } } } }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /deeper than 6/)
  assert.match(sceneErrors(T({ data: 'root' }, { root: {} }, { x: 1 }, { x: 1 }))[0], /init/)
  assert.match(sceneErrors(T({ data: 'root', init: {} }, { root: [1] }, { x: 1 }, { x: 1 }))[0], /'root' at frame 0 must be a tree/)
  assert.match(sceneErrors(T({ data: 'root', init: {} }, { root: { py: '{}' } }, { x: 1 }, { x: 1 }))[0], /'root' at frame 0 is Python text/)
  assert.match(sceneErrors(T({ data: { val: 1 }, at: ['a'], labels: { q: 'x' } }, { a: 1 }, { a: 1 }, { a: 1 }))[0], /labels/)
  assert.match(sceneErrors(T({ data: { val: 1 }, at: ['a'] }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /'a' never/)
})

test('tree: at most 31 nodes', () => {
  const wide = Object.fromEntries(Array.from({ length: 32 }, (_, i) => [`k${i}`, {}]))
  assert.match(sceneErrors(T({ data: wide }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /more than 31 nodes/)
})
```

- [ ] **Step 3: RED**.

- [ ] **Step 4: model.js** — before `resolve`:

```js
const isBinary = nd => !!nd && typeof nd === 'object' && !Array.isArray(nd) && 'val' in nd
const isMap = nd => !!nd && typeof nd === 'object' && !Array.isArray(nd) && !('val' in nd) && !('py' in nd)
export const isTree = v => isBinary(v) || isMap(v)

// Flatten a tree to nodes with path ids and a tidy layout: a leaf is one unit wide, a binary node with any
// child reserves both sides, a parent sits centred over its span. Root depth 0, x from the left edge.
export function layoutTree(root) {
  const nodes = []
  function walk(nd, id, text, depth, parent, x0) {
    const node = { id, text, depth, parent, x: 0, end: false }
    nodes.push(node)
    let w = 0
    if (isBinary(nd)) {
      const sides = [['L', nd.left], ['R', nd.right]]
      if (sides.some(([, c]) => c !== null && c !== undefined)) for (const [s, c] of sides) {
        w += (c === null || c === undefined) ? 1 : walk(c, id ? `${id}.${s}` : s, cellText(c.val), depth + 1, id, x0 + w)
      }
    } else {
      for (const [k, c] of Object.entries(nd)) {
        if (c === true) { node.end = true; continue }
        w += walk(c, id ? `${id}.${k}` : k, k, depth + 1, id, x0 + w)
      }
    }
    w = Math.max(1, w)
    node.x = x0 + w / 2
    return w
  }
  const width = isTree(root) ? walk(root, '', isBinary(root) ? cellText(root.val) : '·', 0, null, 0) : 0
  const height = nodes.length ? Math.max(...nodes.map(n => n.depth)) + 1 : 0
  return { nodes, width, height }
}

function treeFor(scene, state, prev) {
  if (isTree(scene.data)) return scene.data
  const v = read(state, scene.data)
  if (isTree(v)) return v
  if (prev?.source !== undefined) return prev.source
  return scene.init ?? {}
}

export function resolveTree(scene, state = {}, prev = null) {
  const source = treeFor(scene, state, prev)
  const { nodes, width, height } = layoutTree(source)
  const pins = [], marks = []
  for (const key of scene.at || []) {
    if (!present(state, key)) continue
    const t = cellText(read(state, key))
    for (const nd of nodes) if (nd.text === t) pins.push({ key, id: nd.id, label: captioned(scene, key) })
  }
  for (const key of scene.marks || []) {
    if (!present(state, key)) continue
    const t = cellText(read(state, key))
    for (const nd of nodes) if (nd.text === t && !marks.includes(nd.id)) marks.push(nd.id)
  }
  const before = prev?.kind === 'tree' ? new Map(prev.nodes.map(n => [n.id, n.text])) : null
  const changed = nodes.filter(n => !before || before.get(n.id) !== n.text).map(n => n.id)
  return { kind: 'tree', nodes, pins, marks, changed, width, height, source }
}
```

In `resolve`: `if (scene.kind === 'tree') return resolveTree(scene, state, prev?.kind === 'tree' ? prev : null)`.

- [ ] **Step 5: validate.js `treeErrors`** — import `isTree`; add:

```js
// Walk one tree literal. Returns messages; counts nodes and depth.
function treeShape(root) {
  const errs = [], bad = m => errs.push(m)
  let count = 0
  const walk = (nd, id, depth) => {
    if (nd === null || nd === undefined || typeof nd !== 'object' || Array.isArray(nd)) { bad(`node '${id}' must be an object or null`); return }
    count++
    if (depth >= 6) { bad(`node '${id}' is deeper than 6 levels`); return }
    if ('val' in nd) {
      if (Object.keys(nd).some(k => !['val', 'left', 'right'].includes(k))) bad(`node '${id}' has val and other keys; a binary node is { val, left?, right? }`)
      for (const s of ['left', 'right']) if (nd[s] !== undefined && nd[s] !== null) walk(nd[s], id ? `${id}.${s[0].toUpperCase()}` : s[0].toUpperCase(), depth + 1)
    } else {
      if ('py' in nd) { bad(`node '${id}' is Python text`); return }
      for (const [k, c] of Object.entries(nd)) {
        if (!k || /\s/.test(k)) bad(`key '${k}' under node '${id}' must be non-empty with no whitespace`)
        if (c === true) continue
        walk(c, id ? `${id}.${k}` : k, depth + 1)
      }
    }
  }
  walk(root, '', 0)
  if (count > 31) bad(`tree has more than 31 nodes (${count})`)
  return errs
}

function treeErrors(sc, states, where) {
  const errs = [], bad = m => errs.push(m)
  const isKey = typeof sc.data === 'string'
  if (!isKey && !isTree(sc.data)) bad('data must be a tree object or a state key')
  if (isKey && sc.init === undefined) bad(`data is the state key '${sc.data}' so init (the tree before the first frame) is required`)
  else for (const m of treeShape(isKey ? sc.init : sc.data)) bad(m)
  if (sc.at !== undefined && !strings(sc.at)) bad('at must be an array of state keys')
  if (sc.marks !== undefined && !strings(sc.marks)) bad('marks must be an array of state keys')
  const pinKeys = [...(Array.isArray(sc.at) ? sc.at : []), ...(Array.isArray(sc.marks) ? sc.marks : [])]
  for (const k of Object.keys(sc.labels || {})) if (!pinKeys.includes(k)) bad(`labels names '${k}' which is not an at or marks key`)
  if (errs.length) return errs
  const keyed = [...pinKeys, ...(isKey ? [sc.data] : [])]
  for (const k of new Set(keyed)) if (!states.some(st => k in st)) bad(`'${k}' never appears in any ${where}`)
  if (isKey) states.forEach((st, k) => {
    if (!(sc.data in st)) return
    if (pyOnly(st[sc.data])) { bad(`'${sc.data}' at ${where} ${k} is Python text; add a val beside py`); return }
    const v = read(st, sc.data)
    if (v === null || v === undefined) return
    if (!isTree(v)) { bad(`'${sc.data}' at ${where} ${k} must be a tree object`); return }
    for (const m of treeShape(v)) bad(`'${sc.data}' at ${where} ${k}: ${m}`)
  })
  return errs
}
```

Dispatch in `sceneErrors`: `if (sc.kind === 'tree') { for (const m of treeErrors(sc, walkStates(), explain ? 'state' : 'frame')) bad(m); return errs }`.

- [ ] **Step 6: GREEN** — `npm test`, `npm run check`.

- [ ] **Step 7: Commit**

```bash
git add src/scene/model.js src/scene/validate.js tests/scene-model.test.mjs tests/scene-validate.test.mjs
git commit -m "feat(scene): model and validator — tree kind with tidy layout"
```

---

### Task 6: Tree renderer and first content (trees, tries)

**Files:**
- Replace: `src/scene/tree.js` (the Task 4 stub)
- Modify: `src/data/training/trees.js`, `src/data/training/tries.js`

**Interfaces:**
- Consumes: `resolveTree` result (`nodes[].{id,text,depth,parent,x,end}`, `width`, `height`, `pins`, `marks`, `changed`).
- Produces: `createTree(stage) → { update(r, { instant }), dispose() }`.

- [ ] **Step 1: `tree.js`**

```js
// src/scene/tree.js
// Kind 'tree': node blocks laid out by resolveTree (root at the top, one level per 1.1 units, leaves 1.0
// apart), rods from each node to its parent, gold on end-marked or marked nodes, violet pins coming in
// from the front, green flashes on new nodes.
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'
import { createPin } from './pin.js'

const SIZE = 0.8, LEVEL = 1.1, UNIT = 1.0, ROD = 0.05, FLASH = 0.4

export function createTree(stage) {
  const { THREE, scene } = stage
  const cache = new Map()
  const group = new THREE.Group(); scene.add(group)
  const boxGeo = new THREE.BoxGeometry(SIZE, SIZE, SIZE)
  const edgeGeo = new THREE.EdgesGeometry(boxGeo)
  const nodes = new Map()          // id -> { mesh, edges, sprite, rod, text, gold, flashT }
  const pins = new Map()
  let shape = '', width = 0, height = 0

  const posOf = n => new THREE.Vector3((n.x - width / 2) * UNIT, (height - 1 - n.depth) * LEVEL, 0)
  const free = id => {
    const nd = nodes.get(id); if (!nd) return
    group.remove(nd.mesh, nd.edges, nd.sprite); nd.mesh.material.dispose(); nd.edges.material.dispose()
    if (nd.rod) { group.remove(nd.rod); nd.rod.geometry.dispose(); nd.rod.material.dispose() }
    nodes.delete(id)
  }
  const freeAll = () => { for (const id of [...nodes.keys()]) free(id) }

  function add(n, r) {
    const p = posOf(n)
    const mesh = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.12, roughness: 0.35, metalness: 0.2 }))
    const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.8 }))
    mesh.position.copy(p); edges.position.copy(p)
    const sprite = new THREE.Sprite(makeText(THREE, cache, n.text, '#d7e6ff')); sprite.scale.set(1.1, 0.55, 1); sprite.position.set(p.x, p.y, SIZE / 2 + 0.3)
    group.add(mesh, edges, sprite)
    let rod = null
    if (n.parent !== null) {
      const q = posOf(r.nodes.find(m => m.id === n.parent))
      const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy)
      rod = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.1, len - SIZE * 0.9), ROD, ROD), new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.35 }))
      rod.position.set((p.x + q.x) / 2, (p.y + q.y) / 2, 0); rod.rotation.z = Math.atan2(dy, dx)
      group.add(rod)
    }
    nodes.set(n.id, { mesh, edges, sprite, rod, text: n.text, gold: false, flashT: 0 })
  }
  const look = nd => {
    nd.mesh.material.emissive.setHex(nd.gold ? C.gold : C.edge); nd.mesh.material.emissiveIntensity = nd.gold ? 0.75 : 0.12
    nd.edges.material.color.setHex(nd.gold ? C.gold : C.edge)
  }

  function update(r, { instant = false } = {}) {
    if (!r || r.kind !== 'tree') return
    const s = `${r.width}|${r.height}|${r.nodes.map(n => n.id + '@' + n.x).join(',')}`
    const rebuilt = s !== shape
    if (rebuilt) {
      shape = s; width = r.width; height = r.height
      freeAll()
      for (const n of r.nodes) add(n, r)
      stage.frame({ width: Math.max(3, width), height: height + 1 })
      stage.controls.target.y = ((height - 1) * LEVEL) / 2 + 0.3; stage.controls.update()
    }
    const snap = instant || stage.reduced
    for (const n of r.nodes) {
      const nd = nodes.get(n.id)
      if (nd.text !== n.text) { nd.sprite.material = makeText(THREE, cache, n.text, '#d7e6ff'); nd.text = n.text }
      nd.gold = n.end || r.marks.includes(n.id); look(nd)
      if (!snap && r.changed.includes(n.id)) nd.flashT = FLASH
    }
    const seen = new Set(), reps = new Map(), onNode = new Map()
    for (const p of r.pins) {
      const k = (reps.get(p.key) ?? 0) + 1; reps.set(p.key, k)
      const id = k === 1 ? p.key : `${p.key}#${k}`
      if (!pins.has(id)) pins.set(id, createPin(stage, group, cache, id))
      const pin = pins.get(id); seen.add(id)
      pin.group.rotation.x = Math.PI / 2                        // point in from the front
      pin.setLabel(p.label)
      const n = r.nodes.find(m => m.id === p.id), t = posOf(n); t.z = SIZE / 2 + 0.2
      pin.show(t, snap || rebuilt)
      const c = onNode.get(p.id) ?? 0; onNode.set(p.id, c + 1); pin.stack(c)
    }
    for (const [id, pin] of pins) if (!seen.has(id)) pin.hide()
  }

  const off = stage.onTick(dt => {
    for (const pin of pins.values()) pin.tick(dt, 0)
    for (const nd of nodes.values()) if (nd.flashT > 0) {
      nd.flashT = Math.max(0, nd.flashT - dt)
      nd.mesh.material.emissive.setHex(C.ok); nd.mesh.material.emissiveIntensity = 0.12 + 0.9 * (nd.flashT / FLASH)
      if (nd.flashT === 0) look(nd)
    }
  })

  function dispose() {
    off?.(); freeAll()
    for (const p of pins.values()) p.dispose()
    pins.clear()
    for (const m of cache.values()) { m.map.dispose(); m.dispose() }
    cache.clear(); boxGeo.dispose(); edgeGeo.dispose(); scene.remove(group)
  }
  return { update, dispose }
}
```

Note: the whole tree rebuilds when its shape changes (a trie growing re-lays every node), and `changed` still flags only new or renamed nodes, which flash after the rebuild. `pin.tick(dt, 0)`: no bob, the pin is rotated.

- [ ] **Step 2: Content** — `trees.js`, second explain and trace:

```js
scene: { kind: 'tree', data: { val: 1, left: { val: 2 }, right: { val: 3 } }, at: ['root.val'], states: [{ 'root.val': 1 }, { 'root.val': 2 }, { 'root.val': 3 }, { 'root.val': 1 }] }
{ scene: { kind: 'tree', data: { val: 1, left: { val: 2 }, right: { val: 3 } }, at: ['root.val'] } }
```

`tries.js`, second explain and trace, and `val` on every `root` frame:

```js
scene: { kind: 'tree', data: 'root', init: {}, at: ['ch'],
  states: [{ root: {} }, { root: { t: {} } }, { root: { t: { o: { '#': true } } } }, { ch: 'e', root: { t: { o: { '#': true }, e: {} } } }, { root: { t: { o: { '#': true }, e: { a: { '#': true } } } } }] }
{ scene: { kind: 'tree', data: 'root', init: {}, at: ['ch'] } }
// frames
root: { py: '{}', val: {} }
root: { py: "{'t': {'o': {'#': True}}}", val: { t: { o: { '#': true } } } }
root: { py: "{'t': {'o': {'#': True}, 'e': {}}}", val: { t: { o: { '#': true }, e: {} } } }
root: { py: "{'t': {'o': {'#': True}, 'e': {'a': {'#': True}}}}", val: { t: { o: { '#': true }, e: { a: { '#': true } } } } }
```

- [ ] **Step 3: Check, test, browser** — `npm run check && npm test`. `npm run dev`: `trees` (three blocks, rods, pin walks 1→2→3→1 from the front), `tries` (a lone `·`, then a branch grows, `o` and `a` gold, the `e` pin on stop 3). Every trace stop masks `root` in `tries`, so the tree only advances on the explain loop and on stops whose answer was typed — confirm the picture holds the previous tree while the answer is hidden. Reduced motion snaps. No console errors. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/scene/tree.js src/data/training/trees.js src/data/training/tries.js
git commit -m "feat(scene): tree kind — renderer; the chart on the wall and the code-word rack"
```

---

### Task 7: Content — the remaining eight items

**Files:** `src/data/training/frequency.js`, `caches.js`, `weighted-graphs.js`, `recursion.js`; `src/data/training/tools/tool-dict.js`, `tool-recursion.js`, `tool-tree-node.js`, `tool-table.js`.

Lessons: `scene` on the second `explain` and a 4th argument on `trace`. Tools: `scene` on the first `explain` (the code-bearing one) and on `trace`. Never edit `ask`, `py` text, notes, prose or tests; only add `val` beside an existing `py` or add a `calls` key.

- [ ] **frequency**
```js
scene: { kind: 'cells', data: 'tally', init: {}, at: ['ch'], states: [{ ch: 'a', tally: { a: 1 } }, { ch: 'b', tally: { a: 1, b: 1 } }, { ch: 'a', tally: { a: 2, b: 1 } }] }
{ scene: { kind: 'cells', data: 'tally', init: {}, at: ['ch'] } }
```
- [ ] **tool-dict**
```js
scene: { kind: 'cells', data: 'counts', init: {}, at: ['n'], states: [{ n: 'dax', counts: { dax: 1 } }, { n: 'fence', counts: { dax: 1, fence: 1 } }, { n: 'dax', counts: { dax: 2, fence: 1 } }] }
{ scene: { kind: 'cells', data: 'counts', init: {}, at: ['n'] } }
```
- [ ] **caches** — frames: `store` becomes a twin: `{ py: '{1: 1}', val: { 1: 1 } }`, `{ py: '{1: 1, 2: 2}', val: { 1: 1, 2: 2 } }` (frames 2, 3), `{ py: '{1: 1, 3: 3}', val: { 1: 1, 3: 3 } }` (frames 4, 5).
```js
scene: { kind: 'rows', rows: [{ label: 'store', data: 'store', init: {}, at: ['key'] }, { label: 'order', data: 'order', init: [], at: ['key'] }],
  states: [{ key: 1, store: { 1: 1 }, order: [1] }, { key: 2, store: { 1: 1, 2: 2 }, order: [1, 2] }, { key: 1, store: { 1: 1, 2: 2 }, order: [2, 1] }, { key: 3, store: { 1: 1, 3: 3 }, order: [1, 3] }] }
{ scene: { kind: 'rows', rows: [{ label: 'store', data: 'store', init: {}, at: ['key'] }, { label: 'order', data: 'order', init: [], at: ['key'] }] } }
```
- [ ] **weighted-graphs** — frames: `dist` twins `{ py: '[0, 1, 4, inf]', val: [0, 1, 4, { py: 'inf' }] }` (frames 1, 2), `{ py: '[0, 1, 3, inf]', val: [0, 1, 3, { py: 'inf' }] }` (frame 3), `{ py: '[0, 1, 3, 4]', val: [0, 1, 3, 4] }` (frames 4, 5).
```js
scene: { kind: 'graph', adj: [[[1, 1], [2, 4]], [[0, 1], [2, 2]], [[0, 4], [1, 2], [3, 1]], [[2, 1]]], pos: [[0, 0], [2, 0], [1, 2], [3, 2]], at: ['node', 'nxt'], badges: 'dist',
  states: [{ node: 0, nxt: 2, dist: [0, 1, 4, { py: 'inf' }] }, { node: 1, nxt: 2, dist: [0, 1, 3, { py: 'inf' }] }, { node: 2, nxt: 3, dist: [0, 1, 3, 4] }] }
{ scene: { kind: 'graph', adj: [[[1, 1], [2, 4]], [[0, 1], [2, 2]], [[0, 4], [1, 2], [3, 1]], [[2, 1]]], pos: [[0, 0], [2, 0], [1, 2], [3, 2]], at: ['node', 'nxt'], badges: 'dist' } }
```
- [ ] **recursion** — frames gain `calls`: frame 1 `calls: [123, 12, 1, 0]`, frame 2 `[123, 12, 1]`, frame 3 `[123, 12]`, frame 4 `[123]` (add the key after `n`).
```js
scene: { kind: 'rows', rows: [{ label: 'calls', data: 'calls', init: [], pile: true, at: ['n'] }],
  states: [{ n: 123, calls: [123] }, { n: 12, calls: [123, 12] }, { n: 1, calls: [123, 12, 1] }, { n: 0, calls: [123, 12, 1, 0] }, { n: 123, calls: [123] }] }
{ scene: { kind: 'rows', rows: [{ label: 'calls', data: 'calls', init: [], pile: true, at: ['n'] }] } }
```
- [ ] **tool-recursion** — frames gain `calls`: `[2]`, `[2, 1]`, `[2, 1, 0]`, `[2]`.
```js
scene: { kind: 'rows', rows: [{ label: 'calls', data: 'calls', init: [], pile: true, at: ['n'] }],
  states: [{ n: 2, calls: [2] }, { n: 1, calls: [2, 1] }, { n: 0, calls: [2, 1, 0] }, { n: 2, calls: [2] }] }
{ scene: { kind: 'rows', rows: [{ label: 'calls', data: 'calls', init: [], pile: true, at: ['n'] }] } }
```
- [ ] **tool-tree-node**
```js
scene: { kind: 'tree', data: { val: 'halden', left: { val: 'vaults' }, right: { val: 'floor' } }, at: ['who', 'under'], states: [{ who: 'halden' }, { who: 'halden', under: 'vaults' }, { who: 'halden', under: 'floor' }] }
{ scene: { kind: 'tree', data: { val: 'halden', left: { val: 'vaults' }, right: { val: 'floor' } }, at: ['who', 'under'] } }
```
- [ ] **tool-table**
```js
scene: { kind: 'grid', grids: [{ label: 'good', data: 'good', init: [[0, 0, 0], [0, 0, 0]] }, { label: 'bad', data: 'bad', init: [[0, 0, 0], [0, 0, 0]] }],
  states: [{ good: [[0, 0, 0], [0, 0, 0]], bad: [[0, 0, 0], [0, 0, 0]] }, { good: [[0, 0, 0], [0, 0, 7]], bad: [[0, 0, 0], [0, 0, 0]] }, { good: [[0, 0, 0], [0, 0, 7]], bad: [[0, 0, 7], [0, 0, 7]] }] }
{ scene: { kind: 'grid', grids: [{ label: 'good', data: 'good', init: [[0, 0, 0], [0, 0, 0]] }, { label: 'bad', data: 'bad', init: [[0, 0, 0], [0, 0, 0]] }] } }
```

- [ ] **Check, test, browser spot-check, commit**

`npm run check && npm test` (the drill count and 1186 checks unchanged; reference solutions untouched). Browser: `frequency` (cards `a`, `b` with key text under, pin on the letter), `caches` (store row keyed `1`,`2` then `1`,`3`; order lane flips; both pins on `key`), `weighted-graphs` (badges `0 1 4 inf` fall to `0 1 3 4`; the node→nxt edge glows), `recursion` (pile of four rises, pin sits on the top, then on the frame returning as the pile shrinks), `tool-table` (two grids labelled `good` and `bad`; both `bad` tiles take the 7 with a flash), `tool-tree-node` (pins from the front on `halden` and `vaults`). Stop the server.

```bash
git add src/data/training/frequency.js src/data/training/caches.js src/data/training/weighted-graphs.js src/data/training/recursion.js src/data/training/tools/tool-dict.js src/data/training/tools/tool-recursion.js src/data/training/tools/tool-tree-node.js src/data/training/tools/tool-table.js
git commit -m "content(training): dict rows for tallies and the cache; weighted graph badges; call-stack piles; the tree-node chart; the two-grid table"
```

---

### Task 8: Docs and final verification

- [ ] `CLAUDE.md`: Layout `src/scene/` bullet gains `graph.js` and `tree.js`; the `scene` bullet gains: "State values may be twins `{ py, val }`: answers read `py`, the table reads `val`. `cells` `data` may be an object or a key with `init: {}` (keyed blocks; `at` matches keys too). Kind `grid` also takes `grids: [{ label, data, init? }]` (1–2, side by side; no `cursor`/`heads`). Kind `graph`: `{ kind: 'graph', adj: [[nbr | [nbr, w]]] | 'key', init?, pos: [[x, z]], names?, directed?, at?: ['node'], marks?: ['seen'], badges?: 'dist' }`. Kind `tree`: `{ kind: 'tree', data: { val, left?, right? } | { key: {...}, '#': true } | 'key', init?, at?, marks? }` (auto layout, path ids). See the wave-2c spec."
- [ ] Wave-2c spec: Status → implemented; note the `at`-matches-keys rule (already added in Task 1) and that a tree rebuilds on any shape change while only new nodes flash.
- [ ] `npm run check && npm test && npm run build 2>&1 | tail -6`; `npm run preview`: heist screen makes no scene request; open `graphs`, `tries` and `tool-table` in the production build; no console errors. Stop the server.
- [ ] Commit (no push): `docs: the table wave 2c — dicts, graphs, trees, the call stack`

---

## Self-review notes

- **Spec coverage:** twin values (T1 `valueOf`/`read`, `stateErrors`); dict rows (T1 model, validator, row.js); grid pair (T2); graph model/validator (T3), renderer, dispatch, first content (T4); tree model/validator (T5), renderer, first content (T6); the other eight items incl. `calls` piles (T7); docs and production check (T8). Twelve items in all: graphs, tool-graph (T4); trees, tries (T6); frequency, tool-dict, caches, weighted-graphs, recursion, tool-recursion, tool-tree-node, tool-table (T7).
- **Types:** `read(state, key)` used by every resolver and validator walk; `resolveGrid` keeps `rows/cols/tiles/marks/changed/source` mirrors of `grids[0]` so the wave-2b validator walk and tests hold; `resolveGraph` fields (`nodes[].{i,name,pos,badge,marked}`, `edges[].{u,v,w,glow,changed}`, `pins[].{key,node,label}`, `directed`) read identically by graph.js and the validator; `resolveTree` fields (`nodes[].{id,text,depth,parent,x,end}`, `width`, `height`, `pins[].{key,id,label}`, `marks`, `changed`) read by tree.js; `createPin` contract unchanged (`show/hide/setLabel/stack/tick/dispose`, `group.rotation`).
- **Judgement calls:** `at` on a dict row also matches keys (spec amended in T1); `resolveRow` gains `keyed`; grid `marks` live per entry with the top level mirroring entry 0; the tree rebuilds on any shape change (ids still make `changed` precise); tree pins point in from the front (`rotation.x = π/2`) so they never cross a parent; `KINDS` gains both new names in T3 with a stub `tree.js` in T4 so the dispatch import resolves before T6.
