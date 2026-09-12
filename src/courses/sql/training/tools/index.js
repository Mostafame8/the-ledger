// Armoury tools for the sql course, in display order. Add a tool file, import it, append it here.
import toolTable from './tool-table.js'

export const TOOLS = [toolTable]
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]))
