import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('graphs', {
  tier: 'B', xp: 160, requires: ['grid-bfs'], gates: ['clone', 'bipartite', 'ladder'],
  title: 'The napkin network', algo: 'Adjacency lists and graph search',
  steps: [
    explain([
      'The fence keeps her informants in her head. Marguerite made her draw them on a napkin instead: a name, and beside it every name that one will talk to. Twenty lines of biro, no map, because the city is not a grid and these people are not squares.',
      'Dax: “Start at the barman. Follow his first name, then that one’s first name, and keep going until I run out. Then back up and take the next.”',
      '“You did that last week and came back with the same courier on your list four times and no mention of her sister. There is no wall to stop you and no edge to fall off, so you went round in a circle and called it a route.”',
    ], { move: 'brute force' }),
    explain([
      '“The tunnels were this problem wearing a grid. There a square’s neighbours were the four squares beside it and you worked them out with arithmetic. Here a name’s neighbours are whatever the napkin says, so you look them up instead. That is the entire difference.”',
      '“Write the napkin down as one list per person: adj[i] is everyone i talks to. Then it is the same queue, the same rings, and the same mark-it-on-the-way-in rule. On the grid that rule stopped a square being queued by four neighbours. Here it stops the circle eating you, and a network has no fence around it to save you.”',
      '“Reachable first, since it asks the least. Who can hear this at all, never mind how fast.”',
    ], { move: 'pick the pattern', code:
`def reachable(adj, start):
    seen = {start}
    queue = [start]
    while queue:
        node = queue.pop(0)
        for nxt in adj[node]:
            if nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)
    return sorted(seen)` }),
    trace(
`def reachable(adj, start):
    seen = {start}
    queue = [start]
    while queue:
        node = queue.pop(0)
        for nxt in adj[node]:
            if nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)
    return sorted(seen)`,
      'reachable([[1, 2], [0, 3], [0], [1]], 0)',
      [
        { line: 5, state: { node: 0, seen: { py: '{0}' }, queue: { py: '[]' } }, ask: 'queue', note: 'pop(0) takes the oldest name off the front, so the queue is empty again before a single contact has been looked at. The barman was marked seen on line 2, not when he came out.' },
        { line: 9, state: { node: 0, nxt: 2, seen: { py: '{0, 1, 2}' }, queue: { py: '[1, 2]' } }, ask: 'seen', note: 'Both of the barman’s contacts went in, and both were marked on the way in. 1 and 2 each talk back to 0, and neither of them can queue him again.' },
        { line: 5, state: { node: 1, seen: { py: '{0, 1, 2}' }, queue: { py: '[2]' } }, ask: 'queue', note: 'The front of the queue is the first name that went in, so everyone one handoff from the barman comes out before anyone two handoffs away.' },
        { line: 9, state: { node: 1, nxt: 3, seen: { py: '{0, 1, 2, 3}' }, queue: { py: '[2, 3]' } }, ask: 'seen', note: '1 talks to 0 and to 3. The 0 was already marked, so only the sister goes in. Four names on the napkin, four names marked, and nobody twice.' },
        { line: 5, state: { node: 3, seen: { py: '{0, 1, 2, 3}' }, queue: { py: '[]' } }, ask: 'queue', note: '2 added nothing and 3 will add nothing, because everyone either of them talks to is marked. The queue is empty, the loop is about to end, and every name was queued exactly once.' },
      ]),
    spot('Two hundred informants. Each one talks to three or four others, no more. Dax rules a two-hundred-by-two-hundred grid on butcher paper and ticks a box for every pair who talk, so he can walk the network outward from the barman. What is wrong with the butcher paper?',
      ['Nothing. A box per pair is the only honest way to write down who talks to whom',
       'Forty thousand boxes to hold seven hundred ticks, and finding one person’s contacts means reading two hundred boxes to find four. One list per person instead',
       'The paper cannot record that the barman talks to the courier and the courier talks back',
       'The paper has to be sorted before it can be walked outward from the barman'],
      1, 'The paper records both directions perfectly well; you tick both boxes. And nothing about walking outward needs anything sorted, because the queue supplies the order. The trouble is arithmetic. The grid costs the square of the crowd no matter how few of them talk, and every step of the walk reads a whole row of two hundred to find the four names in it. A list per person costs what the network actually costs and hands you the neighbours directly.'),
    blank('“Before the walk, the filing. The napkin arrives as pairs — these two talk — and I want it as one list per person. Person a talks to b, and b talks to a, because talking is not one-way.”',
`def build_adj(n, edges):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        ___
        ___
    return adj`,
`check("build_adj(3, [(0, 1), (1, 2)])", [[1], [0, 2], [1]])
check("build_adj(2, [(0, 1)])", [[1], [0]])
check("build_adj(2, [(1, 0)])", [[1], [0]])
check("build_adj(4, [])", [[], [], [], []])
check("build_adj(1, [])", [[]])
check("build_adj(3, [(0, 1), (0, 1)])", [[1, 1], [0, 0], []])`),
    mini('Write hops(adj, s, t) returning the fewest handoffs to get word from person s to person t, where adj[i] is the list of people i talks to. Return 0 if s and t are the same person and -1 if word cannot reach t at all.',
      'Rings again, but carry a distance with each name instead of only marking it. The first time t comes out of the queue you have the answer, and no later ring can beat it.',
`check("hops([[1, 2], [0, 3], [0], [1]], 0, 3)", 2)
check("hops([[1, 2], [0], [0], []], 0, 3)", -1)
check("hops([[1], [0]], 0, 0)", 0)
check("hops([[1, 2], [0, 3], [0, 3], [1, 2]], 0, 3)", 2)
check("hops([[1], [0, 2], [1, 3], [2]], 0, 3)", 3)
check("hops([[]], 0, 0)", 0)`),
  ],
})
