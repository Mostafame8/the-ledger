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
