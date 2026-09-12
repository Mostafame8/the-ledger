import { test } from 'node:test'
import assert from 'node:assert/strict'
import { COURSES, DEFAULT_COURSE, courseById, RUNNERS } from '../src/courses/index.js'

test('algorithms, oop, patterns, sql in that order; algorithms default', () => {
  assert.deepEqual(COURSES.map(c => c.id), ['algorithms', 'oop', 'patterns', 'sql'])
  assert.equal(DEFAULT_COURSE, 'algorithms')
  assert.deepEqual(RUNNERS, ['python', 'sql'])
  assert.equal(courseById('sql').title, 'The Books')
  assert.equal(courseById('sql').runner, 'sql')
  assert.deepEqual(courseById('sql').stats, ['filter', 'join', 'shape'])
  assert.equal(courseById('oop').title, 'The Manifest')
  assert.equal(courseById('patterns').title, 'The Blueprint')
  assert.equal(courseById('nope'), null)
})

test('only the algorithms course draws the table', () => {
  for (const c of COURSES.filter(c => c.id !== 'algorithms')) {
    for (const n of [...c.training.NODES, ...c.training.TOOLS]) {
      for (const s of n.steps) assert.equal(s.scene, undefined, `${c.id}/${n.id}: no scene allowed`)
    }
  }
})

test('course ids are unique kebab-case', () => {
  const ids = COURSES.map(c => c.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/)
})

test('every course carries the shell contract', () => {
  for (const c of COURSES) {
    for (const f of ['title', 'algo']) assert.equal(typeof c[f], 'string', `${c.id}.${f}`)
    assert.ok(RUNNERS.includes(c.runner), `${c.id}: runner ${c.runner}`)
    assert.equal(c.stats.length, 3, `${c.id}: three stats`)
    assert.equal(new Set(c.stats).size, 3)
    assert.ok(Array.isArray(c.arcs) && c.arcs.length > 0)
    assert.deepEqual(c.gates, c.arcs.flatMap(a => a.gates))
    for (const g of c.gates) assert.ok(c.stats.includes(g.stat), `${c.id}/${g.id}: stat ${g.stat}`)
    for (const k of ['NODES', 'NODE_BY_ID', 'TOOLS', 'TOOL_BY_ID', 'TIERS']) assert.ok(c.training[k], `${c.id}: training.${k}`)
    assert.ok(Number.isInteger(c.xpPerLevel) && c.xpPerLevel > 0)
    assert.ok(Array.isArray(c.titles) && c.titles.length >= 2)
    assert.equal(typeof c.titleFor(0), 'string')
    assert.equal(typeof c.blurbs.heist, 'string')
    assert.equal(typeof c.blurbs.training, 'string')
    for (const t of c.training.TIERS) assert.equal(typeof c.tierBlurbs[t], 'string', `${c.id}: tierBlurbs.${t}`)
  }
})

test('gate, node and tool ids are unique within a course', () => {
  for (const c of COURSES) {
    const ids = [...c.gates.map(g => g.id), ...c.training.NODES.map(n => n.id), ...c.training.TOOLS.map(t => t.id)]
    assert.equal(new Set(ids).size, ids.length, `${c.id}: duplicate ids`)
  }
})
