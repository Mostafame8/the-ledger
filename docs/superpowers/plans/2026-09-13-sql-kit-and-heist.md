# The Books — plan 2: the kit and the heist — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the armoury of "The Books" (five more tools) and its heist (Arcs II–V, sixteen gates), each proven by a reference query, so the SQL course is complete except for its lessons.

**Architecture:** Content only. Five tool files land in `src/courses/sql/training/tools/` and are listed in that folder's `index.js`; sixteen gates are appended to `src/courses/sql/gates.js` as four new arc objects, with their test strings in `src/courses/sql/tests.js`. Reference queries go in `scripts/solutions/sql/arc2.sql` … `arc5.sql` and `scripts/solutions/sql/training/tool-*.sql`. No engine, runner, store or component changes: the SQL runner, the harness and the proof script all landed in plan 1.

**Tech Stack:** Plain JS content modules, SQLite (Python's `sqlite3` for proofs, Pyodide's for the browser), Vue 3 shell untouched.

**Spec:** `docs/superpowers/specs/2026-09-12-sql-course-design.md`

## Global Constraints

- The course card is already shipped: id `sql`, title `The Books`, runner `sql`, stats `['filter', 'join', 'shape']`. Do not edit `course.js`, `index.js`, `fixture.sql`, `harness_sql.py`, `src/sqlwrap.js`, `src/runner.js` or any component.
- **The fixture is frozen.** Never edit `src/courses/sql/fixture.sql`. Tests add rows through `extra=` only.
- The learner writes exactly one SQL statement per gate and per drill. Tests are Python strings using `check_query(label, ref_sql, ordered=False, extra=None)`, `check_cols(label, names)`, `rows(sql, extra=None)`, `learner(extra=None)`, `learner_cols()` from `harness_sql.py`, and `check()` from `harness.py`.
- Every gate test string has one `check_cols`, one `check_query` on the untouched fixture, one `check_query` with `extra` rows, and three literal `check(` calls. Drill (`blank`) tests need 4–7 literal `check(` calls — the validator counts `check(` with an open paren, so `check_cols(` and `check_query(` do **not** count towards it. `ordered=True` only when the mission says order matters. Helper names in tests start with `_t_`.
- Gate schema per CLAUDE.md: `g(id, rank, xp, stat, title, algo, story, mission, hint, code?)`. `story` 2–4 lines, at least one starting with a curly opening quote `“`. `mission` names every returned column and says whether order matters, and ends with a stretch. `hint` one or two sentences, never the whole query. `code` on roughly every second gate in Arc II; optional after.
- xp by rank: E 60–80, D 90–100, C 120–140, B 160–180, A 200–240, S 280–400. An arc spans at most two adjacent ranks and ranks rise through it. No two neighbouring gates share an `algo`.
- Tool schema: `tool(id, { xp: 30, title, algo, steps: [explain, explain, trace, blank] })`. The first explain carries a `code` block; at least one explain line starts with `“`; each explain has 2–5 lines; the trace has 3+ frames, each `{ line, state, ask, note }` with `line` 1-based into `code` and `ask` a key of `state`; the blank has a `___` marker. Tool prose may name its own clause.
- No step anywhere in this course sets `scene`.
- Prose rule: SQL keywords are code and allowed anywhere (`SELECT`, `JOIN`, `GROUP BY`, `CASE`, `OVER`, `WITH`). Banned from story lines, missions and hints: aggregate, subquery, window function, common table expression, CTE, recursive, predicate, projection, cardinality, normalisation. Those words live in `algo` only. Marguerite says "pile them up", "a question inside a question", "the running total", "climb the chain".
- Story: the same crew after The Blueprint. The dump of Halden's database is in the room above the laundromat; the fence pays for answers, not rows; Dax scrolls a spreadsheet; Marguerite asks the database; the learner writes the query. Voice short, wry, concrete. No real anime, manga, game or their characters.
- Reference solutions: one block per gate headed `-- === <gate id>`, one block per tool drill headed `-- === <tool-id>/3`. Each block is one bare SQL statement (the proof script wraps it).
- Baseline before this plan: 122 gates, 183 training drills, 1965 checks, 80 nodes, 25 tools; `npm test` has exactly one failing unit test — `tests/training-tools.test.mjs` "each course has the expected tool count", sql 1 !== 6 — which Task 1 turns green. After this plan: 138 gates, 188 drills, 30 tools, no failing unit tests.
- Run `npm run check` and `node scripts/test-solutions.mjs` at the end of every task; `npm test` and `npm run build` at the end of Tasks 1 and 5.
- Commit messages end with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Branch `sql-kit-heist` off `main`.

---

## File structure

| Path | Responsibility |
|---|---|
| `src/courses/sql/training/tools/tool-select.js` | Armoury drill: column lists, aliases, DISTINCT. |
| `src/courses/sql/training/tools/tool-where.js` | Armoury drill: `=`, `<>`, `IN`, `BETWEEN`, `LIKE`, `AND`/`OR`/`NOT`. |
| `src/courses/sql/training/tools/tool-order.js` | Armoury drill: multi-key `ORDER BY`, `DESC`, `LIMIT`/`OFFSET`, ties. |
| `src/courses/sql/training/tools/tool-group.js` | Armoury drill: `GROUP BY` with `COUNT`, `SUM`, `MAX`. |
| `src/courses/sql/training/tools/tool-null.js` | Armoury drill: `IS NULL`, `COALESCE`, blanks in counts. |
| `src/courses/sql/training/tools/index.js` | Imports and lists all six tools in display order. |
| `src/courses/sql/gates.js` | Gains the Arc II, III, IV and V objects in the `ARCS` array. |
| `src/courses/sql/tests.js` | Gains the sixteen test strings, keyed by gate id. |
| `scripts/solutions/sql/arc2.sql` … `arc5.sql` | One reference query per gate. |
| `scripts/solutions/sql/training/tool-select.sql` … `tool-null.sql` | One reference query per tool blank. |

