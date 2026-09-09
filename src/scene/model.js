// Pure: turn a scene descriptor plus one frame's state into a picture the renderer can draw.
// No DOM, no three. See docs/superpowers/specs/2026-09-09-training-3d-scenes-design.md.

export const KINDS = ['cells', 'rows']
export const CELL_TEXT_MAX = 6
// A string `data` is a state key when it looks like an identifier, or when the row gives an `init`
// (the list before the first frame). Content literals ('HB4417', 'ok go', '(()') have no init.
export const KEY_RE = /^[a-z_][a-z0-9_]*$/
export const dataIsKey = row => typeof row?.data === 'string' && (row.init !== undefined || KEY_RE.test(row.data))

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
