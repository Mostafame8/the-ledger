// Training content for the sql course, in display order. Lessons arrive in plans 3 and 4.
export { TIERS } from '../../../training/progress.js'
export { TOOLS, TOOL_BY_ID } from './tools/index.js'

export const NODES = []
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