Facts from the frozen fixture that this content leans on: 12 staff (id 1 has no manager, id 11 has no dept, ids 1 and 11 never swiped); manager chain 12 → 8 → 5 → 3 → 1; 10 accounts (5, 8 and 10 appear in no transfer); 14 transfers summing to 5,967,500, average 426,250; 17 badge swipes (lobby is the busiest door with 6, the vault has 5); 8 cameras on floors 0–3; 12 payments (Grey Import Co, Sable Trust and Roan Textiles paid but were never paid).

---

### Task 1: The kit — five tools

**Files:**
- Create: `src/courses/sql/training/tools/tool-select.js`, `tool-where.js`, `tool-order.js`, `tool-group.js`, `tool-null.js`
- Create: `scripts/solutions/sql/training/tool-select.sql`, `tool-where.sql`, `tool-order.sql`, `tool-group.sql`, `tool-null.sql`
- Modify: `src/courses/sql/training/tools/index.js`

**Interfaces:**
- Consumes `tool`, `explain`, `trace`, `blank` from `src/training/node.js` (already used by `tool-table.js`) and the harness helpers `check_cols`, `check_query`, `learner`.
- Produces tool ids `tool-select`, `tool-where`, `tool-order`, `tool-group`, `tool-null`. Plans 3 and 4 name these ids in lessons' `tools: [...]` arrays; do not rename them.

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull --ff-only && git checkout -b sql-kit-heist
```

- [ ] **Step 2: Create `src/courses/sql/training/tools/tool-select.js`**

```js
import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-select', {
  xp: 30, title: 'Just these columns', algo: 'SELECT',
  steps: [
    explain([
      'Dax pastes a whole table into a new sheet because he needs two of its columns. Then he deletes the other three by hand, and deletes one he needed.',
      '“Name the columns you want, in the order you want them,” Marguerite says. “AS renames one for the answer. You can do arithmetic on the way out.”',
      '“The fence reads column names. Give her the ones she asked for and nothing else.”',
    ], { code:
`SELECT holder, kind FROM accounts LIMIT 2;
-- ('Corvin Holdings', 'business')
-- ('Delia Marsh', 'personal')

SELECT payee AS who, amount / 100 AS pounds FROM payments LIMIT 2;
-- ('Otto Kline', 500)
-- ('Ruth Ash', 300)` }),
    explain([
      '“DISTINCT sits after SELECT and drops repeated rows from the answer. It looks at every column you asked for, not just the first.”',
      '“SELECT * is a peek, not an answer. An answer is checked by column name, so name them.”',
      '“Amounts are pence, so amount / 100 is whole pounds, and whole means whole: two integers divide to an integer and the pennies are gone.”',
    ]),
    trace(
`SELECT holder AS who, kind
FROM accounts
LIMIT 2`,
      'the query above',
      [
        { line: 2, state: { rows: 10 }, ask: 'rows', note: 'FROM puts all ten account rows on the bench. Nothing has been thrown away yet.' },
        { line: 1, state: { rows: 10, cols: ['who', 'kind'] }, ask: 'cols', note: 'Two columns survive, and AS renames the first one in the answer only. The table still calls it holder.' },
        { line: 3, state: { rows: 10, cols: ['who', 'kind'], returns: { py: "[('Corvin Holdings', 'business'), ('Delia Marsh', 'personal')]" } }, ask: 'returns', note: 'LIMIT takes the first two rows as stored.' },
      ]),
    blank('“Every branch in the accounts table, once each, under the name zone.”',
`SELECT ___ branch ___ zone FROM accounts`,
`check_cols("one column named zone", ['zone'])
check_query("every branch, once each", "SELECT DISTINCT branch AS zone FROM accounts")
check("three branches", lambda: len(learner()), 3)
check("no repeats", lambda: len(learner()) == len(set(learner())), True)
check("the harbour is one of them", lambda: ('harbour',) in learner(), True)
check("one column, not five", lambda: len(learner()[0]), 1)`),
  ],
})
```

Then `scripts/solutions/sql/training/tool-select.sql`:

```sql
-- Reference solutions for tool tool-select. Blocks: "-- === <tool-id>/<step-index>".

-- === tool-select/3
SELECT DISTINCT branch AS zone FROM accounts
```

- [ ] **Step 3: Create `src/courses/sql/training/tools/tool-where.js`**

```js
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
```

Then `scripts/solutions/sql/training/tool-where.sql`:

```sql
-- Reference solutions for tool tool-where. Blocks: "-- === <tool-id>/<step-index>".

