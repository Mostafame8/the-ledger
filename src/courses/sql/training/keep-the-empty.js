import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('keep-the-empty', {
  tier: 'E', xp: 70, requires: ['side-by-side'], gates: ['emptyaccounts'],
  tools: ['tool-null'],
  title: 'Keep the ones with nobody', algo: 'LEFT JOIN',
  steps: [
    explain([
      '“Find me the accounts nothing ever touched,” the fence says. “A dead account is a quiet account.” Dax joins the accounts to the transfers and hands over a list.',
      'Every account on his list has moved money, because a join keeps only the rows that found a partner — and the accounts she asked for are exactly the ones with no partner to find.',
      '“You cannot find an empty seat by listing the people sitting down,” Marguerite says. “Keep every account, put the transfers beside them, and look for the gap.”',
    ], { move: 'brute force' }),
    explain([
      '“LEFT JOIN keeps every row of the left table whether or not the right side has anything to offer. Where it has nothing, the right-hand columns come back blank.”',
      '“So the two-step is: keep everything, then sieve for the blank. And the sieve has to run on a column of the right-hand table, because the left is never blank.”',
    ], { move: 'pick the pattern', code:
`SELECT a.holder, t.id
FROM accounts a
LEFT JOIN transfers t ON t.from_acct = a.id
WHERE a.id IN (1, 8);
-- ('Corvin Holdings', 1)
-- ('Corvin Holdings', 7)
-- ('Corvin Holdings', 13)
-- ('Halden Staff Fund', None)` }),
    trace(
`SELECT a.holder, t.id
FROM accounts a
LEFT JOIN transfers t ON t.from_acct = a.id
WHERE a.branch = 'central'`,
      'the query above',
      [
        { line: 2, state: { rows: 10 }, ask: 'rows', note: 'Ten accounts on the bench, transfers not yet beside them.' },
        { line: 3, state: { rows: 10, paired: 17 }, ask: 'paired', note: 'Fourteen account-and-transfer pairs, plus one row each for the three accounts that never sent anything. Seventeen rows.' },
        { line: 4, state: { rows: 10, paired: 17, returns: { py: "[('Sable Trust', 5), ('Sable Trust', 10), ('Piet Vaan', 6), ('Halden Staff Fund', None)]" } }, ask: 'returns', note: 'The central branch keeps four of them, and the fund\'s empty seat comes back as None — a blank the join made, not one the table stored.' },
      ]),
    spot('Dax keeps every account with a LEFT JOIN, then adds WHERE t.amount > 1000 to ignore the small stuff. The accounts with no transfers…',
      ['Are still in the answer, with a blank amount',
       'Vanish, because a blank amount is not greater than a thousand',
       'Come back with an amount of zero',
       'Cause an error'],
      1, 'A test against a blank is never true, so a WHERE on the right-hand table quietly turns a LEFT JOIN back into an inner one. Conditions meant for the right-hand side belong in the ON.'),
    blank('“The accounts nothing ever arrived in. Just the holder.”',
`SELECT a.holder FROM accounts a ___ JOIN transfers t ON t.to_acct = a.id WHERE t.id ___ ___`,
`check_cols("one column named holder", ['holder'])
check_query("the accounts that never received", "SELECT a.holder FROM accounts a LEFT JOIN transfers t ON t.to_acct = a.id WHERE t.id IS NULL")
check_query("one payment in and an account drops off", "SELECT a.holder FROM accounts a LEFT JOIN transfers t ON t.to_acct = a.id WHERE t.id IS NULL",
            extra="INSERT INTO transfers VALUES (99, 1, 5, 1000, '2026-03-08 09:00');")
check("three on the shipped dump", lambda: len(learner()), 3)
check("Nadia Quill is one of them", lambda: ('Nadia Quill',) in learner(), True)
check("Corvin Holdings is not", lambda: ('Corvin Holdings',) in learner(), False)
check("three out of the ten accounts", lambda: len(rows("SELECT id FROM accounts")), 10)`),
    mini('Return every account beside each transfer it sent, with a zero where it never sent one: two columns named holder and moved, where moved is coalesce(t.amount, 0). Any order.',
      'Keep every account on the left, hang the transfers off the sending id, and print the gap as a number rather than a blank. An account that sent three times earns three rows.',
`check_cols("two columns, holder then moved", ['holder', 'moved'])
check_query("every account and what it sent", "SELECT a.holder, COALESCE(t.amount, 0) AS moved FROM accounts a LEFT JOIN transfers t ON t.from_acct = a.id")
check_query("a new account brings a zero with it", "SELECT a.holder, COALESCE(t.amount, 0) AS moved FROM accounts a LEFT JOIN transfers t ON t.from_acct = a.id",
            extra="INSERT INTO accounts VALUES (99, 'Vela Ord', 'personal', 'north', '2026-01-01');")
check("seventeen rows on the shipped dump", lambda: len(learner()), 17)
check("Nadia Quill shows a zero", lambda: ('Nadia Quill', 0) in learner(), True)
check("Corvin Holdings earns three rows", lambda: sum(1 for h, _ in learner() if h == 'Corvin Holdings'), 3)
check("every amount is a number", lambda: all(isinstance(m, int) for _, m in learner()), True)`),
  ],
})
