// Python tests per gate, keyed by gate id. The learner's SQL is wrapped as __sql and run after
// harness.py, the fixture and src/courses/sql/harness_sql.py in one namespace. Use the harness:
//   check_query(label, ref_sql, ordered=False, extra=None)   learner rows vs reference rows
//   check_cols(label, [names])                                column names of the learner's result
//   rows(sql, extra=None) / learner(extra=None) / learner_cols()   for hand-written check() calls
// Every gate has one check_query on the shipped fixture and one with `extra` rows, so a hard-coded
// answer fails. ordered=True only when the mission says order matters. Helper names start with
// _t_. Run `npm test` to prove the tests against scripts/solutions/sql/*.sql.
export const TESTS = {
pullnames: `check_cols("two columns, name then dept", ['name', 'dept'])
check_query("the vault staff, alphabetical", "SELECT name, dept FROM staff WHERE dept = 'vault' ORDER BY name", ordered=True)
check_query("a new hire lands first", "SELECT name, dept FROM staff WHERE dept = 'vault' ORDER BY name", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Abe Zed', 'vault', '2026-01-01', 2);")
check("only vault rows", lambda: all(d == 'vault' for _, d in learner()), True)
check("three rows on the shipped dump", lambda: len(learner()), 3)`,

bigmoves: `check_cols("two columns, id then amount", ['id', 'amount'])
check_query("the five biggest, biggest first", "SELECT id, amount FROM transfers ORDER BY amount DESC LIMIT 5", ordered=True)
check_query("a new giant tops the list", "SELECT id, amount FROM transfers ORDER BY amount DESC LIMIT 5", ordered=True,
            extra="INSERT INTO transfers VALUES (99, 1, 2, 5000000, '2026-03-08 09:00');")
check("exactly five", lambda: len(learner()), 5)
check("largest first", lambda: [a for _, a in learner()] == sorted([a for _, a in learner()], reverse=True), True)`,

nightdoors: `check_cols("one column, door", ['door'])
check_query("the doors opened after dark", "SELECT DISTINCT door FROM badges WHERE time(at) >= '22:00' OR time(at) < '06:00'")
check_query("a night swipe at the vault adds the vault", "SELECT DISTINCT door FROM badges WHERE time(at) >= '22:00' OR time(at) < '06:00'",
            extra="INSERT INTO badges VALUES (99, 9, 'vault', '2026-03-08 23:30', 'in');")
check("no duplicates", lambda: len(learner()) == len(set(learner())), True)
check("three doors on the shipped dump", lambda: len(learner()), 3)`,

howmany: `check_cols("one column named n", ['n'])
check_query("how many personal accounts", "SELECT COUNT(*) AS n FROM accounts WHERE kind = 'personal'")
check_query("one more personal account, one more in the count", "SELECT COUNT(*) AS n FROM accounts WHERE kind = 'personal'",
            extra="INSERT INTO accounts VALUES (99, 'New Face', 'personal', 'north', '2026-01-01');")
check("one row", lambda: len(learner()), 1)
check("it is a number", lambda: type(learner()[0][0]).__name__, 'int')`,

badgeowners: `check_cols("three columns, name then door then at", ['name', 'door', 'at'])
check_query("every swipe with its owner", "SELECT s.name, b.door, b.at FROM badges b JOIN staff s ON s.id = b.staff_id")
check_query("a new swipe arrives, an orphan swipe does not", "SELECT s.name, b.door, b.at FROM badges b JOIN staff s ON s.id = b.staff_id",
            extra="INSERT INTO badges VALUES (99, 4, 'stairs', '2026-03-08 10:00', 'in'); INSERT INTO badges VALUES (98, 77, 'roof', '2026-03-08 11:00', 'in');")
check("seventeen swipes on the shipped dump", lambda: len(learner()), 17)
check("names, not staff ids", lambda: all(isinstance(n, str) for n, _, _ in learner()), True)
check("Ines Marr swiped the vault", lambda: ('Ines Marr', 'vault', '2026-03-02 08:55') in learner(), True)`,

emptyaccounts: `check_cols("two columns, id then holder", ['id', 'holder'])
check_query("the accounts nothing ever touched", "SELECT a.id, a.holder FROM accounts a LEFT JOIN transfers t ON a.id = t.from_acct OR a.id = t.to_acct WHERE t.id IS NULL")
check_query("one penny in and the account is no longer dead", "SELECT a.id, a.holder FROM accounts a LEFT JOIN transfers t ON a.id = t.from_acct OR a.id = t.to_acct WHERE t.id IS NULL",
            extra="INSERT INTO transfers VALUES (99, 5, 2, 1000, '2026-03-08 09:00');")
check("three on the shipped dump", lambda: len(learner()), 3)
check("Nadia Quill is one of them", lambda: (5, 'Nadia Quill') in learner(), True)
check("Corvin Holdings is not", lambda: all(h != 'Corvin Holdings' for _, h in learner()), True)`,

chainofcommand: `check_cols("two columns, name then manager", ['name', 'manager'])
check_query("everyone beside their manager, alphabetical", "SELECT s.name, m.name AS manager FROM staff s JOIN staff m ON m.id = s.manager_id ORDER BY s.name", ordered=True)
check_query("a new hire lands first", "SELECT s.name, m.name AS manager FROM staff s JOIN staff m ON m.id = s.manager_id ORDER BY s.name", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Abe Zed', 'vault', '2026-03-08', 2);")
check("eleven pairs on the shipped dump", lambda: len(learner()), 11)
check("the one at the top never appears on the left", lambda: all(n != 'Halden Voss' for n, _ in learner()), True)
check("Ana Petrov reports to Ruth Ash", lambda: ('Ana Petrov', 'Ruth Ash') in learner(), True)`,

threeway: `check_cols("four columns, id then sender then receiver then amount", ['id', 'sender', 'receiver', 'amount'])
check_query("both ends of every transfer", "SELECT t.id, f.holder AS sender, p.holder AS receiver, t.amount FROM transfers t JOIN accounts f ON f.id = t.from_acct JOIN accounts p ON p.id = t.to_acct ORDER BY t.id", ordered=True)
check_query("a new account sends, and shows up named", "SELECT t.id, f.holder AS sender, p.holder AS receiver, t.amount FROM transfers t JOIN accounts f ON f.id = t.from_acct JOIN accounts p ON p.id = t.to_acct ORDER BY t.id", ordered=True,
            extra="INSERT INTO accounts VALUES (99, 'Vela Ord', 'personal', 'north', '2026-01-01'); INSERT INTO transfers VALUES (99, 99, 1, 7000, '2026-03-08 09:00');")
check("fourteen rows on the shipped dump", lambda: len(learner()), 14)
check("the first is Corvin to Grey for 250000", lambda: learner()[0], (1, 'Corvin Holdings', 'Grey Import Co', 250000))
check("no transfer has the same name at both ends", lambda: all(s != r for _, s, r, _ in learner()), True)`,
}
