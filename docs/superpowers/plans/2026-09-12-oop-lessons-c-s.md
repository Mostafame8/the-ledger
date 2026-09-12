# The Manifest — plan 3: lessons C–S and docs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish The Manifest's training room with its last seven lessons (two C, two B, two A, one S), each proven by reference solutions, and land the course's CLAUDE.md story paragraph and prose rule, so the course is complete: 20 gates, 18 lessons, 6 tools.

**Architecture:** One file per lesson in `src/courses/oop/training/`, listed in `training/index.js`; step constructors from `src/training/node.js`. The only non-content change is deleting the `if (!NODES.length) continue` skip in `tests/training-tools.test.mjs`, since every course now has lessons. Reference solutions go in `scripts/solutions/oop/training/<lesson-id>.py`.

**Tech Stack:** Plain JS content modules, Python 3 for drills and reference solutions.

**Spec:** `docs/superpowers/specs/2026-09-12-oop-course-design.md` (sections "Lessons (18)", "Prose rule for this course", "Rollout")

## Global Constraints

- Node schema: `node(id, { tier, xp, requires, gates, tools, title, algo, steps })`; steps in order `explain, explain, trace, spot, blank, mini`. Ids lowercase kebab, unique within the course.
- xp by tier: C 120–140, B 160–180, A 200–240, S 280–400.
- `requires` lists lesson ids in this course; `gates` lists at least one gate id from `src/courses/oop/gates.js`; `tools` at most two `tool-*` ids from the oop armoury (`tool-dict`, `tool-function`, `tool-tuple`, `tool-decorator`, `tool-exception`, `tool-type`).
- Content order: explain 1 is Dax's version (move `brute force`), explain 2 the shape with a `code` block (move `pick the pattern` or `name the waste`), then trace, spot, blank, mini. Explain steps 2–5 lines; at least one line starts with `“`.
- Prose rule: explain lines, the blank intro, the mini mission and hint never use the textbook nouns: inheritance, inherit, polymorphism, encapsulation, descriptor, metaclass, method resolution order, MRO, protocol, dunder, magic method, abstract. Python syntax words are code and allowed anywhere (`__iter__`, `yield`, `with`, `__enter__`, `@classmethod`, `@dataclass`, `__get__`, `__set_name__`, `__getattr__`, `__init_subclass__`, `type(`). Only `algo`, spot options and a spot's `problem`/`why` may use the nouns.
- No `scene` anywhere (the registry test enforces it).
- Trace: 3+ frames `{ line, state, ask, note }`, `line` 1-based into `code`, `ask` a key of `state`; object values as `{ py: "Repr(...)" }` only when the traced code defines that `__repr__`, tuples as `{ py: '(1, 2)' }`; lists, dicts, strings, ints, bools as JS literals.
- Spot: 3–4 options, `answer` an index, `why` names the trap.
- Blank: `___` markers, 4–7 `check(` calls. Mini: mission names a function or method with parentheses, 4–7 checks. Test helper names start with `_t_`. To assert an error, define `_t_raises(fn)` at the top of that test string (returns the exception class name).
- Reference solutions: `scripts/solutions/oop/training/<lesson-id>.py`, blocks `# === <lesson-id>/4` (blank) and `# === <lesson-id>/5` (mini).
- Voice: Marguerite teaches, Dax keeps everything in dicts, the room above the laundromat, the fence when useful. Short, wry, concrete. No real anime, manga or game references.
- `npm test`, `npm run check`, `npm run build` green at the end of every task. Baseline: 118 gates, 168 drills, 73 nodes, 24 tools.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Branch `oop-lessons-c-s` off `main`.

---

## File structure

| Path | Responsibility |
|---|---|
| `src/courses/oop/training/<id>.js` × 7 | One lesson each. |
| `src/courses/oop/training/index.js` | Imports the lessons, `NODES` in display order, `NODE_BY_ID`. |
| `scripts/solutions/oop/training/<id>.py` × 7 | Reference solutions for blank and mini. |
| `tests/training-tools.test.mjs` | Remove the `if (!NODES.length) continue` skip (line 38). |
| `CLAUDE.md` | Story paragraph for the oop course (after line 68); per-course prose rule (extend line 53); layout line loses "Lessons arrive in plans 2 and 3 of the OOP spec". |
| `docs/superpowers/specs/2026-09-12-oop-course-design.md` | Status line → implemented. |

## The lesson graph (this plan)

