// The sql course: Halden's database in the bag, and a fence who pays for answers.
import { ARCS, GATES, XP_PER_LEVEL, TITLES, titleFor } from './index.js'
import { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS } from './training/index.js'

export const course = {
  id: 'sql',
  title: 'The Books',
  algo: 'SQL',
  runner: 'sql',
  stats: ['filter', 'join', 'shape'],
  arcs: ARCS,
  gates: GATES,
  training: { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS },
  xpPerLevel: XP_PER_LEVEL,
  titles: TITLES,
  titleFor,
  blurbs: {
    heist: `${ARCS.length} jobs, ${GATES.length} gates. Halden's database is in the bag. The fence pays for answers, not rows.`,
    training: `${NODES.length} lessons in the back room. Dax scrolls a spreadsheet; Marguerite asks the database.`,
  },
  tierBlurbs: {
    F: 'Ask the table.',
    E: 'Two tables, side by side.',
    D: 'Pile them up.',
    C: 'A question inside a question.',
    B: 'Bands and lists.',
    A: 'Running totals and ranks.',
    S: 'Climb the chain.',
  },
}
