# The Books — the SQL course and the SQL runner

Date: 2026-09-12
Status: approved, not yet implemented
Builds on: courses plumbing (2026-09-12-courses-and-patterns-design.md), the oop course (2026-09-12-oop-course-design.md), the training room, save slots

## Purpose

The Ledger runs several courses through one shell, all in Python. This spec adds the first
course in another language: SQL, SQLite dialect, querying only. It also adds the runner switch
the courses spec deferred ("a SQL course adds a worker and a switch in `runner.js` later"),
implemented without a new runtime: Pyodide ships Python's `sqlite3`, so SQL runs inside the
existing Python worker and the existing `check()` result pipeline.

## Decisions taken

- Scope is querying, F to S: SELECT, WHERE, ORDER BY, aggregates, joins, subqueries, CTEs, set
  operations, CASE, NULL logic, window functions, recursive CTEs. No DDL, no writes, no design.
- Runner: Pyodide's built-in `sqlite3`. The learner writes one SQL statement; the runner wraps it
  as a Python string; a SQL harness loads the fixture into an in-memory database and reports
  through `check()`. No sql.js, no second worker.
- One fixture database for the whole course: Halden's internal dump plus the Ledger.
- Story sits after The Blueprint. Card "The Books", stats `filter`, `join`, `shape`.
- Same size as the other new courses: five arcs of four gates, eighteen lessons, six tools.
- No `scene` anywhere.
- Display order: algorithms, oop, patterns, sql.

## Non-goals

- No writes (INSERT/UPDATE/DELETE), no DDL, no transactions, no indexes.
- No second runtime, no new npm dependency.
- No changes to the table (`src/scene/`) or to other courses' content.
- No SQL-specific step types; trace, spot, blank and mini are reused.

## Architecture

```
src/
  runner.js                 runTests(code, tests, runner = 'python'); wraps code and picks the
                            harness bundle by runner; same worker, same result shape
  pyworker.js               unchanged
  harness.py                unchanged (check(), __results)
  courses/index.js          RUNNERS = ['python', 'sql']; COURSES = [algorithms, oop, patterns, sql]
  courses/sql/
    course.js               id 'sql', title 'The Books', algo 'SQL', runner 'sql', stats
    fixture.sql             the one database: schema + rows
    harness_sql.py          SQL helpers over sqlite3, used by every test string
    gates.js, tests.js, index.js, training/ (nodes, tools/)
  store.js                  passes course.runner to runTests; exposes `runner` to components
  components/
    QuestWindow.vue, StepCode.vue, StepTrace.vue   wording keyed on runner
scripts/
  solutions/sql/arc1.sql … arc5.sql, training/<id>.sql    blocks "-- === <id>"
  test-solutions.mjs        for runner 'sql': .sql solution files, SQL wrap, same python proof
  check-gates.mjs           unchanged (RUNNERS check already there)
```

### The runner switch

`runTests(code, tests, runner = 'python')`:

- `python`: unchanged. Worker receives `{ code, harness, tests }`.
- `sql`: `code` becomes `__sql = r'''<learner text>'''` with any `'''` in the text replaced by
  `''' "'''" r'''`; `harness` becomes `harness.py` + `\n__fixture = r'''<fixture.sql>'''\n` +
  `harness_sql.py`. The worker is unchanged: it runs code, harness, tests in one namespace.

`runtime` (cold/loading/ready/running/failed) is shared: one worker serves both runners.
`warm()` unchanged. Timeout and kill-on-timeout unchanged, so a runaway recursive CTE is
terminated like an infinite Python loop.

The store reads `course.value.runner` and passes it in both `runStepTests` and `test(g)`.
`runner` is exposed on the store for components.

### The SQL harness (`harness_sql.py`)

Runs after `harness.py` in the same namespace; `__sql` and `__fixture` are defined.

```python
import sqlite3

def _t_db(extra=None):
    con = sqlite3.connect(':memory:')
    con.executescript(__fixture)
    if extra:
        con.executescript(extra)
    return con

def rows(sql, extra=None):
    """Run a reference query against a fresh fixture copy. Returns a list of tuples."""
    return _t_db(extra).execute(sql).fetchall()

def learner(extra=None):
    """Run the learner's statement. Exactly one statement; raises the sqlite3 error otherwise."""
    return _t_db(extra).execute(__sql).fetchall()

def learner_cols():
    cur = _t_db().execute(__sql)
    return [d[0] for d in cur.description]

def check_query(label, ref_sql, ordered=False, extra=None):
    """Compare the learner's rows with the reference rows. Unordered by default."""
    def got():
        g = learner(extra)
        return g if ordered else sorted(g, key=repr)
    w = rows(ref_sql, extra)
    check(label, got, w if ordered else sorted(w, key=repr))

def check_cols(label, names):
    check(label, learner_cols, list(names))
```