| id | tier/xp | requires | gates | tools | title | algo |
|---|---|---|---|---|---|---|
| `walk-the-bag` | C/120 | count-and-reach | walkthebag | tool-function | Walk the bag | Iteration protocol |
| `open-and-close` | C/130 | the-guarded-field | sealedbag | tool-exception | Open and close | Context managers |
| `other-doors-in` | B/160 | the-family-line | fromline | tool-decorator | Other doors in | classmethod and staticmethod |
| `the-stamped-form` | B/170 | put-them-in-order | frozenentry | tool-tuple | The stamped form | Dataclasses |
| `the-gatekeeper` | A/200 | the-guarded-field, other-doors-in | typedfield | tool-decorator | The gatekeeper | Descriptors |
| `the-attribute-trap` | A/220 | the-gatekeeper | attributetrap | tool-dict | The attribute trap | Attribute hooks |
| `the-class-that-stamps-classes` | S/300 | the-attribute-trap, two-parents | selfregister, manifest | tool-type | The class that stamps classes | Metaclasses and init_subclass |

`training/index.js` after this plan appends, in this order after `countAndReach`: `walkTheBag, openAndClose, otherDoorsIn, theStampedForm, theGatekeeper, theAttributeTrap, theClassThatStampsClasses`, grouped by tier on separate lines as the file already does.

---

### Task 1: Tier C — walk it, open it, close it

**Files:**
- Create: `src/courses/oop/training/walk-the-bag.js`, `open-and-close.js`
- Create: `scripts/solutions/oop/training/walk-the-bag.py`, `open-and-close.py`
- Modify: `src/courses/oop/training/index.js`, `tests/training-tools.test.mjs`

**Interfaces:**
- Consumes `count-and-reach`, `the-guarded-field` (plan 2). Produces `walk-the-bag`, `open-and-close`.

- [ ] **Step 1: Branch** `git checkout main && git checkout -b oop-lessons-c-s`.

- [ ] **Step 2: Remove the test skip.** In `tests/training-tools.test.mjs` delete the line `if (!NODES.length) continue // a course whose lessons have not landed yet has nothing to require`. Run `node --test tests/training-tools.test.mjs` → still green (every course has lessons).

- [ ] **Step 3: Write the two lesson files.**

**`walk-the-bag`** (Iteration protocol, gate `walkthebag`, tool-function)
- Explain 1: the fence wants to walk the bag one item at a time; Dax hands her `bag.items`; she sorts it in place and the manifest order is gone. Marguerite: “Hand her a walker, not the shelf.”
- Explain 2 (code): `iter(bag)` calls `__iter__`, which hands back a fresh walker; the walker's `__next__` gives the next item or raises `StopIteration`; a walker's own `__iter__` returns itself; a generator (`yield`) is the short spelling of the same walker. Code:
  ```python
  class Bag:
      def __init__(self):
          self._items = []
      def add(self, item):
          self._items.append(item)
          return self
      def __iter__(self):
          return BagWalk(self._items)

  class BagWalk:
      def __init__(self, items):
          self._items = items
          self._i = 0
      def __iter__(self):
          return self
      def __next__(self):
          if self._i >= len(self._items):
              raise StopIteration
          item = self._items[self._i]
          self._i += 1
          return item

  b = Bag().add('torch').add('cutter')
  list(b)               # ['torch', 'cutter']
  w = iter(b); next(w)  # 'torch'
  list(w)               # ['cutter'], the walker remembers where it is
  list(b)               # ['torch', 'cutter'], the bag does not move

  class Bag2(Bag):
      def __iter__(self):          # the same walker as a generator
          for item in self._items:
              yield item
  ```
- Trace: the `Bag`/`BagWalk` code (lines 1–19) plus `w = iter(Bag().add('a').add('b'))` / `first = next(w)` / `rest = list(w)` (lines 21–23), input `(first, rest)`; frames: line 8 `walker_i` → 0 ask `walker_i` (note: `iter(bag)` built a fresh walker at position 0); line 18 `returns` → `'a'` (note: `next(w)` ran `__next__` once and moved the position on); line 15 `raises` → `'StopIteration'` ask `raises` (note: `list(w)` kept calling `__next__` until the position ran off the end); line 23 `rest` → `['b']`.
- Spot: “Dax makes `Bag.__iter__` return `self` and puts `__next__` on `Bag` with a `_i` counter. He runs `list(bag)` twice. The second time…” Options: “The same list” / “An empty list, because the bag is its own walker and its position stayed at the end” (answer, 1) / “A TypeError” / “The list reversed”. Why: a walker is used up; a fresh one per `iter()` is the whole point of separating the two.
- Blank: intro “A fresh walker per `iter`, and a walker that knows when it is done.” Template: the `BagWalk` with `__next__`'s guard and the position bump blanked, plus `Bag.__iter__` return blanked. Checks: `list(Bag())` → `[]`; names in order; a second walker starts fresh; `StopIteration` from an empty walker (`_t_raises(lambda: next(iter(Bag())))`); `iter(w) is w`; `sum(1 for _ in bag)` → 2.
- Mini: “Write `class Countdown(n)` whose `__iter__` is a generator yielding `n, n-1, …, 1`, and `class Pairs(items)` whose `__iter__` yields `(items[i], items[i+1])` for each neighbouring pair; then `def total_gaps(values)` returning the sum of `b - a` over `Pairs(values)`.” Hint: `yield` inside `__iter__` makes the walker for you; `Pairs` loops `range(len(items) - 1)`. Checks: `list(Countdown(3))` → `[3, 2, 1]`; `list(Countdown(0))` → `[]`; `list(Pairs([1, 4, 9]))` → `[(1, 4), (4, 9)]`; `list(Pairs([7]))` → `[]`; `total_gaps([1, 4, 9])` → 8; two walks of the same `Countdown` both full (`(list(_t_c), list(_t_c))` → `([2, 1], [2, 1])`).

