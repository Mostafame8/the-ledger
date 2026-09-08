# Training Tools (Armoury) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Data structures become twelve unlockable "tools"; each is unlocked by a short armoury drill; a training lesson opens only when its prerequisite lessons are cleared and its tools are unlocked.

**Architecture:** Tools are flat content items (`explain, explain, trace, blank`) that reuse the lesson step engine. They live in `src/data/training/tools/`, are looked up through a combined map in the store, and gate lesson openness through `isOpen`. They never touch the tier rank ladder: tool XP is a separate "kit xp" pool. The lesson list gains an Armoury tab and tool chips; the status window gains a kit grid.

**Tech Stack:** Same as the training room: Vue 3, Vite, plain CSS in `src/style.css`, Pyodide runner, `node --test`, local Python for proofs.

**Spec:** `docs/superpowers/specs/2026-09-08-training-room-design.md` plus the approved design in this file's "Design summary".

## Global Constraints

- All constraints of `docs/superpowers/plans/2026-09-08-training-room.md` and `CLAUDE.md` apply (no dependencies, CSS only in `src/style.css`, presentation-only components, curly-quote dialogue, Write/Edit tools only for files, CRLF committed endings are repo convention).
- Tool ids are `tool-<name>` (kebab). Twelve tools, fixed order: list, string, dict, set, stack, queue, heap, recursion, linked-node, tree-node, graph, table.
- Tool shape: `{ id, xp (20–40; use 30), title (scene name), algo (plain structure name), steps: [explain, explain, trace, blank] }`. No `tier`, `requires`, `gates`. Tool prose may name the structure (it is the drill's subject).
- Tool XP never enters `training.xp`. `rankFor`, `rankProgress`, `depthOf` read lesson data only.
- Previously cleared lessons stay cleared; only opening is gated. Old saves load with no tools unlocked.
- Lessons list at most two tools. `check(...)` per drill 4–7. Trace frames verified with `sys.settrace`.
- After each task: `npm run check`, `npm test`, `npm run build`.

## Design summary

Tool table (id · algo · title): tool-list · List · The supply crate; tool-string · String · The paper tape; tool-dict · Dict · The rolodex; tool-set · Set · The blacklist; tool-stack · Stack · The tray of plates; tool-queue · Queue (deque) · The teller line; tool-heap · Heap · The priority drawer; tool-recursion · The call stack · The nested envelopes; tool-linked-node · Linked node · The next-address slip; tool-tree-node · Tree node · The chain of command; tool-graph · Adjacency list · The safehouse map; tool-table · 2-D table · The ledger grid.

Lesson → tools mapping:
- none: method, bits, tracking, search-the-answer
- list: loops, arrays-in-place, digit-arrays, binary-search, rotation, merging, prefix-sums, intervals, sorting, greedy, union-find, dp-line, dp-choices, knapsack-dp
- list, string: two-pointers, sliding-window, string-search
- table: grids, dp-grid, interval-dp
- string: strings
- dict: hash-maps, frequency
- set: sets
- stack: stacks, monotonic
- linked-node: linked-lists
- tree-node, recursion: trees
- table, queue: grid-bfs
- table, stack: flood-fill
- recursion: recursion
- graph, queue: graphs, topo-order
- heap: heaps
- recursion, list: enumeration, backtracking
- graph, heap: weighted-graphs
- table, string: two-strings
- dict, linked-node: caches
- dict, recursion: tries

Store design: `ITEM_BY_ID = { ...NODE_BY_ID, ...TOOL_BY_ID }`; `progressMap(id)` returns `training.tools` for tool ids else `training.nodes`; `nodeState(id)` checks `cleared` first, returns `open` for tools, else `isOpen(node, nodes, tools)`; `finishItem` flashes `Tool unlocked` for tools and never touches `training.xp`; computeds `toolsCleared`, `kitXp`; `trainingTab` accepts `'kit'`, and `defaultTrainingTab()` returns `'kit'` while `toolsCleared === 0`.

---

### Task 1: Pure logic and constructors

**Files:**
- Modify: `src/data/training/node.js` (add `tool`)
- Modify: `src/data/training/progress.js` (`isOpen` third arg)
- Modify: `tests/training-progress.test.mjs`

**Interfaces:** `tool(id, fields)`; `isOpen(node, nodeStates, toolStates = {})`.

- [ ] Add `export const tool = (id, fields) => ({ id, ...fields })` to `node.js` with a one-line comment.
- [ ] Change `isOpen` to also require `(node.tools || []).every(id => toolStates[id]?.cleared)`; add comments on `rankFor`/`rankProgress`/`depthOf` that they read lesson fields only.
- [ ] Tests first: a node with `tools: ['tool-x']` is closed with `{}` and open with `{ 'tool-x': { cleared: true } }`; requires-cleared-but-tool-locked and tool-cleared-but-requires-locked are both closed; `depthOf` result is unchanged when a node carries a `tools` array naming an id absent from `byId`. Existing tests unchanged and green.
- [ ] `npm test` green. Commit `feat(training): isOpen gates on tools; tool() constructor`.

### Task 2: Store, registry, validator, proofs (engine, zero tools)

**Files:**
- Create: `src/data/training/tools/index.js` (exports `TOOLS = []`, `TOOL_BY_ID`)
- Modify: `src/data/training/index.js` (re-export `TOOLS`, `TOOL_BY_ID`)
- Modify: `src/store.js`
- Modify: `scripts/check-training.mjs`
- Modify: `scripts/test-solutions.mjs`

**Interfaces:** store exports add `toolsCleared`, `kitXp`; `nodeState`, `openNode`, `next`, `back`, `activeNode` accept tool ids; `training.tools` slice; `trainingTab` may be `'kit'`.

- [ ] Registry and re-export as in the design summary.
- [ ] Store: `freshTraining()` gains `tools: {}`; add `ITEM_BY_ID`, `progressMap`; switch `enterStep`, `activeNode`, `openNode`, `next`, `back` to them; `nodeState` per design; rename `finishNode` → `finishItem` with the tool branch (`showFlash('Tool unlocked')`, no xp change); computeds `toolsCleared`, `kitXp` (sum of cleared tools' xp); `trainingTab` initialiser accepts `'kit'`; `defaultTrainingTab()` returns `'kit'` when no tool is cleared, else the existing rule; export the new computeds.
- [ ] Validator: extract per-step checks into `validateStep(ownerId, step, i)` used by both loops; tools loop (id regex `^tool-[a-z0-9]+(-[a-z0-9]+)*$`, no collision with lesson ids, xp 20–40, steps exactly `explain, explain, trace, blank`, a spoken `“` line); lessons: `tools` must be an array of known tool ids (default `[]`). Summary `✓ N training nodes and M tools look good`. Do not yet assert exactly twelve tools (Task 6 adds that).
- [ ] `test-solutions.mjs`: iterate `[...nodes, ...tools]`; `only` filter applies to tool ids too.
- [ ] `npm run check` → `✓ 44 training nodes and 0 tools look good`; `npm test` → unchanged counts; `npm run build`. Commit `feat(training): store, validator and proofs understand tools`.

### Task 3: Armoury tab, chips, kit grid

**Files:**
- Modify: `src/components/SkillTree.vue`, `src/components/StatusWindow.vue`, `src/style.css`

- [ ] SkillTree: tabs `['kit', ...populated tiers]`; kit tab label `Armoury`, count `toolsCleared / TOOLS.length`, never sealed, `title="Armoury: the tools"`; kit body lists `TOOLS` as `.gate.lesson-row` rows with `<div class="kit-badge">tool</div>` instead of the rank hexagon, `<h3>title</h3><p>algo</p>`, tag `+N xp` / `trained`; empty state paragraph "No tools yet." when `TOOLS` is empty. Lesson rows: `<div class="chips">` after the algo line, one `.chip` per tool with `TOOL_BY_ID[id].algo`, `.locked` while `s.nodeState(id) !== 'cleared'`; `needs()` appends missing tool titles. Header blurb for kit: "What the crew carries."
- [ ] StatusWindow (training block): `<div class="kit-head">Kit: <b>n / N</b> · <b>kit xp</b></div>` and a `.kit-grid` of `.kit-tile`s (`lit` when cleared, `title` = scene name, text = `algo`).
- [ ] CSS: `.kit-badge`, `.chips`, `.chip`, `.chip.locked` (`#ff8a8a`), `.kit-head`, `.kit-grid` (4 columns), `.kit-tile`, `.kit-tile.lit`.
- [ ] Browser: Armoury tab appears first, shows "No tools yet."; lesson rows unchanged (no chips yet). `npm run build`. Commit `feat(training): armoury tab, tool chips, kit grid`.

### Task 4: Tools batch 1 — list, string, dict, set, stack, queue

**Files:**
- Create: `src/data/training/tools/tool-list.js`, `tool-string.js`, `tool-dict.js`, `tool-set.js`, `tool-stack.js`, `tool-queue.js`
- Create: `scripts/solutions/training/tool-<name>.py` (block `# === tool-<name>/3`)
- Modify: `src/data/training/tools/index.js`

Per tool: explain 1 (Marguerite hands the tool over in the story, Dax misuses it, Python API in a code block), explain 2 (operations and costs: list index/append/pop O(1), insert at front O(n); string immutability, slicing, join; dict get/set O(1) average; set add/in O(1); stack via list append/pop; deque append/popleft O(1)), trace (3–5 stops over raw operations), blank (2 `___` in a tiny wrapper, 4–7 checks). xp 30. Titles from the design summary.

- [ ] Write six tool files and solutions; register in `tools/index.js` in the fixed order.
- [ ] `npm run check` → `… and 6 tools look good`; `npm test` → 92 drills; browser: Armoury lists six rows; clear `tool-stack` end to end; kit tile lights; kit xp 30; training xp unchanged.
- [ ] Commit `content(training): armoury drills for list, string, dict, set, stack, queue`.

### Task 5: Tools batch 2 — heap, recursion, linked-node, tree-node, graph, table

Same rules as Task 4. Costs: heappush/heappop O(log n), heap[0] O(1); recursion: a call frame per level, base case first, depth = stack; linked node: `Node(val, next)`, O(1) relink, O(n) walk; tree node: `Node(val, left, right)`, height, leaf test; adjacency list: `adj[u]` list of neighbours, building from edges O(V+E); 2-D table: `[[0]*cols for _ in range(rows)]`, never `[[0]*cols]*rows`, `t[r][c]`.

- [ ] Write six tool files and solutions; register. For linked-node and tree-node drills, tests define `Node` only if missing, as in `linked-lists.js`.
- [ ] `npm run check` → `… and 12 tools look good`; `npm test` → 98 drills; browser: twelve rows.
- [ ] Commit `content(training): armoury drills for heap, recursion, linked node, tree node, graph, table`.

### Task 6: Lesson tool requirements, final validator rule, docs

**Files:**
- Modify: all 44 files in `src/data/training/*.js` (add `tools: [...]` per the mapping)
- Modify: `scripts/check-training.mjs` (assert exactly 12 tools)
- Create: `tests/training-tools.test.mjs` (12 tools, id regex, no collision with `NODE_BY_ID`)
- Modify: `CLAUDE.md` (tools schema, `tools:` field, Armoury tab, kit xp separate from rank), spec addendum in `docs/superpowers/specs/2026-09-08-training-room-design.md`

- [ ] Apply the mapping exactly; `method`, `bits`, `tracking`, `search-the-answer` get `tools: []`.
- [ ] Validator exact-12 rule; unit test file; docs.
- [ ] `npm run check` → `✓ 44 training nodes and 12 tools look good`; `npm test` green; `npm run build`.
- [ ] Browser: fresh save lands on Armoury; F rows show a red `List` chip and `needs: The supply crate`; clear `tool-list` → chips normal, `loops` opens; a lesson with both requires and tools opens only when both hold; simulate an old save by deleting `training.tools` and confirm cleared lessons stay `trained`.
- [ ] Commit `feat(training): lessons require tools; docs for the armoury`.
