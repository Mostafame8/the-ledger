// Training content for the oop course, in display order: F to S, prerequisites first
// within a tier. Add a lesson file, import it, append it here.
import theStampedTag from './the-stamped-tag.js'
import theTagsOwnMoves from './the-tags-own-moves.js'
import readingItBack from './reading-it-back.js'
import sharedInkOwnName from './shared-ink-own-name.js'
import theGuardedField from './the-guarded-field.js'
import theFamilyLine from './the-family-line.js'
import callUpTheLine from './call-up-the-line.js'
import twoParents from './two-parents.js'
export { TIERS } from '../../../training/progress.js'
export { TOOLS, TOOL_BY_ID } from './tools/index.js'

export const NODES = [
  theStampedTag, theTagsOwnMoves, readingItBack, sharedInkOwnName, theGuardedField,
  theFamilyLine, callUpTheLine, twoParents,
]
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
