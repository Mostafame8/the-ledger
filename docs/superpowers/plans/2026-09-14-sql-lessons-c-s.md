# The Books — plan 4: lessons C–S, and the docs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the SQL course "The Books" with its last eight lessons — three at C, two at B, two at A and the S capstone — and write the course into CLAUDE.md, so all four courses are complete and documented.

**Architecture:** Content only, plus one docs edit. One file per lesson in `src/courses/sql/training/`, appended to that folder's `index.js` list. Each lesson is a `node(...)` from `src/training/node.js` with six steps in the fixed order explain, explain, trace, spot, blank, mini. The two drills per lesson get reference queries in `scripts/solutions/sql/training/<node-id>.sql`, headed `-- === <node-id>/4` and `-- === <node-id>/5`. No engine, runner, store, component, gate or tool changes.

**Tech Stack:** Plain JS content modules, SQLite (Python's `sqlite3` for proofs, Pyodide's in the browser), Vue 3 shell untouched.

**Spec:** `docs/superpowers/specs/2026-09-12-sql-course-design.md` (the "Lessons (18)" table; this plan ships its last eight rows)

## Global Constraints

- **The fixture `src/courses/sql/fixture.sql` is frozen.** Never edit it. Drill tests add rows through `extra=` only.
- Lesson schema, from `src/training/node.js`: `node(id, { tier, xp, requires, gates, tools, title, algo, steps })`. `tier` C–S with `xp` in the tier's band: C 120–140, B 160–180, A 200–240, S 280–400. `requires` lesson ids, `gates` the gate ids the lesson prepares (never empty), `tools` at most two tool ids. `title` is a scene name, `algo` the plain technique name.
- Step rules the validator enforces (`scripts/check-training.mjs`): steps in the order `explain, explain, trace, spot, blank, mini`; each `explain` has 2–5 lines; at least one explain line per lesson starts with a curly opening quote `“`; each `trace` has 3+ frames, each `{ line, state, ask, note }` with `line` 1-based into that trace's own `code` and `ask` naming a key of `state`; each `spot` has 3–4 options and an in-range `answer`; `blank` and `mini` each carry 4–7 **literal** `check(` calls (`check_cols(` and `check_query(` do **not** count) and a `blank` template must contain `___`.
- A `mini`'s `mission` must contain a function-shaped token matching `/\b[a-z_][a-z0-9_]*\(/`. In this plan those are `avg(amount)`, `time(at)`, `sum(amount)`, `count(*)`, `lower(payee)`, `row_number()` and the walk's own header `down(id, name, depth)`. Keep them in the mission text.
- **No step in this course sets `scene`.**
- Content order inside a lesson: explain 1 is Dax's brute force, explain 2 shows the pattern and carries the `code` block; then trace, spot, blank, mini.
- Prose rule: SQL keywords are code and allowed anywhere (`SELECT`, `WITH`, `OVER`, `PARTITION BY`, `CASE`, `UNION`, `EXCEPT`, `INTERSECT`, `NOT EXISTS`, and the literal `WITH RECURSIVE`). Banned from explain lines, missions and hints: the English words aggregate, subquery, window function, common table expression, CTE, recursive, predicate, projection, cardinality, normalisation. They live in `algo` and in a `spot`'s options, `problem` and `why`. Marguerite's mandated phrases: "a question inside a question", "name the result first", "the running total", "climb the chain".
- Story: the room above the laundromat, between jobs. Marguerite teaches; Dax scrolls a spreadsheet and does it by hand; the fence pays for answers. Voice short, wry, concrete. No real anime, manga, game or their characters.
- Drill tests are Python strings using `check_query(label, ref_sql, ordered=False, extra=None)`, `check_cols(label, names)`, `rows(sql, extra=None)`, `learner(extra=None)`, `learner_cols()` from `src/courses/sql/harness_sql.py`, plus `check()` from `src/harness.py`. Give every drill one `check_cols`, one `check_query` on the untouched fixture, one `check_query` with `extra=` rows, and four literal `check(` calls. `ordered=True` only when the drill's intro or mission fixes an order. Helper names start with `_t_`.
- Reference solutions: `scripts/solutions/sql/training/<node-id>.sql`, one bare statement per block, blocks headed `-- === <node-id>/4` and `-- === <node-id>/5`.
- Do not edit `course.js`, the course-level `index.js`, `gates.js`, `tests.js`, `fixture.sql`, `harness_sql.py`, `src/sqlwrap.js`, `src/runner.js`, any component, anything under `src/courses/algorithms|oop|patterns`, anything under `src/courses/sql/training/tools/`, or the ten lessons already shipped.
- Baseline before this plan (merge commit `52c3818` on `main`): 138 gates, 208 training drills, 2233 checks, 90 training nodes, 30 tools, 117 unit tests all green. Every command must stay green at the end of every task — unlike plan 3, there is no expected red here.
- Commit messages end with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Branch `sql-lessons-c-s` off `main`.

---

## File structure

| Path | Responsibility |
|---|---|
| `src/courses/sql/training/question-inside.js` | C lesson: subqueries. |
| `src/courses/sql/training/who-is-missing.js` | C lesson: NOT EXISTS. |
| `src/courses/sql/training/name-the-result.js` | C lesson: common table expressions. |
| `src/courses/sql/training/sort-into-bands.js` | B lesson: CASE. |
| `src/courses/sql/training/two-lists.js` | B lesson: UNION, EXCEPT, INTERSECT. |
| `src/courses/sql/training/running-total.js` | A lesson: window aggregates. |
| `src/courses/sql/training/rank-within.js` | A lesson: ranking windows. |
| `src/courses/sql/training/climb-the-chain.js` | S lesson: recursive CTEs. |
| `src/courses/sql/training/index.js` | Gains eight imports and C/B/A/S lines in `NODES`. |
| `scripts/solutions/sql/training/<node-id>.sql` (eight files) | Reference query per drill. |
| `CLAUDE.md` | Gains the sql course in Layout and in The story, plus the SQL runner note. |

The eight lessons, in the spec's table order:

| # | id | tier / xp | title | algo | tools | gates | requires |
|---|---|---|---|---|---|---|---|
| 11 | `question-inside` | C / 120 | A question inside a question | Subqueries | `tool-where` | `abovemean` | `pile-them-up` |
| 12 | `who-is-missing` | C / 130 | Who is missing | NOT EXISTS | `tool-where` | `neverswiped` | `question-inside` |
| 13 | `name-the-result` | C / 140 | Name the result first | Common table expressions | `tool-select` | `thebooks` | `who-is-missing` |
| 14 | `sort-into-bands` | B / 160 | Sort into bands | CASE | `tool-null` | `bucket` | `name-the-result` |
| 15 | `two-lists` | B / 180 | Two lists, one answer | UNION, EXCEPT, INTERSECT | `tool-order` | `twolists` | `sort-into-bands` |
| 16 | `running-total` | A / 200 | The running total | Window aggregates | `tool-group` | `runningtotal` | `two-lists` |
| 17 | `rank-within` | A / 240 | Rank within each | Ranking windows | `tool-order` | `toppercamera` | `running-total` |
| 18 | `climb-the-chain` | S / 300 | Climb the chain | Recursive CTEs | `tool-table` | `reportsto`, `thebooks` | `name-the-result`, `table-meets-itself` |

