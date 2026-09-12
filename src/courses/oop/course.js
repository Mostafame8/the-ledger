// The oop course: the Halden take, written up as things that know what they are.
import { ARCS, GATES, XP_PER_LEVEL, TITLES, titleFor } from './index.js'
import { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS } from './training/index.js'

export const course = {
  id: 'oop',
  title: 'The Manifest',
  algo: 'Object-oriented programming',
  runner: 'python',
  stats: ['shape', 'kin', 'protocol'],
  arcs: ARCS,
  gates: GATES,
  training: { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS },
  xpPerLevel: XP_PER_LEVEL,
  titles: TITLES,
  titleFor,
  blurbs: {
    heist: `${ARCS.length} jobs, ${GATES.length} gates. The take is in bags. The fence buys nothing she cannot count.`,
    training: `${NODES.length} lessons in the back room. Marguerite turns Dax's dicts into things that know what they are.`,
  },
  tierBlurbs: {
    F: 'From a dict to a thing.',
    E: 'Who inherits what.',
    D: 'Equal, ordered, counted.',
    C: 'Walk it, open it, close it.',
    B: 'Other doors in.',
    A: 'Fields that guard themselves.',
    S: 'The class that stamps classes.',
  },
}
