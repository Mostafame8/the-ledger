// Armoury tools for the sql course, in display order. Add a tool file, import it, append it here.
import toolTable from './tool-table.js'
import toolSelect from './tool-select.js'
import toolWhere from './tool-where.js'
import toolOrder from './tool-order.js'
import toolGroup from './tool-group.js'
import toolNull from './tool-null.js'

export const TOOLS = [toolTable, toolSelect, toolWhere, toolOrder, toolGroup, toolNull]
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]))
