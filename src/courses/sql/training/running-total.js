import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('running-total', {
  tier: 'A', xp: 200, requires: ['two-lists'], gates: ['runningtotal'],
  tools: ['tool-group'],
  title: 'The running total', algo: 'Window aggregates',
  steps: [
    explain([
      '“Show me it building,” the fence says. “Every payment, and the total so far beside it.” Dax piles them up and hands back one number: the total of everything.',
      'She asks which month the money doubled in. The piles cannot answer that, because the rows that would have shown it were folded away.',
      '“You want both at once,” Marguerite says. “Every row keeps its own line, and every row also gets the total so far. Nothing is folded.”',
    ], { move: 'brute force' }),
    explain([
      '“GROUP BY collapses the rows it counts. OVER does not: it hands the same adding-up to each row while the row stays where it is.”',
      '“SUM(amount) OVER (ORDER BY id) means add up everything from the first row to this one, in that order. PARTITION BY starts the adding again for each new value of a column.”',
    ], { move: 'pick the pattern', code:
`SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running
FROM transfers LIMIT 3;
-- (1, 250000, 250000)
-- (2, 12000, 262000)
-- (3, 480000, 742000)

SELECT SUM(amount) AS total FROM transfers;
-- (5967500,)   one row, every other column gone` }),
    trace(
`SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running
FROM transfers
LIMIT 3`,
      'the query above',
      [
        { line: 2, state: { rows: 14 }, ask: 'rows', note: 'Fourteen transfers on the bench, and fourteen rows will come back — no folding here.' },
        { line: 1, state: { rows: 14, first_running: 250000 }, ask: 'first_running', note: 'The first row looks back at everything up to itself, which is only itself.' },
        { line: 3, state: { rows: 14, first_running: 250000, returns: { py: '[(1, 250000, 250000), (2, 12000, 262000), (3, 480000, 742000)]' } }, ask: 'returns', note: 'Each row carries its own amount and the total of everything up to it: 250000, then 262000, then 742000.' },
      ]),
    spot('Dax writes SELECT id, amount, SUM(amount) FROM transfers with no OVER and no GROUP BY. What comes back?',
      ['Fourteen rows, each with the running total',
       'One row: one id, one amount and the whole total, with the other thirteen rows gone',
       'An error, because id is not grouped',
       'Fourteen rows, each showing 5967500'],
      1, 'Adding up without OVER folds the whole table into one row, and SQLite fills the ungrouped columns from an arbitrary row. OVER is what keeps the fourteen lines on the page.'),
    blank('“Every transfer, in id order, with the money so far beside it.”',
`SELECT id, amount, SUM(amount) ___ (___ BY id) AS running FROM transfers`,
`check_cols("three columns, id then amount then running", ['id', 'amount', 'running'])
check_query("every transfer with the total so far", "SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running FROM transfers", ordered=True)
check_query("one more transfer extends the run", "SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running FROM transfers", ordered=True,
            extra="INSERT INTO transfers VALUES (99, 1, 2, 1000, '2026-03-08 09:00');")
check("fourteen rows, nothing folded", lambda: len(learner()), 14)
check("the first running total is the first amount", lambda: learner()[0], (1, 250000, 250000))
check("the last is everything added up", lambda: learner()[-1][2], 5967500)
check("the run never goes backwards", lambda: all(a[2] <= b[2] for a, b in zip(learner(), learner()[1:])), True)`),
    mini('Return every payment with that payer\'s own total so far — sum(amount) restarted for each payer, in date then id order. Three columns named payer, paid_on and running, ordered by payer then paid_on then id. Order matters.',
      'The same adding-up, but started again for each new payer. Both the restart and the order live inside the brackets after OVER.',
`check_cols("three columns, payer then paid_on then running", ['payer', 'paid_on', 'running'])
check_query("each payer's own running total", "SELECT payer, paid_on, SUM(amount) OVER (PARTITION BY payer ORDER BY paid_on, id) AS running FROM payments ORDER BY payer, paid_on, id", ordered=True)
check_query("an earlier payment shifts one payer's run", "SELECT payer, paid_on, SUM(amount) OVER (PARTITION BY payer ORDER BY paid_on, id) AS running FROM payments ORDER BY payer, paid_on, id", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Halden Voss', 'Bo Lund', 5000, '2026-01-01', NULL);")
check("twelve rows, one per payment", lambda: len(learner()), 12)
check("Grey Import Co starts at 400000", lambda: learner()[0], ('Grey Import Co', '2026-02-01', 400000))
check("and reaches 490000", lambda: learner()[1], ('Grey Import Co', '2026-02-20', 490000))
check("Halden Voss ends on 145000", lambda: [r for r in learner() if r[0] == 'Halden Voss'][-1][2], 145000)`),
  ],
})
