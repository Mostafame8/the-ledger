import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-where', {
  xp: 30, title: 'The sieve', algo: 'WHERE',
  steps: [
    explain([
      'Dax has the transfers sheet open with four filter menus half-set, and he cannot remember which two he turned on.',
      '“WHERE is the sieve,” Marguerite says. “It runs once per row and keeps the rows it likes. Everything after it only ever sees what got through.”',
      '“Text in single quotes, numbers bare. IN is a short way of saying a list of equals; BETWEEN keeps both ends.”',
    ], { code:
`SELECT id, amount FROM transfers WHERE amount > 1000000;
-- (5, 1500000)
-- (13, 3200000)

SELECT name FROM staff WHERE dept IN ('vault', 'tellers');
-- ('Ines Marr',)
-- ('Priya Nand',)
-- ... six rows in all` }),
    explain([
      '“<> is not-equal. LIKE matches text with % standing in for any run of characters, so door LIKE \'%room\' finds the server-room.”',
      '“AND binds tighter than OR, which bites people. If you mean one of two things and also a third thing, put brackets round the or.”',
      '“NOT flips the answer. Careful with blanks: a blank cell is unknown, and unknown never gets through the sieve, flipped or not.”',
    ]),
    trace(
`SELECT id, amount
FROM transfers
WHERE amount BETWEEN 10000 AND 100000`,
      'the query above',
      [
        { line: 2, state: { rows: 14 }, ask: 'rows', note: 'All fourteen transfers go onto the bench before the sieve runs.' },
        { line: 3, state: { rows: 14, kept: 6 }, ask: 'kept', note: 'BETWEEN keeps both ends: 10,000 and 100,000 would each survive. Six rows do.' },
        { line: 1, state: { rows: 14, kept: 6, returns: { py: '[(2, 12000), (6, 30000), (7, 75000), (8, 66000), (11, 98000), (12, 15000)]' } }, ask: 'returns', note: 'SELECT runs last, on the survivors, in the order the table held them.' },
      ]),
    blank('“Personal accounts in the north or central branch: the holder and the branch.”',
`SELECT holder, branch FROM accounts WHERE branch ___ ('north', 'central') ___ kind = ___`,
`check_cols("two columns, holder then branch", ['holder', 'branch'])
check_query("the personal accounts in those two branches", "SELECT holder, branch FROM accounts WHERE branch IN ('north', 'central') AND kind = 'personal'")
check("four holders", lambda: len(learner()), 4)
check("Delia Marsh is in the list", lambda: ('Delia Marsh', 'north') in learner(), True)
check("nothing from the harbour", lambda: all(b != 'harbour' for _, b in learner()), True)
check("two columns", lambda: len(learner()[0]), 2)`),
  ],
})
