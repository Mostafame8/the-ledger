# Training Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second mode to The Ledger where Marguerite teaches each algorithm technique through interactive lessons (explain, trace, spot, fill-the-blank, mini problem) organised as a prerequisite skill tree with its own XP and rank.

**Architecture:** Lesson content is data: one JS module per technique node under `src/data/training/`, each an ordered list of typed steps. Pure progression logic (rank, unlock, answer comparison) lives in small tested modules. The Vue store gains a `training` slice persisted in the existing localStorage save. New presentation components render the tree and one step at a time; code drills reuse the existing Pyodide runner and `check()` harness.

**Tech Stack:** Vue 3 (script setup), Vite 5, plain CSS in `src/style.css`, Pyodide in a worker (existing), Node 24 built-in test runner (`node --test`) for pure logic, Python 3 locally for reference-solution proofs.

**Spec:** `docs/superpowers/specs/2026-09-08-training-room-design.md`

## Global Constraints

- No new npm dependencies. `package.json` dependencies stay `vue` only; devDependencies stay `@vitejs/plugin-vue` and `vite`.
- No per-component CSS. All styling goes in `src/style.css`.
- Components are presentation only; state and transitions live in `src/store.js`.
- Story voice per `CLAUDE.md`: Marguerite teaches, dry and precise; Dax proposes brute force; the fence supplies props. Technique names appear only in `algo`. Dialogue lines start with the curly quote `“`. No references to real anime, manga, or games.
- Training never affects gate unlocking, gate XP, or heist titles.
- Node ids lowercase kebab-case, unique. Node XP by tier: F 40–60, E 60–80, D 90–100.
- Every technique node has at least one `trace`, one `spot`, one `blank`, one `mini`. `method` has `explain` and `spot` only.
- Trace drills use authored frames. No live Python tracing.
- After any content change: `npm run check` and `npm test` must pass.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Line endings: write files with LF. Git warns about CRLF conversion; that warning is expected and harmless.

---

## File map

Create:
- `src/data/training/node.js` — `node()` and step constructors, `MOVES` list.
- `src/data/training/progress.js` — pure: `rankFor`, `rankProgress`, `isOpen`, `depthOf`.
- `src/data/training/answers.js` — pure: `pyLiteral`, `normalize`, `sameLiteral`.
- `src/data/training/index.js` — imports node files, exports `NODES`, `NODE_BY_ID`, `TIERS`.
- `src/data/training/method.js`, `two-pointers.js`, then one file per content node.
- `scripts/check-training.mjs` — content validator.
- `scripts/solutions/training/<node-id>.py` — reference solutions for `blank`/`mini` steps.
- `tests/training-progress.test.mjs`, `tests/training-answers.test.mjs` — node:test unit tests.
- `src/components/TestResults.vue` — shared test-result list (extracted from QuestWindow).
- `src/components/SkillTree.vue`, `LessonWindow.vue`, `StepExplain.vue`, `StepSpot.vue`, `StepTrace.vue`, `StepCode.vue`.

Modify:
- `package.json` — scripts `check`, `test`.
- `scripts/test-solutions.mjs` — also prove training drills.
- `src/store.js` — mode, training slice, lesson navigation, step test runner, flash text.
- `src/App.vue` — mode switch, flash text.
- `src/components/StatusWindow.vue` — mode toggle, training view.
- `src/components/QuestWindow.vue` — use `TestResults`.
- `src/style.css` — tree, lesson, step styles.
- `CLAUDE.md` — training layout, node schema, content rules.

---

### Task 1: Pure training logic with unit tests

**Files:**
- Create: `src/data/training/node.js`
- Create: `src/data/training/progress.js`
- Create: `src/data/training/answers.js`
- Create: `tests/training-progress.test.mjs`
- Create: `tests/training-answers.test.mjs`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces `node(id, fields)`, `explain(lines, opts)`, `trace(code, input, frames)`, `spot(problem, options, answer, why)`, `blank(intro, template, tests)`, `mini(mission, hint, tests)`, `MOVES`.
- Produces `rankFor(xp, nodes) -> 'F'|'E'|...`, `rankProgress(xp, nodes) -> { rank, floor, ceil }` where `ceil` is `null` at top rank, `isOpen(node, nodeStates) -> boolean` where `nodeStates` is `{ [id]: { step, cleared } }`, `depthOf(node, byId) -> number`.
- Produces `pyLiteral(value) -> string`, `normalize(text) -> string`, `sameLiteral(typed, expected) -> boolean`. Authored state values may be JS values (`true`, `null`, numbers, strings, arrays, plain objects) or `{ py: '(1, 3)' }` for a raw Python literal.

- [ ] **Step 1: Write failing tests for progress logic**

Create `tests/training-progress.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rankFor, rankProgress, isOpen, depthOf } from '../src/data/training/progress.js'

const N = (id, tier, xp, requires = []) => ({ id, tier, xp, requires, gates: [], steps: [] })
const nodes = [
  N('method', 'F', 40), N('two-pointers', 'F', 60, ['method']),
  N('stacks', 'E', 70, ['two-pointers']), N('window', 'D', 90, ['stacks']),
]
const byId = Object.fromEntries(nodes.map(n => [n.id, n]))

test('rankFor: rank is the highest populated tier whose lower tiers are fully paid for', () => {
  assert.equal(rankFor(0, nodes), 'F')
  assert.equal(rankFor(99, nodes), 'F')
  assert.equal(rankFor(100, nodes), 'E')      // F total is 40 + 60
  assert.equal(rankFor(169, nodes), 'E')
  assert.equal(rankFor(170, nodes), 'D')      // F + E = 170
  assert.equal(rankFor(9999, nodes), 'D')     // no C nodes exist, so D is the ceiling
})

test('rankProgress: floor and ceil bracket the current rank', () => {
  assert.deepEqual(rankProgress(50, nodes), { rank: 'F', floor: 0, ceil: 100 })
  assert.deepEqual(rankProgress(120, nodes), { rank: 'E', floor: 100, ceil: 170 })
  assert.deepEqual(rankProgress(260, nodes), { rank: 'D', floor: 170, ceil: null })
})

test('isOpen: roots are open, others need every prerequisite cleared', () => {
  const st = {}
  assert.equal(isOpen(byId.method, st), true)
  assert.equal(isOpen(byId['two-pointers'], st), false)
  st.method = { step: 3, cleared: true }
  assert.equal(isOpen(byId['two-pointers'], st), true)
  st['two-pointers'] = { step: 2, cleared: false }
  assert.equal(isOpen(byId.stacks, st), false)
})

test('depthOf: longest prerequisite chain', () => {
  assert.equal(depthOf(byId.method, byId), 0)
  assert.equal(depthOf(byId['two-pointers'], byId), 1)
  assert.equal(depthOf(byId.window, byId), 3)
})
```

- [ ] **Step 2: Write failing tests for answer comparison**

Create `tests/training-answers.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pyLiteral, normalize, sameLiteral } from '../src/data/training/answers.js'

test('pyLiteral renders JS values as Python source', () => {
  assert.equal(pyLiteral(3), '3')
  assert.equal(pyLiteral(-2.5), '-2.5')
  assert.equal(pyLiteral(true), 'True')
  assert.equal(pyLiteral(false), 'False')
  assert.equal(pyLiteral(null), 'None')
  assert.equal(pyLiteral('ab'), "'ab'")
  assert.equal(pyLiteral([1, 2, 'x']), "[1, 2, 'x']")
  assert.equal(pyLiteral({ a: 1, b: [2] }), "{'a': 1, 'b': [2]}")
  assert.equal(pyLiteral({ py: '(1, 3)' }), '(1, 3)')
})

test('normalize ignores whitespace and quote style', () => {
  assert.equal(normalize(' [1,  2 ] '), '[1,2]')
  assert.equal(normalize('"ab"'), "'ab'")
  assert.equal(normalize('( 1 , 3 )'), '(1,3)')
})

test('sameLiteral compares typed text to an authored value', () => {
  assert.equal(sameLiteral('4', 4), true)
  assert.equal(sameLiteral(' 4 ', 4), true)
  assert.equal(sameLiteral('5', 4), false)
  assert.equal(sameLiteral('true', true), false)   // Python spelling required
  assert.equal(sameLiteral('True', true), true)
  assert.equal(sameLiteral('[1,2]', [1, 2]), true)
  assert.equal(sameLiteral('"hi"', 'hi'), true)
  assert.equal(sameLiteral('(1,3)', { py: '(1, 3)' }), true)
  assert.equal(sameLiteral('', 0), false)
})
```

- [ ] **Step 3: Run tests, confirm they fail**

Run: `node --test tests/`
Expected: both files fail with `Cannot find module` for `progress.js` and `answers.js`.

- [ ] **Step 4: Write `node.js` helpers**

Create `src/data/training/node.js`:

```js
// Constructors for training content. One node per technique, each an ordered list of steps.
// See docs/superpowers/specs/2026-09-08-training-room-design.md for the schema.
export const MOVES = ['restate', 'examples', 'brute force', 'name the waste', 'pick the pattern', 'verify']

export const node = (id, fields) => ({ id, ...fields })

// explain(lines, { move?, code? })   read, then Next
export const explain = (lines, opts = {}) => ({ type: 'explain', lines, ...opts })
// trace(code, input, frames)         frames: [{ line, state, ask, note }]
export const trace = (code, input, frames) => ({ type: 'trace', code, input, frames })
// spot(problem, options, answer, why) answer is an index into options
export const spot = (problem, options, answer, why) => ({ type: 'spot', problem, options, answer, why })
// blank(intro, template, tests)      template contains ___ markers
export const blank = (intro, template, tests) => ({ type: 'blank', intro, template, tests })
// mini(mission, hint, tests)         full solution from scratch
export const mini = (mission, hint, tests) => ({ type: 'mini', mission, hint, tests })
```

- [ ] **Step 5: Write `progress.js`**

Create `src/data/training/progress.js`:

```js
// Pure progression rules for the training room. No Vue, no DOM, unit-tested in tests/.
export const TIERS = ['F', 'E', 'D', 'C', 'B', 'A', 'S']

// Sum of node xp per tier, only for tiers that have nodes, in TIERS order.
function tierTotals(nodes) {
  const totals = new Map()
  for (const n of nodes) totals.set(n.tier, (totals.get(n.tier) || 0) + n.xp)
  return TIERS.filter(t => totals.has(t)).map(t => [t, totals.get(t)])
}

// Ladder: [{ rank, floor }] where floor is the xp needed to hold that rank.
// Rank R is reached when xp >= total xp of every populated tier below R.
function ladder(nodes) {
  let acc = 0
  return tierTotals(nodes).map(([rank, total]) => { const step = { rank, floor: acc }; acc += total; return step })
}

export function rankFor(xp, nodes) {
  const steps = ladder(nodes)
  let rank = steps[0]?.rank ?? 'F'
  for (const s of steps) if (xp >= s.floor) rank = s.rank
  return rank
}

export function rankProgress(xp, nodes) {
  const steps = ladder(nodes)
  let i = 0
  for (let k = 0; k < steps.length; k++) if (xp >= steps[k].floor) i = k
  return { rank: steps[i]?.rank ?? 'F', floor: steps[i]?.floor ?? 0, ceil: steps[i + 1] ? steps[i + 1].floor : null }
}

export function isOpen(node, nodeStates) {
  return node.requires.every(id => nodeStates[id]?.cleared)
}

export function depthOf(node, byId, seen = new Set()) {
  if (!node.requires.length || seen.has(node.id)) return 0
  seen.add(node.id)
  return 1 + Math.max(...node.requires.map(id => depthOf(byId[id], byId, seen)))
}
```

