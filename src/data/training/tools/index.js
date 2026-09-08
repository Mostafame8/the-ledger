// Armoury tools in display order. Add a tool file, import it, append it here.
import toolList from './tool-list.js'
import toolString from './tool-string.js'
import toolDict from './tool-dict.js'
import toolSet from './tool-set.js'
import toolStack from './tool-stack.js'
import toolQueue from './tool-queue.js'
import toolHeap from './tool-heap.js'
import toolRecursion from './tool-recursion.js'
import toolLinkedNode from './tool-linked-node.js'
import toolTreeNode from './tool-tree-node.js'
import toolGraph from './tool-graph.js'
import toolTable from './tool-table.js'

export const TOOLS = [
  toolList, toolString, toolDict, toolSet, toolStack, toolQueue,
  toolHeap, toolRecursion, toolLinkedNode, toolTreeNode, toolGraph, toolTable,
]
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]))
