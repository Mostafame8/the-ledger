import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('trees', {
  tier: 'D', xp: 100, requires: ['linked-lists'], gates: ['tree', 'bst', 'lca'],
  tools: ['tool-tree-node', 'tool-recursion'],
  title: 'The chart on the wall', algo: 'Binary trees and recursion',
  steps: [
    explain([
      'The bank prints its own org chart and hangs it in the third-floor office. One name at the top, and under each name at most two more: who reports to whom, all the way down to the tellers.',
      'Each name is a Node with a val, a left and a right, and None where nobody reports in. It is the chain of drops again, except every link forks.',
      'Dax: “How deep does it go? I will count the rows on the paper.”',
      '“The paper is a photograph on your phone and half of it is glare. Stop counting rows and ask the chart itself.”',
    ], { move: 'brute force' }),
    explain([
      '“Put your thumb on any name. What hangs underneath it is another org chart. Smaller, same shape, same rules. That is the only fact you need and it is why the answer is three lines long.”',
      '“How deep is this chart? One, for the name you are standing on, plus however deep the deeper of its two sides runs. Ask each side the same question and let it ask its own sides.”',
      '“An empty seat is nought levels deep. That is where the asking stops. Forget it and the asking never stops, and you will watch Python count its own recursion until it gives up.”',
    ], { move: 'pick the pattern', code:
`def depth(root):
    if root is None:
        return 0
    return 1 + max(depth(root.left), depth(root.right))`,
      scene: { kind: 'tree', data: { val: 1, left: { val: 2 }, right: { val: 3 } }, at: ['root.val'], states: [{ 'root.val': 1 }, { 'root.val': 2 }, { 'root.val': 3 }, { 'root.val': 1 }] } }),
    trace(
`def depth(root):
    if root is None:
        return 0
    return 1 + max(depth(root.left), depth(root.right))`,
      'depth(Node(1, Node(2), Node(3)))',
      [
        { line: 3, state: { root: null, returns: 0 }, ask: 'returns', note: 'The asking runs down the left first, so the very first answer comes from below name 2, where there is nobody. An empty seat is nought levels deep, and this is the only line that ever returns a plain number.' },
        { line: 4, state: { 'root.val': 2, returns: 1 }, ask: 'returns', note: 'Both sides of name 2 came back 0, so the deeper side is 0, plus one for name 2 itself. Name 2 answers the question it was asked and forgets everything.' },
        { line: 4, state: { 'root.val': 3, returns: 1 }, ask: 'returns', note: 'Name 3 is the same shape as name 2 and answers the same way. The two sides never learn about each other; each one only ever hears from its own children.' },
        { line: 4, state: { 'root.val': 1, returns: 2 }, ask: 'returns', note: 'The top name takes the deeper of the two answers, 1, and adds itself. Two levels. Seven calls in all, one comparison and one addition each, and not a single row counted.' },
      ], { scene: { kind: 'tree', data: { val: 1, left: { val: 2 }, right: { val: 3 } }, at: ['root.val'] } }),
    spot('Marguerite wants every name on the chart with nobody reporting to it, because those are the people who actually touch the money. Which shape of code?',
      ['One loop over the names from the top of the chart to the bottom',
       'A function that answers for one name by asking itself about that name’s left and right, and stops at an empty seat',
       'Sort the names and take the ones at the end',
       'A dictionary from each name to the manager above it'],
      1, 'There is no top-to-bottom list to loop over; all you ever hold is one name and its two sides. Sorting has nothing to say about who reports to whom. A name-to-manager dictionary answers the opposite question, and building it means walking the chart anyway, which is the work you were trying to avoid. The chart is made of charts, so the code is a function that calls itself and stops at None.'),
    blank('“Read it in order this time: the whole left side, then the name, then the whole right side. A class Node with val, left and right is provided, and root may be None.”',
`def inorder(root):
    if root is None:
        return []
    out = []
    ___
    out.append(root.val)
    ___
    return out`,
`if 'Node' not in globals():
    class Node:
        def __init__(self, val, left=None, right=None):
            self.val = val
            self.left = left
            self.right = right
def _t_tree(values):
    nodes = [None if v is None else Node(v) for v in values]
    for i, n in enumerate(nodes):
        if n is None:
            continue
        if 2 * i + 1 < len(nodes):
            n.left = nodes[2 * i + 1]
        if 2 * i + 2 < len(nodes):
            n.right = nodes[2 * i + 2]
    return nodes[0] if nodes else None
check("inorder(2 over 1 and 3)", lambda: inorder(_t_tree([2, 1, 3])), [1, 2, 3])
check("inorder(4 over 2 and 6, with 1 3 5 7 below)", lambda: inorder(_t_tree([4, 2, 6, 1, 3, 5, 7])), [1, 2, 3, 4, 5, 6, 7])
check("inorder(1 with only a right, 2)", lambda: inorder(_t_tree([1, None, 2])), [1, 2])
check("inorder(3 with only a left, 9)", lambda: inorder(_t_tree([3, 9])), [9, 3])
check("inorder(one name)", lambda: inorder(_t_tree([5])), [5])
check("inorder(None)", lambda: inorder(None), [])`),
    mini('Write bst_contains(root, x) returning True if the value x is on the tree and False if it is not. This tree is ordered: everything on a name’s left side is smaller than the name, everything on its right is larger. A class Node with val, left and right is provided, and root may be None. Walk down with a loop, not with recursion.',
      'Standing on a name, one comparison tells you which side x would have to be on, so the other side is gone for good. Reassign the name you are standing on and keep going until you are standing on nothing.',
`if 'Node' not in globals():
    class Node:
        def __init__(self, val, left=None, right=None):
            self.val = val
            self.left = left
            self.right = right
def _t_tree(values):
    nodes = [None if v is None else Node(v) for v in values]
    for i, n in enumerate(nodes):
        if n is None:
            continue
        if 2 * i + 1 < len(nodes):
            n.left = nodes[2 * i + 1]
        if 2 * i + 2 < len(nodes):
            n.right = nodes[2 * i + 2]
    return nodes[0] if nodes else None
_t_vault = _t_tree([8, 3, 10, 1, 6, None, 14])
check("bst_contains(vault, 6) two levels down", lambda: bst_contains(_t_vault, 6), True)
check("bst_contains(vault, 8) at the top", lambda: bst_contains(_t_vault, 8), True)
check("bst_contains(vault, 14) at the far right", lambda: bst_contains(_t_vault, 14), True)
check("bst_contains(vault, 7) between two boxes", lambda: bst_contains(_t_vault, 7), False)
check("bst_contains(vault, 0) below everything", lambda: bst_contains(_t_vault, 0), False)
check("bst_contains(None, 5)", lambda: bst_contains(None, 5), False)`),
  ],
})
