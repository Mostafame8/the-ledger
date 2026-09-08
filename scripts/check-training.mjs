// Validates training content: schema, prerequisites, gate refs, step mix, trace and spot sanity.
import { NODES, NODE_BY_ID } from '../src/data/training/index.js'
import { GATES } from '../src/data/index.js'
import { MOVES } from '../src/data/training/node.js'

const XP = { F: [40, 60], E: [60, 80], D: [90, 100], C: [120, 140], B: [160, 180], A: [200, 240], S: [280, 400] }
const gateIds = new Set(GATES.map(g => g.id))
let errors = 0
const fail = m => { console.error('✗', m); errors++ }

const seen = new Set()
for (const n of NODES) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(n.id)) fail(`${n.id}: id must be lowercase kebab-case`)
  if (seen.has(n.id)) fail(`duplicate id ${n.id}`); seen.add(n.id)
  if (!XP[n.tier]) fail(`${n.id}: bad tier ${n.tier}`)
  else if (n.xp < XP[n.tier][0] || n.xp > XP[n.tier][1]) fail(`${n.id}: xp ${n.xp} outside ${XP[n.tier].join('–')} for tier ${n.tier}`)
  for (const f of ['title', 'algo']) if (!n[f]) fail(`${n.id}: missing ${f}`)
  if (!Array.isArray(n.requires)) fail(`${n.id}: requires must be an array`)
  else for (const r of n.requires) if (!NODE_BY_ID[r]) fail(`${n.id}: requires unknown node ${r}`)
  if (!Array.isArray(n.gates)) fail(`${n.id}: gates must be an array`)
  else for (const g of n.gates) if (!gateIds.has(g)) fail(`${n.id}: unknown gate ${g}`)
  if (n.id !== 'method' && !n.gates?.length) fail(`${n.id}: should list the gates it prepares`)

  const types = (n.steps || []).map(s => s.type)
  if (!types.length) fail(`${n.id}: no steps`)
  const need = n.id === 'method' ? ['explain', 'spot'] : ['trace', 'spot', 'blank', 'mini']
  for (const t of need) if (!types.includes(t)) fail(`${n.id}: needs at least one ${t} step`)
  if (n.id === 'method' && types.some(t => !['explain', 'spot'].includes(t))) fail(`method: explain and spot steps only`)
  if (n.id !== 'method') {
    const order = ['explain', 'explain', 'trace', 'spot', 'blank', 'mini']
    if (types.length !== order.length || !order.every((t, i) => types[i] === t)) fail(`${n.id}: step order must be explain, explain, trace, spot, blank, mini`)
  }

  n.steps?.forEach((s, i) => {
    const at = `${n.id}[${i}] ${s.type}`
    switch (s.type) {
      case 'explain':
        if (!Array.isArray(s.lines) || s.lines.length < 2 || s.lines.length > 5) fail(`${at}: 2–5 lines`)
        if (s.move && !MOVES.includes(s.move)) fail(`${at}: unknown move ${s.move}`)
        break
      case 'trace': {
        if (!s.code || !s.input) fail(`${at}: needs code and input`)
        const lineCount = (s.code || '').split('\n').length
        if (!Array.isArray(s.frames) || s.frames.length < 3) fail(`${at}: needs 3+ frames`)
        for (const [k, f] of (s.frames || []).entries()) {
          if (!(f.line >= 1 && f.line <= lineCount)) fail(`${at} frame ${k}: line ${f.line} outside code`)
          if (!f.state || !(f.ask in f.state)) fail(`${at} frame ${k}: ask '${f.ask}' not in state`)
          if (!f.note) fail(`${at} frame ${k}: missing note`)
        }
        break
      }
      case 'spot':
        if (!s.problem || !s.why) fail(`${at}: needs problem and why`)
        if (!Array.isArray(s.options) || s.options.length < 3 || s.options.length > 4) fail(`${at}: 3–4 options`)
        if (!(Number.isInteger(s.answer) && s.answer >= 0 && s.answer < (s.options || []).length)) fail(`${at}: answer out of range`)
        break
      case 'blank': {
        if (!s.intro) fail(`${at}: missing intro`)
        if (!s.template?.includes('___')) fail(`${at}: template has no ___ marker`)
        if (!s.tests?.includes('check(')) fail(`${at}: tests never call check()`)
        const n2 = (s.tests?.match(/check\(/g) || []).length
        if (n2 < 4 || n2 > 7) fail(`${at}: ${n2} checks, want 4–7`)
        break
      }
      case 'mini': {
        if (!s.mission || !s.hint) fail(`${at}: needs mission and hint`)
        if (!/\b[a-z_][a-z0-9_]*\(/.test(s.mission)) fail(`${at}: mission must name a function like foo(...)`)
        if (!s.tests?.includes('check(')) fail(`${at}: tests never call check()`)
        const n2 = (s.tests?.match(/check\(/g) || []).length
        if (n2 < 4 || n2 > 7) fail(`${at}: ${n2} checks, want 4–7`)
        break
      }
      default: fail(`${at}: unknown step type`)
    }
  })

  const spoken = (n.steps || []).some(s => s.type === 'explain' && s.lines?.some(l => l.startsWith('“')))
  if (!spoken) fail(`${n.id}: no spoken line in any explain step`)
}

// Prerequisites must form a DAG.
const state = {}
const visit = (id, path = []) => {
  if (state[id] === 'done') return
  if (state[id] === 'active') { fail(`prerequisite cycle: ${[...path, id].join(' -> ')}`); return }
  state[id] = 'active'
  for (const r of NODE_BY_ID[id]?.requires || []) visit(r, [...path, id])
  state[id] = 'done'
}
for (const n of NODES) visit(n.id)

console.log(errors ? `${errors} problem(s)` : `✓ ${NODES.length} training nodes look good`)
process.exit(errors ? 1 : 0)
