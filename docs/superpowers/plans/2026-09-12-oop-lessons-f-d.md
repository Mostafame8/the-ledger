# The Manifest — plan 2: lessons F–D — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the oop course its first eleven lessons (five F, three E, three D), each proven by reference solutions, so The Manifest's training room has tier tabs F, E and D and every armoury tool is required by at least one lesson.

**Architecture:** One file per lesson in `src/courses/oop/training/`, listed in `training/index.js`; step constructors from `src/training/node.js`. No shell or validator changes. The `if (!NODES.length) continue` skip in `tests/training-tools.test.mjs` stops applying to oop once it has lessons, so the "every tool is required" test goes live for oop after Task 1 and must pass by the end of Task 3 (plan 3 deletes the skip). Reference solutions go in `scripts/solutions/oop/training/<lesson-id>.py`.

**Tech Stack:** Plain JS content modules, Python 3 for drills and reference solutions.

**Spec:** `docs/superpowers/specs/2026-09-12-oop-course-design.md` (sections "Lessons (18)", "Prose rule for this course")

## Global Constraints

- Node schema: `node(id, { tier, xp, requires, gates, tools, title, algo, steps })`; steps in order `explain, explain, trace, spot, blank, mini`. Ids lowercase kebab, unique within the course (no collision with gate or tool ids; never `method`).
- xp by tier: F 40–60, E 60–80, D 90–100.
- `requires` lists lesson ids in this course; `gates` lists at least one gate id from `src/courses/oop/gates.js`; `tools` at most two `tool-*` ids from the oop armoury (`tool-dict`, `tool-function`, `tool-tuple`, `tool-decorator`, `tool-exception`, `tool-type`).
- Content order: explain 1 is Dax's dict-and-tuple version (move `brute force`), explain 2 the shape with a `code` block (move `pick the pattern` or `name the waste`), then trace, spot, blank, mini. Explain steps 2–5 lines; at least one line starts with `“`.
- Prose rule: explain lines, the blank intro, the mini mission and hint never use the textbook nouns: inheritance, inherit, polymorphism, encapsulation, descriptor, metaclass, method resolution order, MRO, protocol, dunder, magic method, abstract. Python syntax words are code and allowed anywhere (`class`, `self`, `super()`, `__init__`, `__eq__`, `@property`, `isinstance`, `__mro__`). Only `algo`, spot options and a spot's `problem`/`why` may use the nouns.
- No `scene` anywhere (the registry test enforces it).
- Trace: 3+ frames `{ line, state, ask, note }`, `line` 1-based into `code`, `ask` a key of `state`; object values as `{ py: "Item('torch', 5)" }` only when the code defines a matching `__repr__`, tuples as `{ py: '(1, 2)' }`; lists, dicts, strings, ints, bools as JS literals.
- Spot: 3–4 options, `answer` an index, `why` names the trap.
- Blank: `___` markers, 4–7 `check(` calls. Mini: mission names a function or method with parentheses, 4–7 checks. Test helper names start with `_t_`. To assert an error, define `_t_raises(fn)` at the top of that test string (returns the exception class name).
- Reference solutions: `scripts/solutions/oop/training/<lesson-id>.py`, blocks `# === <lesson-id>/4` (blank) and `# === <lesson-id>/5` (mini).
- Voice: Marguerite teaches, Dax keeps everything in dicts, the room above the laundromat, the fence when useful. Short, wry, concrete. No real anime, manga or game references.
- `npm test`, `npm run check`, `npm run build` green at the end of every task except where a task notes the tool-required test as expected red. Baseline: 118 gates, 146 drills, 62 nodes, 24 tools.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Branch `oop-lessons-f-d` off `main`.

---

## File structure

| Path | Responsibility |
|---|---|
| `src/courses/oop/training/<id>.js` × 11 | One lesson each. |
| `src/courses/oop/training/index.js` | Imports the lessons, `NODES` in display order (F to D, prerequisite order within a tier), `NODE_BY_ID`. |
| `scripts/solutions/oop/training/<id>.py` × 11 | Reference solutions for blank and mini. |

## The lesson graph (this plan)

| id | tier/xp | requires | gates | tools | title | algo |
|---|---|---|---|---|---|---|
| `the-stamped-tag` | F/40 | — | tag | tool-dict | The stamped tag | Classes and instances |
| `the-tags-own-moves` | F/45 | the-stamped-tag | worth | tool-function | The tag's own moves | Methods and self |
| `reading-it-back` | F/50 | the-stamped-tag | readback | tool-function | Reading it back | repr and str |
| `shared-ink-own-name` | F/50 | the-stamped-tag | sharedink | tool-dict | Shared ink, own name | Class vs instance attributes |
| `the-guarded-field` | F/55 | the-tags-own-moves | guardedprice | tool-decorator | The guarded field | Properties |
| `the-family-line` | E/60 | the-tags-own-moves | roles | tool-exception | The family line | Inheritance and overriding |
| `call-up-the-line` | E/70 | the-family-line | upline, stub | tool-function | Call up the line | super() |
| `two-parents` | E/80 | call-up-the-line | twoparents | tool-type | Two parents | Multiple inheritance and MRO |
| `same-or-equal` | D/90 | reading-it-back | sameorequal | tool-dict | Same or equal | Equality and hashing |
| `put-them-in-order` | D/95 | same-or-equal | inorder | tool-tuple | Put them in order | Ordering |
| `count-and-reach` | D/100 | the-tags-own-moves | countandreach | tool-tuple | Count and reach | Sequence protocol |

