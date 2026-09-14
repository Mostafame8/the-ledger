import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('pick-columns', {
  tier: 'F', xp: 40, requires: [], gates: ['pullnames'],
  tools: ['tool-table', 'tool-select'],
  title: 'Pick the columns', algo: 'SELECT and aliases',
  steps: [
    explain([
      'The fence wants two things out of the Ledger: who was paid, and how much in pounds. Dax exports the whole payments table, all six columns, and starts deleting the four she did not ask for.',
      'Halfway down he deletes a column she did want, undoes it twice, and hands her a sheet with a header that says amount when the numbers under it are pence.',
      '“She reads column names,” Marguerite says. “Ask for the columns she asked for, in the order she asked for them, under the names she uses.”',
    ], { move: 'brute force' }),
    explain([
      '“The list after SELECT is the shape of the answer. Each thing in it can be a column, or a piece of arithmetic, and each one can be given a name with AS.”',
      '“Amounts are pence, so amount / 100 is pounds. Two whole numbers divide to a whole number here, and the pennies are gone.”',
    ], { move: 'pick the pattern', code:
`SELECT payee, amount FROM payments LIMIT 2;
-- ('Otto Kline', 50000)
-- ('Ruth Ash', 30000)

SELECT payee, amount / 100 AS pounds FROM payments LIMIT 2;
-- ('Otto Kline', 500)
-- ('Ruth Ash', 300)` }),
    trace(
`SELECT payee, amount / 100 AS pounds
FROM payments
LIMIT 3`,
      'the query above',
      [
        { line: 2, state: { rows: 12 }, ask: 'rows', note: 'FROM puts every payment on the bench. Twelve rows, six columns each.' },
        { line: 1, state: { rows: 12, cols: ['payee', 'pounds'] }, ask: 'cols', note: 'The answer keeps two things: a column as it stands, and a piece of arithmetic with a name of its own.' },
        { line: 3, state: { rows: 12, cols: ['payee', 'pounds'], returns: { py: "[('Otto Kline', 500), ('Ruth Ash', 300), ('Otto Kline', 200)]" } }, ask: 'returns', note: 'LIMIT keeps the first three rows as stored. 50000 pence reads back as 500.' },
      ]),
    spot('The fence asked for the payee and the amount in pounds. Dax sends her SELECT * FROM payments. What lands on her desk?',
      ['Two columns, the money already in pounds',
       'Every column, the money still in pence, and four more columns she has to read past',
       'An error, because * is not a column name',
       'The payee column only'],
      1, 'A star means every column of the table, in the table\'s own order, under the table\'s own names. It is a way to look at a table, not a way to answer a question.'),
    blank('“Every account holder and the branch they bank at — but she calls a branch a zone.”',
`SELECT holder, branch ___ zone FROM accounts`,
`check_cols("two columns, holder then zone", ['holder', 'zone'])
check_query("every holder and their branch", "SELECT holder, branch AS zone FROM accounts")
check_query("a new account arrives", "SELECT holder, branch AS zone FROM accounts",
            extra="INSERT INTO accounts VALUES (99, 'Vela Ord', 'personal', 'east', '2026-01-01');")
check("ten rows on the shipped dump", lambda: len(learner()), 10)
check("the first is Corvin Holdings in the north", lambda: learner()[0], ('Corvin Holdings', 'north'))
check("the second column answers to zone", lambda: learner_cols()[1], 'zone')
check("no blank branches", lambda: all(z for _, z in learner()), True)`),
    mini('Return every payment three ways over: the payee, the payee in capitals as loud with upper(payee), and the amount in whole pounds. Three columns named payee, loud and pounds, any order.',
      'Three things in the SELECT list, comma between, each with a name of its own. Whole numbers divide to whole numbers, which is what she wants.',
`check_cols("three columns, payee then loud then pounds", ['payee', 'loud', 'pounds'])
check_query("every payment, named and converted", "SELECT payee, upper(payee) AS loud, amount / 100 AS pounds FROM payments")
check_query("a new payment joins", "SELECT payee, upper(payee) AS loud, amount / 100 AS pounds FROM payments",
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Vela Ord', 250000, '2026-03-08', NULL);")
check("twelve rows on the shipped dump", lambda: len(learner()), 12)
check("Otto Kline's fifty thousand reads as five hundred", lambda: ('Otto Kline', 'OTTO KLINE', 500) in learner(), True)
check("every loud name shouts", lambda: all(l == l.upper() for _, l, _ in learner()), True)
check("the pennies are gone", lambda: all(isinstance(p, int) for _, _, p in learner()), True)`),
  ],
})
