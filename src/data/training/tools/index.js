// Armoury tools in display order. Add a tool file, import it, append it here.
import toolList from './tool-list.js'
import toolString from './tool-string.js'
import toolDict from './tool-dict.js'
import toolSet from './tool-set.js'
import toolStack from './tool-stack.js'
import toolQueue from './tool-queue.js'

export const TOOLS = [toolList, toolString, toolDict, toolSet, toolStack, toolQueue]
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]))