After this plan every tool is required by at least one lesson (dict 3, function 3, decorator 1, exception 1, type 1, tuple 2), so the live "every tool is required" test passes for oop at the end of Task 3. It is red after Tasks 1 and 2 (tuple, exception, type not yet listed); those tasks note it.

`training/index.js` after this plan:
```js
// Training content for the oop course, in display order: F to S, prerequisites first
// within a tier. Add a lesson file, import it, append it here.
import theStampedTag from './the-stamped-tag.js'
import theTagsOwnMoves from './the-tags-own-moves.js'
import readingItBack from './reading-it-back.js'
import sharedInkOwnName from './shared-ink-own-name.js'
import theGuardedField from './the-guarded-field.js'
import theFamilyLine from './the-family-line.js'
import callUpTheLine from './call-up-the-line.js'
import twoParents from './two-parents.js'
import sameOrEqual from './same-or-equal.js'
import putThemInOrder from './put-them-in-order.js'
import countAndReach from './count-and-reach.js'
export { TIERS } from '../../../training/progress.js'
export { TOOLS, TOOL_BY_ID } from './tools/index.js'

export const NODES = [
  theStampedTag, theTagsOwnMoves, readingItBack, sharedInkOwnName, theGuardedField,
  theFamilyLine, callUpTheLine, twoParents,
  sameOrEqual, putThemInOrder, countAndReach,
]
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
```

---

### Task 1: Tier F — from a dict to a thing

**Files:**
- Create: `src/courses/oop/training/the-stamped-tag.js`, `the-tags-own-moves.js`, `reading-it-back.js`, `shared-ink-own-name.js`, `the-guarded-field.js`
- Create: `scripts/solutions/oop/training/<same ids>.py`
- Modify: `src/courses/oop/training/index.js`

**Interfaces:**
- Produces lesson ids listed above; `the-stamped-tag`, `the-tags-own-moves` and `reading-it-back` are `requires` targets for Tasks 2 and 3.

- [ ] **Step 1: Branch** `git checkout main && git checkout -b oop-lessons-f-d`.

- [ ] **Step 2: Write the five lesson files.** Shape follows `src/courses/patterns/training/one-job.js`. Content per lesson:

**`the-stamped-tag`** (Classes and instances, gate `tag`, tool-dict)
- Explain 1 (brute force): Dax has `{'name': 'torch', 'price': 5}` per item and a `make_item(name, price)` function; three places build the dict by hand instead and one spells `'pric'`. Marguerite: “Every item built the same way, by the same hands, or the keys are your problem forever.”
- Explain 2 (pick the pattern, code): a `class Item` with `__init__(self, name, price)`; `Item('torch', 5)` stamps a new one; `self` is the tag in your hand; the dot reaches the fields. Code:
  ```python
  class Item:
      def __init__(self, name, price):
          self.name = name
          self.price = price

  a = Item('torch', 5)
  b = Item('cutter', 10)
  a.name            # 'torch'
  b.price           # 10
  a.price = 6       # only a changes
  vars(a)           # {'name': 'torch', 'price': 6}
  ```
- Trace: the class (lines 1–4) plus `def restock(item, n):` / `item.price = item.price + n` / `return item.price` (lines 6–8), input `restock(Item('torch', 5), 2)`; frames: line 3 `name` → `'torch'` (note: `__init__` runs on a fresh, empty object; each line writes one field); line 4 `fields` → `{ name: 'torch', price: 5 }` ask `fields`; line 7 `price` → 7 (note: read the field, add, write it back on the same object); line 8 `returns` → 7.
- Spot: “Dax writes `class Item: name = ''; price = 0` with no `__init__` and sets `Item.price = 5` for the torch. What happens to the cutter?” Options: “Nothing, each Item has its own price” / “Every Item now says 5, because the field lives on the class, not on the instance” (answer, index 1) / “A TypeError” / “The cutter keeps 0 because it was made first”. Why: fields written on the class are shared; `__init__` writing `self.price` is what gives each instance its own.
- Blank: intro “Stamp the tag. Two fields in `__init__`.” Template:
  ```python
  class Item:
      def __init__(self, name, price):
          ___
          ___
  ```
  Checks: `Item('torch', 5).name`; `.price`; two items independent after a change; `vars(Item('a', 1))` → `{'name': 'a', 'price': 1}`; `type(Item('a', 1)).__name__`; `check("Item('a', 1) is Item('a', 1)", False)`.
- Mini: “Write `class Route(start, end, minutes)` storing the three fields, and `longest(routes)` returning the route with the most minutes.” Hint: three assignments in `__init__`; `max` with `key=lambda r: r.minutes`. Checks: fields; `longest` picks the right one (compare `.start`); `longest` of one; ties keep the first; a changed `minutes` moves the answer; `len(vars(Route('a', 'b', 1)))` → 3.

**`the-tags-own-moves`** (Methods and self, gate `worth`, tool-function)
- Explain 1: Dax has `worth(item)` and `label(item)` as loose functions in a utils file; when `Item` gains `qty`, three copies of `worth` disagree. Marguerite: “A move that only makes sense with an item belongs to the item.”
- Explain 2 (code): methods are functions defined in the class; `item.worth()` is `Item.worth(item)`; `self` is the first seat; returning `self` lets calls chain. Code:
  ```python
  class Item:
      def __init__(self, name, price, qty=1):
          self.name = name
          self.price = price
          self.qty = qty
      def worth(self):
          return self.price * self.qty
      def restock(self, n):
          self.qty += n
          return self

  i = Item('torch', 5, 2)
  i.worth()             # 10
  i.restock(3).worth()  # 25
  Item.worth(i)         # 25, the same call spelled long
  ```
