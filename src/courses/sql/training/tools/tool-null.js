import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-null', {
  xp: 30, title: 'The blank cell', algo: 'NULL',
  steps: [
    explain([
      'One cell in the staff sheet is empty. Dax types the word none into it and moves on, and now the dump disagrees with the bank.',
      '“A blank is not an empty word and not a zero,” Marguerite says. “It is NULL, and NULL means nobody wrote it down.”',
      '“So dept = NULL is never true, and dept <> NULL is never true either. Ask IS NULL or IS NOT NULL, which are the only two questions it answers.”',
    ], { code:
`SELECT name, dept FROM staff WHERE dept IS NULL;
-- ('Bo Lund', None)

SELECT COUNT(*) AS rows_all, COUNT(dept) AS with_dept FROM staff;
-- (12, 11)` }),
    explain([
      '“COALESCE(dept, \'none\') hands back the first thing that is not blank, so it is how you print a blank without lying about the table.”',
      '“COUNT(column), SUM and AVG all walk past blanks. That is why the two counts above differ by one: twelve rows, eleven departments.”',
      '“A blank in the middle of arithmetic poisons the lot: amount + NULL is NULL, not amount.”',
    ]),
    trace(
`SELECT name, COALESCE(dept, 'none') AS dept
FROM staff
WHERE dept IS NULL`,
      'the query above',
      [
        { line: 2, state: { rows: 12 }, ask: 'rows', note: 'Twelve staff rows go onto the bench.' },
        { line: 3, state: { rows: 12, kept: 1 }, ask: 'kept', note: 'Exactly one row has nothing written in dept, and only IS NULL can find it.' },
        { line: 1, state: { rows: 12, kept: 1, returns: { py: "[('Bo Lund', 'none')]" } }, ask: 'returns', note: 'COALESCE swaps the blank for something printable in the answer only. The table still holds a blank.' },
      ]),
    blank('“Everyone who has a manager, with their department printed as none when the dump never wrote one down. By id.”',
`SELECT name, ___(dept, 'none') AS dept FROM staff WHERE manager_id ___ NULL ORDER BY id`,
`check_cols("two columns, name then dept", ['name', 'dept'])
check_query("everyone with a manager, blanks printed", "SELECT name, COALESCE(dept, 'none') AS dept FROM staff WHERE manager_id IS NOT NULL ORDER BY id", ordered=True)
check("eleven rows", lambda: len(learner()), 11)
check("Bo Lund's department reads none", lambda: dict(learner())['Bo Lund'], 'none')
check("no blanks left in the answer", lambda: all(d is not None for _, d in learner()), True)
check("the one with no manager is not here", lambda: all(n != 'Halden Voss' for n, _ in learner()), True)`),
  ],
})
