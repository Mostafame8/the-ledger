# Courses — plan 3: the patterns training room — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the patterns course its eighteen lessons (five principles, twelve patterns, one capstone), each proven by reference solutions, so the Blueprint's training room has tier tabs F–S and every armoury tool is required by a lesson.

**Architecture:** One file per lesson in `src/courses/patterns/training/`, listed in `training/index.js`; the step constructors come from `src/training/node.js`. Nothing in the shell or validators changes except lifting the "no lessons yet" skip in `tests/training-tools.test.mjs`. Reference solutions go in `scripts/solutions/patterns/training/<lesson-id>.py`.

**Tech Stack:** Plain JS content modules, Python 3 for drills and reference solutions.

**Spec:** `docs/superpowers/specs/2026-09-12-courses-and-patterns-design.md` (section "Lessons (18)")

## Global Constraints

- Node schema: `node(id, { tier, xp, requires, gates, tools, title, algo, steps })`; steps in order `explain, explain, trace, spot, blank, mini`. Ids lowercase kebab, unique within the course (no collision with gate or tool ids; never `method`).
- xp by tier: F 40–60, E 60–80, D 90–100, C 120–140, B 160–180, A 200–240, S 280–400.
- `requires` lists lesson ids in this course; `gates` lists at least one gate id from `src/courses/patterns/gates.js`; `tools` at most two `tool-*` ids from the patterns armoury. Every one of the six tools must be required by at least one lesson.
- Content order: explain 1 is Dax's tangle (move `brute force`), explain 2 the shape with a `code` block (move `pick the pattern` or `name the waste`), then trace, spot, blank, mini. Explain steps 2–5 lines; at least one line starts with `“`.
- Prose rule: explain lines, the blank intro, the mini mission and hint never name the pattern or principle (no "factory", "observer", "singleton", "strategy", "single responsibility", "open/closed", "Liskov", "dependency inversion", "template method", "iterator", "decorator", "adapter", "facade", "command", "state pattern", "builder", "composition over inheritance"). Only `algo`, spot options and a spot's `problem`/`why` may. Mandated function and class names are fine.
- No `scene` anywhere (the registry test enforces it).
- Trace: 3+ frames `{ line, state, ask, note }`, `line` 1-based into `code`, `ask` a key of `state`; object values as `{ py: "Repr(...)" }`, tuples as `{ py: '(1, 2)' }`.
- Spot: 3–4 options, `answer` an index, `why` names the trap.
- Blank: `___` markers, 4–7 `check(` calls. Mini: mission names a function or method with parentheses, 4–7 checks. Test helper names start with `_t_`.
- Reference solutions: `scripts/solutions/patterns/training/<lesson-id>.py`, blocks `# === <lesson-id>/4` (blank) and `# === <lesson-id>/5` (mini).
- Voice: Marguerite teaches, Dax welds the lump, the room above the laundromat, the fence when useful. Short, wry, concrete. No real anime, manga or game references.
- `npm test`, `npm run check`, `npm run build` green at the end of every task. Baseline: 98 gates, 104 drills, 44 nodes, 18 tools.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Branch `patterns-lessons` off `training-polish`.

---

## File structure

| Path | Responsibility |
|---|---|
| `src/courses/patterns/training/<id>.js` × 18 | One lesson each. |
| `src/courses/patterns/training/index.js` | Imports the lessons, `NODES` in display order (F to S, prerequisite order within a tier), `NODE_BY_ID`. |
| `scripts/solutions/patterns/training/<id>.py` × 18 | Reference solutions for blank and mini. |
| `tests/training-tools.test.mjs` | Remove the `if (!NODES.length) continue` skip (every course now has lessons). |
| `CLAUDE.md` | Per-course content rules for lessons. |
| `docs/superpowers/specs/2026-09-12-courses-and-patterns-design.md` | Status line. |

## The lesson graph

