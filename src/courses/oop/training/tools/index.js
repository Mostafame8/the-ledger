// Armoury tools for the oop course, in display order. Add a tool file, import it, append it here.
import toolDict from './tool-dict.js'
import toolFunction from './tool-function.js'
import toolTuple from './tool-tuple.js'
import toolDecorator from './tool-decorator.js'
import toolException from './tool-exception.js'
import toolType from './tool-type.js'

export const TOOLS = [toolDict, toolFunction, toolTuple, toolDecorator, toolException, toolType]
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]))
