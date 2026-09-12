# The Books — plan 1: the SQL runner and Arc I — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the shell run SQL through the existing Pyodide worker, and ship the SQL course "The Books" with its fixture database, harness, first arc (four gates) and first tool, proven by reference solutions, so the Jobs screen offers four courses.

**Architecture:** A pure module `src/sqlwrap.js` wraps a learner's SQL as a Python raw string and bundles the harness (`harness.py` + fixture + `harness_sql.py`); `runner.js` picks the wrap and bundle by a new `runner` argument; the worker is untouched. The course folder `src/courses/sql/` mirrors the other courses and adds `fixture.sql` and `harness_sql.py`. `test-solutions.mjs` learns to read `.sql` solution files and wrap them the same way. Lessons come in plans 3–4, so `NODES = []` and the "every tool is required" test skip is reinstated for lesson-less courses.

**Tech Stack:** Vue 3, plain JS content modules, Python 3 (`sqlite3` stdlib) for tests, proofs and the harness; Pyodide 0.26.4 in the browser.

**Spec:** `docs/superpowers/specs/2026-09-12-sql-course-design.md`

## Global Constraints

- Course card: id `sql`, title `The Books`, plain name `SQL`, runner `sql`, stats `['filter', 'join', 'shape']`. Registered last: `COURSES = [algorithms, oop, patterns, sql]`. `RUNNERS = ['python', 'sql']`.
- The learner writes exactly one SQL statement. Tests are Python strings using `check_query`, `check_cols`, `rows`, `learner`, `learner_cols` from `harness_sql.py` and `check()` from `harness.py`. Every gate test has at least one `check_query` on the untouched fixture and one with `extra` rows; `check_cols` when the mission names columns; `ordered=True` only when the mission says order matters.
- The fixture is frozen at the end of this plan. Tests add rows through `extra`, never edit the file.
- No step anywhere in this course sets `scene`.
- Story: same crew, after The Blueprint. The crew lifted a dump of Halden's internal database with the Ledger; the fence pays for answers, not rows; Dax exports every table to a spreadsheet and scrolls; the learner asks the database. Voice: short, wry, concrete. No real anime, manga or game references.
- Gate schema per CLAUDE.md: `g(id, rank, xp, stat, title, algo, story, mission, hint, code?)`. `story` 2–4 lines, one starting with `“`. Mission names the columns to return and whether order matters, plus a stretch. `code` on `pullnames` and `nightdoors` shows expected rows.
- xp by rank: F 40–50. Tool schema: `tool(id, { xp: 30, title, algo, steps: [explain, explain, trace, blank] })`; blank 4–7 checks with `___`; tool prose may name its own clause.
- Prose rule: SQL keywords are code and allowed anywhere. Banned from story lines, missions and hints: aggregate, subquery, window function, common table expression, CTE, recursive, predicate, projection, cardinality, normalisation.
- Reference solutions: `scripts/solutions/sql/arc1.sql` with blocks `-- === <gate id>`; `scripts/solutions/sql/training/tool-table.sql` with `-- === tool-table/3`.
- `npm test`, `npm run check`, `npm run build` green at the end of every task (Tasks 2 and 3 note the one expected red). Baseline: 118 gates, 182 drills, 1939 checks, 80 nodes, 24 tools, 110 unit tests.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Branch `sql-runner-arc1` off `main`.

---

## File structure

| Path | Responsibility |
|---|---|
| `src/sqlwrap.js` | Pure: `wrapSql(text)`, `bundleSql(harness, fixture, harnessSql)`. No imports. |
| `src/runner.js` | `runTests(code, tests, runner = 'python')`; imports fixture and harness_sql raw; picks wrap and bundle. |
| `src/store.js` | Passes `course.value.runner` to both `runTests` calls. |
| `src/components/QuestWindow.vue`, `StepCode.vue`, `StepTrace.vue` | Wording keyed on `s.course.value.runner === 'sql'`. |
| `src/courses/index.js` | Registers the course; `RUNNERS` gains `sql`. |
| `src/courses/sql/course.js`, `index.js`, `gates.js`, `tests.js`, `training/index.js`, `training/tools/index.js`, `training/tools/tool-table.js` | The course skeleton, Arc I, first tool. |
| `src/courses/sql/fixture.sql` | The one database. |
| `src/courses/sql/harness_sql.py` | SQL helpers over sqlite3. |
| `scripts/test-solutions.mjs` | `.sql` solution files, `-- ===` blocks, SQL wrap for `runner === 'sql'`. |
| `scripts/solutions/sql/arc1.sql`, `training/tool-table.sql` | Reference solutions. |
| `tests/sqlwrap.test.mjs` | Unit tests for the wrap and bundle. |
| `tests/courses.test.mjs`, `tests/training-tools.test.mjs` | Four courses, `RUNNERS`, `EXPECTED_TOOLS.sql = 6`, skip for lesson-less courses reinstated. |

