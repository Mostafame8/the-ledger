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
}
