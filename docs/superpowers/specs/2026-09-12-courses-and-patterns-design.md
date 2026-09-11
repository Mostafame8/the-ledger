# Courses — one app, many jobs; first new course: design patterns

Date: 2026-09-12
Status: approved in brainstorm, awaiting implementation plans
Builds on: the training room (2026-09-08), save slots, the table (waves 1–2c)

## Purpose

The Ledger teaches algorithms in Python through a heist story. The same shell — system
windows, save slots, XP and ranks, gates, lessons with explain / trace / spot / blank / mini
steps, the armoury, validators and solution proofs — fits other topics. This spec turns the
app into a set of **courses** sharing that shell, and specifies the first new course:
design patterns in Python. A SQL course is expected later and shapes the runner boundary,
but is not designed here.

## Decisions taken

- One app, pluggable courses. Not one app per topic, not a monorepo.
- New courses stay in the heist world: same crew, same room above the laundromat, new jobs.
- First new course: design patterns. Runner stays Pyodide, so no runner work in this spec.
- Both tracks per course: the heist (gates in arcs) and the training room (lessons, tools).
- One save slot spans all courses. Each course has its own XP, stats, rank and progress.
- Patterns course scope: twelve classic patterns plus SOLID and composition-over-inheritance.
- No 3D in the patterns course. No step sets `scene`; three.js is never requested there.

## Non-goals

- No router. The store stays the single spine.
- No shared XP or rank across courses.
- No new runner. A SQL course adds a worker and a switch in `runner.js` later.
- No changes to the table (`src/scene/`).
- No changes to algorithms content beyond moving files.

## Architecture

```
src/
  courses/
    index.js                 COURSES in display order; courseById(id)
    algorithms/              moved from src/data/: gates.js, index.js, tests.js, training/, tools
      course.js              export const course = { ... }
    patterns/
      course.js
      gates.js, tests.js, training/ (nodes, tools, index.js)
  store.js                   + courseId, selectCourse(); reads content through `course`
  saves.js                   + upgradeData(); export version 2
  components/CourseSelect.vue  the course screen
  runner.js, pyworker.js     unchanged; course.runner === 'python' for both courses
  scene/                     unchanged
scripts/
  solutions/algorithms/      moved from scripts/solutions/ (gates + training/)
  solutions/patterns/        gates + training/
  check-gates.mjs, check-training.mjs, test-solutions.mjs   loop over COURSES
tests/
  saves.test.mjs             + migration cases
  courses.test.mjs           registry contract
```

### The course object

```js
export const course = {
  id: 'patterns',                 // unique, kebab, used as the slot block key and the solutions folder
  title: 'The Blueprint',         // scene name shown on the course screen and in the Status window
  algo: 'Design patterns',        // plain topic name under the title
  runner: 'python',               // 'python' today; a later course may add 'sql'
  stats: ['structure', 'behaviour', 'creation'],   // exactly three keys; every gate's stat is one of them
  gates: ARCS,                    // same shape as today's ARCS
  training: { NODES, TOOLS, TIERS, NODE_BY_ID, TOOL_BY_ID },
  xpPerLevel: XP_PER_LEVEL,
  titles: TITLES,                 // thresholds for titleFor()
}
```

The algorithms course exports the same object with `id: 'algorithms'`, `title: 'The Ledger'`,
`algo: 'Algorithms'`, `stats: ['logic', 'speed', 'memory']`.

`courses/index.js` exports `COURSES` (algorithms first, then patterns) and `courseById`.

### Store

The store keeps its current refs for the active course (`player.xp`, `player.stats`,
`cleared`, `notes`, `tab`, `mode`, `training`, tabs). Slot switching already loads slot data
into those refs; course switching does the same one level down.

