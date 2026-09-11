# Courses — plan 2: the patterns course, kit and heist — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the design-patterns course "The Blueprint" to the registry with its six armoury tools and twenty heist gates, proven by reference solutions, so the Jobs screen offers two courses.

**Architecture:** A new folder `src/courses/patterns/` mirrors `src/courses/algorithms/`: `course.js` (course object), `gates.js` + `tests.js` + `index.js` (heist), `training/index.js` + `training/tools/` (armoury). Lessons come in plan 3; this plan ships `NODES = []`, which the shell, the rank ladder (`rankFor([]) === 'F'`) and the validators already tolerate. Reference solutions live in `scripts/solutions/patterns/`.

**Tech Stack:** Vue 3 (no component changes), plain JS content modules, Python 3 for tests and reference solutions.

**Spec:** `docs/superpowers/specs/2026-09-12-courses-and-patterns-design.md`

## Why the split changed

The spec's rollout put the training room in plan 2 and the heist in plan 3. Lessons must list the gate ids they prepare, and `check-training` rejects unknown gate ids and empty `gates` arrays. Gates therefore come first: this plan is the course skeleton, the kit and the heist; plan 3 is the eighteen lessons.

## Global Constraints

- Course card: id `patterns`, title `The Blueprint`, plain name `Design patterns`, runner `python`, stats `['structure', 'behaviour', 'creation']`. Registered second, after algorithms.
- No step anywhere in this course sets `scene`.
- Story: same crew (Marguerite, Dax, the fence, the learner as "the systems person"), same city, the room above the laundromat. After Halden the crew has money and no kit; Marguerite wants tooling built properly this time. Dax builds everything as one tangled class. Voice: short, wry, concrete. No real anime, manga, game or their characters.
- Gate schema per CLAUDE.md: `g(id, rank, xp, stat, title, algo, story, mission, hint, code?)`. `id` unique within the course, lowercase. `story` 2–4 lines, at least one starting with `“`. `mission` names the classes and methods and ends with a stretch a tangled solution fails. `hint` one or two sentences, never the solution. `code` on roughly every second gate in Arcs I–II.
- xp by rank: F 40–50, E 60–80, D 90–100, C 120–140, B 160–180, A 200–240, S 280–400. An arc spans at most two adjacent ranks; ranks rise through an arc.
- Prose rule: lesson lines never name a pattern; gates are looser (mission may name classes; `algo` names the pattern). Gate `title` is a scene name, never the pattern name.
- Tool schema: `tool(id, { xp: 30, title, algo, steps: [explain, explain, trace, blank] })`, first explain carries a `code` block, at least one spoken line starting with `“`, blank has 4–7 `check(` calls and a `___` marker. Tool prose may name its own structure.
- Trace frames: `{ line, state, ask, note }`; 3+ frames; `line` 1-based into `code`; `ask` a key of `state`. Object values in state use the twin form `{ py: "Badge('Dax')" }` so the learner types the Python repr; plain lists, strings, ints and bools stay JS literals.
- Tests use the harness `check()` dialect: `check("expr", expected)` or `check(label, thunk_or_value, expected)`. Helper names in tests start with `_t_`. Only the main mission is tested, never the stretch.
- Reference solutions: `scripts/solutions/patterns/arc1.py` … `arc5.py` with blocks `# === <gate id>`; `scripts/solutions/patterns/training/<tool-id>.py` with blocks `# === <tool-id>/3`.
- `npm test`, `npm run check`, `npm run build` green at the end of every task. Baseline before this plan: 78 gates, 98 drills, 1186 checks, 44 nodes, 12 tools.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Branch `patterns-kit-heist` off `training-polish`.

---

## File structure

| Path | Responsibility |
|---|---|
| `src/courses/patterns/course.js` | The course object (card, stats, arcs/gates, training, ladder, blurbs, tier blurbs). |
| `src/courses/patterns/index.js` | `ARCS` (gates joined with tests), `GATES`, `XP_PER_LEVEL`, `TITLES`, `titleFor`. |
| `src/courses/patterns/gates.js` | `ARCS_DATA`: five arcs, twenty gates, story and missions. |
| `src/courses/patterns/tests.js` | `TESTS`: Python test string per gate id. |
| `src/courses/patterns/training/index.js` | `NODES` (empty until plan 3), `NODE_BY_ID`, re-exports `TIERS`, `TOOLS`, `TOOL_BY_ID`. |
| `src/courses/patterns/training/tools/index.js` + six `tool-*.js` | The armoury. |
| `src/courses/index.js` | Registers the course second. |
| `scripts/solutions/patterns/arc1.py … arc5.py`, `training/tool-*.py` | Reference solutions. |
| `tests/training-tools.test.mjs` | `EXPECTED_TOOLS.patterns = 6`. |
| `tests/courses.test.mjs` | Asserts the two-course registry order and the no-scene rule. |