**`open-and-close`** (Context managers, gate `sealedbag`, tool-exception)
- Explain 1: the bag gets zipped when the fence walks out; Dax zips at the end of the function, and the night the function raised halfway the bag stayed open on the table. Marguerite: “Open, do the work, and the close happens whether or not you remembered it.”
- Explain 2 (code): `with X() as x:` calls `__enter__` and binds what it returns; at the end of the block, however it ends, `__exit__(exc_type, exc, tb)` runs; return `False` so an error keeps climbing, `True` only to swallow it on purpose; `contextlib.contextmanager` turns a generator with one `yield` into the same shape. Code:
  ```python
  class Bag:
      def __init__(self):
          self.items = []
          self.sealed = False
      def add(self, item):
          if self.sealed:
              raise RuntimeError('bag is sealed')
          self.items.append(item)
      def __enter__(self):
          return self
      def __exit__(self, exc_type, exc, tb):
          self.sealed = True
          return False

  with Bag() as b:
      b.add('torch')
  b.sealed              # True
  b.add('cutter')       # RuntimeError

  try:
      with Bag() as c:
          raise ValueError('mid-meeting')
  except ValueError:
      c.sealed          # True: sealed on the way out, error still climbed
  ```
- Trace: the class (lines 1–13) plus `def meeting():` / `try:` / `with Bag() as b:` / `b.add('torch')` / `raise ValueError('x')` / `except ValueError:` / `return (b.sealed, b.items)` (lines 15–21), input `meeting()`; frames: line 10 `sealed` → false ask `sealed` (note: `__enter__` ran and handed the bag to `b`); line 7 `items` → `['torch']`; line 12 `sealed` → true ask `sealed` (note: the raise left the block, and `__exit__` ran before anything else); line 13 `returns` → false ask `returns` (note: returning False lets the ValueError carry on to the except); line 21 `returns` → `{ py: "(True, ['torch'])" }`.
- Spot: “Dax's `__exit__` returns `True` so the meeting never crashes. A `KeyError` inside the block now…” Options: “Still climbs out” / “Is swallowed silently, because a truthy return from `__exit__` means handled” (answer, 1) / “Becomes a RuntimeError” / “Prevents sealing”. Why: `__exit__`'s return value is the one place a context manager can eat an exception; return `False` unless that is the job.
- Blank: intro “Open hands back the bag. Close seals it and lets errors climb.” Template: `__enter__` return and `__exit__` body (two lines) blanked. Checks (helpers as in the gate tests): open inside; sealed after; add after seals raises; items kept; error inside still seals and propagates; `Bag().__exit__(None, None, None)` → False.
- Mini: “Write `class Timer` that is a context manager: `__enter__` records `time.perf_counter()` in `start` and returns `self`; `__exit__` stores `elapsed = perf_counter() - start` and returns `False`. Also write `class Muted` whose `__exit__` returns `True` only when `exc_type is ValueError`, so a `ValueError` inside the block is swallowed and anything else climbs.” Hint: `import time`; `Muted.__exit__` is one line: `return exc_type is ValueError`. Checks: `Timer` `elapsed >= 0` after a block; `start` set inside; `_t_raises` around `with Muted(): raise ValueError` → `None` (swallowed); around `raise KeyError` → `'KeyError'`; `Muted().__exit__(None, None, None)` → False; `Timer` elapsed is a float.

- [ ] **Step 4: Write the two solution files** and **register** the lessons after `countAndReach` in `index.js`.

- [ ] **Step 5: Validate and prove.** `npm run check` → `✓ 75 training nodes and 24 tools across 3 course(s) look good`; `npm test` → all green, `✓ 118 gates, 172 training drills, …`.