---

### Task 1: The runner switch

**Files:**
- Create: `src/sqlwrap.js`, `tests/sqlwrap.test.mjs`, placeholder `src/courses/sql/fixture.sql`, placeholder `src/courses/sql/harness_sql.py`
- Modify: `src/runner.js`, `src/store.js:156,194`, `src/components/QuestWindow.vue`, `src/components/StepCode.vue`, `src/components/StepTrace.vue`

**Interfaces:**
- Produces `wrapSql(text: string): string` and `bundleSql(harness: string, fixture: string, harnessSql: string): string`, both pure; `runTests(code, tests, runner = 'python')`.
- Consumed by Task 2 (`test-solutions.mjs` imports `wrapSql` and `bundleSql` from `../src/sqlwrap.js`).

- [ ] **Step 1: Branch** `git checkout main && git checkout -b sql-runner-arc1`.

- [ ] **Step 2: Write the failing unit test** `tests/sqlwrap.test.mjs`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wrapSql, bundleSql } from '../src/sqlwrap.js'

test('wrapSql wraps plain text as a raw triple-quoted Python string', () => {
  assert.equal(wrapSql('SELECT 1'), "__sql = r'''SELECT 1'''")
})

test('wrapSql survives a triple quote inside the text', () => {
  const wrapped = wrapSql("SELECT '''x'''")
  assert.ok(!wrapped.includes("''''"), 'no run of four quotes')
  assert.equal(wrapped, `__sql = r'''SELECT ''' "'''" r'''x''' "'''" r''''''`)
})

test('wrapSql of empty text is an empty statement', () => {
  assert.equal(wrapSql(''), "__sql = r''''''")
})

test('bundleSql puts the fixture between the two harnesses', () => {
  const b = bundleSql('H', 'CREATE TABLE t (x);', 'S')
  assert.equal(b, "H\n__fixture = r'''CREATE TABLE t (x);'''\nS")
})

test('bundleSql refuses a fixture containing a triple quote', () => {
  assert.throws(() => bundleSql('H', "x '''", 'S'), /triple quote/)
})
```
Run: `node --test tests/sqlwrap.test.mjs` → FAIL, cannot find module.

- [ ] **Step 3: Write `src/sqlwrap.js`**:
```js
// Pure helpers for the SQL runner. The learner's statement travels to the Python worker as a raw
// string; the SQL harness reads it back as __sql. Shared by runner.js and scripts/test-solutions.mjs.

// A ''' inside the text would end the raw string early. Close, splice a plain "'''", reopen.
export function wrapSql(text) {
  return `__sql = r'''${String(text).split("'''").join(`''' "'''" r'''`)}'''`
}

// harness.py, then the fixture as __fixture, then harness_sql.py, all in one namespace.
export function bundleSql(harness, fixture, harnessSql) {
  if (fixture.includes("'''")) throw new Error('fixture.sql may not contain a triple quote')
  return `${harness}\n__fixture = r'''${fixture}'''\n${harnessSql}`
}
```
Run: `node --test tests/sqlwrap.test.mjs` → 5 pass. (`r''''''` is an empty raw triple-quoted string in Python; verified: `python -c "__sql = r''''''; print(repr(__sql))"` prints `''`.)

- [ ] **Step 4: Runner switch** in `src/runner.js`. Create the two placeholder files first so Vite's `?raw` import resolves: `src/courses/sql/fixture.sql` containing `-- fixture lands in plan 1 task 2` and `src/courses/sql/harness_sql.py` containing `# harness lands in plan 1 task 2`. Then:
```js
import harness from './harness.py?raw'
import fixture from './courses/sql/fixture.sql?raw'
import harnessSql from './courses/sql/harness_sql.py?raw'
import { wrapSql, bundleSql } from './sqlwrap.js'

const HARNESS = { python: harness, sql: bundleSql(harness, fixture, harnessSql) }
const WRAP = { python: code => code, sql: wrapSql }
```
and in `runTests(code, tests, runner = 'python')` replace the postMessage line with:
```js
worker.postMessage({ id, code: WRAP[runner](code), harness: HARNESS[runner], tests })
```