---

### Task 1: Course skeleton, registered, with Arc I and the first tool

**Files:**
- Create: `src/courses/patterns/course.js`, `index.js`, `gates.js`, `tests.js`, `training/index.js`, `training/tools/index.js`, `training/tools/tool-class.js`
- Create: `scripts/solutions/patterns/arc1.py`, `scripts/solutions/patterns/training/tool-class.py`
- Modify: `src/courses/index.js`, `tests/courses.test.mjs`, `tests/training-tools.test.mjs`

**Interfaces:**
- Produces: `course` object with `id: 'patterns'`; `ARCS_DATA` in gates.js as an array of `{ name, sub, gates: [g(...)] }`; `TESTS` keyed by gate id. Later tasks append gates to `gates.js`/`tests.js` and tools to `tools/index.js`.
- `check-gates` wants 3–20 gates per arc, so Arc I ships all four of its gates in this task.

- [ ] **Step 1: Branch**

```bash
git checkout training-polish && git checkout -b patterns-kit-heist
```

- [ ] **Step 2: Extend the registry tests (fail first)**

In `tests/courses.test.mjs`, replace the first test with:
```js
test('algorithms first, patterns second, algorithms default', () => {
  assert.deepEqual(COURSES.map(c => c.id), ['algorithms', 'patterns'])
  assert.equal(DEFAULT_COURSE, 'algorithms')
  assert.equal(courseById('patterns').title, 'The Blueprint')
  assert.deepEqual(courseById('patterns').stats, ['structure', 'behaviour', 'creation'])
  assert.equal(courseById('nope'), null)
})

test('the patterns course never draws the table', () => {
  const c = courseById('patterns')
  for (const n of [...c.training.NODES, ...c.training.TOOLS]) {
    for (const s of n.steps) assert.equal(s.scene, undefined, `${n.id}: no scene allowed`)
  }
})
```
In `tests/training-tools.test.mjs` set `const EXPECTED_TOOLS = { algorithms: 12, patterns: 6 }`. (Task 1 ships one tool, so this test stays red until Task 2; the other tests in that file must pass.)

Run: `node --test tests/courses.test.mjs`
Expected: FAIL, `['algorithms']` vs `['algorithms', 'patterns']`.

- [ ] **Step 3: Write `index.js`, `training/index.js`, `tools/index.js`, `course.js`**

`src/courses/patterns/index.js`:
```js
import { ARCS_DATA } from './gates.js'
import { TESTS } from './tests.js'

// Each gate carries its Python tests (a string run after the learner's code; see src/harness.py).
export const ARCS = ARCS_DATA.map(a => ({ ...a, gates: a.gates.map(g => ({ ...g, tests: TESTS[g.id] })) }))
export const GATES = ARCS.flatMap(a => a.gates)
export const XP_PER_LEVEL = 200

// [upper bound (exclusive) on cleared gates, title]. 'Nobody' for zero clears, the middle
// titles split the course evenly, the last needs every gate cleared.
const MIDDLE = ['Grease monkey', 'Fitter', 'Rigger', 'Engineer', 'Architect']
export const TITLES = [
  [1, 'Nobody'],
  ...MIDDLE.map((name, i) => [Math.round((i + 1) * GATES.length / MIDDLE.length), name]),
  [Infinity, 'Master of the Blueprint'],
]
export function titleFor(cleared) {
  for (const [max, name] of TITLES) if (cleared < max) return name
  return TITLES.at(-1)[1]
}
```

`src/courses/patterns/training/index.js`:
```js
// Training content for the patterns course, in display order. Lessons arrive in plan 3.
export { TIERS } from '../../../training/progress.js'
export { TOOLS, TOOL_BY_ID } from './tools/index.js'

export const NODES = []
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
```

`src/courses/patterns/training/tools/index.js` (grows in Task 2):
```js
// Armoury tools for the patterns course, in display order. Add a tool file, import it, append it here.
import toolClass from './tool-class.js'

export const TOOLS = [toolClass]
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]))
```

