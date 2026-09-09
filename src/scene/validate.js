// Content-time checks for a step's `scene`. Pure; used by scripts/check-training.mjs and tests.
import { KINDS, KEY_RE, normalize, resolve } from './model.js'

const isList = v => Array.isArray(v) || typeof v === 'string'
const keyish = v => typeof v === 'string'

export function sceneErrors(step) {
  const sc = step?.scene
  if (!sc) return []
  const errs = []
  const bad = m => errs.push(`scene: ${m}`)
  if (step.type !== 'trace' && step.type !== 'explain') { bad(`not allowed on a ${step.type} step`); return errs }
  if (!KINDS.includes(sc.kind)) { bad(`unknown kind '${sc.kind}'`); return errs }

  // data / init
  const dataIsKey = typeof sc.data === 'string' && KEY_RE.test(sc.data)
  if (!isList(sc.data)) bad('data must be a list, a string, or a state key')
  else if (!dataIsKey && sc.data.length === 0) bad('data is empty')
  if (dataIsKey && !isList(sc.init)) bad(`data is the state key '${sc.data}' so init (the list before the first frame) is required`)

  // shapes
  if (sc.pointers !== undefined && !Array.isArray(sc.pointers) && (typeof sc.pointers !== 'object' || sc.pointers === null)) bad('pointers must be an array of state keys or an object of ints')
  if (step.type === 'trace' && sc.pointers && !Array.isArray(sc.pointers)) bad('pointers on a trace must be an array of state keys')
  if (step.type === 'trace' && sc.states) bad('states only belong on an explain scene')
  if (step.type === 'explain' && sc.states !== undefined && (!Array.isArray(sc.states) || sc.states.length === 0)) bad('states must be a non-empty array')
  for (const r of sc.ranges || []) {
    const ok = (Array.isArray(r) && r.length === 2 && r.every(x => keyish(x) || Number.isInteger(x)))
      || (r && typeof r === 'object' && !Array.isArray(r) && (keyish(r.end) || Number.isInteger(r.end)))
    if (!ok) bad(`range ${JSON.stringify(r)} must be [a, b] or { end, width }`)
  }
  const n = normalize(sc)
  const pointerKeys = Array.isArray(n.pointers) ? n.pointers : []
  for (const k of Object.keys(sc.labels || {})) if (!pointerKeys.includes(k)) bad(`labels names '${k}' which is not a pointer`)
  if (errs.length) return errs

  // Walk the frames (trace) or states (explain) the way the renderer will.
  const states = step.type === 'trace' ? (step.frames || []).map(f => f.state || {}) : n.states
  const where = step.type === 'trace' ? 'frame' : 'state'
  const keyed = [...pointerKeys, ...(sc.marks || []), ...(dataIsKey ? [sc.data] : [])]
  for (const r of sc.ranges || []) for (const x of Array.isArray(r) ? r : [r.end]) if (keyish(x)) keyed.push(x)
  for (const k of new Set(keyed)) if (!states.some(st => k in st)) bad(`'${k}' never appears in any ${where}`)

  let prev = null
  states.forEach((st, k) => {
    const r = resolve({ ...n, states: undefined }, st, prev)
    const len = r.cells.length
    const check = (key, v) => {
      if (v === null || v === undefined) return
      if (!(Number.isInteger(v) && v >= -1 && v <= len)) bad(`'${key}' is ${JSON.stringify(v)} at ${where} ${k}, outside -1..${len}`)
    }
    for (const key of pointerKeys) if (key in st) check(key, st[key])
    for (const rg of sc.ranges || []) {
      const ends = Array.isArray(rg) ? rg : [rg.end]
      for (const x of ends) if (keyish(x) && x in st) check(x, st[x])
      for (const x of ends) if (Number.isInteger(x)) check(String(x), x)
    }
    prev = r
  })
  return errs
}
