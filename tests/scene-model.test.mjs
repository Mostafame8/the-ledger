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
  assert.deepEqual(m.pointers, [])
  assert.deepEqual(normalize(two).states, [{}])
  assert.deepEqual(normalize({ ...two, states: [{ i: 1 }] }).states, [{ i: 1 }])
})
