import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sceneErrors, stateErrors } from '../src/scene/validate.js'

const frames = (...states) => states.map(state => ({ line: 1, state, ask: Object.keys(state)[0] ?? 'x', note: 'n' }))
const tr = (scene, ...states) => ({ type: 'trace', code: 'x', input: 'f()', frames: frames(...states), scene })
const ex = scene => ({ type: 'explain', lines: ['a', '“b”'], scene })

test('no scene: no errors; scene on spot/blank/mini: error', () => {
  assert.deepEqual(sceneErrors({ type: 'trace', frames: [] }), [])
  assert.match(sceneErrors({ type: 'spot', scene: { kind: 'cells', data: [1] } })[0], /spot/)
})

test('unknown kind and bad data fail', () => {
  assert.match(sceneErrors(ex({ kind: 'blob', data: [1] }))[0], /kind/)
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
  assert.match(sceneErrors(tr({ kind: 'cells', data: [1, 2], ranges: [{ end: 'r', width: 0 }] }, { r: 1 }, { r: 1 }, { r: 1 }))[0], /width/)
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

test('line: axis ascending ints; 0–2 lanes with unique labels; bars within the axis', () => {
  const ok = { axis: [0, 8], lanes: [{ label: 'given', bars: [[1, 3], [6, 7]] }, { label: 'kept', bars: 'out', init: [] }], span: ['start', 'end'] }
  assert.deepEqual(sceneErrors(L(ok, { start: 1, end: 3 }, { out: [[1, 3]] }, { out: [[1, 4]] })), [])
  assert.match(sceneErrors(L({ ...ok, axis: [8, 0] }, { x: 1 }, { x: 1 }, { x: 1 }))[0], /axis/)
  assert.match(sceneErrors(L({ ...ok, lanes: [...ok.lanes, { label: 'z', bars: [] }] }, { start: 1, end: 3 }, { out: [] }, { out: [] }))[0], /at most 2 lanes/)
  assert.deepEqual(sceneErrors(L({ axis: [0, 12], ticks: [3, 6, 7, 11], span: ['lo', 'hi'], pins: ['lo', 'hi', 'mid'], labels: { lo: 'low', hi: 'high' } }, { lo: 1, hi: 11, mid: 6 }, { lo: 1, hi: 6, mid: 3 }, { lo: 4, hi: 4 })), [])
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
