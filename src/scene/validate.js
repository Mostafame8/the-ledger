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