- Trace: the class (lines 1–10), input `Item('torch', 5, 2).restock(3).worth()`; frames: line 9 `qty` → 5; line 10 `returns_self` → true ask `returns_self` (note: returning self lets the next call chain; without it `.worth()` would run on None); line 7 `returns` → 25.
- Spot: “Dax writes `def worth(): return price * qty` inside the class, no `self`. Calling `i.worth()` gives…” Options: “25” / “TypeError: worth() takes 0 positional arguments but 1 was given, because the instance is always passed first” (answer, 1) / “NameError only” / “0”. Why: the instance is always handed in as the first argument; a method needs a seat for it.
- Blank: intro “Give the bag its moves: `add` returns the bag, `total` asks each item.” Template:
  ```python
  class Bag:
      def __init__(self):
          self.items = []
      def add(self, item):
          self.items.append(item)
          return ___
      def total(self):
          return sum(___ for i in self.items)
  ```
  Tests define `class _t_I:` with `__init__(self, w)` and `worth()` returning `self.w`. Checks: `Bag().total()` → 0; chained adds total; `add` returns the bag (`type(Bag().add(_t_I(1))).__name__` → `'Bag'`); `len(bag.items)` → 2; `total` after a third add; an item's `w` changing later changes the total.
- Mini: “Write `class Counter(start=0)` with `tick()` adding one and returning `self`, `reset()` setting the count back to `start` and returning `self`, and `value()` returning the count.” Hint: store `start` and `n`; every mutating method returns `self`. Checks: `Counter().value()` → 0; three ticks chained → 3; reset returns to start; `Counter(5).tick().value()` → 6; reset after ticks → 5; two counters independent.

**`reading-it-back`** (repr and str, gate `readback`, tool-function)
- Explain 1: Dax debugs a list of `<Item object at 0x7f…>`; his fix is a `show(item)` function he forgets to call. Marguerite: “Python already asks the object how to print itself. Answer it.”
- Explain 2 (code): `__repr__` is for us, exact, ideally `eval`-able; `__str__` is for her, plain; `print` and f-strings use `str`, containers use `repr`; if only `__repr__` is defined, `str` falls back to it. Code:
  ```python
  class Item:
      def __init__(self, name, price):
          self.name = name
          self.price = price
      def __repr__(self):
          return f"Item({self.name!r}, {self.price})"
      def __str__(self):
          return f"{self.name} @ {self.price}"

  i = Item('torch', 5)
  repr(i)           # "Item('torch', 5)"
  str(i)            # 'torch @ 5'
  [i]               # [Item('torch', 5)]
  print(i)          # torch @ 5
  ```
- Trace: the class (lines 1–8) plus `def line(items):` / `return ', '.join(str(i) for i in items)` (lines 10–11), input `line([Item('a', 1), Item("b's", 2)])`; frames: line 8 `returns` → `'a @ 1'` (note: `str()` reaches for `__str__`); line 8 `returns` → `"b's @ 2"`; line 11 `returns` → `"a @ 1, b's @ 2"`; line 6 `repr_b` → `"Item(\"b's\", 2)"` ask `repr_b` (note: `!r` picks quotes that survive the apostrophe; containers would show this form).
- Spot: “Dax defines only `__str__`. He prints a list of three items and sees `[<Item object at …>, …]`. Why?” Options: “Lists call repr on their members, and no `__repr__` was written” (answer, 0) / “`__str__` needs a decorator” / “Lists cannot hold objects” / “print ignores `__str__`”. Why: containers show members with `repr`; define `__repr__` first and `str` follows.
- Blank: intro “Two readings. Exact for us, plain for the fence.” Template: `class Tag(name, serial)` with `__repr__` and `__str__` return lines blanked; repr `Tag('torch', 'HB001')`, str `HB001 torch`. Checks: repr; str; `eval(repr(...)).serial`; repr in a list; `f"{tag}"`; repr with a quote in the name.
- Mini: “Write `class Money(pence)` with `__repr__` returning `Money(250)`, `__str__` returning `£2.50` (pounds, two decimals), and `add(other)` returning a new `Money`.” Hint: `f"£{self.pence // 100}.{self.pence % 100:02d}"`; `add` builds a fresh object. Checks: repr; str of 250; str of 5 → `'£0.05'`; `add` sums; `add` leaves both originals unchanged; `str(Money(1000))` → `'£10.00'`.

**`shared-ink-own-name`** (Class vs instance attributes, gate `sharedink`, tool-dict)
- Explain 1: Dax keeps `made = 0` at module level and `Tag.__init__` does `global made`; a second module imports Tag and gets a second counter. Marguerite: “The count belongs to the class. Put it where the class is.”
- Explain 2 (code): a name assigned in the class body lives on the class and is shared; `self.x = …` lives on the instance; reading `self.x` looks at the instance first, then the class; `Tag.made += 1` moves the shared one, `self.made += 1` would create a private copy. Code:
  ```python
  class Tag:
      made = 0
      prefix = 'HB'
      def __init__(self, name):
          self.name = name
          Tag.made += 1
          self.serial = f"{self.prefix}{Tag.made:03d}"

  a = Tag('torch'); b = Tag('cutter')
  a.serial, b.serial      # ('HB001', 'HB002')
  a.made, Tag.made        # (2, 2), the same number read two ways
  vars(a)                 # {'name': 'torch', 'serial': 'HB001'}
  b.prefix = 'X'          # only b now has its own prefix
  Tag('c').serial         # 'HB003'
  ```