- [ ] **Step 6: Write `answers.js`**

Create `src/data/training/answers.js`:

```js
// Turns authored JS values into Python literal text and compares learner input to them.
export function pyLiteral(v) {
  if (v && typeof v === 'object' && !Array.isArray(v) && 'py' in v) return v.py
  if (v === null || v === undefined) return 'None'
  if (v === true) return 'True'
  if (v === false) return 'False'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  if (Array.isArray(v)) return `[${v.map(pyLiteral).join(', ')}]`
  return `{${Object.entries(v).map(([k, x]) => `${pyLiteral(k)}: ${pyLiteral(x)}`).join(', ')}}`
}

// Whitespace never matters; single and double quotes are interchangeable.
export function normalize(text) {
  return String(text).replace(/\s+/g, '').replace(/"/g, "'")
}

export function sameLiteral(typed, expected) {
  const t = normalize(typed)
  return t.length > 0 && t === normalize(pyLiteral(expected))
}
```

- [ ] **Step 7: Add the unit test script**

In `package.json`, change the `scripts` block to:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "check": "node scripts/check-gates.mjs",
    "test": "node --test tests/ && node scripts/test-solutions.mjs"
  },
```

- [ ] **Step 8: Run tests, confirm they pass**

Run: `node --test tests/`
Expected: `# pass 7`, `# fail 0`.

Run: `npm test`
Expected: unit tests pass, then `✓ 78 gates, 562 checks, all reference solutions pass`.

- [ ] **Step 9: Commit**

```bash
git add src/data/training/node.js src/data/training/progress.js src/data/training/answers.js tests/ package.json
git commit -m "feat(training): node constructors, progression rules, answer comparison with unit tests

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: First two nodes, index, and the content validator

**Files:**
- Create: `src/data/training/method.js`
- Create: `src/data/training/two-pointers.js`
- Create: `src/data/training/index.js`
- Create: `scripts/check-training.mjs`
- Modify: `package.json` (check script)

**Interfaces:**
- Consumes constructors from `src/data/training/node.js`.
- Produces `NODES` (array in display order), `NODE_BY_ID`, `TIERS` from `src/data/training/index.js`.
- `check-training.mjs` exits 1 on any violation and is part of `npm run check`.

- [ ] **Step 1: Write the method node**

Create `src/data/training/method.js`:

```js
import { node, explain, spot } from './node.js'

export default node('method', {
  tier: 'F', xp: 40, requires: [], gates: [],
  title: 'The back room', algo: 'The six moves',
  steps: [
    explain([
      'A room above a laundromat. One table, two chairs, a whiteboard someone tried to wipe with coffee. Marguerite is already seated.',
      '“Gates are where you prove it. This is where you learn it. Same crew, no clock, nobody shooting.”',
      '“Every problem I hand you gets the same six moves. Learn the moves and the tricks stop looking like magic.”',
    ]),
    explain([
      '“Move one. Restate. Say the problem back to me in your own words, and name what comes in and what goes out.”',
      '“If you cannot say it, you cannot code it. Half the crew fails here and blames the keyboard.”',
    ], { move: 'restate' }),
    explain([
      '“Move two. Examples. Two small ones you can run in your head, then one ugly one: empty, single item, everything the same.”',
      'Dax: “I just start typing.”',
      '“And I just start finding someone else.”',
    ], { move: 'examples' }),
    explain([
      '“Move three. Brute force. Say the dumbest way that works and what it costs. Dax, you are good at this part.”',
      'Dax: “Check everything against everything.”',
      '“n squared. Sometimes that is fine. Usually it is the thing we are here to beat.”',
    ], { move: 'brute force' }),
    explain([
      '“Move four. Name the waste. Where does the dumb way look at the same thing twice, or recompute what it already knew?”',
      '“Every technique on that whiteboard exists to remove one specific kind of waste. Find the waste and the technique names itself.”',
    ], { move: 'name the waste' }),
    explain([
      '“Move five. Pick the pattern. Sorted input and a pair to find: two pointers. Repeated lookups: a dictionary. Most recent thing first: a stack.”',
      '“You will learn one pattern per lesson in this room. Each lesson ends with a gate it unlocks in your head.”',
    ], { move: 'pick the pattern' }),
    explain([
      '“Move six. Verify. Run your examples through the code by hand before you run them through a machine. The ugly example first.”',
      '“Then, and only then, you press the button.”',
    ], { move: 'verify' }),
    spot('Marguerite slides a problem across the table: a sorted list of badge numbers and a target sum. What is the first thing you do?',
      ['Start the loop', 'Say it back: sorted numbers in, two indices out, or nothing', 'Reach for two pointers', 'Write the tests'],
      1, 'Restate comes first, always. The pattern comes after you know what the waste is.'),
    spot('Dax says: check every pair, it is only n squared. Marguerite asks you to name the waste. What is it?',
      ['The list is too long', 'Once a pair is too big, every pair with a bigger right end is also too big, yet he checks them all', 'Python is slow', 'He forgot the empty list'],
      1, 'The sorted order tells you the answer for whole stretches of pairs at once. Brute force throws that away.'),
    spot('A string of brackets. Is every opener closed in the right order? Which pattern removes the waste of rescanning?',
      ['Two pointers', 'Binary search', 'A stack: the most recent opener is the one that must close next', 'A dictionary of counts'],
      2, 'Counting is not enough: “)(” has matching counts. What matters is the most recent unclosed opener, and a stack remembers exactly that.'),
  ],
})
```

- [ ] **Step 2: Write the two-pointers node**

Create `src/data/training/two-pointers.js`:

```js
import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('two-pointers', {
  tier: 'F', xp: 60, requires: ['method'], gates: ['palin', 'squares', 'rmdup', 'twoptr'],
  title: 'Two hands on the rope', algo: 'Two pointers',
  steps: [
    explain([
      'The fence sent a sorted list of serials and a number. Marguerite wants two serials that add up to it.',
      'Dax: “Check every pair. Done.”',
      '“Ten thousand serials. That is fifty million pairs. Sit down.”',
    ], { move: 'brute force' }),
    explain([
      '“The list is sorted. Put one hand on the smallest and one on the largest. Add them.”',
      '“Too big? The big hand moves left. Too small? The small hand moves right. Every move throws away a whole row of pairs we never have to check.”',
      '“Two hands, one pass. That is the whole trick, and you will use it in a dozen shapes.”',
    ], { move: 'name the waste', code:
`def pair_sum_sorted(nums, target):
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return (i, j)
        if s < target:
            i += 1
        else:
            j -= 1
    return None` }),
    trace(
`def pair_sum_sorted(nums, target):
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return (i, j)
        if s < target:
            i += 1
        else:
            j -= 1
    return None`,
      'pair_sum_sorted([1, 3, 4, 6, 9], 9)',
      [
        { line: 2, state: { i: 0, j: 4 }, ask: 'j', note: 'j starts on the last index, len(nums) - 1.' },
        { line: 4, state: { i: 0, j: 4, s: 10 }, ask: 's', note: 'nums[0] + nums[4] is 1 + 9.' },
        { line: 10, state: { i: 0, j: 3, s: 10 }, ask: 'j', note: '10 is more than 9, so the big hand moves left.' },
        { line: 4, state: { i: 0, j: 3, s: 7 }, ask: 's', note: 'nums[0] + nums[3] is 1 + 6.' },
        { line: 8, state: { i: 1, j: 3, s: 7 }, ask: 'i', note: '7 is less than 9, so the small hand moves right.' },
        { line: 6, state: { i: 1, j: 3, s: 9, returns: { py: '(1, 3)' } }, ask: 'returns', note: '3 + 6 is 9. Return the pair of indices.' },
      ]),
    spot('A sorted list of timestamps. Find whether any two are exactly one hour apart. Which pattern?',
      ['Two pointers walking inward or in step', 'A stack', 'Count every timestamp in a dictionary', 'Try every pair'],
      0, 'Sorted input plus a condition on a pair: two hands. Here both move the same direction, but it is the same idea.'),
    blank('“Finish it. A passphrase reads the same both ways or the fence does not answer. Letters only, already lowercase.”',
`def is_mirror(s):
    i, j = 0, len(s) - 1
    while ___:
        if s[i] != s[j]:
            return False
        ___
    return True`,
`check("is_mirror('abba')", True)
check("is_mirror('abcba')", True)
check("is_mirror('abca')", False)
check("is_mirror('')", True)
check("is_mirror('x')", True)
check("is_mirror('ab')", False)`),
    mini('Write reverse_in_place(nums) that reverses the list in place using two pointers and returns None. No slicing, no reversed(), no .reverse().',
      'One hand at each end. Swap, then both hands step inward until they meet.',
`check("reverse_in_place([1, 2, 3, 4])", lambda: inplace(reverse_in_place, [1, 2, 3, 4]), [4, 3, 2, 1])
check("reverse_in_place([1, 2, 3])", lambda: inplace(reverse_in_place, [1, 2, 3]), [3, 2, 1])
check("reverse_in_place([])", lambda: inplace(reverse_in_place, []), [])
check("reverse_in_place([7])", lambda: inplace(reverse_in_place, [7]), [7])
check("reverse_in_place returns None", lambda: reverse_in_place([1, 2]), None)`),
  ],
})
```

- [ ] **Step 3: Write the index**

Create `src/data/training/index.js`:

```js
// Training content in display order. Add a node file, import it, append it here.
import method from './method.js'
import twoPointers from './two-pointers.js'
export { TIERS } from './progress.js'

export const NODES = [method, twoPointers]
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
```

- [ ] **Step 4: Write the validator**

Create `scripts/check-training.mjs`:

```js
// Validates training content: schema, prerequisites, gate refs, step mix, trace and spot sanity.
import { NODES, NODE_BY_ID } from '../src/data/training/index.js'
import { GATES } from '../src/data/index.js'
import { MOVES } from '../src/data/training/node.js'

