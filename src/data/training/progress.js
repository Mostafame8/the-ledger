// Pure progression rules for the training room. No Vue, no DOM, unit-tested in tests/.
export const TIERS = ['F', 'E', 'D', 'C', 'B', 'A', 'S']

// Sum of node xp per tier, only for tiers that have nodes, in TIERS order.
function tierTotals(nodes) {
  const totals = new Map()
  for (const n of nodes) totals.set(n.tier, (totals.get(n.tier) || 0) + n.xp)
  return TIERS.filter(t => totals.has(t)).map(t => [t, totals.get(t)])
}

// Ladder: [{ rank, floor }] where floor is the xp needed to hold that rank.
// Rank R is reached when xp >= total xp of every populated tier below R.
function ladder(nodes) {
  let acc = 0
  return tierTotals(nodes).map(([rank, total]) => { const step = { rank, floor: acc }; acc += total; return step })
}

export function rankFor(xp, nodes) {
  const steps = ladder(nodes)
  let rank = steps[0]?.rank ?? 'F'
  for (const s of steps) if (xp >= s.floor) rank = s.rank
  return rank
}

export function rankProgress(xp, nodes) {
  const steps = ladder(nodes)
  let i = 0
  for (let k = 0; k < steps.length; k++) if (xp >= steps[k].floor) i = k
  return { rank: steps[i]?.rank ?? 'F', floor: steps[i]?.floor ?? 0, ceil: steps[i + 1] ? steps[i + 1].floor : null }
}

export function isOpen(node, nodeStates) {
  return node.requires.every(id => nodeStates[id]?.cleared)
}

export function depthOf(node, byId, seen = new Set()) {
  if (!node.requires.length || seen.has(node.id)) return 0
  seen.add(node.id)
  return 1 + Math.max(...node.requires.map(id => depthOf(byId[id], byId, seen)))
}
