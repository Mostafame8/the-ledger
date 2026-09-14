# The Books — plan 3: lessons F–D — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open the training room of "The Books" with its first ten lessons — five at tier F, three at E, two at D — each with a trace, a spot, a blank and a mini proven by reference SQL, so every one of the course's six armoury tools sits behind a lesson and the SQL course has a rank ladder of its own.

**Architecture:** Content only. One file per lesson in `src/courses/sql/training/`, listed in that folder's `index.js` (which today exports `NODES = []`). Each lesson is a `node(...)` from `src/training/node.js` with six steps in the fixed order explain, explain, trace, spot, blank, mini. The two drills per lesson (blank and mini) get reference queries in `scripts/solutions/sql/training/<node-id>.sql`, headed `-- === <node-id>/4` and `-- === <node-id>/5`. No engine, runner, store, component, gate or tool changes.

**Tech Stack:** Plain JS content modules, SQLite (Python's `sqlite3` for proofs, Pyodide's in the browser), Vue 3 shell untouched.

**Spec:** `docs/superpowers/specs/2026-09-12-sql-course-design.md` (the "Lessons (18)" table; this plan ships its first ten rows)

## Global Constraints

- **The fixture `src/courses/sql/fixture.sql` is frozen.** Never edit it. Drill tests add rows through `extra=` only.
- Lesson schema, from `src/training/node.js`: `node(id, { tier, xp, requires, gates, tools, title, algo, steps })`.
  - `id` lowercase kebab-case, unique against every other lesson id, gate id and tool id in this course.
  - `tier` F–S with `xp` in the tier's band: F 40–60, E 60–80, D 90–100.
  - `requires` lesson ids; `gates` the gate ids the lesson prepares (never empty); `tools` at most two `tool-…` ids.
  - `title` is a scene name, `algo` the plain technique name.
  - Steps in order: `explain, explain, trace, spot, blank, mini` — the validator rejects any other shape.
- Step rules the validator enforces (`scripts/check-training.mjs`): each `explain` has 2–5 lines; at least one explain line in the lesson starts with a curly opening quote `“`; each `trace` has 3+ frames, each `{ line, state, ask, note }` with `line` 1-based into that trace's own `code` and `ask` naming a key of `state`; each `spot` has 3–4 options and an in-range `answer`; `blank` and `mini` each carry 4–7 **literal** `check(` calls — `check_cols(` and `check_query(` do **not** count toward that number — and a `blank` template must contain `___`.
- A `mini`'s `mission` must contain a function-shaped token matching `/\b[a-z_][a-z0-9_]*\(/`. In this course that is the lowercase SQL function the answer needs — `upper(payee)`, `lower(dept)`, `time(at)`, `count(distinct door)`, `coalesce(dept, 'unassigned')`, `sum(amount)`, `strftime('%Y-%m', paid_on)`. Every mini below is built around one; keep it in the mission text.
- **No step in this course sets `scene`.** Three.js never loads here.
- Content order inside a lesson: explain 1 is Dax's brute force, explain 2 shows the pattern and carries the `code` block; then trace, spot, blank, mini.
- Prose rule: SQL keywords are code and allowed anywhere (`SELECT`, `JOIN`, `GROUP BY`, `HAVING`, `DISTINCT`, `NULL`). Banned from explain lines, missions and hints: aggregate, subquery, window function, common table expression, CTE, recursive, predicate, projection, cardinality, normalisation. They live in `algo` and in `spot` options, a spot's `problem` and its `why`.
- Story: the room above the laundromat, between jobs. Marguerite teaches; Dax scrolls a spreadsheet and does it by hand; the fence pays for answers. Voice short, wry, concrete. No real anime, manga, game or their characters.
- Drill tests are Python strings using `check_query(label, ref_sql, ordered=False, extra=None)`, `check_cols(label, names)`, `rows(sql, extra=None)`, `learner(extra=None)`, `learner_cols()` from `src/courses/sql/harness_sql.py`, plus `check()` from `src/harness.py`. Give every drill one `check_cols`, one `check_query` on the untouched fixture, one `check_query` with `extra=` rows, and four literal `check(` calls. `ordered=True` only when the drill's intro or mission fixes an order. Helper names start with `_t_`.
- Reference solutions: `scripts/solutions/sql/training/<node-id>.sql`, one bare statement per block, blocks headed `-- === <node-id>/4` (the blank) and `-- === <node-id>/5` (the mini).
- Do not edit `course.js`, the course-level `index.js`, `gates.js`, `tests.js`, `fixture.sql`, `harness_sql.py`, `src/sqlwrap.js`, `src/runner.js`, any component, anything under `src/courses/algorithms|oop|patterns`, or anything under `src/courses/sql/training/tools/`.
- Baseline before this plan (merge commit `0c35a95` on `main`): 138 gates, 188 training drills, 2093 checks, 80 training nodes, 30 tools, 117 unit tests all green.
- **Expected red while this plan runs.** `tests/training-tools.test.mjs` asserts that every tool in a course is required by at least one of its lessons, and skips a course whose `NODES` is empty. The moment Task 1 lists the first lesson that skip stops applying, and `tool-null` (first required in Task 2) and `tool-group` (first required in Task 4) are not yet referenced. So `npm test` has exactly one failing test from Task 1 until Task 4 lands `the-calendar`, where it goes green again. `npm run check` and `node scripts/test-solutions.mjs` must be green at the end of every task.
- Commit messages end with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Branch `sql-lessons-f-d` off `main`.

---

## File structure

| Path | Responsibility |
|---|---|
| `src/courses/sql/training/pick-columns.js` | F lesson: SELECT and aliases. |
| `src/courses/sql/training/narrow-it-down.js` | F lesson: WHERE. |
| `src/courses/sql/training/line-them-up.js` | F lesson: ORDER BY and LIMIT. |
| `src/courses/sql/training/count-what-is-there.js` | F lesson: COUNT and DISTINCT. |
| `src/courses/sql/training/nothing-is-a-value.js` | F lesson: NULL. |
| `src/courses/sql/training/side-by-side.js` | E lesson: INNER JOIN. |
| `src/courses/sql/training/keep-the-empty.js` | E lesson: LEFT JOIN. |
| `src/courses/sql/training/table-meets-itself.js` | E lesson: self join. |
| `src/courses/sql/training/pile-them-up.js` | D lesson: GROUP BY and HAVING. |
| `src/courses/sql/training/the-calendar.js` | D lesson: date functions. |
| `src/courses/sql/training/index.js` | Imports the lessons and exports `NODES` in display order. |
| `scripts/solutions/sql/training/<node-id>.sql` (ten files) | Reference query per drill. |