Rules for test strings (in `tests.js`, Python, same as today):
- At least one `check_query` against the untouched fixture and one with `extra` rows inserted
  (so a hard-coded answer fails), plus `check_cols` when the mission names the columns.
- `ordered=True` only when the mission says the order matters.
- Row values are compared as sqlite3 returns them: ints, floats, strings, None.
- Helper names start with `_t_` as before; `rows`, `learner`, `learner_cols`, `check_query`,
  `check_cols` are the harness's public names and may not be shadowed by tests.
- A learner statement that is not a single SELECT fails with sqlite3's own message, which
  `check()` reports as a failed check.

### The fixture (`fixture.sql`)

One schema, six tables, deterministic small data (10–40 rows each), dates as ISO strings,
amounts as integers (pence). Every gate and drill queries this database; tests may add rows
through `extra`, never change the shipped file's meaning.

```sql
CREATE TABLE staff    (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, hired TEXT, manager_id INTEGER);
CREATE TABLE accounts (id INTEGER PRIMARY KEY, holder TEXT, kind TEXT, branch TEXT, opened TEXT);
CREATE TABLE transfers(id INTEGER PRIMARY KEY, from_acct INTEGER, to_acct INTEGER, amount INTEGER, at TEXT);
CREATE TABLE badges   (id INTEGER PRIMARY KEY, staff_id INTEGER, door TEXT, at TEXT, direction TEXT);
CREATE TABLE cameras  (id INTEGER PRIMARY KEY, floor INTEGER, zone TEXT, installed TEXT);
CREATE TABLE payments (id INTEGER PRIMARY KEY, payer TEXT, payee TEXT, amount INTEGER, paid_on TEXT, note TEXT);
```

`staff` has a manager chain at least four deep (for the recursive gate), one staff row with a
NULL `manager_id` and one with a NULL `dept`. `accounts` has holders with no transfers. `badges`
covers night and day, both directions, one door with a clear maximum. `transfers` spans several
days with an obvious mean and outliers. `payments` is the Ledger: payers and payees overlap
partly (for UNION/EXCEPT), some notes NULL. `cameras` has several per floor.

### Presentation keyed on `runner`

- `QuestWindow.vue` and `StepCode.vue`: editor label "Your SQL" and placeholder
  `-- write your query here` when the course runner is `sql`; loading text "Loading the
  database…" (the download is still Pyodide, the copy says what it is for).
- `StepTrace.vue`: "Query:" instead of "Call:" and "type the value as Python would print it
  (rows come back as tuples)".
- Everything else (TestResults, blank, spot, mini, the Armoury, ranks) unchanged.

### Proofs and validators

- `test-solutions.mjs`: for a course with `runner === 'sql'`, solution files are `.sql` with
  blocks `-- === <id>` (gates in `scripts/solutions/sql/arc1.sql` … `arc5.sql`, drills in
  `scripts/solutions/sql/training/<node-id>.sql` with `-- === <node-id>/<step>`), the solution
  is wrapped exactly as the runner wraps it, the harness bundle is the same, and the proof runs
  with local `python` (stdlib `sqlite3`). The block-splitting regex accepts both `# ===` and
  `-- ===`.
- `check-gates.mjs`, `check-training.mjs`: unchanged rules. `tests/courses.test.mjs` asserts the
  four-course order, `RUNNERS` containing `sql`, and no `scene` outside algorithms.
- A new unit test `tests/runner.test.mjs` covers the pure wrap function (exported from
  `runner.js` as `wrapSql`): plain text, text containing `'''`, and empty text.

## The course

### Card

id `sql`, title **The Books**, algo `SQL`, runner `sql`, stats `['filter', 'join', 'shape']`.

- `filter`: WHERE, ORDER BY, DISTINCT, CASE, NULL logic, subqueries used as filters.
- `join`: joins of every kind, self joins, set operations, recursive CTEs.
- `shape`: aggregates, GROUP BY and HAVING, date functions, window functions, capstone.

