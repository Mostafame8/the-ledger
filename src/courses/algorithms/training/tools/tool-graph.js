import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-graph', {
  xp: 30, title: 'The safehouse map', algo: 'Adjacency list',
  steps: [
    explain([
      'The fence keeps four safehouses and refuses to draw a map. What she will give you is which pairs have a road between them, written as pairs on the back of a receipt.',
      'Dax: “Four by four grid, then. Sixteen squares, tick the ones with a road, done.”',
      '“Four, fine. Five hundred safehouses and your grid is a quarter of a million squares to hold eleven roads. Write down each house and who it can reach, and nothing else at all.”',
    ], { code:
`edges = [(0, 1), (1, 2), (0, 3)]
adj = [[] for _ in range(4)]   # one empty crate per house
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)           # a road runs both ways

adj                            # [[1, 3], [0, 2], [1], [0]]
adj[1]                         # [0, 2], everyone next door to house 1
len(adj[1])                    # 2
for nxt in adj[0]: ...         # every neighbour of house 0
adj = {'ana': ['boyd'], 'boyd': ['ana']}   # names instead of numbers`,
      scene: { kind: 'graph', adj: 'adj', init: [[], [], [], []], pos: [[0, 0], [2, 0], [2, 2], [0, 2]], at: ['u', 'v'],
        states: [{ adj: [[], [], [], []] }, { u: 0, v: 1, adj: [[1], [0], [], []] }, { u: 1, v: 2, adj: [[1], [0, 2], [1], []] }, { u: 0, v: 3, adj: [[1, 3], [0, 2], [1], [0]] }] } }),
    explain([
      '“adj[u] is a crate holding every house u can reach by one road. That is the whole structure: one crate per house, and getting a house’s neighbours is one index and then a walk over however many roads it actually has.”',
      '“Building it is one pass over the houses to lay out the empty crates and one pass over the roads to fill them. V plus E, never V times V, and it holds nothing at all for the pairs with no road, which is nearly all of them.”',
      '“A road that runs both ways goes down twice, once from each end. Append to adj[u] only and you have built a one-way street, which is sometimes exactly what you wanted.”',
      '“Numbered houses take a crate of crates, named ones take a rolodex of crates. Same structure either way, and adj[u] means the same thing in both.”',
    ]),
    trace(
`def build(edges, n):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    return adj[0]`,
      'build([(0, 1), (1, 2), (0, 3)], 4)',
      [
        { line: 2, state: { adj: [[], [], [], []] }, ask: 'adj', note: 'Four houses, four empty crates, before a single road has been read. The comprehension runs once per house, which is what makes them four separate crates.' },
        { line: 5, state: { u: 0, v: 1, adj: [[1], [0], [], []] }, ask: 'adj', note: 'The first road, written down twice: house 1 into house 0’s crate on line 4, house 0 into house 1’s crate on line 5. One road, two entries, and both houses can now find the other.' },
        { line: 5, state: { u: 1, v: 2, adj: [[1], [0, 2], [1], []] }, ask: 'adj', note: 'Second road. House 1 already had a neighbour, so 2 goes on the back of its crate and the 0 already in there is not disturbed.' },
        { line: 5, state: { u: 0, v: 3, adj: [[1, 3], [0, 2], [1], [0]] }, ask: 'adj', note: 'Third road, and house 0 reaches two places now. Three roads read, six appends spent, and the pairs with no road between them cost nothing because they were never mentioned.' },
        { line: 6, state: { u: 0, v: 3, adj: [[1, 3], [0, 2], [1], [0]], returns: [1, 3] }, ask: 'returns', note: 'adj[0] is house 0’s neighbours and nothing else. Dax’s grid would have made you read the whole of row 0 to find these two, and every other row to find the rest.' },
      ], { scene: { kind: 'graph', adj: 'adj', init: [[], [], [], []], pos: [[0, 0], [2, 0], [2, 2], [0, 2]], at: ['u', 'v'] } }),
    blank('“Two hands on the map. One writes a two-way road onto it. One reads me every house next door to a given one. The map arrives as a crate of crates, one per house.”',
`def add_road(adj, u, v):
    adj[u].append(v)
    ___
    return adj

def neighbours(adj, u):
    return ___`,
`check("add_road([[], [], []], 0, 1)", [[1], [0], []])
check("add_road([[1], [0], []], 1, 2)", [[1], [0, 2], [1]])
check("add_road([[], []], 1, 0)", [[1], [0]])
check("neighbours([[1, 3], [0, 2], [1], [0]], 1)", [0, 2])
check("neighbours([[1, 3], [0, 2], [1], [0]], 2)", [1])
check("neighbours([[], [0]], 0)", [])`),
  ],
})