const XP = { F: [40, 60], E: [60, 80], D: [90, 100], C: [120, 140], B: [160, 180], A: [200, 240], S: [280, 400] }
const gateIds = new Set(GATES.map(g => g.id))
let errors = 0
const fail = m => { console.error('✗', m); errors++ }

const seen = new Set()
for (const n of NODES) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(n.id)) fail(`${n.id}: id must be lowercase kebab-case`)
  if (seen.has(n.id)) fail(`duplicate id ${n.id}`); seen.add(n.id)
  if (!XP[n.tier]) fail(`${n.id}: bad tier ${n.tier}`)
  else if (n.xp < XP[n.tier][0] || n.xp > XP[n.tier][1]) fail(`${n.id}: xp ${n.xp} outside ${XP[n.tier].join('–')} for tier ${n.tier}`)
  for (const f of ['title', 'algo']) if (!n[f]) fail(`${n.id}: missing ${f}`)
  if (!Array.isArray(n.requires)) fail(`${n.id}: requires must be an array`)
  else for (const r of n.requires) if (!NODE_BY_ID[r]) fail(`${n.id}: requires unknown node ${r}`)
  if (!Array.isArray(n.gates)) fail(`${n.id}: gates must be an array`)
  else for (const g of n.gates) if (!gateIds.has(g)) fail(`${n.id}: unknown gate ${g}`)
  if (n.id !== 'method' && !n.gates?.length) fail(`${n.id}: should list the gates it prepares`)

  const types = (n.steps || []).map(s => s.type)
  if (!types.length) fail(`${n.id}: no steps`)
  const need = n.id === 'method' ? ['explain', 'spot'] : ['trace', 'spot', 'blank', 'mini']
  for (const t of need) if (!types.includes(t)) fail(`${n.id}: needs at least one ${t} step`)
  if (n.id === 'method' && types.some(t => !['explain', 'spot'].includes(t))) fail(`method: explain and spot steps only`)

  n.steps?.forEach((s, i) => {
    const at = `${n.id}[${i}] ${s.type}`
    switch (s.type) {
      case 'explain':
        if (!Array.isArray(s.lines) || s.lines.length < 2 || s.lines.length > 5) fail(`${at}: 2–5 lines`)
        if (s.move && !MOVES.includes(s.move)) fail(`${at}: unknown move ${s.move}`)
        break
      case 'trace': {
        if (!s.code || !s.input) fail(`${at}: needs code and input`)
        const lineCount = (s.code || '').split('\n').length
        if (!Array.isArray(s.frames) || s.frames.length < 3) fail(`${at}: needs 3+ frames`)
        for (const [k, f] of (s.frames || []).entries()) {
          if (!(f.line >= 1 && f.line <= lineCount)) fail(`${at} frame ${k}: line ${f.line} outside code`)
          if (!f.state || !(f.ask in f.state)) fail(`${at} frame ${k}: ask '${f.ask}' not in state`)
          if (!f.note) fail(`${at} frame ${k}: missing note`)
        }
        break
      }
      case 'spot':
        if (!s.problem || !s.why) fail(`${at}: needs problem and why`)
        if (!Array.isArray(s.options) || s.options.length < 3 || s.options.length > 4) fail(`${at}: 3–4 options`)
        if (!(Number.isInteger(s.answer) && s.answer >= 0 && s.answer < (s.options || []).length)) fail(`${at}: answer out of range`)
        break
      case 'blank':
        if (!s.intro) fail(`${at}: missing intro`)
        if (!s.template?.includes('___')) fail(`${at}: template has no ___ marker`)
        if (!s.tests?.includes('check(')) fail(`${at}: tests never call check()`)
        break
      case 'mini':
        if (!s.mission || !s.hint) fail(`${at}: needs mission and hint`)
        if (!/\b[a-z_][a-z0-9_]*\(/.test(s.mission)) fail(`${at}: mission must name a function like foo(...)`)
        if (!s.tests?.includes('check(')) fail(`${at}: tests never call check()`)
        break
      default: fail(`${at}: unknown step type`)
    }
  })

  const spoken = (n.steps || []).some(s => s.type === 'explain' && s.lines?.some(l => l.startsWith('“')))
  if (!spoken) fail(`${n.id}: no spoken line in any explain step`)
}

// Prerequisites must form a DAG.
const state = {}
const visit = (id, path = []) => {
  if (state[id] === 'done') return
  if (state[id] === 'active') { fail(`prerequisite cycle: ${[...path, id].join(' -> ')}`); return }
  state[id] = 'active'
  for (const r of NODE_BY_ID[id]?.requires || []) visit(r, [...path, id])
  state[id] = 'done'
}
for (const n of NODES) visit(n.id)

console.log(errors ? `${errors} problem(s)` : `✓ ${NODES.length} training nodes look good`)
process.exit(errors ? 1 : 0)
```

- [ ] **Step 5: Wire into `npm run check`**

In `package.json`:

```json
    "check": "node scripts/check-gates.mjs && node scripts/check-training.mjs",
```

- [ ] **Step 6: Run the validator**

Run: `npm run check`
Expected: `✓ 78 gates across 5 arcs look good` then `✓ 2 training nodes look good`.

If a rule fires on the content above, fix the content, not the rule.

- [ ] **Step 7: Commit**

```bash
git add src/data/training/ scripts/check-training.mjs package.json
git commit -m "feat(training): method and two-pointers nodes, content index, validator

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Prove training drills against reference solutions

**Files:**
- Modify: `scripts/test-solutions.mjs`
- Create: `scripts/solutions/training/two-pointers.py`

**Interfaces:**
- Solution files under `scripts/solutions/training/` use block markers `# === <node-id>/<step-index>` where step-index is the 0-based position in `node.steps`.
- `npm test` fails if any `blank` or `mini` step has no reference block or its tests fail.

- [ ] **Step 1: Write the reference solutions**

Create `scripts/solutions/training/two-pointers.py`:

```python
# Reference solutions for training node two-pointers. Blocks: "# === <node-id>/<step-index>".

# === two-pointers/4
def is_mirror(s):
    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            return False
        i += 1
        j -= 1
    return True

# === two-pointers/5
def reverse_in_place(nums):
    i, j = 0, len(nums) - 1
    while i < j:
        nums[i], nums[j] = nums[j], nums[i]
        i += 1
        j -= 1
```

- [ ] **Step 2: Run `npm test`, confirm training is not yet covered**

Run: `node scripts/test-solutions.mjs`
Expected: `✓ 78 gates, 562 checks, all reference solutions pass` and no mention of training. This is the failing state: the drills are not proven.

- [ ] **Step 3: Extend the runner**

Replace `scripts/test-solutions.mjs` with:

```js
// Proves every gate's tests and every training drill's tests against reference solutions
// using the local Python.
//   node scripts/test-solutions.mjs                 everything
//   node scripts/test-solutions.mjs fizz lru        just those gate ids
//   node scripts/test-solutions.mjs two-pointers    just that training node
// Gate solutions: scripts/solutions/*.py, blocks "# === <gate id>".
// Training solutions: scripts/solutions/training/*.py, blocks "# === <node id>/<step index>".
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { GATES } from '../src/data/index.js'
import { NODES } from '../src/data/training/index.js'

const PYTHON = process.env.PYTHON || 'python'
const root = new URL('..', import.meta.url)
const harness = readFileSync(new URL('src/harness.py', root), 'utf8')

function loadSolutions(dirUrl) {
  const map = new Map()
  for (const f of readdirSync(dirUrl).filter(f => f.endsWith('.py'))) {
    const parts = readFileSync(new URL(f, dirUrl), 'utf8').split(/^# === (\S+)\s*$/m)
    for (let i = 1; i < parts.length; i += 2) {
      if (map.has(parts[i])) console.error(`✗ duplicate solution for ${parts[i]} in ${f}`)
      map.set(parts[i], parts[i + 1])
    }
  }
  return map
}
const gateSolutions = loadSolutions(new URL('scripts/solutions/', root))
const trainingSolutions = loadSolutions(new URL('scripts/solutions/training/', root))

const only = process.argv.slice(2)
const gates = only.length ? GATES.filter(g => only.includes(g.id)) : GATES
const nodes = only.length ? NODES.filter(n => only.includes(n.id)) : NODES
const tmp = mkdtempSync(join(tmpdir(), 'ledger-'))
let failures = 0, checks = 0, drills = 0

// Runs `tests` after `solution` and the harness; reports under `label`.
function prove(label, solution, tests) {
  const file = join(tmp, `${label.replace(/[^a-z0-9]+/gi, '_')}.py`)
  writeFileSync(file, `${solution}\n\n${harness}\n\n${tests}\n\nimport json as __json\nprint("@@RESULTS@@" + __json.dumps(__results))\n`)
  const r = spawnSync(PYTHON, ['-I', file], { encoding: 'utf8', timeout: 60_000 })
  const m = (r.stdout || '').match(/@@RESULTS@@(.*)/)
  if (!m) { console.error(`✗ ${label}: crashed\n${(r.stderr || r.stdout || '').trim().split('\n').slice(-6).join('\n')}`); failures++; return }
  const results = JSON.parse(m[1])
  if (!results.length) { console.error(`✗ ${label}: tests ran zero checks`); failures++; return }
  checks += results.length
  for (const t of results.filter(t => !t.ok)) { console.error(`✗ ${label}: ${t.label}\n    got  ${t.got}\n    want ${t.want}`); failures++ }
}

for (const g of gates) {
  if (!g.tests) { console.error(`✗ ${g.id}: no tests`); failures++; continue }
  const sol = gateSolutions.get(g.id)
  if (!sol) { console.error(`✗ ${g.id}: no reference solution`); failures++; continue }
  prove(g.id, sol, g.tests)
}

for (const n of nodes) {
  n.steps.forEach((s, i) => {
    if (!s.tests) return
    drills++
    const key = `${n.id}/${i}`
    const sol = trainingSolutions.get(key)
    if (!sol) { console.error(`✗ training ${key}: no reference solution in scripts/solutions/training/`); failures++; return }
    prove(`training ${key}`, sol, s.tests)
  })
}

rmSync(tmp, { recursive: true, force: true })
console.log(failures ? `${failures} problem(s)` : `✓ ${gates.length} gates, ${drills} training drills, ${checks} checks, all reference solutions pass`)
process.exit(failures ? 1 : 0)
```

- [ ] **Step 4: Run, confirm the drills are proven**

Run: `node scripts/test-solutions.mjs`
Expected: `✓ 78 gates, 2 training drills, 573 checks, all reference solutions pass`.

Run: `node scripts/test-solutions.mjs two-pointers`
Expected: `✓ 0 gates, 2 training drills, 11 checks, all reference solutions pass`.

- [ ] **Step 5: Commit**

