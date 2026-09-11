// Pure: turn a scene descriptor plus one frame's state into a picture the renderer can draw.
// No DOM, no three. See docs/superpowers/specs/2026-09-09-training-3d-scenes-design.md.

export const KINDS = ['cells', 'rows', 'grid', 'line']
export const CELL_TEXT_MAX = 6
// A string `data` is a state key when it looks like an identifier, or when the row gives an `init`
// (the list before the first frame). Content literals ('HB4417', 'ok go', '(()') have no init.
export const KEY_RE = /^[a-z_][a-z0-9_]*$/
export const dataIsKey = row => typeof row?.data === 'string' && (row.init !== undefined || KEY_RE.test(row.data))
// A twin value carries the Python answer text in `py` and a drawable literal in `val`.
// The table takes `val`; anything else passes through untouched.
export const valueOf = v => (v && typeof v === 'object' && !Array.isArray(v) && 'py' in v && 'val' in v) ? v.val : v
export const read = (state, key) => valueOf(state?.[key])
// A plain object the table may draw as a dict: not a list, not Python text, not a twin.
export const isDict = v => !!v && typeof v === 'object' && !Array.isArray(v) && !('py' in v)

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
  return { ...scene, pointers: Array.isArray(p) ? p : [], states: scene.states?.length ? scene.states : [{}] }
}

const isList = v => Array.isArray(v) || typeof v === 'string'
const toCells = src => isDict(src)
  ? Object.entries(src).map(([key, v], index) => ({ index, text: cellText(v), key }))
  : Array.from(src, (v, index) => ({ index, text: cellText(v) }))

// The row for this frame: the literal; else the frame's own list or dict, else the previous frame's, else init.
function rowFor(row, state, prev) {
  const d = row.data
  if (Array.isArray(d) || isDict(d)) return d
  if (!dataIsKey(row)) return d
  const v = read(state, d)
  if (isList(v) || isDict(v)) return v
  if (prev?.source !== undefined) return prev.source
  return row.init ?? []
}

const intAt = (state, k) => (typeof k === 'number' ? k : read(state, k))
const inRow = (v, len) => Number.isInteger(v) && v >= -1 && v <= len
const present = (state, key) => key in state && read(state, key) !== null && read(state, key) !== undefined
const captioned = (row, key) => { const cap = row.labels?.[key]; return cap ? `${key} · ${cap}` : key }

// One row of cells: shared by kind 'cells' (one row) and kind 'rows' (each lane or pile).
export function resolveRow(row, state = {}, prev = null) {
  const source = rowFor(row, state, prev)
  const keyed = isDict(source)
  const cells = toCells(source)
  const len = cells.length

  const pointers = []
  for (const key of Array.isArray(row.pointers) ? row.pointers : []) {
    const v = read(state, key)
    if (!inRow(v, len)) continue
    pointers.push({ key, index: v, label: captioned(row, key) })
  }
  for (const key of row.at || []) {                 // value pins: one per matching cell (a dict row also matches its keys)
    if (!present(state, key)) continue
    const t = cellText(read(state, key))
    for (const c of cells) if (c.text === t || (keyed && c.key === t)) pointers.push({ key, index: c.index, label: captioned(row, key) })
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
    const t = cellText(read(state, key))
    cells.forEach(c => { if (c.text === t && !marks.includes(c.index)) marks.push(c.index) })
  }
  marks.sort((a, b) => a - b)

  const sig = c => (c.key !== undefined ? `${c.key}=${c.text}` : c.text)
  const changed = []
  if (prev?.kind === 'cells') {
    for (let i = 0; i < len; i++) if (!prev.cells[i] || sig(prev.cells[i]) !== sig(cells[i])) changed.push(i)
  } else {
    cells.forEach(c => changed.push(c.index))
  }

  return { kind: 'cells', label: row.label ?? null, pile: !!row.pile, chain: !!row.chain, keyed, cells, pointers, ranges, marks, changed, source }
}

const isGrid = v => Array.isArray(v) && v.every(Array.isArray)
const pairs = v => Array.isArray(v) && v.every(p => Array.isArray(p) && p.length === 2)

// The grid entries of a scene: `grids` as given, or the single form as one unlabelled entry.
const gridEntries = scene => Array.isArray(scene.grids) ? scene.grids : [{ label: null, data: scene.data, init: scene.init }]

// The grid for this frame: literal; else the frame's own grid, else the previous frame's, else init.
function gridFor(g, state, prev) {
  if (isGrid(g.data)) return g.data
  const v = read(state, g.data)
  if (isGrid(v)) return v
  if (prev?.source !== undefined) return prev.source
  return g.init ?? []
}

// One or two grids. The top-level rows/cols/tiles/marks/changed/source mirror entry 0 (the single form).
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

function barsFor(lane, state, prevLane) {
  if (pairs(lane.bars)) return lane.bars
  const v = read(state, lane.bars)
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
    const a = read(state, scene.span[0]), b = read(state, scene.span[1])
    if (Number.isInteger(a) && Number.isInteger(b)) span = { from: Math.min(a, b), to: Math.max(a, b) }
  }
  const pins = []
  for (const key of scene.pins || []) { const v = read(state, key); if (Number.isInteger(v)) pins.push({ key, at: v, label: captioned(scene, key) }) }
  return { kind: 'line', axis: scene.axis, lanes, ticks: scene.ticks ?? [], span, pins }
}

export function resolve(scene, state = {}, prev = null) {
  if (!scene) return null
  if (scene.kind === 'cells') return resolveRow(scene, state, prev?.kind === 'cells' ? prev : null)
  if (scene.kind === 'rows') {
    const rows = (scene.rows || []).map((row, i) => resolveRow(row, state, prev?.kind === 'rows' ? prev.rows[i] ?? null : null))
    return { kind: 'rows', rows }
  }
  if (scene.kind === 'grid') return resolveGrid(scene, state, prev?.kind === 'grid' ? prev : null)
  if (scene.kind === 'line') return resolveLine(scene, state, prev?.kind === 'line' ? prev : null)
  return null
}
