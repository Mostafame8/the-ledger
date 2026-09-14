import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('question-inside', {
  tier: 'C', xp: 120, requires: ['pile-them-up'], gates: ['abovemean'],
  tools: ['tool-where'],
  title: 'A question inside a question', algo: 'Subqueries',
  steps: [
    explain([
      '“Anything bigger than normal,” the fence says. Dax works the average out on his phone, writes 426250 on a sticky note, and starts reading down the amounts.',
      'Two transfers land that afternoon. The number on the note is now wrong, the list he handed her is wrong, and neither of them knows it.',
      '“A number you worked out yourself goes stale,” Marguerite says. “Ask for it in the same breath as the rows and it is never stale again.”',
    ], { move: 'brute force' }),
    explain([
      '“A SELECT that hands back exactly one row and one column can stand anywhere a number can stand — inside a WHERE, inside the SELECT list, either side of a comparison.”',
      '“The brackets are not decoration; they are what makes it one value instead of a second query. And it is worked out against the same tables, at the same moment, every time the statement runs.”',
    ], { move: 'pick the pattern', code:
`SELECT AVG(amount) FROM transfers;
-- (426250.0,)

SELECT id, amount FROM transfers WHERE amount > (SELECT AVG(amount) FROM transfers);
-- (3, 480000)
-- (5, 1500000)
-- (13, 3200000)` }),
    trace(
`SELECT id, amount
FROM transfers
WHERE amount > (SELECT AVG(amount) FROM transfers)`,
      'the query above',
      [
        { line: 3, state: { average: 426250.0 }, ask: 'average', note: 'The bracketed question runs first and once: fourteen amounts adding to 5,967,500, divided by fourteen.' },
        { line: 2, state: { average: 426250.0, rows: 14 }, ask: 'rows', note: 'Then the outer query puts all fourteen transfers on the bench and compares each one with that single number.' },
        { line: 1, state: { average: 426250.0, rows: 14, returns: { py: '[(3, 480000), (5, 1500000), (13, 3200000)]' } }, ask: 'returns', note: 'Three clear the average. Add a transfer tomorrow and the average moves with it, which is the whole point.' },
      ]),
    spot('Dax writes WHERE amount > (SELECT amount FROM transfers WHERE from_acct = 1). Account 1 sent three transfers. What happens?',
      ['It compares against the first of the three',
       'SQLite errors, because a single value was expected and three rows arrived',
       'It compares against all three at once and keeps rows that beat any of them',
       'It quietly returns no rows'],
      1, 'Standing where a number stands means handing back one row and one column. Three rows is a list, and a list needs IN, or ALL, or a bracket that returns a single value — MAX, say.'),
    blank('“Who sent the single biggest transfer in the dump? Just the holder.”',
`SELECT holder FROM accounts WHERE id = (SELECT ___ FROM transfers ORDER BY amount DESC LIMIT 1)`,
`check_cols("one column named holder", ['holder'])
check_query("the account behind the biggest move", "SELECT holder FROM accounts WHERE id = (SELECT from_acct FROM transfers ORDER BY amount DESC LIMIT 1)")
check_query("a bigger move changes the answer", "SELECT holder FROM accounts WHERE id = (SELECT from_acct FROM transfers ORDER BY amount DESC LIMIT 1)",
            extra="INSERT INTO transfers VALUES (99, 5, 1, 9000000, '2026-03-08 09:00');")
check("exactly one holder", lambda: len(learner()), 1)
check("Corvin Holdings sent it", lambda: learner()[0], ('Corvin Holdings',))
check("not the account it landed in", lambda: ('Sable Trust',) in learner(), False)
check("one column, one row", lambda: len(learner()[0]), 1)`),
    mini('Return every payment bigger than the average payment — avg(amount). Two columns named id and amount, largest first. Order matters.',
      'Work the average out where the comparison happens, not before it. The bracketed question reads the same table the outer one does.',
`check_cols("two columns, id then amount", ['id', 'amount'])
check_query("the payments above the average", "SELECT id, amount FROM payments WHERE amount > (SELECT AVG(amount) FROM payments) ORDER BY amount DESC", ordered=True)
check_query("a huge payment drags the average up", "SELECT id, amount FROM payments WHERE amount > (SELECT AVG(amount) FROM payments) ORDER BY amount DESC", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Bo Lund', 900000, '2026-03-08', NULL);")
check("three payments on the shipped dump", lambda: len(learner()), 3)
check("the consultancy fee leads", lambda: learner()[0], (4, 400000))
check("largest first", lambda: [a for _, a in learner()] == sorted([a for _, a in learner()], reverse=True), True)
check("nothing at or below the average", lambda: min(a for _, a in learner()) > 91916, True)`),
  ],
})