Titles by cleared gates: Nobody → Runner → Teller → Auditor → Examiner → Forensic → Master of
the Books (same `TITLES` construction). Tier blurbs: F "Ask the table." · E "Two tables, side by
side." · D "Pile them up." · C "A question inside a question." · B "Bands and lists." · A
"Running totals and ranks." · S "Climb the chain." Course blurbs: `${ARCS.length} jobs,
${GATES.length} gates. Halden's database is in the bag. The fence pays for answers, not rows.`
and `${NODES.length} lessons in the back room. Dax scrolls a spreadsheet; Marguerite asks the
database.`

### Story frame

After The Blueprint. The crew lifted more than the Ledger: a dump of Halden's internal database,
accounts, transfers, staff, badge swipes, cameras, and the Ledger's own payments. The fence pays
for answers, not rows. Dax exports every table to a spreadsheet and scrolls; Marguerite asks a
question; the learner writes the query. Arc V ends with the fence's last question answered and
the Books closed.

### Arcs and gates (20)

| Arc | Ranks | Theme |
|---|---|---|
| I The dump | F | one table: columns, filters, order, distinct, a count |
| II Who talks to whom | E–D | joins: inner, left with IS NULL, self, two joins with aliases |
| III The totals | D–C | GROUP BY, HAVING, top one, dates |
| IV Inside the question | C–B | scalar subquery, NOT EXISTS, CASE bands, UNION/EXCEPT |
| V The Books | A–S | window aggregate, ROW_NUMBER per partition, recursive CTE, capstone |

Gate list (id · rank · stat · title · algo):

Arc I — The dump
- `pullnames` · F · filter · Names off the list · SELECT, WHERE, ORDER BY. Staff names and depts in one dept, alphabetical.
- `bigmoves` · F · filter · The big moves · ORDER BY DESC, LIMIT. Top five transfers by amount.
- `nightdoors` · F · filter · Doors after dark · DISTINCT and ranges. Distinct doors swiped between 22:00 and 06:00.
- `howmany` · F · shape · How many · COUNT with a filter. Number of accounts of one kind.

Arc II — Who talks to whom
- `badgeowners` · E · join · Whose badge · INNER JOIN. Swipes with the staff name.
- `emptyaccounts` · E · join · Accounts nobody touched · LEFT JOIN … IS NULL. Accounts with no transfers.
- `chainofcommand` · D · join · Who reports to whom · Self join. Staff name beside manager name.
- `threeway` · D · join · Both ends of the wire · Two joins with aliases. Transfers with both holders' names.

Arc III — The totals
- `perdept` · D · shape · Heads per department · GROUP BY and COUNT.
- `heavyhitters` · C · shape · The heavy hitters · SUM and HAVING. Accounts that sent more than a threshold.
- `busiestdoor` · C · shape · The busiest door · GROUP BY, ORDER BY count, LIMIT 1.
- `byday` · C · shape · Day by day · date() and GROUP BY day. Transfers per day.

Arc IV — Inside the question
- `abovemean` · C · filter · Above the average · Scalar subquery. Transfers above the mean.
- `neverswiped` · B · filter · Never swiped in · NOT EXISTS. Staff with no badge rows.
- `bucket` · B · filter · Small, medium, large · CASE. Transfers banded with a label.
- `twolists` · B · join · Two lists, one answer · UNION and EXCEPT. Everyone in the Ledger; payers who were never paid.

Arc V — The Books
- `runningtotal` · A · shape · The running total · Window aggregate. Cumulative payments by date.
- `toppercamera` · A · shape · Top per floor · ROW_NUMBER over a partition. Newest camera per floor.
- `reportsto` · A · join · Climb the chain · Recursive CTE. Everyone above a given staff member.
- `thebooks` · S · shape · The Books · Combining the pieces. CTE + join + window + CASE: per payee, total received, rank, and a band.

Rules: xp in band; an arc spans at most two adjacent ranks; no two neighbouring gates share an
`algo`; every mission names the columns to return and whether order matters; every test string
has an `extra` case; `code` on roughly every second gate in Arcs I–II shows the expected rows.

### Lessons (18)

