import { test } from 'node:test'
import assert from 'node:assert/strict'
import { KINDS, CELL_TEXT_MAX, cellText, normalize, resolve, dataIsKey, resolveRow, resolveGrid, resolveLine, valueOf, read, isDict, resolveGraph } from '../src/scene/model.js'

const two = { kind: 'cells', data: [1, 3, 4, 6, 9], pointers: ['i', 'j'], labels: { i: 'small hand' } }

test('constants: KINDS is cells, rows, grid, line, graph, tree; text caps at six', () => {
  assert.deepEqual(KINDS, ['cells', 'rows', 'grid', 'line', 'graph', 'tree'])
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
