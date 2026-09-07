// Training content in display order. Add a node file, import it, append it here.
import method from './method.js'
import twoPointers from './two-pointers.js'
export { TIERS } from './progress.js'

export const NODES = [method, twoPointers]
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
