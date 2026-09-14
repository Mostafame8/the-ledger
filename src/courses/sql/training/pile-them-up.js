import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('pile-them-up', {
  tier: 'D', xp: 90, requires: ['table-meets-itself'], gates: ['perdept', 'heavyhitters', 'busiestdoor'],
  tools: ['tool-group'],
  title: 'Pile them up', algo: 'GROUP BY and HAVING',
  steps: [
    explain([
      '“How many swipes on each door,” the fence says, “and only the doors that see real traffic.” Dax sorts the badge log by door and starts writing tallies in the margin.',
      'He gets four numbers, two of which he has to redo, and then she asks the same question about the transfers and he reaches for the margin again.',
      '“Stop counting one pile at a time,” Marguerite says. “Say which column makes the piles and the table builds all of them at once.”',
    ], { move: 'brute force' }),
    explain([
      '“GROUP BY names the column that decides the piles: one pile for each value it holds, one row of answer for each pile. COUNT, SUM, MIN, MAX and AVG each read down a pile.”',
      '“There are two sieves. WHERE thins the rows on their way into the piles. HAVING judges the piles once they are built, so a test about a total belongs there.”',
    ], { move: 'pick the pattern', code:
`SELECT kind, COUNT(*) AS n FROM accounts GROUP BY kind;
-- ('business', 3) ('personal', 5) ('trust', 2)

SELECT kind, COUNT(*) AS n FROM accounts GROUP BY kind HAVING COUNT(*) > 2;
-- ('business', 3) ('personal', 5)` }),
    trace(
`SELECT door, COUNT(*) AS n
FROM badges
GROUP BY door
HAVING COUNT(*) > 4`,
      'the query above',
      [
        { line: 2, state: { rows: 17 }, ask: 'rows', note: 'Seventeen swipes on the bench, four different doors among them.' },
        { line: 3, state: { rows: 17, piles: 4 }, ask: 'piles', note: 'One pile per door: lobby, loading-bay, server-room, vault. Seventeen rows become four.' },
        { line: 4, state: { rows: 17, piles: 4, returns: { py: "[('lobby', 6), ('vault', 5)]" } }, ask: 'returns', note: 'The second sieve judges the piles, not the rows. Two doors clear four swipes; the quiet two are dropped whole.' },
      ]),
    spot('Dax wants the doors with more than four swipes and writes WHERE COUNT(*) > 4. SQLite answers with an error. Why?',
      ['COUNT cannot be compared with a number',
       'WHERE runs before the piles exist, so there is no count yet for it to test',
       'The query is missing an ORDER BY',
       'COUNT(*) has to be given a name before it can be tested'],
      1, 'WHERE sieves rows on their way in, one at a time, before anything has been piled up. The test belongs in HAVING, which runs on the finished piles.'),
    blank('“The kinds of account there are more than two of, with how many.”',
`SELECT kind, COUNT(*) AS n FROM accounts ___ ___ ___ COUNT(*) > 2`,
`check_cols("two columns, kind then n", ['kind', 'n'])
check_query("the kinds with more than two accounts", "SELECT kind, COUNT(*) AS n FROM accounts GROUP BY kind HAVING COUNT(*) > 2")
check_query("a third trust account joins the answer", "SELECT kind, COUNT(*) AS n FROM accounts GROUP BY kind HAVING COUNT(*) > 2",
            extra="INSERT INTO accounts VALUES (99, 'Vela Ord', 'trust', 'north', '2026-01-01');")
check("two kinds on the shipped dump", lambda: len(learner()), 2)
check("three business accounts", lambda: ('business', 3) in learner(), True)
check("every pile clears two", lambda: all(n > 2 for _, n in learner()), True)
check("the trusts did not make the cut", lambda: all(k != 'trust' for k, _ in learner()), True)`),
    mini('Return each payee who was paid more than 50,000 in all, with the total — sum(amount). Two columns named payee and total, largest total first, ties broken by the payee name. Order matters.',
      'One pile per payee, the pile added up, and the second sieve judging the totals. Two keys in the order clause settle the two payees who tie.',
`check_cols("two columns, payee then total", ['payee', 'total'])
check_query("the payees worth talking to", "SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee HAVING SUM(amount) > 50000 ORDER BY total DESC, payee", ordered=True)
check_query("one more payment promotes a name", "SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee HAVING SUM(amount) > 50000 ORDER BY total DESC, payee", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Bo Lund', 60000, '2026-03-08', NULL);")
check("four payees on the shipped dump", lambda: len(learner()), 4)
check("Halden Voss leads with 650000", lambda: learner()[0], ('Halden Voss', 650000))
check("every total clears fifty thousand", lambda: all(t > 50000 for _, t in learner()), True)
check("the tie at 120000 reads Ines Marr first", lambda: [p for p, _ in learner()][2:4], ['Ines Marr', 'Otto Kline'])`),
  ],
})
