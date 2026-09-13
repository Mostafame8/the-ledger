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

perdept: `check_cols("two columns, dept then n", ['dept', 'n'])
check_query("headcount per department", "SELECT dept, COUNT(*) AS n FROM staff WHERE dept IS NOT NULL GROUP BY dept")
check_query("a new vault hire lifts one pile", "SELECT dept, COUNT(*) AS n FROM staff WHERE dept IS NOT NULL GROUP BY dept",
            extra="INSERT INTO staff VALUES (99, 'Abe Zed', 'vault', '2026-03-08', 2);")
check("four departments", lambda: len(learner()), 4)
check("no blank department in the answer", lambda: all(d is not None for d, _ in learner()), True)
check("the counts add up to eleven", lambda: sum(n for _, n in learner()), 11)`,

heavyhitters: `check_cols("two columns, from_acct then total", ['from_acct', 'total'])
check_query("the accounts sending over half a million", "SELECT from_acct, SUM(amount) AS total FROM transfers GROUP BY from_acct HAVING SUM(amount) > 500000 ORDER BY total DESC", ordered=True)
check_query("a big transfer out promotes an account", "SELECT from_acct, SUM(amount) AS total FROM transfers GROUP BY from_acct HAVING SUM(amount) > 500000 ORDER BY total DESC", ordered=True,
            extra="INSERT INTO transfers VALUES (99, 9, 1, 600000, '2026-03-08 09:00');")
check("three accounts on the shipped dump", lambda: len(learner()), 3)
check("every total clears the bar", lambda: all(t > 500000 for _, t in learner()), True)
check("account 1 leads with 3525000", lambda: learner()[0], (1, 3525000))`,

busiestdoor: `check_cols("two columns, door then n", ['door', 'n'])
check_query("the door that opens most", "SELECT door, COUNT(*) AS n FROM badges GROUP BY door ORDER BY n DESC LIMIT 1")
check_query("three more vault swipes and the vault takes it", "SELECT door, COUNT(*) AS n FROM badges GROUP BY door ORDER BY n DESC LIMIT 1",
            extra="INSERT INTO badges VALUES (99, 4, 'vault', '2026-03-08 09:00', 'in'); INSERT INTO badges VALUES (98, 9, 'vault', '2026-03-08 10:00', 'in'); INSERT INTO badges VALUES (97, 2, 'vault', '2026-03-08 11:00', 'in');")
check("exactly one row", lambda: len(learner()), 1)
check("the lobby, six swipes", lambda: learner()[0], ('lobby', 6))
check("two columns", lambda: len(learner()[0]), 2)`,

byday: `check_cols("two columns, day then n", ['day', 'n'])
check_query("transfers per day, earliest first", "SELECT date(at) AS day, COUNT(*) AS n FROM transfers GROUP BY date(at) ORDER BY day", ordered=True)
check_query("a transfer on a new day adds a row", "SELECT date(at) AS day, COUNT(*) AS n FROM transfers GROUP BY date(at) ORDER BY day", ordered=True,
            extra="INSERT INTO transfers VALUES (99, 1, 2, 1000, '2026-03-08 09:00');")
check("six days on the shipped dump", lambda: len(learner()), 6)
check("the counts add up to every transfer", lambda: sum(n for _, n in learner()), 14)
check("a day is ten characters, no clock", lambda: all(len(d) == 10 for d, _ in learner()), True)`,

abovemean: `check_cols("two columns, id then amount", ['id', 'amount'])
check_query("the transfers above the average", "SELECT id, amount FROM transfers WHERE amount > (SELECT AVG(amount) FROM transfers) ORDER BY amount DESC", ordered=True)
check_query("one giant drags the average up", "SELECT id, amount FROM transfers WHERE amount > (SELECT AVG(amount) FROM transfers) ORDER BY amount DESC", ordered=True,
            extra="INSERT INTO transfers VALUES (99, 1, 2, 10000000, '2026-03-08 09:00');")
check("three on the shipped dump", lambda: len(learner()), 3)
check("largest first", lambda: [a for _, a in learner()] == sorted([a for _, a in learner()], reverse=True), True)
check("nothing at or below the average", lambda: min(a for _, a in learner()) > 426250, True)`,

neverswiped: `check_cols("two columns, id then name", ['id', 'name'])
check_query("the staff with no swipe at all", "SELECT id, name FROM staff s WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id) ORDER BY id", ordered=True)
check_query("one swipe and a name drops off the list", "SELECT id, name FROM staff s WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id) ORDER BY id", ordered=True,
            extra="INSERT INTO badges VALUES (99, 1, 'lobby', '2026-03-08 09:00', 'in');")
check("two on the shipped dump", lambda: len(learner()), 2)
check("Bo Lund is one of them", lambda: (11, 'Bo Lund') in learner(), True)
check("nobody who swiped is here", lambda: all(i not in (2, 3, 4, 5) for i, _ in learner()), True)`,

bucket: `check_cols("three columns, id then amount then band", ['id', 'amount', 'band'])
check_query("every transfer with its band", "SELECT id, amount, CASE WHEN amount < 50000 THEN 'small' WHEN amount < 500000 THEN 'medium' ELSE 'large' END AS band FROM transfers ORDER BY id", ordered=True)
check_query("a transfer of exactly 50000 is medium", "SELECT id, amount, CASE WHEN amount < 50000 THEN 'small' WHEN amount < 500000 THEN 'medium' ELSE 'large' END AS band FROM transfers ORDER BY id", ordered=True,
            extra="INSERT INTO transfers VALUES (99, 1, 2, 50000, '2026-03-08 09:00');")
check("fourteen rows on the shipped dump", lambda: len(learner()), 14)
check("two large moves", lambda: sum(1 for _, _, b in learner() if b == 'large'), 2)
check("only the three words", lambda: set(b for _, _, b in learner()) <= {'small', 'medium', 'large'}, True)`,

