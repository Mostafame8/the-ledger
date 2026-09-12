# The Manifest — the object-oriented Python course

Date: 2026-09-12
Status: implemented (plans 1–3: kit and heist, lessons F–D, lessons C–S)
Builds on: courses plumbing (2026-09-12-courses-and-patterns-design.md), the training room, save slots

## Purpose

The Ledger runs several courses through one shell. The Blueprint teaches design patterns and
assumes the learner can already write a class, override a method and implement a dunder. This
spec adds the course beneath it: Python's object model itself, from `class` and `__init__` to
descriptors and metaclasses. Zero overlap with The Blueprint; finishing this course is the
natural way into it.

## Decisions taken

- Scope is the Python object model, F to S. Not textbook four-pillar OOP, not domain modelling.
- Story sits between Halden and The Blueprint. The take is in bags; the fence wants a manifest.
- Stats `shape`, `kin`, `protocol`.
- Same size as The Blueprint: five arcs of four gates, eighteen lessons, six tools.
- Armoury drills the primitives beneath classes: dict, function, tuple, decorator, exception, type.
- No `scene` anywhere; three.js never loads in this course.
- Display order: algorithms, oop, patterns.

## Non-goals

- No plumbing changes. Registry, store, saves, validators, proofs already loop over courses.
- No changes to the algorithms or patterns content.
- No `scene` support work.

## The card

```js
export const course = {
  id: 'oop',
  title: 'The Manifest',
  algo: 'Object-oriented programming',
  runner: 'python',
  stats: ['shape', 'kin', 'protocol'],
  ...
}
```

- `shape`: designing one class — attributes, methods, properties, constructors, dataclasses.
- `kin`: relations between classes — subclassing, `super()`, MRO, mixins, class registries.
- `protocol`: what the interpreter calls — dunders, iteration, context managers, descriptors,
  attribute hooks, metaclasses.

Titles by cleared gates: Nobody → Clerk → Tallyman → Appraiser → Bookkeeper → Registrar →
Master of the Manifest (same `TITLES` construction as the patterns course).

Tier blurbs: F "From a dict to a thing." · E "Who inherits what." · D "Equal, ordered, counted."
· C "Walk it, open it, close it." · B "Other doors in." · A "Fields that guard themselves." ·
S "The class that stamps classes."

Course blurbs follow the patterns pattern: `${ARCS.length} jobs, ${GATES.length} gates. The take
is in bags. The fence buys nothing she cannot count.` and `${NODES.length} lessons in the back
room. Marguerite turns Dax's dicts into things that know what they are.`

## Story frame

The Halden take sits in duffel bags in the room above the laundromat. The fence will not buy a
lump. She wants a manifest: every item, every person, every route written up as a typed,
comparable, countable thing. Dax has it all in dicts, tuples and loose functions that take a
dict and poke at its keys. The learner turns them into objects. Arc V ends with the fence
signing the manifest and the crew, flush, deciding to build kit properly next time — the hook
into The Blueprint.

Cast and voice unchanged (Marguerite, Dax, the fence, the systems person). Every gate is a
thing the manifest needs.

## Arcs and gates (20)

| Arc | Ranks | Theme |
|---|---|---|
| I The bags | F | dict → class: `__init__`, methods, `__repr__`, class vs instance attributes |
| II The roster | E–D | subclass, override, `super()`, `isinstance`, abstract stub, two parents and MRO |
| III The count | D–C | `__eq__`/`__hash__` in sets, `__lt__` for sorting, `__len__`/`__getitem__`/`__contains__`, `__iter__` |
| IV The handover | C–B | property with validation, classmethod constructor, frozen ordered dataclass, `__enter__`/`__exit__` |
| V The Manifest | A–S | descriptor, `__getattr__`/`__setattr__`, `__init_subclass__` registry, capstone |

Gate list, in order (id · rank · stat · title · algo):

Arc I — The bags
- `tag` · F · shape · The paper tag · Classes and instances. `Item(name, price)` with two attributes.
- `worth` · F · shape · What it is worth · Methods and self. `Item.worth(qty)`, `Bag.add/total`.
- `readback` · F · protocol · Reading it back · repr and str. `__repr__` round-trips, `__str__` for the fence.
- `sharedink` · F · shape · Shared ink, own name · Class vs instance attributes. A class-level counter and per-instance serial.