- [ ] **Step 6: Prose check.** `grep -n -i -E "inherit|polymorph|encapsulat|descriptor|metaclass|resolution order|\bMRO\b|protocol|dunder|magic method|abstract" src/courses/oop/training/*.js | grep -v "algo:"` must match only spot steps.

- [ ] **Step 7: Browser check** tier tab C appears with two `needs:` rows.

- [ ] **Step 8: Commit** `content(oop): C-tier lessons — walk the bag, open and close; drop the no-lessons test skip`.

---

### Task 2: Tier B — other doors in, the stamped form

**Files:**
- Create: `src/courses/oop/training/other-doors-in.js`, `the-stamped-form.js`
- Create: `scripts/solutions/oop/training/other-doors-in.py`, `the-stamped-form.py`
- Modify: `src/courses/oop/training/index.js`

**Interfaces:**
- Consumes `the-family-line`, `put-them-in-order`. Produces `other-doors-in` (required by `the-gatekeeper`), `the-stamped-form`.

- [ ] **Step 1: Write the two lesson files.**

**`other-doors-in`** (classmethod and staticmethod, gate `fromline`, tool-decorator)
- Explain 1: the fence's list arrives as text; Dax parses `"torch,5"` in six places, and `Stolen(Item)` gets an `Item` back from the one parser that exists. Marguerite: “Give the class its own door for text. Whichever class you knock on is the class you get.”
- Explain 2 (code): `@classmethod` receives the class as `cls`; `cls(...)` builds whichever class was asked, so children get the door for free; `@staticmethod` receives nothing and just lives at the class's address; both are decorators, like `@property`. Code:
  ```python
  class Item:
      def __init__(self, name, price):
          self.name = name
          self.price = price
      @staticmethod
      def parse_price(text):
          return float(text) if '.' in text else int(text)
      @classmethod
      def from_line(cls, line):
          name, price = line.split(',')
          return cls(name.strip(), cls.parse_price(price.strip()))

  class Stolen(Item):
      pass

  Item.from_line('torch, 5').price          # 5
  type(Stolen.from_line('a,1')).__name__    # 'Stolen'
  Item.parse_price('2.50')                  # 2.5, no instance needed
  ```
- Trace: the code (lines 1–14) plus `s = Stolen.from_line(' tape , 2.5 ')` (line 16), input `(type(s).__name__, s.name, s.price)`; frames: line 10 `cls_name` → `'Stolen'` ask `cls_name` (note: knocked on Stolen, so `cls` is Stolen even though the method is written on Item); line 10 `name` → `' tape '` (note: split first, strip after); line 7 `returns` → 2.5 (note: a staticmethod, reached through `cls`, no self, no cls); line 16 `returns` → `{ py: "('Stolen', 'tape', 2.5)" }`.
- Spot: “Dax writes `from_line` as a plain method and calls `Item.from_line('a,1')`. Result?” Options: “An Item” / “TypeError: missing an argument, because a plain method wants an instance in its first seat and none was given” (answer, 1) / “A string” / “Works only for Stolen”. Why: a door you knock on without an instance has to be a classmethod or a staticmethod.
- Blank: intro “A door for text on the class, and a helper that needs neither class nor instance.” Template: the two decorator lines blanked (`@___` above each) and the `return cls(...)` blanked. Checks: `from_line` name and price; `parse_price` int and float; `Stolen.from_line` type; `Item.parse_price('7')` → 7 called on the class.
- Mini: “Write `class Temp(celsius)` with `@classmethod from_f(cls, f)` building from Fahrenheit (`(f - 32) * 5 / 9`), `@staticmethod valid(c)` returning `c >= -273.15`, and `@property f` returning Fahrenheit; plus `class Reading(Temp)` with a `note` class attribute `'field'`.” Hint: `from_f` returns `cls(...)`; `valid` takes only the number. Checks: `Temp.from_f(212).celsius` → 100.0; `Temp(100).f` → 212.0; `Temp.valid(-300)` False; `Temp.valid(0)` True; `type(Reading.from_f(32)).__name__` → `'Reading'`; `Reading.from_f(32).celsius` → 0.0.