-- === tool-where/3
SELECT holder, branch FROM accounts WHERE branch IN ('north', 'central') AND kind = 'personal'
```

- [ ] **Step 4: Create `src/courses/sql/training/tools/tool-order.js`**

```js
import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-order', {
  xp: 30, title: 'In this order', algo: 'ORDER BY',
  steps: [
    explain([
      'Dax sorts the staff sheet by hire date, scrolls to what he thinks is the newest, and screenshots the oldest.',
      '“A table has no order,” Marguerite says. “If you do not say ORDER BY, whatever came back came back by accident, and it can come back differently tomorrow.”',
      '“Name the column, then say DESC if you want the top of the pile first. LIMIT takes from whatever order you asked for, so ask first.”',
    ], { code:
`SELECT name, hired FROM staff ORDER BY hired DESC LIMIT 3;
-- ('Ana Petrov', '2023-08-08')
-- ('Bo Lund', '2022-04-04')
-- ('Mira Sol', '2021-01-15')` }),
    explain([
      '“Two keys, comma between: ORDER BY dept, name sorts by department and settles the ties by name. Without the second key the ties fall however they fall.”',
      '“OFFSET skips from the front before LIMIT counts, so LIMIT 3 OFFSET 2 is rows three, four and five.”',
      '“Dates here are text, year first, so text order is date order. That is why the dump was written that way.”',
    ]),
    trace(
`SELECT name, hired
FROM staff
ORDER BY hired DESC
LIMIT 3`,
      'the query above',
      [
        { line: 2, state: { rows: 12 }, ask: 'rows', note: 'Twelve staff rows on the bench, in whatever order the table holds them.' },
        { line: 3, state: { rows: 12, top: { py: "('Ana Petrov', '2023-08-08')" } }, ask: 'top', note: 'DESC on hired puts the newest hire first. Nothing is dropped yet: all twelve are still there, sorted.' },
        { line: 4, state: { rows: 12, top: { py: "('Ana Petrov', '2023-08-08')" }, returns: { py: "[('Ana Petrov', '2023-08-08'), ('Bo Lund', '2022-04-04'), ('Mira Sol', '2021-01-15')]" } }, ask: 'returns', note: 'LIMIT takes three off the top of the order you just asked for.' },
      ]),
    blank('“Skip the two oldest cameras, then take the next three: zone and installed, oldest first.”',
`SELECT zone, installed FROM cameras ORDER BY ___ LIMIT ___ OFFSET ___`,
`check_cols("two columns, zone then installed", ['zone', 'installed'])
check_query("cameras three, four and five by age", "SELECT zone, installed FROM cameras ORDER BY installed LIMIT 3 OFFSET 2", ordered=True)
check("three rows", lambda: len(learner()), 3)
check("the tellers camera comes first", lambda: learner()[0][0], 'tellers')
check("oldest first", lambda: [i for _, i in learner()] == sorted(i for _, i in learner()), True)
check("the two oldest were skipped", lambda: all(i > '2018-01-10' for _, i in learner()), True)`),
  ],
})
```

Then `scripts/solutions/sql/training/tool-order.sql`:

```sql
-- Reference solutions for tool tool-order. Blocks: "-- === <tool-id>/<step-index>".

-- === tool-order/3
SELECT zone, installed FROM cameras ORDER BY installed LIMIT 3 OFFSET 2
```

- [ ] **Step 5: Create `src/courses/sql/training/tools/tool-group.js`**

```js
import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-group', {
  xp: 30, title: 'The tally', algo: 'GROUP BY',
  steps: [
    explain([
      'Dax wants a count per kind of account, so he sorts the sheet by kind and starts writing numbers on the back of a receipt.',
      '“GROUP BY makes piles,” Marguerite says. “One pile per value in the column you name, and one row of answer per pile.”',
      '“COUNT(*) is how tall the pile is. SUM, AVG, MIN and MAX read a column down the pile. Name each one with AS, or the fence gets a column called COUNT(*).”',
    ], { code:
`SELECT kind, COUNT(*) AS n FROM accounts GROUP BY kind;
-- ('business', 3)
-- ('personal', 5)
-- ('trust', 2)` }),
    explain([
      '“Anything you SELECT is either the column you grouped by or something read down the pile. Ask for a fourth column and SQLite hands you one row out of that pile, chosen by nobody.”',
      '“WHERE runs before the piles are built, so it thins the rows going in. There is a second sieve for the piles themselves, and it is called HAVING.”',
      '“COUNT(*) counts rows. COUNT(column) counts the rows where that column is not blank. The gap between the two is the interesting part.”',
    ]),
    trace(
`SELECT kind, COUNT(*) AS n
FROM accounts
GROUP BY kind`,
      'the query above',
      [
        { line: 2, state: { rows: 10 }, ask: 'rows', note: 'Ten account rows on the bench.' },
        { line: 3, state: { rows: 10, piles: 3 }, ask: 'piles', note: 'Three distinct kinds in that column, so three piles: business, personal, trust.' },
        { line: 1, state: { rows: 10, piles: 3, returns: { py: "[('business', 3), ('personal', 5), ('trust', 2)]" } }, ask: 'returns', note: 'One row per pile: the value you grouped by, then how tall the pile is.' },
      ]),
    blank('“Per payer: everything they paid in total, and their biggest single payment.”',
`SELECT payer, ___(amount) AS total, ___(amount) AS biggest FROM payments ___ payer`,
`check_cols("three columns, payer then total then biggest", ['payer', 'total', 'biggest'])
check_query("what each payer paid", "SELECT payer, SUM(amount) AS total, MAX(amount) AS biggest FROM payments GROUP BY payer")
check("six payers", lambda: len(learner()), 6)
check("Grey Import Co paid 490000 in all", lambda: {p: t for p, t, _ in learner()}['Grey Import Co'], 490000)
check("nobody's biggest beats their total", lambda: all(b <= t for _, t, b in learner()), True)
check("three columns", lambda: len(learner()[0]), 3)`),
  ],
})
```

Then `scripts/solutions/sql/training/tool-group.sql`:

```sql
-- Reference solutions for tool tool-group. Blocks: "-- === <tool-id>/<step-index>".