| id | tier/xp | requires | gates | tools | title | algo |
|---|---|---|---|---|---|---|
| `one-job` | F/40 | — | onejob | tool-class | The one-job rule | Single responsibility |
| `bolt-on` | F/45 | one-job | bolton | tool-class | Bolt-on, never saw-off | Open/closed |
| `stand-in` | F/50 | one-job | standin | tool-class, tool-abstract | The stand-in | Liskov substitution |
| `the-socket` | F/50 | stand-in | socket | tool-abstract | The socket | Interface segregation and dependency inversion |
| `parts-not-bloodlines` | F/55 | stand-in | standin, layers | tool-class, tool-dataclass | Parts, not bloodlines | Composition over inheritance |
| `order-window` | E/60 | bolt-on | rigfactory, catalogue | tool-class | The order window | Factory |
| `piece-by-piece` | E/65 | one-job | rigbuilder | tool-dataclass | The rig, piece by piece | Builder |
| `one-radio` | E/70 | order-window | oneradio | tool-class | One radio | Singleton |
| `foreign-plug` | D/90 | the-socket | foreignplug | tool-abstract | The foreign plug | Adapter |
| `layers-on-the-coat` | D/95 | parts-not-bloodlines | layers, wrappedhand | tool-closure | Layers on the coat | Decorator |
| `front-desk` | D/100 | foreign-plug | frontdesk | tool-class | The front desk | Facade |
| `pick-the-play` | C/120 | the-socket, bolt-on | threeways | tool-abstract | Pick the play | Strategy |
| `tripwire` | C/130 | bolt-on | hearthewire, wireboard | tool-closure | The tripwire | Observer |
| `undo-button` | B/160 | pick-the-play | takeitback | tool-dataclass | The undo button | Command |
| `mood-of-the-mark` | B/170 | pick-the-play | readtheroom | tool-abstract | The mood of the mark | State |
| `run-sheet` | A/200 | front-desk | runsheet | tool-abstract | The run sheet | Template method |
| `walk-the-vault` | A/220 | parts-not-bloodlines | roombyroom | tool-generator, tool-dunder | Walk the vault | Iterator |
| `whole-rig` | S/300 | order-window, tripwire, pick-the-play, undo-button | wholerig | tool-dunder | The whole rig | Combining patterns |

Prerequisites form a DAG rooted at `one-job`. Display order in `index.js` is the table order.

---

### Task 1: Tier F — the five principles

**Files:**
- Create: `src/courses/patterns/training/one-job.js`, `bolt-on.js`, `stand-in.js`, `the-socket.js`, `parts-not-bloodlines.js`
- Create: `scripts/solutions/patterns/training/<same ids>.py`
- Modify: `src/courses/patterns/training/index.js` (import the five, `NODES = [oneJob, boltOn, standIn, theSocket, partsNotBloodlines]`)
- Modify: `tests/training-tools.test.mjs` (delete the line `if (!NODES.length) continue   // a course with no lessons yet (plan 3 pending)`)

**Interfaces:**
- Produces lesson ids `one-job`, `bolt-on`, `stand-in`, `the-socket`, `parts-not-bloodlines` for later `requires`.

| id | trace demonstrates | blank (`___`) | mini |
|---|---|---|---|
| `one-job` | `Ledger` split into `Book` (records) and `render(book)`: trace `render(Book().add('torch', 5))` over 4 stops asking `book.lines` as `{ py }`, `total`, the formatted list, `returns`. | `class Stock` with `add(item, n)` / `count(item)` and `def low_report(stock, threshold)` returning names below threshold: 2 blanks (dict update, comparison). | `class Roster` with `add(name, role)` and `by_role(role)` returning names in insertion order; `def headcount(roster)` returning a dict role→count, written outside the class. |
| `bolt-on` | `Checks` with `add(fn)` / `run(x)` returning names of fns that returned True; trace `run(7)` with two lambdas over 4 stops: the list after each add, the results list, `returns`. | `class Rules` with `add(name, test)` and `apply(value)` returning the first matching name or `'none'`: 2 blanks (loop test, default). | `class Pipeline` with `add(step)` (a one-argument function) and `run(value)` feeding the value through the steps in order; `run` with no steps returns the value unchanged. |
| `stand-in` | `Door` base `open(key)` False, `KeyDoor`, `CodeDoor`; trace `count_open([KeyDoor('a'), CodeDoor('1')], 'a')` over 4 stops asking each `opened` bool and the running `n`. | `class Sensor` base `read()` returns 0, `Thermo(Sensor)` returns its value, `def hottest(sensors)` returns the max read: 2 blanks (subclass return, max expression). | `class Note` with `text()` returning its string; `class Shout(Note)` whose `text()` is the upper-cased string; `def read_all(notes)` joining every `text()` with `' / '`. `read_all` must accept any object with `text()`. |
| `the-socket` | `Alarm(bell)` with `bell.ring(msg)`; a `FakeBell` recording rings; trace `Alarm(FakeBell()).fire('door')` over 3 stops: `bell.rung` list, the returned string, `returns`. | `class Report(store)` with `save(text)` calling `store.put(text)`; `class MemoryStore` with `items` and `put`: 2 blanks (delegation call, append). | `class Greeter(clock)` where `clock.hour()` gives 0–23; `greet(name)` returns `"Good morning, <name>"` before 12 else `"Good evening, <name>"`; tests plug in a `_t_Clock` fake. Also `class FixedClock(hour)` with `hour()`. |
| `parts-not-bloodlines` | `Rig` holding a `battery` part and a `blade` part, `describe()` joining their names; trace `Rig(Battery(40), Blade('diamond')).describe()` over 3 stops asking `rig.battery` as `{ py }`, the describe string, `returns`. | `@dataclass class Wheel: size: int`, `class Cart` holding a list of wheels with `add(wheel)` and `width()` summing sizes: 2 blanks (append, sum). | `class Engine(power)` and `class Radio(band)`, `class Van` built with `engine` and `radio`, `spec()` returning `f"{power}hp, {band}"`; `swap_radio(van, radio)` returning a new Van with the other radio and the same engine. |

