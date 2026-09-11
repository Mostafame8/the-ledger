import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-table', {
  xp: 30, title: 'The ledger grid', algo: '2-D table',
  steps: [
    explain([
      'The Ledger is ruled into rows and columns. One row per payment, one column per month, and every cell either a figure or a nought. Marguerite wants a blank page of the same shape to work on.',
      'Dax: “Rule one row and copy it down the page. Same row, twelve times, one line of code.”',
      '“Copy the row and you have not made twelve rows. You have written the same row down twelve times, and you will not find out until you change one figure and all twelve change with it.”',
    ], { code:
`rows, cols = 2, 3
t = [[0] * cols for _ in range(rows)]   # [[0, 0, 0], [0, 0, 0]]
t[1][2] = 7                             # row 1, then column 2
t                                       # [[0, 0, 0], [0, 0, 7]]
len(t)                                  # 2, the rows
len(t[0])                               # 3, the columns
for r in range(len(t)):
    for c in range(len(t[0])): ...

bad = [[0] * cols] * rows               # one row, listed twice
bad[1][2] = 7
bad                                     # [[0, 0, 7], [0, 0, 7]]. Both moved`,
      scene: { kind: 'grid', grids: [{ label: 'good', data: 'good', init: [[0, 0, 0], [0, 0, 0]] }, { label: 'bad', data: 'bad', init: [[0, 0, 0], [0, 0, 0]] }],
        states: [{ good: [[0, 0, 0], [0, 0, 0]], bad: [[0, 0, 0], [0, 0, 0]] }, { good: [[0, 0, 0], [0, 0, 7]], bad: [[0, 0, 0], [0, 0, 0]] }, { good: [[0, 0, 0], [0, 0, 7]], bad: [[0, 0, 7], [0, 0, 7]] }] } }),
    explain([
      '“Rule it with the comprehension: [[0] * cols for _ in range(rows)]. The loop runs once per row and makes a fresh crate every time, so the rows are separate things.”',
      '“Never [[0] * cols] * rows. That takes a page of one row and lists it rows times over, so every row in there is the same crate, and writing one figure writes it into all of them. It is the one mistake this thing invites, and it never announces itself.”',
      '“Row first, then column: t[r][c]. t[r] is a whole row, len(t) is the row count and len(t[0]) the column count. Reading or writing one cell is a single move.”',
      '“It costs rows times columns to hold, whether you fill it or not, and the same again to walk. That is the deal: pay for the whole page up front and every cell answers instantly ever after.”',
    ]),
    trace(
`def fill(rows, cols):
    good = [[0] * cols for _ in range(rows)]
    bad = [[0] * cols] * rows
    good[1][2] = 7
    bad[1][2] = 7
    return [good, bad]`,
      'fill(2, 3)',
      [
        { line: 2, state: { good: [[0, 0, 0], [0, 0, 0]] }, ask: 'good', note: 'Two rows of three noughts. The comprehension ran twice and ruled a fresh row each time it ran.' },
        { line: 3, state: { good: [[0, 0, 0], [0, 0, 0]], bad: [[0, 0, 0], [0, 0, 0]] }, ask: 'bad', note: 'The same figures, printed identically. That is the trap: nothing you can see here distinguishes two rows from one row listed twice.' },
        { line: 4, state: { good: [[0, 0, 0], [0, 0, 7]], bad: [[0, 0, 0], [0, 0, 0]] }, ask: 'good', note: 'Row 1, then column 2, in that order always. One cell took the 7 and the other row did not notice.' },
        { line: 5, state: { good: [[0, 0, 0], [0, 0, 7]], bad: [[0, 0, 7], [0, 0, 7]] }, ask: 'bad', note: 'The identical write into bad puts a 7 into both rows, because there is only one row in there and it is listed twice. No error, no warning, just a page that is quietly wrong.' },
        { line: 6, state: { good: [[0, 0, 0], [0, 0, 7]], bad: [[0, 0, 7], [0, 0, 7]], returns: [[[0, 0, 0], [0, 0, 7]], [[0, 0, 7], [0, 0, 7]]] }, ask: 'returns', note: 'One line apart and two different pages. Use the comprehension every single time and this never happens to you.' },
      ], { scene: { kind: 'grid', grids: [{ label: 'good', data: 'good', init: [[0, 0, 0], [0, 0, 0]] }, { label: 'bad', data: 'bad', init: [[0, 0, 0], [0, 0, 0]] }] } }),
    blank('“Two hands on the page. One rules me a fresh page of noughts, rows by columns, with the rows kept separate. One writes a figure into one cell.”',
`def new_page(rows, cols):
    return ___

def write(t, r, c, figure):
    ___
    return t`,
`check("new_page(2, 3)", [[0, 0, 0], [0, 0, 0]])
check("new_page(1, 1)", [[0]])
check("new_page(3, 2)", [[0, 0], [0, 0], [0, 0]])
def _t_separate():
    page = new_page(2, 3)
    page[1][2] = 7
    return page
check("the rows of a new page are separate", _t_separate, [[0, 0, 0], [0, 0, 7]])
check("write([[0, 0], [0, 0]], 1, 0, 5)", [[0, 0], [5, 0]])
check("write([[0]], 0, 0, 9)", [[9]])`),
  ],
})
