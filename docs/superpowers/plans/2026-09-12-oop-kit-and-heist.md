# The Manifest — plan 1: kit and heist — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the object-oriented Python course "The Manifest" to the registry with its six armoury tools and twenty heist gates, proven by reference solutions, so the Jobs screen offers three courses.

**Architecture:** A new folder `src/courses/oop/` mirrors `src/courses/patterns/`: `course.js` (course object), `gates.js` + `tests.js` + `index.js` (heist), `training/index.js` + `training/tools/` (armoury). Lessons come in plans 2 and 3; this plan ships `NODES = []`, which the shell, the rank ladder and the validators already tolerate (the patterns course shipped the same way). Reference solutions live in `scripts/solutions/oop/`. No plumbing changes: registry, store, saves, validators and proofs already loop over `COURSES`.

**Tech Stack:** Vue 3 (no component changes), plain JS content modules, Python 3 for tests and reference solutions (Pyodide 0.26.4 = CPython 3.12 in the browser; local `python` for proofs).

**Spec:** `docs/superpowers/specs/2026-09-12-oop-course-design.md`

## Global Constraints

- Course card: id `oop`, title `The Manifest`, plain name `Object-oriented programming`, runner `python`, stats `['shape', 'kin', 'protocol']`. Registered second: `COURSES = [algorithms, oop, patterns]`.
- No step anywhere in this course sets `scene`.
- Story: same crew (Marguerite, Dax, the fence, the learner as "the systems person"), same city, the room above the laundromat. The Halden take sits in duffel bags; the fence buys nothing until every item, person and route is written up as a typed, comparable, countable thing: the manifest. Dax keeps it all in dicts, tuples and loose functions that take a dict and poke at its keys. Voice: short, wry, concrete. No real anime, manga, game or their characters.
- Gate schema per CLAUDE.md: `g(id, rank, xp, stat, title, algo, story, mission, hint, code?)`. `id` unique within the course, lowercase. `story` 2–4 lines, at least one starting with `“`. `mission` names the classes and methods and ends with a stretch a dict-based solution fails. `hint` one or two sentences, never the solution. `code` on `tag`, `readback`, `roles`, `stub` (roughly every second gate in Arcs I–II).
- xp by rank: F 40–50, E 60–80, D 90–100, C 120–140, B 160–180, A 200–240, S 280–400. An arc spans at most two adjacent ranks; ranks rise through an arc.
- Prose rule for this course: Python syntax words are code and allowed anywhere (`class`, `self`, `super()`, `@property`, `__eq__`, `isinstance`, `with`, `yield`). Textbook nouns are banned from story lines, missions and hints: inheritance, polymorphism, encapsulation, descriptor, metaclass, method resolution order, MRO, protocol, dunder, magic method, abstract. They may appear in `algo`. Gate `title` is a scene name.
- Tool schema: `tool(id, { xp: 30, title, algo, steps: [explain, explain, trace, blank] })`, first explain carries a `code` block, at least one spoken line starting with `“`, explain steps have 2–5 lines, blank has 4–7 `check(` calls and a `___` marker. Tool prose may name its own structure.
- Trace frames: `{ line, state, ask, note }`; 3+ frames; `line` 1-based into `code`; `ask` a key of `state`. Object values in state use the twin form `{ py: "Item('torch', 5)" }` so the learner types the Python repr; plain lists, dicts, strings, ints and bools stay JS literals; tuples use `{ py: '(1, 2)' }`.
- Tests use the harness `check()` dialect: `check("expr", expected)` or `check(label, thunk_or_value, expected)`. An exception inside a check is a failed check, so to assert that something raises, wrap it: `check("negative price raises", lambda: _t_raises(lambda: Item('a', -1)), 'ValueError')` with a helper defined at the top of that test string:
  ```python
  def _t_raises(fn):
      try: fn()
      except Exception as e: return type(e).__name__
      return None
  ```
  Helper names in tests start with `_t_`. Only the main mission is tested, never the stretch.
- Reference solutions: `scripts/solutions/oop/arc1.py` … `arc5.py` with blocks `# === <gate id>`; `scripts/solutions/oop/training/<tool-id>.py` with blocks `# === <tool-id>/3`.
- `npm test`, `npm run check`, `npm run build` green at the end of every task (except the one noted red test in Task 1). Baseline before this plan: 98 gates, 140 drills, 1544 checks, 62 nodes, 18 tools.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Branch `oop-kit-heist` off `main`.

---

## File structure

| Path | Responsibility |
|---|---|
| `src/courses/oop/course.js` | The course object (card, stats, arcs/gates, training, ladder, blurbs, tier blurbs). |
| `src/courses/oop/index.js` | `ARCS` (gates joined with tests), `GATES`, `XP_PER_LEVEL`, `TITLES`, `titleFor`. |
| `src/courses/oop/gates.js` | `ARCS_DATA`: five arcs, twenty gates, story and missions. |
| `src/courses/oop/tests.js` | `TESTS`: Python test string per gate id. |
| `src/courses/oop/training/index.js` | `NODES` (empty until plan 2), `NODE_BY_ID`, re-exports `TIERS`, `TOOLS`, `TOOL_BY_ID`. |
| `src/courses/oop/training/tools/index.js` + six `tool-*.js` | The armoury: dict, function, tuple, decorator, exception, type. |
| `src/courses/index.js` | Registers the course second. |
| `scripts/solutions/oop/arc1.py … arc5.py`, `training/tool-*.py` | Reference solutions. |
| `tests/training-tools.test.mjs` | `EXPECTED_TOOLS.oop = 6`. |
| `tests/courses.test.mjs` | Asserts the three-course registry order and the no-scene rule for every course after algorithms. |
| `CLAUDE.md` | One layout line for `src/courses/oop/`. |

---

### Task 1: Course skeleton, registered, with Arc I and the dict tool

**Files:**
- Create: `src/courses/oop/course.js`, `index.js`, `gates.js`, `tests.js`, `training/index.js`, `training/tools/index.js`, `training/tools/tool-dict.js`
- Create: `scripts/solutions/oop/arc1.py`, `scripts/solutions/oop/training/tool-dict.py`
- Modify: `src/courses/index.js`, `tests/courses.test.mjs`, `tests/training-tools.test.mjs`

**Interfaces:**
- Produces: `course` object with `id: 'oop'`; `ARCS_DATA` in gates.js as an array of `{ name, sub, gates: [g(...)] }`; `TESTS` keyed by gate id. Later tasks append arcs to `gates.js`/`tests.js` and tools to `tools/index.js`.
- `check-gates` wants 3–20 gates per arc, so Arc I ships all four of its gates in this task.

- [ ] **Step 1: Branch**

```bash
git checkout main && git checkout -b oop-kit-heist
```

- [ ] **Step 2: Extend the registry tests (fail first)**

