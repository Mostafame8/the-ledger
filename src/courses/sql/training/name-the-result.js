import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('name-the-result', {
  tier: 'C', xp: 140, requires: ['who-is-missing'], gates: ['thebooks'],
  tools: ['tool-select'],
  title: 'Name the result first', algo: 'Common table expressions',
  steps: [
    explain([
      'The fence wants the payees worth talking to, ranked, banded and totalled. Dax writes one statement with the same GROUP BY buried in it three times, in brackets, inside brackets.',
      'It runs. Nobody can read it, least of all Dax an hour later, and when the bands change he edits two of the three copies.',
      '“Work out the piece you need, give it a name, and write the answer in terms of that name,” Marguerite says. “Name the result first and the rest reads like a sentence.”',
    ], { move: 'brute force' }),
    explain([
      '“WITH sits in front of the statement: WITH totals AS (…), and after the bracket, totals is a table you can select from, join to, or use twice.”',
      '“It lives only for that one statement. Nothing is stored, nothing is left behind, and the name says what the rows are rather than how they were made.”',
    ], { move: 'pick the pattern', code:
`WITH totals AS (
  SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee
)
SELECT payee, total FROM totals WHERE total > 100000;
-- ('Halden Voss', 650000)
-- ('Ines Marr', 120000)
-- ('Otto Kline', 120000)
-- ('Tomas Reed', 150000)` }),
    trace(
`WITH totals AS (
  SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee
)
SELECT payee, total
FROM totals
WHERE total > 100000`,
      'the query above',
      [
        { line: 2, state: { rows: 12 }, ask: 'rows', note: 'The named piece runs over all twelve payments.' },
        { line: 2, state: { rows: 12, piles: 7 }, ask: 'piles', note: 'One pile per payee: seven names, each with a total beside it. That is what totals holds.' },
        { line: 6, state: { rows: 12, piles: 7, kept: 4 }, ask: 'kept', note: 'The outer statement treats totals as an ordinary table and sieves it. Four payees clear a hundred thousand.' },
      ]),
    spot('Why write WITH totals AS (…) instead of repeating the same bracketed SELECT in three places?',
      ['It runs faster in every case',
       'The name is written once, so a change lands once, and the outer statement reads as what it means',
       'A bracketed SELECT cannot be used more than once',
       'It stores the result for the next query'],
      1, 'The win is that one name replaces three copies: edit the piece once, read the outer statement as a sentence. Nothing is stored past the statement, and the planner may or may not make it quicker.'),
    blank('“Name the big transfers, then count them.”',
`___ big AS (SELECT id, amount FROM transfers WHERE amount > 100000) SELECT COUNT(*) AS n FROM ___`,
`check_cols("one column named n", ['n'])
check_query("how many big transfers", "WITH big AS (SELECT id, amount FROM transfers WHERE amount > 100000) SELECT COUNT(*) AS n FROM big")
check_query("one more big transfer", "WITH big AS (SELECT id, amount FROM transfers WHERE amount > 100000) SELECT COUNT(*) AS n FROM big",
            extra="INSERT INTO transfers VALUES (99, 5, 1, 150000, '2026-03-08 09:00');")
check("one row", lambda: len(learner()), 1)
check("five on the shipped dump", lambda: learner()[0][0], 5)
check("it is a number", lambda: type(learner()[0][0]).__name__, 'int')
check("fewer than the fourteen transfers", lambda: learner()[0][0] < 14, True)`),
    mini('Name the payee totals first — sum(amount) per payee — then return the two biggest: two columns named payee and total, largest first, ties broken by the payee name. Order matters.',
      'One named piece holding a name and a total, then an ordinary SELECT over that name with an order and a limit. The second key settles any tie.',
`check_cols("two columns, payee then total", ['payee', 'total'])
check_query("the top two payees", "WITH totals AS (SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee) SELECT payee, total FROM totals ORDER BY total DESC, payee LIMIT 2", ordered=True)
check_query("one huge payment takes first place", "WITH totals AS (SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee) SELECT payee, total FROM totals ORDER BY total DESC, payee LIMIT 2", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Bo Lund', 900000, '2026-03-08', NULL);")
check("exactly two rows", lambda: len(learner()), 2)
check("Halden Voss on 650000 leads", lambda: learner()[0], ('Halden Voss', 650000))
check("Tomas Reed on 150000 is second", lambda: learner()[1], ('Tomas Reed', 150000))
check("biggest first", lambda: learner()[0][1] >= learner()[1][1], True)`),
  ],
})