Arc II — The roster
- `roles` · E · kin · Roles on the roster · Inheritance and overriding. `Member.rate()`, `Driver`, `Lookout` override.
- `upline` · E · kin · Call up the line · super(). Subclass extends `__init__` and a method via `super()`.
- `stub` · D · kin · The empty chair · Abstract stubs. Base raises `NotImplementedError`; `isinstance` in a roster count.
- `twoparents` · D · kin · Two parents · Multiple inheritance and MRO. A mixin adds `tag()`; `Cls.__mro__` order checked.

Arc III — The count
- `sameorequal` · D · protocol · Same or equal · Equality and hashing. `__eq__` and `__hash__`; equal items collapse in a set.
- `inorder` · C · protocol · Put them in order · Ordering. `__lt__` (plus `total_ordering`); `sorted()` on items.
- `countandreach` · C · protocol · Count and reach · Sequence protocol. `__len__`, `__getitem__` (int and slice), `__contains__`.
- `walkthebag` · C · protocol · Walk the bag · Iteration protocol. `__iter__` yielding in insertion order; `__next__` on a separate cursor class.

Arc IV — The handover
- `guardedprice` · C · shape · The guarded price · Properties. `price` setter rejects negatives with `ValueError`.
- `fromline` · B · shape · From one line · classmethod and staticmethod. `Item.from_line('torch,5')`, `Item.parse_price`.
- `frozenentry` · B · shape · The frozen entry · Dataclasses. `@dataclass(frozen=True, order=True)`, `field(default_factory)`.
- `sealedbag` · B · protocol · The sealed bag · Context managers. `with Bag.open() as b:` writes only inside; `__exit__` seals.

Arc V — The Manifest
- `typedfield` · A · protocol · The gatekeeper · Descriptors. `Positive()` descriptor with `__set_name__`, `__get__`, `__set__`.
- `attributetrap` · A · protocol · The attribute trap · Attribute hooks. `__getattr__` for missing keys, `__setattr__` logging.
- `selfregister` · A · kin · Kinds that sign themselves in · init_subclass registries. `Entry.__init_subclass__` fills `Entry.kinds`.
- `manifest` · S · shape · The manifest · Combining the object model. Descriptors + registry + sequence protocol + context manager in one `Manifest` class.

