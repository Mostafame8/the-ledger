import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('who-is-missing', {
  tier: 'C', xp: 130, requires: ['question-inside'], gates: ['neverswiped'],
  tools: ['tool-where'],
  title: 'Who is missing', algo: 'NOT EXISTS',
  steps: [
    explain([
      '“Which of them never goes near the vault,” the fence says. Dax reads the badge log top to bottom, writing down everyone he sees, and hands over the list he built.',
      'That list is the people who did go. The ones she asked about left no trace at all, which is exactly why they are not in his notes.',
      '“An absence is not something you read off a log,” Marguerite says. “You stand on a person and ask the log a yes-or-no question about them.”',
    ], { move: 'brute force' }),
    explain([
      '“EXISTS asks whether the bracketed question finds anything at all. It never collects the rows, so what the inner SELECT lists does not matter — 1 is the polite thing to put there.”',
      '“Tie the inner question to the row you are standing on: b.staff_id = s.id. Put NOT in front and you keep the people the log has nothing to say about.”',
    ], { move: 'pick the pattern', code:
`SELECT name FROM staff s
WHERE EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id);
-- the ten who swiped something

SELECT name FROM staff s
WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id);
-- ('Halden Voss',) ('Bo Lund',)` }),
    trace(
`SELECT name
FROM staff s
WHERE NOT EXISTS (
  SELECT 1 FROM badges b
  WHERE b.staff_id = s.id AND b.door = 'vault')`,
      'the query above',
      [
        { line: 2, state: { rows: 12 }, ask: 'rows', note: 'Twelve staff rows on the bench. The question will be asked once for each of them.' },
        { line: 4, state: { rows: 12, vault_swipers: 3 }, ask: 'vault_swipers', note: 'Three people appear on a vault swipe: Ines Marr, Priya Nand and Kit Ferro. For those three the inner question finds something.' },
        { line: 1, state: { rows: 12, vault_swipers: 3, kept: 9 }, ask: 'kept', note: 'NOT flips it: the nine the vault log has nothing to say about are the answer.' },
      ]),
    spot('Dax rewrites it as WHERE s.id NOT IN (SELECT staff_id FROM badges). Suppose one badge row had no staff id written down. What happens?',
      ['The same nine names come back',
       'No rows at all, because a comparison against the unknown staff id is never true',
       'SQLite raises an error about the blank',
       'The blank row is skipped and everything else works'],
      1, 'NOT IN against a list holding a blank can never say yes: every comparison lands on unknown, so nothing gets through. NOT EXISTS asks a yes-or-no question instead and is immune.'),
    blank('“The accounts that never sent a penny anywhere. Just the holder.”',
`SELECT holder FROM accounts a WHERE ___ ___ (SELECT 1 FROM transfers t WHERE t.from_acct = a.id)`,
`check_cols("one column named holder", ['holder'])
check_query("the accounts that never sent", "SELECT holder FROM accounts a WHERE NOT EXISTS (SELECT 1 FROM transfers t WHERE t.from_acct = a.id)")
check_query("one transfer out and an account drops off", "SELECT holder FROM accounts a WHERE NOT EXISTS (SELECT 1 FROM transfers t WHERE t.from_acct = a.id)",
            extra="INSERT INTO transfers VALUES (99, 5, 1, 1000, '2026-03-08 09:00');")
check("three on the shipped dump", lambda: len(learner()), 3)
check("Nadia Quill is one of them", lambda: ('Nadia Quill',) in learner(), True)
check("Corvin Holdings sent plenty", lambda: ('Corvin Holdings',) in learner(), False)
check("fewer than the ten accounts", lambda: len(learner()) < len(rows("SELECT id FROM accounts")), True)`),
    mini('Return the name of every staff member who never swiped after dark — no swipe at or after 22:00 and none before 06:00, compared with time(at). One column named name, alphabetical. Order matters.',
      'Stand on a staff row and ask the badge log a yes-or-no question about that person and those hours, then keep the people it answers no to.',
`check_cols("one column named name", ['name'])
check_query("the staff who keep daylight hours", "SELECT name FROM staff s WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id AND (time(b.at) >= '22:00' OR time(b.at) < '06:00')) ORDER BY name", ordered=True)
check_query("one night swipe and a name drops off", "SELECT name FROM staff s WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id AND (time(b.at) >= '22:00' OR time(b.at) < '06:00')) ORDER BY name", ordered=True,
            extra="INSERT INTO badges VALUES (99, 1, 'lobby', '2026-03-08 23:30', 'in');")
check("eight names on the shipped dump", lambda: len(learner()), 8)
check("Bo Lund comes first", lambda: learner()[0], ('Bo Lund',))
check("Otto Kline was up at all hours", lambda: ('Otto Kline',) in learner(), False)
check("alphabetical", lambda: [n for (n,) in learner()] == sorted(n for (n,) in learner()), True)`),
  ],
})