Spot prompts (one per lesson, options may name the principle): `one-job` — "Dax's Crate class also prints the receipt. What breaks first when the receipt format changes?"; `bolt-on` — "Every new sensor means editing trip(). Which fix keeps trip() shut?"; `stand-in` — "CodeDoor.open() raises when the key is a string. What does that do to count_open?"; `the-socket` — "Alarm builds its own Bell inside __init__. Why can the tests not hear it ring?"; `parts-not-bloodlines` — "SilentDieselVan(DieselVan(Van)) needs a petrol silent van. What now?"

Story beats: `one-job` the crate on the bench that also makes coffee; `bolt-on` the alarm box with the lid; `stand-in` the duffel bag of locks; `the-socket` the burner phone that died at Halden; `parts-not-bloodlines` Dax's family tree of vans on the whiteboard.

- [ ] **Step 1: Lift the test skip** in `tests/training-tools.test.mjs`; run `node --test tests/training-tools.test.mjs` → the "required by at least one lesson" test fails for the patterns tools (expected until the lessons land).
- [ ] **Step 2: Write the five lesson files and their solutions** following `src/courses/algorithms/training/stacks.js` for shape and this plan's constraints.
- [ ] **Step 3: Register** the five in `training/index.js`.
- [ ] **Step 4: Validate and prove.** `npm run check` → `✓ 49 training nodes and 18 tools across 2 course(s) look good`; `npm test` → `… 114 training drills …`; the tool-required test still fails for tools no F lesson lists (closure, generator, dunder) until later tasks — note it, do not mask it.
- [ ] **Step 5: Prose check.** `grep -n -i -E "single responsibility|open/closed|liskov|dependency inversion|interface segregation|composition over" src/courses/patterns/training/*.js` must match only `algo:` lines and spot steps.
- [ ] **Step 6: Browser check** `one-job` and `the-socket` end to end in the patterns course (tier tab F appears, lesson opens once `tool-class` is cleared, trace answers accept, blank and mini pass with the reference solutions, "Lesson cleared", rank progress moves).
- [ ] **Step 7: Commit** `content(patterns): F-tier lessons — one job, bolt-on, stand-in, the socket, parts not bloodlines`.

---

### Task 2: Tiers E and D — making and wrapping

**Files:**
- Create: `order-window.js`, `piece-by-piece.js`, `one-radio.js`, `foreign-plug.js`, `layers-on-the-coat.js`, `front-desk.js` under `src/courses/patterns/training/`
- Create: matching `scripts/solutions/patterns/training/<id>.py`
- Modify: `training/index.js` (append in that order)