- Trace: the class (lines 1–7) plus `Tag.made = 0` / `a = Tag('a')` / `b = Tag('b')` (lines 9–11), input `(a.serial, b.serial, Tag.made)`; frames: line 6 `made` → 1; line 7 `serial` → `'HB001'`; line 6 `made` → 2; line 7 `serial` → `'HB002'`; line 11 `returns` → `{ py: "('HB001', 'HB002', 2)" }`.
- Spot: “Dax writes `self.made += 1` instead of `Tag.made += 1`. After two tags, `Tag.made` is…” Options: “2” / “0, because `self.made += 1` reads the class value then writes a new field on the instance” (answer, 1) / “1” / “AttributeError”. Why: augmented assignment on an instance reads through to the class but writes to the instance; the class never moves.
- Blank: intro “One pad, many tags.” Template: the class with `___` on the counter line and the serial line. Checks (tests reset `Tag.made = 0`): first serial; second serial; `Tag.made`; instance read of `made`; `'made' in vars(Tag('x'))` → False; two names.
- Mini: “Write `class Radio(freq)` with a class attribute `channels = {}`; each `Radio` registers `channels[freq] = self` when built; `clear()` is a method that empties the shared dict; and `on_air()` is a plain function returning `sorted(Radio.channels)`.” Hint: `Radio.channels[freq] = self` in `__init__`; `clear` touches `Radio.channels`, not `self.channels = {}`. Checks (tests call `Radio(0).clear()` first): registering two; `on_air()` sorted; same freq twice keeps the latest (`Radio.channels[7] is _t_second`); `clear` empties; `on_air()` after clear → `[]`; the dict is shared (`_t_a.channels is _t_b.channels`).

**`the-guarded-field`** (Properties, gate `guardedprice`, tool-decorator)
- Explain 1: Dax has `set_price(item, p)` that checks for negatives, and forty lines that write `item.price = -3` straight past it. Marguerite: “A check nobody has to remember to call is the only check that runs.”
- Explain 2 (code): `@property` turns a method into a read; `@price.setter` turns another into the write; the dot stays the same; `__init__` should write through the setter; a property with no setter is read-only. Code:
  ```python
  class Item:
      def __init__(self, name, price):
          self.name = name
          self.price = price          # goes through the setter
      @property
      def price(self):
          return self._price
      @price.setter
      def price(self, value):
          if value < 0:
              raise ValueError('price below zero')
          self._price = value
      @property
      def label(self):
          return f"{self.name} @ {self.price}"

  i = Item('torch', 5)
  i.price = 7          # setter runs
  i.price = -1         # ValueError
  i.label              # 'torch @ 7'
  i.label = 'x'        # AttributeError: can't set attribute
  ```
- Trace: the class (lines 1–15) plus `def mark_down(item, n):` / `item.price = item.price - n` / `return item.label` (lines 17–19), input `mark_down(Item('torch', 5), 2)`; frames: line 12 `_price` → 5 (note: `self.price = price` in `__init__` ran the setter; `_price` is where it landed); line 12 `_price` → 3 (note: the subtraction went through the same setter); line 19 `returns` → `'torch @ 3'`.
- Spot: “Dax writes `self._price = price` in `__init__` and keeps the setter. `Item('a', -3)` gives…” Options: “ValueError” / “An Item with price -3, because the check lives in the setter and `__init__` walked past it” (answer, 1) / “AttributeError” / “A price of 0”. Why: the guard only runs when the property is assigned; write `self.price = price` so birth goes through the door too.
- Blank: intro “Guard the field. Reads return it, writes check it.” Template: `class Item` with `___` for the getter's return, the setter's check, and the setter's write. Checks: get; set good; set negative raises (`_t_raises`); birth negative raises; `label`; label follows price.
- Mini: “Write `class Vault(capacity)` with a `load` property (starts 0) whose setter raises `ValueError` when the new load is below 0 or above `capacity`, a read-only `free` property returning `capacity - load`, and `put(n)` / `take(n)` that move `load` through the setter and return `self`.” Hint: `put` does `self.load = self.load + n`; the setter is the only place that checks. Checks: `free` at start; `put` then `load`; `take`; over capacity raises; below zero raises; `free` after moves; `free` is read-only (setattr raises AttributeError).

- [ ] **Step 3: Write the five solution files.** Each `scripts/solutions/oop/training/<id>.py` with blocks `# === <id>/4` and `# === <id>/5`: filled templates and mini solutions.

- [ ] **Step 4: Register** the five in `training/index.js` in the order of the lesson graph.

- [ ] **Step 5: Validate and prove.** `npm run check` → `✓ 67 training nodes and 24 tools across 3 course(s) look good`; `node scripts/test-solutions.mjs` → `✓ 118 gates, 156 training drills, …`; `node --test "tests/*.test.mjs"` → only "every tool is required by at least one lesson" fails, naming `tool-tuple`, `tool-exception` or `tool-type` for oop (expected until Tasks 2–3).

