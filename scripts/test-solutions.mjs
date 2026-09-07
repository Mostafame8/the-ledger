// Proves every gate's tests are correct by running them against the reference
// solutions in scripts/solutions/*.py with the local Python.
//   node scripts/test-solutions.mjs            all gates
//   node scripts/test-solutions.mjs fizz lru   just those ids
// Solution files hold many gates, separated by lines of the form:  # === <gate id>
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { GATES } from '../src/data/index.js'

const PYTHON = process.env.PYTHON || 'python'
const root = new URL('..', import.meta.url)
const harness = readFileSync(new URL('src/harness.py', root), 'utf8')

const solutions = new Map()
const dir = new URL('scripts/solutions/', root)
for (const f of readdirSync(dir).filter(f => f.endsWith('.py'))) {
  const parts = readFileSync(new URL(f, dir), 'utf8').split(/^# === (\S+)\s*$/m)
  for (let i = 1; i < parts.length; i += 2) {
    if (solutions.has(parts[i])) console.error(`✗ duplicate solution for ${parts[i]} in ${f}`)
    solutions.set(parts[i], parts[i + 1])
  }
}

const only = process.argv.slice(2)
const gates = only.length ? GATES.filter(g => only.includes(g.id)) : GATES
const tmp = mkdtempSync(join(tmpdir(), 'ledger-'))
let failures = 0, checks = 0

for (const g of gates) {
  if (!g.tests) { console.error(`✗ ${g.id}: no tests`); failures++; continue }
  const sol = solutions.get(g.id)
  if (!sol) { console.error(`✗ ${g.id}: no reference solution`); failures++; continue }
  const file = join(tmp, `${g.id}.py`)
  writeFileSync(file, `${sol}\n\n${harness}\n\n${g.tests}\n\nimport json as __json\nprint("@@RESULTS@@" + __json.dumps(__results))\n`)
  const r = spawnSync(PYTHON, ['-I', file], { encoding: 'utf8', timeout: 60_000 })
  const m = (r.stdout || '').match(/@@RESULTS@@(.*)/)
  if (!m) { console.error(`✗ ${g.id}: crashed\n${(r.stderr || r.stdout || '').trim().split('\n').slice(-6).join('\n')}`); failures++; continue }
  const results = JSON.parse(m[1])
  if (!results.length) { console.error(`✗ ${g.id}: tests ran zero checks`); failures++; continue }
  checks += results.length
  for (const t of results.filter(t => !t.ok)) { console.error(`✗ ${g.id}: ${t.label}\n    got  ${t.got}\n    want ${t.want}`); failures++ }
}
rmSync(tmp, { recursive: true, force: true })
console.log(failures ? `${failures} problem(s)` : `✓ ${gates.length} gates, ${checks} checks, all reference solutions pass`)
process.exit(failures ? 1 : 0)