-- === tool-group/3
SELECT payer, SUM(amount) AS total, MAX(amount) AS biggest FROM payments GROUP BY payer
```

- [ ] **Step 6: Create `src/courses/sql/training/tools/tool-null.js`**

```js
import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-null', {
  xp: 30, title: 'The blank cell', algo: 'NULL',
  steps: [
    explain([
      'One cell in the staff sheet is empty. Dax types the word none into it and moves on, and now the dump disagrees with the bank.',
      '“A blank is not an empty word and not a zero,” Marguerite says. “It is NULL, and NULL means nobody wrote it down.”',
      '“So dept = NULL is never true, and dept <> NULL is never true either. Ask IS NULL or IS NOT NULL, which are the only two questions it answers.”',
    ], { code:
`SELECT name, dept FROM staff WHERE dept IS NULL;
-- ('Bo Lund', None)

SELECT COUNT(*) AS rows_all, COUNT(dept) AS with_dept FROM staff;
-- (12, 11)` }),
    explain([
      '“COALESCE(dept, \'none\') hands back the first thing that is not blank, so it is how you print a blank without lying about the table.”',
      '“COUNT(column), SUM and AVG all walk past blanks. That is why the two counts above differ by one: twelve rows, eleven departments.”',
      '“A blank in the middle of arithmetic poisons the lot: amount + NULL is NULL, not amount.”',
    ]),
    trace(
`SELECT name, COALESCE(dept, 'none') AS dept
FROM staff
WHERE dept IS NULL`,
      'the query above',
      [
        { line: 2, state: { rows: 12 }, ask: 'rows', note: 'Twelve staff rows go onto the bench.' },
        { line: 3, state: { rows: 12, kept: 1 }, ask: 'kept', note: 'Exactly one row has nothing written in dept, and only IS NULL can find it.' },
        { line: 1, state: { rows: 12, kept: 1, returns: { py: "[('Bo Lund', 'none')]" } }, ask: 'returns', note: 'COALESCE swaps the blank for something printable in the answer only. The table still holds a blank.' },
      ]),
    blank('“Everyone who has a manager, with their department printed as none when the dump never wrote one down. By id.”',
`SELECT name, ___(dept, 'none') AS dept FROM staff WHERE manager_id ___ NULL ORDER BY id`,
`check_cols("two columns, name then dept", ['name', 'dept'])
check_query("everyone with a manager, blanks printed", "SELECT name, COALESCE(dept, 'none') AS dept FROM staff WHERE manager_id IS NOT NULL ORDER BY id", ordered=True)
check("eleven rows", lambda: len(learner()), 11)
check("Bo Lund's department reads none", lambda: dict(learner())['Bo Lund'], 'none')
check("no blanks left in the answer", lambda: all(d is not None for _, d in learner()), True)
check("the one with no manager is not here", lambda: all(n != 'Halden Voss' for n, _ in learner()), True)`),
  ],
})
```

Then `scripts/solutions/sql/training/tool-null.sql`:

```sql
-- Reference solutions for tool tool-null. Blocks: "-- === <tool-id>/<step-index>".

-- === tool-null/3
SELECT name, COALESCE(dept, 'none') AS dept FROM staff WHERE manager_id IS NOT NULL ORDER BY id
```

- [ ] **Step 7: List the six tools** — `src/courses/sql/training/tools/index.js` becomes:

```js
// Armoury tools for the sql course, in display order. Add a tool file, import it, append it here.
import toolTable from './tool-table.js'
import toolSelect from './tool-select.js'
import toolWhere from './tool-where.js'
import toolOrder from './tool-order.js'
import toolGroup from './tool-group.js'
import toolNull from './tool-null.js'

export const TOOLS = [toolTable, toolSelect, toolWhere, toolOrder, toolGroup, toolNull]
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]))
```

- [ ] **Step 8: Validate, prove, test, build**

```bash
npm run check
node scripts/test-solutions.mjs
npm test
npm run build
```

Expected: `✓ 80 training nodes and 30 tools across 4 course(s) look good`; `✓ 122 gates, 188 training drills, … all reference solutions pass`; `npm test` fully green for the first time since plan 1 (the sql tool count is now 6); build ok.

- [ ] **Step 9: Commit**

```bash
git add src/courses/sql/training/tools scripts/solutions/sql/training
git commit -m "content(sql): the kit — select, where, order, group and null tools"
```

---

### Task 2: Arc II — Who talks to whom

**Files:**
- Modify: `src/courses/sql/gates.js` (append a second arc object to the `ARCS` array), `src/courses/sql/tests.js` (four entries)
- Create: `scripts/solutions/sql/arc2.sql`

**Interfaces:**
- Produces gate ids `badgeowners`, `emptyaccounts`, `chainofcommand`, `threeway`. Plans 3 and 4 list these ids in lessons' `gates` arrays; do not rename them.

- [ ] **Step 1: Append the arc** to `src/courses/sql/gates.js`, after the Arc I object and before the closing `];`

```js
{ name:'Arc II — Who talks to whom', sub:'Six tables that only mean something when you put two of them side by side.', gates:[
  g('badgeowners','E',60,'join','Whose badge','INNER JOIN',
    ['The badge log is honest and useless: a staff id, a door, a time. The fence does not know who staff id 5 is, and she is not going to learn.',
     'Dax opens both sheets side by side and starts typing names into the badge rows by hand. Eleven rows in, he types the wrong one.',
     '“Two tables, one wire between them,” Marguerite says. “The badge carries a staff id. The staff table is keyed by that id. Say so, once, and the names arrive.”'],
    'Return every badge swipe with the staff member\'s name: three columns named name, door and at, any order. Stretch: keep only the swipes that went in.',
    'JOIN staff ON staff.id = badges.staff_id. Give each table a short alias so you can say which id you mean; a swipe whose staff id matches nobody drops out, which is what INNER means.',
`-- three of the seventeen rows
('Ines Marr', 'vault', '2026-03-02 08:55')
('Tomas Reed', 'lobby', '2026-03-02 07:30')
('Otto Kline', 'server-room', '2026-03-02 23:15')`),
  g('emptyaccounts','E',70,'join','Accounts nobody touched','LEFT JOIN … IS NULL',
    ['“Three of these accounts have never moved a penny,” the fence says. “Those are the ones I want. Nobody watches a dead account.”',
     'Dax looks for them by reading the transfer sheet and crossing account numbers off a list on the back of his hand. He crosses one off twice and misses another.',
     '“Keep every account, wire the transfers on beside them, then keep the ones where nothing arrived,” Marguerite says. “The empty seat is the answer.”'],
    'Return every account that has never sent and never received a transfer: two columns named id and holder, any order. Stretch: the same for accounts that have never sent but have received.',
    'A LEFT JOIN keeps every row on the left even when the right side has nothing to offer, filling the gap with blanks. Then WHERE the right side IS NULL keeps only the gaps. Match on either end of the transfer.'),
  g('chainofcommand','D',90,'join','Who reports to whom','Self join',
    ['The staff table points at itself: every row carries the id of the person above it. One row points at nobody.',
     'Dax draws the tree on the back of a takeaway menu, gets two branches crossed, and declares that the head of security reports to a teller.',
     '“The table meets itself,” Marguerite says. “Two copies, two names, one wire between them. Call one of them the manager and the answer reads like a sentence.”'],
    'Return every staff member who has a manager, beside that manager\'s name: two columns named name and manager, alphabetical by name. Order matters. Stretch: include the one with no manager, showing the word none instead.',
    'JOIN staff m ON m.id = s.manager_id, with s and m two aliases for the same table. The person at the top has no manager id, so this join quietly leaves them out.',
`-- the first three of eleven rows
('Ana Petrov', 'Ruth Ash')
('Bo Lund', 'Tomas Reed')
('Ines Marr', 'Halden Voss')`),
  g('threeway','D',100,'join','Both ends of the wire','Two joins with aliases',
    ['A transfer row has two account numbers on it and no names at all. The fence wants both ends spelled out.',
     'Dax says he will just look each number up as he goes. Fourteen rows, twenty-eight lookups, and he is already asking what account 9 was.',
     '“Same table, twice, two different jobs,” Marguerite says. “One copy is the sender, one is the receiver. Name them that and stop thinking about it.”'],
    'Return every transfer with both holders\' names: four columns named id, sender, receiver and amount, ordered by id. Order matters. Stretch: only the transfers where both ends sit in the same branch.',
    'Join accounts twice under two aliases, one on from_acct and one on to_acct, and alias the two holder columns apart. Nothing is dropped: every transfer points at real accounts.'),
]},
```

- [ ] **Step 2: Append the four test strings** to `src/courses/sql/tests.js`, before the closing `}`

```js
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
```

- [ ] **Step 3: Reference solutions** — `scripts/solutions/sql/arc2.sql`

```sql
-- Reference solutions for Arc II of the sql course. One block per gate, introduced by "-- === <id>".
-- Each block is one SELECT statement. Run with npm test.

