import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('weighted-graphs', {
  tier: 'A', xp: 220, requires: ['graphs', 'heaps'], gates: ['routes', 'bellman', 'mst'],
  tools: ['tool-graph', 'tool-heap'],
  title: 'The price of every cordon', algo: 'Dijkstra on a weighted graph',
  steps: [
    explain([
      'Marguerite has the night’s road closures marked on the city map, and beside each junction a number: minutes lost getting through it. Not every street costs the same any more. Four junctions on the sheet, and she wants the cheapest way out of each of them.',
      'Dax: “The napkin trick. Rings outward from the bank, count the rings, done.”',
      '“Rings count streets. Nobody is charging you for streets. Two hops through the ring road cost four minutes; one hop through the checkpoint on Halden Street costs nine. Your rings put the checkpoint first and it is the slowest route on the map.”',
    ], { move: 'brute force' }),
    explain([
      '“Rings worked because every step cost one, so the queue handed them back in price order for free. Charge different prices and the plain queue is useless — it will hand you a nine-minute route before a four-minute one and mark it settled.”',
      '“So stop using a queue and use the short list instead. Keep a heap of (price so far, junction) and always take the cheapest thing in it. The first time a junction comes off the heap, that price is final: everything still waiting costs at least that much, and nothing on this map is free, so no later route can undercut it.”',
      '“Hold a running best price for every junction, unknown to begin with. Unknown is float("inf") — it compares bigger than any real price and it prints as inf. When a route beats the best you had, write it down and push the junction back on the heap with its new price.”',
      '“The old entry is still sitting in the heap with the worse price. Do not go hunting for it. Let it come off, notice the price it carries is worse than the best you now hold, and drop it on the floor. One line, and it is the line people leave out.”',
    ], { move: 'pick the pattern', code:
`import heapq

def shortest(n, adj, src):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for nxt, w in adj[node]:
            if d + w < dist[nxt]:
                dist[nxt] = d + w
                heapq.heappush(heap, (dist[nxt], nxt))
    return dist`,
      scene: { kind: 'graph', adj: [[[1, 1], [2, 4]], [[0, 1], [2, 2]], [[0, 4], [1, 2], [3, 1]], [[2, 1]]], pos: [[0, 0], [2, 0], [1, 2], [3, 2]], at: ['node', 'nxt'], badges: 'dist',
        states: [{ node: 0, nxt: 2, dist: [0, 1, 4, { py: 'inf' }] }, { node: 1, nxt: 2, dist: [0, 1, 3, { py: 'inf' }] }, { node: 2, nxt: 3, dist: [0, 1, 3, 4] }] } }),
    trace(
`import heapq

def shortest(n, adj, src):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for nxt, w in adj[node]:
            if d + w < dist[nxt]:
                dist[nxt] = d + w
                heapq.heappush(heap, (dist[nxt], nxt))
    return dist`,
      'shortest(4, [[(1, 1), (2, 4)], [(0, 1), (2, 2)], [(0, 4), (1, 2), (3, 1)], [(2, 1)]], 0)',
      [
        { line: 14, state: { node: 0, d: 0, nxt: 2, w: 4, dist: { py: '[0, 1, 4, inf]', val: [0, 1, 4, { py: 'inf' }] } }, ask: 'dist', note: 'Both streets out of junction 0 are priced in: 1 to junction 1, 4 to junction 2. Junction 3 is still inf, which is not a mistake — it means no route there has been found yet, and inf loses every comparison against a real price it meets.' },
        { line: 9, state: { d: 1, node: 1, dist: { py: '[0, 1, 4, inf]', val: [0, 1, 4, { py: 'inf' }] }, heap: { py: '[(4, 2)]' } }, ask: 'node', note: 'The heap held (1, 1) and (4, 2) and handed back the cheaper. Junction 1 is settled at 1 minute now and for good. Had this been a plain queue it would have handed back whichever went in first, which is the whole difference.' },
        { line: 14, state: { node: 1, d: 1, nxt: 2, w: 2, dist: { py: '[0, 1, 3, inf]', val: [0, 1, 3, { py: 'inf' }] } }, ask: 'dist', note: 'Two hops through junction 1 cost 3, which beats the 4 the direct street quoted. The best price for junction 2 is overwritten and the junction is pushed again — now as (3, 2), while the stale (4, 2) is still sitting in the heap.' },
        { line: 9, state: { d: 4, node: 2, dist: { py: '[0, 1, 3, 4]', val: [0, 1, 3, 4] }, heap: { py: '[(4, 3)]' } }, ask: 'node', note: 'Here is the stale entry, arriving with a price of 4 for a junction whose best is 3. Junction 2 was settled two pops ago. Line 10 catches it, line 11 drops it, and nothing was ever deleted from the middle of a heap.' },
        { line: 16, state: { dist: { py: '[0, 1, 3, 4]', val: [0, 1, 3, 4] } }, ask: 'dist', note: 'Four junctions, five pops, one of them wasted. The route to junction 3 costs 4 and goes the long way round through 1 and 2 — three streets, cheaper than the two-street route the rings would have sold you.' },
      ], { scene: { kind: 'graph', adj: [[[1, 1], [2, 4]], [[0, 1], [2, 2]], [[0, 4], [1, 2], [3, 1]], [[2, 1]]], pos: [[0, 0], [2, 0], [1, 2], [3, 2]], at: ['node', 'nxt'], badges: 'dist' } }),
    spot('Marguerite adds a junction where a contact hands you back six minutes: the street into it costs 2 and the street out of it is priced at minus 6. Dax runs the cheapest-route code on the new map and gets an answer that is plainly too expensive. Why?',
      ['The heap cannot hold negative numbers, so the entry sorts to the wrong place',
       'Settling a junction the first time it comes off the heap assumes no route can get cheaper later, which a negative price breaks; that map needs a method that relaxes every street repeatedly instead',
       'The unknown price has to start at a large integer rather than float("inf") once negative prices are in play',
       'The stale-entry check on line 10 is wrong for negative prices and should compare with >= instead'],
      1, 'A heap orders negative numbers perfectly well, and inf still compares bigger than all of them. The stale check is not the problem either — it is a shortcut, not the assumption. The assumption is one line earlier and it is the whole reason a heap is enough: the cheapest thing waiting cannot be beaten later, because getting there involves at least one more street and streets cost money. A street that pays you back destroys that sentence, and with it the right to call a junction settled. Relaxing every street over and over until nothing improves is the method that survives it, and it is slower for exactly that reason.'),
    blank('“Write the whole thing. Two lines missing: the one that drops a stale entry, and the one that writes down a better price. adj[i] is a list of (neighbour, minutes) pairs.”',
`import heapq

def dijkstra(n, adj, src):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, node = heapq.heappop(heap)
        if ___:
            continue
        for nxt, w in adj[node]:
            if d + w < dist[nxt]:
                ___
                heapq.heappush(heap, (dist[nxt], nxt))
    return dist`,
`check("dijkstra(1, [[]], 0)", [0])
check("dijkstra(2, [[(1, 5)], [(0, 5)]], 0)", [0, 5])
check("dijkstra(3, [[(1, 2)], [(0, 2)], []], 0)", [0, 2, float('inf')])
check("dijkstra(4, [[(1, 1), (2, 4)], [(0, 1), (2, 2)], [(0, 4), (1, 2), (3, 1)], [(2, 1)]], 0)", [0, 1, 3, 4])
check("dijkstra(4, [[(1, 1), (2, 4)], [(0, 1), (2, 2)], [(0, 4), (1, 2), (3, 1)], [(2, 1)]], 3)", [4, 3, 1, 0])
check("dijkstra(3, [[(1, 1), (2, 10)], [(2, 1)], []], 0)", [0, 1, 2])
check("dijkstra(2, [[], []], 1)", [float('inf'), 0])`),
    mini('Write cheapest(n, edges, s, t) for a map of junctions 0..n-1 where edges is a list of (u, v, minutes) triples and every street runs both ways with a non-negative price. Return the cheapest total from s to t, 0 when s and t are the same junction, and -1 when t cannot be reached at all. There may be two streets between the same pair.',
      'Build the neighbour lists first, both directions, then run the same heap. You do not need to finish the whole map: the first time t comes off the heap its price is final.',
`check("cheapest(4, [(0, 1, 1), (1, 2, 2), (2, 3, 1), (0, 2, 4)], 0, 3)", 4)
check("cheapest(2, [(0, 1, 7)], 0, 1)", 7)
check("cheapest(3, [(0, 1, 1)], 0, 2)", -1)
check("cheapest(1, [], 0, 0)", 0)
check("cheapest(3, [(0, 1, 5), (1, 2, 5), (0, 2, 11)], 0, 2)", 10)
check("cheapest(4, [(0, 1, 1), (1, 2, 1), (2, 3, 1), (0, 3, 10)], 3, 0)", 3)
check("cheapest(2, [(0, 1, 3), (0, 1, 1)], 0, 1)", 1)`),
  ],
})
