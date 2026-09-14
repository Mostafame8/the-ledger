import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('side-by-side', {
  tier: 'E', xp: 60, requires: ['nothing-is-a-value'], gates: ['badgeowners'],
  tools: ['tool-table'],
  title: 'Side by side', algo: 'INNER JOIN',
  steps: [
    explain([
      'The badge log says staff id 5 opened the server room at a quarter past eleven at night. The fence does not know who staff id 5 is and has no intention of learning.',
      'Dax opens both tables on the same screen, one above the other, and types names into the badge rows by hand. Eleven rows in he types the wrong one and does not notice for twenty minutes.',
      '“The badge already carries the id and the staff table is kept by that id,” Marguerite says. “Say that once and every name arrives at the same time.”',
    ], { move: 'brute force' }),
    explain([
      '“JOIN puts a second table beside the first and ON says which value has to match. Each row of the left finds the rows of the right that agree with it.”',
      '“Give each table a short alias so you can say which id you mean, because both tables have one. A row whose id matches nobody simply drops out — that is what makes this join the inner one.”',
    ], { move: 'pick the pattern', code:
`SELECT s.name, b.door, b.at
FROM badges b
JOIN staff s ON s.id = b.staff_id
LIMIT 2;
-- ('Ines Marr', 'vault', '2026-03-02 08:55')
-- ('Ines Marr', 'vault', '2026-03-02 17:10')` }),
    trace(
`SELECT s.name, b.door
FROM badges b
JOIN staff s ON s.id = b.staff_id
WHERE b.door = 'vault'`,
      'the query above',
      [
        { line: 2, state: { rows: 17 }, ask: 'rows', note: 'Seventeen swipes on the bench. No names on any of them yet.' },
        { line: 3, state: { rows: 17, paired: 17 }, ask: 'paired', note: 'Each swipe finds exactly one staff row with the matching id, so the count does not move. It gains columns, not rows.' },
        { line: 4, state: { rows: 17, paired: 17, returns: { py: "[('Ines Marr', 'vault'), ('Ines Marr', 'vault'), ('Priya Nand', 'vault'), ('Kit Ferro', 'vault'), ('Priya Nand', 'vault')]" } }, ask: 'returns', note: 'Five vault swipes survive the sieve, each one now carrying the name of whoever carried the badge.' },
      ]),
    spot('Dax writes FROM badges b JOIN staff s and forgets the ON. What does he get back?',
      ['The same seventeen rows, unnamed',
       'Every swipe paired with every staff member — 204 rows of nonsense',
       'An error; SQLite refuses a join with no ON',
       'Seventeen rows with the wrong names attached'],
      1, 'With nothing to match on, every row of one table is put beside every row of the other: 17 × 12. The ON is what turns that pile into an answer.'),
    blank('“The transfers over a million, with the name of the account that sent them.”',
`SELECT a.holder, t.amount FROM transfers t ___ accounts a ___ a.id = t.from_acct WHERE t.amount > 1000000`,
`check_cols("two columns, holder then amount", ['holder', 'amount'])
check_query("the two biggest moves and who sent them", "SELECT a.holder, t.amount FROM transfers t JOIN accounts a ON a.id = t.from_acct WHERE t.amount > 1000000")
check_query("a third giant joins them", "SELECT a.holder, t.amount FROM transfers t JOIN accounts a ON a.id = t.from_acct WHERE t.amount > 1000000",
            extra="INSERT INTO transfers VALUES (99, 5, 1, 2000000, '2026-03-08 09:00');")
check("two rows on the shipped dump", lambda: len(learner()), 2)
check("Sable Trust sent one and a half million", lambda: ('Sable Trust', 1500000) in learner(), True)
check("both clear the million", lambda: all(a > 1000000 for _, a in learner()), True)
check("names, not account numbers", lambda: all(isinstance(h, str) for h, _ in learner()), True)`),
    mini('Return every badge swipe with the name of whoever carried the badge: three columns named name, door and clock, where clock is time(at). Any order.',
      'One join on the staff id, and the clock cut out of the timestamp in the SELECT list. A swipe whose id belongs to nobody is not your problem — this join drops it.',
`check_cols("three columns, name then door then clock", ['name', 'door', 'clock'])
check_query("every swipe with its owner", "SELECT s.name, b.door, time(b.at) AS clock FROM badges b JOIN staff s ON s.id = b.staff_id")
check_query("a swipe by nobody is dropped", "SELECT s.name, b.door, time(b.at) AS clock FROM badges b JOIN staff s ON s.id = b.staff_id",
            extra="INSERT INTO badges VALUES (99, 77, 'roof', '2026-03-08 09:00', 'in');")
check("seventeen rows on the shipped dump", lambda: len(learner()), 17)
check("Ines Marr at the vault at five to nine", lambda: ('Ines Marr', 'vault', '08:55:00') in learner(), True)
check("Tomas Reed on the lobby door at half seven", lambda: ('Tomas Reed', 'lobby', '07:30:00') in learner(), True)
check("names all the way down", lambda: all(isinstance(n, str) for n, _, _ in learner()), True)`),
  ],
})
