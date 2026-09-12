// Training content for the oop course, in display order. Lessons arrive in plans 2 and 3.
export { TIERS } from '../../../training/progress.js'
export { TOOLS, TOOL_BY_ID } from './tools/index.js'

export const NODES = []
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