**`the-stamped-form`** (Dataclasses, gate `frozenentry`, tool-tuple)
- Explain 1: Dax's `Entry` is `__init__`, `__repr__`, `__eq__`, `__hash__` and `__lt__` written by hand, forty lines for three fields, and one field is missing from `__eq__`. Marguerite: “A class that is only fields is a form. Let Python print the form.”
- Explain 2 (code): `@dataclass` writes `__init__`, `__repr__` and `__eq__` from the field list; `order=True` adds the comparisons field by field in declaration order; `frozen=True` refuses assignment and makes instances hashable; `field(default_factory=…)` for a fresh default each time; a tuple default is the sealed pair from the armoury. Code:
  ```python
  from dataclasses import dataclass, field

  @dataclass(frozen=True, order=True)
  class Entry:
      price: int
      name: str
      tags: tuple = field(default_factory=tuple)

  e = Entry(5, 'torch')
  e                                  # Entry(price=5, name='torch', tags=())
  e == Entry(5, 'torch')             # True
  sorted([Entry(9, 'x'), Entry(1, 'y')])[0].name   # 'y'
  len({e, Entry(5, 'torch')})        # 1
  e.price = 6                        # FrozenInstanceError
  ```
- Trace: the code (lines 1–7) plus `a = Entry(5, 'torch')` / `b = Entry(5, 'torch', ('hot',))` / `same = a == b` / `first = min(a, b).tags` (lines 9–12), input `(same, first)`; frames: line 9 `a` → `{ py: "Entry(price=5, name='torch', tags=())" }` ask `a` (note: the generated `__repr__` names every field); line 11 `same` → false (note: generated `__eq__` compares all three fields, tags differ); line 12 `first` → `{ py: '()' }` ask `first` (note: `order=True` compares field by field; price and name tie, and `()` sorts before `('hot',)`); line 12 `returns` → `{ py: "(False, ())" }`.
- Spot: “Dax writes `tags: list = []` as a dataclass field. What happens?” Options: “Works; each Entry gets its own empty list” / “ValueError at class creation: mutable default not allowed, use `field(default_factory=list)`” (answer, 1) / “Every Entry shares one list silently” / “TypeError when frozen”. Why: dataclasses refuse a mutable default because it would be shared; the factory makes a fresh one per instance.
- Blank: intro “Three fields, one decorator, and Python writes the rest.” Template: the decorator line's arguments blanked (`@dataclass(___)`), the `tags` line blanked (`tags: tuple = ___`), `def total(entries): return ___`. Checks: equality; sorted by price; frozen raises `FrozenInstanceError`; hash collapse; repr; `total`.
- Mini: “Write `@dataclass(order=True) class Job` with `priority: int`, `name: str = field(compare=False)`, `done: bool = field(default=False, compare=False)`, and `def next_up(jobs)` returning the name of the lowest-priority undone job, or `None`.” Hint: `compare=False` keeps name and done out of ordering and equality; filter with a comprehension then `min`. Checks: `Job(1, 'a') == Job(1, 'b')` True (name not compared); `sorted` by priority; `next_up` skips done; `next_up` with all done → `None`; `Job(2, 'x').done` False default; repr shows all three fields.

- [ ] **Step 2: Write the two solution files** and **register** the lessons after the C tier.

- [ ] **Step 3: Validate and prove.** `npm run check` → `✓ 77 training nodes …`; `npm test` → `… 176 training drills …`, all green.

- [ ] **Step 4: Prose check** with the Task 1 grep.

- [ ] **Step 5: Browser check** tier tab B appears; `other-doors-in` shows `needs: The family line · tools: Decorator`.

- [ ] **Step 6: Commit** `content(oop): B-tier lessons — other doors in, the stamped form`.

---

### Task 3: Tiers A and S — the gatekeeper, the attribute trap, the class that stamps classes; docs

**Files:**
- Create: `src/courses/oop/training/the-gatekeeper.js`, `the-attribute-trap.js`, `the-class-that-stamps-classes.js`
- Create: `scripts/solutions/oop/training/the-gatekeeper.py`, `the-attribute-trap.py`, `the-class-that-stamps-classes.py`
- Modify: `src/courses/oop/training/index.js`, `CLAUDE.md`, `docs/superpowers/specs/2026-09-12-oop-course-design.md`

**Interfaces:**
- Consumes `the-guarded-field`, `other-doors-in`, `two-parents`. Produces the last three lesson ids.

- [ ] **Step 1: Write the three lesson files.**

**`the-gatekeeper`** (Descriptors, gate `typedfield`, tool-decorator)
- Explain 1: four fields must be positive; Dax writes the same property setter four times, and the fourth has a typo that lets zero through. Marguerite: “One gatekeeper, hired once, stands at every door you name.”
- Explain 2 (code): an object with `__get__` and `__set__` placed on the class becomes the door for that name; `__set_name__` tells it which name it guards; it stores the value on the instance under a private name; `@property` is a gatekeeper Python wrote for you. Code:
  ```python
  class Positive:
      def __set_name__(self, owner, name):
          self.private = '_' + name
      def __get__(self, obj, owner):
          if obj is None:
              return self
          return getattr(obj, self.private)
      def __set__(self, obj, value):
          if not value > 0:
              raise ValueError(f"{self.private[1:]} must be positive")
          setattr(obj, self.private, value)

  class Entry:
      price = Positive()
      qty = Positive()
      def __init__(self, price, qty):
          self.price = price
          self.qty = qty

  e = Entry(5, 2)
  e.price               # 5, through __get__
  e.qty = 0             # ValueError, through __set__
  vars(e)               # {'_price': 5, '_qty': 2}
  type(Entry.price)     # Positive: asked on the class, obj is None
  ```
