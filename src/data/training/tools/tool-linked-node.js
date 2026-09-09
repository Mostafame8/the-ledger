import { tool, explain, trace, blank } from '../node.js'

export default tool('tool-linked-node', {
  xp: 30, title: 'The next-address slip', algo: 'Linked node',
  steps: [
    explain([
      'Marguerite hands over one slip of paper. It carries a single instruction and, underneath, the address of the next slip. That is all it carries: no count, no numbering, and no list of them anywhere in the city.',
      'Dax: “Fine. Give me the fourth one.”',
      '“There is no fourth one to give. There is this one and the address on it. If you want the fourth you stand in the first three first, and that is the price of a chain nobody has to keep in one place.”',
    ], { code:
`class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

a = Node('meet')
b = Node('pay')
a.next = b        # one assignment and the chain is two long
a.val             # 'meet'
a.next.val        # 'pay'
b.next            # None, the chain ends here
a.next.next.val   # AttributeError: 'NoneType' object has no attribute 'val'`,
      scene: { kind: 'cells', chain: true, data: ['meet', 'pay', 'burn'], at: ['a.next.val', 'b.next.val'], labels: { 'a.next.val': 'a.next', 'b.next.val': 'b.next' },
        states: [{ 'a.next.val': 'pay' }, { 'a.next.val': 'pay', 'a.next.next.val': 'burn' }, { 'a.next.val': 'burn', 'b.next.val': 'burn' }] },
    }),
    explain([
      '“Two fields and that is the whole thing. val for what the slip says, next for the slip after it, or None where the chain stops.”',
      '“Relinking is one move. Point a.next somewhere else and you have spliced the chain, however long it runs, and nothing else shifted an inch. A crate cannot do that: putting something at its front shoves every other item along.”',
      '“Reaching is the price. There is no slip number four, so getting to the fourth costs four steps, and asking how long the chain is costs a walk all the way to the end.”',
      '“Guard the ends. The head may be None before you start and node.next may be None before you finish, and reading .val off None is an AttributeError.”',
    ]),
    trace(
`def splice(a, b, c):
    a.next = b
    b.next = c
    a.next = c
    return a.next.val`,
      "splice(Node('meet'), Node('pay'), Node('burn'))",
      [
        { line: 2, state: { 'a.next.val': 'pay' }, ask: 'a.next.val', note: 'One assignment and the meet slip now carries the address of the pay slip. Nothing was copied and nothing moved; the slip simply has a different address written on it.' },
        { line: 3, state: { 'a.next.val': 'pay', 'a.next.next.val': 'burn' }, ask: 'a.next.next.val', note: 'pay now points at burn, so from the meet slip the chain reads meet, pay, burn. That is the only way you can read it: forwards, one slip at a time.' },
        { line: 4, state: { 'a.next.val': 'burn', 'b.next.val': 'burn' }, ask: 'a.next.val', note: 'One more assignment and meet points straight at burn. The pay slip still exists and still holds burn’s address, but nothing points at pay any more, so from meet it has gone. Cutting a slip out of a chain costs exactly one move.' },
        { line: 5, state: { 'a.next.val': 'burn', 'b.next.val': 'burn', returns: 'burn' }, ask: 'returns', note: 'Two slips long now, and nobody ever kept a count. Ask how long the chain is and the only honest answer is to walk it.' },
      ],
      { scene: { kind: 'cells', chain: true, data: ['meet', 'pay', 'burn'], at: ['a.next.val', 'b.next.val'], labels: { 'a.next.val': 'a.next', 'b.next.val': 'b.next' } } }),
    blank('“Two hands on a slip. One writes the address of a second slip onto the first. One reads me what the next slip says, and the last slip in a chain has no next slip. A class Node with val and next is already defined for you.”',
`def link(a, b):
    ___
    return a

def value_after(node):
    if node.next is None:
        return None
    return ___`,
`if 'Node' not in globals():
    class Node:
        def __init__(self, val, next=None):
            self.val = val
            self.next = next
def _t_chain(values):
    head = None
    for v in reversed(values):
        head = Node(v, head)
    return head
def _t_read(head):
    out = []
    while head is not None:
        out.append(head.val)
        head = head.next
    return out
check("link(meet, pay) reads meet -> pay", lambda: _t_read(link(Node('meet'), Node('pay'))), ['meet', 'pay'])
check("link hands back the slip you gave it", lambda: link(Node('meet'), Node('pay')).val, 'meet')
check("link writes over the address already there", lambda: _t_read(link(_t_chain(['meet', 'pay']), Node('burn'))), ['meet', 'burn'])
check("value_after(meet -> pay)", lambda: value_after(_t_chain(['meet', 'pay'])), 'pay')
check("value_after(meet -> pay -> burn)", lambda: value_after(_t_chain(['meet', 'pay', 'burn'])), 'pay')
check("value_after(the last slip in the chain)", lambda: value_after(_t_chain(['meet'])), None)`),
  ],
})