| id | trace demonstrates | blank (`___`) | mini |
|---|---|---|---|
| `order-window` | `make(kind)` over a dict `KINDS = {'cutter': Cutter, ...}`; trace `[make('torch').use(), make('cutter').use()]` over 3 stops asking `cls` as `{ py: 'Torch' }`, the `use()` string, `returns`. | `def make(kind)` looking up a dict and raising `ValueError`: 2 blanks (lookup with default, raise). | `class Kitchen` with `register(name, recipe_fn)` and `cook(name)` returning `recipe_fn()`; unknown name raises `KeyError`; `menu()` returns registered names sorted. |
| `piece-by-piece` | `RigBuilder` chain; trace `RigBuilder().battery(40).silent().build().describe()` over 4 stops asking the builder's `_battery`, `_silent`, the built `Rig` as `{ py }`, `returns`. | `class OrderBuilder` with `item(name)`, `qty(n)`, `build()` returning a `dict`: 2 blanks (return self, the dict). | `class LetterBuilder` with `to(name)`, `line(text)`, `signed(name)`, chainable, and `build()` returning the letter as one string: `"Dear <to>,\n<line>\n<line>\n— <signed>"`; missing `to` defaults to `'whoever'`. |
| `one-radio` | `Radio.get()` with a class attribute; trace `[Radio.get() is Radio.get(), Radio.get().freq]` after a `tune` over 3 stops asking `Radio._instance` as `{ py }`, the identity bool, `returns`. | `class Config` with class method `get()` and `reset()`: 2 blanks (the None check, the assignment). | `class Counter` with class method `shared()` returning one shared counter, `bump()` returning the new count, and class method `reset()`; two calls to `shared()` share the count. |
| `foreign-plug` | `MetricTape.read_cm()` vs crew expecting `inches()`; `TapeAdapter(tape).inches()`; trace `longest([TapeAdapter(MetricTape(254)), Ruler(12)])` over 3 stops asking each `inches()` value and `returns`. | `class OldSafe.crack(int)`, `class SafeAdapter(old).open(code_str)`: 2 blanks (int conversion, delegation). | `class Celsius(value)` with `c()`; `class Fahrenheit(value)` with `f()`; `class AsCelsius(fahrenheit)` exposing `c()` converting; `def coldest(readings)` returning the min `c()` over any objects with `c()`. |
| `layers-on-the-coat` | `Lined(Armoured(Coat()))`; trace `.warmth()` and `.describe()` over 4 stops from the inside out asking each layer's warmth and the final strings. | `class Timed(fn)`-style function wrapper `counted(fn)` that increments `fn.calls`: 2 blanks (increment, call through). | `def shout(fn)` returning a wrapper that upper-cases the string `fn` returns; `def twice(fn)` returning a wrapper that calls `fn` twice and returns the second result; stacking `shout(twice(f))` works. |
| `front-desk` | `Job.run()` calling `Camera`, `Guard`, `Vault`; trace `Job().run()` over 4 stops asking the growing `steps` list and `returns`. | `class Morning` facade with `run()` over `Kettle.boil()`, `Toaster.pop()`, `Door.unlock()`: 2 blanks (two calls in order). | `class Shutdown` with `run()` calling `Lights.off()` → `'lights off'`, `Alarm.arm()` → `'armed'`, `Door.lock()` → `'locked'` in that order and returning the list; plus `def quick(shutdown)` returning `shutdown.run()[-1]`. |

Spot prompts: `order-window` "Dax added a Drill class and the plan still says ValueError. What did he forget?"; `piece-by-piece` "Rig(20, 'steel', False, None, None, None, True) — which argument is silent?"; `one-radio` "Two Radio() calls, two objects, one channel. Where does the second radio come from?"; `foreign-plug` "The crew's hands call open('4417') and the fence's safe has crack(4417). Who changes?"; `layers-on-the-coat` "LinedArmouredCoat and ArmouredLinedCoat both exist. What happens with a third layer?"; `front-desk` "go() is forty lines that call three systems. Who else has to know the order?"

- [ ] **Step 1: Write the six lesson files and solutions.**
- [ ] **Step 2: Register.**
- [ ] **Step 3: Validate and prove.** `npm run check` → `✓ 55 training nodes …`; `npm test` → `… 126 training drills …`.
- [ ] **Step 4: Prose check** with `grep -n -i -E "factory|builder|singleton|adapter|decorator|facade" src/courses/patterns/training/*.js` matching only `algo:` lines, spot steps, and mandated class names (`RigBuilder`, `OrderBuilder`, `LetterBuilder`, `TapeAdapter`, `SafeAdapter`).
- [ ] **Step 5: Browser check** `order-window` and `layers-on-the-coat`; tier tabs E and D appear; E stays sealed until `bolt-on` or `one-job` is cleared as required.
- [ ] **Step 6: Commit** `content(patterns): E and D lessons — order window, piece by piece, one radio, foreign plug, layers, front desk`.

