// Training content for the sql course, in display order: F to S, prerequisites first within a
// tier. Add a lesson file, import it, append it here.
import pickColumns from './pick-columns.js'
import narrowItDown from './narrow-it-down.js'
import lineThemUp from './line-them-up.js'
import countWhatIsThere from './count-what-is-there.js'
import nothingIsAValue from './nothing-is-a-value.js'
import sideBySide from './side-by-side.js'
import keepTheEmpty from './keep-the-empty.js'
import tableMeetsItself from './table-meets-itself.js'
import pileThemUp from './pile-them-up.js'
import theCalendar from './the-calendar.js'
export { TIERS } from '../../../training/progress.js'
export { TOOLS, TOOL_BY_ID } from './tools/index.js'

export const NODES = [
  pickColumns, narrowItDown, lineThemUp, countWhatIsThere, nothingIsAValue,
  sideBySide, keepTheEmpty, tableMeetsItself,
  pileThemUp, theCalendar,
]
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
