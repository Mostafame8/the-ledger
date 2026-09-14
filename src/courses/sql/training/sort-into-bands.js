import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('sort-into-bands', {
  tier: 'B', xp: 160, requires: ['name-the-result'], gates: ['bucket'],
  tools: ['tool-null'],
  title: 'Sort into bands', algo: 'CASE',
  steps: [
    explain([
      '“I do not want fourteen numbers,” the fence says. “I want small, worth reading, and the reason we are here.” Dax highlights the rows in three colours.',
      'The photocopy comes out grey, the fax comes out greyer, and the band a row belongs to now lives only in Dax\'s head.',
      '“Write the band into the row as a word,” Marguerite says. “A word survives a photocopier, and the table can work out which word on its own.”',
    ], { move: 'brute force' }),
    explain([
      '“CASE WHEN … THEN … WHEN … THEN … ELSE … END is one column. The first WHEN that fits wins, so the tests are read top to bottom and their order is the design.”',
      '“It is an expression, not a clause: it can sit in the SELECT list, in ORDER BY, even inside a count. Give it a name with AS, and give it an ELSE unless you want a blank for the rows nothing matched.”',
    ], { move: 'pick the pattern', code:
`SELECT name,
       CASE WHEN dept IS NULL THEN 'unfiled'
            WHEN dept = 'vault' THEN 'inside'
            ELSE 'outside' END AS side
FROM staff LIMIT 4;
-- ('Halden Voss', 'outside')
-- ('Ines Marr', 'inside')
-- ('Tomas Reed', 'outside')
-- ('Priya Nand', 'inside')` }),
    trace(
`SELECT name,
       CASE WHEN dept IS NULL THEN 'unfiled'
            WHEN dept = 'vault' THEN 'inside'
            ELSE 'outside' END AS side
FROM staff`,
      'the query above',
      [
        { line: 5, state: { rows: 12 }, ask: 'rows', note: 'Twelve staff rows. This folds nothing together — one row in, one row out.' },
        { line: 2, state: { rows: 12, unfiled: 1 }, ask: 'unfiled', note: 'The first test catches the one row with no department written down, before the equals test ever sees it.' },
        { line: 4, state: { rows: 12, unfiled: 1, inside: 3 }, ask: 'inside', note: 'Three vault staff take the second branch; the remaining eight fall through to ELSE and read outside.' },
      ]),
    spot('Dax puts WHEN dept = \'vault\' first and WHEN dept IS NULL second. What changes for the staff member with no department?',
      ['Nothing; the tests are checked in whatever order suits SQLite',
       'Nothing; a blank fails the equals test, falls past it, and still reads unfiled',
       'They read vault, because a blank matches anything',
       'The query errors'],
      1, 'A test against a blank is never true, so that row simply falls through to the next WHEN. Order matters when two tests could both fit — not here, where they cannot.'),
    blank('“Flag the trusts for a closer look and leave the rest alone.”',
`SELECT holder, CASE WHEN kind = 'trust' THEN 'watch' ___ 'ignore' END AS flag FROM accounts`,
`check_cols("two columns, holder then flag", ['holder', 'flag'])
check_query("every account, flagged", "SELECT holder, CASE WHEN kind = 'trust' THEN 'watch' ELSE 'ignore' END AS flag FROM accounts")
check_query("a new trust is flagged too", "SELECT holder, CASE WHEN kind = 'trust' THEN 'watch' ELSE 'ignore' END AS flag FROM accounts",
            extra="INSERT INTO accounts VALUES (99, 'Vela Ord', 'trust', 'north', '2026-01-01');")
check("ten rows on the shipped dump", lambda: len(learner()), 10)
check("Sable Trust is one to watch", lambda: ('Sable Trust', 'watch') in learner(), True)
check("two to watch in all", lambda: sum(1 for _, f in learner() if f == 'watch'), 2)
check("only the two words", lambda: set(f for _, f in learner()) <= {'watch', 'ignore'}, True)`),
    mini('Return how many transfers fall in each band — count(*) — where a band is small below 50,000, medium below 500,000 and large otherwise. Two columns named band and n, band alphabetical. Order matters.',
      'The banding expression can be named once and then piled up by that name. Alphabetical puts large before medium before small, which is not the order you wrote them in.',
`check_cols("two columns, band then n", ['band', 'n'])
check_query("the three bands and their counts", "SELECT CASE WHEN amount < 50000 THEN 'small' WHEN amount < 500000 THEN 'medium' ELSE 'large' END AS band, COUNT(*) AS n FROM transfers GROUP BY band ORDER BY band", ordered=True)
check_query("a transfer of exactly 50000 is medium", "SELECT CASE WHEN amount < 50000 THEN 'small' WHEN amount < 500000 THEN 'medium' ELSE 'large' END AS band, COUNT(*) AS n FROM transfers GROUP BY band ORDER BY band", ordered=True,
            extra="INSERT INTO transfers VALUES (99, 1, 2, 50000, '2026-03-08 09:00');")
check("three bands", lambda: len(learner()), 3)
check("two large moves, and they come first", lambda: learner()[0], ('large', 2))
check("the counts add up to every transfer", lambda: sum(n for _, n in learner()), 14)
check("six small ones", lambda: ('small', 6) in learner(), True)`),
  ],
})
