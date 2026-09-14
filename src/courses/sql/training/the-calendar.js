import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('the-calendar', {
  tier: 'D', xp: 100, requires: ['pile-them-up'], gates: ['byday'],
  tools: ['tool-group'],
  title: 'The calendar', algo: 'Date functions',
  steps: [
    explain([
      'The fence wants the shape of a week: which days were busy, which were quiet. Dax piles the badge log up by the timestamp and gets seventeen piles of one.',
      'Every stamp carries a clock as well as a date, so no two of them are ever the same, and his answer is the log again with a 1 written beside every row.',
      '“The day is hiding at the front of the stamp,” Marguerite says. “Cut it out first, then make the piles out of what is left.”',
    ], { move: 'brute force' }),
    explain([
      '“date() trims a timestamp down to its date and time() keeps only the clock. Both hand back text, because that is how the dump stores them.”',
      '“Pile up by the same expression you put in the SELECT list, not by the raw column. And strftime() cuts any shape you like out of a stamp — %Y-%m is the month.”',
    ], { move: 'pick the pattern', code:
`SELECT date(at) AS day, time(at) AS clock FROM badges LIMIT 2;
-- ('2026-03-02', '08:55:00')
-- ('2026-03-02', '17:10:00')

SELECT strftime('%Y-%m', paid_on) AS month, COUNT(*) AS n FROM payments GROUP BY strftime('%Y-%m', paid_on);
-- ('2026-01', 3) ('2026-02', 5) ('2026-03', 4)` }),
    trace(
`SELECT date(at) AS day, COUNT(*) AS n
FROM badges
GROUP BY date(at)`,
      'the query above',
      [
        { line: 2, state: { rows: 17 }, ask: 'rows', note: 'Seventeen swipes, seventeen different timestamps.' },
        { line: 3, state: { rows: 17, piles: 5 }, ask: 'piles', note: 'Trimmed to the date, those seventeen stamps collapse onto five days.' },
        { line: 1, state: { rows: 17, piles: 5, returns: { py: "[('2026-03-02', 4), ('2026-03-03', 4), ('2026-03-04', 3), ('2026-03-05', 3), ('2026-03-06', 3)]" } }, ask: 'returns', note: 'Four, four, three, three, three — and they add back up to seventeen, which is how you know nothing fell out.' },
      ]),
    spot('Dax writes GROUP BY at instead of GROUP BY date(at) over the badge log. What does he get?',
      ['Five rows, one per day',
       'Seventeen rows with a 1 beside each, because no two timestamps match',
       'One row holding seventeen',
       'An error about grouping on a timestamp'],
      1, 'Each stamp carries its clock, so every value is unique and each row becomes its own pile. Trim to the day first and the piles have something to gather around.'),
    blank('“How often the lobby door opened on each day it opened at all, earliest day first.”',
`SELECT ___(at) AS day, COUNT(*) AS n FROM badges WHERE door = 'lobby' GROUP BY ___(at) ORDER BY day`,
`check_cols("two columns, day then n", ['day', 'n'])
check_query("the lobby, day by day", "SELECT date(at) AS day, COUNT(*) AS n FROM badges WHERE door = 'lobby' GROUP BY date(at) ORDER BY day", ordered=True)
check_query("one more lobby swipe on a new day", "SELECT date(at) AS day, COUNT(*) AS n FROM badges WHERE door = 'lobby' GROUP BY date(at) ORDER BY day", ordered=True,
            extra="INSERT INTO badges VALUES (99, 6, 'lobby', '2026-03-07 08:00', 'in');")
check("four days on the shipped dump", lambda: len(learner()), 4)
check("they add up to the six lobby swipes", lambda: sum(n for _, n in learner()), 6)
check("the fourth of March saw two", lambda: ('2026-03-04', 2) in learner(), True)
check("a day is ten characters, no clock", lambda: all(len(d) == 10 for d, _ in learner()), True)`),
    mini('Return how many payments the Ledger holds for each month: two columns named month and n, the month written as 2026-01 — strftime(\'%Y-%m\', paid_on). Earliest month first. Order matters.',
      'Cut the month out of the date, pile up by that same expression, and sort on the name you gave it. Text that starts with the year sorts into calendar order for free.',
`check_cols("two columns, month then n", ['month', 'n'])
check_query("the Ledger month by month", "SELECT strftime('%Y-%m', paid_on) AS month, COUNT(*) AS n FROM payments GROUP BY strftime('%Y-%m', paid_on) ORDER BY month", ordered=True)
check_query("a payment from the old year opens a month", "SELECT strftime('%Y-%m', paid_on) AS month, COUNT(*) AS n FROM payments GROUP BY strftime('%Y-%m', paid_on) ORDER BY month", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Bo Lund', 1000, '2025-12-31', NULL);")
check("three months on the shipped dump", lambda: len(learner()), 3)
check("they add up to every payment", lambda: sum(n for _, n in learner()), 12)
check("February was the busy one, with five", lambda: ('2026-02', 5) in learner(), True)
check("a month is seven characters", lambda: all(len(m) == 7 for m, _ in learner()), True)`),
  ],
})
