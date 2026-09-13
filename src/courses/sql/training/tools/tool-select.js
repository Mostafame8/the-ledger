import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-select', {
  xp: 30, title: 'Just these columns', algo: 'SELECT',
  steps: [
    explain([
      'Dax pastes a whole table into a new sheet because he needs two of its columns. Then he deletes the other three by hand, and deletes one he needed.',
      '“Name the columns you want, in the order you want them,” Marguerite says. “AS renames one for the answer. You can do arithmetic on the way out.”',
      '“The fence reads column names. Give her the ones she asked for and nothing else.”',
    ], { code:
`SELECT holder, kind FROM accounts LIMIT 2;
-- ('Corvin Holdings', 'business')
-- ('Delia Marsh', 'personal')

SELECT payee AS who, amount / 100 AS pounds FROM payments LIMIT 2;
-- ('Otto Kline', 500)
-- ('Ruth Ash', 300)` }),
    explain([
      '“DISTINCT sits after SELECT and drops repeated rows from the answer. It looks at every column you asked for, not just the first.”',
      '“SELECT * is a peek, not an answer. An answer is checked by column name, so name them.”',
      '“Amounts are pence, so amount / 100 is whole pounds, and whole means whole: two integers divide to an integer and the pennies are gone.”',
    ]),
    trace(
`SELECT holder AS who, kind
FROM accounts
LIMIT 2`,
      'the query above',
      [
        { line: 2, state: { rows: 10 }, ask: 'rows', note: 'FROM puts all ten account rows on the bench. Nothing has been thrown away yet.' },
        { line: 1, state: { rows: 10, cols: ['who', 'kind'] }, ask: 'cols', note: 'Two columns survive, and AS renames the first one in the answer only. The table still calls it holder.' },
        { line: 3, state: { rows: 10, cols: ['who', 'kind'], returns: { py: "[('Corvin Holdings', 'business'), ('Delia Marsh', 'personal')]" } }, ask: 'returns', note: 'LIMIT takes the first two rows as stored.' },
      ]),
    blank('“Every branch in the accounts table, once each, under the name zone.”',
`SELECT ___ branch ___ zone FROM accounts`,
`check_cols("one column named zone", ['zone'])
check_query("every branch, once each", "SELECT DISTINCT branch AS zone FROM accounts")
check("three branches", lambda: len(learner()), 3)
check("no repeats", lambda: len(learner()) == len(set(learner())), True)
check("the harbour is one of them", lambda: ('harbour',) in learner(), True)
check("one column, not five", lambda: len(learner()[0]), 1)`),
  ],
})
