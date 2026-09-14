import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('two-lists', {
  tier: 'B', xp: 180, requires: ['sort-into-bands'], gates: ['twolists'],
  tools: ['tool-order'],
  title: 'Two lists, one answer', algo: 'UNION, EXCEPT, INTERSECT',
  steps: [
    explain([
      'The Ledger has two columns of names: who paid, and who was paid. The fence wants one list — and then the names on one side that never appear on the other.',
      'Dax copies both columns into a third, sorts it, and spends ten minutes deleting the duplicates by eye. He deletes one he needed and keeps two he did not.',
      '“Stack one list on the other and say which of the three questions you are asking,” Marguerite says. “All of them, only the overlap, or the part that is missing.”',
    ], { move: 'brute force' }),
    explain([
      '“Two SELECTs with the same number of columns can be stacked. UNION keeps each row once, UNION ALL keeps the repeats, INTERSECT keeps only what is in both, EXCEPT keeps the first list minus the second.”',
      '“The answer takes its column names from the first SELECT, and the order of the two sides matters for EXCEPT: payers minus payees is a different question from payees minus payers.”',
    ], { move: 'pick the pattern', code:
`SELECT payer AS name FROM payments
UNION
SELECT payee FROM payments;
-- ten names, each once

SELECT payer AS name FROM payments
EXCEPT
SELECT payee FROM payments;
-- ('Grey Import Co',) ('Roan Textiles',) ('Sable Trust',)` }),
    trace(
`SELECT payer AS name FROM payments
EXCEPT
SELECT payee FROM payments`,
      'the query above',
      [
        { line: 1, state: { payers: 6 }, ask: 'payers', note: 'Six different names pay into the Ledger: two firms, a trust, and three of the staff.' },
        { line: 3, state: { payers: 6, payees: 7 }, ask: 'payees', note: 'Seven different names are paid. The two lists overlap, which is what makes the question interesting.' },
        { line: 2, state: { payers: 6, payees: 7, returns: { py: "[('Grey Import Co',), ('Roan Textiles',), ('Sable Trust',)]" } }, ask: 'returns', note: 'EXCEPT keeps the payers who were never paid — money going one way only, which is what she was looking for.' },
      ]),
    spot('Dax wants every name the Ledger touches and writes UNION ALL instead of UNION. What comes back?',
      ['The same ten names',
       'Twenty-four rows — every payer and every payee, repeats and all',
       'Only the names that appear on both sides',
       'An error about mismatched columns'],
      1, 'UNION ALL stacks the two lists without collapsing anything: twelve payers and twelve payees, one row per payment on each side. UNION is the one that keeps each name once.'),
    blank('“Which of the names being paid out of the Ledger are on Halden\'s own staff list?”',
`SELECT payee AS name FROM payments ___ SELECT name FROM staff`,
`check_cols("one column named name", ['name'])
check_query("the payees who are also staff", "SELECT payee AS name FROM payments INTERSECT SELECT name FROM staff")
check_query("a payment to a new staff member", "SELECT payee AS name FROM payments INTERSECT SELECT name FROM staff",
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Priya Nand', 5000, '2026-03-08', NULL);")
check("seven names on the shipped dump", lambda: len(learner()), 7)
check("Otto Kline is on both lists", lambda: ('Otto Kline',) in learner(), True)
check("the importer is not staff", lambda: ('Grey Import Co',) in learner(), False)
check("no repeats", lambda: len(learner()) == len(set(learner())), True)`),
    mini('Return the names that appear both in the Ledger as a payee and on the staff list, compared and returned in lower case with lower(payee). One column named name, alphabetical. Order matters.',
      'Fold both sides down before they meet, so a name typed in capitals on one side still finds its match on the other. Only the overlap survives.',
`check_cols("one column named name", ['name'])
check_query("the overlap, in lower case", "SELECT lower(payee) AS name FROM payments INTERSECT SELECT lower(name) FROM staff", ordered=True)
check_query("a payee typed in capitals still matches", "SELECT lower(payee) AS name FROM payments INTERSECT SELECT lower(name) FROM staff", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'PRIYA NAND', 5000, '2026-03-08', NULL);")
check("seven names on the shipped dump", lambda: len(learner()), 7)
check("ana petrov comes first", lambda: learner()[0], ('ana petrov',))
check("every name is lower case", lambda: all(n == n.lower() for (n,) in learner()), True)
check("alphabetical", lambda: [n for (n,) in learner()] == sorted(n for (n,) in learner()), True)`),
  ],
})
