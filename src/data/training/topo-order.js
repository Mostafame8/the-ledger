import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('topo-order', {
  tier: 'B', xp: 170, requires: ['graphs'], gates: ['topo', 'alien'],
  tools: ['tool-graph', 'tool-queue'],
  title: 'The cards nobody waits on', algo: 'Topological ordering',
  steps: [
    explain([
      'The job board in the training room is forty index cards. Cut the power. Kill the cameras. Drill the lock. Open the door. Thirty-six more, and between them Marguerite has drawn arrows in red. An arrow from one card to another means the first has to be finished before the second can start.',
      'Dax: “Read the board top to bottom. If a card is not ready when I reach it, skip it and come round again.”',
      '“Round and round the board until a lap changes nothing. Forty cards means up to forty laps of forty cards, and if two of those arrows point at each other you will circle the board until morning without ever noticing why.”',
    ], { move: 'brute force' }),
    explain([
      '“The waste is the re-reading. A card is only ever unblocked by a card you have just finished, so the other thirty-eight had nothing to say to you.”',
      '“Count, once, how many arrows point into each card. The cards on nought are the ones nobody is waiting on. Queue them, because they can go now.”',
      '“Take one off the queue, call it done, then follow its arrows out and knock one off the count of each card it feeds. Any count that reaches nought joins the queue. Every card is handled once and every arrow is walked once.”',
      '“And if the queue runs dry with cards left on the board, those cards are pointing at each other in a ring. That is not a scheduling problem, that is a plan that cannot happen, and Marguerite would rather hear it now than at two in the morning.”',
    ], { move: 'name the waste', code:
`def topo(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in edges:
        adj[a].append(b)
        indeg[b] += 1
    queue = [i for i in range(n) if indeg[i] == 0]
    out = []
    while queue:
        node = queue.pop(0)
        out.append(node)
        for nxt in adj[node]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                queue.append(nxt)
    return out if len(out) == n else []`,
      scene: { kind: 'rows', rows: [
        { label: 'indeg', data: 'indeg', init: [0, 1, 1, 2], pointers: ['node', 'nxt'] },
        { label: 'queue', data: 'queue', init: [0] },
      ], states: [{ indeg: [0, 1, 1, 2], queue: [0] }, { node: 0, nxt: 2, indeg: [0, 0, 0, 2], queue: [1, 2] }, { node: 1, nxt: 3, indeg: [0, 0, 0, 1], queue: [2] }, { node: 2, nxt: 3, indeg: [0, 0, 0, 0], queue: [3] }] },
    }),
    trace(
`def topo(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in edges:
        adj[a].append(b)
        indeg[b] += 1
    queue = [i for i in range(n) if indeg[i] == 0]
    out = []
    while queue:
        node = queue.pop(0)
        out.append(node)
        for nxt in adj[node]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                queue.append(nxt)
    return out if len(out) == n else []`,
      'topo(4, [(0, 1), (0, 2), (1, 3), (2, 3)])',
      [
        { line: 7, state: { indeg: [0, 1, 1, 2], queue: [0] }, ask: 'indeg', note: 'Four cards: power, cameras, lock, door. Power has nothing pointing into it, cameras and lock each wait on power, and the door waits on both of them. That last 2 is the whole reason a plain sort will not do.' },
        { line: 15, state: { node: 0, nxt: 2, indeg: [0, 0, 0, 2], queue: [1, 2] }, ask: 'queue', note: 'Power is done, so both of the cards it fed dropped to nought and both joined the queue. The door’s count has not moved at all, because neither of the cards pointing into it is finished.' },
        { line: 13, state: { node: 1, nxt: 3, indeg: [0, 0, 0, 1], queue: [2] }, ask: 'indeg', note: 'Cameras are done and the door’s count came off by one. One is not nought, so the door is not queued — it still waits on the lock. This is the step the sort-by-count plan skips.' },
        { line: 15, state: { node: 2, nxt: 3, indeg: [0, 0, 0, 0], queue: [3] }, ask: 'queue', note: 'The lock was the door’s last prerequisite. Its count reaches nought and only now does the door become work you can hand somebody.' },
        { line: 16, state: { indeg: [0, 0, 0, 0], queue: [], returns: [0, 1, 2, 3] }, ask: 'returns', note: 'Four cards out of a queue that never held more than two, every arrow walked once. The length check at the end is the contradiction test: cards trapped in a ring never reach nought, so they never queue, so they are missing from the output.' },
      ],
      { scene: { kind: 'rows', rows: [
        { label: 'indeg', data: 'indeg', init: [0, 1, 1, 2], pointers: ['node', 'nxt'] },
        { label: 'queue', data: 'queue', init: [0] },
      ] } }),
    spot('Forty tasks and a list of pairs meaning “this one before that one”. Dax proposes sorting the tasks by how many arrows point into each, fewest first, and calling that the plan. Where does it fall over?',
      ['Nowhere. A task with fewer prerequisites is always safe to do earlier',
       'It counts the arrows but never crosses them off, so a task with one arrow into it can be scheduled ahead of the task that arrow comes from',
       'It works, but the sort costs more than the counting does',
       'It works only when no two tasks have the same number of arrows into them'],
      1, 'The counts are the right idea put to the wrong use. A count is a fact about the board before anything is done; the instant a task is finished its arrows have to come off the counts of the tasks it feeds, and only then do you learn who is free. Cost is not the objection — the order would be wrong at any speed. And distinct counts do not rescue it either: cameras and lock can both have exactly one arrow in and still be forbidden to swap with the task that feeds them.'),
    blank('“Fill in the two lines that matter. Which cards start in the queue, and what happens to a card’s count when the thing it was waiting for gets done.”',
`def topo(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in edges:
        adj[a].append(b)
        indeg[b] += 1
    queue = [___]
    out = []
    while queue:
        node = queue.pop(0)
        out.append(node)
        for nxt in adj[node]:
            ___
            if indeg[nxt] == 0:
                queue.append(nxt)
    return out if len(out) == n else []`,
`check("topo(4, [(0, 1), (0, 2), (1, 3), (2, 3)])", [0, 1, 2, 3])
check("topo(3, [(2, 1), (1, 0)])", [2, 1, 0])
check("topo(4, [(1, 0)])", [1, 2, 3, 0])
check("topo(3, [])", [0, 1, 2])
check("topo(1, [])", [0])
check("topo(2, [(0, 1), (1, 0)])", [])`),
    mini('Write can_finish(n, edges) returning True if the plan can be carried out at all, for tasks 0..n-1 and edges (a, b) meaning a must come before b. It is False exactly when some tasks point at each other in a ring.',
      'You do not need the order, only whether every card came off the board. Run the counts and the queue and compare how many you got out with how many there were.',
`check("can_finish(2, [(0, 1)])", True)
check("can_finish(2, [(0, 1), (1, 0)])", False)
check("can_finish(4, [(0, 1), (1, 2), (2, 3)])", True)
check("can_finish(3, [(0, 1), (1, 2), (2, 0)])", False)
check("can_finish(5, [(0, 1), (2, 3)])", True)
check("can_finish(1, [(0, 0)])", False)
check("can_finish(1, [])", True)`),
  ],
})