- [ ] **Step 6: Prose check.** `grep -n -i -E "inherit|polymorph|encapsulat|descriptor|metaclass|resolution order|\bMRO\b|protocol|dunder|magic method|abstract" src/courses/oop/training/*.js` must match only `algo:` lines and spot steps.

- [ ] **Step 7: Browser check** `the-stamped-tag` end to end (tier tab F appears; the lesson opens once `tool-dict` is cleared; trace answers accept; blank and mini pass with the reference solutions; "Lesson cleared"; rank progress moves) and `the-guarded-field` shows `needs:` until `the-tags-own-moves` and `tool-decorator` are cleared.

- [ ] **Step 8: Commit** `content(oop): F-tier lessons — the stamped tag, its moves, reading it back, shared ink, the guarded field`.

---

### Task 2: Tier E — who inherits what

**Files:**
- Create: `src/courses/oop/training/the-family-line.js`, `call-up-the-line.js`, `two-parents.js`
- Create: `scripts/solutions/oop/training/<same ids>.py`
- Modify: `src/courses/oop/training/index.js`

**Interfaces:**
- Consumes lesson id `the-tags-own-moves` (Task 1). Produces `the-family-line`, `call-up-the-line`, `two-parents`.

- [ ] **Step 1: Write the three lesson files.**

**`the-family-line`** (Inheritance and overriding, gate `roles`, tool-exception)
- Explain 1: Dax has `Member` and a copy called `Driver` with the same twelve lines and one number changed; `cut` gets a rounding fix and `Driver` does not. Marguerite: “A driver is a member. Say so once, and change only what differs.”
- Explain 2 (code): `class Driver(Member)` puts Member behind Driver; anything Driver does not define is looked up on Member; a method defined again in the child replaces the parent's for that child; a parent method that calls `self.rate()` reaches the child's version; `isinstance` follows the line; `class Sealed(RuntimeError)` from the armoury was the same move. Code:
  ```python
  class Member:
      def __init__(self, name):
          self.name = name
      def rate(self):
          return 10
      def cut(self, total):
          return total * self.rate() // 100

  class Driver(Member):
      def rate(self):
          return 15

  Driver('dax').cut(1000)           # 150: cut is Member's, rate is Driver's
  isinstance(Driver('dax'), Member) # True
  ```
- Trace: lines 1–11 above plus `c = Driver('dax').cut(1000)` (line 13), input `c`; frames: line 3 `name` → `'dax'` (note: Driver has no `__init__`, so Member's runs on the Driver); line 7 `rate` → 15 ask `rate` (note: `self` is a Driver, so `self.rate()` finds the child's method first); line 13 `c` → 150.
- Spot: “Dax makes `Driver` by copying `Member` and changing `rate`. Later `cut` gains `round()`. Which is true?” Options: “Both classes get the fix” / “Only Member gets it; Driver's copy still truncates, and nothing tells you” (answer, 1) / “Python warns about the duplicate” / “Driver breaks with TypeError”. Why: copies drift silently; with `class Driver(Member)` there is one `cut`.
- Blank: intro “One parent, two children, one `describe` each.” Template: `class Guard` with `__init__(name)`, `greet()` returning `f"{self.name}: {self.describe()}"`, `describe()` returning `'stands'`; `class Runner(___)` with `describe` returning `'runs'`; `class Watcher(___)` with `describe` returning `'watches'`. Checks: `Runner('r').greet()` → `'r: runs'`; `Watcher('w').greet()`; `Guard('g').greet()` → `'g: stands'`; `isinstance(Runner('r'), Guard)`; `Runner('r').name`; `issubclass(Watcher, Guard)`.
- Mini: “Write `class Fee(amount)` with `charge(total)` returning `total + amount`, `class Percent(Fee)` whose `charge(total)` returns `total + total * amount // 100`, and `apply(fees, total)` running every fee in order.” Hint: only `charge` differs; `apply` loops and reassigns `total`. Checks: `Fee(5).charge(100)` → 105; `Percent(10).charge(100)` → 110; `apply([Fee(5), Percent(10)], 100)` → 115; `apply([], 7)` → 7; `isinstance(Percent(1), Fee)`; `apply([Percent(50), Percent(50)], 100)` → 225.

**`call-up-the-line`** (super(), gates `upline`, `stub`, tool-function)
- Explain 1: Dax's `Driver.__init__` re-does everything `Member.__init__` does, plus one field; Member gains `jobs = []` and Drivers crash on `.jobs`. Marguerite: “Do your part. For the rest, call up the line.”
- Explain 2 (code): `super().__init__(name)` runs the parent's version on this same `self`; works for any method; the parent can leave a stub that raises `NotImplementedError` so a child that forgets is told at once. Code:
  ```python
  class Member:
      def __init__(self, name):
          self.name = name
          self.jobs = []
      def log(self, job):
          self.jobs.append(job)
          return len(self.jobs)
      def describe(self):
          raise NotImplementedError

  class Driver(Member):
      def __init__(self, name, vehicle):
          super().__init__(name)
          self.vehicle = vehicle
      def log(self, job):
          return super().log(f"{job}:{self.vehicle}")
      def describe(self):
          return 'drives'

  d = Driver('dax', 'van')
  d.jobs                 # [] — the parent wrote it
  d.log('run')           # 1
  d.jobs                 # ['run:van']
  Member('m').describe() # NotImplementedError
  ```