| Tier | `algo` | Title | Tools | Prepares |
|---|---|---|---|---|
| F | SELECT and aliases | Pick the columns | table, select | pullnames |
| F | WHERE | Narrow it down | where | pullnames, bigmoves |
| F | ORDER BY and LIMIT | Line them up | order | bigmoves |
| F | COUNT and DISTINCT | Count what is there | select | nightdoors, howmany |
| F | NULL | Nothing is a value | null | emptyaccounts |
| E | INNER JOIN | Side by side | table | badgeowners |
| E | LEFT JOIN | Keep the ones with nobody | null | emptyaccounts |
| E | Self join | The table meets itself | table | chainofcommand, threeway |
| D | GROUP BY and HAVING | Pile them up | group | perdept, heavyhitters, busiestdoor |
| D | Date functions | The calendar | group | byday |
| C | Subqueries | A question inside a question | where | abovemean |
| C | NOT EXISTS | Who is missing | where | neverswiped |
| C | Common table expressions | Name the result first | select | thebooks |
| B | CASE | Sort into bands | null | bucket |
| B | UNION, EXCEPT, INTERSECT | Two lists, one answer | order | twolists |
| A | Window aggregates | The running total | group | runningtotal |
| A | Ranking windows | Rank within each | order | toppercamera |
| S | Recursive CTEs | Climb the chain | table | reportsto, thebooks |

`requires` follows the table top to bottom within a tier and the natural chain across tiers
(Pile them up requires Side by side; A question inside a question requires Pile them up; Climb
the chain requires Name the result first and The table meets itself). Every tool is required by
at least one lesson.

Step shape: two explains (Dax's spreadsheet, then the query with a code block), trace (frames
walk the clauses: after FROM → row count, after WHERE → rows, after GROUP BY → groups, after
ORDER/LIMIT → result; values as ints or Python lists of tuples), spot, blank (SQL with `___`),
mini (a query). No `scene`.

### Armoury (6 tools)

| id | title | algo | drills |
|---|---|---|---|
| `tool-table` | The ledger page | Table | rows, columns, types, `SELECT *`, `LIMIT`, reading a schema |
| `tool-select` | Just these columns | SELECT | column lists, aliases, expressions, DISTINCT |
| `tool-where` | The sieve | WHERE | `=`, `<>`, `IN`, `BETWEEN`, `LIKE`, `AND`/`OR`/`NOT` |
| `tool-order` | In this order | ORDER BY | multi-key, `DESC`, `LIMIT`/`OFFSET`, ties |
| `tool-group` | The tally | GROUP BY | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, one grouping key |
| `tool-null` | The blank cell | NULL | `IS NULL`, three-valued logic, `COALESCE`, `NULL` in aggregates |

Schema unchanged: explain, explain, trace, blank; xp 30. Tool prose may name its own clause.

### Prose rule for this course

- SQL keywords are code and allowed anywhere: `SELECT`, `JOIN`, `GROUP BY`, `OVER`, `WITH`.
- Banned from explain lines, missions and hints: aggregate, subquery, window function, common
  table expression, CTE (as a word), recursive, predicate, projection, cardinality,
  normalisation. They live in `algo`, spot options and a spot's `problem`/`why`.
- Marguerite says "pile them up", "a question inside a question", "the running total", "climb
  the chain".

## Testing

- `tests/runner.test.mjs`: `wrapSql` cases.
- `tests/courses.test.mjs`: four-course order, `RUNNERS` includes `sql`, sql course runner is
  `sql`, no `scene` outside algorithms.
- `npm run check`, `npm test` over four courses; the three Python courses' counts unchanged.
- Browser check on the production build: fresh slot → Jobs → The Books → a gate with the
  reference query passes in Pyodide (sqlite3 imports, fixture loads); a wrong query shows got
  and want rows; two statements fail with sqlite3's message; a training lesson's blank and mini
  pass; switch to another course and back; reload; no three.js chunk.

## Rollout

Four plans, one branch each:

1. **Runner and Arc I.** `wrapSql` and the runner switch, `harness_sql.py`, `fixture.sql`, store
   and presentation wording, `test-solutions.mjs` SQL branch, registry, course skeleton, Arc I
   (four gates), `tool-table`, reference solutions, tests.
2. **Kit and heist.** Five more tools, Arcs II–V (sixteen gates), solutions.
3. **Lessons F–D** (ten lessons).
4. **Lessons C–S** (eight lessons), CLAUDE.md layout, story and prose rule, spec status.

## Risks

- Pyodide's `sqlite3` version must have window functions and recursive CTEs (SQLite ≥ 3.25;
  Pyodide 0.26 ships 3.4x). Plan 1 verifies in the browser before Arc V is written.
- Unordered comparison sorts by `repr`, which is stable for ints, floats, strings and None.
  Floats from `AVG` are compared exactly; missions that average use `ROUND(..., 2)`.
- The fixture is shared by every drill, so a change to it can silently break many tests. It is
  frozen after plan 1; tests add rows through `extra` instead.
- The raw import of `fixture.sql` and `harness_sql.py` (`?raw`) follows the existing
  `harness.py?raw` pattern; the proof script reads them from disk.
