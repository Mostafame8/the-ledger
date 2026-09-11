// The algorithms course: the original heist and its training room.
import { ARCS, GATES, XP_PER_LEVEL, TITLES, titleFor } from './index.js'
import { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS } from './training/index.js'

export const course = {
  id: 'algorithms',
  title: 'The Ledger',
  algo: 'Algorithms',
  runner: 'python',
  stats: ['logic', 'speed', 'memory'],
  arcs: ARCS,
  gates: GATES,
  training: { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS },
  xpPerLevel: XP_PER_LEVEL,
  titles: TITLES,
  titleFor,
  blurbs: {
    heist: `A heist in ${ARCS.length} arcs and ${GATES.length} gates. Every gate needs a trick. Every trick is an algorithm.`,
    training: `${NODES.length} lessons in a back room. Marguerite teaches the trick before the gate demands it.`,
  },
  tierBlurbs: {
    F: 'Hands on the tools.',
    E: 'Search, stacks, and shape.',
    D: 'Windows, sums, links, trees.',
    C: 'Grids and recursion.',
    B: 'Graphs, heaps, sorting.',
    A: 'Weighted roads and the first tables.',
    S: 'The Ledger itself.',
  },
}