---

### Task 3: Tiers C and B — deciding, reacting, undoing, moods

**Files:**
- Create: `pick-the-play.js`, `tripwire.js`, `undo-button.js`, `mood-of-the-mark.js`
- Create: matching solutions
- Modify: `training/index.js` (append in that order)

| id | trace demonstrates | blank (`___`) | mini |
|---|---|---|---|
| `pick-the-play` | `Escape(route).go(start)` then `switch`; trace over 4 stops asking `escape.route` as `{ py: 'Sewer()' }`, the first `go`, the route after `switch`, `returns`. | `class Sorter(rule)` with `run(items)` returning `sorted(items, key=self.rule)`; two rule functions: 2 blanks (store the rule, the sorted call). | `class Pricer(policy)` where a policy is a function `price -> price`; `charge(price)` applies it; `set_policy(fn)` swaps it; policies `half(p)` and `plus_tax(p)` (×1.2, rounded to 2 places) written as plain functions. |
| `tripwire` | `Tripwire.subscribe/trip`; trace `trip('gate')` with two subscribers over 4 stops asking the `ears` list length, the `heard` list after each call, `returns`. | `class Bell` with `on(fn)` and `ring(msg)` returning the count: 2 blanks (append, the loop call). | `class Ticker` with `watch(fn)` and `set(price)` that calls every watcher with `(old, new)` only when the price changed, returning True if anyone was told. |
| `undo-button` | `Recorder.run/undo/redo` with `Move`; trace over 5 stops asking `pos` tuples as `{ py }` and the `done` stack length. | `class Append(text)` command with `do(log)`/`undo(log)` on a list, and `class History.run(cmd, log)/undo(log)`: 2 blanks (pop in undo, push in run). | `class SetCell(row, col, value)` command on a grid (list of lists) with `do(grid)` remembering the old value and `undo(grid)` restoring it; `class Sheet` with `run(cmd)` and `undo()` over its own grid; `undo` with empty history is a no-op. |
| `mood-of-the-mark` | `Mark.nudge/talk` through `Calm → Wary → Alarmed`; trace over 4 stops asking `mark.state` as `{ py: 'Wary()' }`, the `talk()` string, `returns`. | `class Green/Amber/Red` with `next()`, `class Light` with `step()` and `colour`: 2 blanks (the delegation, the name). | `class Locked` / `class Unlocked` states for a `Turnstile` with `coin()` and `push()`: coin on Locked → Unlocked, push on Unlocked → Locked, other moves keep the state; `Turnstile.state_name` gives the lowercase name; a `log` list records `'unlocked'`/`'locked'` transitions only. |

Spot prompts: `pick-the-play` "Escape has an if per route and a fourth branch nobody trusts. What changes at nine?"; `tripwire` "The wire calls the driver, the lookout and the fence by name. A fourth ear arrives. Who gets edited?"; `undo-button` "Dax stores the last position to undo. He undoes twice. Where is the second one?"; `mood-of-the-mark` "Mark has mood == 'wary' in six methods. A fourth mood arrives. How many edits?"

- [ ] **Step 1: Write the four lesson files and solutions.**
- [ ] **Step 2: Register.**
- [ ] **Step 3: Validate and prove.** `npm run check` → `✓ 59 training nodes …`; `npm test` → `… 134 training drills …`.
- [ ] **Step 4: Prose check** with `grep -n -i -E "strategy|observer|command pattern|state pattern|\bstate object" src/courses/patterns/training/*.js` matching only `algo:` lines and spot steps.
- [ ] **Step 5: Browser check** `tripwire` and `undo-button`; tier tabs C and B appear.
- [ ] **Step 6: Commit** `content(patterns): C and B lessons — pick the play, tripwire, undo button, mood of the mark`.

---

### Task 4: Tiers A and S — the run sheet, the walk, the whole rig

**Files:**
- Create: `run-sheet.js`, `walk-the-vault.js`, `whole-rig.js`
- Create: matching solutions
- Modify: `training/index.js` (append in that order)
- Modify: `CLAUDE.md`, the spec status line