- `courseId` ref; `course` computed = `courseById(courseId)`.
- `selectCourse(id)`: write the current block back into the slot data, load the block for
  `id` (or a fresh block built from that course's `stats`), set `data.course = id`, persist.
- Everything that today reads module-level content (`GATES`, `ARCS`, `NODES`, `TOOLS`,
  `TIERS`, `XP_PER_LEVEL`, `titleFor`, the stats list, inputs to `rankFor` /
  `rankProgress` / `isOpen`) reads from `course.value` instead. `progress.js` functions
  already take `NODES` as a parameter; the store passes the course's.
- Components never import from `courses/` directly; they read the store.
- `coursesOpen` ref for the course screen; forced open while the slot's `data.course` is null.

### Saves

Slot data shape, version 2:

```js
data = {
  player: { name },
  course: 'algorithms' | 'patterns' | null,   // last opened course; null on a fresh slot
  courses: {
    algorithms: { xp, stats, cleared, notes, tab, mode, training },
    patterns:   { ... }                        // created on first entry, same shape
  }
}
```

`upgradeData(data)` in `saves.js`, pure:
- `null` stays `null` (fresh slot).
- Data with `courses` is returned as is.
- Data without `courses` (version 1): `{ player: { name }, course: 'algorithms',
  courses: { algorithms: { xp: player.xp ?? 0, stats: player.stats ?? {...zeros},
  cleared, notes, tab, mode, training } } }`, missing fields defaulted as the store does now.
- Blocks under unknown course ids are kept untouched (a save from a newer build still loads).

Applied to every slot at load and inside `parseImport`. `validData` accepts both shapes.
Export `VERSION` becomes 2. `renameSlot` keeps writing `player.name`.

### Course screen (`CourseSelect.vue`)

Opens after a slot is chosen and from a "Jobs" button in the Status window. One row per
course: title, plain name, rank (heist level and training rank), XP, cleared counts. Fresh
slots must pick a course before the game shows. Same window look; only a row style is added
to `style.css`. The Status window shows the course title above the rank.

### Validators and proofs

`check-gates.mjs`, `check-training.mjs` and `test-solutions.mjs` iterate `COURSES`; every
message is prefixed with the course id. Per-course rules added:
- `stats` has exactly three keys; every gate's `stat` is one of them.
- Gate ids unique within a course; node and tool ids unique within a course.
- `scripts/solutions/<course>/` exists and contains a block for every gate and drill.
- `runner` is in the known set (`python`).

`tests/courses.test.mjs` asserts the registry contract: unique course ids, required fields,
algorithms first.

## The patterns course

Card: id `patterns`, title "The Blueprint", plain name "Design patterns", stats
`structure`, `behaviour`, `creation`.

Story frame: after Halden the crew has money and no kit. Marguerite wants tooling built
properly this time — rigs that survive a changed plan. Dax builds everything as one tangled
class; the learner reshapes it. Lessons happen in the room above the laundromat. Gates are
jobs of building the kit. The prose rule holds: lesson lines describe the shape ("one place
that decides what to build"); only `algo`, spot options and mandated names say "Factory".

### Arcs and gates (20)

| Arc | Ranks | Theme | Gates |
|---|---|---|---|
| I The workbench | F | principles: one job per part, extend not edit, swap parts, depend on the socket | 4 |
| II The forge | E–D | making things: factory, builder, singleton | 4 |
| III The disguise | D–C | wrapping things: adapter, decorator, facade | 4 |
| IV The play | C–B | deciding and reacting: strategy, observer, command | 4 |
| V The long con | A–S | staying in character: state, template method, iterator; a capstone mixing three | 4 |

Each mission names the classes and methods; tests call them through `check()` exactly as
today. Every mission carries a stretch that a tangled solution fails (e.g. "register a new
rig kind without editing `make`"). Gate schema, xp ranges, rank rules and the dialogue-line
rule are unchanged. `code` examples for roughly every second gate in Arcs I–II.

### Lessons (18), ordered by prerequisite

| Tier | `algo` | Title |
|---|---|---|
| F | Single responsibility | The one-job rule |
| F | Open/closed | Bolt-on, never saw-off |
| F | Liskov substitution | The stand-in |
| F | Interface segregation and dependency inversion | The socket |
| F | Composition over inheritance | Parts, not bloodlines |
| E | Factory | The order window |
| E | Builder | The rig, piece by piece |
| E | Singleton | One radio |
| D | Adapter | The foreign plug |
| D | Decorator | Layers on the coat |
| D | Facade | The front desk |
| C | Strategy | Pick the play |
| C | Observer | The tripwire |
| B | Command | The undo button |
| B | State | The mood of the mark |
| A | Template method | The run sheet |
| A | Iterator | Walk the vault |
| S | Combining patterns | The whole rig |

Step shape unchanged: two explains (Dax's tangle, then the shape with a code block), trace
(object attributes as state), spot (which shape fits; options may name patterns), blank,
mini. No `scene` anywhere. Each lesson lists `gates` it prepares and up to two `tools`.

### Armoury (6 tools)

`tool-class`, `tool-abstract` (abstract base classes), `tool-dunder` (the dunder protocol:
`__str__`, `__eq__`, `__iter__`, `__call__`), `tool-closure`, `tool-dataclass`,
`tool-generator`. Tool schema unchanged: explain, explain, trace, blank; xp 30.

### Reference solutions

`scripts/solutions/patterns/` for gates, `scripts/solutions/patterns/training/` for drills,
same block headers as today.

## Testing

- `tests/saves.test.mjs`: `upgradeData` on version 1 data, version 2 data, `null`, and data
  with an unknown course block; `parseImport` of a version 1 export.
- `tests/courses.test.mjs`: registry contract.
- Check scripts and solution proofs over both courses; algorithms output unchanged in count.
- Browser check on the production build: fresh slot → course screen → a patterns lesson and
  gate → switch to algorithms → reload; both blocks intact; the three.js chunk is not
  requested while in the patterns course; a version 1 export imports and plays.

## Rollout

Three plans, one branch each, in order:

1. **Course plumbing.** Move `src/data` to `src/courses/algorithms`, add the registry, store
   and saves changes, the course screen, validators over courses, move solutions. Ships with
   algorithms as the only course; no content change; all existing tests pass.
2. **Patterns training room.** Course file, six tools, eighteen lessons, reference solutions.
3. **Patterns heist.** Twenty gates in five arcs, reference solutions, CLAUDE.md "Courses"
   section (course object, folder layout, per-course rules).

## Risks

- The store refactor touches every component that imports content directly. Grep for
  `data/` imports first and route all reads through the store before any content work.
- Slot size grows with a second block. Blocks are small; code drafts already dominate.
- Python drills can be passed without the pattern. Stretch clauses and spot steps carry the
  concept load; the validator cannot check design, only behaviour.