`question-inside` requiring `pile-them-up`, and `climb-the-chain` requiring both `name-the-result` and `table-meets-itself`, are the spec's own words; the rest is its table order.

Every number and tuple below was run against the frozen fixture before this plan was written.

---

### Task 1: The C tier — three lessons

**Files:**
- Create: `src/courses/sql/training/question-inside.js`, `who-is-missing.js`, `name-the-result.js`
- Create: `scripts/solutions/sql/training/question-inside.sql`, `who-is-missing.sql`, `name-the-result.sql`
- Modify: `src/courses/sql/training/index.js`

**Interfaces:**
- Consumes the shipped lessons `pile-them-up` and `table-meets-itself` (as `requires` targets) and the tool ids `tool-where`, `tool-select`.
- Produces `question-inside`, `who-is-missing`, `name-the-result`. Task 2 chains onto `name-the-result`; Task 4's `climb-the-chain` requires it too.

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull --ff-only && git checkout -b sql-lessons-c-s
```

- [ ] **Step 2: Create `src/courses/sql/training/question-inside.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('question-inside', {
  tier: 'C', xp: 120, requires: ['pile-them-up'], gates: ['abovemean'],
  tools: ['tool-where'],
  title: 'A question inside a question', algo: 'Subqueries',
  steps: [
    explain([
      '“Anything bigger than normal,” the fence says. Dax works the average out on his phone, writes 426250 on a sticky note, and starts reading down the amounts.',
      'Two transfers land that afternoon. The number on the note is now wrong, the list he handed her is wrong, and neither of them knows it.',
      '“A number you worked out yourself goes stale,” Marguerite says. “Ask for it in the same breath as the rows and it is never stale again.”',
    ], { move: 'brute force' }),
    explain([
      '“A SELECT that hands back exactly one row and one column can stand anywhere a number can stand — inside a WHERE, inside the SELECT list, either side of a comparison.”',
      '“The brackets are not decoration; they are what makes it one value instead of a second query. And it is worked out against the same tables, at the same moment, every time the statement runs.”',
    ], { move: 'pick the pattern', code:
`SELECT AVG(amount) FROM transfers;
-- (426250.0,)

SELECT id, amount FROM transfers WHERE amount > (SELECT AVG(amount) FROM transfers);
-- (3, 480000)
-- (5, 1500000)
-- (13, 3200000)` }),
    trace(
`SELECT id, amount
FROM transfers
WHERE amount > (SELECT AVG(amount) FROM transfers)`,
      'the query above',
      [
        { line: 3, state: { average: 426250.0 }, ask: 'average', note: 'The bracketed question runs first and once: fourteen amounts adding to 5,967,500, divided by fourteen.' },
        { line: 2, state: { average: 426250.0, rows: 14 }, ask: 'rows', note: 'Then the outer query puts all fourteen transfers on the bench and compares each one with that single number.' },
        { line: 1, state: { average: 426250.0, rows: 14, returns: { py: '[(3, 480000), (5, 1500000), (13, 3200000)]' } }, ask: 'returns', note: 'Three clear the average. Add a transfer tomorrow and the average moves with it, which is the whole point.' },
      ]),
    spot('Dax writes WHERE amount > (SELECT amount FROM transfers WHERE from_acct = 1). Account 1 sent three transfers. What happens?',
      ['It compares against the first of the three',
       'SQLite errors, because a single value was expected and three rows arrived',
       'It compares against all three at once and keeps rows that beat any of them',
       'It quietly returns no rows'],
      1, 'Standing where a number stands means handing back one row and one column. Three rows is a list, and a list needs IN, or ALL, or a bracket that returns a single value — MAX, say.'),
    blank('“Who sent the single biggest transfer in the dump? Just the holder.”',
`SELECT holder FROM accounts WHERE id = (SELECT ___ FROM transfers ORDER BY amount DESC LIMIT 1)`,
`check_cols("one column named holder", ['holder'])
check_query("the account behind the biggest move", "SELECT holder FROM accounts WHERE id = (SELECT from_acct FROM transfers ORDER BY amount DESC LIMIT 1)")
check_query("a bigger move changes the answer", "SELECT holder FROM accounts WHERE id = (SELECT from_acct FROM transfers ORDER BY amount DESC LIMIT 1)",
            extra="INSERT INTO transfers VALUES (99, 5, 1, 9000000, '2026-03-08 09:00');")
check("exactly one holder", lambda: len(learner()), 1)
check("Corvin Holdings sent it", lambda: learner()[0], ('Corvin Holdings',))
check("not the account it landed in", lambda: ('Sable Trust',) in learner(), False)
check("one column, one row", lambda: len(learner()[0]), 1)`),
    mini('Return every payment bigger than the average payment — avg(amount). Two columns named id and amount, largest first. Order matters.',
      'Work the average out where the comparison happens, not before it. The bracketed question reads the same table the outer one does.',
`check_cols("two columns, id then amount", ['id', 'amount'])
check_query("the payments above the average", "SELECT id, amount FROM payments WHERE amount > (SELECT AVG(amount) FROM payments) ORDER BY amount DESC", ordered=True)
check_query("a huge payment drags the average up", "SELECT id, amount FROM payments WHERE amount > (SELECT AVG(amount) FROM payments) ORDER BY amount DESC", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Bo Lund', 900000, '2026-03-08', NULL);")
check("three payments on the shipped dump", lambda: len(learner()), 3)
check("the consultancy fee leads", lambda: learner()[0], (4, 400000))
check("largest first", lambda: [a for _, a in learner()] == sorted([a for _, a in learner()], reverse=True), True)
check("nothing at or below the average", lambda: min(a for _, a in learner()) > 91916, True)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/question-inside.sql`:

```sql
-- Reference solutions for lesson question-inside. Blocks: "-- === <node-id>/<step-index>".

-- === question-inside/4
SELECT holder FROM accounts WHERE id = (SELECT from_acct FROM transfers ORDER BY amount DESC LIMIT 1)

-- === question-inside/5
SELECT id, amount FROM payments WHERE amount > (SELECT AVG(amount) FROM payments) ORDER BY amount DESC
```

- [ ] **Step 3: Create `src/courses/sql/training/who-is-missing.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('who-is-missing', {
  tier: 'C', xp: 130, requires: ['question-inside'], gates: ['neverswiped'],
  tools: ['tool-where'],
  title: 'Who is missing', algo: 'NOT EXISTS',
  steps: [
    explain([
      '“Which of them never goes near the vault,” the fence says. Dax reads the badge log top to bottom, writing down everyone he sees, and hands over the list he built.',
      'That list is the people who did go. The ones she asked about left no trace at all, which is exactly why they are not in his notes.',
      '“An absence is not something you read off a log,” Marguerite says. “You stand on a person and ask the log a yes-or-no question about them.”',
    ], { move: 'brute force' }),
    explain([
      '“EXISTS asks whether the bracketed question finds anything at all. It never collects the rows, so what the inner SELECT lists does not matter — 1 is the polite thing to put there.”',
      '“Tie the inner question to the row you are standing on: b.staff_id = s.id. Put NOT in front and you keep the people the log has nothing to say about.”',
    ], { move: 'pick the pattern', code:
`SELECT name FROM staff s
WHERE EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id);
-- the ten who swiped something

SELECT name FROM staff s
WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id);
-- ('Halden Voss',) ('Bo Lund',)` }),
    trace(
`SELECT name
FROM staff s
WHERE NOT EXISTS (
  SELECT 1 FROM badges b
  WHERE b.staff_id = s.id AND b.door = 'vault')`,
      'the query above',
      [
        { line: 2, state: { rows: 12 }, ask: 'rows', note: 'Twelve staff rows on the bench. The question will be asked once for each of them.' },
        { line: 4, state: { rows: 12, vault_swipers: 3 }, ask: 'vault_swipers', note: 'Three people appear on a vault swipe: Ines Marr, Priya Nand and Kit Ferro. For those three the inner question finds something.' },
        { line: 1, state: { rows: 12, vault_swipers: 3, kept: 9 }, ask: 'kept', note: 'NOT flips it: the nine the vault log has nothing to say about are the answer.' },
      ]),
    spot('Dax rewrites it as WHERE s.id NOT IN (SELECT staff_id FROM badges). Suppose one badge row had no staff id written down. What happens?',
      ['The same nine names come back',
       'No rows at all, because a comparison against the unknown staff id is never true',
       'SQLite raises an error about the blank',
       'The blank row is skipped and everything else works'],
      1, 'NOT IN against a list holding a blank can never say yes: every comparison lands on unknown, so nothing gets through. NOT EXISTS asks a yes-or-no question instead and is immune.'),
    blank('“The accounts that never sent a penny anywhere. Just the holder.”',
`SELECT holder FROM accounts a WHERE ___ ___ (SELECT 1 FROM transfers t WHERE t.from_acct = a.id)`,
`check_cols("one column named holder", ['holder'])
check_query("the accounts that never sent", "SELECT holder FROM accounts a WHERE NOT EXISTS (SELECT 1 FROM transfers t WHERE t.from_acct = a.id)")
check_query("one transfer out and an account drops off", "SELECT holder FROM accounts a WHERE NOT EXISTS (SELECT 1 FROM transfers t WHERE t.from_acct = a.id)",
            extra="INSERT INTO transfers VALUES (99, 5, 1, 1000, '2026-03-08 09:00');")
check("three on the shipped dump", lambda: len(learner()), 3)
check("Nadia Quill is one of them", lambda: ('Nadia Quill',) in learner(), True)
check("Corvin Holdings sent plenty", lambda: ('Corvin Holdings',) in learner(), False)
check("fewer than the ten accounts", lambda: len(learner()) < len(rows("SELECT id FROM accounts")), True)`),
    mini('Return the name of every staff member who never swiped after dark — no swipe at or after 22:00 and none before 06:00, compared with time(at). One column named name, alphabetical. Order matters.',
      'Stand on a staff row and ask the badge log a yes-or-no question about that person and those hours, then keep the people it answers no to.',
`check_cols("one column named name", ['name'])
check_query("the staff who keep daylight hours", "SELECT name FROM staff s WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id AND (time(b.at) >= '22:00' OR time(b.at) < '06:00')) ORDER BY name", ordered=True)
check_query("one night swipe and a name drops off", "SELECT name FROM staff s WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id AND (time(b.at) >= '22:00' OR time(b.at) < '06:00')) ORDER BY name", ordered=True,
            extra="INSERT INTO badges VALUES (99, 1, 'lobby', '2026-03-08 23:30', 'in');")
check("eight names on the shipped dump", lambda: len(learner()), 8)
check("Bo Lund comes first", lambda: learner()[0], ('Bo Lund',))
check("Otto Kline was up at all hours", lambda: ('Otto Kline',) in learner(), False)
check("alphabetical", lambda: [n for (n,) in learner()] == sorted(n for (n,) in learner()), True)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/who-is-missing.sql`:

```sql
-- Reference solutions for lesson who-is-missing. Blocks: "-- === <node-id>/<step-index>".

-- === who-is-missing/4
SELECT holder FROM accounts a WHERE NOT EXISTS (SELECT 1 FROM transfers t WHERE t.from_acct = a.id)

-- === who-is-missing/5
SELECT name FROM staff s WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id AND (time(b.at) >= '22:00' OR time(b.at) < '06:00')) ORDER BY name
```

- [ ] **Step 4: Create `src/courses/sql/training/name-the-result.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('name-the-result', {
  tier: 'C', xp: 140, requires: ['who-is-missing'], gates: ['thebooks'],
  tools: ['tool-select'],
  title: 'Name the result first', algo: 'Common table expressions',
  steps: [
    explain([
      'The fence wants the payees worth talking to, ranked, banded and totalled. Dax writes one statement with the same GROUP BY buried in it three times, in brackets, inside brackets.',
      'It runs. Nobody can read it, least of all Dax an hour later, and when the bands change he edits two of the three copies.',
      '“Work out the piece you need, give it a name, and write the answer in terms of that name,” Marguerite says. “Name the result first and the rest reads like a sentence.”',
    ], { move: 'brute force' }),
    explain([
      '“WITH sits in front of the statement: WITH totals AS (…), and after the bracket, totals is a table you can select from, join to, or use twice.”',
      '“It lives only for that one statement. Nothing is stored, nothing is left behind, and the name says what the rows are rather than how they were made.”',
    ], { move: 'pick the pattern', code:
`WITH totals AS (
  SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee
)
SELECT payee, total FROM totals WHERE total > 100000;
-- ('Halden Voss', 650000)
-- ('Ines Marr', 120000)
-- ('Otto Kline', 120000)
-- ('Tomas Reed', 150000)` }),
    trace(
`WITH totals AS (
  SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee
)
SELECT payee, total
FROM totals
WHERE total > 100000`,
      'the query above',
      [
        { line: 2, state: { rows: 12 }, ask: 'rows', note: 'The named piece runs over all twelve payments.' },
        { line: 2, state: { rows: 12, piles: 7 }, ask: 'piles', note: 'One pile per payee: seven names, each with a total beside it. That is what totals holds.' },
        { line: 6, state: { rows: 12, piles: 7, kept: 4 }, ask: 'kept', note: 'The outer statement treats totals as an ordinary table and sieves it. Four payees clear a hundred thousand.' },
      ]),
    spot('Why write WITH totals AS (…) instead of repeating the same bracketed SELECT in three places?',
      ['It runs faster in every case',
       'The name is written once, so a change lands once, and the outer statement reads as what it means',
       'A bracketed SELECT cannot be used more than once',
       'It stores the result for the next query'],
      1, 'The win is that one name replaces three copies: edit the piece once, read the outer statement as a sentence. Nothing is stored past the statement, and the planner may or may not make it quicker.'),
    blank('“Name the big transfers, then count them.”',
`___ big AS (SELECT id, amount FROM transfers WHERE amount > 100000) SELECT COUNT(*) AS n FROM ___`,
`check_cols("one column named n", ['n'])
check_query("how many big transfers", "WITH big AS (SELECT id, amount FROM transfers WHERE amount > 100000) SELECT COUNT(*) AS n FROM big")
check_query("one more big transfer", "WITH big AS (SELECT id, amount FROM transfers WHERE amount > 100000) SELECT COUNT(*) AS n FROM big",
            extra="INSERT INTO transfers VALUES (99, 5, 1, 150000, '2026-03-08 09:00');")
check("one row", lambda: len(learner()), 1)
check("five on the shipped dump", lambda: learner()[0][0], 5)
check("it is a number", lambda: type(learner()[0][0]).__name__, 'int')
check("fewer than the fourteen transfers", lambda: learner()[0][0] < 14, True)`),
    mini('Name the payee totals first — sum(amount) per payee — then return the two biggest: two columns named payee and total, largest first, ties broken by the payee name. Order matters.',
      'One named piece holding a name and a total, then an ordinary SELECT over that name with an order and a limit. The second key settles any tie.',
`check_cols("two columns, payee then total", ['payee', 'total'])
check_query("the top two payees", "WITH totals AS (SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee) SELECT payee, total FROM totals ORDER BY total DESC, payee LIMIT 2", ordered=True)
check_query("one huge payment takes first place", "WITH totals AS (SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee) SELECT payee, total FROM totals ORDER BY total DESC, payee LIMIT 2", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Bo Lund', 900000, '2026-03-08', NULL);")
check("exactly two rows", lambda: len(learner()), 2)
check("Halden Voss on 650000 leads", lambda: learner()[0], ('Halden Voss', 650000))
check("Tomas Reed on 150000 is second", lambda: learner()[1], ('Tomas Reed', 150000))
check("biggest first", lambda: learner()[0][1] >= learner()[1][1], True)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/name-the-result.sql`:

```sql
-- Reference solutions for lesson name-the-result. Blocks: "-- === <node-id>/<step-index>".

-- === name-the-result/4
WITH big AS (SELECT id, amount FROM transfers WHERE amount > 100000) SELECT COUNT(*) AS n FROM big

-- === name-the-result/5
WITH totals AS (SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee)
SELECT payee, total FROM totals ORDER BY total DESC, payee LIMIT 2
```

- [ ] **Step 5: Extend the lesson list** — in `src/courses/sql/training/index.js`, add three imports after `theCalendar` and a fourth line to `NODES`:

```js
import questionInside from './question-inside.js'
import whoIsMissing from './who-is-missing.js'
import nameTheResult from './name-the-result.js'
```

```js
export const NODES = [
  pickColumns, narrowItDown, lineThemUp, countWhatIsThere, nothingIsAValue,
  sideBySide, keepTheEmpty, tableMeetsItself,
  pileThemUp, theCalendar,
  questionInside, whoIsMissing, nameTheResult,
]
```

- [ ] **Step 6: Validate, prove, test**

```bash
npm run check
node scripts/test-solutions.mjs
npm test
```

Expected: `✓ 93 training nodes and 30 tools across 4 course(s) look good`; `✓ 138 gates, 214 training drills, … all reference solutions pass`; `npm test` fully green (117 pass, 0 fail).

- [ ] **Step 7: Commit**

```bash
git add src/courses/sql/training scripts/solutions/sql/training
git commit -m "content(sql): C lessons — a question inside a question, who is missing, name the result first"
```

---

### Task 2: The B tier — two lessons

**Files:**
- Create: `src/courses/sql/training/sort-into-bands.js`, `two-lists.js`
- Create: `scripts/solutions/sql/training/sort-into-bands.sql`, `two-lists.sql`
- Modify: `src/courses/sql/training/index.js`

**Interfaces:**
- Consumes `name-the-result` (as `requires`) and the tool ids `tool-null`, `tool-order`.
- Produces `sort-into-bands`, `two-lists`. Task 3's first lesson requires `two-lists`.

- [ ] **Step 1: Create `src/courses/sql/training/sort-into-bands.js`**

```js
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
```

Reference solutions `scripts/solutions/sql/training/sort-into-bands.sql`:

```sql
-- Reference solutions for lesson sort-into-bands. Blocks: "-- === <node-id>/<step-index>".

-- === sort-into-bands/4
SELECT holder, CASE WHEN kind = 'trust' THEN 'watch' ELSE 'ignore' END AS flag FROM accounts

-- === sort-into-bands/5
SELECT CASE WHEN amount < 50000 THEN 'small'
            WHEN amount < 500000 THEN 'medium'
            ELSE 'large' END AS band,
       COUNT(*) AS n
FROM transfers
GROUP BY band
ORDER BY band
```

- [ ] **Step 2: Create `src/courses/sql/training/two-lists.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('two-lists', {
  tier: 'B', xp: 180, requires: ['sort-into-bands'], gates: ['twolists'],
  tools: ['tool-order'],
  title: 'Two lists, one answer', algo: 'UNION, EXCEPT, INTERSECT',
  steps: [
    explain([
      'The Ledger has two columns of names: who paid, and who was paid. The fence wants one list — and then the names on one side that never appear on the other.',
      'Dax copies both columns into a third, sorts it, and spends ten minutes deleting the duplicates by eye. He deletes one he needed and keeps two he did not.',
      '“Stack one list on the other and say which of the three questions you are asking,” Marguerite says. “All of them, only the overlap, or the part that is missing.”',
    ], { move: 'brute force' }),
    explain([
      '“Two SELECTs with the same number of columns can be stacked. UNION keeps each row once, UNION ALL keeps the repeats, INTERSECT keeps only what is in both, EXCEPT keeps the first list minus the second.”',
      '“The answer takes its column names from the first SELECT, and the order of the two sides matters for EXCEPT: payers minus payees is a different question from payees minus payers.”',
    ], { move: 'pick the pattern', code:
`SELECT payer AS name FROM payments
UNION
SELECT payee FROM payments;
-- ten names, each once

SELECT payer AS name FROM payments
EXCEPT
SELECT payee FROM payments;
-- ('Grey Import Co',) ('Roan Textiles',) ('Sable Trust',)` }),
    trace(
`SELECT payer AS name FROM payments
EXCEPT
SELECT payee FROM payments`,
      'the query above',
      [
        { line: 1, state: { payers: 6 }, ask: 'payers', note: 'Six different names pay into the Ledger: two firms, a trust, and three of the staff.' },
        { line: 3, state: { payers: 6, payees: 7 }, ask: 'payees', note: 'Seven different names are paid. The two lists overlap, which is what makes the question interesting.' },
        { line: 2, state: { payers: 6, payees: 7, returns: { py: "[('Grey Import Co',), ('Roan Textiles',), ('Sable Trust',)]" } }, ask: 'returns', note: 'EXCEPT keeps the payers who were never paid — money going one way only, which is what she was looking for.' },
      ]),
    spot('Dax wants every name the Ledger touches and writes UNION ALL instead of UNION. What comes back?',
      ['The same ten names',
       'Twenty-four rows — every payer and every payee, repeats and all',
       'Only the names that appear on both sides',
       'An error about mismatched columns'],
      1, 'UNION ALL stacks the two lists without collapsing anything: twelve payers and twelve payees, one row per payment on each side. UNION is the one that keeps each name once.'),
    blank('“Which of the names being paid out of the Ledger are on Halden\'s own staff list?”',
`SELECT payee AS name FROM payments ___ SELECT name FROM staff`,
`check_cols("one column named name", ['name'])
check_query("the payees who are also staff", "SELECT payee AS name FROM payments INTERSECT SELECT name FROM staff")
check_query("a payment to a new staff member", "SELECT payee AS name FROM payments INTERSECT SELECT name FROM staff",
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'Priya Nand', 5000, '2026-03-08', NULL);")
check("seven names on the shipped dump", lambda: len(learner()), 7)
check("Otto Kline is on both lists", lambda: ('Otto Kline',) in learner(), True)
check("the importer is not staff", lambda: ('Grey Import Co',) in learner(), False)
check("no repeats", lambda: len(learner()) == len(set(learner())), True)`),
    mini('Return the names that appear both in the Ledger as a payee and on the staff list, compared and returned in lower case with lower(payee). One column named name, alphabetical. Order matters.',
      'Fold both sides down before they meet, so a name typed in capitals on one side still finds its match on the other. Only the overlap survives.',
`check_cols("one column named name", ['name'])
check_query("the overlap, in lower case", "SELECT lower(payee) AS name FROM payments INTERSECT SELECT lower(name) FROM staff", ordered=True)
check_query("a payee typed in capitals still matches", "SELECT lower(payee) AS name FROM payments INTERSECT SELECT lower(name) FROM staff", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Sable Trust', 'PRIYA NAND', 5000, '2026-03-08', NULL);")
check("seven names on the shipped dump", lambda: len(learner()), 7)
check("ana petrov comes first", lambda: learner()[0], ('ana petrov',))
check("every name is lower case", lambda: all(n == n.lower() for (n,) in learner()), True)
check("alphabetical", lambda: [n for (n,) in learner()] == sorted(n for (n,) in learner()), True)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/two-lists.sql`:

```sql
-- Reference solutions for lesson two-lists. Blocks: "-- === <node-id>/<step-index>".

-- === two-lists/4
SELECT payee AS name FROM payments INTERSECT SELECT name FROM staff

-- === two-lists/5
SELECT lower(payee) AS name FROM payments INTERSECT SELECT lower(name) FROM staff
```

- [ ] **Step 3: Extend the lesson list** — add two imports and a fifth `NODES` line:

```js
import sortIntoBands from './sort-into-bands.js'
import twoLists from './two-lists.js'
```

```js
  questionInside, whoIsMissing, nameTheResult,
  sortIntoBands, twoLists,
```

- [ ] **Step 4: Validate, prove, test**

```bash
npm run check
node scripts/test-solutions.mjs
npm test
```

Expected: `✓ 95 training nodes and 30 tools across 4 course(s) look good`; `✓ 138 gates, 218 training drills, … all reference solutions pass`; `npm test` green.

- [ ] **Step 5: Commit**

```bash
git add src/courses/sql/training scripts/solutions/sql/training
git commit -m "content(sql): B lessons — sort into bands, two lists one answer"
```

---

### Task 3: The A tier — two windows

**Files:**
- Create: `src/courses/sql/training/running-total.js`, `rank-within.js`
- Create: `scripts/solutions/sql/training/running-total.sql`, `rank-within.sql`
- Modify: `src/courses/sql/training/index.js`

**Interfaces:**
- Consumes `two-lists` (as `requires`) and the tool ids `tool-group`, `tool-order`.
- Produces `running-total`, `rank-within`. Nothing in Task 4 requires them — `climb-the-chain` hangs off `name-the-result` and `table-meets-itself`, per the spec.

- [ ] **Step 1: Create `src/courses/sql/training/running-total.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('running-total', {
  tier: 'A', xp: 200, requires: ['two-lists'], gates: ['runningtotal'],
  tools: ['tool-group'],
  title: 'The running total', algo: 'Window aggregates',
  steps: [
    explain([
      '“Show me it building,” the fence says. “Every payment, and the total so far beside it.” Dax piles them up and hands back one number: the total of everything.',
      'She asks which month the money doubled in. The piles cannot answer that, because the rows that would have shown it were folded away.',
      '“You want both at once,” Marguerite says. “Every row keeps its own line, and every row also gets the total so far. Nothing is folded.”',
    ], { move: 'brute force' }),
    explain([
      '“GROUP BY collapses the rows it counts. OVER does not: it hands the same adding-up to each row while the row stays where it is.”',
      '“SUM(amount) OVER (ORDER BY id) means add up everything from the first row to this one, in that order. PARTITION BY starts the adding again for each new value of a column.”',
    ], { move: 'pick the pattern', code:
`SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running
FROM transfers LIMIT 3;
-- (1, 250000, 250000)
-- (2, 12000, 262000)
-- (3, 480000, 742000)

SELECT SUM(amount) AS total FROM transfers;
-- (5967500,)   one row, every other column gone` }),
    trace(
`SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running
FROM transfers
LIMIT 3`,
      'the query above',
      [
        { line: 2, state: { rows: 14 }, ask: 'rows', note: 'Fourteen transfers on the bench, and fourteen rows will come back — no folding here.' },
        { line: 1, state: { rows: 14, first_running: 250000 }, ask: 'first_running', note: 'The first row looks back at everything up to itself, which is only itself.' },
        { line: 3, state: { rows: 14, first_running: 250000, returns: { py: '[(1, 250000, 250000), (2, 12000, 262000), (3, 480000, 742000)]' } }, ask: 'returns', note: 'Each row carries its own amount and the total of everything up to it: 250000, then 262000, then 742000.' },
      ]),
    spot('Dax writes SELECT id, amount, SUM(amount) FROM transfers with no OVER and no GROUP BY. What comes back?',
      ['Fourteen rows, each with the running total',
       'One row: one id, one amount and the whole total, with the other thirteen rows gone',
       'An error, because id is not grouped',
       'Fourteen rows, each showing 5967500'],
      1, 'Adding up without OVER folds the whole table into one row, and SQLite fills the ungrouped columns from an arbitrary row. OVER is what keeps the fourteen lines on the page.'),
    blank('“Every transfer, in id order, with the money so far beside it.”',
`SELECT id, amount, SUM(amount) ___ (___ BY id) AS running FROM transfers`,
`check_cols("three columns, id then amount then running", ['id', 'amount', 'running'])
check_query("every transfer with the total so far", "SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running FROM transfers", ordered=True)
check_query("one more transfer extends the run", "SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running FROM transfers", ordered=True,
            extra="INSERT INTO transfers VALUES (99, 1, 2, 1000, '2026-03-08 09:00');")
check("fourteen rows, nothing folded", lambda: len(learner()), 14)
check("the first running total is the first amount", lambda: learner()[0], (1, 250000, 250000))
check("the last is everything added up", lambda: learner()[-1][2], 5967500)
check("the run never goes backwards", lambda: all(a[2] <= b[2] for a, b in zip(learner(), learner()[1:])), True)`),
    mini('Return every payment with that payer\'s own total so far — sum(amount) restarted for each payer, in date then id order. Three columns named payer, paid_on and running, ordered by payer then paid_on then id. Order matters.',
      'The same adding-up, but started again for each new payer. Both the restart and the order live inside the brackets after OVER.',
`check_cols("three columns, payer then paid_on then running", ['payer', 'paid_on', 'running'])
check_query("each payer's own running total", "SELECT payer, paid_on, SUM(amount) OVER (PARTITION BY payer ORDER BY paid_on, id) AS running FROM payments ORDER BY payer, paid_on, id", ordered=True)
check_query("an earlier payment shifts one payer's run", "SELECT payer, paid_on, SUM(amount) OVER (PARTITION BY payer ORDER BY paid_on, id) AS running FROM payments ORDER BY payer, paid_on, id", ordered=True,
            extra="INSERT INTO payments VALUES (99, 'Halden Voss', 'Bo Lund', 5000, '2026-01-01', NULL);")
check("twelve rows, one per payment", lambda: len(learner()), 12)
check("Grey Import Co starts at 400000", lambda: learner()[0], ('Grey Import Co', '2026-02-01', 400000))
check("and reaches 490000", lambda: learner()[1], ('Grey Import Co', '2026-02-20', 490000))
check("Halden Voss ends on 145000", lambda: [r for r in learner() if r[0] == 'Halden Voss'][-1][2], 145000)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/running-total.sql`:

```sql
-- Reference solutions for lesson running-total. Blocks: "-- === <node-id>/<step-index>".

-- === running-total/4
SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running FROM transfers

-- === running-total/5
SELECT payer, paid_on, SUM(amount) OVER (PARTITION BY payer ORDER BY paid_on, id) AS running
FROM payments
ORDER BY payer, paid_on, id
```

- [ ] **Step 2: Create `src/courses/sql/training/rank-within.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('rank-within', {
  tier: 'A', xp: 240, requires: ['running-total'], gates: ['toppercamera'],
  tools: ['tool-order'],
  title: 'Rank within each', algo: 'Ranking windows',
  steps: [
    explain([
      '“The newest camera on each floor,” the fence says. Dax sorts the sheet by floor and then by date, and reads off the first row of each block.',
      'He reads two of the four blocks the wrong way round, because the dates run down the page in one place and up it in another, and nothing on the sheet says which.',
      '“Number them within their own floor, newest first, then keep the ones numbered one,” Marguerite says. “One rule, four floors, no reading by eye.”',
    ], { move: 'brute force' }),
    explain([
      '“ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) hands each row its place inside its own floor. The partition says which group, the order says which end is first.”',
      '“That number is worked out after WHERE and before the answer is shaped, so you cannot sieve on it in the same SELECT. Wrap the statement and sieve outside — a named piece does that neatly.”',
    ], { move: 'pick the pattern', code:
`SELECT zone, floor,
       ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn
FROM cameras;
-- ('loading-bay', 0, 1)
-- ('lobby', 0, 2)
-- ('corridor', 1, 1)
-- ... eight rows, numbered inside each floor` }),
    trace(
`SELECT zone, floor,
       ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn
FROM cameras`,
      'the query above',
      [
        { line: 3, state: { rows: 8 }, ask: 'rows', note: 'Eight cameras on the bench, spread over four floors.' },
        { line: 2, state: { rows: 8, partitions: 4 }, ask: 'partitions', note: 'One numbering run per floor: 0, 1, 2 and 3. Floor 2 holds three cameras, floor 3 holds one.' },
        { line: 1, state: { rows: 8, partitions: 4, returns: { py: "[('loading-bay', 0, 1), ('lobby', 0, 2), ('corridor', 1, 1), ('tellers', 1, 2), ('vault-inside', 2, 1), ('stairs', 2, 2), ('vault-door', 2, 3), ('server-room', 3, 1)]" } }, ask: 'returns', note: 'Every row keeps its place, and the newest camera on each floor is the one numbered 1.' },
      ]),
    spot('Two cameras on one floor were installed on the same day. What is the difference between ROW_NUMBER() and RANK() there?',
      ['None; both number them 1 and 2',
       'ROW_NUMBER gives 1 and 2 in an order it picks; RANK gives both 1 and then skips to 3',
       'RANK refuses to number tied rows',
       'ROW_NUMBER gives both 1'],
      1, 'ROW_NUMBER always hands out distinct places, breaking a tie however it likes unless you add another key. RANK gives tied rows the same place and leaves a gap after them. Pick the one whose answer you can defend.'),
    blank('“Number every camera inside its own floor, newest first.”',
`SELECT zone, ___() OVER (PARTITION BY floor ORDER BY installed ___) AS rn FROM cameras`,
`check_cols("two columns, zone then rn", ['zone', 'rn'])
check_query("each camera's place on its floor", "SELECT zone, ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn FROM cameras", ordered=True)
check_query("a brand new camera takes first place on its floor", "SELECT zone, ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn FROM cameras", ordered=True,
            extra="INSERT INTO cameras VALUES (99, 2, 'vault-roof', '2026-01-01');")
check("eight rows, nothing folded", lambda: len(learner()), 8)
check("the loading bay is newest on its floor", lambda: learner()[0], ('loading-bay', 1))
check("four cameras are numbered one", lambda: sum(1 for _, rn in learner() if rn == 1), 4)
check("the tallest number is three", lambda: max(rn for _, rn in learner()), 3)`),
    mini('Return the two newest cameras on each floor: three columns named floor, zone and rn, where rn is the camera\'s place inside its floor from row_number() with the newest first. Ordered by floor then rn. Order matters.',
      'Number them inside the statement, then sieve on that number from outside it — the place cannot be tested where it is worked out. A floor with one camera contributes one row.',
`check_cols("three columns, floor then zone then rn", ['floor', 'zone', 'rn'])
check_query("the top two on every floor", "SELECT floor, zone, rn FROM (SELECT floor, zone, ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn FROM cameras) AS ranked WHERE rn <= 2 ORDER BY floor, rn", ordered=True)
check_query("a new camera pushes floor two along", "SELECT floor, zone, rn FROM (SELECT floor, zone, ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn FROM cameras) AS ranked WHERE rn <= 2 ORDER BY floor, rn", ordered=True,
            extra="INSERT INTO cameras VALUES (99, 2, 'vault-roof', '2026-01-01');")
check("seven rows on the shipped dump", lambda: len(learner()), 7)
check("the loading bay leads floor zero", lambda: learner()[0], (0, 'loading-bay', 1))
check("no row numbered three survives", lambda: all(rn <= 2 for _, _, rn in learner()), True)
check("the top floor contributes its one camera", lambda: (3, 'server-room', 1) in learner(), True)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/rank-within.sql`:

```sql
-- Reference solutions for lesson rank-within. Blocks: "-- === <node-id>/<step-index>".

-- === rank-within/4
SELECT zone, ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn FROM cameras

-- === rank-within/5
SELECT floor, zone, rn
FROM (SELECT floor, zone,
             ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn
      FROM cameras) AS ranked
WHERE rn <= 2
ORDER BY floor, rn
```

- [ ] **Step 3: Extend the lesson list** — add two imports and a fifth `NODES` line:

```js
import runningTotal from './running-total.js'
import rankWithin from './rank-within.js'
```

```js
  sortIntoBands, twoLists,
  runningTotal, rankWithin,
```

- [ ] **Step 4: Validate, prove, test**

```bash
npm run check
node scripts/test-solutions.mjs
npm test
```

Expected: `✓ 97 training nodes and 30 tools across 4 course(s) look good`; `✓ 138 gates, 222 training drills, … all reference solutions pass`; `npm test` green.

- [ ] **Step 5: Commit**

```bash
git add src/courses/sql/training scripts/solutions/sql/training
git commit -m "content(sql): A lessons — the running total, rank within each"
```

---

### Task 4: The S capstone, the docs, and the browser check

**Files:**
- Create: `src/courses/sql/training/climb-the-chain.js`, `scripts/solutions/sql/training/climb-the-chain.sql`
- Modify: `src/courses/sql/training/index.js`, `CLAUDE.md`

**Interfaces:**
- Consumes `name-the-result` and `table-meets-itself` (as `requires`) and the tool id `tool-table`.
- Produces `climb-the-chain`, the eighteenth and last lesson of the course.

- [ ] **Step 1: Create `src/courses/sql/training/climb-the-chain.js`**

```js
import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('climb-the-chain', {
  tier: 'S', xp: 300, requires: ['name-the-result', 'table-meets-itself'], gates: ['reportsto', 'thebooks'],
  tools: ['tool-table'],
  title: 'Climb the chain', algo: 'Recursive CTEs',
  steps: [
    explain([
      'Ana Petrov signs for the loading bay at ten at night. “Who does she answer to,” the fence says, “and who do they answer to, all the way up.”',
      'Dax joins the staff table to itself, which gets him her manager. He joins it again for the manager\'s manager, and again, and stops when the statement will not fit on the screen — with no idea whether he reached the top.',
      '“One more join is one more step,” Marguerite says. “Write the step once and let it keep taking it until there is nowhere left to step.”',
    ], { move: 'brute force' }),
    explain([
      '“WITH RECURSIVE names a walk. The first SELECT is where you start; then UNION ALL; then a second SELECT that joins the table back onto the name you are defining.”',
      '“Each pass works on what the last pass produced. When a pass finds nothing, the walk stops on its own — the row at the top has no manager to step to, so that is where the climb ends.”',
    ], { move: 'pick the pattern', code:
`WITH RECURSIVE up(id, name, manager_id, step) AS (
  SELECT id, name, manager_id, 0 FROM staff WHERE id = 8
  UNION ALL
  SELECT s.id, s.name, s.manager_id, up.step + 1
  FROM staff s JOIN up ON s.id = up.manager_id
)
SELECT name, step FROM up;
-- ('Ruth Ash', 0) ('Otto Kline', 1) ('Tomas Reed', 2) ('Halden Voss', 3)` }),
    trace(
`WITH RECURSIVE up(id, name, manager_id, step) AS (
  SELECT id, name, manager_id, 0 FROM staff WHERE id = 8
  UNION ALL
  SELECT s.id, s.name, s.manager_id, up.step + 1
  FROM staff s JOIN up ON s.id = up.manager_id
)
SELECT name, step FROM up`,
      'the query above',
      [
        { line: 2, state: { start: 'Ruth Ash' }, ask: 'start', note: 'The first SELECT runs once and seeds the walk with a single row: staff id 8, at step 0.' },
        { line: 4, state: { start: 'Ruth Ash', after_two_passes: 3 }, ask: 'after_two_passes', note: 'Each pass steps from what the last pass produced: Ruth Ash to Otto Kline, then Otto Kline to Tomas Reed. Three rows collected so far.' },
        { line: 7, state: { start: 'Ruth Ash', after_two_passes: 3, returns: { py: "[('Ruth Ash', 0), ('Otto Kline', 1), ('Tomas Reed', 2), ('Halden Voss', 3)]" } }, ask: 'returns', note: 'The fourth row is the top of the firm. It carries no manager id, so the next pass finds nothing and the walk stops.' },
      ]),
    spot('Dax seeds the walk with every staff row instead of one, and joins on s.manager_id = up.manager_id by mistake. What is the danger?',
      ['Nothing; it just returns more rows',
       'A step that can reach a row it has already produced never runs out of work, and the walk goes round for ever',
       'SQLite refuses more than one seed row',
       'The walk stops immediately'],
      1, 'The walk ends when a pass produces nothing new. A step that loops back onto its own rows always produces something, so the statement never finishes. Step along the link that only ever goes one way — a child to its parent.'),
    blank('“Ana Petrov is staff id 12. Name everyone on the chain above her, herself included.”',
`WITH RECURSIVE up(id, name, manager_id) AS (
  SELECT id, name, manager_id FROM staff WHERE id = ___
  UNION ALL
  SELECT s.id, s.name, s.manager_id FROM staff s JOIN up ON ___ = up.manager_id
)
SELECT name FROM up`,
`check_cols("one column named name", ['name'])
check_query("Ana Petrov and everyone above her", "WITH RECURSIVE up(id, name, manager_id) AS (SELECT id, name, manager_id FROM staff WHERE id = 12 UNION ALL SELECT s.id, s.name, s.manager_id FROM staff s JOIN up ON s.id = up.manager_id) SELECT name FROM up", ordered=True)
check_query("a new head of the firm adds a step", "WITH RECURSIVE up(id, name, manager_id) AS (SELECT id, name, manager_id FROM staff WHERE id = 12 UNION ALL SELECT s.id, s.name, s.manager_id FROM staff s JOIN up ON s.id = up.manager_id) SELECT name FROM up", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', 'board', '2000-01-01', NULL); UPDATE staff SET manager_id = 99 WHERE id = 1;")
check("five names on the shipped dump", lambda: len(learner()), 5)
check("she is the first of them", lambda: learner()[0], ('Ana Petrov',))
check("the top of the firm is the last", lambda: learner()[-1], ('Halden Voss',))
check("no name twice", lambda: len(learner()) == len(set(learner())), True)`),
    mini('Ines Marr is staff id 2. Return everyone below her, however deep: two columns named name and depth, where her direct reports are depth 1 and their reports depth 2. Build the walk as down(id, name, depth) and leave Ines herself out. Ordered by depth then name. Order matters.',
      'Same shape as the climb with one link turned round: step from a row to the people whose manager id points at it. Seed at depth 0 and drop that row at the end.',
`check_cols("two columns, name then depth", ['name', 'depth'])
check_query("everyone under Ines Marr", "WITH RECURSIVE down(id, name, depth) AS (SELECT id, name, 0 FROM staff WHERE id = 2 UNION ALL SELECT s.id, s.name, down.depth + 1 FROM staff s JOIN down ON s.manager_id = down.id) SELECT name, depth FROM down WHERE depth > 0 ORDER BY depth, name", ordered=True)
check_query("a new hire three steps down", "WITH RECURSIVE down(id, name, depth) AS (SELECT id, name, 0 FROM staff WHERE id = 2 UNION ALL SELECT s.id, s.name, down.depth + 1 FROM staff s JOIN down ON s.manager_id = down.id) SELECT name, depth FROM down WHERE depth > 0 ORDER BY depth, name", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', 'vault', '2026-01-01', 9);")
check("five people under her", lambda: len(learner()), 5)
check("Lena Brack reports to her directly", lambda: ('Lena Brack', 1) in learner(), True)
check("Kit Ferro is two steps down", lambda: ('Kit Ferro', 2) in learner(), True)
check("Ines herself is not in the answer", lambda: all(n != 'Ines Marr' for n, _ in learner()), True)`),
  ],
})
```

Reference solutions `scripts/solutions/sql/training/climb-the-chain.sql`:

```sql
-- Reference solutions for lesson climb-the-chain. Blocks: "-- === <node-id>/<step-index>".

-- === climb-the-chain/4
WITH RECURSIVE up(id, name, manager_id) AS (
  SELECT id, name, manager_id FROM staff WHERE id = 12
  UNION ALL
  SELECT s.id, s.name, s.manager_id FROM staff s JOIN up ON s.id = up.manager_id
)
SELECT name FROM up

-- === climb-the-chain/5
WITH RECURSIVE down(id, name, depth) AS (
  SELECT id, name, 0 FROM staff WHERE id = 2
  UNION ALL
  SELECT s.id, s.name, down.depth + 1 FROM staff s JOIN down ON s.manager_id = down.id
)
SELECT name, depth FROM down WHERE depth > 0 ORDER BY depth, name
```

- [ ] **Step 2: Finish the lesson list** — add the last import and a sixth `NODES` line:

```js
import climbTheChain from './climb-the-chain.js'
```

```js
  runningTotal, rankWithin,
  climbTheChain,
```

- [ ] **Step 3: Write the course into `CLAUDE.md`**

  a. In **Layout**, after the `src/courses/oop/` bullet, add these two bullets:

```markdown
- `src/courses/sql/` — the SQL course "The Books": same layout as the others plus `fixture.sql` (the one frozen database, six tables) and `harness_sql.py` (`rows`, `learner`, `learner_cols`, `check_query`, `check_cols` over `sqlite3`). Runner `sql`, stats `filter`, `join`, `shape`. No `scene` anywhere. Six tools: table, select, where, order, group, null. Reference solutions in `scripts/solutions/sql/` as `.sql` files, blocks `-- === <id>`. The learner writes one SELECT statement per gate and per drill.
- `src/sqlwrap.js` — pure helpers for the SQL runner: `wrapSql` (the learner's statement as a Python raw string, ending in a newline so a trailing quote or backslash cannot break the wrap) and `bundleSql` (harness.py + fixture + harness_sql.py). `src/runner.js` picks the wrap and the bundle from the course's `runner` field; `RUNNERS` is `['python', 'sql']`.
```

  b. In **The story (keep it consistent)**, after the OOP bullet, add these two bullets:

```markdown
- SQL course ("The Books"): after The Blueprint. The crew lifted a dump of Halden's internal database along with the Ledger — staff, accounts, transfers, badge swipes, cameras and the Ledger's own payments. The fence pays for answers, not rows. Dax exports every table to a spreadsheet and scrolls; Marguerite asks the database. Arcs: I The dump (one table) · II Who talks to whom (joins) · III The totals (piles) · IV Inside the question (a question inside a question, bands, two lists) · V The Books (running totals, ranks, the climb, the capstone). Stats `filter`, `join`, `shape`. Lessons: Pick the columns · Narrow it down · Line them up · Count what is there · Nothing is a value · Side by side · Keep the ones with nobody · The table meets itself · Pile them up · The calendar · A question inside a question · Who is missing · Name the result first · Sort into bands · Two lists, one answer · The running total · Rank within each · Climb the chain.
- SQL prose rule: SQL keywords are code and allowed anywhere. Banned from story lines, missions and hints: aggregate, subquery, window function, common table expression, CTE, recursive, predicate, projection, cardinality, normalisation — those live in `algo` and in spot steps. A mini's mission names the lowercase SQL function the answer needs (`sum(amount)`, `time(at)`, `row_number()`), which is also what satisfies the validator's "mission must name a function" rule.
```

  c. In **Run**, append one sentence to the existing `npm run check` line so it reads `… Run both after every content change. Reference solutions are Python for the three Python courses and `.sql` for The Books.`

- [ ] **Step 4: Validate, prove, test, build**

```bash
npm run check
node scripts/test-solutions.mjs
npm test
npm run build
```

Expected: `✓ 98 training nodes and 30 tools across 4 course(s) look good`; `✓ 138 gates, 224 training drills, … all reference solutions pass`; `npm test` green; build ok.

- [ ] **Step 5: Browser check** — `npm run dev`, fresh save slot, Jobs → The Books → Training

  - The Jobs row reads "The Books · SQL · … · 20 gates · 18 lessons", and the training room shows all seven tier tabs with F 5 · E 3 · D 2 · C 3 · B 2 · A 2 · S 1.
  - Every locked row names what it needs. `Climb the chain` shows `needs: Name the result first, The table meets itself` — not the A-tier lessons — which is the spec's prerequisite, so confirm it reads that way.
  - Open `A question inside a question` and walk it: the trace accepts `426250.0`, `14`, then `[(3, 480000), (5, 1500000), (13, 3200000)]`; the spot's second option; the blank with `from_acct`; the mini with its reference query. (Unlocking it means clearing its chain first, or opening a save seeded with those lessons and tools cleared.)
  - Open `Climb the chain` and walk the trace: `Ruth Ash`, `3`, then `[('Ruth Ash', 0), ('Otto Kline', 1), ('Tomas Reed', 2), ('Halden Voss', 3)]`. Its blank and mini both run `WITH RECURSIVE` through Pyodide — the point of this check is that the browser's SQLite accepts the walk, not just Python's.
  - Switch to The Ledger and back, then reload: cleared lessons and kit progress survive. No console errors beyond the pre-existing `/favicon.ico` 404, and no three.js chunk in the network panel.

- [ ] **Step 6: Commit**

```bash
git add src/courses/sql/training scripts/solutions/sql/training CLAUDE.md
git commit -m "content(sql): the S lesson — climb the chain; the course in CLAUDE.md"
```

- [ ] **Step 7: Finish the branch** — follow superpowers:finishing-a-development-branch to merge `sql-lessons-c-s` into `main`.

---

## Self-review

- **Spec coverage.** The spec's lesson table rows eleven to eighteen, with its `algo` values, titles, tools and prepared gates, and its `requires` rules (`question-inside` ← `pile-them-up`; `climb-the-chain` ← `name-the-result` + `table-meets-itself`; the rest the table order): Tasks 1–4. The spec's rollout also asks plan 4 for "CLAUDE.md layout, story and prose rule" — Task 4 Step 3 covers layout, story, prose rule and the runner note.
- **Placeholder scan.** Every lesson file, drill test, reference query and CLAUDE.md insertion is written out in full. Each validation step carries real expected numbers (93 → 95 → 97 → 98 nodes; 214 → 218 → 222 → 224 drills), and there is no expected red in this plan.
- **Type consistency.** Every `check_query` reference statement matches the matching `.sql` block; every `check_cols` list matches the columns that statement produces; every `requires` names a lesson that exists (the ten shipped in plan 3, plus earlier lessons in this one); every `gates` entry names a shipped gate (abovemean, neverswiped, thebooks, bucket, twolists, runningtotal, toppercamera, reportsto); every `tools` entry names a shipped tool. Every number and tuple asserted was run against the frozen fixture first: the transfer average 426,250 and the three rows above it; Corvin Holdings behind the biggest transfer; three payments above the payment average, led by `(4, 400000)`; nine staff who never swiped the vault and eight who never swiped after dark; three accounts that never sent; the four payee totals over 100,000 and the top two `('Halden Voss', 650000)`, `('Tomas Reed', 150000)`; five transfers over 100,000; the CASE bands 2 large / 6 medium / 6 small and the twelve staff split 1 unfiled / 3 inside / 8 outside; the two trust accounts; the three payers never paid and the seven payees who are staff; the transfer running totals 250000 → 262000 → 742000 ending 5,967,500; Grey Import Co's per-payer run 400000 → 490000 and Halden Voss ending 145,000; the eight camera places with four numbered 1 and a maximum of 3, and the seven rows of the top-two-per-floor answer; the climb from Ruth Ash `[0, 1, 2, 3]` ending at Halden Voss; the five names above Ana Petrov; and the five people below Ines Marr at depths 1 and 2.