twolists: `check_cols("one column named name", ['name'])
check_query("every name the Ledger touches", "SELECT payer AS name FROM payments UNION SELECT payee FROM payments")
check_query("a new payer adds a new name", "SELECT payer AS name FROM payments UNION SELECT payee FROM payments",
            extra="INSERT INTO payments VALUES (99, 'Vela Ord', 'Bo Lund', 5000, '2026-03-08', NULL);")
check("ten names on the shipped dump", lambda: len(learner()), 10)
check("no repeats", lambda: len(learner()) == len(set(learner())), True)
check("Halden Voss appears once, though he is on both sides", lambda: sum(1 for (n,) in learner() if n == 'Halden Voss'), 1)`,

runningtotal: `check_cols("three columns, paid_on then amount then running", ['paid_on', 'amount', 'running'])
check_query("every payment with the total so far", "SELECT paid_on, amount, SUM(amount) OVER (ORDER BY paid_on, id) AS running FROM payments ORDER BY paid_on, id", ordered=True)
check_query("an early payment shifts every total after it", "SELECT paid_on, amount, SUM(amount) OVER (ORDER BY paid_on, id) AS running FROM payments ORDER BY paid_on, id", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Vela Ord', 'Bo Lund', 100000, '2026-01-06', NULL);")
check("twelve rows, one per payment", lambda: len(learner()), 12)
check("the first running total is the first payment", lambda: learner()[0][2], 50000)
check("the last is every payment added up", lambda: learner()[-1][2], 1103000)`,

toppercamera: `check_cols("three columns, floor then zone then installed", ['floor', 'zone', 'installed'])
check_query("the newest camera on each floor", "SELECT floor, zone, installed FROM (SELECT floor, zone, installed, ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn FROM cameras) AS ranked WHERE rn = 1 ORDER BY floor", ordered=True)
check_query("a brand new camera takes floor two", "SELECT floor, zone, installed FROM (SELECT floor, zone, installed, ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn FROM cameras) AS ranked WHERE rn = 1 ORDER BY floor", ordered=True,
            extra="INSERT INTO cameras VALUES (99, 2, 'vault-roof', '2026-01-01');")
check("four floors, four rows", lambda: len(learner()), 4)
check("floor two is the one inside the vault", lambda: learner()[2][1], 'vault-inside')
check("the floors come back 0, 1, 2, 3", lambda: [f for f, _, _ in learner()], [0, 1, 2, 3])`,

reportsto: `check_cols("two columns, name then level", ['name', 'level'])
check_query("everyone above Ana Petrov", "WITH RECURSIVE up(id, name, manager_id, level) AS (SELECT id, name, manager_id, 0 FROM staff WHERE id = 12 UNION ALL SELECT s.id, s.name, s.manager_id, up.level + 1 FROM staff s JOIN up ON s.id = up.manager_id) SELECT name, level FROM up WHERE level > 0 ORDER BY level", ordered=True)
check_query("a new head of the firm adds a step at the top", "WITH RECURSIVE up(id, name, manager_id, level) AS (SELECT id, name, manager_id, 0 FROM staff WHERE id = 12 UNION ALL SELECT s.id, s.name, s.manager_id, up.level + 1 FROM staff s JOIN up ON s.id = up.manager_id) SELECT name, level FROM up WHERE level > 0 ORDER BY level", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', 'board', '2000-01-01', NULL); UPDATE staff SET manager_id = 99 WHERE id = 1;")
check("four people above her", lambda: len(learner()), 4)
check("her own manager first", lambda: learner()[0], ('Ruth Ash', 1))
check("Halden Voss at the top", lambda: learner()[-1][0], 'Halden Voss')
check("she is not in her own chain", lambda: all(n != 'Ana Petrov' for n, _ in learner()), True)`,

thebooks: `check_cols("four columns, payee then total then place then band", ['payee', 'total', 'place', 'band'])
check_query("the Books, closed", "WITH totals AS (SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee) SELECT payee, total, ROW_NUMBER() OVER (ORDER BY total DESC, payee) AS place, CASE WHEN total >= 100000 THEN 'big' WHEN total >= 25000 THEN 'middling' ELSE 'small' END AS band FROM totals ORDER BY place", ordered=True)
check_query("one huge payment reorders the whole book", "WITH totals AS (SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee) SELECT payee, total, ROW_NUMBER() OVER (ORDER BY total DESC, payee) AS place, CASE WHEN total >= 100000 THEN 'big' WHEN total >= 25000 THEN 'middling' ELSE 'small' END AS band FROM totals ORDER BY place", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Bo Lund', 900000, '2026-03-08', NULL);")
check("seven payees", lambda: len(learner()), 7)
check("Halden Voss takes first place with 650000", lambda: learner()[0][:2], ('Halden Voss', 650000))
check("places run 1 to 7", lambda: [p for _, _, p, _ in learner()], [1, 2, 3, 4, 5, 6, 7])
check("the tie at 120000 is broken alphabetically", lambda: [p for p, _, _, _ in learner()][2:4], ['Ines Marr', 'Otto Kline'])`,
}
