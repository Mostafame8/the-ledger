import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('line-them-up', {
  tier: 'F', xp: 50, requires: ['narrow-it-down'], gates: ['bigmoves'],
  tools: ['tool-order'],
  title: 'Line them up', algo: 'ORDER BY and LIMIT',
  steps: [
    explain([
      '“The three smallest moves,” the fence says, “the ones nobody would look at twice.” Dax reads the amounts down the page, holds three numbers in his head, and swaps one out every time something smaller turns up.',
      'By the bottom of the page he has two of the three right and no idea which two.',
      '“Say the order out loud and take from the top,” Marguerite says. “The table will hold all fourteen in its head. You will not.”',
    ], { move: 'brute force' }),
    explain([
      '“A table keeps no order of its own. Without ORDER BY, whatever came back came back by accident and can come back differently tomorrow.”',
      '“ORDER BY names the column to sort on, DESC turns it upside down, and LIMIT takes from the top of whatever order you asked for. Ask for the order first, or you are taking from an accident.”',
    ], { move: 'pick the pattern', code:
`SELECT name, hired FROM staff ORDER BY hired DESC LIMIT 2;
-- ('Ana Petrov', '2023-08-08')
-- ('Bo Lund', '2022-04-04')

SELECT id, amount FROM transfers ORDER BY amount LIMIT 2;
-- (9, 4500)
-- (14, 8000)` }),
    trace(
`SELECT id, amount
FROM transfers
ORDER BY amount
LIMIT 3`,
      'the query above',
      [
        { line: 2, state: { rows: 14 }, ask: 'rows', note: 'Fourteen transfers on the bench, in whatever order the table holds them.' },
        { line: 3, state: { rows: 14, smallest: { py: '(9, 4500)' } }, ask: 'smallest', note: 'ORDER BY sorts all fourteen. Nothing has been dropped yet — the smallest is simply on top now.' },
        { line: 4, state: { rows: 14, smallest: { py: '(9, 4500)' }, returns: { py: '[(9, 4500), (14, 8000), (4, 9000)]' } }, ask: 'returns', note: 'LIMIT takes three off the top of the order you asked for.' },
      ]),
    spot('Dax writes SELECT id, amount FROM transfers LIMIT 3 and calls it the three smallest. What has he actually got?',
      ['The three smallest, since tables keep their rows sorted',
       'Three rows the table happened to hand over first, which may change tomorrow',
       'An error, because LIMIT needs ORDER BY',
       'The three largest'],
      1, 'LIMIT takes from whatever order it is given, and without ORDER BY that order is nobody\'s promise. It can change when rows are inserted, deleted, or the file is rebuilt.'),
    blank('“The two oldest hires in the building: the name, and the day they started.”',
`SELECT name, hired FROM staff ORDER BY ___ ___ 2`,
`check_cols("two columns, name then hired", ['name', 'hired'])
check_query("the two longest-serving", "SELECT name, hired FROM staff ORDER BY hired LIMIT 2", ordered=True)
check_query("an older hand turns up in the files", "SELECT name, hired FROM staff ORDER BY hired LIMIT 2", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', 'board', '1999-01-01', NULL);")
check("exactly two rows", lambda: len(learner()), 2)
check("Halden Voss started first", lambda: learner()[0], ('Halden Voss', '2001-03-01'))
check("oldest first", lambda: [h for _, h in learner()] == sorted(h for _, h in learner()), True)
check("the newest hire is nowhere near this", lambda: ('Ana Petrov', '2023-08-08') in learner(), False)`),
    mini('Return the three most recent badge swipes as two columns named door and clock, where clock is the time of day pulled out of the timestamp with time(at). Most recent first. Order matters.',
      'The timestamps sort as text because the year is written first. Sort on the whole stamp, take three, and cut the clock out only in the answer.',
`check_cols("two columns, door then clock", ['door', 'clock'])
check_query("the last three swipes of the log", "SELECT door, time(at) AS clock FROM badges ORDER BY at DESC LIMIT 3", ordered=True)
check_query("a later swipe pushes the rest down", "SELECT door, time(at) AS clock FROM badges ORDER BY at DESC LIMIT 3", ordered=True,
            extra="INSERT INTO badges VALUES (99, 2, 'roof', '2026-03-09 11:11', 'in');")
check("exactly three rows", lambda: len(learner()), 3)
check("the lobby at half six is the latest", lambda: learner()[0], ('lobby', '18:30:00'))
check("the vault swipe sits in the middle", lambda: learner()[1][0], 'vault')
check("every clock carries its seconds", lambda: all(len(c) == 8 for _, c in learner()), True)`),
  ],
})