```bash
git add scripts/test-solutions.mjs scripts/solutions/training/
git commit -m "test(training): prove blank and mini drills against reference solutions

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Store: mode, training slice, lesson navigation

**Files:**
- Modify: `src/store.js`
- Modify: `src/App.vue` (flash text only)

**Interfaces:**
- Produces on `useStore()`: `mode` (ref `'heist'|'training'`), `setMode(m)`, `training` (ref), `trainingXp`, `trainingRank`, `trainingProgress` (`{ rank, floor, ceil }`), `nodesCleared`, `nodeState(id) -> 'locked'|'open'|'cleared'`, `activeNode`, `stepIndex`, `activeStep`, `satisfied` (ref boolean), `openNode(id)`, `closeNode()`, `answer(ok)`, `next()`, `back()`, `stepCode` (writable computed string), `stepRun` (ref, same shape as `run`), `runStepTests()`.
- Changes `flash` from boolean to `string | null` holding the text to display.
- Save shape becomes `{ player, cleared, notes, tab, mode, training: { xp, nodes: { [id]: { step, cleared } }, active, code: { ['node/idx']: string } } }`.

- [ ] **Step 1: Add imports and training state**

In `src/store.js`, after the existing import lines add:

```js
import { NODES, NODE_BY_ID } from './data/training/index.js'
import { rankFor, rankProgress, isOpen } from './data/training/progress.js'
```

Replace `const flash = ref(false)` with the line below and add the slice right after it:

```js
const flash = ref(null)   // text to show in the level-up overlay, or null

// ── Training room ────────────────────────────────────────────────────────────────
const freshTraining = () => ({ xp: 0, nodes: {}, active: null, code: {} })
const mode = ref(saved.mode === 'training' ? 'training' : 'heist')
const training = ref({ ...freshTraining(), ...(saved.training || {}) })
const setMode = m => { mode.value = m === 'training' ? 'training' : 'heist' }

const trainingXp = computed(() => training.value.xp)
const trainingRank = computed(() => rankFor(training.value.xp, NODES))
const trainingProgress = computed(() => rankProgress(training.value.xp, NODES))
const nodesCleared = computed(() => NODES.filter(n => training.value.nodes[n.id]?.cleared).length)
const nodeState = id => training.value.nodes[id]?.cleared ? 'cleared' : isOpen(NODE_BY_ID[id], training.value.nodes) ? 'open' : 'locked'

const activeNode = computed(() => training.value.active ? NODE_BY_ID[training.value.active] ?? null : null)
const stepIndex = computed(() => activeNode.value ? training.value.nodes[activeNode.value.id]?.step ?? 0 : 0)
const activeStep = computed(() => activeNode.value ? activeNode.value.steps[stepIndex.value] : null)
const satisfied = ref(false)       // current step answered correctly (or needs no answer)
const stepRun = ref(null)          // last test run for a code step, same shape as `run`

function enterStep() {
  const st = activeStep.value
  const cleared = !!(activeNode.value && training.value.nodes[activeNode.value.id]?.cleared)
  satisfied.value = !st || st.type === 'explain' || cleared
  stepRun.value = null
}
function openNode(id) {
  if (!NODE_BY_ID[id] || nodeState(id) === 'locked') return
  const rec = (training.value.nodes[id] ||= { step: 0, cleared: false })
  if (rec.cleared) rec.step = 0            // review from the top
  training.value.active = id
  enterStep()
  if (NODE_BY_ID[id].steps.some(st => st.tests)) warm()
}
function closeNode() { training.value.active = null }
function answer(ok) { if (ok) satisfied.value = true }
function next() {
  const n = activeNode.value
  if (!n || !satisfied.value) return
  const rec = training.value.nodes[n.id]
  if (rec.step + 1 >= n.steps.length) { finishNode(n); return }
  rec.step += 1
  enterStep()
}
function back() {
  const n = activeNode.value
  const rec = n && training.value.nodes[n.id]
  if (!rec || rec.step === 0) return
  rec.step -= 1
  enterStep()
}
function finishNode(n) {
  const rec = training.value.nodes[n.id]
  if (!rec.cleared) {
    rec.cleared = true
    const before = trainingRank.value
    training.value.xp += n.xp
    showFlash(trainingRank.value !== before ? `Rank ${trainingRank.value}` : `${n.algo}: learned`)
  }
  training.value.active = null
}

const codeKey = () => `${activeNode.value.id}/${stepIndex.value}`
const stepCode = computed({
  get: () => {
    const st = activeStep.value
    if (!st) return ''
    return training.value.code[codeKey()] ?? (st.type === 'blank' ? st.template : '')
  },
  set: v => { if (activeNode.value) training.value.code[codeKey()] = v },
})
async function runStepTests() {
  const st = activeStep.value
  if (!st?.tests || stepRun.value?.status === 'running') return
  const key = codeKey()
  stepRun.value = { status: 'running' }
  const r = await runTests(stepCode.value, st.tests)
  if (!activeNode.value || codeKey() !== key) return   // learner moved on; drop the stale result
  const passed = !r.error && r.results.length > 0 && r.results.every(t => t.ok)
  stepRun.value = { status: 'done', passed, ...r }
  if (passed) answer(true)
}

function showFlash(text) { flash.value = text; setTimeout(() => { flash.value = null }, 1900) }
```

- [ ] **Step 2: Use `showFlash` in `clear()` and reset training in `reset()`**

In `clear(g)` replace the line starting `if (level.value > before)` with:

```js
  if (level.value > before) showFlash(`Level ${level.value}`)
```

Replace `reset()`:

```js
function reset() {
  if (!confirm('Wipe the save and start the heist over?')) return
  player.value = fresh(); cleared.value = []; notes.value = {}; active.value = null; tab.value = 0
  training.value = freshTraining(); mode.value = 'heist'
}
```

- [ ] **Step 3: Persist and export**

Replace the `watch(...)` line and the keydown listener:

```js
watch([player, cleared, notes, tab, mode, training], () => save({
  player: player.value, cleared: cleared.value, notes: notes.value, tab: tab.value,
  mode: mode.value, training: training.value,
}), { deep: true })
window.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); closeNode() } })
```

Replace the `useStore` return:

```js
export function useStore() {
  return { player, cleared, notes, active, flash, gate, level, xpInLevel, xpPct, xpPerLevel: XP_PER_LEVEL,
    clearedCount, title, statList, isDone, isLocked, arcOpen, arcProgress, tab, setTab, open, close, clear, reset,
    run, runtime, test,
    mode, setMode, training, trainingXp, trainingRank, trainingProgress, nodesCleared, nodeState,
    activeNode, stepIndex, activeStep, satisfied, openNode, closeNode, answer, next, back,
    stepCode, stepRun, runStepTests }
}
```

- [ ] **Step 4: Fix the flash in App.vue so the build stays green**

In `src/App.vue` replace the flash line with:

```html
    <div v-if="s.flash.value" class="levelup"><div>{{ s.flash.value }}</div></div>
```

- [ ] **Step 5: Build and smoke-test heist mode**

Run: `npm run build`
Expected: `✓ built`.

Run `npm run dev`, open the site, open a gate, run tests. Confirm the quest window still works and a level-up still shows text. Reload: progress persists. In the browser console run:

```js
JSON.parse(localStorage.getItem('ledger-save-v2')).training
```
Expected: `{ xp: 0, nodes: {}, active: null, code: {} }`.

- [ ] **Step 6: Commit**

```bash
git add src/store.js src/App.vue
git commit -m "feat(training): store slice for mode, node progress, lesson navigation

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Extract `TestResults.vue` from QuestWindow

**Files:**
- Create: `src/components/TestResults.vue`
- Modify: `src/components/QuestWindow.vue`

**Interfaces:**
- Produces `<TestResults :run="..." success="..." />` where `run` is `{ status: 'done', passed, results, stdout, error }` and `success` is the headline shown when all checks pass.

- [ ] **Step 1: Create the component**

Create `src/components/TestResults.vue`:

```vue
<script setup>
defineProps({ run: { type: Object, required: true }, success: { type: String, default: 'Every check passed.' } })
</script>

<template>
  <div class="tests" aria-live="polite">
    <div class="tests-head" :class="{ ok: run.passed }">
      {{ run.passed ? success
        : run.error && !run.results.length ? 'Your code did not run.'
        : `${run.results.filter(t => !t.ok).length} of ${run.results.length} checks failed.` }}
    </div>
    <pre v-if="run.error" class="err">{{ run.error }}</pre>
    <div v-for="(t, i) in run.results" :key="i" class="t" :class="t.ok ? 'ok' : 'bad'">
      <b>{{ t.ok ? '✓' : '✗' }}</b>
      <div>
        <code>{{ t.label }}</code>
        <div v-if="!t.ok" class="diff"><span>got</span><code>{{ t.got }}</code><span>want</span><code>{{ t.want }}</code></div>
      </div>
    </div>
    <details v-if="run.stdout"><summary>Printed output</summary><pre>{{ run.stdout }}</pre></details>
  </div>
</template>
```

- [ ] **Step 2: Use it in QuestWindow**

In `src/components/QuestWindow.vue` add to the script block:

```js
import TestResults from './TestResults.vue'
```

Replace the whole `<div v-if="s.run.value?.status === 'done'" class="tests" aria-live="polite"> … </div>` block (opening tag through its matching `</div>`, the one immediately before the closing `</div>` of `.body`) with:

```html
        <TestResults v-if="s.run.value?.status === 'done'" :run="s.run.value" success="Every check passed. Gate cleared." />
```

- [ ] **Step 3: Verify no visual change**

Run `npm run dev`, open a gate with tests, run failing then passing code. Result list, got/want diff, and printed-output details render as before.

- [ ] **Step 4: Commit**

```bash
git add src/components/TestResults.vue src/components/QuestWindow.vue
git commit -m "refactor: extract TestResults from QuestWindow

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Mode toggle, training status, skill tree

**Files:**
- Create: `src/components/SkillTree.vue`
- Modify: `src/components/StatusWindow.vue`
- Modify: `src/App.vue`
- Modify: `src/style.css`

**Interfaces:**
- Consumes store: `mode`, `setMode`, `trainingRank`, `trainingProgress`, `trainingXp`, `nodesCleared`, `nodeState`, `openNode`, `training`.
- Consumes `NODES`, `NODE_BY_ID` and `depthOf`.

- [ ] **Step 1: StatusWindow gets the toggle and a training view**

Replace `src/components/StatusWindow.vue` with:

```vue
<script setup>
import { computed } from 'vue'
import { NODES } from '../data/training/index.js'
import { useStore } from '../store.js'
const s = useStore()
const rankPct = computed(() => {
  const p = s.trainingProgress.value
  if (p.ceil === null) return 100
  return Math.round((s.trainingXp.value - p.floor) / (p.ceil - p.floor) * 100)
})
</script>