`src/courses/patterns/course.js`:
```js
// The patterns course: building the crew's kit properly, one shape at a time.
import { ARCS, GATES, XP_PER_LEVEL, TITLES, titleFor } from './index.js'
import { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS } from './training/index.js'

export const course = {
  id: 'patterns',
  title: 'The Blueprint',
  algo: 'Design patterns',
  runner: 'python',
  stats: ['structure', 'behaviour', 'creation'],
  arcs: ARCS,
  gates: GATES,
  training: { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS },
  xpPerLevel: XP_PER_LEVEL,
  titles: TITLES,
  titleFor,
  blurbs: {
    heist: `${ARCS.length} jobs, ${GATES.length} gates. The crew has money and no kit. This time it gets built right.`,
    training: `${NODES.length} lessons in the back room. Marguerite shows the shape before Dax welds it wrong.`,
  },
  tierBlurbs: {
    F: 'One job per part.',
    E: 'Making things without saying their names.',
    D: 'Wrapping what you cannot change.',
    C: 'Deciding and reacting.',
    B: 'Undo, and who gets told.',
    A: 'Staying in character.',
    S: 'The whole rig.',
  },
}
```

Register in `src/courses/index.js`:
```js
import { course as algorithms } from './algorithms/course.js'
import { course as patterns } from './patterns/course.js'

export const COURSES = [algorithms, patterns]
```

- [ ] **Step 4: Write `gates.js` and `tests.js` with Arc I (four gates)**

`gates.js` skeleton:
```js
// Gate content for the patterns course. One object per gate; see CLAUDE.md for the voice and schema.
const g = (id, rank, xp, stat, title, algo, story, mission, hint, code) => ({ id, rank, xp, stat, title, algo, story, mission, hint, code });

const ARCS = [
{ name:'Arc I — The workbench', sub:'Money in the bag, no kit on the bench. Marguerite wants parts, not a lump.', gates:[
  // four gates from the Arc I table
]},
];
export const ARCS_DATA = ARCS;
```

`tests.js`: copy the header comment from `src/courses/algorithms/tests.js`, then `export const TESTS = { ... }` keyed by gate id.

**Arc I — The workbench (F, all `structure`)**

| id | rank/xp | algo | title | mission (checkable surface) | tests (5–7 checks) | code? |
|---|---|---|---|---|---|---|
| `onejob` | F/40 | Single responsibility | The overloaded crate | Dax's `Crate` class counts stock, prices it and prints the receipt. Split it: `class Tally` with `add(item, price)` and `total()`; `def receipt(tally)` returning a list of strings `"<item>  <price>"` in insertion order, last line `"total  <sum>"`. Stretch: change the receipt format without touching `Tally`. | `Tally().total()` → 0; two adds → `total()` 15; `receipt` on empty → `['total  0']`; `receipt` two items exact list; adding the same item twice keeps both lines; `total` after three adds. | yes |
| `bolton` | F/45 | Open/closed | Bolt-on sensors | `class Alarm` with `add(name, check)` where `check(event)` returns a bool, and `trip(event)` returning the list of names whose check fired, in the order added. Stretch: add a third sensor without editing `trip`. | none added → `[]`; one fires; one does not; two fire in order; same event different names; a silent sensor between two loud ones. | no |
| `standin` | F/45 | Substitutable parts | Any lock, same hand | `class Lock` with `open(key)` returning `False`; `class KeyLock(Lock)` taking `key` in `__init__`, `open(key)` True on match; `class CodeLock(Lock)` taking `code` (a string), `open(key)` True when `str(key) == code`. `def open_all(locks, key)` returning how many opened. Stretch: `open_all` must not mention any subclass. | `Lock().open('x')` False; KeyLock match / mismatch; CodeLock with int key (`str(7) == '7'`); `open_all` over a mixed list; `open_all([], 'k')` → 0; `isinstance(KeyLock('a'), Lock)`. | yes |
| `socket` | F/50 | Depend on the socket | The socket | `class Dispatcher` taking a `channel` object with `send(text)`; `alert(text)` calls `channel.send("ALERT: " + text)` and returns the sent string; `class Log` with a `sent` list and `send(text)` appending. Stretch: swap `Log` for a class that only counts sends, without touching `Dispatcher`. | `Log().sent` → `[]`; `alert` returns the prefixed string; `Log.sent` after two alerts; Dispatcher with a `_t_Counter` fake counting sends; empty text; alert order preserved. | no |

Story beats: `onejob` — Dax's one class "does the whole shop"; Marguerite: “When the receipt changes, why is the stock count nervous?” `bolton` — the safehouse alarm board; every new sensor meant reopening the box. `standin` — a bag of locks from the fence; the hand that opens them should not care which. `socket` — the burner phone versus the radio; the dispatcher plugs into a socket, not a phone.

- [ ] **Step 5: Write `tool-class.js` and its solution**

