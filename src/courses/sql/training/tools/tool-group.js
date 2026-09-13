import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-group', {
  xp: 30, title: 'The tally', algo: 'GROUP BY',
  steps: [
    explain([
      'Dax wants a count per kind of account, so he sorts the sheet by kind and starts writing numbers on the back of a receipt.',
      '“GROUP BY makes piles,” Marguerite says. “One pile per value in the column you name, and one row of answer per pile.”',
      '“COUNT(*) is how tall the pile is. SUM, AVG, MIN and MAX read a column down the pile. Name each one with AS, or the fence gets a column called COUNT(*).”',
    ], { code:
`SELECT kind, COUNT(*) AS n FROM accounts GROUP BY kind;
-- ('business', 3)
-- ('personal', 5)
-- ('trust', 2)` }),
    explain([
      '“Anything you SELECT is either the column you grouped by or something read down the pile. Ask for a fourth column and SQLite hands you one row out of that pile, chosen by nobody.”',
      '“WHERE runs before the piles are built, so it thins the rows going in. There is a second sieve for the piles themselves, and it is called HAVING.”',
      '“COUNT(*) counts rows. COUNT(column) counts the rows where that column is not blank. The gap between the two is the interesting part.”',
    ]),
    trace(
`SELECT kind, COUNT(*) AS n
FROM accounts
GROUP BY kind`,
      'the query above',
      [
        { line: 2, state: { rows: 10 }, ask: 'rows', note: 'Ten account rows on the bench.' },
        { line: 3, state: { rows: 10, piles: 3 }, ask: 'piles', note: 'Three distinct kinds in that column, so three piles: business, personal, trust.' },
        { line: 1, state: { rows: 10, piles: 3, returns: { py: "[('business', 3), ('personal', 5), ('trust', 2)]" } }, ask: 'returns', note: 'One row per pile: the value you grouped by, then how tall the pile is.' },
      ]),
    blank('“Per payer: everything they paid in total, and their biggest single payment.”',
`SELECT payer, ___(amount) AS total, ___(amount) AS biggest FROM payments ___ payer`,
`check_cols("three columns, payer then total then biggest", ['payer', 'total', 'biggest'])
check_query("what each payer paid", "SELECT payer, SUM(amount) AS total, MAX(amount) AS biggest FROM payments GROUP BY payer")
check("six payers", lambda: len(learner()), 6)
check("Grey Import Co paid 490000 in all", lambda: {p: t for p, t, _ in learner()}['Grey Import Co'], 490000)
check("nobody's biggest beats their total", lambda: all(b <= t for _, t, b in learner()), True)
check("three columns", lambda: len(learner()[0]), 3)`),
  ],
})
