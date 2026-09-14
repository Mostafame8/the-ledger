import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('nothing-is-a-value', {
  tier: 'F', xp: 60, requires: ['count-what-is-there'], gates: ['emptyaccounts'],
  tools: ['tool-null'],
  title: 'Nothing is a value', algo: 'NULL',
  steps: [
    explain([
      'One staff row in the dump has an empty department. Dax types the word none into the gap so the sheet looks tidy, and now the crew\'s copy says something the bank\'s copy does not.',
      'He goes looking for the gap again later with dept = \'\' and then with dept = NULL, and both come back with nothing at all, which he reads as proof that he fixed it.',
      '“An empty cell is a value and its name is NULL,” Marguerite says. “It means nobody wrote it down. It is not an empty word and it is not a zero, and it answers only two questions.”',
    ], { move: 'brute force' }),
    explain([
      '“dept = NULL is never true. Neither is dept <> NULL. Unknown compared with anything stays unknown, and unknown never gets through a sieve.”',
      '“The two questions it does answer are IS NULL and IS NOT NULL. To print a blank without lying about the table, COALESCE hands back the first thing that is not blank.”',
    ], { move: 'pick the pattern', code:
`SELECT name FROM staff WHERE dept IS NULL;
-- ('Bo Lund',)

SELECT name FROM staff WHERE dept = NULL;
-- (no rows at all)

SELECT name, COALESCE(dept, 'unassigned') AS dept FROM staff WHERE id = 11;
-- ('Bo Lund', 'unassigned')` }),
    trace(
`SELECT COUNT(*) AS rows_all,
       COUNT(dept) AS with_dept
FROM staff`,
      'the query above',
      [
        { line: 3, state: { rows: 12 }, ask: 'rows', note: 'Twelve staff rows on the bench. Nothing is sieved out — there is no WHERE here.' },
        { line: 2, state: { rows: 12, with_dept: 11 }, ask: 'with_dept', note: 'COUNT of a column walks past the blanks. One row has nothing written in dept, so eleven.' },
        { line: 1, state: { rows: 12, with_dept: 11, returns: { py: '[(12, 11)]' } }, ask: 'returns', note: 'One row, two seats. The gap between the two numbers is exactly the number of blanks.' },
      ]),
    spot('Dax wants the staff with no department and writes WHERE dept = NULL. What comes back?',
      ['The one row with the blank department',
       'No rows at all, because unknown = unknown is not true',
       'Every row, because everything equals unknown',
       'An error — NULL cannot appear in a WHERE'],
      1, 'Comparing with NULL gives neither true nor false but unknown, and only true gets through the sieve. IS NULL is the question that gets a straight answer.'),
    blank('“The one name the dump never gave a department.”',
`SELECT name FROM staff WHERE dept ___ ___`,
`check_cols("one column named name", ['name'])
check_query("the staff member with no department", "SELECT name FROM staff WHERE dept IS NULL")
check_query("a second blank joins the first", "SELECT name FROM staff WHERE dept IS NULL",
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', NULL, '2026-01-01', 2);")
check("one row on the shipped dump", lambda: len(learner()), 1)
check("it is Bo Lund", lambda: learner()[0], ('Bo Lund',))
check("the man at the top is not in it", lambda: ('Halden Voss',) in learner(), False)
check("the other eleven have one written down", lambda: len(rows("SELECT name FROM staff WHERE dept IS NOT NULL")), 11)`),
    mini('Return every staff member with their department, printing the word unassigned where the dump wrote nothing — coalesce(dept, \'unassigned\'). Two columns named name and dept, by id. Order matters.',
      'COALESCE hands back the first thing that is not blank, so the answer reads cleanly while the table keeps its gap. The order is the table\'s own id.',
`check_cols("two columns, name then dept", ['name', 'dept'])
check_query("every staff member, blanks printed", "SELECT name, COALESCE(dept, 'unassigned') AS dept FROM staff ORDER BY id", ordered=True)
check_query("a new blank prints the same way", "SELECT name, COALESCE(dept, 'unassigned') AS dept FROM staff ORDER BY id", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', NULL, '2026-01-01', 2);")
check("twelve rows on the shipped dump", lambda: len(learner()), 12)
check("Bo Lund reads unassigned", lambda: dict(learner())['Bo Lund'], 'unassigned')
check("Halden Voss still reads board", lambda: dict(learner())['Halden Voss'], 'board')
check("nothing blank survives in the answer", lambda: all(d is not None for _, d in learner()), True)`),
  ],
})
