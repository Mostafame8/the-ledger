// Armoury tools for the patterns course, in display order. Add a tool file, import it, append it here.
import toolClass from './tool-class.js'

export const TOOLS = [toolClass]
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]))