- [ ] **Step 5: Store** — in `runStepTests` and `test(g)` pass the runner:
```js
const r = await runTests(stepCode.value, st.tests, course.value.runner)
…
const r = await runTests(notes.value[g.id] || '', g.tests, course.value.runner)
```

- [ ] **Step 6: Components.** In `StepCode.vue` and `QuestWindow.vue` add `const sql = () => s.course.value.runner === 'sql'` and use it:
  - editor label: StepCode `{{ sql() ? 'Your SQL' : 'Your Python' }} (saved locally)`; QuestWindow `{{ sql() ? 'Your SQL' : 'Your solution' }} (saved locally)`.
  - placeholder: `:placeholder="sql() ? '-- write your query here' : '# write your Python here'"`.
  - `runLabel`: `s.runtime.value === 'loading' ? (sql() ? 'Loading the database…' : 'Loading Python…') : 'Running…'`.
  - loading note: `{{ sql() ? 'First run downloads the runtime (about 10 MB).' : 'First run downloads the Python runtime (about 10 MB).' }}`.
  In `StepTrace.vue`, with the same helper (it already calls `useStore()` as `s`; if not, add `const s = useStore()`):
  `<p>{{ sql() ? 'Query' : 'Call' }}: <code>{{ step.input }}</code>. At each stop, type the value of the highlighted variable exactly as Python would print it{{ sql() ? ' (rows come back as tuples)' : '' }}.</p>`

- [ ] **Step 7: Verify nothing moved.** `npm test && npm run check && npm run build` → unit tests 115 pass (110 + 5), proofs unchanged (`✓ 118 gates, 182 training drills, 1939 checks`), build ok. `npm run dev`: open an algorithms gate, run tests → still passes (runner default `python`).

- [ ] **Step 8: Commit** `feat(runner): SQL runner switch — wrapSql, bundleSql, runner argument, editor wording`.

---

### Task 2: The Books — fixture, harness, skeleton, Arc I, proofs

**Files:**
- Create: `src/courses/sql/course.js`, `index.js`, `gates.js`, `tests.js`, `training/index.js`, `training/tools/index.js`
- Replace placeholders: `src/courses/sql/fixture.sql`, `src/courses/sql/harness_sql.py`
- Create: `scripts/solutions/sql/arc1.sql`
- Modify: `src/courses/index.js`, `scripts/test-solutions.mjs`, `tests/courses.test.mjs`, `tests/training-tools.test.mjs`

**Interfaces:**
- Consumes `wrapSql`, `bundleSql` (Task 1).
- Produces the `sql` course object, the frozen fixture, the harness helpers `rows(sql, extra=None)`, `learner(extra=None)`, `learner_cols()`, `check_query(label, ref_sql, ordered=False, extra=None)`, `check_cols(label, names)`; gate ids `pullnames`, `bigmoves`, `nightdoors`, `howmany`.

- [ ] **Step 1: Registry tests (fail first).** In `tests/courses.test.mjs` change the first test to:
```js
test('algorithms, oop, patterns, sql in that order; algorithms default', () => {
  assert.deepEqual(COURSES.map(c => c.id), ['algorithms', 'oop', 'patterns', 'sql'])
  assert.equal(DEFAULT_COURSE, 'algorithms')
  assert.deepEqual(RUNNERS, ['python', 'sql'])
  assert.equal(courseById('sql').title, 'The Books')
  assert.equal(courseById('sql').runner, 'sql')
  assert.deepEqual(courseById('sql').stats, ['filter', 'join', 'shape'])
  assert.equal(courseById('oop').title, 'The Manifest')
  assert.equal(courseById('patterns').title, 'The Blueprint')
  assert.equal(courseById('nope'), null)
})
```
In `tests/training-tools.test.mjs`: `EXPECTED_TOOLS = { algorithms: 12, oop: 6, patterns: 6, sql: 6 }` and reinstate, as the first line inside the loop of the "every tool is required" test: `if (!NODES.length) continue // a course whose lessons have not landed yet has nothing to require`. Run `node --test tests/courses.test.mjs` → FAIL on the order.

- [ ] **Step 2: Registry.** `src/courses/index.js`:
```js
import { course as algorithms } from './algorithms/course.js'
import { course as oop } from './oop/course.js'
import { course as patterns } from './patterns/course.js'
import { course as sql } from './sql/course.js'

export const COURSES = [algorithms, oop, patterns, sql]
export const DEFAULT_COURSE = 'algorithms'
export const RUNNERS = ['python', 'sql']
export const courseById = id => COURSES.find(c => c.id === id) ?? null
```

