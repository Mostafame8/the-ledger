import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-table', {
  xp: 30, title: 'The ledger page', algo: 'Table',
  steps: [
    explain([
      'Dax opens the dump in a spreadsheet. Six tabs along the bottom, thousands of cells, and he scrolls, because scrolling feels like reading.',
      '“A table is rows and columns,” Marguerite says. “Every column holds one kind of thing. Every row is one fact. A blank cell is a value, and its name is NULL.”',
      '“SELECT * shows every column. LIMIT is a peek. Learn what each table holds before you ask it anything.”',
    ], { code:
`-- staff: id INTEGER, name TEXT, dept TEXT, hired TEXT, manager_id INTEGER
SELECT * FROM staff LIMIT 3;
-- (1, 'Halden Voss', 'board', '2001-03-01', None)
-- (2, 'Ines Marr', 'vault', '2009-06-15', 1)
-- (3, 'Tomas Reed', 'security', '2012-01-10', 1)

SELECT name, dept FROM staff LIMIT 2;
-- ('Halden Voss', 'board')
-- ('Ines Marr', 'vault')` }),
    explain([
      '“Rows come back as tuples, one per row, in whatever order the table happens to hold them unless you say otherwise. Never trust that order; ask for one.”',
      '“Six tables in the dump. staff: id, name, dept, hired, manager_id. accounts: id, holder, kind, branch, opened. transfers: id, from_acct, to_acct, amount, at. badges: id, staff_id, door, at, direction. cameras: id, floor, zone, installed. payments: id, payer, payee, amount, paid_on, note.”',
      '“Amounts are pence. Dates are text, year first, so they sort as text and still sort right.”',
    ]),
    trace(
`SELECT id, zone
FROM cameras
LIMIT 2`,
      'the query above',
      [
        { line: 2, state: { rows: 8 }, ask: 'rows', note: 'FROM picks the table. All eight camera rows are on the bench before anything is thrown away.' },
        { line: 1, state: { rows: 8, cols: ['id', 'zone'] }, ask: 'cols', note: 'SELECT keeps two of the four columns, in the order you named them.' },
        { line: 3, state: { rows: 8, cols: ['id', 'zone'], returns: { py: "[(1, 'lobby'), (2, 'loading-bay')]" } }, ask: 'returns', note: 'LIMIT keeps the first two rows as stored. Two tuples, two seats each.' },
      ]),
    blank('“Peek at the badges table: three named columns, the first four rows as stored.”',
`SELECT ___ FROM ___ LIMIT ___`,
`check_cols("three named columns", ['staff_id', 'door', 'at'])
check_query("the first four swipes", "SELECT staff_id, door, at FROM badges LIMIT 4", ordered=True)
check("four rows", lambda: len(learner()), 4)
check("three columns", lambda: len(learner()[0]), 3)
check("the first is Ines at the vault", lambda: learner()[0][:2], (2, 'vault'))
check("the second is Ines leaving", lambda: learner()[1][:2], (2, 'vault'))`),
  ],
})