<template>
  <aside class="sys status">
    <div class="sys-title"><i></i> Status window</div>
    <div class="body">
      <nav class="mode" role="tablist" aria-label="Mode">
        <button role="tab" :class="{ active: s.mode.value === 'heist' }" :aria-selected="s.mode.value === 'heist'" @click="s.setMode('heist')">Heist</button>
        <button role="tab" :class="{ active: s.mode.value === 'training' }" :aria-selected="s.mode.value === 'training'" @click="s.setMode('training')">Training</button>
      </nav>
      <div class="name">{{ s.player.value.name }}</div>

      <template v-if="s.mode.value === 'heist'">
        <div class="role">{{ s.level.value === 0 ? 'Unranked. Nobody knows your name yet.' : "Marguerite's crew" }}</div>
        <div class="lvl"><b>{{ s.level.value }}</b><small>level</small></div>
        <div class="bar" role="progressbar" :aria-valuenow="s.xpInLevel.value" :aria-valuemax="s.xpPerLevel">
          <i :style="{ width: s.xpPct.value + '%' }"></i>
        </div>
        <div class="xp"><span>{{ s.xpInLevel.value }} / {{ s.xpPerLevel }} xp</span><span>{{ s.player.value.xp }} total</span></div>
        <div class="stats">
          <div class="stat" v-for="st in s.statList.value" :key="st.key">
            <span>{{ st.label }}</span>
            <div class="bar"><i :style="{ width: Math.min(100, st.value * 4) + '%' }"></i></div>
            <span>{{ st.value }}</span>
          </div>
        </div>
        <div class="titles">Title: <b>{{ s.title.value }}</b><br>Gates cleared: <b>{{ s.clearedCount.value }}</b></div>
      </template>

      <template v-else>
        <div class="role">The back room above the laundromat.</div>
        <div class="lvl"><b class="rank-letter" :class="s.trainingRank.value">{{ s.trainingRank.value }}</b><small>training rank</small></div>
        <div class="bar" role="progressbar" :aria-valuenow="rankPct" aria-valuemax="100">
          <i :style="{ width: rankPct + '%' }"></i>
        </div>
        <div class="xp">
          <span v-if="s.trainingProgress.value.ceil !== null">{{ s.trainingXp.value - s.trainingProgress.value.floor }} / {{ s.trainingProgress.value.ceil - s.trainingProgress.value.floor }} xp to next rank</span>
          <span v-else>Top of the ladder for now</span>
          <span>{{ s.trainingXp.value }} total</span>
        </div>
        <div class="titles">Lessons trained: <b>{{ s.nodesCleared.value }} / {{ NODES.length }}</b></div>
      </template>

      <button class="reset" @click="s.reset">Wipe save</button>
    </div>
  </aside>
</template>
```

- [ ] **Step 2: SkillTree component**

Create `src/components/SkillTree.vue`:

```vue
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { NODES, NODE_BY_ID } from '../data/training/index.js'
import { depthOf } from '../data/training/progress.js'
import { useStore } from '../store.js'
const s = useStore()

// Columns per populated tier; within a column, shallow prerequisites first (stable sort keeps file order).
const columns = computed(() => {
  const tiers = [...new Set(NODES.map(n => n.tier))]
  return tiers.map(tier => ({ tier, nodes: NODES.filter(n => n.tier === tier).sort((a, b) => depthOf(a, NODE_BY_ID) - depthOf(b, NODE_BY_ID)) }))
})
const needs = n => n.requires.map(id => NODE_BY_ID[id].title).join(', ')
const label = n => ({ cleared: 'trained', locked: 'sealed', open: '+' + n.xp + ' xp' })[s.nodeState(n.id)]

// Prerequisite lines: measured from the rendered cards, redrawn on resize.
const root = ref(null)
const cards = new Map()
const setCard = (id, el) => { if (el) cards.set(id, el); else cards.delete(id) }
const links = ref([])
function measure() {
  if (!root.value) return
  const box = root.value.getBoundingClientRect()
  const out = []
  for (const n of NODES) for (const r of n.requires) {
    const a = cards.get(r)?.getBoundingClientRect(), b = cards.get(n.id)?.getBoundingClientRect()
    if (!a || !b) continue
    out.push({ x1: a.right - box.left, y1: a.top + a.height / 2 - box.top, x2: b.left - box.left, y2: b.top + b.height / 2 - box.top })
  }
  links.value = out
}
let ro = null
onMounted(() => { measure(); ro = new ResizeObserver(measure); ro.observe(root.value) })
onBeforeUnmount(() => ro?.disconnect())
watch(() => s.training.value.nodes, () => nextTick(measure), { deep: true })
</script>

<template>
  <main class="sys tree">
    <div class="sys-title"><i></i> Training room</div>
    <div class="body tree-body" ref="root">
      <svg class="links" aria-hidden="true">
        <line v-for="(l, i) in links" :key="i" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" />
      </svg>
      <section v-for="col in columns" :key="col.tier" class="tier">
        <div class="tier-head"><span class="rank" :class="col.tier">{{ col.tier }}</span><small>{{ col.nodes.length }} lessons</small></div>
        <button v-for="n in col.nodes" :key="n.id" class="node" :class="s.nodeState(n.id)"
          :ref="el => setCard(n.id, el)" :disabled="s.nodeState(n.id) === 'locked'"
          :title="s.nodeState(n.id) === 'locked' ? 'Needs: ' + needs(n) : ''" @click="s.openNode(n.id)">
          <h3>{{ n.title }}</h3>
          <p>{{ n.algo }}</p>
          <small>{{ n.gates.length ? 'used in ' + n.gates.length + ' gate' + (n.gates.length === 1 ? '' : 's') : 'used in every gate' }}</small>
          <span class="tag" :class="{ done: s.nodeState(n.id) === 'cleared', locked: s.nodeState(n.id) === 'locked' }">{{ label(n) }}</span>
        </button>
      </section>
    </div>
  </main>
</template>
```

- [ ] **Step 3: App switches by mode**

Replace `src/App.vue` with:

```vue
<script setup>
import { ARCS, GATES } from './data/index.js'
import { NODES } from './data/training/index.js'
import { useStore } from './store.js'
import StatusWindow from './components/StatusWindow.vue'
import GateList from './components/GateList.vue'
import QuestWindow from './components/QuestWindow.vue'
import SkillTree from './components/SkillTree.vue'
const s = useStore()
</script>

<template>
  <div class="wrap">
    <header class="top">
      <h1>The <span>Ledger</span></h1>
      <p v-if="s.mode.value === 'heist'">A heist in {{ ARCS.length }} arcs and {{ GATES.length }} gates. Every gate needs a trick. Every trick is an algorithm.</p>
      <p v-else>{{ NODES.length }} lessons in a back room. Marguerite teaches the trick before the gate demands it.</p>
    </header>
    <StatusWindow />
    <template v-if="s.mode.value === 'heist'">
      <GateList />
      <QuestWindow v-if="s.gate.value" />
    </template>
    <template v-else>
      <SkillTree />
    </template>
    <div v-if="s.flash.value" class="levelup"><div>{{ s.flash.value }}</div></div>
  </div>