Tool: `tool-class`, title `The blank badge`, algo `Class`, xp 30. First explain (with code): Dax keeps a badge as a dict `{'name': 'Dax', 'clearance': 2}` plus a pile of loose functions; Marguerite: “A class is the badge and the things a badge can do, in one place.” Code block:
```python
class Badge:
    def __init__(self, name, clearance):
        self.name = name
        self.clearance = clearance
    def can_enter(self, level):
        return self.clearance >= level
    def __repr__(self):
        return f"Badge({self.name!r}, {self.clearance})"

b = Badge('Dax', 2)
b.name            # 'Dax'
b.can_enter(3)    # False
b.clearance += 1
b.can_enter(3)    # True
```
Second explain: `self` is the badge in your hand; attributes live on the instance; a method is a function handed the instance first; `__repr__` is how the badge prints. Trace the same class on `Badge('Dax', 2)` → `b.clearance += 1` → `b.can_enter(3)`: frames ask `b` as `{ py: "Badge('Dax', 2)" }`, then `b.clearance` (3), then `returns` (true). Blank: fill the two `__init__` assignments and the comparison in `can_enter`; checks: `Badge('Dax', 2).name`, `.clearance`, `can_enter` true and false, two badges independent, `type(Badge('a', 1)).__name__ == 'Badge'`.

Solution in `scripts/solutions/patterns/training/tool-class.py`, block `# === tool-class/3`.

- [ ] **Step 6: Write `scripts/solutions/patterns/arc1.py`**

Header comment as in `scripts/solutions/algorithms/arc1.py`, then blocks `# === onejob`, `# === bolton`, `# === standin`, `# === socket`, each a clean pattern-shaped solution.

- [ ] **Step 7: Validate**

Run: `npm test && npm run check && npm run build`
Expected: `✓ 82 gates, 99 training drills, …`; `✓ patterns: 4 gates across 1 arcs look good`; `✓ 44 training nodes and 13 tools across 2 course(s) look good`; registry tests pass; `training-tools` tool-count test fails only on `patterns` (1 vs 6) until Task 2. Build ok.

- [ ] **Step 8: Browser check**

`npm run dev`; new save → Jobs shows two rows, the second "The Blueprint · Design patterns · not started · 4 gates · 0 lessons". Take that job: header blurb shows, status stats read Structure / Behaviour / Creation, Arc I lists four gates, the Training tab shows the Armoury with one tool and no tier tabs. Open `onejob`, paste the reference solution, run: pass, +40 xp, Structure 1. Switch to The Ledger via Jobs: algorithms progress untouched. No console errors.

- [ ] **Step 9: Commit**

```bash
git add src/courses scripts/solutions/patterns tests
git commit -m "content(patterns): the Blueprint course — skeleton, Arc I the workbench, the class tool

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: The armoury — five more tools

**Files:**
- Create: `src/courses/patterns/training/tools/tool-abstract.js`, `tool-dunder.js`, `tool-closure.js`, `tool-dataclass.js`, `tool-generator.js`
- Create: `scripts/solutions/patterns/training/<same ids>.py`
- Modify: `src/courses/patterns/training/tools/index.js` (import and append in this order: class, abstract, dunder, closure, dataclass, generator)

**Interfaces:**
- Produces tool ids `tool-class`, `tool-abstract`, `tool-dunder`, `tool-closure`, `tool-dataclass`, `tool-generator`, which plan 3 lessons list in `tools`.

| id | title | algo | first explain code shows | trace | blank (`___`) and checks |
|---|---|---|---|---|---|
| `tool-abstract` | The stencil | Abstract base class | `from abc import ABC, abstractmethod`; `class Rig(ABC)` with `@abstractmethod def use(self)`; `Rig()` raises `TypeError`; `class Torch(Rig)` implementing `use`. | `Torch().use()`, then a `try: Rig() except TypeError` frame; ask `returns`, `error` (`'TypeError'`), `rigs` list of `{ py }` reprs. | fill the decorator and the subclass method; checks: `Torch().use()`; `issubclass(Torch, Rig)`; instantiating `Rig` raises (a `_t_raises(thunk)` helper returning the exception class name); a second subclass; `Rig.__abstractmethods__ == frozenset({'use'})`. |
| `tool-dunder` | The badge that prints itself | Dunder methods | `__repr__`, `__eq__`, `__len__`, `__iter__`, `__call__` on a `Crew` class; `print(crew)`, `crew == other`, `len(crew)`, `for m in crew`, `crew()`. | build `Crew(['Dax'])`, add `'Vera'`; ask `repr(crew)` as `{ py }`, `len(crew)`, `list(crew)`, `crew == Crew(['Dax', 'Vera'])`. | fill `__len__`, `__eq__`, `__iter__`; checks: `len`, equality true and false, `list(...)`, `repr`, `'Dax' in crew` (works through `__iter__`). |
| `tool-closure` | The sealed envelope | Closure | `def make_counter(): count = 0; def bump(): nonlocal count; count += 1; return count; return bump`; two counters stay independent. | two counters, three bumps; frames on the `nonlocal` line asking `count`, then the return values. | fill `nonlocal` and the return; checks: fresh counter → 1 then 2; independence; `make_adder(n)` returning `add(x)`; adder keeps `n` after the maker returned; `make_adder(0)(5) == 5`. |
| `tool-dataclass` | The stamped form | Dataclass | `from dataclasses import dataclass, field`; `@dataclass class Part: name: str; cost: int = 0; tags: list = field(default_factory=list)`; auto `__init__`, `__repr__`, `__eq__`; `frozen=True` raising on assignment. | make two `Part`s, compare, append a tag; ask `p` as `{ py: "Part(name='blade', cost=40, tags=[])" }`, `p == q`, `p.tags`. | fill the decorator line and `field(default_factory=list)`; checks: repr, defaults, equality, separate lists per instance (`Part('a').tags is not Part('b').tags`), `cost` set. |
| `tool-generator` | The ticket roll | Generator | `def tickets(n): k = 1; while k <= n: yield k; k += 1`; `next(g)`, `StopIteration`, `list(tickets(3))`, laziness (`tickets(10**9)` returns at once). | `g = tickets(2)`; frames at `yield` asking `k` and the value `next(g)` hands back; last frame asks `error` `'StopIteration'`. | fill `yield` and the step; checks: `list(tickets(3))`; `next(tickets(5))` → 1; `evens(limit)` generator; `sum(evens(10))`; `list(tickets(0))` → `[]`. |

Solutions: one file per tool, block `# === <tool-id>/3`.

