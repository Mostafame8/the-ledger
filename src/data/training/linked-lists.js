import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('linked-lists', {
  tier: 'D', xp: 100, requires: ['two-pointers'], gates: ['linked', 'mergell'],
  title: 'The dead-drop chain', algo: 'Linked lists and the slow-fast pointer',
  steps: [
    explain([
      'Marguerite never keeps the drop list in one place. Each dead drop holds one instruction and the address of the next drop, and that is all. No index, no count, no way to reach the fourth one except by standing in the first three.',
      'Each drop is a Node: a val for the instruction and a next pointing at the following drop, or None where the chain ends.',
      'Dax: “Walk it and write the addresses on my arm. Then I can count them.”',
      '“Your arm holds nine addresses and the chain runs past two hundred. And if somebody has looped it back on itself you will be writing until morning.”',
    ], { move: 'brute force' }),
    explain([
      '“You cannot jump, so you run, and you run twice. Two runners on the same chain from the same drop: one taking one address at a time, one taking two.”',
      '“When the fast runner steps off the end, the slow one is standing exactly halfway along. You never counted the drops and you never wrote one down.”',
      '“And if the chain loops, the fast runner cannot step off. It comes round behind the slow one and closes the gap by one every pass until they are on the same drop. Same two runners, two different questions, no notebook for either.”',
      '“If you take both of the fast hand\'s steps on one line, the guard has to cover both: while fast and fast.next.”',
    ], { move: 'pick the pattern', code:
`def middle(head):
    slow = head
    fast = head
    while fast:
        fast = fast.next
        if fast:
            fast = fast.next
            slow = slow.next
    return slow` }),
    trace(
`def middle(head):
    slow = head
    fast = head
    while fast:
        fast = fast.next
        if fast:
            fast = fast.next
            slow = slow.next
    return slow`,
      'middle(chain of five drops holding 1, 2, 3, 4, 5)',
      [
        { line: 3, state: { 'slow.val': 1, 'fast.val': 1 }, ask: 'fast.val', note: 'Both runners start on the first drop. Nothing in this code knows the chain is five long, and nothing ever will.' },
        { line: 7, state: { 'slow.val': 1, 'fast.val': 3 }, ask: 'fast.val', note: 'Line 5 moved fast from drop 1 to drop 2, then line 7 moved it again to drop 3. Two addresses in one pass, and slow has not moved yet on this line.' },
        { line: 8, state: { 'slow.val': 2, 'fast.val': 3 }, ask: 'slow.val', note: 'Now the slow runner takes its single step. That is the whole pass: fast twice, slow once, and the gap between them grows by one.' },
        { line: 8, state: { 'slow.val': 3, 'fast.val': 5 }, ask: 'slow.val', note: 'Second pass. fast went 3 to 4 to 5, slow went 2 to 3. Whatever the chain length, fast is always twice as far along as slow.' },
        { line: 5, state: { 'slow.val': 3, fast: null }, ask: 'fast', note: 'Third pass: drop 5 has no next, so fast steps off the chain and the if on line 6 refuses to move it again. The loop stops, and slow is on drop 3, the middle of five, without anyone counting to five.' },
      ]),
    spot('The guards’ route is a chain of checkpoints, each holding the address of the next, and Marguerite thinks somebody looped it. She will not let you write down the checkpoints you have already visited. What proves it loops?',
      ['Walk it for a thousand steps. If you are still walking, it loops',
       'Two runners from the start, one stepping once a pass and one twice. If they ever land on the same checkpoint it loops; if the fast one steps off the end it does not',
       'Put each checkpoint in a set as you pass it and stop when one repeats',
       'Count the checkpoints, then count the next pointers, and compare the two'],
      1, 'A thousand steps proves nothing about a chain of two thousand. The set does work, and it is the answer everyone reaches for, but it is exactly the notebook you were told you cannot have: it costs memory that grows with the route. Counting needs the walk to finish, which is the very thing in doubt. Two runners cost two variables and always stop: a loop traps them both and the gap closes, and no loop drops the fast one off the end.'),
    blank('“Now the loop question, and it is the same two runners. Step both, then look at where they are standing. A class Node with val and next is already defined for you, and head may be None.”',
`def has_cycle(head):
    slow = head
    fast = head
    while ___:
        slow = slow.next
        ___
        if slow is fast:
            return True
    return False`,
`if 'Node' not in globals():
    class Node:
        def __init__(self, val, next=None):
            self.val = val
            self.next = next
def _t_list(values):
    head = None
    for v in reversed(values):
        head = Node(v, head)
    return head
def _t_cycle(values, at):
    head = _t_list(values)
    tail = head
    while tail.next is not None:
        tail = tail.next
    target = head
    for _ in range(at):
        target = target.next
    tail.next = target
    return head
check("has_cycle(1 -> 2 -> 3 -> 4)", lambda: has_cycle(_t_list([1, 2, 3, 4])), False)
check("has_cycle(1 -> 2 -> 3 -> 4 -> back to 2)", lambda: has_cycle(_t_cycle([1, 2, 3, 4], 1)), True)
check("has_cycle(1 -> 2 -> 3 -> back to 1)", lambda: has_cycle(_t_cycle([1, 2, 3], 0)), True)
check("has_cycle(one drop pointing at itself)", lambda: has_cycle(_t_cycle([1], 0)), True)
check("has_cycle(one drop, no next)", lambda: has_cycle(_t_list([7])), False)
check("has_cycle(None)", lambda: has_cycle(None), False)`),
    mini('Write reverse_list(head) that turns the chain of drops back to front and returns the new head. A class Node with val and next is provided; head may be None, in which case return None. Re-point the drops you already have, do not build new ones.',
      'Carry the drop behind you. Save the next address before you overwrite it, point the drop you are standing on backwards, then step on. When you step off the end, the drop behind you is the new head.',
`if 'Node' not in globals():
    class Node:
        def __init__(self, val, next=None):
            self.val = val
            self.next = next
def _t_list(values):
    head = None
    for v in reversed(values):
        head = Node(v, head)
    return head
def _t_to_list(head):
    out = []
    while head is not None:
        out.append(head.val)
        head = head.next
    return out
check("reverse_list(1 -> 2 -> 3 -> 4)", lambda: _t_to_list(reverse_list(_t_list([1, 2, 3, 4]))), [4, 3, 2, 1])
check("reverse_list(3 -> 1 -> 2)", lambda: _t_to_list(reverse_list(_t_list([3, 1, 2]))), [2, 1, 3])
check("reverse_list(1 -> 2)", lambda: _t_to_list(reverse_list(_t_list([1, 2]))), [2, 1])
check("reverse_list(7)", lambda: _t_to_list(reverse_list(_t_list([7]))), [7])
check("the old head now points at nothing", lambda: reverse_list(_t_list([1, 2, 3])).next.next.next, None)
check("reverse_list(None)", lambda: reverse_list(None), None)`),
  ],
})
