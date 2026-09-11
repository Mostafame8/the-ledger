import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-tree-node', {
  xp: 30, title: 'The chain of command', algo: 'Tree node',
  steps: [
    explain([
      'Halden Bank prints its own chain of command and hangs it in the third-floor office. One name at the top, and under any name at most two more, all the way down to the people who actually touch the money.',
      'Dax: “It is a chain. Hand me the slip for the manager and I will follow the addresses down.”',
      '“It forks. Every name carries two addresses, not one, and either of them can be nobody. Follow one and you have not seen the other, and nothing on the paper will remind you.”',
    ], { code:
`class Node:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

top = Node('halden', Node('vaults'), Node('floor'))
top.val         # 'halden'
top.left.val    # 'vaults'
top.right.val   # 'floor'
top.left.left   # None, nobody reports to vaults
top.left.left is None and top.left.right is None   # True, so vaults is a leaf`,
      scene: { kind: 'tree', data: { val: 'halden', left: { val: 'vaults' }, right: { val: 'floor' } }, at: ['who', 'under'], states: [{ who: 'halden' }, { who: 'halden', under: 'vaults' }, { who: 'halden', under: 'floor' }] } }),
    explain([
      '“Three fields. val for the name, and two addresses, left and right, either of which may be None. It is the next-address slip again with the chain forked in two.”',
      '“A name with nothing under either address is a leaf: node.left is None and node.right is None. Two comparisons, and it is where nearly every walk of a chart like this stops.”',
      '“Height is how many names deep the deepest run goes. An empty seat is nought deep, and any name is one plus the deeper of its two sides, because what hangs under a name is another chart of exactly the same shape.”',
      '“There is no way up. A name knows who is under it and never who is above it, so if you need the manager on the way down you carry them with you.”',
    ]),
    trace(
`def inspect(top):
    who = top.val
    under = top.left.val
    leaf = top.left.left is None and top.left.right is None
    return [who, under, leaf]`,
      "inspect(Node('halden', Node('vaults'), Node('floor')))",
      [
        { line: 2, state: { who: 'halden' }, ask: 'who', note: 'top.val is the name on the seat you are standing on and nothing more. It says nothing whatever about who is under it.' },
        { line: 3, state: { who: 'halden', under: 'vaults' }, ask: 'under', note: 'One address followed, one step down the left. The right-hand address was not touched, so floor has not been seen at all yet.' },
        { line: 4, state: { who: 'halden', under: 'vaults', leaf: true }, ask: 'leaf', note: 'Both of the vaults addresses are None, so nobody reports to vaults. That is the whole leaf test, and neither comparison had to look further than one seat.' },
        { line: 5, state: { who: 'halden', under: 'vaults', leaf: true, returns: ['halden', 'vaults', true] }, ask: 'returns', note: 'Three names on the chart and we touched two of them. Nothing here knows how wide or how deep the chart runs; every answer came off one seat and the two addresses written on it.' },
      ], { scene: { kind: 'tree', data: { val: 'halden', left: { val: 'vaults' }, right: { val: 'floor' } }, at: ['who', 'under'] } }),
    blank('“Two hands on the chart. One tells me whether a name has anybody under it at all. One reads me the names directly under a seat, left first, skipping the addresses that are nobody. A class Node with val, left and right is already defined for you.”',
`def is_leaf(node):
    return ___

def under(node):
    out = []
    if node.left is not None:
        out.append(node.left.val)
    if node.right is not None:
        ___
    return out`,
`if 'Node' not in globals():
    class Node:
        def __init__(self, val, left=None, right=None):
            self.val = val
            self.left = left
            self.right = right
check("is_leaf(a name with nobody under it)", lambda: is_leaf(Node('vaults')), True)
check("is_leaf(a name with two under it)", lambda: is_leaf(Node('halden', Node('vaults'), Node('floor'))), False)
check("is_leaf(a name with only a right)", lambda: is_leaf(Node('halden', None, Node('floor'))), False)
check("under(halden over vaults and floor)", lambda: under(Node('halden', Node('vaults'), Node('floor'))), ['vaults', 'floor'])
check("under(halden over floor only)", lambda: under(Node('halden', None, Node('floor'))), ['floor'])
check("under(halden over vaults only)", lambda: under(Node('halden', Node('vaults'))), ['vaults'])
check("under(a leaf)", lambda: under(Node('vaults')), [])`),
  ],
})
