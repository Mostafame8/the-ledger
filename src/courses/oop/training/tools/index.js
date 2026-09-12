// Armoury tools for the oop course, in display order. Add a tool file, import it, append it here.
import toolDict from './tool-dict.js'

export const TOOLS = [toolDict]
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]))