</template>
```

- [ ] **Step 4: Styles**

Append to `src/style.css`:

```css

  /* ── Mode toggle & training status ─────────────────────────────────────── */
  .mode{display:grid;grid-template-columns:1fr 1fr;margin:-4px -4px 14px;border:1px solid var(--faint)}
  .mode button{background:none;border:0;padding:8px;color:var(--dim);font:inherit;font-weight:600;letter-spacing:.06em;cursor:pointer}
  .mode button+button{border-left:1px solid var(--faint)}
  .mode button.active{color:var(--glow);background:rgba(63,169,255,.12);text-shadow:0 0 10px rgba(127,212,255,.5)}
  .mode button:focus-visible{outline:2px solid var(--glow);outline-offset:-2px}
  .rank-letter.F{color:#6f8db0}.rank-letter.E{color:#8fb3d9}.rank-letter.D{color:#5ec2ff}.rank-letter.C{color:#3fa9ff}
  .rank-letter.B{color:#9d7bff}.rank-letter.A{color:#c56bff}.rank-letter.S{color:#ffb454}

  /* ── Skill tree ────────────────────────────────────────────────────────── */
  .tree-body{position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:22px;padding:18px}
  .links{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
  .links line{stroke:rgba(63,169,255,.35);stroke-width:1.5;stroke-dasharray:4 3}
  .tier{display:grid;gap:10px;align-content:start;position:relative;z-index:1}
  .tier-head{display:flex;align-items:center;gap:10px;color:var(--dim);font-size:14px;margin-bottom:4px}
  .tier-head .rank{width:36px;height:36px;font-size:17px}
  .node{display:grid;gap:2px;text-align:left;padding:12px 14px;background:rgba(5,10,22,.5);border:1px solid rgba(63,169,255,.3);
    color:inherit;font:inherit;cursor:pointer;position:relative}
  .node h3{margin:0;font-size:18px;font-weight:600}
  .node p{margin:0;color:var(--dim);font-size:15px}
  .node small{color:var(--faint);font-size:13px}
  .node .tag{position:absolute;top:10px;right:12px}
  .node:hover:not(:disabled){background:rgba(63,169,255,.1);border-color:var(--edge)}
  .node:focus-visible{outline:2px solid var(--glow);outline-offset:2px}
  .node.open{border-color:rgba(63,169,255,.6);box-shadow:0 0 14px rgba(63,169,255,.15)}
  .node.cleared{border-color:rgba(94,240,176,.45)}
  .node.cleared h3{color:var(--ok)}
  .node:disabled{cursor:not-allowed;opacity:.45}
```

- [ ] **Step 5: Verify in the browser**

Run `npm run dev`. Click Training in the status window. Expected: header text changes, status shows rank F with `0 / 40 xp to next rank` and `Lessons trained: 0 / 2`, tree shows one F column with two cards. "The back room" is open with `+40 xp`; "Two hands on the rope" is disabled with `sealed` and tooltip `Needs: The back room`. A dashed line joins the two cards. Resize the window: the line follows. Click Heist: original screen returns. Reload: mode persists.

Clicking "The back room" opens nothing yet (LessonWindow comes in Task 7); the console shows no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/StatusWindow.vue src/components/SkillTree.vue src/App.vue src/style.css
git commit -m "feat(training): mode toggle, training status, skill tree with prerequisite links

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: LessonWindow with explain and spot steps

**Files:**
- Create: `src/components/LessonWindow.vue`
- Create: `src/components/StepExplain.vue`
- Create: `src/components/StepSpot.vue`
- Modify: `src/App.vue`
- Modify: `src/style.css`

**Interfaces:**
- Step components take `step` (Object) and call `s.answer(true)` when satisfied.
- `LessonWindow` maps `step.type` to a component via `STEP_COMPONENTS`; Tasks 8 and 9 add `trace` and `blank`/`mini` entries.

- [ ] **Step 1: StepExplain**

Create `src/components/StepExplain.vue`:

```vue
<script setup>
defineProps({ step: { type: Object, required: true } })
</script>

<template>
  <div class="story">
    <p v-for="(line, k) in step.lines" :key="k" :class="{ voice: line.startsWith('“') }">{{ line }}</p>
  </div>
  <pre v-if="step.code">{{ step.code }}</pre>
</template>
```

- [ ] **Step 2: StepSpot**

Create `src/components/StepSpot.vue`:

```vue
<script setup>
import { ref } from 'vue'
import { useStore } from '../store.js'
const props = defineProps({ step: { type: Object, required: true } })
const s = useStore()
const picked = ref(s.satisfied.value ? props.step.answer : null)
const right = () => picked.value === props.step.answer
const pick = i => { picked.value = i; if (i === props.step.answer) s.answer(true) }
</script>

<template>
  <div class="mission">
    <h4>Spot the pattern</h4>
    <p>{{ step.problem }}</p>
  </div>
  <div class="opts">
    <button v-for="(o, i) in step.options" :key="i" class="opt"
      :class="{ right: picked === i && right(), wrong: picked === i && !right() }"
      :disabled="right()" @click="pick(i)">{{ o }}</button>
  </div>
  <p v-if="picked !== null" class="why" :class="{ ok: right() }">{{ right() ? '✓ ' : '✗ Not that one. ' }}{{ step.why }}</p>
</template>
```

- [ ] **Step 3: LessonWindow**

Create `src/components/LessonWindow.vue`:

```vue
<script setup>
import { computed } from 'vue'
import { useStore } from '../store.js'
import StepExplain from './StepExplain.vue'
import StepSpot from './StepSpot.vue'
const s = useStore()
const STEP_COMPONENTS = { explain: StepExplain, spot: StepSpot }
const comp = computed(() => STEP_COMPONENTS[s.activeStep.value?.type] ?? null)
const last = computed(() => s.stepIndex.value === s.activeNode.value.steps.length - 1)
const kicker = { explain: 'Marguerite explains', trace: 'Trace it by hand', spot: 'Spot the pattern', blank: 'Fill the blanks', mini: 'Mini mission' }
</script>

<template>
  <div class="veil" @click.self="s.closeNode">
    <section class="sys quest lesson" role="dialog" aria-modal="true">
      <div class="sys-title"><i></i> Training room</div>
      <div class="body">
        <h2>{{ s.activeNode.value.title }}</h2>
        <div class="algo">
          {{ s.activeNode.value.algo }} · {{ kicker[s.activeStep.value.type] }} · step {{ s.stepIndex.value + 1 }} of {{ s.activeNode.value.steps.length }}
          <span v-if="s.activeStep.value.move" class="move">move: {{ s.activeStep.value.move }}</span>
        </div>
        <div class="dots" aria-hidden="true">
          <i v-for="(st, i) in s.activeNode.value.steps" :key="i" :class="{ done: i < s.stepIndex.value, now: i === s.stepIndex.value }"></i>
        </div>
        <component v-if="comp" :is="comp" :key="s.activeNode.value.id + '/' + s.stepIndex.value" :step="s.activeStep.value" />
        <p v-else class="dim">This step type is not built yet.</p>
        <div class="row">
          <button class="btn ghost" :disabled="s.stepIndex.value === 0" @click="s.back">Back</button>
          <button class="btn" :disabled="!s.satisfied.value" @click="s.next">{{ last ? 'Finish lesson' : 'Next' }}</button>
          <button class="btn ghost" @click="s.closeNode">Close</button>
          <span v-if="!s.satisfied.value" class="dim">Answer to continue.</span>
        </div>
      </div>
    </section>
  </div>
</template>
```

- [ ] **Step 4: Mount it in App**

In `src/App.vue` add the import:

```js
import LessonWindow from './components/LessonWindow.vue'
```

and change the training branch of the template to:

```html
    <template v-else>
      <SkillTree />
      <LessonWindow v-if="s.activeNode.value" />
    </template>
```

- [ ] **Step 5: Styles**

Append to `src/style.css`:

```css

  /* ── Lesson window ─────────────────────────────────────────────────────── */
  .lesson .move{margin-left:8px;padding:1px 8px;border:1px solid var(--violet);color:#c9b8ff;font-size:13px;letter-spacing:.04em}
  .dots{display:flex;gap:6px}
  .dots i{width:14px;height:4px;background:var(--faint)}
  .dots i.done{background:var(--ok)}
  .dots i.now{background:var(--glow);box-shadow:0 0 8px var(--glow)}
  .opts{display:grid;gap:8px}
  .opt{text-align:left;padding:10px 14px;background:rgba(5,10,22,.5);border:1px solid var(--faint);color:var(--ink);font:inherit;cursor:pointer}
  .opt:hover:not(:disabled){border-color:var(--edge);background:rgba(63,169,255,.08)}
  .opt:focus-visible{outline:2px solid var(--glow);outline-offset:2px}
  .opt.right{border-color:var(--ok);color:var(--ok)}
  .opt.wrong{border-color:#ff8a8a;color:#ff8a8a}
  .opt:disabled{cursor:default}
  .why{margin:0;color:#ff8a8a}
  .why.ok{color:var(--ok)}
```

- [ ] **Step 6: Verify in the browser**

Run `npm run dev`, Training mode, click "The back room". Expected: lesson opens at step 1 of 10, kicker "Marguerite explains", dialogue lines styled as voice, Next enabled. Click Next through the explains; the move tag shows on steps 2–7. Step 8 is a spot: Next disabled with "Answer to continue."; a wrong option turns red and shows "✗ Not that one." plus the why; the right option turns green and enables Next. Finish lesson on step 10: overlay flashes `The six moves: learned`, tree shows "The back room" as `trained` and "Two hands on the rope" now open. Status shows `40 total` and `Lessons trained: 1 / 2`. Reload mid-lesson on a spot step: same step reopens with Next disabled. Reopen the cleared node: starts at step 1, every step's Next enabled, spot shows the right answer pre-selected.

- [ ] **Step 7: Commit**

```bash
git add src/components/LessonWindow.vue src/components/StepExplain.vue src/components/StepSpot.vue src/App.vue src/style.css
git commit -m "feat(training): lesson window with explain and spot steps

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Trace step

**Files:**
- Create: `src/components/StepTrace.vue`
- Modify: `src/components/LessonWindow.vue`
- Modify: `src/style.css`

**Interfaces:**
- Consumes `pyLiteral`, `sameLiteral` from `src/data/training/answers.js`.

- [ ] **Step 1: StepTrace**

Create `src/components/StepTrace.vue`:

```vue
<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../store.js'
import { pyLiteral, sameLiteral } from '../data/training/answers.js'
const props = defineProps({ step: { type: Object, required: true } })
const s = useStore()

const total = props.step.frames.length
const k = ref(s.satisfied.value ? total : 0)          // frames answered so far
const typed = ref('')
const wrong = ref(false)
const done = computed(() => k.value >= total)
const frame = computed(() => props.step.frames[Math.min(k.value, total - 1)])
const lines = computed(() => props.step.code.split('\n'))
const shown = computed(() => Object.entries(frame.value.state)
  .map(([name, v]) => ({ name, text: name === frame.value.ask && !done.value ? '?' : pyLiteral(v) })))

function submit() {
  if (done.value) return
  if (sameLiteral(typed.value, frame.value.state[frame.value.ask])) {
    k.value += 1; typed.value = ''; wrong.value = false
    if (done.value) s.answer(true)
  } else {
    wrong.value = true
  }
}
</script>

<template>
  <div class="mission">
    <h4>Trace it by hand</h4>
    <p>Call: <code>{{ step.input }}</code>. At each stop, type the value of the highlighted variable exactly as Python would print it.</p>
  </div>
  <div class="trace">
    <pre class="trace-code"><div v-for="(l, i) in lines" :key="i" :class="{ hl: i + 1 === frame.line }"><span class="ln">{{ i + 1 }}</span>{{ l }}</div></pre>
    <div class="trace-side">
      <div class="dim">Stop {{ Math.min(k + 1, total) }} of {{ total }} · after line {{ frame.line }}</div>
      <div class="state">
        <div v-for="v in shown" :key="v.name" class="var" :class="{ ask: v.name === frame.ask && !done }">
          <span>{{ v.name }}</span><code>{{ v.text }}</code>
        </div>
      </div>
      <form v-if="!done" class="ans" @submit.prevent="submit">
        <label>Value of <code>{{ frame.ask }}</code></label>
        <input v-model="typed" autocomplete="off" spellcheck="false" autofocus placeholder="e.g. 3, 'ab', [1, 2], True, None">
        <button class="btn" type="submit">Check</button>
      </form>
      <p v-if="wrong" class="why">✗ It is <code>{{ pyLiteral(frame.state[frame.ask]) }}</code>. {{ frame.note }} Type it to continue.</p>
      <p v-else-if="k > 0 && !done" class="why ok">✓ {{ step.frames[k - 1].note }}</p>
      <p v-if="done" class="done-note">Trace complete. {{ step.frames[total - 1].note }}</p>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Register in LessonWindow**

In `src/components/LessonWindow.vue` add:

```js
import StepTrace from './StepTrace.vue'
```

and change the map:

```js
const STEP_COMPONENTS = { explain: StepExplain, spot: StepSpot, trace: StepTrace }
```

- [ ] **Step 3: Styles**

Append to `src/style.css`:

```css

  /* ── Trace step ────────────────────────────────────────────────────────── */
  .trace{display:grid;grid-template-columns:1.2fr 1fr;gap:14px}
  @media (max-width:700px){.trace{grid-template-columns:1fr}}
  .trace-code{padding:10px 0}
  .trace-code div{padding:0 14px;white-space:pre}
  .trace-code .ln{display:inline-block;width:2.2em;color:var(--faint);user-select:none}
  .trace-code .hl{background:rgba(63,169,255,.18);box-shadow:inset 3px 0 0 var(--glow)}
  .trace-side{display:grid;gap:10px;align-content:start}
  .state{display:grid;gap:4px;border:1px solid var(--faint);padding:10px 12px;background:rgba(5,10,22,.5)}
  .var{display:grid;grid-template-columns:90px 1fr;gap:10px;font-size:15px}
  .var span{color:var(--dim)}
  .var.ask code{color:var(--glow);font-weight:700}
  .ans{display:grid;gap:6px}
  .ans label{color:var(--dim);font-size:15px}
  .ans input{background:#050a16;color:var(--ink);border:1px solid var(--faint);padding:8px 10px;font:inherit;font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:14px}
  .ans input:focus{outline:none;border-color:var(--edge);box-shadow:0 0 0 2px rgba(63,169,255,.25)}
```

- [ ] **Step 4: Verify in the browser**

Clear "The back room" if not already, open "Two hands on the rope", Next twice to the trace. Expected: code with line 2 highlighted, state shows `i 0` and `j ?`. Type `5`: red line "It is 4. j starts on the last index…". Type `4`: advances to stop 2, green note appears, line 4 highlighted, `s ?`. Work through: `10`, `3`, `7`, `1`, `(1, 3)` (also accept `(1,3)`). After the last: "Trace complete." and Next enables. Back then forward: trace restarts from stop 1 unless the node is already cleared.

- [ ] **Step 5: Commit**

```bash
git add src/components/StepTrace.vue src/components/LessonWindow.vue src/style.css
git commit -m "feat(training): trace step with authored frames

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Code steps (blank and mini)

**Files:**
- Create: `src/components/StepCode.vue`
- Modify: `src/components/LessonWindow.vue`
- Modify: `src/style.css`

**Interfaces:**
- Consumes store `stepCode`, `stepRun`, `runStepTests`, `runtime`, `satisfied`; `editorKeydown` from `src/editor.js`; `TestResults`.

- [ ] **Step 1: StepCode**

Create `src/components/StepCode.vue`:

```vue
<script setup>
import { useStore } from '../store.js'
import { editorKeydown } from '../editor.js'
import TestResults from './TestResults.vue'
const props = defineProps({ step: { type: Object, required: true } })
const s = useStore()
const onKey = e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); s.runStepTests(); return }
  editorKeydown(e)
}
const runLabel = () => {
  if (s.stepRun.value?.status !== 'running') return 'Run tests'
  return s.runtime.value === 'loading' ? 'Loading Python…' : 'Running…'
}
const brief = () => props.step.type === 'blank' ? props.step.intro : props.step.mission
</script>

<template>
  <div class="mission">
    <h4>{{ step.type === 'blank' ? 'Fill the blanks' : 'Mini mission' }}</h4>
    <p :class="{ voice: brief().startsWith('“') }">{{ brief() }}</p>
    <p v-if="step.type === 'blank'" class="dim">Replace every <code>___</code>. Everything else is already right.</p>
  </div>
  <details v-if="step.hint"><summary>Marguerite's note (hint)</summary><p>{{ step.hint }}</p></details>
  <label>
    <div class="editor-label">Your Python (saved locally) <small>Tab / Shift+Tab indent · Ctrl+Enter runs tests</small></div>
    <textarea class="editor" v-model="s.stepCode.value" spellcheck="false" autocapitalize="off" autocomplete="off"
      wrap="off" placeholder="# write your Python here" @keydown="onKey"></textarea>
  </label>
  <div class="row">
    <button class="btn" :disabled="s.stepRun.value?.status === 'running'" @click="s.runStepTests">{{ runLabel() }}</button>
    <span v-if="s.satisfied.value" class="done-note">Passed. Marguerite nods once.</span>
    <span v-else-if="s.runtime.value === 'loading'" class="dim">First run downloads the Python runtime (about 10 MB).</span>
    <span v-else-if="s.runtime.value === 'failed'" class="dim">Python could not load. Check the network and try again.</span>
  </div>
  <TestResults v-if="s.stepRun.value?.status === 'done'" :run="s.stepRun.value" success="Every check passed." />
</template>
```

- [ ] **Step 2: Register in LessonWindow**

In `src/components/LessonWindow.vue` add:

```js
import StepCode from './StepCode.vue'
```

and change the map:

```js
const STEP_COMPONENTS = { explain: StepExplain, spot: StepSpot, trace: StepTrace, blank: StepCode, mini: StepCode }
```

Remove the fallback line `<p v-else class="dim">This step type is not built yet.</p>` and the `v-if="comp"` guard, leaving:

```html
        <component :is="comp" :key="s.activeNode.value.id + '/' + s.stepIndex.value" :step="s.activeStep.value" />
```

- [ ] **Step 3: Styles**

Append to `src/style.css`:

```css

  /* ── Code steps ────────────────────────────────────────────────────────── */
  .lesson textarea{min-height:180px}
  .lesson .mission code{color:var(--glow)}
```

- [ ] **Step 4: Verify in the browser**

Open "Two hands on the rope", advance to step 5 (blank). Expected: editor pre-filled with the `is_mirror` template containing two `___`. Run tests unchanged: "Your code did not run." with a SyntaxError. Fill `i < j` and `i += 1` / `j -= 1` on two lines, Ctrl+Enter: every check passes, "Passed." shows, Next enables. Step 6 (mini): empty editor, hint in details. Write `reverse_in_place`, run, pass, Finish lesson. Flash `Two pointers: learned`, status `100 total`, rank still F (rank E needs an E node to exist). Reload and reopen the node: code for both steps is still there.

Also confirm: leaving a code step while a run is in flight (click Next quickly after Run) does not mark the next step satisfied.

- [ ] **Step 5: Commit**

```bash
git add src/components/StepCode.vue src/components/LessonWindow.vue src/style.css
git commit -m "feat(training): blank and mini code steps on the Pyodide runner

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Document the training layer

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add training sections to CLAUDE.md**

Under `## Run`, change the check line to:

```
- `npm run check` validates all gate and training data. `npm test` proves every gate and drill against reference solutions. Run both after every content change.
```

Under `## Layout`, add:

```
- `src/data/training/` — training room content. One file per technique node, `index.js` lists them in order. `node.js` has the constructors, `progress.js` and `answers.js` are pure logic with unit tests in `tests/`.
- `src/components/SkillTree.vue`, `LessonWindow.vue`, `Step*.vue`, `TestResults.vue` — training presentation.
- `scripts/check-training.mjs` — training validator. `scripts/solutions/training/` — reference solutions for drills, blocks `# === <node-id>/<step-index>`.
```

After the `## Gate schema` section add:

```
## Training node schema
Use `node(id, {...})` and the step constructors from `src/data/training/node.js`:
- `tier` F–D for now, `xp` in the tier's range (F 40–60, E 60–80, D 90–100), `requires` node ids, `gates` gate ids it prepares.
- `title` is a scene name, `algo` the plain technique name.
- Steps in order: `explain(lines, {move?, code?})`, `trace(code, input, frames)`, `spot(problem, options, answer, why)`, `blank(intro, template, tests)`, `mini(mission, hint, tests)`.
- Every technique node has at least one trace, spot, blank, and mini. `method` has explain and spot only.
- Trace frames: `{ line, state, ask, note }`; `line` is 1-based into `code`; `ask` names a key of `state`; values are JS literals or `{ py: '(1, 3)' }` for tuples.
- Drill `tests` use the same `check()` dialect as gates. Add a reference block per drill in `scripts/solutions/training/<node-id>.py`.
- Content order in a lesson: brute force from Dax, the waste named, the pattern shown, then trace, spot, blank, mini.
```

Under `## The story`, add after the Arcs line:

```
- Training room: a rented room above a laundromat where the crew trains between jobs. Marguerite teaches the six moves (restate, examples, brute force, name the waste, pick the pattern, verify) and one technique per lesson. Training is separate from gates: own XP, own rank F–S.
```

- [ ] **Step 2: Run everything**

Run: `npm run check && npm test && npm run build`
Expected: all three succeed.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: training room layout, node schema, and story notes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Content batch — remaining F nodes

**Files:**
- Create: `src/data/training/loops.js`, `arrays-in-place.js`, `grids.js`, `strings.js`, `digit-arrays.js`, `hash-maps.js`, `frequency.js`, `bits.js`, `sets.js`
- Create: `scripts/solutions/training/<same ids>.py`
- Modify: `src/data/training/index.js` (imports and `NODES` order)
- Modify: `src/data/training/two-pointers.js` (`requires: ['arrays-in-place']`)

**Interfaces:**
- Every node follows the schema in Task 2 and passes `check-training.mjs`. Every `blank`/`mini` has a reference block and passes `test-solutions.mjs`.

Node specifications. Each has 1–2 `explain` (first carries Dax's brute force or a naive habit, second names the waste and shows a code block), then `trace`, `spot`, `blank`, `mini` in that order. Function names are fixed so reference solutions and tests agree.

| id | tier/xp | requires | gates | trace demonstrates | blank function (`___` count) | mini function |
|---|---|---|---|---|---|---|
| loops | F/40 | method | fizz | `count_multiples(nums, k)` accumulating `count` over `[3, 5, 6, 7, 9]`, k=3; ask `count` and the loop variable alternately (5 frames) | `every_third(n)` returning `'clear'` for multiples of 3 else `str(i)` for 1..n (2 blanks: modulus test, else branch) | `count_between(nums, lo, hi)` inclusive count |
| arrays-in-place | F/50 | loops | zeros, rmdup | `fill_front(nums)` with write pointer `w` over `[0, 4, 0, 7]` moving non-zeros forward; ask `w` and `nums` (5 frames, `nums` asked once as a list) | `swap_ends(nums)` swapping first and last in place (1 blank: tuple swap) | `move_negatives_back(nums)` stable, in place, returns None |
| grids | F/40 | loops | transpose | `row_sums(grid)` over `[[1, 2], [3, 4]]`; ask `total` per row and the result list (4 frames) | `column(grid, c)` returning a list (1 blank: `grid[r][c]`) | `diagonal(grid)` main diagonal of a square grid |
| strings | F/40 | loops | reverse, palin | `first_word(s)` scanning to the first space over `'ok go'`; ask index and result (4 frames) | `only_letters(s)` keeping alphanumerics lowercased (2 blanks: `isalnum()`, `.lower()`) | `count_vowels(s)` case-insensitive |
| digit-arrays | F/50 | loops | plusone | `add_one(digits)` with `carry` over `[1, 9, 9]` walking from the right; ask `carry` and `digits` (5 frames) | `to_number(digits)` accumulating `n = n * 10 + d` (1 blank) | `to_digits(n)` list of digits of a non-negative int, `[0]` for 0 |
| hash-maps | F/50 | loops | twosum, anagram, firstuniq | `index_of_first(nums)` building `seen = {}` over `[4, 7, 4]`; ask `seen` after each insert (3 frames, dict values) | `pair_with_sum(nums, target)` returning indices via a `seen` dict (2 blanks: the lookup, the insert) | `first_repeat(nums)` first value seen twice, `None` if none |
| frequency | F/50 | hash-maps | anagram, firstuniq, majority | `counts(s)` over `'aba'`; ask the dict after each character (3 frames) | `is_anagram(a, b)` comparing two count dicts (2 blanks: increment, comparison) | `most_common(nums)` value with the highest count, smallest on tie |
| bits | F/40 | loops | xor | `fold_xor(nums)` with `acc` over `[3, 5, 3]`; ask `acc` each step (3 frames) | `is_odd(n)` using `& 1` (1 blank) | `count_ones(n)` number of set bits in a non-negative int |
| sets | F/40 | hash-maps | dupes | `has_repeat(nums)` with `seen = set()` over `[2, 5, 2]`; ask `seen` (state stores `{ py: '{2, 5}' }`) and the return (3 frames) | `unique_in_order(nums)` keeping first occurrences (2 blanks: membership test, add) | `common(a, b)` sorted list of values present in both lists |

Also update the graph: `two-pointers` now requires `arrays-in-place`.

Story beats for the `explain` steps (write 2–5 lines each, in voice):
- loops: Dax counts radio calls on his fingers; Marguerite hands over a burner and says count with the machine.
- arrays-in-place: the SIM tray from gate `zeros`; Dax wants a second tray, Marguerite refuses.
- grids: the teller floor photo; rows and columns, Dax keeps losing a desk.
- strings: Dax's backwards notes; the fence's passphrase.
- digit-arrays: a numbered locker with a mechanical counter that rolls 199 to 200.
- hash-maps: the informant list; Dax rescans the whole list per question, Marguerite hands him an index card box.
- frequency: sorting badge letters; counting is looking up and adding one.
- bits: two identical keys and one odd one; XOR cancels pairs.
- sets: a guest list with duplicates; a set remembers who has been seen.

- [ ] **Step 1: Write the nine node files**

Follow the shape of `two-pointers.js` exactly. Each trace `frames` entry has `line`, `state`, `ask`, `note`. Each `blank` template contains `___`. Each `mini` names its function in `mission`. Each `tests` string uses `check(...)` with 4–7 checks including one edge case (empty input, single item, or no match). Use `inplace(fn, seq)` from the harness for in-place drills, as `two-pointers` does.

- [ ] **Step 2: Write the reference solutions**

One file per node in `scripts/solutions/training/`, one block per drill: `# === <id>/<blank step index>` and `# === <id>/<mini step index>`. Step indices are 0-based positions in the node's `steps` array; with the standard order (explain, explain, trace, spot, blank, mini) they are `4` and `5`; with one explain they are `3` and `4`.

- [ ] **Step 3: Register and reorder**

In `src/data/training/index.js` import every file and set:

```js
export const NODES = [method, loops, arraysInPlace, grids, twoPointers, strings, digitArrays, hashMaps, frequency, bits, sets]
```

In `two-pointers.js` set `requires: ['arrays-in-place']`.

- [ ] **Step 4: Validate and prove**

Run: `npm run check`
Expected: `✓ 11 training nodes look good`.

Run: `npm test`
Expected: `✓ 78 gates, 20 training drills, … checks, all reference solutions pass`.

Fix content until both pass. Never loosen a validator rule to make content pass.

- [ ] **Step 5: Browser check two nodes**

Run `npm run dev`. Open `hash-maps` and `sets` end to end (trace values, spot, blank, mini). Confirm the F column shows eleven cards ordered by depth and the dashed prerequisite lines land on the right cards.

- [ ] **Step 6: Commit**

```bash
git add src/data/training/ scripts/solutions/training/
git commit -m "content(training): F-tier nodes for loops, arrays, grids, strings, digits, hashing, counting, bits, sets

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 12: Content batch — E nodes

**Files:**
- Create: `src/data/training/tracking.js`, `stacks.js`, `binary-search.js`, `rotation.js`, `merging.js`
- Create: `scripts/solutions/training/<same ids>.py`
- Modify: `src/data/training/index.js`

| id | tier/xp | requires | gates | trace demonstrates | blank function | mini function |
|---|---|---|---|---|---|---|
| tracking | E/60 | loops | stocks, majority | `best_profit(prices)` with `low` and `best` over `[7, 1, 5, 3, 6]`; ask `low` and `best` alternately (6 frames) | `running_max(nums)` (1 blank: the `max` update) | `longest_run(nums)` length of the longest stretch of equal adjacent values |
| stacks | E/70 | arrays-in-place | parens | `balanced(s)` with `stack` list over `'(()'`; ask `stack` as a list each step and the return (4 frames) | `matching(s)` for `()[]{}` using a pairs dict (2 blanks: push condition, pop-and-compare) | `undo_sequence(ops)` where `'#'` pops and any other char pushes; return the final string |
| binary-search | E/80 | tracking | halden, firstbad, rotsearch | `find(nums, target)` with `lo, hi, mid` over `[1, 3, 5, 7, 9, 11]`, target 9; ask `mid`, then `lo` or `hi` (5 frames) | `first_true(flags)` first index where a `[False…, True…]` list turns true (2 blanks: mid test, hi/lo move) | `insert_position(nums, target)` index where target would go in a sorted list |
| rotation | E/60 | arrays-in-place | rotate | `reverse_range(nums, i, j)` in place over `[1, 2, 3, 4, 5]`, i=0, j=4; ask `nums` after each swap (3 frames) | `rotate_right(nums, k)` by three reversals (3 blanks: the three ranges) | `rotate_left_string(s, k)` string rotated left by k |
| merging | E/70 | two-pointers | merge, mergell | `merge(a, b)` with `i, j, out` over `[1, 4]`, `[2, 3]`; ask `out` after each append (4 frames) | `merge_sorted(a, b)` (2 blanks: comparison, leftover extends) | `merge_three(a, b, c)` one sorted list from three sorted lists using merges, no `sorted()` |

Story beats: tracking — the stock ticker on the fence's laptop, buy low sell high once; stacks — the bracket lock on the server cage; binary-search — Halden's numbered vault boxes, Dax opens them in order; rotation — the guard rota shifted by k hours; merging — two informants' sorted lists into one.

- [ ] **Step 1: Write the five node files and reference solutions** following the rules in Task 11 steps 1–2.

- [ ] **Step 2: Register**

Append to `NODES` in order: `tracking, stacks, binarySearch, rotation, merging`.

- [ ] **Step 3: Validate and prove**

Run: `npm run check` → `✓ 16 training nodes look good`.
Run: `npm test` → `… 30 training drills …, all reference solutions pass`.

- [ ] **Step 4: Browser check**

Open `binary-search` and `stacks` end to end. Confirm the E column appears and the rank rises to E once XP passes the F total (flash `Rank E`).

- [ ] **Step 5: Commit**

```bash
git add src/data/training/ scripts/solutions/training/
git commit -m "content(training): E-tier nodes for tracking, stacks, binary search, rotation, merging

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 13: Content batch — D nodes

**Files:**
- Create: `src/data/training/sliding-window.js`, `prefix-sums.js`, `linked-lists.js`, `trees.js`
- Create: `scripts/solutions/training/<same ids>.py`
- Modify: `src/data/training/index.js`

| id | tier/xp | requires | gates | trace demonstrates | blank function | mini function |
|---|---|---|---|---|---|---|
| sliding-window | D/90 | two-pointers, tracking | window, minsub | `max_window_sum(nums, k)` with `s` and `best` over `[2, 1, 5, 1, 3]`, k=3; ask `s` and `best` (5 frames) | `longest_no_repeat(s)` variable window with a `seen` dict (2 blanks: shrink condition, best update) | `count_windows_over(nums, k, limit)` number of k-windows whose sum exceeds limit |
| prefix-sums | D/90 | loops | prefix, product, kadane | `prefix(nums)` building `pre = [0]` over `[3, 1, 4]`; ask `pre` after each append (3 frames), then the result of `range_sum(pre, 1, 3)` (1 frame) | `range_sum_query(nums, queries)` (2 blanks: prefix build, `pre[j + 1] - pre[i]`) | `equilibrium_index(nums)` first index where left sum equals right sum, `-1` if none |
| linked-lists | D/100 | two-pointers | linked, mergell | `middle(head)` with `slow` and `fast` over a 5-node list; ask `slow.val` and `fast.val` (`fast` as `None` at the end) (5 frames) | `has_cycle(head)` slow/fast (2 blanks: loop guard, fast step) | `reverse_list(head)` returning the new head; tests build lists with a provided `Node` class and compare with a `_t_to_list(...)` helper |
| trees | D/100 | linked-lists | tree, bst, lca | `depth(root)` recursion over a 3-node tree; ask the return value at each frame bottom-up (4 frames) | `inorder(root)` (2 blanks: left recursion, right recursion) | `bst_contains(root, x)` iterative; tests build trees with a provided `Node` class |

For `linked-lists` and `trees`, the `blank` template and `mini` mission both state that a class `Node` with `val`, `next` (lists) or `val`, `left`, `right` (trees) is provided. The `tests` string defines that class only if missing (`if 'Node' not in globals(): class Node: ...`) plus builder helpers `_t_list(values)` / `_t_tree(values)` and `_t_to_list(head)`, following the pattern used in `src/data/tests.js` for gate `clone`. The reference solution block must also define `Node` the same guarded way so the drill runs standalone in `npm test`.

Story beats: sliding-window — the lobby camera's rolling k-second window; prefix-sums — the running total of bribes so any month range is one subtraction; linked-lists — the chain of dead-drop notes, each pointing to the next; trees — the bank's org chart, who reports to whom.

- [ ] **Step 1: Write the four node files and reference solutions** following the rules in Task 11 steps 1–2.

- [ ] **Step 2: Register**

Append to `NODES` in order: `slidingWindow, prefixSums, linkedLists, trees`.

- [ ] **Step 3: Validate and prove**

Run: `npm run check` → `✓ 20 training nodes look good`.
Run: `npm test` → `… 38 training drills …, all reference solutions pass`.
Run: `npm run build` → `✓ built`.

- [ ] **Step 4: Browser check**

Open `linked-lists` and `trees` end to end. Confirm three columns F, E, D, links between columns, rank D reachable after clearing all F and E nodes, and `Top of the ladder for now` once D is reached.

- [ ] **Step 5: Commit**

```bash
git add src/data/training/ scripts/solutions/training/
git commit -m "content(training): D-tier nodes for sliding window, prefix sums, linked lists, trees

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Self-review notes

- Spec coverage: content model (Tasks 1–2), method node (2), drills proven (3), save slice and rank (1, 4), unlock and resume (4, 7), mode toggle and status (6), tree with SVG links (6), lesson window and four step components (7–9), TestResults reuse (5), validator wired into check (2), docs (10), 20 nodes (2, 11–13), build order engine-first then batches (task order).
- Type consistency: store exports named in Task 4 are the ones consumed in Tasks 6–9 (`mode`, `setMode`, `training`, `trainingXp`, `trainingRank`, `trainingProgress`, `nodesCleared`, `nodeState`, `activeNode`, `stepIndex`, `activeStep`, `satisfied`, `openNode`, `closeNode`, `answer`, `next`, `back`, `stepCode`, `stepRun`, `runStepTests`). `flash` holds text from Task 4 onward and `App.vue` renders it as text in the same task.
- Rank rule: spec says the reachable maximum is D until more tiers ship; `rankFor` only considers populated tiers, so with F–D content rank tops out at D. Task 1's tests pin that.
- Trace step: frames answered in order, `satisfied` set only after the last frame; reopening a cleared node shows the trace complete because `enterStep` sets `satisfied` true for cleared nodes and `StepTrace` reads it on mount.