- [ ] **Step 3: The fixture** `src/courses/sql/fixture.sql` (frozen after this plan):
```sql
-- Halden's internal dump plus the Ledger. One database for every gate and drill in The Books.
-- Amounts are pence. Timestamps are ISO text. Frozen: tests add rows through `extra`, never here.
CREATE TABLE staff    (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, hired TEXT, manager_id INTEGER);
CREATE TABLE accounts (id INTEGER PRIMARY KEY, holder TEXT, kind TEXT, branch TEXT, opened TEXT);
CREATE TABLE transfers(id INTEGER PRIMARY KEY, from_acct INTEGER, to_acct INTEGER, amount INTEGER, at TEXT);
CREATE TABLE badges   (id INTEGER PRIMARY KEY, staff_id INTEGER, door TEXT, at TEXT, direction TEXT);
CREATE TABLE cameras  (id INTEGER PRIMARY KEY, floor INTEGER, zone TEXT, installed TEXT);
CREATE TABLE payments (id INTEGER PRIMARY KEY, payer TEXT, payee TEXT, amount INTEGER, paid_on TEXT, note TEXT);

INSERT INTO staff VALUES
  (1, 'Halden Voss', 'board',    '2001-03-01', NULL),
  (2, 'Ines Marr',   'vault',    '2009-06-15', 1),
  (3, 'Tomas Reed',  'security', '2012-01-10', 1),
  (4, 'Priya Nand',  'vault',    '2015-09-01', 2),
  (5, 'Otto Kline',  'security', '2016-02-20', 3),
  (6, 'Lena Brack',  'tellers',  '2017-05-05', 2),
  (7, 'Sam Ode',     'tellers',  '2018-11-12', 6),
  (8, 'Ruth Ash',    'security', '2019-03-03', 5),
  (9, 'Kit Ferro',   'vault',    '2020-07-07', 4),
  (10, 'Mira Sol',   'tellers',  '2021-01-15', 6),
  (11, 'Bo Lund',    NULL,       '2022-04-04', 3),
  (12, 'Ana Petrov', 'security', '2023-08-08', 8);

INSERT INTO accounts VALUES
  (1, 'Corvin Holdings',   'business', 'north',   '2010-01-05'),
  (2, 'Delia Marsh',       'personal', 'north',   '2012-03-14'),
  (3, 'Grey Import Co',    'business', 'harbour', '2013-07-22'),
  (4, 'Felix Orme',        'personal', 'harbour', '2015-10-30'),
  (5, 'Nadia Quill',       'personal', 'north',   '2016-02-02'),
  (6, 'Sable Trust',       'trust',    'central', '2017-06-18'),
  (7, 'Piet Vaan',         'personal', 'central', '2018-09-09'),
  (8, 'Halden Staff Fund', 'trust',    'central', '2019-12-01'),
  (9, 'Roan Textiles',     'business', 'harbour', '2020-04-21'),
  (10, 'Ivo Larch',        'personal', 'north',   '2021-11-11');

INSERT INTO transfers VALUES
  (1, 1, 3, 250000,  '2026-03-02 09:15'),
  (2, 2, 4, 12000,   '2026-03-02 11:40'),
  (3, 3, 6, 480000,  '2026-03-03 10:05'),
  (4, 4, 2, 9000,    '2026-03-03 14:30'),
  (5, 6, 1, 1500000, '2026-03-04 09:00'),
  (6, 7, 9, 30000,   '2026-03-04 16:20'),
  (7, 1, 9, 75000,   '2026-03-05 08:45'),
  (8, 9, 3, 66000,   '2026-03-05 12:00'),
  (9, 2, 7, 4500,    '2026-03-05 17:55'),
  (10, 6, 9, 220000, '2026-03-06 10:10'),
  (11, 3, 1, 98000,  '2026-03-06 13:25'),
  (12, 4, 7, 15000,  '2026-03-07 09:30'),
  (13, 1, 6, 3200000,'2026-03-07 15:00'),
  (14, 9, 2, 8000,   '2026-03-07 18:40');

INSERT INTO badges VALUES
  (1, 2, 'vault',       '2026-03-02 08:55', 'in'),
  (2, 2, 'vault',       '2026-03-02 17:10', 'out'),
  (3, 3, 'lobby',       '2026-03-02 07:30', 'in'),
  (4, 5, 'server-room', '2026-03-02 23:15', 'in'),
  (5, 5, 'server-room', '2026-03-03 01:40', 'out'),
  (6, 4, 'vault',       '2026-03-03 09:05', 'in'),
  (7, 8, 'loading-bay', '2026-03-03 22:30', 'in'),
  (8, 8, 'loading-bay', '2026-03-03 23:50', 'out'),
  (9, 6, 'lobby',       '2026-03-04 08:00', 'in'),
  (10, 7, 'lobby',      '2026-03-04 08:02', 'in'),
  (11, 9, 'vault',      '2026-03-04 10:20', 'in'),
  (12, 3, 'server-room','2026-03-05 02:10', 'in'),
  (13, 5, 'lobby',      '2026-03-05 05:45', 'in'),
  (14, 12, 'loading-bay','2026-03-05 22:05', 'in'),
  (15, 4, 'vault',      '2026-03-06 09:00', 'in'),
  (16, 2, 'lobby',      '2026-03-06 18:30', 'out'),
  (17, 10, 'lobby',     '2026-03-06 08:10', 'in');

INSERT INTO cameras VALUES
  (1, 0, 'lobby',        '2018-01-10'),
  (2, 0, 'loading-bay',  '2021-06-01'),
  (3, 1, 'tellers',      '2019-04-12'),
  (4, 1, 'corridor',     '2022-09-30'),
  (5, 2, 'vault-door',   '2016-11-05'),
  (6, 2, 'vault-inside', '2023-02-14'),
  (7, 2, 'stairs',       '2020-08-08'),
  (8, 3, 'server-room',  '2024-05-20');

INSERT INTO payments VALUES
  (1, 'Halden Voss',    'Otto Kline',  50000,  '2026-01-05', 'quiet hours'),
  (2, 'Halden Voss',    'Ruth Ash',    30000,  '2026-01-12', NULL),
  (3, 'Ines Marr',      'Otto Kline',  20000,  '2026-01-20', 'door'),
  (4, 'Grey Import Co', 'Halden Voss', 400000, '2026-02-01', 'consultancy'),
  (5, 'Halden Voss',    'Bo Lund',     15000,  '2026-02-03', NULL),
  (6, 'Sable Trust',    'Ines Marr',   120000, '2026-02-10', 'audit'),
  (7, 'Ines Marr',      'Ruth Ash',    10000,  '2026-02-14', NULL),
  (8, 'Grey Import Co', 'Tomas Reed',  90000,  '2026-02-20', 'cameras'),
  (9, 'Halden Voss',    'Otto Kline',  50000,  '2026-03-01', 'quiet hours'),
  (10, 'Roan Textiles', 'Halden Voss', 250000, '2026-03-02', NULL),
  (11, 'Tomas Reed',    'Ana Petrov',  8000,   '2026-03-05', 'rota'),
  (12, 'Sable Trust',   'Tomas Reed',  60000,  '2026-03-06', 'audit');
```
Facts the later arcs rely on: manager chain 12 → 8 → 5 → 3 → 1; staff 1 has NULL manager, staff 11 NULL dept; accounts 5, 8, 10 have no transfers; badges: lobby is the busiest door (6), night swipes (22:00–06:00) hit server-room, loading-bay and lobby but never vault; staff 1 and 11 never swiped; top five transfers by amount are ids 13, 5, 3, 1, 10; payers never paid: Grey Import Co, Sable Trust, Roan Textiles; newest camera per floor: 2, 4, 6, 8.

