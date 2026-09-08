import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('grid-bfs', {
  tier: 'C', xp: 120, requires: ['stacks', 'grids'], gates: ['sewers', 'oranges'],
  tools: ['tool-table', 'tool-queue'],
  title: 'The flooded tunnel map', algo: 'Breadth-first search on a grid',
  steps: [
    explain([
      'Dax has the tunnel map under the financial district drawn on the back of a menu: squares of dry tunnel, squares of standing water, and two crosses. One cross is a junction he can reach from the basement. The other is where the van waits.',
      'Dax: “I walk the first corridor to the end. If it goes nowhere I walk back and take the next one. Eventually I hit the van.”',
      '“Eventually. And the number you hand me is the length of whichever corridor you happened to try first, not the shortest one. I want the fewest junctions, and I want the number before anybody wades in.”',
    ], { move: 'brute force' }),
    explain([
      '“Stop thinking in corridors and think in rings. Every junction one step from you. Then every junction one step from those, minus the ones you have already stood on. Then the next ring.”',
      '“The pile on the server cage took the newest thing off the top, which is exactly how you end up in one corridor forever. Take the oldest thing off the front instead and the map fills outward evenly, like water.”',
      '“The first ring that touches the van is the answer, and no later ring can beat it. And mark a junction the moment it goes into the queue, not when it comes out, or four of its neighbours will queue it four times.”',
    ], { move: 'pick the pattern', code:
`def steps_to(grid, start, goal):
    queue = [start]
    dist = {start: 0}
    while queue:
        r, c = queue.pop(0)
        d = dist[(r, c)]
        if (r, c) == goal:
            return d
        for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
            if not (0 <= nr < len(grid) and 0 <= nc < len(grid[0])):
                continue
            if grid[nr][nc] == 0 and (nr, nc) not in dist:
                dist[(nr, nc)] = d + 1
                queue.append((nr, nc))
    return -1` }),
    trace(
`def steps_to(grid, start, goal):
    queue = [start]
    dist = {start: 0}
    while queue:
        r, c = queue.pop(0)
        d = dist[(r, c)]
        if (r, c) == goal:
            return d
        for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
            if not (0 <= nr < len(grid) and 0 <= nc < len(grid[0])):
                continue
            if grid[nr][nc] == 0 and (nr, nc) not in dist:
                dist[(nr, nc)] = d + 1
                queue.append((nr, nc))
    return -1`,
      'steps_to([[0, 0, 0], [0, 1, 0]], (0, 0), (1, 2))',
      [
        { line: 6, state: { r: 0, c: 0, d: 0, queue: { py: '[]' } }, ask: 'queue', note: 'pop(0) takes the oldest junction off the front, so the queue is empty again before a single neighbour has been looked at. The start is nought steps from itself.' },
        { line: 14, state: { r: 0, c: 0, d: 0, queue: { py: '[(1, 0), (0, 1)]' } }, ask: 'queue', note: 'Two of the four neighbours survived: up was off the map and left was off the map. Both went in at distance 1, and both are already in dist, so nobody can queue them twice.' },
        { line: 6, state: { r: 1, c: 0, d: 1, queue: { py: '[(0, 1)]' } }, ask: 'd', note: 'The front of the queue is the first junction that went in, so the whole of ring 1 comes out before any of ring 2. Its distance was written when it was queued, not now.' },
        { line: 14, state: { r: 0, c: 2, d: 2, queue: { py: '[(1, 2)]' } }, ask: 'queue', note: '(1, 0) added nothing at all: its only unseen neighbour, (1, 1), is water. The van sits at (1, 2) and it has just been queued at distance 3, but the code does not know that yet, because the test happens on the way out, not on the way in.' },
        { line: 8, state: { r: 1, c: 2, queue: { py: '[]' } , returns: 3 }, ask: 'returns', note: 'Ring 3 came out of the queue and it is the van. Five junctions were ever queued out of six squares, the water was never entered, and the answer arrived the first time the goal was reached rather than the best of every route.' },
      ]),
    spot('Ten thousand squares of tunnel and a question: the fewest junctions between the basement and the van, count only, no route. Every step costs the same. Which shape?',
      ['A pile: follow one corridor to its end, then back out and take the next one',
       'A queue: everything one step out, then everything two steps out, marking each square as it goes in',
       'Sort the squares by their distance from the basement, then read off the van',
       'Walk every possible route from the basement to the van and keep the shortest'],
      1, 'A pile goes deep and reaches the van by some route, not the short one. Sorting by distance needs the distances, which is the thing you were asked to work out. Walking every route is right and unusable: ten thousand squares have more routes than there are seconds in the night. Rings out of a queue, marked on entry, and the first touch is the answer.'),
    blank('“Before the rings, the boring part. Given a square, hand me the squares beside it that are on the map and dry. Up, down, left, right, in that order. 0 is dry, 1 is water.”',
`def neighbours(grid, r, c):
    out = []
    for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
        if not (___):
            continue
        if ___:
            out.append((nr, nc))
    return out`,
`check("neighbours([[0, 0, 0], [0, 1, 0]], 0, 0)", [(1, 0), (0, 1)])
check("neighbours([[0, 0, 0], [0, 1, 0]], 0, 1)", [(0, 0), (0, 2)])
check("neighbours([[0, 0, 0], [0, 1, 0]], 1, 1)", [(0, 1), (1, 0), (1, 2)])
check("neighbours([[0, 0], [0, 0]], 1, 1)", [(0, 1), (1, 0)])
check("neighbours([[1, 1], [1, 1]], 0, 0)", [])
check("neighbours([[0]], 0, 0)", [])`),
    mini('Write count_reachable(grid, start) that returns how many dry squares Dax can reach from start, counting start itself. grid holds 0 for dry and 1 for water, start is a (row, col) pair on a dry square, and moves are up, down, left, right.',
      'Same rings, no distances. Mark a square when it goes into the queue and the number of marked squares at the end is the answer.',
`check("count_reachable([[0, 0, 0], [0, 1, 0]], (0, 0))", 5)
check("count_reachable([[0, 1], [1, 0]], (0, 0))", 1)
check("count_reachable([[0, 0], [0, 0]], (1, 1))", 4)
check("count_reachable([[0, 1, 0], [0, 1, 0]], (0, 0))", 2)
check("count_reachable([[0, 1, 0], [1, 1, 0]], (0, 0))", 1)
check("count_reachable([[0]], (0, 0))", 1)`),
  ],
})