- Trace: the code (lines 1–17) plus `e = Entry(5, 2)` / `e.qty = 3` / `snap = vars(e)` (lines 19–21), input `snap`; frames: line 3 `private` → `'_price'` ask `private` (note: `__set_name__` ran when `Entry` was built, once per field); line 11 `stored` → `{ _price: 5 }` ask `stored` (note: `self.price = price` in `__init__` went through `__set__`, which passed 5 and wrote `_price` on the instance); line 11 `stored` → `{ _price: 5, _qty: 3 }` (note: `e.qty = 3` is the same door, different private name); line 21 `snap` → `{ _price: 5, _qty: 3 }`.
- Spot: “Dax writes `self.value = value` inside `Positive.__set__`, storing on the gatekeeper instead of on `obj`. Two entries then…” Options: “Keep separate prices” / “Share one price, because there is one `Positive` per class, not per instance” (answer, 1) / “Raise AttributeError” / “Cannot be built”. Why: the gatekeeper is a class-level object; per-instance state must live on `obj`, under the private name.
- Blank: intro “One gatekeeper for every positive field. Learn the name, check the value, store it on the instance.” Template: `__set_name__` body, `__set__`'s check and store blanked. Checks: get; set zero raises; birth negative raises; two entries independent; `type(Entry.price).__name__` → `'Positive'`; `'_price' in vars(Entry(5, 2))`.
- Mini: “Write `class Typed(kind)` gatekeeper whose `__set__` raises `TypeError` unless `isinstance(value, kind)`, storing under `'_' + name`; and `class Line` with `name = Typed(str)`, `qty = Typed(int)`, `__init__(name, qty)`.” Hint: the same three methods, with `kind` saved in `__init__`. Checks: `Line('torch', 2).name`; `.qty`; `_t_raises(lambda: Line(5, 2))` → `'TypeError'`; `_t_raises(lambda: setattr(Line('a', 1), 'qty', 'x'))` → `'TypeError'`; `Line('a', True).qty` → True (bool is an int); `vars(Line('a', 1))` → `{'_name': 'a', '_qty': 1}`.

**`the-attribute-trap`** (Attribute hooks, gate `attributetrap`, tool-dict)
- Explain 1: the fence's records have fields nobody planned for; Dax reaches for `record['whatever']`, wraps that in `.get`, wraps that in a function. Marguerite: “Let the dot fall through to the dict, and log every hand that writes.”
- Explain 2 (code): `__getattr__` runs only when normal lookup fails, so it is the safety net, not the door; `__setattr__` runs on every assignment, including inside `__init__`, so use `object.__setattr__` to plant the fields it needs; raise `AttributeError` for a real miss so `hasattr` and `getattr(x, name, default)` keep working. Code:
  ```python
  class Record:
      def __init__(self, **fields):
          object.__setattr__(self, '_data', dict(fields))
          object.__setattr__(self, '_log', [])
      def __getattr__(self, name):
          if name.startswith('_'):
              raise AttributeError(name)
          try:
              return self._data[name]
          except KeyError:
              raise AttributeError(f"no field {name!r}") from None
      def __setattr__(self, name, value):
          self._data[name] = value
          self._log.append((name, value))
      def changes(self):
          return list(self._log)

  r = Record(name='torch')
  r.name                # 'torch', via __getattr__
  r.price = 5           # via __setattr__, logged
  r.changes()           # [('price', 5)]
  hasattr(r, 'zzz')     # False, because the miss raised AttributeError
  ```
