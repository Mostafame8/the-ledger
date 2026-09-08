import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('grids', {
  tier: 'F', xp: 40, requires: ['loops'], gates: ['transpose'],
  title: 'The teller floor', algo: 'Nested loops over a grid',
  steps: [
    explain([
      'A photograph of the teller floor is taped to the whiteboard: five rows of desks, six desks to a row, one camera per desk.',
      'Dax counts them out loud with a finger on the glass, loses his place at the third row, and starts again from the top.',
      'Dax: “Twenty-nine. No. Twenty-eight.”',
      '“Thirty. You skip the same desk every time you restart, because you never wrote down which row you were on.”',
    ], { move: 'brute force' }),
    explain([
      '“The floor is a list of rows. A row is a list of desks. Say that out loud until it stops sounding clever.”',
      '“Then it is two loops, one inside the other. The outer one hands you a row, the inner one hands you a desk in that row. Nothing gets skipped because nothing restarts.”',
      '“Row first, then desk. grid[r][c] is row r, column c, in that order, always.”',
    ], { move: 'name the waste', code:
`def row_sums(grid):
    out = []
    for row in grid:
        total = 0
        for v in row:
            total += v
        out.append(total)
    return out` }),
    trace(
`def row_sums(grid):
    out = []
    for row in grid:
        total = 0
        for v in row:
            total += v
        out.append(total)
    return out`,
      'row_sums([[1, 2], [3, 4]])',
      [
        { line: 4, state: { row: [1, 2], total: 0, out: [] }, ask: 'total', note: 'Line 4 runs once per row, not once for the whole grid. Each row starts its own tally at zero.' },
        { line: 6, state: { row: [1, 2], v: 2, total: 3, out: [] }, ask: 'total', note: '1 went in, then 2. The inner loop has run out of desks in this row.' },
        { line: 6, state: { row: [3, 4], v: 4, total: 7, out: [3] }, ask: 'total', note: 'The outer loop moved to the second row and line 4 reset the tally, so this is 3 + 4 and nothing else. out already holds the first row.' },
        { line: 8, state: { row: [3, 4], v: 4, total: 7, out: [3, 7] }, ask: 'out', note: 'One number per row, in row order. The outer loop walks rows, the inner loop walks the desks inside one.' },
      ]),
    spot('Every desk on the floor photo has to be checked exactly once. The floor is a list of rows, each row a list of desks. What shape does the code take?',
      ['One loop over the rows', 'One loop over the rows, then a separate loop over the columns', 'A loop over the rows with a loop over that row inside it', 'Write out the desks by hand into one long list first'],
      2, 'A loop over rows alone hands you whole rows, never a single desk. Two loops side by side visit five rows and six columns, which is eleven things, not thirty. Writing the desks out by hand is doing the walk you were trying to write. Nest them: for each row, for each desk in that row.'),
    blank('“Now the other direction. Give me one column of the floor, top to bottom, as a list.”',
`def column(grid, c):
    out = []
    for r in range(len(grid)):
        out.append(___)
    return out`,
`check("column([[1, 2], [3, 4]], 0)", [1, 3])
check("column([[1, 2], [3, 4]], 1)", [2, 4])
check("column([[1], [2], [3]], 0)", [1, 2, 3])
check("column([[7, 8, 9]], 2)", [9])
check("column([], 0)", [])`),
    mini('Write diagonal(grid) that takes a square grid and returns the values running from the top-left corner down to the bottom-right one, as a list.',
      'On that line the row number and the column number are always the same, so one loop is enough.',
`check("diagonal([[1, 2], [3, 4]])", [1, 4])
check("diagonal([[1, 2, 3], [4, 5, 6], [7, 8, 9]])", [1, 5, 9])
check("diagonal([[5]])", [5])
check("diagonal([])", [])
check("sum(diagonal([[2, 0], [0, 3]]))", 5)`),
  ],
})
