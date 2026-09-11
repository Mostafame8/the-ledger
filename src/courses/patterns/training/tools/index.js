// Armoury tools for the patterns course, in display order. Add a tool file, import it, append it here.
import toolClass from './tool-class.js'
import toolAbstract from './tool-abstract.js'
import toolDunder from './tool-dunder.js'
import toolClosure from './tool-closure.js'
import toolDataclass from './tool-dataclass.js'
import toolGenerator from './tool-generator.js'

export const TOOLS = [toolClass, toolAbstract, toolDunder, toolClosure, toolDataclass, toolGenerator]
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]))
