import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('dp-grid', {
  tier: 'A', xp: 220, requires: ['dp-line', 'grids'], gates: ['paths', 'minpath', 'edit', 'lcs'],
  title: 'The one-way streets', algo: 'Tables over a grid',
  steps: [
    explain([
      'The financial district is a grid and every street in it runs one way: east or south, never back. Marguerite wants the number of distinct routes from the bank at the north-west corner to the lock-up at the south-east.',
      'Dax: “Draw them. East, east, south, east — write out every sequence of turns and count the ones that land right.”',
      '“On a nine-by-nine that is forty-eight thousand routes and you will draw every one of them. And the number you want is not the routes, it is how many there are, which is a different question with a much smaller answer.”',
    ], { move: 'brute force' }),
    explain([
      '“The fire escape had one hand behind it: a step was reached from the two steps below. A junction here has two hands — the junction to its west and the junction to its north — because those are the only ways in.”',
      '“So the table stops being a line and becomes the grid itself. Routes into a junction is routes into the one west plus routes into the one north, and every junction on the top row and the west edge has exactly one route into it, because there is only one way to walk a straight line.”',
      '“Fill it row by row, west to east. Everything a junction needs is either in the row above, already finished, or to its left in the row you are on, filled a moment ago.”',
      '“And you never need more than one row at a time. Keep a single row and overwrite it in place: what sits at row[c] before you write is the junction to the north, and row[c - 1] is the junction to the west. Two hands, one list.”',
    ], { move: 'pick the pattern', code:
`def count_paths(rows, cols):
    row = [1] * cols
    for r in range(1, rows):
        for c in range(1, cols):
            row[c] = row[c] + row[c - 1]
    return row[cols - 1]` }),
    trace(
`def count_paths(rows, cols):
    row = [1] * cols
    for r in range(1, rows):
        for c in range(1, cols):
            row[c] = row[c] + row[c - 1]
    return row[cols - 1]`,
      'count_paths(2, 3)',
      [
        { line: 2, state: { rows: 2, cols: 3, row: [1, 1, 1] }, ask: 'row', note: 'The top row of the district, seeded by hand. One route into each of those three junctions, because from the bank there is nothing to do but keep going east.' },
        { line: 5, state: { rows: 2, cols: 3, r: 1, c: 1, row: [1, 2, 1] }, ask: 'row', note: 'The 1 that was at row[1] was the junction to the north, and row[0] is the junction to the west, which is still the 1 the seeding put there. 1 plus 1 is 2, and the north value is gone the instant it is used — which is fine, because nothing below will ask for it again.' },
        { line: 5, state: { rows: 2, cols: 3, r: 1, c: 2, row: [1, 2, 3] }, ask: 'row', note: 'This one reads a 1 from the north and the 2 just written to its west. Three routes to the third junction of the second row. The list now holds the second row entirely, and the first row has been overwritten out of existence.' },
        { line: 6, state: { rows: 2, cols: 3, row: [1, 2, 3], returns: 3 }, ask: 'returns', note: 'Six junctions, two additions, and the answer is the east end of the last row. A nine-by-nine costs sixty-four additions instead of forty-eight thousand drawings, and the whole thing lives in nine boxes.' },
      ]),
    spot('The lock-up moves and now the route has to pass through one particular junction in the middle of the district. Which is the least work?',
      ['Fill the whole table as before, then walk back from the corner discarding routes that missed the junction',
       'Count the routes from the bank to that junction, count the routes from that junction to the lock-up, and multiply',
       'Fill the table but write a nought into the chosen junction so nothing routes around it',
       'Add a third hand to every junction so it can remember whether the chosen junction has been visited'],
      1, 'Two small tables and one multiplication. Every route through the junction is a route to it followed by a route from it, and the two halves are independent, so the count is a product. Walking back to discard routes means enumerating routes again, which was the thing being avoided. A nought in the junction blocks it rather than requiring it — that is the obstacles question, and it is the opposite answer. A third hand per junction doubles the table to record something a product gives you free.'),
    blank('“Now price the junctions. grid[r][c] is minutes lost at that junction, and I want the cheapest route from the north-west corner to the south-east, still east and south only. The whole table this time, not one row.”',
`def min_path(grid):
    rows, cols = len(grid), len(grid[0])
    best = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                best[r][c] = grid[r][c]
            elif r == 0:
                best[r][c] = ___
            elif c == 0:
                best[r][c] = best[r - 1][c] + grid[r][c]
            else:
                best[r][c] = ___
    return best[rows - 1][cols - 1]`,
`check("min_path([[1, 3, 1], [1, 5, 1], [4, 2, 1]])", 7)
check("min_path([[1, 2], [1, 1]])", 3)
check("min_path([[5]])", 5)
check("min_path([[1, 2, 3]])", 6)
check("min_path([[1], [2], [3]])", 6)
check("min_path([[0, 0], [0, 0]])", 0)
check("min_path([[1, 2, 5], [3, 2, 1]])", 6)`),
    mini('Write max_path_sum(grid) returning the largest total of the values on a route from the top-left cell to the bottom-right, moving only right or down. Every cell on the route counts, including both ends. Values may be negative. The grid has at least one row and one column.',
      'The same table with min swapped for max. The top row and the left column each have only one way in, so they are running sums and nothing needs comparing there.',
`check("max_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]])", 12)
check("max_path_sum([[1, 2], [1, 1]])", 4)
check("max_path_sum([[5]])", 5)
check("max_path_sum([[1, 2, 3]])", 6)
check("max_path_sum([[1], [2], [3]])", 6)
check("max_path_sum([[-1, -2], [-3, -4]])", -7)
check("max_path_sum([[0, 0], [0, 0]])", 0)`),
  ],
})