- [ ] **Step 4: The harness** `src/courses/sql/harness_sql.py`:
```python
# SQL harness. Runs after harness.py in the same namespace, where the runner has defined
# __sql (the learner's statement) and __fixture (fixture.sql). Every test string in the sql
# course uses these helpers; check() and __results come from harness.py.
import sqlite3


def _t_db(extra=None):
    con = sqlite3.connect(':memory:')
    con.executescript(__fixture)
    if extra:
        con.executescript(extra)
    return con


def rows(sql, extra=None):
    """Reference rows: run sql against a fresh copy of the fixture (plus extra)."""
    return _t_db(extra).execute(sql).fetchall()


def learner(extra=None):
    """The learner's rows. One statement only; sqlite3 raises on a second one."""
    return _t_db(extra).execute(__sql).fetchall()


def learner_cols():
    """Column names of the learner's result, as sqlite3 reports them."""
    return [d[0] for d in _t_db().execute(__sql).description]


def check_query(label, ref_sql, ordered=False, extra=None):
    """Compare learner rows with reference rows; unordered unless the mission fixes an order."""
    want = rows(ref_sql, extra)
    if not ordered:
        want = sorted(want, key=repr)
    def got():
        g = learner(extra)
        return g if ordered else sorted(g, key=repr)
    check(label, got, want)


def check_cols(label, names):
    check(label, learner_cols, list(names))
```

