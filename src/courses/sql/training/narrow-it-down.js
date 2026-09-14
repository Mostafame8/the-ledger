import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('narrow-it-down', {
  tier: 'F', xp: 45, requires: ['pick-columns'], gates: ['pullnames', 'bigmoves'],
  tools: ['tool-where'],
  title: 'Narrow it down', algo: 'WHERE',
  steps: [
    explain([
      'Fourteen transfers in the dump and the fence wants the big ones. Dax prints all fourteen, lays them on the table, and starts sliding the small ones onto the floor with the back of his hand.',
      'He slides one of the big ones off by accident, picks it up, and now he is not sure whether it was already counted.',
      '“Say what you want kept and let the table do the sliding,” Marguerite says. “It never gets bored and it never picks the wrong row up off the floor.”',
    ], { move: 'brute force' }),
    explain([
      '“WHERE runs once for every row and keeps the ones it likes. Everything after it — the order, the count, the answer — only ever sees the survivors.”',
      '“Numbers go bare, text goes in single quotes. Join two conditions with AND when you want both and OR when either will do, and remember AND binds tighter, so bracket the OR when you mean it to win.”',
    ], { move: 'pick the pattern', code:
`SELECT id, amount FROM transfers WHERE amount > 1000000;
-- (5, 1500000)
-- (13, 3200000)

SELECT holder FROM accounts WHERE kind = 'personal' AND branch = 'north';
-- ('Delia Marsh',)
-- ('Nadia Quill',)
-- ('Ivo Larch',)` }),
    trace(
`SELECT id, amount
FROM transfers
WHERE amount > 100000`,
      'the query above',
      [
        { line: 2, state: { rows: 14 }, ask: 'rows', note: 'All fourteen transfers go onto the bench before anything is thrown away.' },
        { line: 3, state: { rows: 14, kept: 5 }, ask: 'kept', note: 'Five amounts clear a hundred thousand. The other nine never reach the SELECT list.' },
        { line: 1, state: { rows: 14, kept: 5, returns: { py: '[(1, 250000), (3, 480000), (5, 1500000), (10, 220000), (13, 3200000)]' } }, ask: 'returns', note: 'The survivors come back in the order the table held them, because nothing asked for another one.' },
      ]),
    spot('Dax wants the personal accounts in the north or central branch. He writes WHERE branch = \'north\' OR branch = \'central\' AND kind = \'personal\'. What comes back?',
      ['Exactly what he wanted',
       'Every north account, personal or not, plus the personal central ones',
       'Nothing, because AND and OR cannot be mixed',
       'Only the central personal accounts'],
      1, 'AND is evaluated before OR, so the query reads as north, OR (central AND personal). Brackets round the two-branch test make it say what he meant.'),
    blank('“Personal accounts, anywhere but the harbour. Just the holder.”',
`SELECT holder FROM accounts WHERE kind = ___ AND branch ___ 'harbour'`,
`check_cols("one column named holder", ['holder'])
check_query("the personal accounts away from the water", "SELECT holder FROM accounts WHERE kind = 'personal' AND branch <> 'harbour'")
check_query("a new personal account in the north", "SELECT holder FROM accounts WHERE kind = 'personal' AND branch <> 'harbour'",
            extra="INSERT INTO accounts VALUES (99, 'Vela Ord', 'personal', 'north', '2026-01-01');")
check("four holders on the shipped dump", lambda: len(learner()), 4)
check("Delia Marsh is one of them", lambda: ('Delia Marsh',) in learner(), True)
check("nobody from the harbour", lambda: not any(h in [r[0] for r in rows("SELECT holder FROM accounts WHERE branch = 'harbour'")] for (h,) in learner()), True)
check("the business accounts stayed out", lambda: ('Corvin Holdings',) in learner(), False)`),
    mini('Return the name of every staff member in the vault department, however the dump happened to type it — match on lower(dept). One column named name, alphabetical. Order matters.',
      'lower() folds the stored text down before the comparison, so VAULT and vault meet in the middle. The column you compare is not the column you return.',
`check_cols("one column named name", ['name'])
check_query("the vault staff, alphabetical", "SELECT name FROM staff WHERE lower(dept) = 'vault' ORDER BY name", ordered=True)
check_query("a hire filed in capitals still counts", "SELECT name FROM staff WHERE lower(dept) = 'vault' ORDER BY name", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Abe Zed', 'VAULT', '2026-01-01', 2);")
check("three names on the shipped dump", lambda: len(learner()), 3)
check("Ines Marr comes first", lambda: learner()[0], ('Ines Marr',))
check("alphabetical", lambda: [n for (n,) in learner()] == sorted(n for (n,) in learner()), True)
check("nobody from the tellers", lambda: ('Lena Brack',) in learner(), False)`),
  ],
})
