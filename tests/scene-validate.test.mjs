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
