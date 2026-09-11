// Proves every gate's tests and every training drill's tests against reference solutions
// using the local Python, for every course.
//   node scripts/test-solutions.mjs                 everything
//   node scripts/test-solutions.mjs fizz lru        just those gate ids
//   node scripts/test-solutions.mjs two-pointers    just that training node
// Gate solutions: scripts/solutions/<course id>/*.py, blocks "# === <gate id>".
// Training solutions: scripts/solutions/<course id>/training/*.py, blocks "# === <node id>/<step index>".
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { COURSES } from '../src/courses/index.js'

const PYTHON = process.env.PYTHON || 'python'
const root = new URL('..', import.meta.url)
const harness = readFileSync(new URL('src/harness.py', root), 'utf8')

// A missing folder (a course with no drills yet) is an empty map, not a crash.
function loadSolutions(dirUrl) {
  const map = new Map()
  let files
  try { files = readdirSync(dirUrl).filter(f => f.endsWith('.py')) } catch { return map }
  for (const f of files) {
    const parts = readFileSync(new URL(f, dirUrl), 'utf8').split(/^# === (\S+)\s*$/m)
    for (let i = 1; i < parts.length; i += 2) {
      if (map.has(parts[i])) console.error(`✗ duplicate solution for ${parts[i]} in ${f}`)
      map.set(parts[i], parts[i + 1])
    }
  }
  return map
}

const only = process.argv.slice(2)
const tmp = mkdtempSync(join(tmpdir(), 'ledger-'))
let failures = 0, checks = 0, drills = 0, gateCount = 0

// Runs `tests` after `solution` and the harness; reports under `label`.
function prove(label, solution, tests) {
  const file = join(tmp, `${label.replace(/[^a-z0-9]+/gi, '_')}.py`)
  writeFileSync(file, `${solution}\n\n${harness}\n\n${tests}\n\nimport json as __json\nprint("@@RESULTS@@" + __json.dumps(__results))\n`)
  const r = spawnSync(PYTHON, ['-I', file], { encoding: 'utf8', timeout: 60_000 })
  const m = (r.stdout || '').match(/@@RESULTS@@(.*)/)
  if (!m) { console.error(`✗ ${label}: crashed\n${(r.stderr || r.stdout || '').trim().split('\n').slice(-6).join('\n')}`); failures++; return }
  const results = JSON.parse(m[1])
  if (!results.length) { console.error(`✗ ${label}: tests ran zero checks`); failures++; return }
  checks += results.length
  for (const t of results.filter(t => !t.ok)) { console.error(`✗ ${label}: ${t.label}\n    got  ${t.got}\n    want ${t.want}`); failures++ }
}

for (const c of COURSES) {
  const gateSolutions = loadSolutions(new URL(`scripts/solutions/${c.id}/`, root))
  const trainingSolutions = loadSolutions(new URL(`scripts/solutions/${c.id}/training/`, root))
  const gates = only.length ? c.gates.filter(g => only.includes(g.id)) : c.gates
  const { NODES, TOOLS } = c.training
  const nodes = only.length ? NODES.filter(n => only.includes(n.id)) : NODES
  const tools = only.length ? TOOLS.filter(t => only.includes(t.id)) : TOOLS
  gateCount += gates.length

  for (const g of gates) {
    if (!g.tests) { console.error(`✗ ${c.id}/${g.id}: no tests`); failures++; continue }
    const sol = gateSolutions.get(g.id)
    if (!sol) { console.error(`✗ ${c.id}/${g.id}: no reference solution in scripts/solutions/${c.id}/`); failures++; continue }
    prove(`${c.id} ${g.id}`, sol, g.tests)
  }

  for (const n of [...nodes, ...tools]) {
    n.steps.forEach((s, i) => {
      if (!s.tests) return
      drills++
      const key = `${n.id}/${i}`
      const sol = trainingSolutions.get(key)
      if (!sol) { console.error(`✗ ${c.id} training ${key}: no reference solution in scripts/solutions/${c.id}/training/`); failures++; return }
      prove(`${c.id} training ${key}`, sol, s.tests)
    })
  }
}

rmSync(tmp, { recursive: true, force: true })
console.log(failures ? `${failures} problem(s)` : `✓ ${gateCount} gates, ${drills} training drills, ${checks} checks, all reference solutions pass`)
process.exit(failures ? 1 : 0)