In `tests/courses.test.mjs`, replace the first two tests with:
```js
test('algorithms first, then oop, then patterns; algorithms default', () => {
  assert.deepEqual(COURSES.map(c => c.id), ['algorithms', 'oop', 'patterns'])
  assert.equal(DEFAULT_COURSE, 'algorithms')
  assert.equal(courseById('algorithms'), COURSES[0])
  assert.equal(courseById('oop').title, 'The Manifest')
  assert.deepEqual(courseById('oop').stats, ['shape', 'kin', 'protocol'])
  assert.equal(courseById('patterns').title, 'The Blueprint')
  assert.deepEqual(courseById('patterns').stats, ['structure', 'behaviour', 'creation'])
  assert.equal(courseById('nope'), null)
})

test('only the algorithms course draws the table', () => {
  for (const c of COURSES.filter(c => c.id !== 'algorithms')) {
    for (const n of [...c.training.NODES, ...c.training.TOOLS]) {
      for (const s of n.steps) assert.equal(s.scene, undefined, `${c.id}/${n.id}: no scene allowed`)
    }
  }
})
```
In `tests/training-tools.test.mjs` set `const EXPECTED_TOOLS = { algorithms: 12, oop: 6, patterns: 6 }`. (Task 1 ships one tool, so the tool-count test stays red until Task 2; the other tests in that file must pass.)

Run: `node --test tests/courses.test.mjs`
Expected: FAIL, `['algorithms', 'patterns']` vs `['algorithms', 'oop', 'patterns']`.

- [ ] **Step 3: Write `index.js`, `training/index.js`, `tools/index.js`, `course.js`, register**

`src/courses/oop/index.js`:
```js
import { ARCS_DATA } from './gates.js'
import { TESTS } from './tests.js'

// Each gate carries its Python tests (a string run after the learner's code; see src/harness.py).
export const ARCS = ARCS_DATA.map(a => ({ ...a, gates: a.gates.map(g => ({ ...g, tests: TESTS[g.id] })) }))
export const GATES = ARCS.flatMap(a => a.gates)
export const XP_PER_LEVEL = 200

// [upper bound (exclusive) on cleared gates, title]. 'Nobody' for zero clears, the middle
// titles split the course evenly, the last needs every gate cleared.
const MIDDLE = ['Clerk', 'Tallyman', 'Appraiser', 'Bookkeeper', 'Registrar']
export const TITLES = [
  [1, 'Nobody'],
  ...MIDDLE.map((name, i) => [Math.round((i + 1) * GATES.length / MIDDLE.length), name]),
  [Infinity, 'Master of the Manifest'],
]
export function titleFor(cleared) {
  for (const [max, name] of TITLES) if (cleared < max) return name
  return TITLES.at(-1)[1]
}
```

`src/courses/oop/training/index.js`:
```js
// Training content for the oop course, in display order. Lessons arrive in plans 2 and 3.
export { TIERS } from '../../../training/progress.js'
export { TOOLS, TOOL_BY_ID } from './tools/index.js'

export const NODES = []
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
```

`src/courses/oop/training/tools/index.js` (grows in Task 2):
```js
// Armoury tools for the oop course, in display order. Add a tool file, import it, append it here.
import toolDict from './tool-dict.js'

export const TOOLS = [toolDict]
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]))
```

`src/courses/oop/course.js`:
```js
// The oop course: the Halden take, written up as things that know what they are.
import { ARCS, GATES, XP_PER_LEVEL, TITLES, titleFor } from './index.js'
import { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS } from './training/index.js'

export const course = {
  id: 'oop',
  title: 'The Manifest',
  algo: 'Object-oriented programming',
  runner: 'python',
  stats: ['shape', 'kin', 'protocol'],
  arcs: ARCS,
  gates: GATES,
  training: { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS },
  xpPerLevel: XP_PER_LEVEL,
  titles: TITLES,
  titleFor,
  blurbs: {
    heist: `${ARCS.length} jobs, ${GATES.length} gates. The take is in bags. The fence buys nothing she cannot count.`,
    training: `${NODES.length} lessons in the back room. Marguerite turns Dax's dicts into things that know what they are.`,
  },
  tierBlurbs: {
    F: 'From a dict to a thing.',
    E: 'Who inherits what.',
    D: 'Equal, ordered, counted.',
    C: 'Walk it, open it, close it.',
    B: 'Other doors in.',
    A: 'Fields that guard themselves.',
    S: 'The class that stamps classes.',
  },
}
```

Register in `src/courses/index.js`:
```js
import { course as algorithms } from './algorithms/course.js'
import { course as oop } from './oop/course.js'
import { course as patterns } from './patterns/course.js'

export const COURSES = [algorithms, oop, patterns]
```
(`DEFAULT_COURSE`, `RUNNERS`, `courseById` unchanged.)

- [ ] **Step 4: Write `gates.js` and `tests.js` with Arc I (four gates)**

`gates.js` skeleton:
```js
// Gate content for the oop course. One object per gate; see CLAUDE.md for the voice and schema.
const g = (id, rank, xp, stat, title, algo, story, mission, hint, code) => ({ id, rank, xp, stat, title, algo, story, mission, hint, code });