The lesson chain (each lesson `requires` the one above it, which is the spec's table order):

| # | id | tier / xp | title | algo | tools | gates |
|---|---|---|---|---|---|---|
| 1 | `pick-columns` | F / 40 | Pick the columns | SELECT and aliases | `tool-table`, `tool-select` | `pullnames` |
| 2 | `narrow-it-down` | F / 45 | Narrow it down | WHERE | `tool-where` | `pullnames`, `bigmoves` |
| 3 | `line-them-up` | F / 50 | Line them up | ORDER BY and LIMIT | `tool-order` | `bigmoves` |
| 4 | `count-what-is-there` | F / 55 | Count what is there | COUNT and DISTINCT | `tool-select` | `nightdoors`, `howmany` |
| 5 | `nothing-is-a-value` | F / 60 | Nothing is a value | NULL | `tool-null` | `emptyaccounts` |
| 6 | `side-by-side` | E / 60 | Side by side | INNER JOIN | `tool-table` | `badgeowners` |
| 7 | `keep-the-empty` | E / 70 | Keep the ones with nobody | LEFT JOIN | `tool-null` | `emptyaccounts` |
| 8 | `table-meets-itself` | E / 80 | The table meets itself | Self join | `tool-table` | `chainofcommand`, `threeway` |
| 9 | `pile-them-up` | D / 90 | Pile them up | GROUP BY and HAVING | `tool-group` | `perdept`, `heavyhitters`, `busiestdoor` |
| 10 | `the-calendar` | D / 100 | The calendar | Date functions | `tool-group` | `byday` |

Every number and tuple asserted below was run against the frozen fixture before this plan was written. Facts they lean on: 12 staff (id 1 has no manager, id 11 has no dept), 10 accounts, 14 transfers, 17 badge swipes across 4 doors (lobby 6, vault 5, loading-bay 3, server-room 2), 8 cameras, 12 payments across 3 months.

---

### Task 1: The first three F lessons, and the lesson list

**Files:**
- Create: `src/courses/sql/training/pick-columns.js`, `narrow-it-down.js`, `line-them-up.js`
- Create: `scripts/solutions/sql/training/pick-columns.sql`, `narrow-it-down.sql`, `line-them-up.sql`
- Modify: `src/courses/sql/training/index.js`

**Interfaces:**
- Consumes `node`, `explain`, `trace`, `spot`, `blank`, `mini` from `src/training/node.js`, and the tool ids `tool-table`, `tool-select`, `tool-where`, `tool-order` already in the armoury.
- Produces lesson ids `pick-columns`, `narrow-it-down`, `line-them-up`. Tasks 2–4 append to the same `index.js` list and chain their `requires` onto `line-them-up`.

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull --ff-only && git checkout -b sql-lessons-f-d
```

- [ ] **Step 2: Create `src/courses/sql/training/pick-columns.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('pick-columns', {
  tier: 'F', xp: 40, requires: [], gates: ['pullnames'],
  tools: ['tool-table', 'tool-select'],
  title: 'Pick the columns', algo: 'SELECT and aliases',
  steps: [
    explain([
      'The fence wants two things out of the Ledger: who was paid, and how much in pounds. Dax exports the whole payments table, all six columns, and starts deleting the four she did not ask for.',
      'Halfway down he deletes a column she did want, undoes it twice, and hands her a sheet with a header that says amount when the numbers under it are pence.',
      '“She reads column names,” Marguerite says. “Ask for the columns she asked for, in the order she asked for them, under the names she uses.”',
    ], { move: 'brute force' }),
    explain([
      '“The list after SELECT is the shape of the answer. Each thing in it can be a column, or a piece of arithmetic, and each one can be given a name with AS.”',
      '“Amounts are pence, so amount / 100 is pounds. Two whole numbers divide to a whole number here, and the pennies are gone.”',
    ], { move: 'pick the pattern', code:
`SELECT payee, amount FROM payments LIMIT 2;
-- ('Otto Kline', 50000)
-- ('Ruth Ash', 30000)

SELECT payee, amount / 100 AS pounds FROM payments LIMIT 2;
-- ('Otto Kline', 500)
-- ('Ruth Ash', 300)` }),
    trace(
`SELECT payee, amount / 100 AS pounds
FROM payments
LIMIT 3`,
      'the query above',
      [
        { line: 2, state: { rows: 12 }, ask: 'rows', note: 'FROM puts every payment on the bench. Twelve rows, six columns each.' },
        { line: 1, state: { rows: 12, cols: ['payee', 'pounds'] }, ask: 'cols', note: 'The answer keeps two things: a column as it stands, and a piece of arithmetic with a name of its own.' },
        { line: 3, state: { rows: 12, cols: ['payee', 'pounds'], returns: { py: "[('Otto Kline', 500), ('Ruth Ash', 300), ('Otto Kline', 200)]" } }, ask: 'returns', note: 'LIMIT keeps the first three rows as stored. 50000 pence reads back as 500.' },
      ]),
    spot('The fence asked for the payee and the amount in pounds. Dax sends her SELECT * FROM payments. What lands on her desk?',
      ['Two columns, the money already in pounds',
       'Every column, the money still in pence, and four more columns she has to read past',
       'An error, because * is not a column name',
       'The payee column only'],
      1, 'A star means every column of the table, in the table\'s own order, under the table\'s own names. It is a way to look at a table, not a way to answer a question.'),
    blank('“Every account holder and the branch they bank at — but she calls a branch a zone.”',
`SELECT holder, branch ___ zone FROM accounts`,
`check_cols("two columns, holder then zone", ['holder', 'zone'])
check_query("every holder and their branch", "SELECT holder, branch AS zone FROM accounts")
check_query("a new account arrives", "SELECT holder, branch AS zone FROM accounts",
            extra="INSERT INTO accounts VALUES (99, 'Vela Ord', 'personal', 'east', '2026-01-01');")
check("ten rows on the shipped dump", lambda: len(learner()), 10)
check("the first is Corvin Holdings in the north", lambda: learner()[0], ('Corvin Holdings', 'north'))
check("the second column answers to zone", lambda: learner_cols()[1], 'zone')
check("no blank branches", lambda: all(z for _, z in learner()), True)`),
    mini('Return every payment three ways over: the payee, the payee in capitals as loud with upper(payee), and the amount in whole pounds. Three columns named payee, loud and pounds, any order.',
      'Three things in the SELECT list, comma between, each with a name of its own. Whole numbers divide to whole numbers, which is what she wants.',
`check_cols("three columns, payee then loud then pounds", ['payee', 'loud', 'pounds'])
check_query("every payment, named and converted", "SELECT payee, upper(payee) AS loud, amount / 100 AS pounds FROM payments")
check_query("a new payment joins", "SELECT payee, upper(payee) AS loud, amount / 100 AS pounds FROM payments",
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Vela Ord', 250000, '2026-03-08', NULL);")
check("twelve rows on the shipped dump", lambda: len(learner()), 12)
check("Otto Kline's fifty thousand reads as five hundred", lambda: ('Otto Kline', 'OTTO KLINE', 500) in learner(), True)
check("every loud name shouts", lambda: all(l == l.upper() for _, l, _ in learner()), True)
check("the pennies are gone", lambda: all(isinstance(p, int) for _, _, p in learner()), True)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/pick-columns.sql`:

```sql
-- Reference solutions for lesson pick-columns. Blocks: "-- === <node-id>/<step-index>".

-- === pick-columns/4
SELECT holder, branch AS zone FROM accounts

-- === pick-columns/5
SELECT payee, upper(payee) AS loud, amount / 100 AS pounds FROM payments
```

- [ ] **Step 3: Create `src/courses/sql/training/narrow-it-down.js`**

```js
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
```

Reference solutions `scripts/solutions/sql/training/narrow-it-down.sql`:

```sql
-- Reference solutions for lesson narrow-it-down. Blocks: "-- === <node-id>/<step-index>".

-- === narrow-it-down/4
SELECT holder FROM accounts WHERE kind = 'personal' AND branch <> 'harbour'

-- === narrow-it-down/5
SELECT name FROM staff WHERE lower(dept) = 'vault' ORDER BY name
```

- [ ] **Step 4: Create `src/courses/sql/training/line-them-up.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('line-them-up', {
  tier: 'F', xp: 50, requires: ['narrow-it-down'], gates: ['bigmoves'],
  tools: ['tool-order'],
  title: 'Line them up', algo: 'ORDER BY and LIMIT',
  steps: [
    explain([
      '“The three smallest moves,” the fence says, “the ones nobody would look at twice.” Dax reads the amounts down the page, holds three numbers in his head, and swaps one out every time something smaller turns up.',
      'By the bottom of the page he has two of the three right and no idea which two.',
      '“Say the order out loud and take from the top,” Marguerite says. “The table will hold all fourteen in its head. You will not.”',
    ], { move: 'brute force' }),
    explain([
      '“A table keeps no order of its own. Without ORDER BY, whatever came back came back by accident and can come back differently tomorrow.”',
      '“ORDER BY names the column to sort on, DESC turns it upside down, and LIMIT takes from the top of whatever order you asked for. Ask for the order first, or you are taking from an accident.”',
    ], { move: 'pick the pattern', code:
`SELECT name, hired FROM staff ORDER BY hired DESC LIMIT 2;
-- ('Ana Petrov', '2023-08-08')
-- ('Bo Lund', '2022-04-04')

SELECT id, amount FROM transfers ORDER BY amount LIMIT 2;
-- (9, 4500)
-- (14, 8000)` }),
    trace(
`SELECT id, amount
FROM transfers
ORDER BY amount
LIMIT 3`,
      'the query above',
      [
        { line: 2, state: { rows: 14 }, ask: 'rows', note: 'Fourteen transfers on the bench, in whatever order the table holds them.' },
        { line: 3, state: { rows: 14, smallest: { py: '(9, 4500)' } }, ask: 'smallest', note: 'ORDER BY sorts all fourteen. Nothing has been dropped yet — the smallest is simply on top now.' },
        { line: 4, state: { rows: 14, smallest: { py: '(9, 4500)' }, returns: { py: '[(9, 4500), (14, 8000), (4, 9000)]' } }, ask: 'returns', note: 'LIMIT takes three off the top of the order you asked for.' },
      ]),
    spot('Dax writes SELECT id, amount FROM transfers LIMIT 3 and calls it the three smallest. What has he actually got?',
      ['The three smallest, since tables keep their rows sorted',
       'Three rows the table happened to hand over first, which may change tomorrow',
       'An error, because LIMIT needs ORDER BY',
       'The three largest'],
      1, 'LIMIT takes from whatever order it is given, and without ORDER BY that order is nobody\'s promise. It can change when rows are inserted, deleted, or the file is rebuilt.'),
    blank('“The two oldest hires in the building: the name, and the day they started.”',
`SELECT name, hired FROM staff ORDER BY ___ ___ 2`,
`check_cols("two columns, name then hired", ['name', 'hired'])
check_query("the two longest-serving", "SELECT name, hired FROM staff ORDER BY hired LIMIT 2", ordered=True)
check_query("an older hand turns up in the files", "SELECT name, hired FROM staff ORDER BY hired LIMIT 2", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', 'board', '1999-01-01', NULL);")
check("exactly two rows", lambda: len(learner()), 2)
check("Halden Voss started first", lambda: learner()[0], ('Halden Voss', '2001-03-01'))
check("oldest first", lambda: [h for _, h in learner()] == sorted(h for _, h in learner()), True)
check("the newest hire is nowhere near this", lambda: ('Ana Petrov', '2023-08-08') in learner(), False)`),
    mini('Return the three most recent badge swipes as two columns named door and clock, where clock is the time of day pulled out of the timestamp with time(at). Most recent first. Order matters.',
      'The timestamps sort as text because the year is written first. Sort on the whole stamp, take three, and cut the clock out only in the answer.',
`check_cols("two columns, door then clock", ['door', 'clock'])
check_query("the last three swipes of the log", "SELECT door, time(at) AS clock FROM badges ORDER BY at DESC LIMIT 3", ordered=True)
check_query("a later swipe pushes the rest down", "SELECT door, time(at) AS clock FROM badges ORDER BY at DESC LIMIT 3", ordered=True,
            extra="INSERT INTO badges VALUES (99, 2, 'roof', '2026-03-09 11:11', 'in');")
check("exactly three rows", lambda: len(learner()), 3)
check("the lobby at half six is the latest", lambda: learner()[0], ('lobby', '18:30:00'))
check("the vault swipe sits in the middle", lambda: learner()[1][0], 'vault')
check("every clock carries its seconds", lambda: all(len(c) == 8 for _, c in learner()), True)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/line-them-up.sql`:

```sql
-- Reference solutions for lesson line-them-up. Blocks: "-- === <node-id>/<step-index>".

-- === line-them-up/4
SELECT name, hired FROM staff ORDER BY hired LIMIT 2

-- === line-them-up/5
SELECT door, time(at) AS clock FROM badges ORDER BY at DESC LIMIT 3
```

- [ ] **Step 5: List the lessons** — `src/courses/sql/training/index.js` becomes:

```js
// Training content for the sql course, in display order: F to S, prerequisites first within a
// tier. Add a lesson file, import it, append it here.
import pickColumns from './pick-columns.js'
import narrowItDown from './narrow-it-down.js'
import lineThemUp from './line-them-up.js'
export { TIERS } from '../../../training/progress.js'
export { TOOLS, TOOL_BY_ID } from './tools/index.js'

export const NODES = [
  pickColumns, narrowItDown, lineThemUp,
]
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
```

- [ ] **Step 6: Validate and prove**

```bash
npm run check
node scripts/test-solutions.mjs
npm test
```

Expected: `✓ 83 training nodes and 30 tools across 4 course(s) look good`; `✓ 138 gates, 194 training drills, … all reference solutions pass`; `npm test` with **exactly one** failing test — `tests/training-tools.test.mjs` on tool coverage, because `tool-null` and `tool-group` have no lesson yet. That failure is expected through Task 3 and clears in Task 4. If any other test fails, stop and report.

- [ ] **Step 7: Commit**

```bash
git add src/courses/sql/training scripts/solutions/sql/training
git commit -m "content(sql): the first three F lessons — pick the columns, narrow it down, line them up"
```

---

### Task 2: The last two F lessons

**Files:**
- Create: `src/courses/sql/training/count-what-is-there.js`, `nothing-is-a-value.js`
- Create: `scripts/solutions/sql/training/count-what-is-there.sql`, `nothing-is-a-value.sql`
- Modify: `src/courses/sql/training/index.js`

**Interfaces:**
- Consumes `line-them-up` (as `requires`) and the tool ids `tool-select`, `tool-null`.
- Produces `count-what-is-there`, `nothing-is-a-value`. Task 3's first lesson requires `nothing-is-a-value`.

- [ ] **Step 1: Create `src/courses/sql/training/count-what-is-there.js`**

```js
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
```

Reference solutions `scripts/solutions/sql/training/count-what-is-there.sql`:

```sql
-- Reference solutions for lesson count-what-is-there. Blocks: "-- === <node-id>/<step-index>".

-- === count-what-is-there/4
SELECT DISTINCT door FROM badges

-- === count-what-is-there/5
SELECT COUNT(DISTINCT door) AS doors FROM badges
```

- [ ] **Step 2: Create `src/courses/sql/training/nothing-is-a-value.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('nothing-is-a-value', {
  tier: 'F', xp: 60, requires: ['count-what-is-there'], gates: ['emptyaccounts'],
  tools: ['tool-null'],
  title: 'Nothing is a value', algo: 'NULL',
  steps: [
    explain([
      'One staff row in the dump has an empty department. Dax types the word none into the gap so the sheet looks tidy, and now the crew\'s copy says something the bank\'s copy does not.',
      'He goes looking for the gap again later with dept = \'\' and then with dept = NULL, and both come back with nothing at all, which he reads as proof that he fixed it.',
      '“An empty cell is a value and its name is NULL,” Marguerite says. “It means nobody wrote it down. It is not an empty word and it is not a zero, and it answers only two questions.”',
    ], { move: 'brute force' }),
    explain([
      '“dept = NULL is never true. Neither is dept <> NULL. Unknown compared with anything stays unknown, and unknown never gets through a sieve.”',
      '“The two questions it does answer are IS NULL and IS NOT NULL. To print a blank without lying about the table, COALESCE hands back the first thing that is not blank.”',
    ], { move: 'pick the pattern', code:
`SELECT name FROM staff WHERE dept IS NULL;
-- ('Bo Lund',)

SELECT name FROM staff WHERE dept = NULL;
-- (no rows at all)

SELECT name, COALESCE(dept, 'unassigned') AS dept FROM staff WHERE id = 11;
-- ('Bo Lund', 'unassigned')` }),
    trace(
`SELECT COUNT(*) AS rows_all,
       COUNT(dept) AS with_dept
FROM staff`,
      'the query above',
      [
        { line: 3, state: { rows: 12 }, ask: 'rows', note: 'Twelve staff rows on the bench. Nothing is sieved out — there is no WHERE here.' },
        { line: 2, state: { rows: 12, with_dept: 11 }, ask: 'with_dept', note: 'COUNT of a column walks past the blanks. One row has nothing written in dept, so eleven.' },
        { line: 1, state: { rows: 12, with_dept: 11, returns: { py: '[(12, 11)]' } }, ask: 'returns', note: 'One row, two seats. The gap between the two numbers is exactly the number of blanks.' },
      ]),
    spot('Dax wants the staff with no department and writes WHERE dept = NULL. What comes back?',
      ['The one row with the blank department',
       'No rows at all, because unknown = unknown is not true',
       'Every row, because everything equals unknown',
       'An error — NULL cannot appear in a WHERE'],
      1, 'Comparing with NULL gives neither true nor false but unknown, and only true gets through the sieve. IS NULL is the question that gets a straight answer.'),
    blank('“The one name the dump never gave a department.”',
`SELECT name FROM staff WHERE dept ___ ___`,
`check_cols("one column named name", ['name'])
check_query("the staff member with no department", "SELECT name FROM staff WHERE dept IS NULL")
check_query("a second blank joins the first", "SELECT name FROM staff WHERE dept IS NULL",
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', NULL, '2026-01-01', 2);")
check("one row on the shipped dump", lambda: len(learner()), 1)
check("it is Bo Lund", lambda: learner()[0], ('Bo Lund',))
check("the man at the top is not in it", lambda: ('Halden Voss',) in learner(), False)
check("the other eleven have one written down", lambda: len(rows("SELECT name FROM staff WHERE dept IS NOT NULL")), 11)`),
    mini('Return every staff member with their department, printing the word unassigned where the dump wrote nothing — coalesce(dept, \'unassigned\'). Two columns named name and dept, by id. Order matters.',
      'COALESCE hands back the first thing that is not blank, so the answer reads cleanly while the table keeps its gap. The order is the table\'s own id.',
`check_cols("two columns, name then dept", ['name', 'dept'])
check_query("every staff member, blanks printed", "SELECT name, COALESCE(dept, 'unassigned') AS dept FROM staff ORDER BY id", ordered=True)
check_query("a new blank prints the same way", "SELECT name, COALESCE(dept, 'unassigned') AS dept FROM staff ORDER BY id", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', NULL, '2026-01-01', 2);")
check("twelve rows on the shipped dump", lambda: len(learner()), 12)
check("Bo Lund reads unassigned", lambda: dict(learner())['Bo Lund'], 'unassigned')
check("Halden Voss still reads board", lambda: dict(learner())['Halden Voss'], 'board')
check("nothing blank survives in the answer", lambda: all(d is not None for _, d in learner()), True)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/nothing-is-a-value.sql`:

```sql
-- Reference solutions for lesson nothing-is-a-value. Blocks: "-- === <node-id>/<step-index>".

-- === nothing-is-a-value/4
SELECT name FROM staff WHERE dept IS NULL

-- === nothing-is-a-value/5
SELECT name, COALESCE(dept, 'unassigned') AS dept FROM staff ORDER BY id
```

- [ ] **Step 3: Extend the lesson list** — in `src/courses/sql/training/index.js`, add the two imports and append the two ids to `NODES`:

```js
import countWhatIsThere from './count-what-is-there.js'
import nothingIsAValue from './nothing-is-a-value.js'
```

```js
export const NODES = [
  pickColumns, narrowItDown, lineThemUp, countWhatIsThere, nothingIsAValue,
]
```

- [ ] **Step 4: Validate and prove**

```bash
npm run check
node scripts/test-solutions.mjs
npm test
```

Expected: `✓ 85 training nodes and 30 tools across 4 course(s) look good`; `✓ 138 gates, 198 training drills, … all reference solutions pass`; `npm test` still failing only the tool-coverage test, now on `tool-group` alone.

- [ ] **Step 5: Commit**

```bash
git add src/courses/sql/training scripts/solutions/sql/training
git commit -m "content(sql): F lessons — count what is there, nothing is a value"
```

---

### Task 3: The E tier — three joins

**Files:**
- Create: `src/courses/sql/training/side-by-side.js`, `keep-the-empty.js`, `table-meets-itself.js`
- Create: `scripts/solutions/sql/training/side-by-side.sql`, `keep-the-empty.sql`, `table-meets-itself.sql`
- Modify: `src/courses/sql/training/index.js`

**Interfaces:**
- Consumes `nothing-is-a-value` (as `requires`) and the tool ids `tool-table`, `tool-null`.
- Produces `side-by-side`, `keep-the-empty`, `table-meets-itself`. Task 4's first lesson requires `table-meets-itself`.

- [ ] **Step 1: Create `src/courses/sql/training/side-by-side.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('side-by-side', {
  tier: 'E', xp: 60, requires: ['nothing-is-a-value'], gates: ['badgeowners'],
  tools: ['tool-table'],
  title: 'Side by side', algo: 'INNER JOIN',
  steps: [
    explain([
      'The badge log says staff id 5 opened the server room at a quarter past eleven at night. The fence does not know who staff id 5 is and has no intention of learning.',
      'Dax opens both tables on the same screen, one above the other, and types names into the badge rows by hand. Eleven rows in he types the wrong one and does not notice for twenty minutes.',
      '“The badge already carries the id and the staff table is kept by that id,” Marguerite says. “Say that once and every name arrives at the same time.”',
    ], { move: 'brute force' }),
    explain([
      '“JOIN puts a second table beside the first and ON says which value has to match. Each row of the left finds the rows of the right that agree with it.”',
      '“Give each table a short alias so you can say which id you mean, because both tables have one. A row whose id matches nobody simply drops out — that is what makes this join the inner one.”',
    ], { move: 'pick the pattern', code:
`SELECT s.name, b.door, b.at
FROM badges b
JOIN staff s ON s.id = b.staff_id
LIMIT 2;
-- ('Ines Marr', 'vault', '2026-03-02 08:55')
-- ('Ines Marr', 'vault', '2026-03-02 17:10')` }),
    trace(
`SELECT s.name, b.door
FROM badges b
JOIN staff s ON s.id = b.staff_id
WHERE b.door = 'vault'`,
      'the query above',
      [
        { line: 2, state: { rows: 17 }, ask: 'rows', note: 'Seventeen swipes on the bench. No names on any of them yet.' },
        { line: 3, state: { rows: 17, paired: 17 }, ask: 'paired', note: 'Each swipe finds exactly one staff row with the matching id, so the count does not move. It gains columns, not rows.' },
        { line: 4, state: { rows: 17, paired: 17, returns: { py: "[('Ines Marr', 'vault'), ('Ines Marr', 'vault'), ('Priya Nand', 'vault'), ('Kit Ferro', 'vault'), ('Priya Nand', 'vault')]" } }, ask: 'returns', note: 'Five vault swipes survive the sieve, each one now carrying the name of whoever carried the badge.' },
      ]),
    spot('Dax writes FROM badges b JOIN staff s and forgets the ON. What does he get back?',
      ['The same seventeen rows, unnamed',
       'Every swipe paired with every staff member — 204 rows of nonsense',
       'An error; SQLite refuses a join with no ON',
       'Seventeen rows with the wrong names attached'],
      1, 'With nothing to match on, every row of one table is put beside every row of the other: 17 × 12. The ON is what turns that pile into an answer.'),
    blank('“The transfers over a million, with the name of the account that sent them.”',
`SELECT a.holder, t.amount FROM transfers t ___ accounts a ___ a.id = t.from_acct WHERE t.amount > 1000000`,
`check_cols("two columns, holder then amount", ['holder', 'amount'])
check_query("the two biggest moves and who sent them", "SELECT a.holder, t.amount FROM transfers t JOIN accounts a ON a.id = t.from_acct WHERE t.amount > 1000000")
check_query("a third giant joins them", "SELECT a.holder, t.amount FROM transfers t JOIN accounts a ON a.id = t.from_acct WHERE t.amount > 1000000",
            extra="INSERT INTO transfers VALUES (99, 5, 1, 2000000, '2026-03-08 09:00');")
check("two rows on the shipped dump", lambda: len(learner()), 2)
check("Sable Trust sent one and a half million", lambda: ('Sable Trust', 1500000) in learner(), True)
check("both clear the million", lambda: all(a > 1000000 for _, a in learner()), True)
check("names, not account numbers", lambda: all(isinstance(h, str) for h, _ in learner()), True)`),
    mini('Return every badge swipe with the name of whoever carried the badge: three columns named name, door and clock, where clock is time(at). Any order.',
      'One join on the staff id, and the clock cut out of the timestamp in the SELECT list. A swipe whose id belongs to nobody is not your problem — this join drops it.',
`check_cols("three columns, name then door then clock", ['name', 'door', 'clock'])
check_query("every swipe with its owner", "SELECT s.name, b.door, time(b.at) AS clock FROM badges b JOIN staff s ON s.id = b.staff_id")
check_query("a swipe by nobody is dropped", "SELECT s.name, b.door, time(b.at) AS clock FROM badges b JOIN staff s ON s.id = b.staff_id",
            extra="INSERT INTO badges VALUES (99, 77, 'roof', '2026-03-08 09:00', 'in');")
check("seventeen rows on the shipped dump", lambda: len(learner()), 17)
check("Ines Marr at the vault at five to nine", lambda: ('Ines Marr', 'vault', '08:55:00') in learner(), True)
check("Tomas Reed on the lobby door at half seven", lambda: ('Tomas Reed', 'lobby', '07:30:00') in learner(), True)
check("names all the way down", lambda: all(isinstance(n, str) for n, _, _ in learner()), True)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/side-by-side.sql`:

```sql
-- Reference solutions for lesson side-by-side. Blocks: "-- === <node-id>/<step-index>".

-- === side-by-side/4
SELECT a.holder, t.amount FROM transfers t JOIN accounts a ON a.id = t.from_acct WHERE t.amount > 1000000

-- === side-by-side/5
SELECT s.name, b.door, time(b.at) AS clock FROM badges b JOIN staff s ON s.id = b.staff_id
```

- [ ] **Step 2: Create `src/courses/sql/training/keep-the-empty.js`**

```js
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
```

Reference solutions `scripts/solutions/sql/training/keep-the-empty.sql`:

```sql
-- Reference solutions for lesson keep-the-empty. Blocks: "-- === <node-id>/<step-index>".

-- === keep-the-empty/4
SELECT a.holder FROM accounts a LEFT JOIN transfers t ON t.to_acct = a.id WHERE t.id IS NULL

-- === keep-the-empty/5
SELECT a.holder, COALESCE(t.amount, 0) AS moved FROM accounts a LEFT JOIN transfers t ON t.from_acct = a.id
```

- [ ] **Step 3: Create `src/courses/sql/training/table-meets-itself.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('table-meets-itself', {
  tier: 'E', xp: 80, requires: ['keep-the-empty'], gates: ['chainofcommand', 'threeway'],
  tools: ['tool-table'],
  title: 'The table meets itself', algo: 'Self join',
  steps: [
    explain([
      'The staff table points at itself: every row carries the id of the person above it, and one row points at nobody at all.',
      'Dax draws the tree on a napkin, crosses two branches, and announces that the head of security reports to a teller.',
      '“It is one table doing two jobs,” Marguerite says. “Take two copies, call one of them the manager, and wire the second onto the first by the id it already carries.”',
    ], { move: 'brute force' }),
    explain([
      '“A table can be joined to itself as long as the two copies have different names. s is the person, m is their manager, and the ON says m.id = s.manager_id.”',
      '“Every column then has to say which copy it came from, because both copies have a name column. That is the whole trick: the aliases do the thinking.”',
    ], { move: 'pick the pattern', code:
`SELECT s.name, m.name AS boss
FROM staff s
JOIN staff m ON m.id = s.manager_id
WHERE s.id = 12;
-- ('Ana Petrov', 'Ruth Ash')` }),
    trace(
`SELECT s.name, m.name AS boss
FROM staff s
JOIN staff m ON m.id = s.manager_id
WHERE s.dept = 'security'`,
      'the query above',
      [
        { line: 2, state: { rows: 12 }, ask: 'rows', note: 'Twelve staff rows on the bench as the left-hand copy.' },
        { line: 3, state: { rows: 12, paired: 11 }, ask: 'paired', note: 'Eleven find a manager. The one at the top carries no manager id, so this join leaves them out.' },
        { line: 4, state: { rows: 12, paired: 11, returns: { py: "[('Tomas Reed', 'Halden Voss'), ('Otto Kline', 'Tomas Reed'), ('Ruth Ash', 'Otto Kline'), ('Ana Petrov', 'Ruth Ash')]" } }, ask: 'returns', note: 'Four security staff, each beside the person above them, and the chain reads straight down the column.' },
      ]),
    spot('Dax writes SELECT name, name FROM staff JOIN staff ON id = manager_id. What goes wrong first?',
      ['Nothing; SQLite works out which copy is which',
       'Every column name is ambiguous — with no aliases, name and id could come from either copy',
       'A table cannot be joined to itself',
       'It returns twelve rows of the same name twice'],
      1, 'Both copies bring the same column names, so the query cannot say which one it means. Give the copies aliases and every reference becomes unambiguous.'),
    blank('“Everyone whose manager works in the vault: the person, and the manager.”',
`SELECT s.name, m.name AS boss FROM staff s JOIN staff ___ ON ___ = s.manager_id WHERE m.dept = 'vault'`,
`check_cols("two columns, name then boss", ['name', 'boss'])
check_query("the people who answer to the vault", "SELECT s.name, m.name AS boss FROM staff s JOIN staff m ON m.id = s.manager_id WHERE m.dept = 'vault'")
check_query("a new hire under Ines Marr", "SELECT s.name, m.name AS boss FROM staff s JOIN staff m ON m.id = s.manager_id WHERE m.dept = 'vault'",
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', 'tellers', '2026-01-01', 2);")
check("three pairs on the shipped dump", lambda: len(learner()), 3)
check("Kit Ferro answers to Priya Nand", lambda: ('Kit Ferro', 'Priya Nand') in learner(), True)
check("every manager named here works in the vault", lambda: all(b in [r[0] for r in rows("SELECT name FROM staff WHERE dept = 'vault'")] for _, b in learner()), True)
check("the man at the top is not on the left", lambda: all(n != 'Halden Voss' for n, _ in learner()), True)`),
    mini('Return every staff member beside their manager, printing the word nobody for the one at the top — coalesce(m.name, \'nobody\'). Two columns named name and boss, by id. Order matters.',
      'The inner join drops the person with no manager, so keep the left copy whole instead and fill the gap. Two aliases, one of them optional.',
`check_cols("two columns, name then boss", ['name', 'boss'])
check_query("the whole line of command", "SELECT s.name, COALESCE(m.name, 'nobody') AS boss FROM staff s LEFT JOIN staff m ON m.id = s.manager_id ORDER BY s.id", ordered=True)
check_query("a second person at the top", "SELECT s.name, COALESCE(m.name, 'nobody') AS boss FROM staff s LEFT JOIN staff m ON m.id = s.manager_id ORDER BY s.id", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', 'board', '2026-01-01', NULL);")
check("twelve rows on the shipped dump", lambda: len(learner()), 12)
check("Halden Voss answers to nobody", lambda: learner()[0], ('Halden Voss', 'nobody'))
check("Ana Petrov answers to Ruth Ash", lambda: ('Ana Petrov', 'Ruth Ash') in learner(), True)
check("only one nobody in the building", lambda: sum(1 for _, b in learner() if b == 'nobody'), 1)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/table-meets-itself.sql`:

```sql
-- Reference solutions for lesson table-meets-itself. Blocks: "-- === <node-id>/<step-index>".

-- === table-meets-itself/4
SELECT s.name, m.name AS boss FROM staff s JOIN staff m ON m.id = s.manager_id WHERE m.dept = 'vault'

-- === table-meets-itself/5
SELECT s.name, COALESCE(m.name, 'nobody') AS boss FROM staff s LEFT JOIN staff m ON m.id = s.manager_id ORDER BY s.id
```

- [ ] **Step 4: Extend the lesson list** — add three imports and a second line to `NODES`:

```js
import sideBySide from './side-by-side.js'
import keepTheEmpty from './keep-the-empty.js'
import tableMeetsItself from './table-meets-itself.js'
```

```js
export const NODES = [
  pickColumns, narrowItDown, lineThemUp, countWhatIsThere, nothingIsAValue,
  sideBySide, keepTheEmpty, tableMeetsItself,
]
```

- [ ] **Step 5: Validate and prove**

```bash
npm run check
node scripts/test-solutions.mjs
npm test
```

Expected: `✓ 88 training nodes and 30 tools across 4 course(s) look good`; `✓ 138 gates, 204 training drills, … all reference solutions pass`; `npm test` still failing only the tool-coverage test, on `tool-group`.

- [ ] **Step 6: Commit**

```bash
git add src/courses/sql/training scripts/solutions/sql/training
git commit -m "content(sql): E lessons — side by side, keep the ones with nobody, the table meets itself"
```

---

### Task 4: The D tier, and the browser check

**Files:**
- Create: `src/courses/sql/training/pile-them-up.js`, `the-calendar.js`
- Create: `scripts/solutions/sql/training/pile-them-up.sql`, `the-calendar.sql`
- Modify: `src/courses/sql/training/index.js`

**Interfaces:**
- Consumes `table-meets-itself` (as `requires`) and the tool id `tool-group` — the last tool with no lesson behind it, which is what turns the failing unit test green.
- Produces `pile-them-up`, `the-calendar`. Plan 4's C-tier lessons require `pile-them-up`.

- [ ] **Step 1: Create `src/courses/sql/training/pile-them-up.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('pile-them-up', {
  tier: 'D', xp: 90, requires: ['table-meets-itself'], gates: ['perdept', 'heavyhitters', 'busiestdoor'],
  tools: ['tool-group'],
  title: 'Pile them up', algo: 'GROUP BY and HAVING',
  steps: [
    explain([
      '“How many swipes on each door,” the fence says, “and only the doors that see real traffic.” Dax sorts the badge log by door and starts writing tallies in the margin.',
      'He gets four numbers, two of which he has to redo, and then she asks the same question about the transfers and he reaches for the margin again.',
      '“Stop counting one pile at a time,” Marguerite says. “Say which column makes the piles and the table builds all of them at once.”',
    ], { move: 'brute force' }),
    explain([
      '“GROUP BY names the column that decides the piles: one pile for each value it holds, one row of answer for each pile. COUNT, SUM, MIN, MAX and AVG each read down a pile.”',
      '“There are two sieves. WHERE thins the rows on their way into the piles. HAVING judges the piles once they are built, so a test about a total belongs there.”',
    ], { move: 'pick the pattern', code:
`SELECT kind, COUNT(*) AS n FROM accounts GROUP BY kind;
-- ('business', 3) ('personal', 5) ('trust', 2)

SELECT kind, COUNT(*) AS n FROM accounts GROUP BY kind HAVING COUNT(*) > 2;
-- ('business', 3) ('personal', 5)` }),
    trace(
`SELECT door, COUNT(*) AS n
FROM badges
GROUP BY door
HAVING COUNT(*) > 4`,
      'the query above',
      [
        { line: 2, state: { rows: 17 }, ask: 'rows', note: 'Seventeen swipes on the bench, four different doors among them.' },
        { line: 3, state: { rows: 17, piles: 4 }, ask: 'piles', note: 'One pile per door: lobby, loading-bay, server-room, vault. Seventeen rows become four.' },
        { line: 4, state: { rows: 17, piles: 4, returns: { py: "[('lobby', 6), ('vault', 5)]" } }, ask: 'returns', note: 'The second sieve judges the piles, not the rows. Two doors clear four swipes; the quiet two are dropped whole.' },
      ]),
    spot('Dax wants the doors with more than four swipes and writes WHERE COUNT(*) > 4. SQLite answers with an error. Why?',
      ['COUNT cannot be compared with a number',
       'WHERE runs before the piles exist, so there is no count yet for it to test',
       'The query is missing an ORDER BY',
       'COUNT(*) has to be given a name before it can be tested'],
      1, 'WHERE sieves rows on their way in, one at a time, before anything has been piled up. The test belongs in HAVING, which runs on the finished piles.'),
    blank('“The kinds of account there are more than two of, with how many.”',
`SELECT kind, COUNT(*) AS n FROM accounts ___ ___ ___ COUNT(*) > 2`,
`check_cols("two columns, kind then n", ['kind', 'n'])
check_query("the kinds with more than two accounts", "SELECT kind, COUNT(*) AS n FROM accounts GROUP BY kind HAVING COUNT(*) > 2")
check_query("a third trust account joins the answer", "SELECT kind, COUNT(*) AS n FROM accounts GROUP BY kind HAVING COUNT(*) > 2",
            extra="INSERT INTO accounts VALUES (99, 'Vela Ord', 'trust', 'north', '2026-01-01');")
check("two kinds on the shipped dump", lambda: len(learner()), 2)
check("three business accounts", lambda: ('business', 3) in learner(), True)
check("every pile clears two", lambda: all(n > 2 for _, n in learner()), True)
check("the trusts did not make the cut", lambda: all(k != 'trust' for k, _ in learner()), True)`),
    mini('Return each payee who was paid more than 50,000 in all, with the total — sum(amount). Two columns named payee and total, largest total first, ties broken by the payee name. Order matters.',
      'One pile per payee, the pile added up, and the second sieve judging the totals. Two keys in the order clause settle the two payees who tie.',
`check_cols("two columns, payee then total", ['payee', 'total'])
check_query("the payees worth talking to", "SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee HAVING SUM(amount) > 50000 ORDER BY total DESC, payee", ordered=True)
check_query("one more payment promotes a name", "SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee HAVING SUM(amount) > 50000 ORDER BY total DESC, payee", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Bo Lund', 60000, '2026-03-08', NULL);")
check("four payees on the shipped dump", lambda: len(learner()), 4)
check("Halden Voss leads with 650000", lambda: learner()[0], ('Halden Voss', 650000))
check("every total clears fifty thousand", lambda: all(t > 50000 for _, t in learner()), True)
check("the tie at 120000 reads Ines Marr first", lambda: [p for p, _ in learner()][2:4], ['Ines Marr', 'Otto Kline'])`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/pile-them-up.sql`:

```sql
-- Reference solutions for lesson pile-them-up. Blocks: "-- === <node-id>/<step-index>".

-- === pile-them-up/4
SELECT kind, COUNT(*) AS n FROM accounts GROUP BY kind HAVING COUNT(*) > 2

-- === pile-them-up/5
SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee HAVING SUM(amount) > 50000 ORDER BY total DESC, payee
```

- [ ] **Step 2: Create `src/courses/sql/training/the-calendar.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('the-calendar', {
  tier: 'D', xp: 100, requires: ['pile-them-up'], gates: ['byday'],
  tools: ['tool-group'],
  title: 'The calendar', algo: 'Date functions',
  steps: [
    explain([
      'The fence wants the shape of a week: which days were busy, which were quiet. Dax piles the badge log up by the timestamp and gets seventeen piles of one.',
      'Every stamp carries a clock as well as a date, so no two of them are ever the same, and his answer is the log again with a 1 written beside every row.',
      '“The day is hiding at the front of the stamp,” Marguerite says. “Cut it out first, then make the piles out of what is left.”',
    ], { move: 'brute force' }),
    explain([
      '“date() trims a timestamp down to its date and time() keeps only the clock. Both hand back text, because that is how the dump stores them.”',
      '“Pile up by the same expression you put in the SELECT list, not by the raw column. And strftime() cuts any shape you like out of a stamp — %Y-%m is the month.”',
    ], { move: 'pick the pattern', code:
`SELECT date(at) AS day, time(at) AS clock FROM badges LIMIT 2;
-- ('2026-03-02', '08:55:00')
-- ('2026-03-02', '17:10:00')

SELECT strftime('%Y-%m', paid_on) AS month, COUNT(*) AS n FROM payments GROUP BY strftime('%Y-%m', paid_on);
-- ('2026-01', 3) ('2026-02', 5) ('2026-03', 4)` }),
    trace(
`SELECT date(at) AS day, COUNT(*) AS n
FROM badges
GROUP BY date(at)`,
      'the query above',
      [
        { line: 2, state: { rows: 17 }, ask: 'rows', note: 'Seventeen swipes, seventeen different timestamps.' },
        { line: 3, state: { rows: 17, piles: 5 }, ask: 'piles', note: 'Trimmed to the date, those seventeen stamps collapse onto five days.' },
        { line: 1, state: { rows: 17, piles: 5, returns: { py: "[('2026-03-02', 4), ('2026-03-03', 4), ('2026-03-04', 3), ('2026-03-05', 3), ('2026-03-06', 3)]" } }, ask: 'returns', note: 'Four, four, three, three, three — and they add back up to seventeen, which is how you know nothing fell out.' },
      ]),
    spot('Dax writes GROUP BY at instead of GROUP BY date(at) over the badge log. What does he get?',
      ['Five rows, one per day',
       'Seventeen rows with a 1 beside each, because no two timestamps match',
       'One row holding seventeen',
       'An error about grouping on a timestamp'],
      1, 'Each stamp carries its clock, so every value is unique and each row becomes its own pile. Trim to the day first and the piles have something to gather around.'),
    blank('“How often the lobby door opened on each day it opened at all, earliest day first.”',
`SELECT ___(at) AS day, COUNT(*) AS n FROM badges WHERE door = 'lobby' GROUP BY ___(at) ORDER BY day`,
`check_cols("two columns, day then n", ['day', 'n'])
check_query("the lobby, day by day", "SELECT date(at) AS day, COUNT(*) AS n FROM badges WHERE door = 'lobby' GROUP BY date(at) ORDER BY day", ordered=True)
check_query("one more lobby swipe on a new day", "SELECT date(at) AS day, COUNT(*) AS n FROM badges WHERE door = 'lobby' GROUP BY date(at) ORDER BY day", ordered=True,
            extra="INSERT INTO badges VALUES (99, 6, 'lobby', '2026-03-07 08:00', 'in');")
check("four days on the shipped dump", lambda: len(learner()), 4)
check("they add up to the six lobby swipes", lambda: sum(n for _, n in learner()), 6)
check("the fourth of March saw two", lambda: ('2026-03-04', 2) in learner(), True)
check("a day is ten characters, no clock", lambda: all(len(d) == 10 for d, _ in learner()), True)`),
    mini('Return how many payments the Ledger holds for each month: two columns named month and n, the month written as 2026-01 — strftime(\'%Y-%m\', paid_on). Earliest month first. Order matters.',
      'Cut the month out of the date, pile up by that same expression, and sort on the name you gave it. Text that starts with the year sorts into calendar order for free.',
`check_cols("two columns, month then n", ['month', 'n'])
check_query("the Ledger month by month", "SELECT strftime('%Y-%m', paid_on) AS month, COUNT(*) AS n FROM payments GROUP BY strftime('%Y-%m', paid_on) ORDER BY month", ordered=True)
check_query("a payment from the old year opens a month", "SELECT strftime('%Y-%m', paid_on) AS month, COUNT(*) AS n FROM payments GROUP BY strftime('%Y-%m', paid_on) ORDER BY month", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Bo Lund', 1000, '2025-12-31', NULL);")
check("three months on the shipped dump", lambda: len(learner()), 3)
check("they add up to every payment", lambda: sum(n for _, n in learner()), 12)
check("February was the busy one, with five", lambda: ('2026-02', 5) in learner(), True)
check("a month is seven characters", lambda: all(len(m) == 7 for m, _ in learner()), True)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/the-calendar.sql`:

```sql
-- Reference solutions for lesson the-calendar. Blocks: "-- === <node-id>/<step-index>".

-- === the-calendar/4
SELECT date(at) AS day, COUNT(*) AS n FROM badges WHERE door = 'lobby' GROUP BY date(at) ORDER BY day

-- === the-calendar/5
SELECT strftime('%Y-%m', paid_on) AS month, COUNT(*) AS n FROM payments GROUP BY strftime('%Y-%m', paid_on) ORDER BY month
```

- [ ] **Step 3: Finish the lesson list** — add the last two imports and a third line to `NODES`:

```js
import pileThemUp from './pile-them-up.js'
import theCalendar from './the-calendar.js'
```

```js
export const NODES = [
  pickColumns, narrowItDown, lineThemUp, countWhatIsThere, nothingIsAValue,
  sideBySide, keepTheEmpty, tableMeetsItself,
  pileThemUp, theCalendar,
]
```

- [ ] **Step 4: Validate, prove, test, build**

```bash
npm run check
node scripts/test-solutions.mjs
npm test
npm run build
```

Expected: `✓ 90 training nodes and 30 tools across 4 course(s) look good`; `✓ 138 gates, 208 training drills, … all reference solutions pass`; **`npm test` fully green** — every one of the course's six tools is now required by a lesson, so the test that has been failing since Task 1 passes; build ok.

- [ ] **Step 5: Browser check** — `npm run dev`, fresh save slot, Jobs → The Books → Training

  - The Jobs row now reads "The Books · SQL · … · 20 gates · 10 lessons".
  - The training room shows tier tabs F, E and D only (C–S stay empty until plan 4), with five rows under F, three under E, two under D. `Pick the columns` is the only row open; every other row shows `needs: <titles>`.
  - Tool chips: `Pick the columns` shows two chips (The ledger page, Just these columns), red until those tools are cleared in the Armoury. Clear both and the lesson opens.
  - Walk `Pick the columns` end to end: two explains, the trace (answer `12`, `['payee', 'pounds']`, then `[('Otto Kline', 500), ('Ruth Ash', 300), ('Otto Kline', 200)]`), the spot (second option), the blank with `AS`, and the mini with its reference query. Every check passes, the lesson clears, +40 training xp.
  - Open `Pile them up` after clearing its chain — its trace accepts `17`, `4` and `[('lobby', 6), ('vault', 5)]`, and the mini's tie check passes with the reference query.
  - Switch to The Ledger and back, then reload: cleared lessons, kit progress and drill notes survive. No console errors beyond the pre-existing `/favicon.ico` 404, and **no three.js chunk** in the network panel — this course sets no `scene`.

- [ ] **Step 6: Commit**

```bash
git add src/courses/sql/training scripts/solutions/sql/training
git commit -m "content(sql): D lessons — pile them up, the calendar; the training room opens"
```

- [ ] **Step 7: Finish the branch** — follow superpowers:finishing-a-development-branch to merge `sql-lessons-f-d` into `main`.

---

## Self-review

- **Spec coverage.** The spec's lesson table rows one to ten, in its order, with its exact `algo`, titles, tools and prepared gates: Tasks 1–4. `requires` follows the table top to bottom, which is the spec's rule. Step shape (two explains, a trace walking the clauses, spot, blank, mini) per lesson: every lesson above. Tool coverage — the spec requires every armoury tool to sit behind a lesson — is complete at Task 4: `tool-table` (pick-columns, side-by-side, table-meets-itself), `tool-select` (pick-columns, count-what-is-there), `tool-where` (narrow-it-down), `tool-order` (line-them-up), `tool-null` (nothing-is-a-value, keep-the-empty), `tool-group` (pile-them-up, the-calendar). The remaining eight lessons (C, B, A, S) and the CLAUDE.md update are plan 4.
- **Placeholder scan.** Every lesson file, drill test and reference query is written out in full — no TBDs, no "as above". Each validation step carries real expected numbers (83 → 85 → 88 → 90 nodes; 194 → 198 → 204 → 208 drills), and the one expected failing unit test is named, explained, and given the task where it goes green.
- **Type consistency.** Every `check_query` reference statement matches the statement in the matching `.sql` block; every `check_cols` list matches the columns that statement produces; every lesson id used in a later `requires` is created in an earlier task (`pick-columns` → `narrow-it-down` → `line-them-up` → `count-what-is-there` → `nothing-is-a-value` → `side-by-side` → `keep-the-empty` → `table-meets-itself` → `pile-them-up` → `the-calendar`); every `gates` entry names a gate that exists on `main` (pullnames, bigmoves, nightdoors, howmany, emptyaccounts, badgeowners, chainofcommand, threeway, perdept, heavyhitters, busiestdoor, byday); every `tools` entry names a shipped tool. Every number and tuple asserted in a `check(` or shown in a trace frame was run against the frozen fixture before this plan was written: 12 payments with `('Otto Kline', 500)` first; 5 transfers over 100,000; the three smallest `(9, 4500), (14, 8000), (4, 9000)`; 4 personal non-harbour holders; 3 vault staff alphabetically from Ines Marr; the last three swipes `('lobby', '18:30:00'), ('vault', '09:00:00'), ('lobby', '08:10:00')`; 6 lobby swipes; 4 distinct doors; `(12, 11)` for the staff counts; Bo Lund as the only blank department; 5 vault swipes with names; 2 transfers over a million; 17 joined swipes; the central-branch LEFT JOIN's four rows ending `('Halden Staff Fund', None)`; 3 accounts that never received; 17 account-and-transfer rows; 4 security staff beside their managers; 3 people whose manager works in the vault; 12 rows with exactly one `nobody`; `('lobby', 6), ('vault', 5)` over four; business 3 and personal 5; the four payees over 50,000 with the Ines Marr / Otto Kline tie at 120,000; the five badge days 4/4/3/3/3; the four lobby days summing to 6; and the three payment months 3/5/4.