-- === badgeowners
SELECT s.name, b.door, b.at
FROM badges b
JOIN staff s ON s.id = b.staff_id

-- === emptyaccounts
SELECT a.id, a.holder
FROM accounts a
LEFT JOIN transfers t ON a.id = t.from_acct OR a.id = t.to_acct
WHERE t.id IS NULL

-- === chainofcommand
SELECT s.name, m.name AS manager
FROM staff s
JOIN staff m ON m.id = s.manager_id
ORDER BY s.name

-- === threeway
SELECT t.id, f.holder AS sender, p.holder AS receiver, t.amount
FROM transfers t
JOIN accounts f ON f.id = t.from_acct
JOIN accounts p ON p.id = t.to_acct
ORDER BY t.id
```

- [ ] **Step 4: Validate and prove**

```bash
npm run check
node scripts/test-solutions.mjs
```

Expected: `✓ sql: 8 gates across 2 arcs look good`, `✓ 126 gates across 4 course(s)`, and `✓ 126 gates, 188 training drills, … all reference solutions pass`.

- [ ] **Step 5: Commit**

```bash
git add src/courses/sql/gates.js src/courses/sql/tests.js scripts/solutions/sql/arc2.sql
git commit -m "content(sql): Arc II — who talks to whom"
```

---

### Task 3: Arc III — The totals

**Files:**
- Modify: `src/courses/sql/gates.js`, `src/courses/sql/tests.js`
- Create: `scripts/solutions/sql/arc3.sql`

**Interfaces:**
- Produces gate ids `perdept`, `heavyhitters`, `busiestdoor`, `byday`.

- [ ] **Step 1: Append the arc** to `src/courses/sql/gates.js`, after the Arc II object

```js
{ name:'Arc III — The totals', sub:'The fence stops asking which and starts asking how much.', gates:[
  g('perdept','D',90,'shape','Heads per department','GROUP BY and COUNT',
    ['“How many bodies in each department,” the fence says. “Not names. Headcount. I am pricing a bribe, not writing a birthday card.”',
     'Dax sorts the staff sheet by department and counts each block with his finger, out loud, twice, getting two different numbers for security.',
     '“Pile them up,” Marguerite says. “One pile per department, and the answer is how tall each pile is. One of them has no department written down at all — leave that one out.”'],
    'Return one row per department with its headcount: two columns named dept and n, any order, skipping the staff member whose department was never written down. Stretch: order the answer by headcount, biggest first.',
    'GROUP BY dept makes one pile per value, COUNT(*) measures a pile, AS n names the number. A blank department is its own pile unless WHERE drops it first.'),
  g('heavyhitters','C',120,'shape','The heavy hitters','SUM and HAVING',
    ['“Which accounts are moving real money out,” the fence says. “Over half a million, all told. I do not care about a hundred small ones.”',
     'Dax adds up the amounts per account in his head, announces a number ending in three zeroes, and admits he might have counted a row twice.',
     '“Add up each pile, then sieve the piles,” Marguerite says. “WHERE thins the rows before the piles exist. What you want is the other sieve, the one that runs after.”'],
    'Return every account whose transfers out add up to more than 500,000: two columns named from_acct and total, largest total first. Order matters. Stretch: the same list by money received instead.',
    'GROUP BY from_acct, SUM(amount) AS total, then HAVING SUM(amount) > 500000. HAVING sieves piles; WHERE would be looking at single transfers, which is a different question.'),
  g('busiestdoor','C',130,'shape','The busiest door','GROUP BY, ORDER BY count, LIMIT 1',
    ['“One door,” the fence says. “The one that opens most. That is where I want the crew standing, because nobody looks twice at a busy door.”',
     'Dax counts the door column by eye, gets lobby and loading-bay within one of each other, and asks whether it really matters which.',
     '“Pile them up, sort the piles by height, take the top one,” Marguerite says. “Three clauses in a row and the question stops being an argument.”'],
    'Return one row: the door with the most swipes and how many it had, as two columns named door and n. Stretch: the quietest door instead.',
    'Count per door with GROUP BY, then ORDER BY that count descending and LIMIT 1. You may order by the name you gave the count.'),
  g('byday','C',140,'shape','Day by day','date() and GROUP BY',
    ['The transfer times carry a date and a clock. The fence wants a shape: which day was busy, which was quiet.',
     'Dax types the six dates down the side of a page by hand and tallies them, then finds a seventh he had not noticed.',
     '“The timestamp is text with a date hiding at the front,” Marguerite says. “Cut the date out and pile up by that. Never by the whole timestamp — no two of those are the same.”'],
    'Return how many transfers happened on each day: two columns named day and n, where day looks like 2026-03-02, earliest day first. Order matters. Stretch: the total moved on each day instead of the count.',
    'date(at) trims a timestamp down to its date. Group by that same expression, not by at, or every row becomes its own pile.'),
]},
```

- [ ] **Step 2: Append the four test strings** to `src/courses/sql/tests.js`

```js
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
```

- [ ] **Step 3: Reference solutions** — `scripts/solutions/sql/arc3.sql`

```sql
-- Reference solutions for Arc III of the sql course. One block per gate, introduced by "-- === <id>".
-- Each block is one SELECT statement. Run with npm test.

