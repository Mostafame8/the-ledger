// Validates gate data for every course: unique ids, required fields, rank/xp sanity, arc sizes.
import { COURSES, RUNNERS } from '../src/courses/index.js'
const RANKS = ['F','E','D','C','B','A','S']
let errors = 0
let gates = 0
for (const c of COURSES) {
  const before = errors
  const fail = m => { console.error('✗', `${c.id}: ${m}`); errors++ }
  if (!RUNNERS.includes(c.runner)) fail(`unknown runner ${c.runner}`)
  if (!Array.isArray(c.stats) || c.stats.length !== 3 || new Set(c.stats).size !== 3) fail(`stats must be three distinct keys`)
  const ids = new Set()
  for (const arc of c.arcs) {
    if (arc.gates.length < 3 || arc.gates.length > 20) fail(`${arc.name}: has ${arc.gates.length} gates (want 3–20)`)
    for (const g of arc.gates) {
      if (ids.has(g.id)) fail(`duplicate id ${g.id}`); ids.add(g.id)
      if (!RANKS.includes(g.rank)) fail(`${g.id}: bad rank ${g.rank}`)
      if (!c.stats.includes(g.stat)) fail(`${g.id}: bad stat ${g.stat}`)
      if (!(g.xp > 0)) fail(`${g.id}: xp missing`)
      for (const f of ['title','algo','mission','hint']) if (!g[f]) fail(`${g.id}: missing ${f}`)
      if (!Array.isArray(g.story) || g.story.length < 2) fail(`${g.id}: story needs 2+ lines`)
      if (g.story && !g.story.some(l => l.startsWith('“'))) fail(`${g.id}: story has no spoken line`)
      if (!g.tests) fail(`${g.id}: no tests in src/courses/${c.id}/tests.js`)
      else if (!g.tests.includes('check(')) fail(`${g.id}: tests never call check()`)
    }
  }
  gates += ids.size
  if (errors === before) console.log(`✓ ${c.id}: ${ids.size} gates across ${c.arcs.length} arcs look good`)
}
console.log(errors ? `${errors} problem(s)` : `✓ ${gates} gates across ${COURSES.length} course(s)`)
process.exit(errors ? 1 : 0)