- Trace: lines 1–18 above plus `n = Driver('dax', 'van').log('run')` (line 20), input `n`; frames: line 3 `name` → `'dax'` (note: `super().__init__` landed here, writing on the Driver); line 14 `vehicle` → `'van'`; line 6 `jobs` → `['run:van']` ask `jobs` (note: the child decorated the job, then handed it up; the parent's list is this object's list); line 20 `n` → 1.
- Spot: “Dax writes `Member.__init__(name)` inside `Driver.__init__` instead of `super().__init__(name)`. Result?” Options: “Works the same” / “TypeError: missing an argument; calling through the class hands nothing in, so you would have to write `Member.__init__(self, name)`, which is what `super()` does for you” (answer, 1) / “Infinite recursion” / “The Driver gets two names”. Why: `super()` binds the parent method to this instance; a bare class call does not.
- Blank: intro “Extend `__init__` and `log`, one `super()` each.” Template: the Driver class above with `___` on both `super()` lines. Checks: name from parent; vehicle; jobs empty; log returns 1; jobs content; second log 2.
- Mini: “Write `class Role(name)` storing `name`, with `describe()` raising `NotImplementedError`; `class Lookout(Role)` taking `(name, post)`, calling up for `name`, storing `post`, and `describe()` returning `f"watches {post}"`; and `roster(roles)` returning the descriptions.” Hint: `super().__init__(name)` then `self.post`; `roster` is a list comprehension. Checks: `Lookout('v', 'door').name`; `.describe()`; `roster([...])`; `Role('r').describe()` raises `NotImplementedError` (`_t_raises`); `isinstance(Lookout('v', 'd'), Role)`; `roster([])`.

**`two-parents`** (Multiple inheritance and MRO, gate `twoparents`, tool-type)
- Explain 1: Heavy drives and carries; Dax writes `who()` by hand for Driver, Armed, ArmedDriver, and a fourth that is Armed first. Marguerite: “Stack the parts and let Python chain them.”
- Explain 2 (code): a small class with only a `who()` that does its bit and calls `super().who()` is a part; list parts before the base; `super()` means "the next class in this object's `__mro__`", not "my parent"; read `Heavy.__mro__` to see the order. Code:
  ```python
  class Member:
      def __init__(self, name): self.name = name
      def who(self): return self.name

  class Wheels:
      def who(self): return super().who() + ', wheels'

  class Armed:
      def who(self): return super().who() + ', armed'

  class Heavy(Armed, Wheels, Member): pass

  Heavy('h').who()                     # 'h, wheels, armed'
  [c.__name__ for c in Heavy.__mro__]  # ['Heavy', 'Armed', 'Wheels', 'Member', 'object']
  ```