-- === perdept
SELECT dept, COUNT(*) AS n
FROM staff
WHERE dept IS NOT NULL
GROUP BY dept

-- === heavyhitters
SELECT from_acct, SUM(amount) AS total
FROM transfers
GROUP BY from_acct
HAVING SUM(amount) > 500000
ORDER BY total DESC

-- === busiestdoor
SELECT door, COUNT(*) AS n
FROM badges
GROUP BY door
ORDER BY n DESC
LIMIT 1

-- === byday
SELECT date(at) AS day, COUNT(*) AS n
FROM transfers
GROUP BY date(at)
ORDER BY day
```

- [ ] **Step 4: Validate and prove**

```bash
npm run check
node scripts/test-solutions.mjs
```

Expected: `✓ sql: 12 gates across 3 arcs look good`, `✓ 130 gates across 4 course(s)`, `✓ 130 gates, 188 training drills, … all reference solutions pass`.

- [ ] **Step 5: Commit**

```bash
git add src/courses/sql/gates.js src/courses/sql/tests.js scripts/solutions/sql/arc3.sql
git commit -m "content(sql): Arc III — the totals"
```

---

### Task 4: Arc IV — Inside the question

**Files:**
- Modify: `src/courses/sql/gates.js`, `src/courses/sql/tests.js`
- Create: `scripts/solutions/sql/arc4.sql`

**Interfaces:**
- Produces gate ids `abovemean`, `neverswiped`, `bucket`, `twolists`.

- [ ] **Step 1: Append the arc** to `src/courses/sql/gates.js`, after the Arc III object

```js
{ name:'Arc IV — Inside the question', sub:'Some answers need a second question answered first, in the same breath.', gates:[
  g('abovemean','C',120,'filter','Above the average','Scalar subquery',
    ['“Anything unusual,” the fence says. “Bigger than normal. You work out what normal is — that is what I am paying for.”',
     'Dax averages the amounts on a calculator, writes 426250 on the back of his hand, and starts comparing rows to a number that will be wrong the moment another transfer lands.',
     '“Put the question inside the question,” Marguerite says. “The table works out its own average while it is looking, and the answer is still right tomorrow.”'],
    'Return every transfer larger than the average transfer amount: two columns named id and amount, largest first. Order matters. Stretch: transfers larger than the average for their own sending account.',
    'A SELECT that returns one row and one column can stand where a number stands: WHERE amount > (SELECT AVG(amount) FROM transfers). The brackets are not optional.'),
  g('neverswiped','B',160,'filter','Never swiped in','NOT EXISTS',
    ['Twelve people on the staff list. Seventeen swipes in the badge log, and not one of them belongs to two of those people.',
     'Dax ticks names off the staff sheet as he reads the badge log, loses his place somewhere around the fourth vault entry, and starts again.',
     '“Ask the badge log a yes-or-no question about each person, then keep the people it says no to,” Marguerite says. “One of them never comes in. That is the one who matters.”'],
    'Return every staff member with no badge swipe at all: two columns named id and name, by id. Order matters. Stretch: the same for staff who swiped in but never out.',
    'NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id) asks the badge log about the row you are standing on. The inner SELECT list is ignored, so 1 is the polite thing to put there.'),
  g('bucket','B',170,'filter','Small, medium, large','CASE',
    ['“I do not want fourteen numbers,” the fence says. “I want to know which are small, which are worth reading, and which are the reason we are all here.”',
     'Dax colours the spreadsheet rows in three shades of highlighter. The photocopy comes out grey.',
     '“Write the band into the row,” Marguerite says. “The table can label its own rows, and a word survives a photocopier.”'],
    'Return every transfer with a band: three columns named id, amount and band, where band is small below 50,000, medium below 500,000 and large otherwise, ordered by id. Order matters. Stretch: how many transfers fall in each band.',
    'CASE WHEN … THEN … WHEN … THEN … ELSE … END is one column, so give it a name with AS. The first WHEN that fits wins, so write the bands in order.'),
  g('twolists','B',180,'join','Two lists, one answer','UNION and EXCEPT',
    ['The Ledger has two name columns: who paid and who was paid. The fence wants one list of everybody it touches.',
     'Dax copies both columns into one, sorts it, and spends ten minutes deleting the names that now appear twice.',
     '“Stack one list on the other and the repeats fall away by themselves,” Marguerite says. “There is a version that keeps them, and we do not want it.”'],
    'Return every name that appears anywhere in the payments table, as payer or as payee, once each: one column named name, any order. Stretch: the payers who were never paid.',
    'Two SELECTs with UNION between them stack into one list and drop the repeats; UNION ALL keeps them. The column name of the answer comes from the first SELECT.'),
]},
```

- [ ] **Step 2: Append the four test strings** to `src/courses/sql/tests.js`

```js
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
```

- [ ] **Step 3: Reference solutions** — `scripts/solutions/sql/arc4.sql`

```sql
-- Reference solutions for Arc IV of the sql course. One block per gate, introduced by "-- === <id>".
-- Each block is one SELECT statement. Run with npm test.