- Trace: the code (lines 1–16) plus `r = Record(name='torch')` / `r.price = 5` / `p = r.price` / `missing = hasattr(r, 'zzz')` (lines 18–21), input `(p, missing, r.changes())`; frames: line 3 `_data` → `{ name: 'torch' }` ask `_data` (note: planted with `object.__setattr__` so the hook below is not tripped); line 14 `_data` → `{ name: 'torch', price: 5 }` (note: `r.price = 5` hit `__setattr__`; the dict took it and the log grew); line 9 `returns` → 5 (note: `r.price` missed normal lookup, since nothing is in `__dict__` but `_data` and `_log`, so `__getattr__` answered from the dict); line 11 `raises` → `'AttributeError'` ask `raises` (note: `hasattr` swallows exactly that error and reports False); line 21 `returns` → `{ py: "(5, False, [('price', 5)])" }`.
- Spot: “Dax writes `self._data = dict(fields)` in `__init__` instead of `object.__setattr__(...)`. Result?” Options: “Works the same” / “RecursionError: the assignment hits `__setattr__`, which reads `self._data`, which is not there yet, so `__getattr__` runs, which reads `self._data`…” (answer, 1) / “A KeyError” / “`_data` becomes a class attribute”. Why: every `self.x = …` goes through the hook; the fields the hook needs must be planted underneath it.
- Blank: intro “Fall through to the dict on a miss; log every write.” Template: the two `object.__setattr__` lines blanked to `___`, the `return self._data[name]` blanked, the log append blanked. Checks: read; missing raises AttributeError; set then read; `changes()`; `hasattr` False; `_data` visible.
- Mini: “Write `class Frozen(**fields)` that answers `obj.name` from a dict planted with `object.__setattr__`, raises `AttributeError` for a missing field, and raises `TypeError('frozen')` from `__setattr__` for any assignment after construction. Add `def thaw(frozen)` returning a plain dict copy of its fields.” Hint: plant `_data` in `__init__`; `__setattr__` is one `raise`; `thaw` reads `frozen._data` and copies it. Checks: read; missing raises; assignment raises `TypeError`; `thaw` copy equals fields; mutating the copy does not touch the frozen; `hasattr(Frozen(a=1), 'b')` False.