| id | trace demonstrates | blank (`___`) | mini |
|---|---|---|---|
| `run-sheet` | `Job.run()` calling `prepare/execute/cleanup` with `VaultJob`; trace over 4 stops asking each step's string as it is appended and `returns`. | `class Report` with `render()` = header + `body()` + footer, `class Daily(Report)` filling `body()`: 2 blanks (the call to `self.body()`, the override). | `class Drill` with `run()` returning `[self.warmup(), self.main(), self.cooldown()]`, `warmup()` `'stretch'`, `cooldown()` `'water'`, `main()` raising `NotImplementedError`; `class Sprint(Drill)` main `'sprint 400'`; `class Lift(Drill)` main `'lift heavy'` and `warmup()` `'bands'`. |
| `walk-the-vault` | `Vault.__iter__` with `yield` and `open_rooms` generator; trace `list(open_rooms(vault))` over 4 stops asking `name`, `locked`, the growing result, `returns`. | `class Deck` with `__iter__` yielding cards and `def firsts(deck, n)` returning the first n via a counted loop: 2 blanks (yield, the stop). | `class Log` built with a list of `(level, text)`; `__iter__` yields texts; `def errors(log)` a generator yielding texts whose level is `'error'`; `def first_error(log)` returning the first or `None`; `def count_levels(log)` returning a dict level→count built by walking once. |
| `whole-rig` | `Crew.register/hire/on/emit/plan/go`; trace a five-line script over 5 stops asking `crew.roles` keys, the `hired` list, the route as `{ py }`, `go(...)`, `returns`. | `class Shop` with `register(kind, cls)`, `sell(kind)` that builds and emits `'sold'`, `on(event, fn)`, `emit(event, payload)`: 2 blanks (the build, the emit). | `class Dispatch` with `register(role, cls)`, `assign(role)` (build, emit `'assigned'`), `on/emit`, `route(strategy)` and `send(city)` returning `strategy.path(city)`; plus `class Straight` route with `path(city)` returning `f"{city} direct"`. `Dispatch` names neither a member class nor a route class. |

Spot prompts: `run-sheet` "Three copies of the sheet with three middles. Where does the order of steps live?"; `walk-the-vault` "Dax builds the full room list to find the first locked door. The vault has a million rooms. What does the walk cost?"; `whole-rig` "One object: hire by role, tell everyone, plan a route, go. Which three shapes are in it?" (answer names the three).

- [ ] **Step 1: Write the three lesson files and solutions.**
- [ ] **Step 2: Register.**
- [ ] **Step 3: Validate and prove.** `npm run check` → `✓ 62 training nodes and 18 tools across 2 course(s) look good`; `npm test` → `✓ 98 gates, 140 training drills, … all reference solutions pass` and every test file green, including "every tool is required by at least one lesson".
- [ ] **Step 4: Prose check** with `grep -n -i -E "template method|iterator|generator pattern" src/courses/patterns/training/*.js` matching only `algo:` lines and spot steps.
- [ ] **Step 5: Browser check** `walk-the-vault` and `whole-rig`; seven tier tabs F–S; rank S at the top of the ladder with "Top of the ladder for now" after clearing everything (seed `training.xp` to the ladder total and every node cleared in the slot block); status window "Lessons trained: 18 / 18", "Kit: 6 / 6". Switch to The Ledger and back; reload; both blocks intact. No console errors.
- [ ] **Step 6: CLAUDE.md** — in the training node schema section add: `Per course: lesson ids never collide with that course's gate or tool ids; the patterns course sets no scene and its prose never names a pattern (only algo, spot options and mandated names may).` In the story section, under the patterns course line, add the lesson titles in one line: `Lessons: The one-job rule · Bolt-on, never saw-off · The stand-in · The socket · Parts, not bloodlines · The order window · The rig, piece by piece · One radio · The foreign plug · Layers on the coat · The front desk · Pick the play · The tripwire · The undo button · The mood of the mark · The run sheet · Walk the vault · The whole rig.`
- [ ] **Step 7: Spec status** → `Status: implemented (plans 1–3: courses plumbing, patterns kit and heist, patterns lessons)`.
- [ ] **Step 8: Commit** `content(patterns): A and S lessons — run sheet, walk the vault, the whole rig; docs`. Then hand the branch to superpowers:finishing-a-development-branch.
