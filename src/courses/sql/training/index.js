// Training content for the sql course, in display order: F to S, prerequisites first within a
// tier. Add a lesson file, import it, append it here.
import pickColumns from './pick-columns.js'
import narrowItDown from './narrow-it-down.js'
import lineThemUp from './line-them-up.js'
export { TIERS } from '../../../training/progress.js'
export { TOOLS, TOOL_BY_ID } from './tools/index.js'

export const NODES = [
  pickColumns, narrowItDown, lineThemUp,
]
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