Rules: xp in the rank's band; an arc spans at most two adjacent ranks; no two consecutive gates
share a technique; every mission names classes and methods; tests through `check()`; every
mission carries a stretch a dict-based solution fails (e.g. "two equal Items must land in one
set slot", "the registry must not be edited by hand"). `code` on roughly every second gate in
Arcs I–II. One dialogue line per gate starting with `“`.

## Lessons (18), ordered by prerequisite

| Tier | `algo` | Title | Tools | Prepares |
|---|---|---|---|---|
| F | Classes and instances | The stamped tag | dict | tag |
| F | Methods and self | The tag's own moves | function | worth |
| F | repr and str | Reading it back | function | readback |
| F | Class vs instance attributes | Shared ink, own name | dict | sharedink |
| F | Properties | The guarded field | decorator | guardedprice |
| E | Inheritance and overriding | The family line | exception | roles |
| E | super() | Call up the line | function | upline, stub |
| E | Multiple inheritance and MRO | Two parents | type | twoparents |
| D | Equality and hashing | Same or equal | dict | sameorequal |
| D | Ordering | Put them in order | tuple | inorder |
| D | Sequence protocol | Count and reach | tuple | countandreach |
| C | Iteration protocol | Walk the bag | function | walkthebag |
| C | Context managers | Open and close | exception | sealedbag |
| B | classmethod and staticmethod | Other doors in | decorator | fromline |
| B | Dataclasses | The stamped form | tuple | frozenentry |
| A | Descriptors | The gatekeeper | decorator | typedfield |
| A | Attribute hooks | The attribute trap | dict | attributetrap |
| S | Metaclasses and init_subclass | The class that stamps classes | type | selfregister, manifest |

`requires` follows the table top to bottom within a tier and across tiers (each lesson requires
the lesson above it that it builds on; The stamped tag requires nothing). Lesson ids are
kebab-case of the title and never collide with gate or tool ids.

Step shape unchanged: two explains (Dax's dict-and-tuple version; then the shape with a code
block), trace (object attributes as state keys), spot (which shape fits; options may name the
technique), blank, mini. No `scene`. `tools` at most two, all from this course's armoury.

## Armoury (6 tools)

| id | title | algo | drills |
|---|---|---|---|
| `tool-dict` | The loose bag | Dict | attribute storage; `getattr`/`setattr`/`hasattr`; `obj.__dict__`; `vars()` |
| `tool-function` | A move with no owner | Function | functions as values; `*args`/`**kwargs`; a function stored on a dict vs a bound method |
| `tool-tuple` | The sealed pair | Tuple | immutability; unpacking; tuples as dict keys; `namedtuple` |
| `tool-decorator` | The wrapper | Decorator | a function that takes a function and returns one; `@` syntax; `functools.wraps` |
| `tool-exception` | The alarm that climbs | Exception | `raise`/`try`/`except`; a custom exception is a subclass; `except` matches by class |
| `tool-type` | What it is | Type | `type(x)`; `isinstance`/`issubclass`; `type` is itself a class; `x.__class__` |

Schema unchanged: explain, explain, trace, blank; xp 30. Tool prose may name its own structure.
Every tool is required by at least one lesson (table above). `tool-dict` and `tool-tuple` share
ids with algorithms armoury entries; tool ids are scoped per course (`TOOL_BY_ID` and the
cleared set live in the course block), so this is allowed and the drills differ in content.

## Prose rule for this course

- Python syntax words are code and allowed anywhere: `class`, `self`, `super()`, `@property`,
  `__eq__`, `isinstance`, `with`, `yield`.
- Textbook nouns are banned from explain lines, missions and hints: inheritance, polymorphism,
  encapsulation, descriptor, metaclass, method resolution order, MRO, protocol, dunder, magic
  method, abstract. They live in `algo`, spot options, a spot's `problem` and `why`.
- Marguerite says "the family line", "answers `len()`", "a field that guards itself", never the
  noun.

## Files

```
src/courses/oop/
  course.js  gates.js  index.js  tests.js
  training/  index.js, one file per lesson
  training/tools/  index.js, tool-dict.js … tool-type.js
scripts/solutions/oop/  arc1.py … arc5.py, training/<node-id>.py, training/tool-<name>.py
src/courses/index.js    COURSES = [algorithms, oop, patterns]
CLAUDE.md               layout line, story paragraph, prose rule
```

## Testing

- `npm run check` and `npm test` over three courses; algorithms and patterns counts unchanged.
- Solution proofs: 20 gates, every lesson drill, 6 tools.
- `tests/training-tools.test.mjs` passes for `oop` (every tool required, ids disjoint).
- Browser check on the production build: fresh slot → Jobs → The Manifest → one lesson and one
  gate → switch to patterns → reload; all blocks intact; no three.js chunk requested in `oop`.

## Rollout

Three plans, one branch each, in order:

1. **Kit and heist.** Course file, six tools, twenty gates in five arcs, tests.js, reference
   solutions, registry entry. Gates before lessons because lessons list gate ids.
2. **Lessons F–D.** Eleven lessons with solutions.
3. **Lessons C–S and docs.** Seven lessons, CLAUDE.md layout, story and prose rule.

## Risks

- Dunder-heavy drills can be passed with a dict wrapper. Stretch clauses and spot steps carry
  the concept load; tests check behaviour the wrapper cannot fake (`set` collapse, `sorted`,
  `len`, `with`).
- Pyodide supports descriptors, metaclasses and `__init_subclass__`; `dataclasses` and
  `functools` ship with it. Verify in plan 1 before writing Arc V tests.
- Lesson titles reuse gate titles in two places (Reading it back, Call up the line). Ids differ
  (`reading-it-back` vs `readback`), which is all the validator requires.