- [ ] **Step 5: Skeleton files.** `src/courses/sql/index.js` as the oop one with `MIDDLE = ['Runner', 'Teller', 'Auditor', 'Examiner', 'Forensic']` and last title `'Master of the Books'`. `training/index.js` with `NODES = []` (comment: lessons arrive in plans 3 and 4). `training/tools/index.js` with `export const TOOLS = []` for now (Task 3 adds the import). `course.js`:
```js
// The sql course: Halden's database in the bag, and a fence who pays for answers.
import { ARCS, GATES, XP_PER_LEVEL, TITLES, titleFor } from './index.js'
import { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS } from './training/index.js'

export const course = {
  id: 'sql',
  title: 'The Books',
  algo: 'SQL',
  runner: 'sql',
  stats: ['filter', 'join', 'shape'],
  arcs: ARCS,
  gates: GATES,
  training: { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS },
  xpPerLevel: XP_PER_LEVEL,
  titles: TITLES,
  titleFor,
  blurbs: {
    heist: `${ARCS.length} jobs, ${GATES.length} gates. Halden's database is in the bag. The fence pays for answers, not rows.`,
    training: `${NODES.length} lessons in the back room. Dax scrolls a spreadsheet; Marguerite asks the database.`,
  },
  tierBlurbs: {
    F: 'Ask the table.',
    E: 'Two tables, side by side.',
    D: 'Pile them up.',
    C: 'A question inside a question.',
    B: 'Bands and lists.',
    A: 'Running totals and ranks.',
    S: 'Climb the chain.',
  },
}
```

- [ ] **Step 6: Arc I** in `gates.js` (header `name: 'Arc I — The dump'`, `sub: 'Six tables off Halden\'s server, and a fence who will not read a spreadsheet.'`):

| id | rank/xp | stat | algo | title | mission | tests | code? |
|---|---|---|---|---|---|---|---|
| `pullnames` | F/40 | filter | SELECT, WHERE, ORDER BY | Names off the list | Return `name` and `dept` of every staff member in the `vault` department, alphabetical by name. Stretch: same list for a department name given in any case. | `check_cols(['name', 'dept'])`; ordered `check_query` against `SELECT name, dept FROM staff WHERE dept = 'vault' ORDER BY name`; the same with `extra="INSERT INTO staff VALUES (99, 'Abe Zed', 'vault', '2026-01-01', 2);"` (new first row); `check("only vault rows", lambda: all(d == 'vault' for _, d in learner()), True)`; `check("three rows on the shipped dump", lambda: len(learner()), 3)`. | yes: `Ines Marr, vault / Kit Ferro, vault / Priya Nand, vault` |
| `bigmoves` | F/45 | filter | ORDER BY DESC, LIMIT | The big moves | Return `id` and `amount` of the five largest transfers, largest first. Stretch: the five smallest that are still above 10,000. | `check_cols`; ordered `check_query` against `SELECT id, amount FROM transfers ORDER BY amount DESC LIMIT 5`; `extra="INSERT INTO transfers VALUES (99, 1, 2, 5000000, '2026-03-08 09:00');"` (new top); `check("exactly five", lambda: len(learner()), 5)`; `check("largest first", lambda: [a for _, a in learner()] == sorted([a for _, a in learner()], reverse=True), True)`. | no |
| `nightdoors` | F/45 | filter | DISTINCT and ranges | Doors after dark | Return each distinct `door` that was swiped at or after 22:00 or before 06:00, any order. Stretch: add how many night swipes each door had. | `check_cols(['door'])`; unordered `check_query` against `SELECT DISTINCT door FROM badges WHERE time(at) >= '22:00' OR time(at) < '06:00'`; `extra="INSERT INTO badges VALUES (99, 9, 'vault', '2026-03-08 23:30', 'in');"` (vault joins); `check("no duplicates", lambda: len(learner()) == len(set(learner())), True)`; `check("three doors on the shipped dump", lambda: len(learner()), 3)`. | yes: `lobby / loading-bay / server-room` (any order) |
| `howmany` | F/50 | shape | COUNT with a filter | How many | Return one row with one column `n`: how many accounts are of kind `personal`. Stretch: one row per kind with its count. | `check_cols(['n'])`; `check_query` against `SELECT COUNT(*) AS n FROM accounts WHERE kind = 'personal'`; `extra="INSERT INTO accounts VALUES (99, 'New Face', 'personal', 'north', '2026-01-01');"`; `check("one row", lambda: len(learner()), 1)`; `check("it is a number", lambda: type(learner()[0][0]).__name__, 'int')`. | no |

Story beats: `pullnames` — the fence wants to know who has vault access; Dax opens `staff` in a spreadsheet and starts highlighting rows; Marguerite: “Ask the table. It knows how to answer.” `bigmoves` — she wants the five biggest transfers; Dax sorts the spreadsheet and screenshots the top; Marguerite: “Sort, then take five. Say both, in that order.” `nightdoors` — which doors opened after dark; Dax filters, then eyeballs duplicates; Marguerite: “Distinct is a word. Use it.” `howmany` — how many personal accounts; Dax counts rows with his finger; Marguerite: “The table can count. Ask for one number, and name it.”

`tests.js` header comment as in the oop course, plus one line: `Tests use rows(), learner(), learner_cols(), check_query() and check_cols() from src/courses/sql/harness_sql.py.` Example entry:
```js
pullnames: `check_cols("two columns, name then dept", ['name', 'dept'])
check_query("the vault staff, alphabetical", "SELECT name, dept FROM staff WHERE dept = 'vault' ORDER BY name", ordered=True)
check_query("a new hire lands first", "SELECT name, dept FROM staff WHERE dept = 'vault' ORDER BY name", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Abe Zed', 'vault', '2026-01-01', 2);")
check("only vault rows", lambda: all(d == 'vault' for _, d in learner()), True)
check("three rows on the shipped dump", lambda: len(learner()), 3)`,
```

- [ ] **Step 7: Proof script.** In `scripts/test-solutions.mjs`:
  - `import { wrapSql, bundleSql } from '../src/sqlwrap.js'`.
  - `loadSolutions`: accept `.py` and `.sql`; split on `/^(?:#|--) === (\S+)\s*$/m`.
  - Read `src/courses/sql/fixture.sql` and `src/courses/sql/harness_sql.py` once; `const harnessFor = c => c.runner === 'sql' ? bundleSql(harness, fixture, harnessSql) : harness`.
  - `prove(label, solution, tests, wrap, harnessText)` writes `${wrap(solution)}\n\n${harnessText}\n\n${tests}…`; callers pass `c.runner === 'sql' ? wrapSql : s => s` and `harnessFor(c)`.
  - A `.sql` solution block is the bare statement; the wrap makes it Python.

- [ ] **Step 8: Reference solutions** `scripts/solutions/sql/arc1.sql`:
```sql
-- Reference solutions for Arc I of the sql course. One block per gate, introduced by "-- === <id>".
-- Each block is one SELECT statement. Run with npm test.

-- === pullnames
SELECT name, dept FROM staff WHERE dept = 'vault' ORDER BY name

-- === bigmoves
SELECT id, amount FROM transfers ORDER BY amount DESC LIMIT 5

-- === nightdoors
SELECT DISTINCT door FROM badges WHERE time(at) >= '22:00' OR time(at) < '06:00'

-- === howmany
SELECT COUNT(*) AS n FROM accounts WHERE kind = 'personal'
```

- [ ] **Step 9: Validate and prove.** `npm run check` → `✓ sql: 4 gates across 1 arcs look good`, `✓ 122 gates across 4 course(s)`, `✓ 80 training nodes and 24 tools across 4 course(s) look good` (check-training requires at least one tool per course: if it fails on `sql` with "a course needs at least one tool", do Task 3 Step 1 before this validation and treat Tasks 2–3 as one commit); `node scripts/test-solutions.mjs` → `✓ 122 gates, 182 training drills, … all reference solutions pass`; `node --test "tests/*.test.mjs"` → only "each course has the expected tool count" fails (sql vs 6) until plan 2.

- [ ] **Step 10: Commit** `content(sql): The Books — fixture, SQL harness, skeleton, Arc I the dump; proofs read .sql`.

---

### Task 3: The first tool, the browser check

**Files:**
- Create: `src/courses/sql/training/tools/tool-table.js`, `scripts/solutions/sql/training/tool-table.sql`
- Modify: `src/courses/sql/training/tools/index.js` (import and list `tool-table`)

**Interfaces:**
- Produces `tool-table`; plan 2 adds the other five.

- [ ] **Step 1: `tool-table`** — title `The ledger page`, algo `Table`, xp 30.
  - Explain 1 (code): Dax opens the dump in a spreadsheet, six tabs, and scrolls; Marguerite: “A table is rows and columns. Every column holds one kind of thing, every row is one fact, and a blank cell is a value called NULL.” Code:
    ```sql
    -- staff: id INTEGER, name TEXT, dept TEXT, hired TEXT, manager_id INTEGER
    SELECT * FROM staff LIMIT 3;
    -- (1, 'Halden Voss', 'board', '2001-03-01', None)
    -- (2, 'Ines Marr', 'vault', '2009-06-15', 1)
    -- (3, 'Tomas Reed', 'security', '2012-01-10', 1)

    SELECT name, dept FROM staff LIMIT 2;
    -- ('Halden Voss', 'board')
    -- ('Ines Marr', 'vault')
    ```
  - Explain 2: `SELECT *` is every column and `LIMIT` is a peek; rows come back as tuples in whatever order the table holds them unless you say otherwise; the six tables of the dump, one line each (staff, accounts, transfers, badges, cameras, payments) with their columns.
  - Trace: code `SELECT id, zone\nFROM cameras\nLIMIT 2`, input `the query above`; frames: line 2 `rows` → 8 ask `rows` (note: FROM picks the table; all eight rows are on the bench); line 1 `cols` → `['id', 'zone']` (note: SELECT keeps two of the four columns); line 3 `returns` → `{ py: "[(1, 'lobby'), (2, 'loading-bay')]" }` (note: LIMIT keeps the first two rows as stored).
  - Blank: intro “Peek at the badges table: three columns, four rows.” Template `SELECT ___ FROM ___ LIMIT ___`; the mission wants `staff_id, door, at` from `badges`, first four rows in stored order. Checks: `check_cols("three named columns", ['staff_id', 'door', 'at'])`; `check_query("the first four swipes", "SELECT staff_id, door, at FROM badges LIMIT 4", ordered=True)`; `check("four rows", lambda: len(learner()), 4)`; `check("three columns", lambda: len(learner()[0]), 3)`; `check("the first is Ines at the vault", lambda: learner()[0][:2], (2, 'vault'))`.
  - Solution `scripts/solutions/sql/training/tool-table.sql`: `-- === tool-table/3` then `SELECT staff_id, door, at FROM badges LIMIT 4`.
  - Register in `tools/index.js`.

- [ ] **Step 2: Validate.** `npm run check` → `✓ 80 training nodes and 25 tools across 4 course(s) look good`; proofs → `✓ 122 gates, 183 training drills, …`; unit tests: tool-count still red for sql (1 vs 6) until plan 2; everything else green. `npm run build` ok.

- [ ] **Step 3: Browser check** (`npm run dev`): fresh slot → Jobs lists four rows, the last "The Books · SQL · not started · 4 gates · 0 lessons". Take it: stats Filter / Join / Shape; Arc I lists four gates; the editor label reads "Your SQL" and the placeholder is a SQL comment. Open `pullnames`, paste the reference query, run: the button says "Loading the database…" while Pyodide loads, then "Every check passed", +40 xp, Filter 1. Paste `SELECT name FROM staff` instead → checks fail and show got/want rows. Paste two statements (`SELECT 1; SELECT 2`) → a failed check quoting sqlite3's "You can only execute one statement at a time". Window-function smoke test: paste `SELECT id, SUM(amount) OVER (ORDER BY id) FROM transfers` → checks fail on content, not with an `OperationalError` (so Arc V is safe). Training → Armoury shows The ledger page; open it, trace accepts `8`, `['id', 'zone']`, `[(1, 'lobby'), (2, 'loading-bay')]`, blank passes with the solution. Switch to The Ledger and back; reload; blocks intact; no console errors; no three.js chunk.

- [ ] **Step 4: Commit** `content(sql): the ledger page tool; browser-verified SQL runner`. Then follow superpowers:finishing-a-development-branch to merge `sql-runner-arc1` into `main`.

---

## Self-review

- **Spec coverage.** Runner switch, `wrapSql`/`bundleSql` and their unit tests: Task 1. Store and presentation wording: Task 1. Fixture, harness, skeleton, registry, `RUNNERS`, proof script SQL branch, registry tests: Task 2. Arc I with `extra` cases and `check_cols`: Task 2. `tool-table`: Task 3. Browser verification including the window-function smoke test the spec's risk section asks for: Task 3. Remaining spec items go to plans 2–4 (tools, Arcs II–V, lessons, CLAUDE.md).
- **Placeholder scan.** The two placeholder files created in Task 1 are explicitly replaced in Task 2 Steps 3–4. No TBDs.
- **Type consistency.** `runTests(code, tests, runner)` signature used identically in runner, store and plan text. `check_query(label, ref_sql, ordered=False, extra=None)` matches harness and every test example. `MIDDLE` and titles match the spec. Expected counts: 118 → 122 gates; 182 → 183 drills; 24 → 25 tools; 110 → 115 unit tests.
