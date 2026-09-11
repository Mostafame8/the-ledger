// Validates gate data: unique ids, required fields, rank/xp sanity, arc sizes.
import { ARCS } from '../src/courses/algorithms/index.js'
const RANKS = ['F','E','D','C','B','A','S'], STATS = ['logic','speed','memory']
let errors = 0
const fail = m => { console.error('✗', m); errors++ }
const ids = new Set()
for (const arc of ARCS) {
  if (arc.gates.length < 10 || arc.gates.length > 20) fail(`${arc.name}: has ${arc.gates.length} gates (want 10–20)`)
  for (const g of arc.gates) {
    if (ids.has(g.id)) fail(`duplicate id ${g.id}`); ids.add(g.id)
    if (!RANKS.includes(g.rank)) fail(`${g.id}: bad rank ${g.rank}`)
    if (!STATS.includes(g.stat)) fail(`${g.id}: bad stat ${g.stat}`)
    if (!(g.xp > 0)) fail(`${g.id}: xp missing`)
    for (const f of ['title','algo','mission','hint']) if (!g[f]) fail(`${g.id}: missing ${f}`)
    if (!Array.isArray(g.story) || g.story.length < 2) fail(`${g.id}: story needs 2+ lines`)
    if (g.story && !g.story.some(l => l.startsWith('“'))) fail(`${g.id}: story has no spoken line`)
    if (!g.tests) fail(`${g.id}: no tests in src/data/tests.js`)
    else if (!g.tests.includes('check(')) fail(`${g.id}: tests never call check()`)
  }
}
console.log(errors ? `${errors} problem(s)` : `✓ ${ids.size} gates across ${ARCS.length} arcs look good`)
process.exit(errors ? 1 : 0)