-- === abovemean
SELECT id, amount
FROM transfers
WHERE amount > (SELECT AVG(amount) FROM transfers)
ORDER BY amount DESC

-- === neverswiped
SELECT id, name
FROM staff s
WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id)
ORDER BY id

-- === bucket
SELECT id, amount,
       CASE WHEN amount < 50000 THEN 'small'
            WHEN amount < 500000 THEN 'medium'
            ELSE 'large' END AS band
FROM transfers
ORDER BY id

-- === twolists
SELECT payer AS name FROM payments
UNION
SELECT payee FROM payments
```

- [ ] **Step 4: Validate and prove**

```bash
npm run check
node scripts/test-solutions.mjs
```

Expected: `✓ sql: 16 gates across 4 arcs look good`, `✓ 134 gates across 4 course(s)`, `✓ 134 gates, 188 training drills, … all reference solutions pass`.

- [ ] **Step 5: Commit**

```bash
git add src/courses/sql/gates.js src/courses/sql/tests.js scripts/solutions/sql/arc4.sql
git commit -m "content(sql): Arc IV — inside the question"
```

---

### Task 5: Arc V — The Books, and the browser check

**Files:**
- Modify: `src/courses/sql/gates.js`, `src/courses/sql/tests.js`
- Create: `scripts/solutions/sql/arc5.sql`

**Interfaces:**
- Produces gate ids `runningtotal`, `toppercamera`, `reportsto`, `thebooks`.

- [ ] **Step 1: Append the arc** to `src/courses/sql/gates.js`, after the Arc IV object

```js
{ name:'Arc V — The Books', sub:'The last four questions, and then the fence closes the book.', gates:[
  g('runningtotal','A',200,'shape','The running total','Window aggregate',
    ['“I want to see it build,” the fence says. “Payment by payment, with the total so far beside each one. That is how you spot the month somebody got greedy.”',
     'Dax says he can do that: one column of numbers, one column where each cell adds the one above. It takes him eleven cells to make an error, and the error compounds.',
     '“Every row keeps its own line and gets the total so far beside it,” Marguerite says. “The table can look back along the order you gave it without folding the rows together.”'],
    'Return every payment with the total so far: three columns named paid_on, amount and running, ordered by paid_on and then by id, where running is every payment up to and including that row added together. Order matters. Stretch: the same, restarted for each payer.',
    'SUM(amount) OVER (ORDER BY paid_on, id) adds up everything from the first row to this one. It sits in the SELECT list beside the ordinary columns, and no rows are folded together.'),
  g('toppercamera','A',220,'shape','Top per floor','ROW_NUMBER over a partition',
    ['“The newest camera on each floor,” the fence says. “The new ones record to somewhere I cannot reach.”',
     'Dax sorts the camera sheet by floor, then by date, then reads off the wrong row on two of the four floors because he forgot which way the dates ran.',
     '“Number the cameras within each floor, newest first, then keep the ones numbered one,” Marguerite says. “Four floors, four answers, no arguing.”'],
    'Return the newest camera on each floor: three columns named floor, zone and installed, one row per floor, by floor. Order matters. Stretch: the two newest per floor.',
    'ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) numbers each floor\'s cameras separately. You cannot sieve on that number in the same SELECT, so wrap the whole thing and filter outside.'),
  g('reportsto','A',240,'join','Climb the chain','Recursive CTE',
    ['Ana Petrov signs for the loading bay at ten at night. The fence wants to know who she answers to, and who they answer to, all the way up.',
     'Dax follows the manager ids by hand, one lookup at a time, and gets to the top by luck. He cannot tell you how many steps it took.',
     '“Climb the chain,” Marguerite says. “Start at her, take one step up, then take one step up from wherever you got to, and keep going until there is nowhere to step.”'],
    'Return everyone above Ana Petrov, who is staff id 12: two columns named name and level, where her manager is level 1, that manager\'s manager is level 2, and so on, lowest level first. Order matters. Stretch: the same chain for any staff id, and the length of the longest chain in the table.',
    'WITH RECURSIVE up(...) AS (a starting row UNION ALL a SELECT that joins staff back onto up), then SELECT from up. Start at id 12 with level 0 and leave that row out of the answer.'),
  g('thebooks','S',320,'shape','The Books','Combining the pieces',
    ['The fence puts the book on the table and turns it round. “Last question. Who did Halden pay, how much in all, who took the most, and which of them are worth talking to.”',
     'Dax looks at the four things in that sentence, then at the spreadsheet, then at the door.',
     '“Name the totals first, then read them back with a place and a band,” Marguerite says. “Four questions, one answer, one statement. Then we are done here.”'],
    'Return one row per payee: four columns named payee, total, place and band, where total is everything that payee received, place is 1 for the largest total with ties broken by payee name alphabetically, and band is big from 100,000 up, middling from 25,000 up and small below, ordered by place. Order matters. Stretch: add each payee\'s share of everything paid, rounded to two decimals.',
    'WITH totals AS (…GROUP BY payee…) names the piles first. Then read totals back, put ROW_NUMBER() OVER (ORDER BY total DESC, payee) beside each row, and label it with CASE.'),
]},
```

- [ ] **Step 2: Append the four test strings** to `src/courses/sql/tests.js`

```js
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
```

- [ ] **Step 3: Reference solutions** — `scripts/solutions/sql/arc5.sql`

```sql
-- Reference solutions for Arc V of the sql course. One block per gate, introduced by "-- === <id>".
-- Each block is one SELECT statement. Run with npm test.

