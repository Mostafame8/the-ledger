import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('count-what-is-there', {
  tier: 'F', xp: 55, requires: ['line-them-up'], gates: ['nightdoors', 'howmany'],
  tools: ['tool-select'],
  title: 'Count what is there', algo: 'COUNT and DISTINCT',
  steps: [
    explain([
      '“How many,” the fence says, “not which.” Dax scrolls the badge log with a finger on the screen, counting out loud, and gets six, then seven, then six again.',
      'Then she asks how many different doors there are, and he starts a list in the margin and crosses names off when he thinks he has already written them.',
      '“Both of those are one word,” Marguerite says. “The table can count what it holds, and it can tell you what it holds once each.”',
    ], { move: 'brute force' }),
    explain([
      '“COUNT(*) is how many rows got through the sieve. It is one row of answer rather than a column beside the others, so give it a name with AS.”',
      '“DISTINCT after SELECT drops repeated rows from the answer. Inside COUNT it does the same job before the counting starts, which is how you ask how many different things there are.”',
    ], { move: 'pick the pattern', code:
`SELECT COUNT(*) AS n FROM badges;
-- (17,)

SELECT DISTINCT door FROM badges;
-- ('vault',) ('lobby',) ('server-room',) ('loading-bay',)

SELECT COUNT(DISTINCT door) AS doors FROM badges;
-- (4,)` }),
    trace(
`SELECT COUNT(*) AS n
FROM badges
WHERE door = 'lobby'`,
      'the query above',
      [
        { line: 2, state: { rows: 17 }, ask: 'rows', note: 'Seventeen swipes on the bench, every door among them.' },
        { line: 3, state: { rows: 17, kept: 6 }, ask: 'kept', note: 'The sieve runs first. Six lobby swipes survive it.' },
        { line: 1, state: { rows: 17, kept: 6, returns: { py: '[(6,)]' } }, ask: 'returns', note: 'The count folds those six rows into one row of one column. One number, one seat.' },
      ]),
    spot('Over the staff table Dax runs COUNT(*), COUNT(dept) and COUNT(DISTINCT dept) and gets three different numbers. Which set is right?',
      ['12, 12, 12 — a count is a count',
       '12, 11, 4 — rows, rows with a department written down, different departments',
       '12, 11, 11 — the last two always agree',
       '11, 11, 4 — the blank row is skipped everywhere'],
      1, 'COUNT(*) counts rows. COUNT(column) skips the rows where that column is blank, and one staff member has no department. DISTINCT collapses the repeats before the count: board, vault, security, tellers.'),
    blank('“Every door that appears anywhere in the badge log, once each.”',
`SELECT ___ door FROM badges`,
`check_cols("one column named door", ['door'])
check_query("the four doors of the building", "SELECT DISTINCT door FROM badges")
check_query("a swipe at a new door adds one", "SELECT DISTINCT door FROM badges",
            extra="INSERT INTO badges VALUES (99, 2, 'roof', '2026-03-08 09:00', 'in');")
check("four doors on the shipped dump", lambda: len(learner()), 4)
check("no repeats", lambda: len(learner()) == len(set(learner())), True)
check("the vault is one of them", lambda: ('vault',) in learner(), True)
check("fewer rows than the log has swipes", lambda: len(learner()) < len(rows("SELECT id FROM badges")), True)`),
    mini('Return one row with one column named doors: how many different doors appear in the badge log — count(distinct door).',
      'COUNT takes a column instead of a star when you want it to look at values, and DISTINCT can sit inside it to collapse the repeats first.',
`check_cols("one column named doors", ['doors'])
check_query("how many different doors", "SELECT COUNT(DISTINCT door) AS doors FROM badges")
check_query("a new door lifts the number", "SELECT COUNT(DISTINCT door) AS doors FROM badges",
            extra="INSERT INTO badges VALUES (99, 2, 'roof', '2026-03-08 09:00', 'in');")
check("exactly one row", lambda: len(learner()), 1)
check("four on the shipped dump", lambda: learner()[0][0], 4)
check("it is a number", lambda: type(learner()[0][0]).__name__, 'int')
check("fewer doors than swipes", lambda: learner()[0][0] < 17, True)`),
  ],
})
