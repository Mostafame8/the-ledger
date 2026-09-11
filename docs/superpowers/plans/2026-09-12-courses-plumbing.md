# Courses — plan 1: course plumbing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the app into a set of courses sharing one shell, with algorithms as the only course, no content change, every existing test still green.

**Architecture:** Content moves to `src/courses/algorithms/`; the training engine (step constructors, progress maths, answer matching) moves to `src/training/`. A registry in `src/courses/index.js` lists course objects. The store gains `courseId` and reads all content through a `course` computed; slot data becomes `{ player: { name }, course, courses: { <id>: block } }` with a pure `upgradeData` migration in `saves.js`. A course screen opens after the slot screen.

**Tech Stack:** Vue 3, Vite 5, `node --test`, Pyodide runner (untouched).

**Spec:** `docs/superpowers/specs/2026-09-12-courses-and-patterns-design.md`

## Global Constraints

- No router; the store stays the single spine.
- Components never import from `src/courses/` directly; they read the store.
- `src/scene/`, `src/runner.js`, `src/pyworker.js`, `src/harness.py` unchanged.
- No algorithms content edits beyond moving files and import paths.
- No per-component CSS; new rules go in `src/style.css`.
- Course id `algorithms`, title `The Ledger`, plain name `Algorithms`, stats `['logic', 'speed', 'memory']`, runner `python`.
- Slot data version 2 shape: `{ player: { name }, course: <id> | null, courses: { <id>: { xp, stats, cleared, notes, tab, mode, training } } }`. Export `VERSION` is 2.
- `npm test` and `npm run check` must pass at the end of every task.
- Commit messages: normal prose, ending with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Work on branch `courses-plumbing` off `main`.

---

## File structure

| Path | Responsibility |
|---|---|
| `src/training/node.js`, `progress.js`, `answers.js` | Engine shared by all courses (moved from `src/data/training/`). |
| `src/courses/algorithms/gates.js`, `tests.js`, `index.js` | Algorithms heist content (moved from `src/data/`). |
| `src/courses/algorithms/training/*.js`, `training/tools/*.js` | Algorithms lessons and tools (moved). |
| `src/courses/algorithms/course.js` | The algorithms course object. |
| `src/courses/index.js` | `COURSES`, `courseById`, `DEFAULT_COURSE`, `RUNNERS`. |
| `src/saves.js` | + `upgradeData`, `upgradeFile`, `VERSION = 2`. |
| `src/store.js` | `courseId`, `course`, block-shaped snapshot/apply, `selectCourse`, course screen state, per-course summaries. |
| `src/components/CourseSelect.vue` | The course screen ("Jobs"). |
| `src/App.vue`, `src/components/GateList.vue`, `SkillTree.vue`, `StatusWindow.vue`, `SaveFiles.vue` | Read content through the store; Jobs button; course title. |
| `scripts/check-gates.mjs`, `check-training.mjs`, `test-solutions.mjs` | Loop over `COURSES`. |
| `scripts/solutions/algorithms/*.py`, `algorithms/training/*.py` | Moved reference solutions. |
| `tests/courses.test.mjs` | Registry contract. |
| `tests/saves.test.mjs` | + migration cases. |
| `CLAUDE.md` | Layout paths updated. |

---

### Task 1: Move content and engine files

**Files:**
- Move: `src/data/gates.js`, `src/data/tests.js`, `src/data/index.js` → `src/courses/algorithms/`
- Move: `src/data/training/*.js` (44 nodes + `index.js`) and `src/data/training/tools/` → `src/courses/algorithms/training/`
- Move: `src/data/training/node.js`, `progress.js`, `answers.js` → `src/training/`
- Move: `scripts/solutions/arc*.py` → `scripts/solutions/algorithms/`; `scripts/solutions/training/` → `scripts/solutions/algorithms/training/`
- Modify: every importer listed in step 3