- Trace: lines 1–11 above plus `w = Heavy('h').who()` (line 13), input `w`; frames: line 9 `next` → `'Wheels'` ask `next` (note: `super()` inside Armed looks past Armed in Heavy's `__mro__` and finds Wheels); line 6 `next` → `'Member'`; line 3 `returns` → `'h'`; line 6 `returns` → `'h, wheels'`; line 13 `w` → `'h, wheels, armed'`.
- Spot: “`class Heavy(Wheels, Armed, Member)` instead. `Heavy('h').who()` is…” Options: “`'h, wheels, armed'`, order does not matter” / “`'h, armed, wheels'`, because the chain runs in `__mro__` order and the first-listed part speaks last” (answer, 1) / “TypeError” / “`'h'`”. Why: the MRO follows the listing left to right; each part appends after the ones behind it.
- Blank: intro “Two parts, one base. Each part adds its word and calls on.” Template: `Wheels.who` and `Armed.who` bodies blanked (`return ___ + ', wheels'`), `class Heavy(___): pass`. Tests define `class _t_Driver(Wheels, Member): pass`. Checks: `Heavy('h').who()`; `_t_Driver('d').who()`; `Member('m').who()`; `__mro__` names; `isinstance(Heavy('h'), Armed)`; `type(Heavy('h')).__name__`.
- Mini: “Write `class Base` with `tags()` returning `[]`; parts `Loud`, `Fast`, `Quiet`, each with `tags()` returning `super().tags() + ['loud']` (and `'fast'`, `'quiet'`); and `build(*parts)` returning `type('Rig', parts + (Base,), {})().tags()`.” Hint: `type(name, bases, dict)` makes a class the way `class` does; `parts` is already a tuple. Checks: `build(Loud, Fast)` → `['fast', 'loud']`; `build(Fast, Loud)` → `['loud', 'fast']`; `build()` → `[]`; `build(Quiet)` → `['quiet']`; `build(Loud, Fast, Quiet)` → `['quiet', 'fast', 'loud']`; `build(Loud) == build(Loud)`.

- [ ] **Step 2: Write the three solution files** and **register** the three lessons after the F tier in `index.js`.

- [ ] **Step 3: Validate and prove.** `npm run check` → `✓ 70 training nodes …`; proofs → `… 162 training drills …`; the tool-required test now names only `tool-tuple` for oop.

- [ ] **Step 4: Prose check** with the grep from Task 1; `two-parents` may say `__mro__` (code) but not "MRO" or "method resolution order" outside `algo` and the spot.

- [ ] **Step 5: Browser check** `the-family-line` and `two-parents`; tier tab E appears; E rows show `needs:` until the F prerequisites and tools are cleared.

- [ ] **Step 6: Commit** `content(oop): E-tier lessons — the family line, call up the line, two parents`.

---

### Task 3: Tier D — equal, ordered, counted

**Files:**
- Create: `src/courses/oop/training/same-or-equal.js`, `put-them-in-order.js`, `count-and-reach.js`
- Create: `scripts/solutions/oop/training/<same ids>.py`
- Modify: `src/courses/oop/training/index.js`

**Interfaces:**
- Consumes `reading-it-back`, `the-tags-own-moves` (Task 1). Produces `same-or-equal` (required by `put-them-in-order`), `put-them-in-order`, `count-and-reach`.

- [ ] **Step 1: Write the three lesson files.**

**`same-or-equal`** (Equality and hashing, gate `sameorequal`, tool-dict)
- Explain 1: Dax dedupes items with `set(items)` and gets every duplicate back; he writes `__eq__` and the set now refuses the items altogether. Marguerite: “Tell it what equal means, then tell it what hash means. The set asks both.”
- Explain 2 (code): default `==` is identity; `__eq__` decides; a set or dict key needs `__hash__` agreeing with `__eq__`; hash the same tuple you compare; return `NotImplemented` for foreign types so Python can try the other side; defining `__eq__` alone sets `__hash__` to None. Code:
  ```python
  class Item:
      def __init__(self, name, price):
          self.name = name
          self.price = price
      def __eq__(self, other):
          if not isinstance(other, Item):
              return NotImplemented
          return (self.name, self.price) == (other.name, other.price)
      def __hash__(self):
          return hash((self.name, self.price))

  Item('a', 1) == Item('a', 1)           # True
  Item('a', 1) is Item('a', 1)           # False
  len({Item('a', 1), Item('a', 1)})      # 1
  {Item('a', 1): 'x'}[Item('a', 1)]      # 'x'
  ```
- Trace: lines 1–10 above plus `n = len({Item('a', 1), Item('a', 1), Item('b', 1)})` (line 12), input `n`; frames: line 10 `same_hash` → true ask `same_hash` (note: the two `('a', 1)` items hash alike, so the set looks in one bucket); line 8 `returns` → true (note: same bucket, then `__eq__` confirms they are one entry); line 8 `returns` → false (note: `('a', 1)` against `('b', 1)`); line 12 `n` → 2.
- Spot: “Dax writes `__eq__` and no `__hash__`. `{Item('a', 1)}` gives…” Options: “A set of one” / “TypeError: unhashable type, because defining `__eq__` alone sets `__hash__` to None” (answer, 1) / “A set of two” / “Works, but lookups are slow”. Why: Python refuses to guess a hash for a class that redefined equality.
- Blank: intro “Equal by name and price. Hash the same pair.” Template: `__eq__` return line and `__hash__` return line blanked. Checks: equal; unequal; vs a string → False; set collapse; dict lookup with a fresh key; `Item('a', 1) != Item('a', 2)`.
- Mini: “Write `class Coord(x, y)` equal and hashable by `(x, y)`, with `__repr__` `Coord(1, 2)`, and `visited(path)` returning how many distinct coords a list holds.” Hint: the same three methods; `len(set(path))`. Checks: equality; hash collapse; `visited` count; repr; `Coord(1, 2) == (1, 2)` → False; a dict keyed by coords.

**`put-them-in-order`** (Ordering, gate `inorder`, tool-tuple)
- Explain 1: Dax passes `key=lambda i: (i.price, i.name)` to five sorts and two mins, and one of them says `i.pric`. Marguerite: “The item knows what comes before it. Say it once.”
- Explain 2 (code): `__lt__` is what `sorted`, `min`, `max` ask; compare tuples for a tie-break; `functools.total_ordering` fills `>`, `<=`, `>=` from `__eq__` and one other; return `NotImplemented` for foreign types. Code:
  ```python
  import functools

  @functools.total_ordering
  class Item:
      def __init__(self, name, price):
          self.name = name
          self.price = price
      def _key(self):
          return (self.price, self.name)
      def __eq__(self, other):
          return self._key() == other._key() if isinstance(other, Item) else NotImplemented
      def __lt__(self, other):
          return self._key() < other._key() if isinstance(other, Item) else NotImplemented

  sorted([Item('x', 9), Item('y', 1), Item('z', 1)])   # y, z, x
  Item('a', 5) >= Item('a', 5)                         # True, from total_ordering
  ```
- Trace: lines 1–13 above plus `c = min([Item('x', 9), Item('y', 1), Item('z', 1)]).name` (line 15), input `c`; frames: line 13 `keys` → `{ py: "((1, 'y'), (9, 'x'))" }` ask `keys` (note: `min` asks whether y comes before x); line 13 `returns` → true; line 13 `keys` → `{ py: "((1, 'z'), (1, 'y'))" }` (note: tie on price, so the second seat decides); line 13 `returns` → false; line 15 `c` → `'y'`.
- Spot: “Dax writes `__lt__` only, no `total_ordering`, no `__gt__`. `Item('b', 7) > Item('a', 5)` gives…” Options: “TypeError” / “True, because Python tries the reflected `Item('a', 5) < Item('b', 7)` when `__gt__` is missing” (answer, 1) / “False” / “NotImplemented”. Why: reflection covers `>` from `<`, but `>=` and `<=` still need their own or `total_ordering`.
- Blank: intro “Price first, then name. Two methods; the decorator writes the rest.” Template: `_key` return, `__lt__` body blanked, `@functools.___`. Checks: `<`; tie by name; `>`; `<=`; `sorted` names; `max`.
- Mini: “Write `@functools.total_ordering class Version(text)` parsing `'1.2.10'` into a tuple of ints in `parts`, ordered and equal by that tuple, with `__repr__` `Version('1.2.10')`; and `newest(versions)` returning the newest text.” Hint: `tuple(int(p) for p in text.split('.'))`; compare `parts`. Checks: `Version('1.2.10') > Version('1.2.9')`; equality; `sorted` order; `newest`; `Version('2') >= Version('1.9.9')`; repr.

**`count-and-reach`** (Sequence protocol, gate `countandreach`, tool-tuple)
- Explain 1: Dax's `Bag` has `.items` and everyone reaches in: `len(bag.items)`, `bag.items[0]`, `x in bag.items`. He renames `items` and forty lines break. Marguerite: “Answer the three questions yourself: how many, which one, is it here.”
- Explain 2 (code): `__len__` for `len()`, `__getitem__` for `bag[i]` and slices, `__contains__` for `in`; hand `__getitem__`'s argument straight to the inner list and `IndexError` and slices come free; with `__getitem__` alone, `for` works by counting from 0 until `IndexError`. Code:
  ```python
  class Bag:
      def __init__(self):
          self._items = []
      def add(self, item):
          self._items.append(item)
          return self
      def __len__(self):
          return len(self._items)
      def __getitem__(self, i):
          return self._items[i]
      def __contains__(self, name):
          return any(it.name == name for it in self._items)

  b = Bag().add(Item('torch', 5)).add(Item('cutter', 10))
  len(b)              # 2
  b[-1].name          # 'cutter'
  b[0:1]              # a list of one Item
  'torch' in b        # True
  [it.name for it in b]   # ['torch', 'cutter'], no __iter__ needed
  ```
- Trace: a two-line `class Item` (name, price) then the Bag class, then `names = [it.name for it in Bag().add(Item('a', 1)).add(Item('b', 2))]`; frames on the `__getitem__` return line: `i` → 0 (note: no `__iter__`, so `for` starts asking `bag[0]`); `i` → 1; `i` → 2 with `raises` → `'IndexError'` ask `raises` (note: the list raised, `for` heard it and stopped); last line `names` → `['a', 'b']`.
- Spot: “Dax writes `__getitem__` that returns `None` past the end instead of letting `IndexError` out. `for it in bag` now…” Options: “Stops at the end” / “Never stops, because `for` waits for `IndexError` and `None` is a value” (answer, 1) / “Raises TypeError” / “Skips the last item”. Why: the sequence protocol ends on `IndexError`; swallowing it breaks every loop over the bag.
- Blank: intro “Count, reach, answer to a name.” Template: `__len__`, `__getitem__`, `__contains__` bodies blanked. Checks: len 0; len 3; `[0].name`; `[-1].name`; slice length; `in` true and false; `IndexError` past the end (`_t_raises`).
- Mini: “Write `class Shelf(width)` holding up to `width` items via `put(item)` (raise `ValueError` when full, return `self` otherwise), with `__len__`, `__getitem__`, `__contains__` by item name, and `names(shelf)` returning every name using a plain `for` over the shelf.” Hint: the same three methods over a list; `names` loops over the shelf, not its list. Checks: len; put beyond width raises; `[1].name`; `in`; `names` order; slice `[0:2]` length.

- [ ] **Step 2: Write the three solution files** and **register** the three lessons after the E tier in `index.js`.

- [ ] **Step 3: Validate and prove.** `npm run check` → `✓ 73 training nodes and 24 tools across 3 course(s) look good`; `npm test` → every test file green including "every tool is required by at least one lesson", and `✓ 118 gates, 168 training drills, … all reference solutions pass`; `npm run build` ok.

- [ ] **Step 4: Prose check** with the grep from Task 1; "protocol" must appear only in `algo: 'Sequence protocol'` and spot steps.

- [ ] **Step 5: Browser check** `same-or-equal` and `count-and-reach`; tier tabs F, E, D; status window "Lessons trained: 0 / 11"; switch to The Blueprint and back; reload; blocks intact; no console errors; no three.js chunk.

- [ ] **Step 6: Commit** `content(oop): D-tier lessons — same or equal, put them in order, count and reach`. Then follow superpowers:finishing-a-development-branch to merge `oop-lessons-f-d` into `main`.

---

## Self-review

- **Spec coverage.** The eleven F–D rows of the spec's lesson table: ids, tiers, algos, titles, tools and gates match; spec `requires` ("the lesson above it that it builds on") is made explicit in the lesson graph. Prose rule: Global Constraints and per-task grep. Step shape: every lesson lists explain ×2 (brute force, then the shape with code), trace, spot, blank, mini. No `scene`. Plan 3 covers C–S lessons, the CLAUDE.md story paragraph and prose rule, the spec status line and the `training-tools` test skip removal.
- **Placeholder scan.** Every lesson has a concrete brute-force beat, code block, trace frames with asks and notes, spot with four options and an answer index, blank template with `___` and six or seven checks, mini with a named callable and six checks.
- **Type consistency.** `tool-*` ids match the armoury from plan 1. Gate ids match `src/courses/oop/gates.js`. Trace state values never use `{ py: "Class(...)" }` unless the traced code defines that `__repr__`. `_t_raises` is defined per test string that uses it. Expected counts: 62 → 67 → 70 → 73 nodes; 146 → 156 → 162 → 168 drills.
