// Training content for the patterns course, in display order: F to S, prerequisites first
// within a tier. Add a lesson file, import it, append it here.
import oneJob from './one-job.js'
import boltOn from './bolt-on.js'
import standIn from './stand-in.js'
import theSocket from './the-socket.js'
import partsNotBloodlines from './parts-not-bloodlines.js'
export { TIERS } from '../../../training/progress.js'
export { TOOLS, TOOL_BY_ID } from './tools/index.js'

export const NODES = [oneJob, boltOn, standIn, theSocket, partsNotBloodlines]
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