const ARCS = [
{ name:'Arc I — The bags', sub:'Four duffel bags on the floor. The fence wants a manifest, not a heap.', gates:[
  // four gates from the Arc I table
]},
];
export const ARCS_DATA = ARCS;
```

`tests.js`: copy the header comment from `src/courses/patterns/tests.js` (change the solutions path to `scripts/solutions/oop/*.py`), then `export const TESTS = { ... }` keyed by gate id.

**Arc I — The bags (F)**

| id | rank/xp | stat | algo | title | mission (checkable surface) | tests | code? |
|---|---|---|---|---|---|---|---|
| `tag` | F/40 | shape | Classes and instances | The paper tag | Dax's item is `{'name': 'torch', 'price': 5}`. Write `class Item` whose `__init__(self, name, price)` stores both as attributes `name` and `price`. Stretch: give `Item` a third attribute `qty` defaulting to 1 without breaking the two-argument call. | `Item('torch', 5).name` → `'torch'`; `.price` → 5; `type(Item('a', 1)).__name__` → `'Item'`; two items keep separate prices after changing one (`_t_a.price = 9`, `_t_b.price` still 2); `hasattr(Item('a', 1), 'name')` True; `Item('a', 1) is Item('a', 1)` False. | yes |
| `worth` | F/45 | shape | Methods and self | What it is worth | `class Item(name, price, qty=1)` with `worth()` returning `price * qty`. `class Bag` with `add(item)`, `count()` (how many added) and `total()` (sum of every item's `worth()`). Stretch: make `add` return the bag so calls chain. | `Item('torch', 5).worth()` → 5; `Item('torch', 5, 3).worth()` → 15; `Bag().total()` → 0; `Bag().count()` → 0; count after two adds → 2; total after adds (5 + 15) → 20; the same item added twice counts twice (count 2, total 10). | no |
| `readback` | F/45 | protocol | repr and str | Reading it back | `class Item(name, price)` with `__repr__` returning exactly `Item('torch', 5)` (name through `!r`, price as is) and `__str__` returning `torch @ 5`. Stretch: give `Bag` a `__str__` that prints every item on its own line. | `repr(Item('torch', 5))`; `str(Item('torch', 5))` → `'torch @ 5'`; `f"{Item('torch', 5)}"` uses str; `repr(Item("bad 'un", 2))` → `Item("bad 'un", 2)`; `eval(repr(Item('torch', 5))).name` → `'torch'` (round trip); `repr([Item('a', 1)])` → `"[Item('a', 1)]"`; `str(Item('a', 1)) != repr(Item('a', 1))` True. | yes |
| `sharedink` | F/50 | shape | Class vs instance attributes | Shared ink, own name | `class Tag` with class attributes `made = 0` and `prefix = 'HB'`. `Tag(name)` stores `name`, adds one to `Tag.made` (the class counter, not a copy) and stores `serial` as `prefix` + `made` zero-padded to three digits (`'HB001'`, `'HB002'`, …). Stretch: give one tag its own prefix without changing any other tag's. | Tests set `Tag.made = 0` first. `Tag('a').serial` → `'HB001'`; second → `'HB002'`; `Tag.made` → 2; `_t_t.made` read through an instance → 2 (shared); `Tag.prefix = 'X'` then `Tag('c').serial` → `'X003'`; `Tag.prefix = 'HB'` restored; two tags keep separate names. | no |

Story beats: `tag` — Dax tips a bag out and starts a dict per item; Marguerite: “A dict is a bag inside a bag. Give the thing a name it answers to.” `worth` — the fence asks what a bag is worth; Dax has a loose `worth(d)` function that reads `d['price']`; Marguerite: “The item knows its own price. Ask it.” `readback` — the fence reads the manifest back over the phone; Dax's print shows `<Item object at 0x…>`; Marguerite: “If you cannot read it back, it is not on the manifest.” `sharedink` — serial numbers stamped in the same ink from one pad; Dax stores the counter in a global and forgets to bump it; Marguerite: “The pad belongs to the class. The name belongs to the tag.”

Example `tests.js` entry for `tag`, to fix the dialect:
```js
tag: `check("Item('torch', 5).name", 'torch')
check("Item('torch', 5).price", 5)
check("type(Item('a', 1)).__name__", 'Item')
_t_a = Item('a', 2); _t_b = Item('b', 2); _t_a.price = 9
check("two items keep separate prices", _t_b.price, 2)
check("hasattr(Item('a', 1), 'name')", True)
check("Item('a', 1) is Item('a', 1)", False)`,
```

- [ ] **Step 5: Write `tool-dict.js` and its solution**

Tool: `tool-dict`, title `The loose bag`, algo `Dict`, xp 30.

First explain (with code): Dax's item is a dict, and every field is a string key you can misspell. Marguerite: “A dict is where attributes live before they have a home. Learn its moves, because every object keeps one underneath.” Code block:
```python
item = {'name': 'torch', 'price': 5}
item['price']              # 5
item.get('qty', 1)         # 1, no KeyError
'qty' in item              # False
item['qty'] = 2
list(item)                 # ['name', 'price', 'qty']

class Item: pass
i = Item()
i.name = 'torch'
vars(i)                    # {'name': 'torch'}
getattr(i, 'qty', 1)       # 1
setattr(i, 'qty', 2)
i.__dict__                 # {'name': 'torch', 'qty': 2}
```
Second explain: `obj.name` is `obj.__dict__['name']` with a fallback up to the class; `getattr`/`setattr` are the dot spelled as a function, for names you only know at run time; `vars(obj)` is the dict itself, so a dict you can read is an object you can read.

Trace: code
```python
def label(d):
    name = d.get('name', '?')
    qty = d.get('qty', 1)
    d['seen'] = True
    return f"{name} x{qty}"
```
input `label({'name': 'torch'})`; frames: line 2 `name` → `'torch'`; line 3 `qty` → 1 (note: the key is missing, so `get` hands back the default and the dict is unchanged); line 4 `d` → `{ name: 'torch', seen: true }` ask `d` (note: writing a new key grows the dict; this is what `setattr` does to an object); line 5 `returns` → `'torch x1'`.

Blank: intro “Read an object like a dict. `describe(obj)` returns every field as `key=value`, sorted by key.” Template:
```python
def describe(obj):
    fields = ___
    return sorted(f"{k}={v}" for k, v in ___)
```
Checks: a class `_t_P` with `pass` and two attributes set → `['a=1', 'b=2']`; empty object → `[]`; attribute added later shows up; values keep their repr-free str (`'name=torch'`); order is by key not insertion; `describe` does not include class attributes (define `_t_Q` with class attr `z = 0`, instance attr `a = 1` → `['a=1']`).

Solution in `scripts/solutions/oop/training/tool-dict.py`, block `# === tool-dict/3`:
```python
def describe(obj):
    fields = vars(obj)
    return sorted(f"{k}={v}" for k, v in fields.items())
```

- [ ] **Step 6: Write `scripts/solutions/oop/arc1.py`**

Header comment as in `scripts/solutions/patterns/arc1.py` (course name changed), then blocks `# === tag`, `# === worth`, `# === readback`, `# === sharedink`, each a clean class-shaped solution. `sharedink`:
```python
class Tag:
    made = 0
    prefix = 'HB'
    def __init__(self, name):
        self.name = name
        Tag.made += 1
        self.serial = f"{self.prefix}{Tag.made:03d}"
```

- [ ] **Step 7: Validate**

Run: `npm test && npm run check && npm run build`
Expected: `✓ 102 gates, 141 training drills, …`; `✓ oop: 4 gates across 1 arcs look good`; `✓ 62 training nodes and 19 tools across 3 course(s) look good`; registry tests pass; `training-tools` tool-count test fails only on `oop` (1 vs 6) until Task 2. Build ok.

- [ ] **Step 8: Browser check**

`npm run dev`; new save → Jobs shows three rows, the second "The Manifest · Object-oriented programming · not started · 4 gates · 0 lessons". Take that job: header blurb shows, status stats read Shape / Kin / Protocol, Arc I lists four gates, the Training tab shows the Armoury with one tool and no tier tabs. Open `tag`, paste the reference solution, run: pass, +40 xp, Shape 1. Switch to The Blueprint and back via Jobs: both blocks intact. No console errors, no three.js chunk in the network panel.

- [ ] **Step 9: Commit**

```bash
git add src/courses scripts/solutions/oop tests
git commit -m "content(oop): the Manifest course — skeleton, Arc I the bags, the dict tool

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: The armoury — five more tools

**Files:**
- Create: `src/courses/oop/training/tools/tool-function.js`, `tool-tuple.js`, `tool-decorator.js`, `tool-exception.js`, `tool-type.js`
- Create: `scripts/solutions/oop/training/<same ids>.py`
- Modify: `src/courses/oop/training/tools/index.js` (import and append in this order: dict, function, tuple, decorator, exception, type)

**Interfaces:**
- Produces: six tool ids `tool-dict`, `tool-function`, `tool-tuple`, `tool-decorator`, `tool-exception`, `tool-type`, referenced by lessons in plans 2 and 3.

Each tool: xp 30, steps explain (with `code`), explain, trace, blank. Blank has 4–7 checks and a `___` marker. Solution block `# === <tool-id>/3`.

- [ ] **Step 1: `tool-function` — A move with no owner (algo `Function`)**

Explain 1 (code): Dax's `worth(d)` takes a dict; Marguerite: “A function is a value. You can hand it round, store it, call it later. A method is the same function with the object already in its first seat.” Code:
```python
def worth(item, qty=1):
    return item['price'] * qty

f = worth                  # no call: the function itself
f({'price': 5}, 3)         # 15
moves = {'worth': worth}
moves['worth']({'price': 2})   # 2

def spread(*args, **kwargs):
    return args, kwargs
spread(1, 2, k=3)          # ((1, 2), {'k': 3})

class Item:
    def __init__(self, price): self.price = price
    def worth(self, qty=1): return self.price * qty
i = Item(5)
g = i.worth                # bound: i is already the first argument
g(3)                       # 15
Item.worth(i, 3)           # 15, the same call spelled long
```
Explain 2: `*args` gathers what is left over into a tuple, `**kwargs` into a dict, and `f(*seq)` spreads a sequence back out; a bound method is a function plus one saved argument; `self` is not magic, it is that saved seat.

Trace: code
```python
def bind(fn, *pre):
    def inner(*rest):
        return fn(*pre, *rest)
    return inner

def add(a, b, c):
    return a + b + c

add5 = bind(add, 5)
r = add5(1, 2)
```
input `r`; frames: line 9 `add5` → `{ py: '<function inner>' }` ask `add5` (note: `bind` returns `inner`, which remembers `fn` and `pre` = `(5,)`); line 3 `pre` → `{ py: '(5,)' }`, `rest` → `{ py: '(1, 2)' }`, ask `rest` (note: the saved seat comes first, the new arguments after); line 10 `r` → 8 ask `r`.

Blank: intro “Bind the first arguments now, take the rest later.” Template:
```python
def bind(fn, *pre):
    def inner(*rest):
        return ___
    return inner
```
Checks: `bind(lambda a, b: a - b, 10)(3)` → 7; `bind(max, 0)(-5)` → 0; `bind(lambda: 'x')()` → `'x'`; `bind(lambda a, b, c: (a, b, c), 1, 2)(3)` → `(1, 2, 3)`; bound function called twice gives the same answer; `type(bind(len)).__name__` → `'function'`.

Solution: the `bind` above with `return fn(*pre, *rest)`.

- [ ] **Step 2: `tool-tuple` — The sealed pair (algo `Tuple`)**

Explain 1 (code): Dax writes a pair as a two-item list and someone appends a third. Marguerite: “A tuple is a list that has been sealed. Nothing goes in or out, so it can be a key, and it can be trusted.” Code:
```python
p = ('torch', 5)
p[0]                       # 'torch'
name, price = p            # unpacking
p[1] = 6                   # TypeError: 'tuple' object does not support item assignment

where = {('vault', 2): 'safe', ('vault', 3): 'lockers'}
where[('vault', 3)]        # 'lockers'

from collections import namedtuple
Pair = namedtuple('Pair', 'name price')
q = Pair('torch', 5)
q.name, q.price, q[1]      # ('torch', 5, 5)
q == ('torch', 5)          # True
```
Explain 2: a tuple hashes when everything inside it does, so `(name, price)` is a fine dict key and a fine set member; unpacking is the same move in `for name, price in pairs:`; `namedtuple` is a tuple with names on the seats, the smallest class you can make.

Trace: code
```python
def swap_ends(t):
    first, *mid, last = t
    out = (last, *mid, first)
    return out
```
input `swap_ends((1, 2, 3, 4))`; frames: line 2 `first` → 1, `mid` → `[2, 3]`, `last` → 4 ask `mid` (note: the starred name catches the middle as a list); line 3 `out` → `{ py: '(4, 2, 3, 1)' }` ask `out`; line 4 `returns` → `{ py: '(4, 2, 3, 1)' }`.

Blank: intro “Seal every (name, price) pair and index it by position.” Template:
```python
def index(items):
    return {___: i for i, (name, price) in enumerate(items)}
```
Checks: `index([('torch', 5), ('cutter', 10)])` → `{('torch', 5): 0, ('cutter', 10): 1}`; `index([])` → `{}`; lookup `index([('a', 1)])[('a', 1)]` → 0; a repeated pair keeps the last index; keys are tuples (`all(type(k) is tuple for k in index([('a', 1)]))` True); three items → 3 keys.

Solution: `{(name, price): i for i, (name, price) in enumerate(items)}`.

- [ ] **Step 3: `tool-decorator` — The wrapper (algo `Decorator`)**

Explain 1 (code): Dax pastes the same three logging lines into every function. Marguerite: “A decorator is a function that takes your function and hands back a wrapped one. The `@` is just `f = wrap(f)` written above the door.” Code:
```python
import functools

def counted(fn):
    @functools.wraps(fn)
    def inner(*args, **kwargs):
        inner.calls += 1
        return fn(*args, **kwargs)
    inner.calls = 0
    return inner

@counted
def worth(price, qty=1):
    return price * qty

worth(5); worth(5, 2)
worth.calls                # 2
worth.__name__             # 'worth', thanks to wraps
```
Explain 2: without `functools.wraps` the wrapped function is called `inner` in every traceback; `@property`, `@classmethod` and `@staticmethod` are decorators too, which is why they sit above a `def`; a decorator with arguments is a function that returns a decorator.

Trace: code
```python
def counted(fn):
    def inner(*args):
        inner.calls += 1
        return fn(*args)
    inner.calls = 0
    return inner

@counted
def twice(x):
    return 2 * x

a = twice(3)
b = twice(4)
```
input `twice.calls`; frames: line 9 `twice` → `{ py: '<function inner>' }` ask `twice` (note: the `@` line ran `counted(twice)` and rebound the name to `inner`); line 12 `calls` → 1, `a` → 6 ask `calls`; line 13 `calls` → 2, `b` → 8 ask `calls`.

Blank: intro “Log the name of every wrapped function that runs, then let it run.” Template:
```python
LOG = []

def logged(fn):
    def inner(*args, **kwargs):
        ___
        return ___
    return inner
```
Checks (tests define `@logged def _t_f(x): return x + 1` and `@logged def _t_g(): return 'g'` after `LOG.clear()`): `_t_f(1)` → 2; `LOG` → `['_t_f']`; `_t_g()` → `'g'`; `LOG` → `['_t_f', '_t_g']`; keyword arguments pass through (`_t_h(a=1)` with `def _t_h(a): return a` → 1); `LOG` length after three calls → 3.

Solution: `LOG.append(fn.__name__)` then `return fn(*args, **kwargs)`.

- [ ] **Step 4: `tool-exception` — The alarm that climbs (algo `Exception`)**

Explain 1 (code): Dax returns `-1` for “something went wrong” and the caller adds it to the total. Marguerite: “An error is a thing you raise. It climbs the call stack until someone catches it, and it carries its own name.” Code:
```python
class Sealed(RuntimeError):
    pass

def add(bag, item):
    if bag['sealed']:
        raise Sealed('bag is sealed')
    bag['items'].append(item)

bag = {'sealed': True, 'items': []}
try:
    add(bag, 'torch')
except Sealed as e:
    print(type(e).__name__, e)      # Sealed bag is sealed
except RuntimeError:
    print('some other runtime error')

try:
    add(bag, 'torch')
except RuntimeError:
    print('caught by the parent')   # a Sealed is a RuntimeError too
```
Explain 2: `except X` matches X and every class below it, so order clauses from specific to general; a custom error is a class with usually nothing in it, its name is the payload; `raise` with no argument inside `except` re-throws the same error upward.

Trace: code
```python
class Sealed(RuntimeError):
    pass

def add(bag, item):
    if bag['sealed']:
        raise Sealed('sealed')
    bag['items'].append(item)

def safe_add(bag, item):
    try:
        add(bag, item)
        return True
    except Sealed:
        return False

ok = safe_add({'sealed': True, 'items': []}, 'torch')
```
input `ok`; frames: line 5 `sealed` → true ask `sealed`; line 6 `raised` → `'Sealed'` ask `raised` (note: `raise` leaves `add` at once; the append never runs); line 13 `caught` → `'Sealed'` ask `caught` (note: the error climbed into `safe_add` and met a matching `except`); line 14 `ok` → false ask `ok`.

Blank: intro “Raise your own error when the bag is sealed, and catch only that one.” Template:
```python
class Sealed(RuntimeError):
    pass

def add(bag, item):
    if bag['sealed']:
        ___
    bag['items'].append(item)

def safe_add(bag, item):
    try:
        add(bag, item)
        return True
    except ___:
        return False
```
Checks: `safe_add({'sealed': False, 'items': []}, 'a')` → True; items appended (`_t_b['items']` → `['a']`); sealed → False; sealed bag stays empty; `issubclass(Sealed, RuntimeError)` True; a non-Sealed error is not swallowed (`_t_raises(lambda: safe_add({'sealed': False}, 'a'))` → `'KeyError'`, no `'items'` key).

Solution: `raise Sealed('bag is sealed')` and `except Sealed:`.

- [ ] **Step 5: `tool-type` — What it is (algo `Type`)**

Explain 1 (code): Dax checks `str(x).isdigit()` to find the numbers. Marguerite: “Ask a thing what it is. Every value knows its class, every class knows its parents, and the class of a class is `type`.” Code:
```python
type(5)                    # <class 'int'>
type(5).__name__           # 'int'
(5).__class__ is int       # True

isinstance(5, int)         # True
isinstance(True, int)      # True: bool is a child of int
isinstance('5', (int, float))   # False, either type in the tuple would do
issubclass(bool, int)      # True

class Item: pass
type(Item) is type         # True: classes are made by type
type(Item()) is Item       # True
Item.__name__              # 'Item'
```
Explain 2: `isinstance` follows the family line, so `type(x) is Item` is stricter than `isinstance(x, Item)`; `bool` under `int` is the classic surprise, so test for `bool` first when it matters; `type` is a class whose instances are classes, which is the door to Arc V.

Trace: code
```python
def kind(x):
    if isinstance(x, bool):
        return 'flag'
    if isinstance(x, int):
        return 'count'
    return type(x).__name__

k1 = kind(True)
k2 = kind(3)
k3 = kind('a')
```
input `(k1, k2, k3)`; frames: line 3 `k1` → `'flag'` ask `k1` (note: `bool` is checked first, or `True` would be a count); line 5 `k2` → `'count'` ask `k2`; line 6 `k3` → `'str'` ask `k3` (note: no branch matched; the class name itself is the answer).

Blank: intro “Sort a mixed bag into ints, strs and the rest. Remember what `True` is.” Template:
```python
def sort_out(things):
    out = {'int': [], 'str': [], 'other': []}
    for x in things:
        if ___:
            out['int'].append(x)
        elif ___:
            out['str'].append(x)
        else:
            out['other'].append(x)
    return out
```
Checks: `sort_out([1, 'a', 2.5])` → `{'int': [1], 'str': ['a'], 'other': [2.5]}`; `sort_out([])` → all three empty; `sort_out([True])['int']` → `[True]` (bool is an int); `sort_out([None, [], 'b'])['other']` → `[None, []]`; order preserved within a bucket (`sort_out([3, 1, 2])['int']` → `[3, 1, 2]`); a subclass of str lands in `'str'` (tests define `class _t_S(str): pass`; `sort_out([_t_S('x')])['str']` → `['x']`).

Solution: `isinstance(x, int)` and `isinstance(x, str)`.

- [ ] **Step 6: Register the tools and write the solutions**

`tools/index.js` imports all six and exports `TOOLS = [toolDict, toolFunction, toolTuple, toolDecorator, toolException, toolType]`. Solutions in `scripts/solutions/oop/training/tool-function.py`, `tool-tuple.py`, `tool-decorator.py`, `tool-exception.py`, `tool-type.py`, each with one block `# === <tool-id>/3` holding the template with the blanks filled (for `tool-decorator` include `LOG = []`; for `tool-exception` include the `Sealed` class and both functions).

- [ ] **Step 7: Validate**

Run: `npm test && npm run check && npm run build`
Expected: `✓ 102 gates, 146 training drills, …`; `✓ 62 training nodes and 24 tools across 3 course(s) look good`; `training-tools` tests all pass (oop 6). Build ok.

- [ ] **Step 8: Browser check**

`npm run dev`, The Manifest → Training → Armoury lists six tools in order. Open `tool-decorator`: two explains with a code block, trace shows `twice.calls`, blank accepts the solution and awards 30 kit xp; training xp and rank untouched.

- [ ] **Step 9: Commit**

```bash
git add src/courses/oop/training scripts/solutions/oop/training
git commit -m "content(oop): the armoury — function, tuple, decorator, exception, type tools

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Arcs II and III — the roster, the count

**Files:**
- Modify: `src/courses/oop/gates.js` (append two arcs), `src/courses/oop/tests.js` (eight test strings)
- Create: `scripts/solutions/oop/arc2.py`, `scripts/solutions/oop/arc3.py`

**Interfaces:**
- Produces gate ids `roles`, `upline`, `stub`, `twoparents`, `sameorequal`, `inorder`, `countandreach`, `walkthebag`, referenced by lessons in plan 2.

- [ ] **Step 1: Arc II — The roster**

Arc header: `name: 'Arc II — The roster'`, `sub: 'Who was on the job, and what they are owed. Dax has a dict per person and an if per role.'`

| id | rank/xp | stat | algo | title | mission | tests | code? |
|---|---|---|---|---|---|---|---|
| `roles` | E/60 | kin | Inheritance and overriding | Roles on the roster | `class Member(name)` with `rate()` returning 10 and `cut(total)` returning `total * self.rate() // 100`. `class Driver(Member)` with `rate()` 15; `class Lookout(Member)` with `rate()` 5; neither redefines `cut`. `def payout(members, total)` returns a list of `(name, cut)` tuples in roster order. Stretch: add a fourth role without touching `cut` or `payout`. | `Member('m').rate()` → 10; `Driver('d').rate()` → 15; `Lookout('l').rate()` → 5; `Driver('d').cut(1000)` → 150 (the parent's `cut` uses the child's `rate`); `isinstance(Driver('d'), Member)` True; `payout([Member('m'), Driver('d')], 1000)` → `[('m', 100), ('d', 150)]`; `payout([], 5)` → `[]`. | yes |
| `upline` | E/70 | kin | super() | Call up the line | `class Member(name)` stores `name` and `jobs = []`; `log(job)` appends and returns the new count. `class Driver(Member)` takes `(name, vehicle)`, calls the parent `__init__` through `super()` and stores `vehicle`; its `log(job)` calls the parent `log` with `f"{job}:{self.vehicle}"` and returns what it returns. Stretch: a `Lookout(Member)` taking `(name, post)` whose `log` records `f"{job}@{post}"`, both `super()` calls one line each. | `Driver('d', 'van').name` → `'d'` (set by the parent); `.vehicle` → `'van'`; `.jobs` → `[]`; `log('run')` → 1; `.jobs` → `['run:van']`; second log → 2; `Member('m').log('x')` → 1 and `.jobs` → `['x']`. | no |
| `stub` | D/90 | kin | Abstract stubs | The empty chair | `class Role` with `describe()` raising `NotImplementedError`. `class Driver(Role)` describe → `'drives'`; `class Lookout(Role)` → `'watches'`. `def roster(roles)` returns the list of descriptions; `def count_roles(things)` returns how many items in a mixed list are `Role` instances. Stretch: make `Role` an `abc.ABC` with `describe` an `abstractmethod` so `Role()` itself cannot be built. | `_t_raises(lambda: Role().describe())` → `'NotImplementedError'`; `Driver().describe()` → `'drives'`; `Lookout().describe()` → `'watches'`; `roster([Driver(), Lookout(), Driver()])` → `['drives', 'watches', 'drives']`; `count_roles([Driver(), 'x', Lookout(), 3, None])` → 2; `issubclass(Driver, Role)` True; `count_roles([])` → 0. | yes |
| `twoparents` | D/100 | kin | Multiple inheritance and MRO | Two parents | `class Member(name)` with `who()` returning `name`. `class Wheels` with `who()` returning `super().who() + ', wheels'`; `class Armed` with `who()` returning `super().who() + ', armed'`. `class Driver(Wheels, Member)`; `class Heavy(Armed, Wheels, Member)`. Stretch: add a third mixin, predict `Heavy.__mro__` before running, then check. | `Member('m').who()` → `'m'`; `Driver('d').who()` → `'d, wheels'`; `Heavy('h').who()` → `'h, wheels, armed'`; `[c.__name__ for c in Heavy.__mro__]` → `['Heavy', 'Armed', 'Wheels', 'Member', 'object']`; `isinstance(Heavy('h'), Wheels)` True; `isinstance(Driver('d'), Armed)` False; `Heavy('h').name` → `'h'`. | no |

Story beats: `roles` — the fence pays by role; Dax has `if role == 'driver'` in three places; Marguerite: “Each role knows its own rate. The cut is the same sum for everyone.” `upline` — Dax copies `Member.__init__` into `Driver` and the two drift; Marguerite: “Do not copy the parent. Call up the line.” `stub` — an empty chair at the table for a role nobody has filled; Dax returns `None`; Marguerite: “An empty chair should shout when someone sits in it.” `twoparents` — Heavy is armed and drives; Dax writes the `who()` text by hand for every combination; Marguerite: “Stack the parts. Python decides the order, and it will tell you what it decided.”

- [ ] **Step 2: Arc III — The count**

Arc header: `name: 'Arc III — The count'`, `sub: 'Two torches are one line. The fence sorts by price and counts by hand; the manifest has to agree with her.'`

| id | rank/xp | stat | algo | title | mission | tests | code? |
|---|---|---|---|---|---|---|---|
| `sameorequal` | D/95 | protocol | Equality and hashing | Same or equal | `class Item(name, price)` with `__eq__` comparing `(name, price)` when the other side is an `Item` and returning `NotImplemented` otherwise, and `__hash__` as `hash((name, price))`. `def distinct(items)` returns how many different items are in the list. Stretch: keep `__eq__` but set `__hash__ = None` and see which of these tests break. | `Item('a', 1) == Item('a', 1)` True; `Item('a', 1) == Item('a', 2)` False; `Item('a', 1) == 'a'` False; `Item('a', 1) is Item('a', 1)` False; `len({Item('a', 1), Item('a', 1), Item('b', 1)})` → 2; `distinct([Item('a', 1), Item('a', 1), Item('b', 2)])` → 2; dict lookup with a fresh equal key (`{Item('a', 1): 'x'}[Item('a', 1)]` → `'x'`). | no |
| `inorder` | C/120 | protocol | Ordering | Put them in order | `class Item(name, price)` with `__eq__` and `__lt__` ordering by `price` then `name`; decorate with `functools.total_ordering` so `>`, `<=`, `>=` follow. `def by_price(items)` returns the names sorted; `def cheapest(items)` returns the cheapest item. Stretch: make `sorted(items, reverse=True)` keep equal prices in their original order. | `Item('a', 5) < Item('b', 7)` True; tie by name: `Item('a', 5) < Item('b', 5)` True; `Item('b', 7) > Item('a', 5)` True; `Item('a', 5) <= Item('a', 5)` True; `by_price([Item('x', 9), Item('y', 1), Item('z', 5)])` → `['y', 'z', 'x']`; `cheapest(...)` → `Item('y', 1)` compared by `.name`; `max([...]).name` → `'x'`. | no |
| `countandreach` | C/130 | protocol | Sequence protocol | Count and reach | `class Item(name, price)`; `class Bag` with `add(item)`, `__len__`, `__getitem__` accepting an int (negatives too) or a slice (returning a list), and `__contains__` that answers to an item name string. Stretch: make `for item in bag` work without writing `__iter__`, and say why it does. | `len(Bag())` → 0; len after three adds → 3; `bag[0].name` → first name; `bag[-1].name` → last; `len(bag[0:2])` → 2; `'torch' in bag` True; `'x' in bag` False; `_t_raises(lambda: bag[5])` → `'IndexError'`. | no |
| `walkthebag` | C/140 | protocol | Iteration protocol | Walk the bag | `class Bag` with `add(item)` and `__iter__` returning a `BagWalk`. `class BagWalk(items)` with `__iter__` returning `self` and `__next__` returning the next item's `name` in insertion order, raising `StopIteration` at the end. `def names(bag)` returns `list(bag)`. Stretch: rewrite `Bag.__iter__` as a generator with `yield` and delete `BagWalk`. | `list(Bag())` → `[]`; after adds → `['torch', 'cutter']`; two walks are independent (`_t_it = iter(bag); next(_t_it); list(_t_it)` → `['cutter']` while `list(bag)` still full); `_t_raises(lambda: next(iter(BagWalk([]))))` → `'StopIteration'`; `_t_w = iter(bag); iter(_t_w) is _t_w` True; `names(bag)` → same list; `sum(1 for _ in bag)` → 2. | no |

Story beats: `sameorequal` — two torches, two bags, one line on the manifest; Dax's `==` says two identical dicts are equal but a set of them has two members because he wrapped them in a class with no `__eq__`; Marguerite: “Same thing, or an equal thing? Decide, and tell the set.” `inorder` — the fence reads prices low to high; Dax passes `key=lambda i: i.price` everywhere and forgets it once; Marguerite: “If the item knows what comes before it, `sorted` needs nothing from you.” `countandreach` — `len(bag)` blows up on Dax's class; Marguerite: “A bag you cannot count is not a bag.” `walkthebag` — the fence walks the room, one item at a time; Dax exposes `bag.items` and someone mutates it; Marguerite: “Hand her a walker, not the shelf.”

- [ ] **Step 3: Solutions**

`scripts/solutions/oop/arc2.py` blocks `roles`, `upline`, `stub`, `twoparents`; `arc3.py` blocks `sameorequal`, `inorder`, `countandreach`, `walkthebag`. For `inorder`:
```python
import functools

@functools.total_ordering
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def __eq__(self, other):
        if not isinstance(other, Item): return NotImplemented
        return (self.price, self.name) == (other.price, other.name)
    def __lt__(self, other):
        if not isinstance(other, Item): return NotImplemented
        return (self.price, self.name) < (other.price, other.name)

def by_price(items):
    return [i.name for i in sorted(items)]

def cheapest(items):
    return min(items)
```

- [ ] **Step 4: Validate**

Run: `npm test && npm run check`
Expected: `✓ 110 gates, 146 training drills, …`; `✓ oop: 12 gates across 3 arcs look good`.

- [ ] **Step 5: Browser check**

Open `twoparents` and `walkthebag`: story renders with the spoken line styled, mission and hint show, reference solution passes, stats Kin and Protocol rise.

- [ ] **Step 6: Commit**

```bash
git add src/courses/oop scripts/solutions/oop
git commit -m "content(oop): Arcs II and III — the roster, the count

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Arcs IV and V — the handover, the Manifest; docs

**Files:**
- Modify: `src/courses/oop/gates.js` (append two arcs), `src/courses/oop/tests.js` (eight test strings), `CLAUDE.md` (one layout line)
- Create: `scripts/solutions/oop/arc4.py`, `scripts/solutions/oop/arc5.py`

**Interfaces:**
- Produces gate ids `guardedprice`, `fromline`, `frozenentry`, `sealedbag`, `typedfield`, `attributetrap`, `selfregister`, `manifest`, referenced by lessons in plans 2 and 3.

- [ ] **Step 1: Arc IV — The handover**

Arc header: `name: 'Arc IV — The handover'`, `sub: 'The fence signs for what she takes. Prices that guard themselves, entries that cannot be edited after.'`

| id | rank/xp | stat | algo | title | mission | tests | code? |
|---|---|---|---|---|---|---|---|
| `guardedprice` | C/125 | shape | Properties | The guarded price | `class Item(name, price)` where `price` is a property backed by `_price`: the setter raises `ValueError` for anything below zero, and `__init__` goes through the setter. A read-only property `label` returns `f"{name} @ {price}"`. Stretch: add `discount(pct)` that goes through the setter, so a discount past 100% is refused for free. | `Item('a', 5).price` → 5; set to 7 → 7; `_t_raises(lambda: setattr(_t_i, 'price', -1))` → `'ValueError'`; `_t_raises(lambda: Item('a', -3))` → `'ValueError'`; `Item('a', 5).label` → `'a @ 5'`; label follows a price change; `_t_raises(lambda: setattr(_t_i, 'label', 'x'))` → `'AttributeError'`. | no |
| `fromline` | B/160 | shape | classmethod and staticmethod | From one line | `class Item(name, price)` with `@staticmethod parse_price(text)` returning an `int` when the text has no dot and a `float` otherwise; `@classmethod from_line(cls, line)` building an instance from `"name,price"` (strip spaces around both); `@classmethod from_lines(cls, text)` returning a list from a multi-line string, skipping blank lines. `class Stolen(Item)` adds nothing. Stretch: raise `ValueError` with the offending line in the message for a line without a comma. | `Item.from_line('torch,5').name` → `'torch'`; `.price` → 5; `Item.parse_price('5')` → 5; `Item.parse_price('5.50')` → 5.5; `len(Item.from_lines('a,1\n\n b , 2 \n'))` → 2; second item's name → `'b'`; `type(Stolen.from_line('a,1')).__name__` → `'Stolen'`. | no |
| `frozenentry` | B/170 | shape | Dataclasses | The frozen entry | `@dataclass(frozen=True, order=True) class Entry` with fields `price: int`, `name: str`, `tags: tuple = field(default_factory=tuple)`. `def total(entries)` sums prices. Stretch: add `qty: int = 1` and a `worth` property without breaking `order` or `frozen`. | `Entry(5, 'torch') == Entry(5, 'torch')` True; `sorted([Entry(9, 'x'), Entry(1, 'y')])[0].name` → `'y'`; `_t_raises(lambda: setattr(Entry(1, 'a'), 'price', 2))` → `'FrozenInstanceError'`; `len({Entry(1, 'a'), Entry(1, 'a')})` → 1; `repr(Entry(5, 'torch'))` → `"Entry(price=5, name='torch', tags=())"`; `Entry(1, 'a', ('hot',)).tags` → `('hot',)`; `total([Entry(1, 'a'), Entry(2, 'b')])` → 3. | no |
| `sealedbag` | B/180 | protocol | Context managers | The sealed bag | `class Bag` with `items` (list) and `sealed` (False). `add(item)` raises `RuntimeError` when sealed. `__enter__` returns the bag; `__exit__` sets `sealed = True` and returns `False` so any error inside the block still climbs out. Stretch: write the same with `contextlib.contextmanager` and a generator, and say which you would keep. | `Bag().sealed` False; inside `with Bag() as _t_b:` adds work and `_t_b.sealed` is False (check via a helper that returns the flag from inside); after the block `sealed` True; `add` after → `_t_raises` → `'RuntimeError'`; items kept after sealing; an error inside the block both seals and propagates (helper: `try: with Bag() as b: raise ValueError` / `except ValueError: return b.sealed` → True); `Bag().__exit__(None, None, None)` → False. | no |

Story beats: `guardedprice` — Dax types a minus by mistake and the manifest pays the fence; Marguerite: “The price checks itself at the door. Nobody remembers to check it later.” `fromline` — the fence sends the list as text over the phone; Dax parses it in six places; Marguerite: “Give the class its own door for text. `Item.from_line`, and the class it makes is whichever class you asked.” `frozenentry` — an entry that changed after signing cost the crew a friend once; Marguerite: “Write it once. Freeze it. Let Python write the boring parts.” `sealedbag` — the bag gets zipped when the fence walks out, no matter how the meeting ended; Marguerite: “Open, do the work, and the close happens whether or not you remembered it.”

- [ ] **Step 2: Arc V — The Manifest**

Arc header: `name: 'Arc V — The Manifest'`, `sub: 'The last pass. Fields that guard themselves, kinds that sign themselves in, and one book the fence will sign.'`

| id | rank/xp | stat | algo | title | mission | tests | code? |
|---|---|---|---|---|---|---|---|
| `typedfield` | A/200 | protocol | Descriptors | The gatekeeper | `class Positive` with `__set_name__(self, owner, name)` storing `'_' + name`, `__get__(self, obj, owner)` returning the stored value (or `self` when `obj` is `None`), and `__set__(self, obj, value)` raising `ValueError` unless `value > 0`. `class Entry` with `price = Positive()`, `qty = Positive()` and `__init__(price, qty)`. Stretch: a `Typed(kind)` gatekeeper that checks `isinstance`, sharing a base with `Positive`. | `Entry(5, 2).price` → 5; `.qty` → 2; `_t_raises(lambda: setattr(Entry(5, 2), 'price', 0))` → `'ValueError'`; `_t_raises(lambda: Entry(-1, 1))` → `'ValueError'`; two entries independent; `type(Entry.price).__name__` → `'Positive'`; `'_price' in vars(Entry(5, 2))` True. | no |
| `attributetrap` | A/220 | protocol | Attribute hooks | The attribute trap | `class Record(**fields)` keeps `_data` (dict) and `_log` (list), both set with `object.__setattr__`. `__getattr__(name)` returns `_data[name]` or raises `AttributeError(f"no field {name!r}")`; `__setattr__(name, value)` writes into `_data` and appends `(name, value)` to `_log`. `changes()` returns the log. Stretch: `__delattr__` that logs `(name, None)` and removes the key. | `Record(name='torch').name` → `'torch'`; `_t_raises(lambda: Record().zzz)` → `'AttributeError'`; set then read → 5; `changes()` → `[('price', 5)]`; `hasattr(Record(), 'zzz')` False; `Record(a=1)._data` → `{'a': 1}`; two records keep separate logs. | no |
| `selfregister` | A/240 | kin | init_subclass registries | Kinds that sign themselves in | `class Entry` with class attribute `kinds = {}` and `__init_subclass__(cls, kind=None, **kw)` that calls `super().__init_subclass__(**kw)` and registers `cls` under `kind` or `cls.__name__.lower()`. `@classmethod build(cls, kind, *args)` constructs from the registry, `KeyError` for an unknown kind. In your code define `class Cash(Entry)` and `class Gem(Entry, kind='stone')`, each with `__init__(self, amount)` storing `amount`. Stretch: do it again with a metaclass `__new__`, then say which one you would ship. | `Entry.kinds['cash'] is Cash` True; `Entry.kinds['stone'] is Gem` True; `'entry' in Entry.kinds` False; `type(Entry.build('cash', 5)).__name__` → `'Cash'`; `Entry.build('stone', 1).amount` → 1; `_t_raises(lambda: Entry.build('air'))` → `'KeyError'`; a class the tests define (`class _t_Bond(Entry): ...`) appears as `'_t_bond'`; a grandchild (`class _t_Note(Cash): ...`) registers too. | no |
| `manifest` | S/300 | shape | Combining the object model | The manifest | `class Positive` (as in `typedfield`). `class Line(name, price, qty)` with `price = Positive()`, `qty = Positive()`, a `worth` property (`price * qty`), `__eq__`/`__hash__` on `(name, price, qty)` and `__repr__` `Line('torch', 5, 2)`. `class Manifest` with `add(line)` (raises `RuntimeError` once sealed), `__len__`, `__getitem__`, `__iter__`, `__contains__` by name, `total()` (sum of worths), `__enter__`/`__exit__` sealing on exit, and `@classmethod from_lines(cls, text)` parsing `"name,price,qty"` lines, skipping blanks. Stretch: a `__repr__` on `Manifest` that round-trips through `eval`. | `len(Manifest.from_lines('torch,5,2\ncutter,10,1'))` → 2; `.total()` → 20; `[l.name for l in m]` → `['torch', 'cutter']`; `'torch' in m` True; `m[0].worth` → 10; `_t_raises(lambda: Line('a', 0, 1))` → `'ValueError'`; `with` seals (`m.sealed` True after); `_t_raises(lambda: m.add(Line('x', 1, 1)))` → `'RuntimeError'` after sealing; `len({Line('a', 1, 1), Line('a', 1, 1)})` → 1; `repr(Line('torch', 5, 2))` → `"Line('torch', 5, 2)"`. | no |

Story beats: `typedfield` — Dax writes the same negative-check in four setters; Marguerite: “One gatekeeper, hired once, stands at every door you name.” `attributetrap` — the fence's records have fields nobody planned for; Dax reaches for `record['whatever']`; Marguerite: “Let the dot fall through to the dict, and log every hand that writes.” `selfregister` — new kinds of loot every week, and Dax updates a dict by hand and forgets one; Marguerite: “A kind signs itself in the moment it is defined. The book is never edited by hand.” `manifest` — the fence sits down with a pen; Marguerite: “Everything you have built, in one book. She counts it, walks it, sorts it, and when she stands up it is sealed.”

- [ ] **Step 3: Solutions**

`scripts/solutions/oop/arc4.py` blocks `guardedprice`, `fromline`, `frozenentry`, `sealedbag`; `arc5.py` blocks `typedfield`, `attributetrap`, `selfregister`, `manifest`. For `selfregister`:
```python
class Entry:
    kinds = {}
    def __init_subclass__(cls, kind=None, **kw):
        super().__init_subclass__(**kw)
        Entry.kinds[kind or cls.__name__.lower()] = cls
    @classmethod
    def build(cls, kind, *args):
        return cls.kinds[kind](*args)

class Cash(Entry):
    def __init__(self, amount): self.amount = amount

class Gem(Entry, kind='stone'):
    def __init__(self, amount): self.amount = amount
```
For `attributetrap`, `__getattr__` must not recurse: read `_data` through `object.__getattribute__(self, '_data')` or rely on `_data` being in `__dict__` (it is, because `object.__setattr__` put it there), and guard names starting with `_` by raising `AttributeError` at once.

- [ ] **Step 4: CLAUDE.md layout line**

Under the Layout section, after the `src/courses/patterns/` bullet, add:
```
- `src/courses/oop/` — the object-oriented Python course "The Manifest": same layout as patterns. Stats `shape`, `kin`, `protocol`. No `scene` anywhere. Six tools: dict, function, tuple, decorator, exception, type. Reference solutions in `scripts/solutions/oop/`. Lessons arrive in plans 2 and 3 of the OOP spec.
```
(The story paragraph and the per-course prose rule land in plan 3 with the lessons.)

- [ ] **Step 5: Validate**

Run: `npm test && npm run check && npm run build`
Expected: `✓ 118 gates, 146 training drills, …`; `✓ oop: 20 gates across 5 arcs look good`; `✓ 118 gates across 3 course(s)`; `✓ 62 training nodes and 24 tools across 3 course(s) look good`. Build ok.

- [ ] **Step 6: Browser check**

`npm run preview` on the build. Fresh slot → Jobs → The Manifest: five arcs, twenty gates, only Arc I open. Clear `tag` with the reference solution: `worth` unlocks, title moves off Nobody at the right count. Open `manifest` (force by clearing through, or read-only): story and mission render, code area accepts the reference solution and passes. Switch to The Blueprint, then The Ledger, reload: all three blocks intact. Network panel shows no three.js chunk while in The Manifest.

- [ ] **Step 7: Commit and merge**

```bash
git add src/courses/oop scripts/solutions/oop CLAUDE.md
git commit -m "content(oop): Arcs IV and V — the handover, the Manifest; docs

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
Then follow superpowers:finishing-a-development-branch to merge `oop-kit-heist` into `main`.

---

## Self-review

- **Spec coverage.** Card, titles, tier blurbs, course blurbs: Task 1. Registry order: Task 1. Twenty gates with the spec's ids, ranks, stats, titles, algos: Tasks 1, 3, 4. Six tools with the spec's ids, titles, algos and drill topics: Tasks 1, 2. Reference solutions: every task. `tests/training-tools.test.mjs` and `tests/courses.test.mjs`: Task 1. CLAUDE.md layout line: Task 4; story paragraph and prose rule deferred to plan 3 as the spec's rollout says. No-scene rule: enforced by the extended registry test.
- **Rank bands.** Arc I F/40–50; Arc II E 60, 70 then D 90, 100; Arc III D 95 then C 120, 130, 140; Arc IV C 125 then B 160, 170, 180; Arc V A 200, 220, 240 then S 300. Each arc spans at most two adjacent ranks and rises.
- **Consecutive techniques.** No two neighbouring gates share an `algo`.
- **Type consistency.** `_t_raises` defined per test string that uses it. `Item(name, price)` is redefined per gate; gates are independent namespaces, so the shape may differ (`worth` adds `qty`). `Positive` appears in `typedfield` and again in `manifest` with the same three methods.
- **Expected counts.** Baseline 98/140/62/18 → Task 1: 102 gates, 141 drills, 19 tools → Task 2: 146 drills, 24 tools → Task 3: 110 gates → Task 4: 118 gates.