**`the-class-that-stamps-classes`** (Metaclasses and init_subclass, gates `selfregister`, `manifest`, tool-type)
- Explain 1: new kinds of loot every week; Dax keeps a dict of kind to class by hand and forgets one. Marguerite: “A kind signs itself in the moment it is defined. The parent watches its children being born.”
- Explain 2 (code): `__init_subclass__` runs on the parent once per new child, with the child as `cls` and any class-line keywords; the book is a dict on the base; `type(name, bases, ns)` is what the `class` statement calls, and `type` itself can be subclassed when the book must be written before the class exists. Code:
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

  Entry.kinds                          # {'cash': Cash, 'stone': Gem}
  type(Entry.build('stone', 3)).__name__   # 'Gem'

  Bond = type('Bond', (Entry,), {})    # the class statement, spelled out
  'bond' in Entry.kinds                # True: __init_subclass__ ran for it too

  class Counted(type):                 # a class whose instances are classes
      made = 0
      def __new__(mcls, name, bases, ns):
          Counted.made += 1
          return super().__new__(mcls, name, bases, ns)

  class A(metaclass=Counted): pass
  class B(metaclass=Counted): pass
  Counted.made                         # 2
  ```
- Trace: the `Entry`/`Cash`/`Gem` code (lines 1–14) plus `Bond = type('Bond', (Entry,), {})` / `book = sorted(Entry.kinds)` (lines 16–17), input `book`; frames: line 5 `key` → `'cash'` ask `key` (note: `class Cash(Entry)` finished building and `__init_subclass__` ran with `cls` = Cash and no keyword); line 5 `key` → `'stone'` (note: the `kind='stone'` keyword in the class line arrived as an argument); line 5 `key` → `'bond'` (note: `type(...)` is the class statement; the hook does not care which spelling made the child); line 17 `book` → `['bond', 'cash', 'stone']`.
- Spot: “Dax writes `cls.kinds[key] = cls` instead of `Entry.kinds[key] = cls`. Where do grandchildren land?” Options: “In `Entry.kinds`, since `cls.kinds` resolves to the same dict” (answer, 0) / “In a fresh dict on the grandchild” / “Nowhere” / “TypeError”. Why: reading `cls.kinds` falls through to the one dict on Entry and mutates it in place; only an assignment `cls.kinds = {}` would make a private copy. The trap is the opposite habit from the class-counter lesson, so know which move you are making.
- Blank: intro “The parent signs each child into the book as it is born.” Template: the `__init_subclass__` `super()` line and the registration line blanked, `build`'s return blanked. Checks: `Entry.kinds['cash'] is Cash`; `['stone'] is Gem`; `'entry' not in kinds`; `build('cash', 5)` type; unknown raises `KeyError`; a test-defined child appears.
- Mini: “Write `class Named(type)` whose `__new__(mcls, name, bases, ns)` adds `ns['label'] = name.lower()` before calling `super().__new__`, and `class Loot(metaclass=Named)` with an empty body, `class Cash(Loot)` with an empty body. Then `def labels(*classes)` returning the list of their `label` attributes.” Hint: `ns` is the class body dict; write into it, then hand it up; every class made by `Named`, children included, gets a label. Checks: `Loot.label` → `'loot'`; `Cash.label` → `'cash'`; `type(Loot).__name__` → `'Named'`; `labels(Loot, Cash)` → `['loot', 'cash']`; `isinstance(Cash, Named)` True; `Cash().label` → `'cash'` (read through the instance).

- [ ] **Step 2: Write the three solution files** and **register** the lessons after the B tier.

- [ ] **Step 3: Validate and prove.** `npm run check` → `✓ 80 training nodes and 24 tools across 3 course(s) look good`; `npm test` → `✓ 118 gates, 182 training drills, … all reference solutions pass`, every test file green; `npm run build` ok.

- [ ] **Step 4: Prose check** with the Task 1 grep; "metaclass" must appear only in `algo` and spot steps (the explain lines say "a class whose instances are classes").

- [ ] **Step 5: Browser check.** Seven tier tabs F–S in The Manifest's training room. Open `the-class-that-stamps-classes` (seed the slot block in localStorage with every prerequisite lesson and tool cleared, or clear through): the two explains render with the code block, trace accepts `'cash'`, `'stone'`, `'bond'`, `['bond', 'cash', 'stone']`, spot answer 0, blank and mini pass with the reference solutions, "Finish lesson". Status window "Lessons trained: n / 18", "Kit: n / 6". Switch to The Blueprint and back; reload; blocks intact; no console errors; no three.js chunk.

- [ ] **Step 6: CLAUDE.md.**
  - Layout line for `src/courses/oop/` (line 15): replace `Lessons arrive in plans 2 and 3 of the OOP spec.` with `Lessons list the gate ids they prepare.`
  - Training node schema, line 53: append to the existing bullet: ` The oop course sets no `scene` either; its prose may use Python syntax words (`class`, `self`, `super()`, `__eq__`, `@property`) but never the textbook nouns (inheritance, polymorphism, encapsulation, descriptor, metaclass, MRO, protocol, dunder, abstract) outside `algo` and spot steps.`
  - Story section, after the Patterns course line (line 68), add:
    ```
    - OOP course ("The Manifest"): between Halden and The Blueprint. The take sits in duffel bags in the room above the laundromat; the fence buys nothing until every item, person and route is written up as a typed, comparable, countable thing. Dax keeps it all in dicts, tuples and loose functions; the learner turns them into objects. Arcs: I The bags (dict → class) · II The roster (the family line, super, two parents) · III The count (equal, ordered, counted, walked) · IV The handover (properties, other doors in, frozen forms, open and close) · V The Manifest (the gatekeeper, the attribute trap, kinds that sign themselves in, the manifest). Stats `shape`, `kin`, `protocol`. Lessons: The stamped tag · The tag's own moves · Reading it back · Shared ink, own name · The guarded field · The family line · Call up the line · Two parents · Same or equal · Put them in order · Count and reach · Walk the bag · Open and close · Other doors in · The stamped form · The gatekeeper · The attribute trap · The class that stamps classes.
    ```

- [ ] **Step 7: Spec status.** In `docs/superpowers/specs/2026-09-12-oop-course-design.md` line 4: `Status: implemented (plans 1–3: kit and heist, lessons F–D, lessons C–S)`.

- [ ] **Step 8: Commit** `content(oop): A and S lessons — the gatekeeper, the attribute trap, the class that stamps classes; docs`. Then follow superpowers:finishing-a-development-branch to merge `oop-lessons-c-s` into `main`.

---

## Self-review

- **Spec coverage.** The seven C–S rows of the spec's lesson table: ids, tiers, algos, titles, tools and gates match (`the-class-that-stamps-classes` prepares both `selfregister` and `manifest` as the spec says). Prose rule: Global Constraints and per-task grep. Step shape: explain ×2, trace, spot, blank, mini in every lesson. No `scene`. Rollout's plan-3 items: seven lessons (Tasks 1–3), CLAUDE.md layout/story/prose rule (Task 3 Step 6), spec status (Step 7), test skip removal (Task 1 Step 2).
- **Placeholder scan.** Every lesson has a brute-force beat, code block, trace frames with asks and notes, spot with four options and an answer index, blank template with `___` and six checks, mini with a named callable and six checks.
- **Type consistency.** `tool-*` ids match the armoury. Gate ids match `src/courses/oop/gates.js`. `requires` ids match plan 2's lesson ids. Trace state uses `{ py: ... }` only for tuples or where the traced code defines `__repr__` (the dataclass lesson's generated repr is exact). Expected counts: 73 → 75 → 77 → 80 nodes; 168 → 172 → 176 → 182 drills.