- [ ] **Step 1: Write the five tool files and their solutions** following `tool-class.js` and the algorithms `tool-stack.js` for shape. Every trace has 3+ frames; every blank 4–7 checks; a spoken line in an explain; no `scene`.
- [ ] **Step 2: Register** in `tools/index.js` in the fixed order.
- [ ] **Step 3: Validate and prove.** `npm run check` → `✓ 44 training nodes and 18 tools across 2 course(s) look good`; `npm test` → `… 104 training drills …` and the tool-count test green; `npm run build`.
- [ ] **Step 4: Browser check** `tool-dunder` and `tool-generator` end to end in the patterns course: trace answers accept the `py` reprs, blank passes with the reference solution, "Tool unlocked" flash, kit tile lights, kit xp 30 each.
- [ ] **Step 5: Commit** `content(patterns): the armoury — abstract base, dunder, closure, dataclass, generator tools`.

---

### Task 3: Arc II — The forge

**Files:**
- Modify: `src/courses/patterns/gates.js`, `tests.js`
- Create: `scripts/solutions/patterns/arc2.py`

Arc: `name:'Arc II — The forge', sub:'Rigs get made here. Nobody says the rig\'s name at the window.'`. All `creation`.

| id | rank/xp | algo | title | mission (checkable surface) | tests | code? |
|---|---|---|---|---|---|---|
| `rigfactory` | E/60 | Factory | Three rigs, one window | Classes `Cutter`, `Torch`, `Jammer`, each with `use()` returning `'cutting'`, `'burning'`, `'jamming'`. `class RigFactory` with `make(kind)` returning an instance for `'cutter'`, `'torch'`, `'jammer'`, raising `ValueError` otherwise (tests call `RigFactory().make(...)`). Stretch: `register(kind, cls)` so a fourth rig needs no edit to `make`. | three kinds → `type(...).__name__`; the three `use()` strings; unknown kind raises (`_t_raises`); two `make` calls give different instances; `'Cutter'` (wrong case) raises. | yes |
| `rigbuilder` | E/70 | Builder | Piece by piece | `class Rig` with attributes `battery` (default 20), `blade` (default `'steel'`), `silent` (default False) and `describe()` → `"<blade> blade, <battery>Ah, silent"` or `"…, loud"`. `class RigBuilder` with chainable `battery(n)`, `blade(name)`, `silent()` returning `self`, and `build()` returning a `Rig`. Stretch: two builders never share state. | default build describe; full chain describe; chain order irrelevant; `build()` twice from one builder gives equal describes; `silent()` flips only that flag; `battery` stored as int. | no |
| `oneradio` | D/90 | Singleton | The only channel | `class Radio` with class method `get()` returning the one instance (created on first call), `tune(freq)` storing `freq`, attribute `freq` (default `None`), and class method `reset()` dropping the instance for tests. Stretch: make `Radio()` itself return the same instance. | `Radio.get() is Radio.get()`; tune, then read through another `get()`; `reset()` then `get()` gives `freq None`; `reset()` twice is safe; two tunes, last wins; identity differs after `reset`. | yes |
| `catalogue` | D/100 | Factory with a registry | The parts catalogue | `class Catalogue` with `register(kind)` usable as a decorator on a class (`@cat.register('cutter')`), `kinds()` returning registered kinds sorted, and `build(kind, **kw)` constructing the registered class with the keyword args, raising `KeyError` for unknown kinds. Stretch: register a plain function as a maker too. | register two classes → `kinds()` sorted; `build` returns the right type; kwargs reach `__init__`; unknown raises `KeyError`; the decorator returns the class unchanged (`cls is Original`); two catalogues independent. | no |

