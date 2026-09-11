// The patterns course: building the crew's kit properly, one shape at a time.
import { ARCS, GATES, XP_PER_LEVEL, TITLES, titleFor } from './index.js'
import { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS } from './training/index.js'

export const course = {
  id: 'patterns',
  title: 'The Blueprint',
  algo: 'Design patterns',
  runner: 'python',
  stats: ['structure', 'behaviour', 'creation'],
  arcs: ARCS,
  gates: GATES,
  training: { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS },
  xpPerLevel: XP_PER_LEVEL,
  titles: TITLES,
  titleFor,
  blurbs: {
    heist: `${ARCS.length} jobs, ${GATES.length} gates. The crew has money and no kit. This time it gets built right.`,
    training: `${NODES.length} lessons in the back room. Marguerite shows the shape before Dax welds it wrong.`,
  },
  tierBlurbs: {
    F: 'One job per part.',
    E: 'Making things without saying their names.',
    D: 'Wrapping what you cannot change.',
    C: 'Deciding and reacting.',
    B: 'Undo, and who gets told.',
    A: 'Staying in character.',
    S: 'The whole rig.',
  },
}