-- === runningtotal
SELECT paid_on, amount, SUM(amount) OVER (ORDER BY paid_on, id) AS running
FROM payments
ORDER BY paid_on, id

-- === toppercamera
SELECT floor, zone, installed
FROM (SELECT floor, zone, installed,
             ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn
      FROM cameras) AS ranked
WHERE rn = 1
ORDER BY floor

-- === reportsto
WITH RECURSIVE up(id, name, manager_id, level) AS (
  SELECT id, name, manager_id, 0 FROM staff WHERE id = 12
  UNION ALL
  SELECT s.id, s.name, s.manager_id, up.level + 1 FROM staff s JOIN up ON s.id = up.manager_id
)
SELECT name, level FROM up WHERE level > 0 ORDER BY level

-- === thebooks
WITH totals AS (
  SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee
)
SELECT payee, total,
       ROW_NUMBER() OVER (ORDER BY total DESC, payee) AS place,
       CASE WHEN total >= 100000 THEN 'big'
            WHEN total >= 25000 THEN 'middling'
            ELSE 'small' END AS band
FROM totals
ORDER BY place
```

- [ ] **Step 4: Validate, prove, test, build**

```bash
npm run check
node scripts/test-solutions.mjs
npm test
npm run build
```

Expected: `✓ sql: 20 gates across 5 arcs look good`, `✓ 138 gates across 4 course(s)`, `✓ 80 training nodes and 30 tools across 4 course(s) look good`, `✓ 138 gates, 188 training drills, … all reference solutions pass`, unit tests all green, build ok.

- [ ] **Step 5: Browser check** — `npm run dev`, fresh save slot, Jobs → The Books

  - The arc list shows five arcs and twenty gates, named The dump / Who talks to whom / The totals / Inside the question / The Books.
  - `badgeowners`: paste the Arc II reference query and run. The button reads "Loading the database…" on the first run, then "Every check passed", +60 xp, Join 1.
  - `thebooks`: paste the Arc V reference query and run → every check passes. This is the proof that Pyodide's SQLite has both `WITH` and `OVER`; if it fails with `OperationalError: near "OVER"`, stop and report — the runtime is older than the spec assumed.
  - `reportsto`: paste the reference query → passes, which is the same check for `WITH RECURSIVE`.
  - `bucket`: paste a query that bands at the wrong boundary (`amount <= 50000` in the first WHEN) → the checks fail and the failing check shows got and want rows.
  - Training → Armoury lists six tools. Open The sieve and The blank cell: answer the traces (`14`, `6`, then the six-row list; `12`, `1`, `[('Bo Lund', 'none')]`) and pass each blank with the reference query.
  - Switch to The Ledger and back, then reload: cleared gates, kit progress and notes survive. No console errors, and no three.js chunk in the network panel.

- [ ] **Step 6: Commit**

```bash
git add src/courses/sql/gates.js src/courses/sql/tests.js scripts/solutions/sql/arc5.sql
git commit -m "content(sql): Arc V — the Books; twenty gates, browser-verified"
```

- [ ] **Step 7: Finish the branch** — follow superpowers:finishing-a-development-branch to merge `sql-kit-heist` into `main`.

---

## Self-review

- **Spec coverage.** Armoury (6 tools): `tool-table` shipped in plan 1, the other five in Task 1, with the spec's ids, titles, `algo` values and drill subjects. Arcs II–V, sixteen gates with the spec's exact ids, ranks, stats, titles and `algo` values: Tasks 2–5. The spec's gate rules (xp in band, an arc spans two adjacent ranks, no two neighbours share an `algo`, missions name the columns and whether order matters, an `extra` case per gate, `code` on roughly every second gate in Arc II) are satisfied gate by gate above. Browser verification of `WITH`, `OVER` and `WITH RECURSIVE` on the real runtime: Task 5 Step 5. The eighteen lessons and the CLAUDE.md update are plans 3 and 4, per the spec's rollout.
- **Placeholder scan.** Every tool file, test string and reference query is written out in full; no TBDs, no "same as Task N". Each validation step carries the real expected numbers (126 → 130 → 134 → 138 gates; 188 drills; 30 tools).
- **Type consistency.** Every `check_query` reference query matches the statement in the matching `arcN.sql` block, and every `check_cols` list matches the columns that statement produces. Every count asserted in a `check(` was run against the frozen fixture before this plan was written: badgeowners 17, emptyaccounts 3, chainofcommand 11, threeway 14, perdept 4 (headcounts summing to 11), heavyhitters 3 (account 1 on 3,525,000), busiestdoor lobby/6, byday 6 (counts summing to 14), abovemean 3 (average 426,250), neverswiped 2, bucket 14 with 2 large, twolists 10, runningtotal 12 ending 1,103,000, toppercamera 4, reportsto 4, thebooks 7 with Halden Voss on 650,000 and the Ines Marr / Otto Kline tie at 120,000 broken alphabetically. Tool ids `tool-select`, `tool-where`, `tool-order`, `tool-group`, `tool-null` match the spec's armoury table and the `tools:` values plans 3 and 4 will use.
