// Content-time checks for a step's `scene`. Pure; used by scripts/check-training.mjs and tests.
import { KINDS, dataIsKey, normalize, resolveGrid, resolveRow, read, isDict } from './model.js'

const isList = v => Array.isArray(v) || typeof v === 'string'
const keyish = v => typeof v === 'string'
const strings = v => Array.isArray(v) && v.every(keyish)
const pyOnly = v => !!v && typeof v === 'object' && !Array.isArray(v) && 'py' in v && !('val' in v)
const size = v => (Array.isArray(v) || typeof v === 'string') ? v.length : Object.keys(v).length

// Shape rules for one row (a `cells` scene or one entry of `rows`). Returns messages.
function rowShape(row, { explain }) {
  const errs = []
  const bad = m => errs.push(m)
  const isKey = dataIsKey(row)
  if (!isList(row.data) && !isDict(row.data)) bad('data must be a list, a string, an object, or a state key')
  else if (!isKey && size(row.data) === 0) bad('data is empty')
  if (isKey && !isList(row.init) && !isDict(row.init)) bad(`data is the state key '${row.data}' so init (the list or dict before the first frame) is required`)
  const dictRow = isDict(isKey ? row.init : row.data)
  if (dictRow && (Array.isArray(row.pointers) ? row.pointers.length : Object.keys(row.pointers || {}).length)) bad('a dict row has no index pointers (use at or marks)')
  if (dictRow && row.ranges?.length) bad('a dict row has no ranges')
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
    if (dataIsKey(row)) {
      const raw = st[row.data], v = read(st, row.data)
      const dictRow = isDict(row.init)
      if (pyOnly(raw)) bad(`'${row.data}' at ${where} ${k} is Python text; add a val beside py`)
      else if (v !== undefined && v !== null) {
        if (dictRow && isList(v)) bad(`'${row.data}' is a list at ${where} ${k} but the row is a dict`)
        if (!dictRow && isDict(v)) bad(`'${row.data}' is a dict at ${where} ${k} but the row is a list`)
      }
    }
    prev = r
  })
  return errs
}

const rect = g => Array.isArray(g) && g.length > 0 && g.every(r => Array.isArray(r) && r.length > 0 && r.length === g[0].length)
const pairsOk = v => Array.isArray(v) && v.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isInteger))

function gridErrors(sc, states, where) {
  const errs = [], bad = m => errs.push(m)
  if (sc.grids !== undefined) {                                   // the side-by-side pair
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
  if ((sc.lanes !== undefined && !Array.isArray(sc.lanes)) || lanes.length > 2) bad('lanes must be an array of at most 2 lanes')
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

  const walkStates = () => explain ? normalize(sc).states : (step.frames || []).map(f => f.state || {})
  if (sc.kind === 'grid') { for (const m of gridErrors(sc, walkStates(), explain ? 'state' : 'frame')) bad(m); return errs }
  if (sc.kind === 'line') { for (const m of lineErrors(sc, walkStates(), explain ? 'state' : 'frame')) bad(m); return errs }
  if (sc.kind === 'graph') { for (const m of graphErrors(sc, walkStates(), explain ? 'state' : 'frame')) bad(m); return errs }

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