Story beats: `rigfactory` — the fence's counter has one window; you say what you need, not how it is made. `rigbuilder` — a rig ordered in stages across three phone calls. `oneradio` — two radios on one channel talked over each other on the Halden job. `catalogue` — the parts book; new pages get pasted in, the counter never changes.

- [ ] **Step 1: Write the four gates and tests; write `arc2.py`.**
- [ ] **Step 2: Validate and prove.** `npm run check` → `✓ patterns: 8 gates across 2 arcs look good`; `npm test` → `✓ 86 gates, …`.
- [ ] **Step 3: Browser check** `rigfactory` and `oneradio` render and pass with the reference solution; Arc II tab is sealed until Arc I is cleared (clear Arc I with the reference solutions, or set the slot's `cleared` in localStorage).
- [ ] **Step 4: Commit** `content(patterns): Arc II the forge — factory, builder, singleton, registry`.

---

### Task 4: Arc III — The disguise

**Files:**
- Modify: `gates.js`, `tests.js`; Create: `scripts/solutions/patterns/arc3.py`

Arc: `name:'Arc III — The disguise', sub:'You cannot change what the fence sold you. You can dress it.'`. All `structure`.

| id | rank/xp | algo | title | mission (checkable surface) | tests | code? |
|---|---|---|---|---|---|---|
| `foreignplug` | D/90 | Adapter | The wrong-shaped plug | `class OldSafe` with `crack(code_int)` returning `code_int == 4417`. Crew code calls `open(code_str)`. Write `class SafeAdapter` taking an `OldSafe`, exposing `open(code)` that converts the string to int and delegates (non-numeric → `False`), and `def open_all(safes, code)` counting opened safes for any object with `open`. Stretch: adapt a second old class with a different method name through the same `open_all`. | adapter opens with `'4417'`; fails with `'0000'`; non-numeric string → `False`; `open_all` over adapters plus a `_t_New` class with a native `open`; empty list → 0; `open_all` never calls `crack` itself (count via a fake). | yes |
| `layers` | D/100 | Decorator | Lining and plates | `class Coat` with `warmth()` → 1 and `describe()` → `'coat'`. Wrappers `Lined(coat)` (+2 warmth, describe `'lined ' + inner`) and `Armoured(coat)` (+1 warmth, `'armoured ' + inner`), each taking any coat-like object. Stretch: add a third layer without touching the first two. | bare coat; one layer; two layers in either order (warmth 4, describe strings); the same layer twice; wrappers accept a `_t_Vest` fake with the same two methods. | no |
| `frontdesk` | C/120 | Facade | One desk, many doors | Small subsystems: `Vault` with `unlock()` → `'vault open'`, `Guard` with `distract()` → `'guard busy'`, `Camera` with `loop()` → `'camera looping'`. `class Job` facade with `run()` returning the three strings in the order camera, guard, vault. Stretch: add a fourth step without changing the callers of `run()`. | `run()` exact list; each subsystem alone; `run()` twice same result; `Job().run()` needs no args; two `Job`s independent. | no |
| `wrappedhand` | C/130 | Function wrappers | The wrapped hand | `def logged(log)` returning a decorator that appends `"<fn name>(<args joined by ,>)"` to `log` before calling; `def retry(times)` returning a decorator that calls the function up to `times` times, returning the first result that is not `None`, else `None`. Stretch: keep the wrapped function's `__name__` with `functools.wraps`. | logged records the call text; logged returns the value; two calls, two lines; retry returns on first success; retry stops at `times` (count with a `_t_` counter); retry returns `None` when all fail. | no |

Story beats: `foreignplug` — the fence's safes speak numbers, the crew's hands speak strings. `layers` — the same coat, a lining sewn in, plates strapped on. `frontdesk` — one voice on the radio says "go", three things happen. `wrappedhand` — Dax keeps retyping the log line into every function.

- [ ] **Step 1: Write the four gates and tests; write `arc3.py`.**
- [ ] **Step 2: Validate and prove.** `npm run check` → `✓ patterns: 12 gates across 3 arcs look good`; `npm test` → `✓ 90 gates, …`.
- [ ] **Step 3: Browser check** `layers` and `wrappedhand`.
- [ ] **Step 4: Commit** `content(patterns): Arc III the disguise — adapter, decorator, facade, function wrappers`.

---

### Task 5: Arc IV — The play

**Files:**
- Modify: `gates.js`, `tests.js`; Create: `scripts/solutions/patterns/arc4.py`

Arc: `name:'Arc IV — The play', sub:'The plan changes at nine. Nobody rewrites the crew.'`. All `behaviour`.

| id | rank/xp | algo | title | mission (checkable surface) | tests | code? |
|---|---|---|---|---|---|---|
| `threeways` | C/130 | Strategy | Three ways out | Route classes `Sewer`, `Rooftop`, `Cab`, each with `path(start)` returning `f"{start} -> sewer"`, `"… -> rooftop"`, `"… -> cab"`. `class Escape` taking a route, `go(start)` delegating, `switch(route)` replacing it. Stretch: `Escape` never names a route class. | each route's path; `go` delegates; `switch` then `go` uses the new route; a `_t_Boat` fake with `path` works; `go` after two switches; `switch` returns `None`. | no |
| `hearthewire` | C/140 | Observer | Everyone hears the wire | `class Tripwire` with `subscribe(fn)` returning `fn`, `unsubscribe(fn)`, `trip(where)` calling every subscriber with `where` in subscription order and returning how many were called. Stretch: a subscriber that throws must not stop the others. | no subscribers → 0; one called with `where`; two in order (append to a `_t_` list); unsubscribe removes; unsubscribe of an unknown fn is safe; `subscribe` returns `fn`. | no |
| `takeitback` | B/160 | Command | Take it back | `class Move` with `dx, dy`, `do(pos)` returning the new `(x, y)` tuple, `undo(pos)` reversing. `class Recorder` with `run(cmd, pos)` returning the new pos and remembering `cmd`, `undo(pos)` reverting the last command (no-op with an empty history), `redo(pos)` re-applying the last undone command. Stretch: a `Say(text)` command whose undo removes the text from a log. | `Move(1, 2).do((0, 0))` → `(1, 2)`; undo reverses; recorder run then undo; undo on empty returns pos unchanged; redo after undo; a new run after undo clears redo. | no |
| `wireboard` | B/170 | Event bus | The wire board | `class Bus` with `on(kind, fn)`, `off(kind, fn)`, `emit(kind, payload)` calling subscribers of that kind only, in order, returning the count; unknown kind → 0. Stretch: `on('*', fn)` for every kind. | emit with none → 0; one kind fires, another stays silent; two kinds independent; `off` removes; order preserved; payload passed through. | no |

Story beats: `threeways` — the plan's exit changes at nine; the crew stays the same. `hearthewire` — one wire on the fence, every earpiece hears it. `takeitback` — Dax on the floor plan, moving the drill cart, wanting a step back. `wireboard` — the safehouse wire board with labelled channels.

- [ ] **Step 1: Write the four gates and tests; write `arc4.py`.**
- [ ] **Step 2: Validate and prove.** `npm run check` → `✓ patterns: 16 gates across 4 arcs look good`; `npm test` → `✓ 94 gates, …`.
- [ ] **Step 3: Browser check** `hearthewire` and `takeitback`.
- [ ] **Step 4: Commit** `content(patterns): Arc IV the play — strategy, observer, command, event bus`.

---

### Task 6: Arc V — The long con

**Files:**
- Modify: `gates.js`, `tests.js`; Create: `scripts/solutions/patterns/arc5.py`

Arc: `name:'Arc V — The long con', sub:'Stay in character. The mark changes; the play does not.'`. Stats as listed.

| id | rank/xp | stat | algo | title | mission (checkable surface) | tests | code? |
|---|---|---|---|---|---|---|---|
| `readtheroom` | A/200 | behaviour | State | Reading the room | State classes `Calm`, `Wary`, `Alarmed`, each with `name` (lowercase class name), `talk()` returning `'small talk'`, `'short answers'`, `'calls it in'`, and `next()` returning the following state (`Alarmed().next()` is another `Alarmed`). `class Mark` starting `Calm`, with `nudge()` advancing, `talk()` delegating, and attribute or property `mood` giving the current state's name. Stretch: `Mark` holds no `if` on the mood. | fresh `mood` `'calm'`; `talk` after 0, 1, 2 nudges; a third nudge stays `'alarmed'`; the three `talk` strings exact; `Calm().next().name == 'wary'`. | no |
| `runsheet` | A/220 | structure | Template method | Same sheet, different night | `class Job` with `run()` returning `[self.prepare(), self.execute(), self.cleanup()]`, `prepare()` → `'gear checked'`, `cleanup()` → `'wiped down'`, `execute()` raising `NotImplementedError`. `class VaultJob(Job)` with execute `'vault emptied'`; `class SafehouseJob(Job)` with execute `'files copied'` and `prepare()` → `'keys copied'`. Stretch: a hook `before_execute()` that does nothing by default. | `VaultJob().run()` exact list; `SafehouseJob().run()` exact list; `Job().run()` raises `NotImplementedError` (`_t_raises`); shared `cleanup`; `run` twice stable; the subclass override reaches `run`. | no |
| `roombyroom` | A/240 | behaviour | Iterator | Room by room | `class Vault` taking a list of `(room, locked)` tuples with `__iter__` yielding room names in order; `def open_rooms(vault)` a generator yielding only unlocked rooms; `def first_locked(vault)` returning the first locked room name or `None` without building a list. Stretch: make `Vault` iterable twice. | `list(Vault([...]))`; `list(open_rooms(...))`; `first_locked` found and `None`; empty vault; iterating twice gives the same list; `open_rooms` is a generator (`type(...).__name__ == 'generator'`). | no |
| `wholerig` | S/300 | creation | Combining patterns | Build the whole rig | `class Crew` with `register(role, cls)`, `hire(role)` (factory, `KeyError` on unknown), `on(event, fn)` and `emit(event, payload)` (observer, returns the count), `plan(strategy)` and `go(city)` returning `strategy.path(city)`. Hiring emits `'hired'` with the new member. Stretch: `Crew` never names a member class or a strategy. | register then hire → type; unknown role `KeyError`; hire emits `'hired'` with the instance; `go` with a `_t_Route`; swapping strategies; `emit` of an unknown event → 0; two crews independent. | no |

Story beats: `readtheroom` — the mark at the bar, three moods, one script. `runsheet` — every job runs the same sheet, only the middle line changes. `roombyroom` — walking the vault plan without drawing the whole thing first. `wholerig` — the last gate: hire, wire, route, one object, three shapes. Close the arc with a line from the fence.

- [ ] **Step 1: Write the four gates and tests; write `arc5.py`.**
- [ ] **Step 2: Validate and prove.** `npm run check` → `✓ patterns: 20 gates across 5 arcs look good`, `✓ 98 gates across 2 course(s)`; `npm test` → `✓ 98 gates, 104 training drills, … all reference solutions pass`.
- [ ] **Step 3: Browser check** `readtheroom` and `wholerig`; clear all twenty with the reference solutions (paste and run), confirm the title reaches "Master of the Blueprint", level rises, stats spread across the three keys. Switch to The Ledger via Jobs and back: both blocks intact after reload.
- [ ] **Step 4: Commit** `content(patterns): Arc V the long con — state, template method, iterator, the whole rig`.

---

### Task 7: Docs and finish

**Files:**
- Modify: `CLAUDE.md` (Layout and story sections), `docs/superpowers/specs/2026-09-12-courses-and-patterns-design.md` (rollout note and status)

- [ ] **Step 1: CLAUDE.md** — under `## Layout`, after the algorithms bullet, add:
```
- `src/courses/patterns/` — the design-patterns course "The Blueprint": same layout as algorithms (`course.js`, `gates.js`, `index.js`, `tests.js`, `training/` with `tools/`). Stats `structure`, `behaviour`, `creation`. No `scene` anywhere in this course. Six tools: class, abstract, dunder, closure, dataclass, generator. Lessons (plan 3) list the gate ids they prepare.
```
Under `## The story`, add: `- Patterns course: after Halden the crew builds its kit properly. Dax welds one lump; the learner reshapes it into parts. Arcs: I The workbench (principles) · II The forge (making) · III The disguise (wrapping) · IV The play (deciding, reacting) · V The long con (state, sheets, walking the vault, the whole rig).`

- [ ] **Step 2: Spec** — in `## Rollout`, swap items 2 and 3 to match this plan and note why (gate ids first); set `Status:` to `plans 1–2 implemented (courses plumbing; patterns kit and heist); plan 3 (patterns lessons) pending`.

- [ ] **Step 3: Full verification.** `npm test && npm run check && npm run build`. Browser: fresh slot → Jobs shows both courses; production build (`npm run preview`) loads the patterns course with no three.js request until an algorithms lesson with a scene opens.

- [ ] **Step 4: Commit** `docs: the patterns course in CLAUDE.md; spec rollout order`. Then hand the branch to superpowers:finishing-a-development-branch.
