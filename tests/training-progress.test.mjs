import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rankFor, rankProgress, isOpen, depthOf } from '../src/data/training/progress.js'

const N = (id, tier, xp, requires = []) => ({ id, tier, xp, requires, gates: [], steps: [] })
const nodes = [
  N('method', 'F', 40), N('two-pointers', 'F', 60, ['method']),
  N('stacks', 'E', 70, ['two-pointers']), N('window', 'D', 90, ['stacks']),
]
const byId = Object.fromEntries(nodes.map(n => [n.id, n]))

test('rankFor: rank is the highest populated tier whose lower tiers are fully paid for', () => {
  assert.equal(rankFor(0, nodes), 'F')
  assert.equal(rankFor(99, nodes), 'F')
  assert.equal(rankFor(100, nodes), 'E')      // F total is 40 + 60
  assert.equal(rankFor(169, nodes), 'E')
  assert.equal(rankFor(170, nodes), 'D')      // F + E = 170
  assert.equal(rankFor(9999, nodes), 'D')     // no C nodes exist, so D is the ceiling
})

test('rankProgress: floor and ceil bracket the current rank', () => {
  assert.deepEqual(rankProgress(50, nodes), { rank: 'F', floor: 0, ceil: 100 })
  assert.deepEqual(rankProgress(120, nodes), { rank: 'E', floor: 100, ceil: 170 })
  assert.deepEqual(rankProgress(260, nodes), { rank: 'D', floor: 170, ceil: null })
})

test('isOpen: roots are open, others need every prerequisite cleared', () => {
  const st = {}
  assert.equal(isOpen(byId.method, st), true)
  assert.equal(isOpen(byId['two-pointers'], st), false)
  st.method = { step: 3, cleared: true }
  assert.equal(isOpen(byId['two-pointers'], st), true)
  st['two-pointers'] = { step: 2, cleared: false }
  assert.equal(isOpen(byId.stacks, st), false)
})

test('depthOf: longest prerequisite chain', () => {
  assert.equal(depthOf(byId.method, byId), 0)
  assert.equal(depthOf(byId['two-pointers'], byId), 1)
  assert.equal(depthOf(byId.window, byId), 3)
})

test('depthOf: sibling branches that share an ancestor do not shortcut each other', () => {
  const shared = [
    N('a', 'F', 40), N('b', 'F', 40, ['a']), N('c', 'F', 40, ['a']),
    N('d', 'F', 40, ['b', 'c']), N('e', 'F', 40, ['d', 'a']),
  ]
  const sharedById = Object.fromEntries(shared.map(n => [n.id, n]))
  assert.equal(depthOf(sharedById.d, sharedById), 2)
  assert.equal(depthOf(sharedById.e, sharedById), 3)
})
