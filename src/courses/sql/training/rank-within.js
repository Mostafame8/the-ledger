import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('rank-within', {
  tier: 'A', xp: 240, requires: ['running-total'], gates: ['toppercamera'],
  tools: ['tool-order'],
  title: 'Rank within each', algo: 'Ranking windows',
  steps: [
    explain([
      '“The newest camera on each floor,” the fence says. Dax sorts the sheet by floor and then by date, and reads off the first row of each block.',
      'He reads two of the four blocks the wrong way round, because the dates run down the page in one place and up it in another, and nothing on the sheet says which.',
      '“Number them within their own floor, newest first, then keep the ones numbered one,” Marguerite says. “One rule, four floors, no reading by eye.”',
    ], { move: 'brute force' }),
    explain([
      '“ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) hands each row its place inside its own floor. The partition says which group, the order says which end is first.”',
      '“That number is worked out after WHERE and before the answer is shaped, so you cannot sieve on it in the same SELECT. Wrap the statement and sieve outside — a named piece does that neatly.”',
    ], { move: 'pick the pattern', code:
`SELECT zone, floor,
       ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn
FROM cameras;
-- ('loading-bay', 0, 1)
-- ('lobby', 0, 2)
-- ('corridor', 1, 1)
-- ... eight rows, numbered inside each floor` }),
    trace(
`SELECT zone, floor,
       ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn
FROM cameras`,
      'the query above',
      [
        { line: 3, state: { rows: 8 }, ask: 'rows', note: 'Eight cameras on the bench, spread over four floors.' },
        { line: 2, state: { rows: 8, partitions: 4 }, ask: 'partitions', note: 'One numbering run per floor: 0, 1, 2 and 3. Floor 2 holds three cameras, floor 3 holds one.' },
        { line: 1, state: { rows: 8, partitions: 4, returns: { py: "[('loading-bay', 0, 1), ('lobby', 0, 2), ('corridor', 1, 1), ('tellers', 1, 2), ('vault-inside', 2, 1), ('stairs', 2, 2), ('vault-door', 2, 3), ('server-room', 3, 1)]" } }, ask: 'returns', note: 'Every row keeps its place, and the newest camera on each floor is the one numbered 1.' },
      ]),
    spot('Two cameras on one floor were installed on the same day. What is the difference between ROW_NUMBER() and RANK() there?',
      ['None; both number them 1 and 2',
       'ROW_NUMBER gives 1 and 2 in an order it picks; RANK gives both 1 and then skips to 3',
       'RANK refuses to number tied rows',
       'ROW_NUMBER gives both 1'],
      1, 'ROW_NUMBER always hands out distinct places, breaking a tie however it likes unless you add another key. RANK gives tied rows the same place and leaves a gap after them. Pick the one whose answer you can defend.'),
    blank('“Number every camera inside its own floor, newest first.”',
`SELECT zone, ___() OVER (PARTITION BY floor ORDER BY installed ___) AS rn FROM cameras`,
`check_cols("two columns, zone then rn", ['zone', 'rn'])
check_query("each camera's place on its floor", "SELECT zone, ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn FROM cameras", ordered=True)
check_query("a brand new camera takes first place on its floor", "SELECT zone, ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn FROM cameras", ordered=True,
            extra="INSERT INTO cameras VALUES (99, 2, 'vault-roof', '2026-01-01');")
check("eight rows, nothing folded", lambda: len(learner()), 8)
check("the loading bay is newest on its floor", lambda: learner()[0], ('loading-bay', 1))
check("four cameras are numbered one", lambda: sum(1 for _, rn in learner() if rn == 1), 4)
check("the tallest number is three", lambda: max(rn for _, rn in learner()), 3)`),
    mini('Return the two newest cameras on each floor: three columns named floor, zone and rn, where rn is the camera\'s place inside its floor from row_number() with the newest first. Ordered by floor then rn. Order matters.',
      'Number them inside the statement, then sieve on that number from outside it — the place cannot be tested where it is worked out. A floor with one camera contributes one row.',
`check_cols("three columns, floor then zone then rn", ['floor', 'zone', 'rn'])
check_query("the top two on every floor", "SELECT floor, zone, rn FROM (SELECT floor, zone, ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn FROM cameras) AS ranked WHERE rn <= 2 ORDER BY floor, rn", ordered=True)
check_query("a new camera pushes floor two along", "SELECT floor, zone, rn FROM (SELECT floor, zone, ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn FROM cameras) AS ranked WHERE rn <= 2 ORDER BY floor, rn", ordered=True,
            extra="INSERT INTO cameras VALUES (99, 2, 'vault-roof', '2026-01-01');")
check("seven rows on the shipped dump", lambda: len(learner()), 7)
check("the loading bay leads floor zero", lambda: learner()[0], (0, 'loading-bay', 1))
check("no row numbered three survives", lambda: all(rn <= 2 for _, _, rn in learner()), True)
check("the top floor contributes its one camera", lambda: (3, 'server-room', 1) in learner(), True)`),
  ],
})
