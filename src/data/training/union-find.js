import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('union-find', {
  tier: 'A', xp: 220, requires: ['graphs'], gates: ['union', 'mst'],
  tools: ['tool-list'],
  title: 'One crew or two', algo: 'Union-find',
  steps: [
    explain([
      'Five names on the table and a stack of phone records. Marguerite is not asking who called whom. She is asking whether these five are one crew or several, and she will keep asking it as records arrive all night.',
      'Dax: “Every time a record turns up, walk the network from each name and see who I can reach.”',
      '“A record arrives every ten seconds and your walk visits every name on the table. You will spend the night re-deriving the same answer. Nothing about the crew changed except that two of them turned out to be joined.”',
    ], { move: 'brute force' }),
    explain([
      '“Give every name a boss. To begin with each one is its own boss, so five names are five crews. Follow a name up the chain of bosses until you reach somebody who is their own boss, and that name is the crew.”',
      '“Two names are in one crew if they answer with the same top boss. Joining two crews is one write: take the top boss of one and point it at the top boss of the other. Not the names — the tops. Point a name and you strand everyone hanging off it.”',
      '“A record between two names already in the same crew tells you nothing new, and the code should say so out loud by refusing to write anything. That refusal is how you count crews, and how you spot an edge you do not need.”',
      '“Nothing here walks the network. There is no adjacency list at all, only a list of bosses, and the answer to are these two joined is two chains up.”',
    ], { move: 'pick the pattern', code:
`def find(parent, x):
    while parent[x] != x:
        x = parent[x]
    return x

def union(parent, a, b):
    ra, rb = find(parent, a), find(parent, b)
    if ra == rb:
        return False
    parent[rb] = ra
    return True

def groups(n, pairs):
    parent = list(range(n))
    for a, b in pairs:
        union(parent, a, b)
    return sum(1 for i in range(n) if find(parent, i) == i)` }),
    trace(
`def find(parent, x):
    while parent[x] != x:
        x = parent[x]
    return x

def union(parent, a, b):
    ra, rb = find(parent, a), find(parent, b)
    if ra == rb:
        return False
    parent[rb] = ra
    return True

def groups(n, pairs):
    parent = list(range(n))
    for a, b in pairs:
        union(parent, a, b)
    return sum(1 for i in range(n) if find(parent, i) == i)`,
      'groups(5, [(0, 1), (2, 3), (1, 3), (0, 2)])',
      [
        { line: 10, state: { a: 0, b: 1, ra: 0, rb: 1, parent: [0, 0, 2, 3, 4] }, ask: 'parent', note: 'Everyone started as their own boss, so parent read [0, 1, 2, 3, 4] and that meant five crews. One write later, 1 answers to 0. Four crews, and nothing was walked.' },
        { line: 10, state: { a: 2, b: 3, ra: 2, rb: 3, parent: [0, 0, 2, 2, 4] }, ask: 'parent', note: 'A second, separate join. 3 now answers to 2. Two chains of two and a lone 4 — and the list is the only record of any of it.' },
        { line: 10, state: { a: 1, b: 3, ra: 0, rb: 2, parent: [0, 0, 0, 2, 4] }, ask: 'parent', note: 'The record joins 1 and 3, but the write is on neither of them. find walked 1 up to 0 and 3 up to 2, and it is 2 that gets pointed at 0. Write parent[3] = 0 instead and 2 is left behind in a crew of its own, which is a lie.' },
        { line: 9, state: { a: 0, b: 2, ra: 0, rb: 0, parent: [0, 0, 0, 2, 4] }, ask: 'parent', note: '0 and 2 both walk up to 0, so they are already one crew and union writes nothing at all — it returns False and the list is untouched. Two names are still their own boss, 0 and 4, so the answer is two crews. That False is the useful half: on the wiring gate it is exactly how you tell a cable you need from a cable you do not.' },
      ]),
    spot('Two hundred thousand names and a million records. Dax’s chains keep working but the whole thing crawls, and he finds one chain nine hundred names long. What fixes it with the least code?',
      ['Give up on chains and keep, for every name, the full list of everyone in its crew',
       'Rebuild the boss list from scratch every thousand records so the chains stay short',
       'On the way up a chain, point everything you passed straight at the top boss you found, so the next walk over those names is one step',
       'Sort the records before processing them so the joins arrive in a helpful order'],
      2, 'Full crew lists turn one join into a copy of a crew that may hold half the names, which is the walking you just got rid of. Rebuilding periodically is real work on a real schedule for a problem that has a two-line answer. Sorting cannot help because the record that makes a long chain is long-chained whenever it arrives. Flattening as you walk is the fix: you were already touching every name on the chain, so pointing each of them at the top costs nothing extra and no walk ever sees that chain again. Do that and the chains stay short enough that people stop bothering to say how short.'),
    blank('“Write the flattening version. Walk up to the top boss first, then walk the same names again and point each one at it directly.”',
`def find(parent, x):
    root = x
    while ___:
        root = parent[root]
    while x != root:
        nxt = parent[x]
        ___
        x = nxt
    return root`,
`def _t_compress(parent, x):
    find(parent, x)
    return parent

check("find([0, 0, 1], 2)", 0)
check("find([0, 1, 2], 1)", 1)
check("find([0, 0, 0, 2], 3)", 0)
check("find([1, 1], 0)", 1)
check("find([0], 0)", 0)
check("the chain 3 -> 2 -> 1 -> 0 is flattened", lambda: _t_compress([0, 0, 1, 2], 3), [0, 0, 0, 0])
check("the chain 2 -> 1 -> 0 is flattened", lambda: _t_compress([0, 0, 1], 2), [0, 0, 0])`),
    mini('Write count_groups(n, pairs) for names 0..n-1 where pairs is a list of (a, b) records meaning those two are in one group. Return how many separate groups there are. With no records at all every name is its own group. A record may repeat, and a record may name the same person twice.',
      'Start every name as its own boss and count n groups. Every record that actually joins two different groups drops the count by one; a record that joins nothing leaves it alone.',
`check("count_groups(5, [(0, 1), (2, 3), (1, 3)])", 2)
check("count_groups(3, [])", 3)
check("count_groups(1, [])", 1)
check("count_groups(4, [(0, 1), (1, 2), (2, 3)])", 1)
check("count_groups(4, [(0, 1), (0, 1), (0, 1)])", 3)
check("count_groups(6, [(0, 5), (1, 4), (2, 3)])", 3)
check("count_groups(2, [(0, 0)])", 2)`),
  ],
})