**Interfaces:**
- Produces: `src/training/node.js` (exports `node`, `tool`, `explain`, `trace`, `spot`, `blank`, `mini`, `MOVES`), `src/training/progress.js` (`TIERS`, `rankFor`, `rankProgress`, `isOpen`, `depthOf`), `src/training/answers.js` (`pyLiteral`, `normalize`, `sameLiteral`); `src/courses/algorithms/index.js` (`ARCS`, `GATES`, `XP_PER_LEVEL`, `TITLES`, `titleFor`); `src/courses/algorithms/training/index.js` (`NODES`, `NODE_BY_ID`, `TOOLS`, `TOOL_BY_ID`, `TIERS`).

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull && git checkout -b courses-plumbing
```

- [ ] **Step 2: Move files with git**

```bash
mkdir -p src/courses/algorithms src/training scripts/solutions/algorithms
git mv src/data/training/node.js src/data/training/progress.js src/data/training/answers.js src/training/
git mv src/data/training src/courses/algorithms/training
git mv src/data/gates.js src/data/tests.js src/data/index.js src/courses/algorithms/
git mv scripts/solutions/training scripts/solutions/algorithms/training
git mv scripts/solutions/arc1.py scripts/solutions/arc2.py scripts/solutions/arc3.py scripts/solutions/arc4.py scripts/solutions/arc5.py scripts/solutions/algorithms/
rmdir src/data
```

- [ ] **Step 3: Rewrite import paths**

Content nodes import the constructors relatively. Run from the repo root (Git Bash):

```bash
# 44 lesson files: './node.js' -> engine
sed -i "s#from './node.js'#from '../../../training/node.js'#" src/courses/algorithms/training/*.js
# 12 tool files: '../node.js' -> engine
sed -i "s#from '../node.js'#from '../../../../training/node.js'#" src/courses/algorithms/training/tools/*.js
# training/index.js re-exports TIERS from progress
sed -i "s#from './progress.js'#from '../../../training/progress.js'#" src/courses/algorithms/training/index.js
```

Then edit these by hand (exact new lines):

`src/store.js` lines 2–5:
```js
import { ARCS, GATES, XP_PER_LEVEL, titleFor } from './courses/algorithms/index.js'
import { runTests, runtime, warm } from './runner.js'
import { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS } from './courses/algorithms/training/index.js'
import { rankFor, rankProgress, isOpen } from './training/progress.js'
```

`src/App.vue` lines 2–3:
```js
import { ARCS, GATES } from './courses/algorithms/index.js'
import { NODES } from './courses/algorithms/training/index.js'
```

`src/components/GateList.vue` line 3: `import { ARCS } from '../courses/algorithms/index.js'`

`src/components/SkillTree.vue` lines 3–4:
```js
import { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS } from '../courses/algorithms/training/index.js'
import { depthOf } from '../training/progress.js'
```

`src/components/StatusWindow.vue` line 3: `import { NODES, TOOLS } from '../courses/algorithms/training/index.js'`

`src/components/StepTrace.vue` line 4: `import { pyLiteral, sameLiteral } from '../training/answers.js'`

`scripts/check-gates.mjs` line 2: `import { ARCS } from '../src/courses/algorithms/index.js'`

`scripts/check-training.mjs` lines 2–4:
```js
import { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID } from '../src/courses/algorithms/training/index.js'
import { GATES } from '../src/courses/algorithms/index.js'
import { MOVES } from '../src/training/node.js'
```

`scripts/test-solutions.mjs` lines 12–13 and the two solution folders:
```js
import { GATES } from '../src/courses/algorithms/index.js'
import { NODES, TOOLS } from '../src/courses/algorithms/training/index.js'
```
```js
const gateSolutions = loadSolutions(new URL('scripts/solutions/algorithms/', root))
const trainingSolutions = loadSolutions(new URL('scripts/solutions/algorithms/training/', root))
```

`tests/training-answers.test.mjs` line 3: `from '../src/training/answers.js'`
`tests/training-progress.test.mjs` line 3: `from '../src/training/progress.js'`
`tests/training-tools.test.mjs` line 3: `from '../src/courses/algorithms/training/index.js'`

Check nothing still points at the old paths:

```bash
grep -rn "data/" src scripts tests --include=*.js --include=*.vue --include=*.mjs
```
Expected: one match only, the message text `src/data/tests.js` in `check-gates.mjs` line 17 (fixed in Task 7).

- [ ] **Step 4: Run everything**

Run: `npm test && npm run check && npm run build`
Expected: `✓ 78 gates, 98 training drills, 1186 checks`, `✓ 78 gates across 5 arcs`, `✓ 44 training nodes and 12 tools`, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move algorithms content under src/courses and the training engine under src/training

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Course registry

**Files:**
- Create: `src/courses/algorithms/course.js`
- Create: `src/courses/index.js`
- Test: `tests/courses.test.mjs`

**Interfaces:**
- Produces:
  ```js
  // src/courses/algorithms/course.js
  export const course = {
    id: 'algorithms', title: 'The Ledger', algo: 'Algorithms', runner: 'python',
    stats: ['logic', 'speed', 'memory'],
    arcs: ARCS, gates: GATES,
    training: { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS },
    xpPerLevel: XP_PER_LEVEL, titles: TITLES, titleFor,
    blurbs: { heist: string, training: string },   // header taglines
    tierBlurbs: { F: string, ..., S: string },      // SkillTree tier tab subtitles
  }
  // src/courses/index.js
  export const COURSES = [algorithms]
  export const DEFAULT_COURSE = 'algorithms'
  export const RUNNERS = ['python']
  export const courseById = id => COURSES.find(c => c.id === id) ?? null
  ```

- [ ] **Step 1: Write the failing test**

`tests/courses.test.mjs`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { COURSES, DEFAULT_COURSE, courseById, RUNNERS } from '../src/courses/index.js'

test('algorithms is the first and default course', () => {
  assert.equal(COURSES[0].id, 'algorithms')
  assert.equal(DEFAULT_COURSE, 'algorithms')
  assert.equal(courseById('algorithms'), COURSES[0])
  assert.equal(courseById('nope'), null)
})

test('course ids are unique kebab-case', () => {
  const ids = COURSES.map(c => c.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/)
})

test('every course carries the shell contract', () => {
  for (const c of COURSES) {
    for (const f of ['title', 'algo']) assert.equal(typeof c[f], 'string', `${c.id}.${f}`)
    assert.ok(RUNNERS.includes(c.runner), `${c.id}: runner ${c.runner}`)
    assert.equal(c.stats.length, 3, `${c.id}: three stats`)
    assert.equal(new Set(c.stats).size, 3)
    assert.ok(Array.isArray(c.arcs) && c.arcs.length > 0)
    assert.deepEqual(c.gates, c.arcs.flatMap(a => a.gates))
    for (const g of c.gates) assert.ok(c.stats.includes(g.stat), `${c.id}/${g.id}: stat ${g.stat}`)
    for (const k of ['NODES', 'NODE_BY_ID', 'TOOLS', 'TOOL_BY_ID', 'TIERS']) assert.ok(c.training[k], `${c.id}: training.${k}`)
    assert.ok(Number.isInteger(c.xpPerLevel) && c.xpPerLevel > 0)
    assert.ok(Array.isArray(c.titles) && c.titles.length >= 2)
    assert.equal(typeof c.titleFor(0), 'string')
    assert.equal(typeof c.blurbs.heist, 'string')
    assert.equal(typeof c.blurbs.training, 'string')
    for (const t of c.training.TIERS) assert.equal(typeof c.tierBlurbs[t], 'string', `${c.id}: tierBlurbs.${t}`)
  }
})

test('gate, node and tool ids are unique within a course', () => {
  for (const c of COURSES) {
    const ids = [...c.gates.map(g => g.id), ...c.training.NODES.map(n => n.id), ...c.training.TOOLS.map(t => t.id)]
    assert.equal(new Set(ids).size, ids.length, `${c.id}: duplicate ids`)
  }
})
```

- [ ] **Step 2: Run it, expect failure**

Run: `node --test tests/courses.test.mjs`
Expected: FAIL, `Cannot find module '.../src/courses/index.js'`.

- [ ] **Step 3: Write the course object and registry**

`src/courses/algorithms/course.js`:
```js
// The algorithms course: the original heist and its training room.
import { ARCS, GATES, XP_PER_LEVEL, TITLES, titleFor } from './index.js'
import { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS } from './training/index.js'

export const course = {
  id: 'algorithms',
  title: 'The Ledger',
  algo: 'Algorithms',
  runner: 'python',
  stats: ['logic', 'speed', 'memory'],
  arcs: ARCS,
  gates: GATES,
  training: { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS },
  xpPerLevel: XP_PER_LEVEL,
  titles: TITLES,
  titleFor,
  blurbs: {
    heist: `A heist in ${ARCS.length} arcs and ${GATES.length} gates. Every gate needs a trick. Every trick is an algorithm.`,
    training: `${NODES.length} lessons in a back room. Marguerite teaches the trick before the gate demands it.`,
  },
  tierBlurbs: {
    F: 'Hands on the tools.',
    E: 'Search, stacks, and shape.',
    D: 'Windows, sums, links, trees.',
    C: 'Grids and recursion.',
    B: 'Graphs, heaps, sorting.',
    A: 'Weighted roads and the first tables.',
    S: 'The Ledger itself.',
  },
}
```

`src/courses/index.js`:
```js
// Every course the shell can run, in display order. Add a course folder, import its
// course object, append it here.
import { course as algorithms } from './algorithms/course.js'

export const COURSES = [algorithms]
export const DEFAULT_COURSE = 'algorithms'
export const RUNNERS = ['python']
export const courseById = id => COURSES.find(c => c.id === id) ?? null
```

- [ ] **Step 4: Run the test, expect pass**

Run: `node --test tests/courses.test.mjs`
Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add src/courses tests/courses.test.mjs
git commit -m "feat(courses): registry and the algorithms course object

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Slot data migration in saves.js

**Files:**
- Modify: `src/saves.js`
- Test: `tests/saves.test.mjs`

**Interfaces:**
- Produces:
  ```js
  export const DEFAULT_COURSE = 'algorithms'     // saves.js must not import src/courses (keeps it pure and cheap to test)
  export function upgradeData(data)            // null -> null; v2 -> same object; v1 -> v2
  export function upgradeFile(file)            // maps upgradeData over every slot's data
  export const VERSION = 2                     // export format version
  ```
  `parseImport` returns slots whose `data` is already upgraded.

- [ ] **Step 1: Write the failing tests**

Append to `tests/saves.test.mjs` (add `upgradeData, upgradeFile, parseImport, exportSlot` to the import line):
```js
const v1 = { player: { name: 'Hunter', xp: 120, stats: { logic: 1, speed: 2, memory: 0 } }, cleared: ['a', 'b'], notes: { a: 'x' }, tab: 1, mode: 'training', training: { xp: 40, nodes: { loops: { step: 0, cleared: true } }, tools: {}, active: null, code: {}, tab: 'F' } }

test('upgradeData: null stays null', () => {
  assert.equal(upgradeData(null), null)
  assert.equal(upgradeData(undefined), null)
})

test('upgradeData: v1 data moves under courses.algorithms, name stays on player', () => {
  const d = upgradeData(v1)
  assert.deepEqual(d.player, { name: 'Hunter' })
  assert.equal(d.course, 'algorithms')
  assert.deepEqual(Object.keys(d.courses), ['algorithms'])
  assert.deepEqual(d.courses.algorithms, {
    xp: 120, stats: { logic: 1, speed: 2, memory: 0 }, cleared: ['a', 'b'], notes: { a: 'x' },
    tab: 1, mode: 'training', training: v1.training,
  })
})

test('upgradeData: v1 data with missing fields gets defaults', () => {
  const d = upgradeData({ player: { name: 'Zed' } })
  assert.deepEqual(d.courses.algorithms, { xp: 0, stats: { logic: 0, speed: 0, memory: 0 }, cleared: [], notes: {}, tab: null, mode: 'heist', training: null })
})

test('upgradeData: v2 data is returned unchanged, unknown course blocks kept', () => {
  const d2 = { player: { name: 'Hunter' }, course: 'sql', courses: { algorithms: { xp: 1 }, sql: { xp: 9 } } }
  assert.equal(upgradeData(d2), d2)
})

test('upgradeFile: every slot upgraded, ids and selection untouched', () => {
  const f0 = migrateLegacy(v1, T0)
  const f1 = upgradeFile(f0)
  assert.equal(f1.current, f0.current)
  assert.equal(f1.slots[0].id, f0.slots[0].id)
  assert.equal(f1.slots[0].data.course, 'algorithms')
  const { file: f2 } = createSlot(f1, 'Fresh', T1)
  assert.equal(upgradeFile(f2).slots[1].data, null)
})

test('parseImport: a version 1 export comes back upgraded', () => {
  const text = JSON.stringify({ format: 'ledger-save', version: 1, slot: { name: 'Old', created: 5, updated: 6, data: v1 } })
  const r = parseImport(text, T1)
  assert.equal(r.ok, true)
  assert.equal(r.slot.data.course, 'algorithms')
  assert.equal(r.slot.data.courses.algorithms.xp, 120)
})

test('exportSlot: writes version 2', () => {
  const s = migrateLegacy(v1, T0).slots[0]
  assert.equal(JSON.parse(exportSlot(s)).version, 2)
})
```

- [ ] **Step 2: Run, expect failure**

Run: `node --test tests/saves.test.mjs`
Expected: FAIL, an import error naming `upgradeData`.

- [ ] **Step 3: Implement**

In `src/saves.js`, replace the header comment's `data =` line with the new shape and add the migration after `MAX_NAME`:
```js
//   data = null for a fresh slot, or version 2:
//     { player: { name }, course: <course id | null>, courses: { <course id>: block } }
//     block = { xp, stats, cleared, notes, tab, mode, training }
//   Version 1 data (everything at the top level, xp and stats inside player) is upgraded on read.

export const DEFAULT_COURSE = 'algorithms'
const V1_STATS = { logic: 0, speed: 0, memory: 0 }

// Pure. null stays null; version 2 is returned as is (unknown course blocks kept); version 1 is wrapped.
export function upgradeData(data) {
  if (data === null || data === undefined) return null
  if (data.courses && typeof data.courses === 'object') return data
  const p = data.player || {}
  const block = {
    xp: p.xp ?? 0,
    stats: p.stats ?? { ...V1_STATS },
    cleared: data.cleared ?? [],
    notes: data.notes ?? {},
    tab: data.tab ?? null,
    mode: data.mode === 'training' ? 'training' : 'heist',
    training: data.training ?? null,
  }
  return { player: { name: p.name }, course: DEFAULT_COURSE, courses: { [DEFAULT_COURSE]: block } }
}

export const upgradeFile = file => ({ ...file, slots: file.slots.map(s => ({ ...s, data: upgradeData(s.data) })) })
```

Change `const VERSION = 1` to `export const VERSION = 2`.

In `parseImport`, change `const data = s.data === undefined ? null : s.data` to:
```js
  const data = upgradeData(s.data === undefined ? null : s.data)
```
(`validData` already accepts both shapes: both carry `player`.)

- [ ] **Step 4: Run, expect pass**

Run: `node --test tests/saves.test.mjs`
Expected: all passing, including the earlier slot tests.

- [ ] **Step 5: Commit**

```bash
git add src/saves.js tests/saves.test.mjs
git commit -m "feat(saves): version 2 slot data with per-course blocks; upgrade v1 on read and import

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Store reads content through the active course; block-shaped saves

**Files:**
- Modify: `src/store.js`

**Interfaces:**
- Consumes: `COURSES`, `courseById`, `DEFAULT_COURSE` from `src/courses/index.js`; `upgradeFile` from `saves.js`.
- Produces (new in `useStore()`): `course` (computed course object), `courseId` (ref), `courses` (the `COURSES` list), `courseSummary(slot, id)`. Everything else keeps its name and shape, except `xpPerLevel` which becomes a computed (`s.xpPerLevel.value`).
- No course switching yet; `courseId` is the slot's `data.course` or `DEFAULT_COURSE`.

The store has no unit tests (it touches `localStorage`, `window`, and the Worker-backed runner). Verification for this task is `npm test`, `npm run build`, and the browser check in step 5.

- [ ] **Step 1: Replace the content imports**

Replace lines 2–5 of `src/store.js` with:
```js
import { runTests, runtime, warm } from './runner.js'
import { COURSES, courseById, DEFAULT_COURSE } from './courses/index.js'
import { rankFor, rankProgress, isOpen } from './training/progress.js'
```
and extend the saves import with `upgradeFile`:
```js
import { SAVES_KEY, LEGACY_KEY, migrateLegacy, upgradeFile, createSlot, selectSlot, deleteSlot, renameSlot, writeSlot, currentSlot, exportSlot, parseImport, importSlot } from './saves.js'
```

- [ ] **Step 2: Upgrade the file on load, add the course refs**

Change `loadFile`:
```js
const loadFile = () => {
  const f = readJson(SAVES_KEY)
  const file = f && Array.isArray(f.slots) ? { current: f.current ?? null, slots: f.slots } : migrateLegacy(readJson(LEGACY_KEY), Date.now())
  return upgradeFile(file)
}
```

After `const savesOpen = ref(false)` add:
```js
// ── Courses ──────────────────────────────────────────────────────────────────────
// One slot holds a block per course. The live refs below hold the active course's block.
const courseId = ref(DEFAULT_COURSE)
const course = computed(() => courseById(courseId.value) ?? COURSES[0])
const T = computed(() => course.value.training)          // { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS }
const zeroStats = keys => Object.fromEntries(keys.map(k => [k, 0]))
```

Change `fresh`:
```js
const fresh = (name = 'Hunter') => ({ name, xp: 0, stats: zeroStats(course.value.stats) })
```

- [ ] **Step 3: Route every module-level content read through `course` / `T`**

Apply these replacements in `src/store.js` (each is a whole-line or expression swap):

```js
// was: const ITEM_BY_ID = { ...NODE_BY_ID, ...TOOL_BY_ID }
const itemById = id => T.value.NODE_BY_ID[id] ?? T.value.TOOL_BY_ID[id] ?? null
// was: const progressMap = id => TOOL_BY_ID[id] ? ...
const progressMap = id => T.value.TOOL_BY_ID[id] ? training.value.tools : training.value.nodes

const trainingRank = computed(() => rankFor(training.value.xp, T.value.NODES))
const trainingProgress = computed(() => rankProgress(training.value.xp, T.value.NODES))
const nodesCleared = computed(() => T.value.NODES.filter(n => training.value.nodes[n.id]?.cleared).length)
const toolsCleared = computed(() => T.value.TOOLS.filter(t => training.value.tools[t.id]?.cleared).length)
const kitXp = computed(() => T.value.TOOLS.filter(t => training.value.tools[t.id]?.cleared).reduce((sum, t) => sum + t.xp, 0))
const nodeState = id => {
  const rec = progressMap(id)[id]
  if (rec?.cleared) return 'cleared'
  if (T.value.TOOL_BY_ID[id]) return 'open'
  const n = T.value.NODE_BY_ID[id]
  return n && isOpen(n, training.value.nodes, training.value.tools) ? 'open' : 'locked'
}

// was: const populatedTiers = TIERS.filter(...)
const populatedTiers = computed(() => T.value.TIERS.filter(t => T.value.NODES.some(n => n.tier === t)))
const defaultTrainingTab = () => {
  if (toolsCleared.value === 0) return 'kit'
  const tiers = populatedTiers.value
  const t = tiers.find(t => T.value.NODES.some(n => n.tier === t && !training.value.nodes[n.id]?.cleared))
  return t ?? tiers[tiers.length - 1]
}
const validTrainingTab = t => t === 'kit' || populatedTiers.value.includes(t)
const tierProgress = tier => {
  const nodes = T.value.NODES.filter(n => n.tier === tier)
  return { done: nodes.filter(n => training.value.nodes[n.id]?.cleared).length, total: nodes.length }
}

const activeNode = computed(() => training.value.active ? itemById(training.value.active) : null)
```

In `enterStep`: `if (training.value.active && !itemById(training.value.active)) training.value.active = null`.
In `openNode`: `if (!itemById(id) || nodeState(id) === 'locked') return` and `if (itemById(id).steps.some(st => st.tests)) warm()`.
In `finishItem`: `if (T.value.TOOL_BY_ID[n.id]) {`.

Heist side:
```js
const gate = computed(() => active.value === null ? null : course.value.gates[active.value])
const xpPerLevel = computed(() => course.value.xpPerLevel)
const level = computed(() => Math.floor(player.value.xp / xpPerLevel.value))
const xpInLevel = computed(() => player.value.xp % xpPerLevel.value)
const xpPct = computed(() => xpInLevel.value / xpPerLevel.value * 100)
const clearedCount = computed(() => cleared.value.length)
const title = computed(() => course.value.titleFor(clearedCount.value))
const statList = computed(() => course.value.stats
  .map(k => ({ key: k, label: k[0].toUpperCase() + k.slice(1), value: player.value.stats[k] ?? 0 })))

const isDone = id => cleared.value.includes(id)
const isLocked = g => { const i = course.value.gates.indexOf(g); return i > 0 && !isDone(course.value.gates[i - 1].id) }
const defaultTab = () => { const arcs = course.value.arcs; const i = arcs.findIndex(a => a.gates.some(g => !isDone(g.id))); return i === -1 ? arcs.length - 1 : i }
const validTab = t => Number.isInteger(t) && t >= 0 && t < course.value.arcs.length
const open = g => { if (isLocked(g)) return; active.value = course.value.gates.indexOf(g); run.value = null; if (g.tests) warm() }
```
In `clear(g)`: `player.value.stats[g.stat] = (player.value.stats[g.stat] ?? 0) + 1`.

- [ ] **Step 4: Snapshot and apply in block shape**

Replace `snapshot`, `applyData` and `summary`:
```js
// ── Save files: load a slot's course block into the live refs, write it back ─────
const block = () => ({
  xp: player.value.xp, stats: player.value.stats, cleared: cleared.value, notes: notes.value,
  tab: tab.value, mode: mode.value, training: { ...training.value, tab: trainingTab.value },
})
// The whole slot payload: name, active course, every course block with the live one refreshed.
const snapshot = data => ({
  player: { name: player.value.name },
  course: courseId.value,
  courses: { ...(data?.courses || {}), [courseId.value]: block() },
})
// Fill every live ref from a slot's data (null = a fresh game named after the slot). Picks the
// slot's last course, or the default. The watcher then writes the normalised snapshot back.
function applyData(data, name) {
  courseId.value = courseById(data?.course) ? data.course : DEFAULT_COURSE
  applyBlock(data, name)
}
function applyBlock(data, name) {
  const b = data?.courses?.[courseId.value] || {}
  player.value = { name: data?.player?.name ?? name ?? 'Hunter', xp: b.xp ?? 0, stats: { ...zeroStats(course.value.stats), ...(b.stats || {}) } }
  cleared.value = b.cleared || []
  notes.value = b.notes || {}
  active.value = null
  run.value = null
  mode.value = b.mode === 'training' ? 'training' : 'heist'
  training.value = { ...freshTraining(), ...(b.training || {}) }
  tab.value = validTab(b.tab) ? b.tab : defaultTab()
  trainingTab.value = validTrainingTab(training.value.tab) ? training.value.tab : defaultTrainingTab()
  enterStep()
}
function commitFile(f) { file.value = f; persistFile(f) }

// One-line cards. `courseSummary` reads one course's block; `summary` reads the slot's last course.
function courseSummary(slot, id) {
  const c = courseById(id)
  const b = slot?.data?.courses?.[id]
  const N = c.training.NODES
  return {
    id, title: c.title, algo: c.algo, started: !!b,
    level: Math.floor((b?.xp || 0) / c.xpPerLevel),
    gates: (b?.cleared || []).length, gatesTotal: c.gates.length,
    rank: rankFor(b?.training?.xp || 0, N),
    lessons: N.filter(n => b?.training?.nodes?.[n.id]?.cleared).length, lessonsTotal: N.length,
  }
}
function summary(slot) {
  const id = courseById(slot.data?.course) ? slot.data.course : DEFAULT_COURSE
  return { ...courseSummary(slot, id), jobs: Object.keys(slot.data?.courses || {}).length }
}
```

Fix the fresh-slot call sites: `applyData(null, currentSlot(f).name)` stays; in `deleteSave` change `applyData(null)` to `applyData(null, 'Hunter')`. Delete the `fresh` helper and change `const player = ref(fresh())` to `const player = ref({ name: 'Hunter', xp: 0, stats: zeroStats(course.value.stats) })`; `applyBlock` builds the player record now.

Change the watcher:
```js
watch([player, cleared, notes, tab, mode, training, trainingTab, courseId], () => {
  if (!file.value.current) return
  commitFile(writeSlot(file.value, file.value.current, snapshot(currentSave.value?.data), Date.now()))
}, { deep: true })
```

Extend `useStore()` return: replace `xpPerLevel: XP_PER_LEVEL` with `xpPerLevel`, and add `course, courseId, courses: COURSES, courseSummary`.

- [ ] **Step 5: Run tests and build, then browser check**

Run: `npm test && npm run check && npm run build`
Expected: green, build succeeds.

Run `npm run dev`, open the app in a browser that already has a save from before this branch (or create one on `main` first). Expected:
- The old slot loads with its level, gates, rank and lessons intact.
- In DevTools → Application → Local Storage, `ledger-saves-v1` now shows `data.courses.algorithms` and `data.course: "algorithms"` for that slot.
- Clear a gate; the block's `xp` and `cleared` update.
- New slot → plays as before.

- [ ] **Step 6: Commit**

```bash
git add src/store.js
git commit -m "refactor(store): read content through the active course; save per-course blocks

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Components read content through the store

**Files:**
- Modify: `src/App.vue`, `src/components/GateList.vue`, `src/components/SkillTree.vue`, `src/components/StatusWindow.vue`, `src/components/SaveFiles.vue`, `src/style.css`

**Interfaces:**
- Consumes: `s.course.value` (`arcs`, `gates`, `training.{NODES,NODE_BY_ID,TOOLS,TOOL_BY_ID,TIERS}`, `blurbs`, `tierBlurbs`), `s.summary(slot)` (now has `title`, `jobs`), `s.xpPerLevel.value`.

- [ ] **Step 1: App.vue**

Remove the two content imports (lines 2–3). Replace the two header lines:
```html
      <p v-if="s.mode.value === 'heist'">{{ s.course.value.blurbs.heist }}</p>
      <p v-else>{{ s.course.value.blurbs.training }}</p>
```

- [ ] **Step 2: GateList.vue**

Remove `import { ARCS } from ...`. Add `const ARCS = computed(() => s.course.value.arcs)` after `const s = useStore()`, then change `ARCS[s.tab.value]` to `ARCS.value[s.tab.value]` and, in the template, `v-for="(a, i) in ARCS"` to `v-for="(a, i) in ARCS.value"`.

- [ ] **Step 3: SkillTree.vue**

Replace lines 3–4 with `import { depthOf } from '../training/progress.js'`. Delete the `BLURBS` constant. After `const s = useStore()` add:
```js
const T = computed(() => s.course.value.training)
const tiers = computed(() => T.value.TIERS.filter(t => T.value.NODES.some(n => n.tier === t)))
const tabs = computed(() => ['kit', ...tiers.value])
const BLURBS = computed(() => s.course.value.tierBlurbs)
```
Then rewrite the remaining uses: `NODES` → `T.value.NODES`, `NODE_BY_ID` → `T.value.NODE_BY_ID`, `TOOLS` → `T.value.TOOLS`, `TOOL_BY_ID` → `T.value.TOOL_BY_ID`, `BLURBS[...]` → `BLURBS.value[...]`, `tabs` in the template → `tabs.value`, `tiers` → `tiers.value`. Grep the file afterwards:

```bash
grep -nE "\b(NODES|NODE_BY_ID|TOOLS|TOOL_BY_ID|TIERS)\b" src/components/SkillTree.vue | grep -v "T.value"
```
Expected: no matches.

- [ ] **Step 4: StatusWindow.vue**

Remove line 3. Add `const T = computed(() => s.course.value.training)` after `const s = useStore()`. Template: `NODES.length` → `T.value.NODES.length`, `TOOLS.length` → `T.value.TOOLS.length`, `v-for="t in TOOLS"` → `v-for="t in T.value.TOOLS"`, and `s.xpPerLevel` (two places) → `s.xpPerLevel.value`.

Add the course title above the name: change `<div class="name">{{ s.player.value.name }}</div>` to
```html
      <div class="course-line">{{ s.course.value.title }} <small>{{ s.course.value.algo }}</small></div>
      <div class="name">{{ s.player.value.name }}</div>
```

- [ ] **Step 5: SaveFiles.vue meta line**

Change the `save-meta` span to:
```html
              <span class="save-meta">
                {{ s.summary(slot).title }} · Level {{ s.summary(slot).level }} · {{ s.summary(slot).gates }} gates ·
                rank <span class="rank-letter" :class="s.summary(slot).rank">{{ s.summary(slot).rank }}</span> · {{ s.summary(slot).lessons }} lessons
              </span>
```

- [ ] **Step 6: Style for the course line**

In `src/style.css`, after the `.name{...}` rule inside the status block, add:
```css
  .course-line{color:var(--dim);font-size:13px;letter-spacing:.08em;text-transform:uppercase}
  .course-line small{color:var(--faint);letter-spacing:0;text-transform:none;font-size:12px;margin-left:6px}
```

- [ ] **Step 7: Verify no component imports content**

```bash
grep -rn "courses/" src/components src/App.vue
```
Expected: no matches.

Run: `npm run build && npm run dev`. In the browser: header taglines show, arc tabs and tier tabs render, tier blurbs unchanged, status window shows "THE LEDGER Algorithms" above the name, the save list meta line begins with "The Ledger ·".

- [ ] **Step 8: Commit**

```bash
git add src/App.vue src/components src/style.css
git commit -m "refactor(ui): components read course content through the store; course line in the status window

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Course screen and switching

**Files:**
- Modify: `src/store.js`
- Create: `src/components/CourseSelect.vue`
- Modify: `src/App.vue`, `src/components/StatusWindow.vue`

**Interfaces:**
- Produces in `useStore()`: `courseScreen` (computed boolean: show the course screen), `openCourses()`, `closeCourses()`, `selectCourse(id)`, `courseChosen` (ref).
- Slot `data.course` is `null` until the learner picks a course on a fresh slot; the writer uses `courseChosen`.

- [ ] **Step 1: Store: course screen state and `selectCourse`**

After the `T` computed in the Courses section, add:
```js
const coursesOpen = ref(false)             // the course screen, opened from the Status window
const courseChosen = ref(true)             // false on a fresh slot until the learner picks a job
const courseScreen = computed(() => coursesOpen.value || (!!currentSave.value && !courseChosen.value))
const openCourses = () => { coursesOpen.value = true }
const closeCourses = () => { if (courseChosen.value) coursesOpen.value = false }
```

In `snapshot`, write `course: courseChosen.value ? courseId.value : null`.

In `applyData`, set `courseChosen.value = !!courseById(data?.course)` before `applyBlock`.

Add `selectCourse` after `applyBlock`:
```js
// Switch the live refs to another course's block. The watcher has already persisted the
// current block after every change, so nothing is flushed here.
function selectCourse(id) {
  if (!courseById(id) || !currentSave.value) return
  if (id !== courseId.value || !courseChosen.value) {
    courseId.value = id
    courseChosen.value = true
    applyBlock(currentSave.value.data, currentSave.value.name)
  }
  coursesOpen.value = false
}
```

`newSave`: after `applyData(null, currentSlot(f).name)` the fresh slot has `courseChosen` false, so the course screen shows by itself. In `deleteSave`, when the deleted slot was current, add `courseChosen.value = true` after `applyData(null, 'Hunter')` (no slot: the save screen is what shows). Add `closeCourses()` to the Escape handler. Extend the `useStore()` return with `courseScreen, openCourses, closeCourses, selectCourse, courseChosen`.

- [ ] **Step 2: CourseSelect.vue**

```vue
<script setup>
import { useStore } from '../store.js'
const s = useStore()
const card = c => s.courseSummary(s.currentSave.value, c.id)
const current = c => c.id === s.courseId.value && s.courseChosen.value
</script>

<template>
  <div class="veil" @click.self="s.closeCourses">
    <section class="sys quest saves" role="dialog" aria-modal="true" aria-labelledby="courses-title">
      <div class="sys-title"><i></i> Jobs</div>
      <div class="body">
        <h2 id="courses-title">What's the job?</h2>
        <p class="algo">One crew, one save file. Every job keeps its own score.</p>
        <ul class="save-list">
          <li v-for="c in s.courses" :key="c.id" class="save" :class="{ current: current(c) }">
            <div class="save-main">
              <b class="save-name">{{ c.title }}</b>
              <span class="save-meta">
                {{ c.algo }} ·
                <template v-if="card(c).started">
                  Level {{ card(c).level }} · {{ card(c).gates }} / {{ card(c).gatesTotal }} gates ·
                  rank <span class="rank-letter" :class="card(c).rank">{{ card(c).rank }}</span> · {{ card(c).lessons }} / {{ card(c).lessonsTotal }} lessons
                </template>
                <template v-else>not started · {{ card(c).gatesTotal }} gates · {{ card(c).lessonsTotal }} lessons</template>
              </span>
            </div>
            <div class="row save-actions">
              <button class="btn" @click="s.selectCourse(c.id)">{{ current(c) ? 'Continue' : card(c).started ? 'Resume' : 'Take the job' }}</button>
            </div>
          </li>
        </ul>
        <div class="row" v-if="s.courseChosen.value">
          <button class="btn ghost" type="button" @click="s.closeCourses">Back</button>
          <span class="dim">Esc closes</span>
        </div>
      </div>
    </section>
  </div>
</template>
```

- [ ] **Step 3: Wire it in**

`App.vue`: import `CourseSelect from './components/CourseSelect.vue'`; after the SaveFiles transition add
```html
    <Transition name="veil">
      <CourseSelect v-if="s.courseScreen.value && !s.savesOpen.value && s.currentSave.value" />
    </Transition>
```

`StatusWindow.vue`: replace the `<button class="reset" ...>Save files</button>` line with
```html
      <div class="row">
        <button class="reset" @click="s.openCourses">Jobs</button>
        <button class="reset" @click="s.openSaves">Save files</button>
      </div>
```

- [ ] **Step 4: Browser check**

Run `npm run build && npm run preview`, open the preview URL:
1. New save → the Jobs screen appears with one row, "Take the job". Local storage shows `data.course: null`. Reload → Jobs screen again.
2. Take the job → the game shows; `data.course: "algorithms"`.
3. Jobs button reopens the screen with "Continue"; Back and Esc close it.
4. Load an old slot → no Jobs screen, straight into the game.
5. Delete the current slot → save screen, no Jobs screen behind it.

- [ ] **Step 5: Commit**

```bash
git add src/store.js src/components/CourseSelect.vue src/App.vue src/components/StatusWindow.vue
git commit -m "feat(courses): the Jobs screen — pick a course per save file

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Validators and solution proofs over every course

**Files:**
- Modify: `scripts/check-gates.mjs`, `scripts/check-training.mjs`, `scripts/test-solutions.mjs`
- Modify: `tests/training-tools.test.mjs`

**Interfaces:**
- Consumes: `COURSES`, `RUNNERS` from `src/courses/index.js`.
- Solutions folders: `scripts/solutions/<course id>/*.py` (gates) and `scripts/solutions/<course id>/training/*.py` (drills).

- [ ] **Step 1: check-gates.mjs**

Replace the file:
```js
// Validates gate data for every course: unique ids, required fields, rank/xp sanity, arc sizes.
import { COURSES, RUNNERS } from '../src/courses/index.js'
const RANKS = ['F','E','D','C','B','A','S']
let errors = 0
let gates = 0
for (const c of COURSES) {
  const before = errors
  const fail = m => { console.error('✗', `${c.id}: ${m}`); errors++ }
  if (!RUNNERS.includes(c.runner)) fail(`unknown runner ${c.runner}`)
  if (!Array.isArray(c.stats) || c.stats.length !== 3 || new Set(c.stats).size !== 3) fail(`stats must be three distinct keys`)
  const ids = new Set()
  for (const arc of c.arcs) {
    if (arc.gates.length < 3 || arc.gates.length > 20) fail(`${arc.name}: has ${arc.gates.length} gates (want 3–20)`)
    for (const g of arc.gates) {
      if (ids.has(g.id)) fail(`duplicate id ${g.id}`); ids.add(g.id)
      if (!RANKS.includes(g.rank)) fail(`${g.id}: bad rank ${g.rank}`)
      if (!c.stats.includes(g.stat)) fail(`${g.id}: bad stat ${g.stat}`)
      if (!(g.xp > 0)) fail(`${g.id}: xp missing`)
      for (const f of ['title','algo','mission','hint']) if (!g[f]) fail(`${g.id}: missing ${f}`)
      if (!Array.isArray(g.story) || g.story.length < 2) fail(`${g.id}: story needs 2+ lines`)
      if (g.story && !g.story.some(l => l.startsWith('“'))) fail(`${g.id}: story has no spoken line`)
      if (!g.tests) fail(`${g.id}: no tests in src/courses/${c.id}/tests.js`)
      else if (!g.tests.includes('check(')) fail(`${g.id}: tests never call check()`)
    }
  }
  gates += ids.size
  if (errors === before) console.log(`✓ ${c.id}: ${ids.size} gates across ${c.arcs.length} arcs look good`)
}
console.log(errors ? `${errors} problem(s)` : `✓ ${gates} gates across ${COURSES.length} course(s)`)
process.exit(errors ? 1 : 0)
```

- [ ] **Step 2: check-training.mjs**

Change the imports to:
```js
import { COURSES } from '../src/courses/index.js'
import { MOVES } from '../src/training/node.js'
import { sceneErrors, stateErrors } from '../src/scene/validate.js'
```
Wrap everything from `const gateIds = new Set(...)` down to and including the DAG check in a course loop, moving `validateStep` inside so it closes over `fail`:
```js
let errors = 0
let totalNodes = 0, totalTools = 0
for (const c of COURSES) {
  const { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID } = c.training
  const gateIds = new Set(c.gates.map(g => g.id))
  const fail = m => { console.error('✗', `${c.id}: ${m}`); errors++ }

  function validateStep(ownerId, s, i) { /* body unchanged */ }

  /* existing node loop, tool loop and DAG check unchanged */

  totalNodes += NODES.length; totalTools += TOOLS.length
}
```
Replace the hard-coded tool count line `if (TOOLS.length !== 12) fail(...)` with `if (TOOLS.length < 1) fail('a course needs at least one tool')`. Final line:
```js
console.log(errors ? `${errors} problem(s)` : `✓ ${totalNodes} training nodes and ${totalTools} tools across ${COURSES.length} course(s) look good`)
```

- [ ] **Step 3: test-solutions.mjs**

Replace the content imports with `import { COURSES } from '../src/courses/index.js'`. Make `loadSolutions` tolerate a missing folder:
```js
function loadSolutions(dirUrl) {
  const map = new Map()
  let files
  try { files = readdirSync(dirUrl).filter(f => f.endsWith('.py')) } catch { return map }
  for (const f of files) {
    const parts = readFileSync(new URL(f, dirUrl), 'utf8').split(/^# === (\S+)\s*$/m)
    for (let i = 1; i < parts.length; i += 2) {
      if (map.has(parts[i])) console.error(`✗ duplicate solution for ${parts[i]} in ${f}`)
      map.set(parts[i], parts[i + 1])
    }
  }
  return map
}
```
Replace everything from `const gateSolutions = ...` through the two `for` loops with a per-course loop; keep `prove`, `tmp` and the counters:
```js
const only = process.argv.slice(2)
const tmp = mkdtempSync(join(tmpdir(), 'ledger-'))
let failures = 0, checks = 0, drills = 0, gateCount = 0

// prove(...) unchanged

for (const c of COURSES) {
  const gateSolutions = loadSolutions(new URL(`scripts/solutions/${c.id}/`, root))
  const trainingSolutions = loadSolutions(new URL(`scripts/solutions/${c.id}/training/`, root))
  const gates = only.length ? c.gates.filter(g => only.includes(g.id)) : c.gates
  const { NODES, TOOLS } = c.training
  const nodes = only.length ? NODES.filter(n => only.includes(n.id)) : NODES
  const tools = only.length ? TOOLS.filter(t => only.includes(t.id)) : TOOLS
  gateCount += gates.length

  for (const g of gates) {
    if (!g.tests) { console.error(`✗ ${c.id}/${g.id}: no tests`); failures++; continue }
    const sol = gateSolutions.get(g.id)
    if (!sol) { console.error(`✗ ${c.id}/${g.id}: no reference solution in scripts/solutions/${c.id}/`); failures++; continue }
    prove(`${c.id} ${g.id}`, sol, g.tests)
  }
  for (const n of [...nodes, ...tools]) {
    n.steps.forEach((s, i) => {
      if (!s.tests) return
      drills++
      const key = `${n.id}/${i}`
      const sol = trainingSolutions.get(key)
      if (!sol) { console.error(`✗ ${c.id} training ${key}: no reference solution in scripts/solutions/${c.id}/training/`); failures++; return }
      prove(`${c.id} training ${key}`, sol, s.tests)
    })
  }
}

rmSync(tmp, { recursive: true, force: true })
console.log(failures ? `${failures} problem(s)` : `✓ ${gateCount} gates, ${drills} training drills, ${checks} checks, all reference solutions pass`)
process.exit(failures ? 1 : 0)
```
Update the header comment's two folder lines to the `<course id>` paths.

- [ ] **Step 4: training-tools.test.mjs per course**

Replace the import with `import { COURSES } from '../src/courses/index.js'` and the first test with:
```js
const EXPECTED_TOOLS = { algorithms: 12 }

test('each course has the expected tool count', () => {
  for (const c of COURSES) assert.equal(c.training.TOOLS.length, EXPECTED_TOOLS[c.id], `${c.id} tools`)
})
```
Wrap each remaining test body in `for (const { training: { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID } } of COURSES) { ... }`.

- [ ] **Step 5: Run**

Run: `npm test && npm run check`
Expected: `✓ 78 gates, 98 training drills, 1186 checks`, `✓ algorithms: 78 gates across 5 arcs look good`, `✓ 78 gates across 1 course(s)`, `✓ 44 training nodes and 12 tools across 1 course(s) look good`. Filters still work: `node scripts/test-solutions.mjs fizz` proves one gate.

- [ ] **Step 6: Commit**

```bash
git add scripts tests/training-tools.test.mjs
git commit -m "chore(check): validators and solution proofs loop over every course

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Docs and finish

**Files:**
- Modify: `CLAUDE.md` (Layout section, schema paths)
- Modify: `docs/superpowers/specs/2026-09-12-courses-and-patterns-design.md` (status line)

- [ ] **Step 1: CLAUDE.md layout**

In `## Layout`, replace the bullets that name `src/data/...` with:
```
- `src/courses/index.js` — the course registry (`COURSES`, `courseById`, `DEFAULT_COURSE`, `RUNNERS`). One folder per course; the store reads all content through the active course. Components never import from `src/courses/`.
- `src/courses/algorithms/` — the algorithms course: `course.js` (the course object: id, title, algo, runner, three `stats`, arcs/gates, training, xp ladder, blurbs), `gates.js` (ALL gate content, the `ARCS` array), `index.js` (derived lists, XP per level, titles), `tests.js`, `training/` (one file per lesson, `tools/` the armoury).
- `src/training/` — the training engine shared by courses: `node.js` (step constructors), `progress.js` and `answers.js` (pure logic, unit-tested in `tests/`).
```
Update the `src/store.js` bullet: slot data is `{ player: { name }, course, courses: { <id>: block } }`, one block per course, upgraded from the old flat shape on read (`upgradeData` in `saves.js`); `CourseSelect.vue` is the Jobs screen, forced open on a fresh slot. Update the `check-gates` / `check-training` bullets to say they run over every course. In the training node schema and tool schema, change `scripts/solutions/training/<node-id>.py` to `scripts/solutions/<course>/training/<node-id>.py`.

- [ ] **Step 2: Spec status**

Change the spec's `Status:` line to `Status: plan 1 (course plumbing) implemented on branch courses-plumbing; plans 2–3 pending`.

- [ ] **Step 3: Full verification**

Run: `npm test && npm run check && npm run build`
Expected: all green.

Browser check on `npm run preview`:
- Old slot loads intact; new slot goes through Jobs; switching slots keeps each slot's course.
- Export a slot, import it in a private window: it lands in the game with the same course and progress.
- Network tab: the three.js chunk is still lazy-loaded only when a training step with a scene opens.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md docs/superpowers/specs/2026-09-12-courses-and-patterns-design.md
git commit -m "docs: courses layout in CLAUDE.md; spec status

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Then hand the branch to superpowers:finishing-a-development-branch.
