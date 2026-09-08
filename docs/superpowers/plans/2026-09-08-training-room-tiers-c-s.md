# Training Room Tiers C–S Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the remaining 24 training lessons (tiers C, B, A, S) covering every technique used by Arc III–V gates, so the training rank ladder runs F through S.

**Architecture:** Content only. Same node schema, constructors, validator, reference-solution proofs, and lesson engine as tiers F–D. Four content batches, one per tier, each a separate task with the same review loop. No engine change is expected; if one is needed it must be reported, not improvised.

**Tech Stack:** Same as the parent plan.

**Spec:** `docs/superpowers/specs/2026-09-08-training-room-design.md` (see "Content plan, tiers C–S" appended to the spec) and this file's tables.

## Global Constraints

- Everything in the parent plan's Global Constraints applies (`docs/superpowers/plans/2026-09-08-training-room.md`).
- XP by tier: C 120–140, B 160–180, A 200–240, S 280–400 (already enforced by `scripts/check-training.mjs`).
- Every technique node: 2 explain steps (Dax's brute force or naive habit, then the waste named or the pattern shown with a code block), then trace, spot, blank, mini in that order.
- Trace frames hand-authored and mechanically verified with `sys.settrace` before commit. Tuples/sets/dicts that JS cannot express as `{ py: '…' }`.
- `blank` templates contain `___`; `mini` names its function; `tests` have 4–7 `check(...)` including an edge case; `inplace(fn, seq)` for in-place drills; helper names prefixed `_t_`.
- For drills over provided classes (`Node`), tests and reference blocks define the class only if missing, following `linked-lists.js` and `trees.js`.
- Minis are easier than the gates they prepare. A mini may not be the same function as a gate's mission.
- Files written only with the Write and Edit tools (UTF-8, no BOM, no mojibake). Committed line endings are CRLF by repo convention.
- After each batch: `npm run check`, `npm test`, `npm run build`, and a browser walk of two nodes.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 15: Content batch — C nodes

**Files:**
- Create: `src/data/training/grid-bfs.js`, `flood-fill.js`, `recursion.js`
- Create: `scripts/solutions/training/<same ids>.py`
- Modify: `src/data/training/index.js` (append `gridBfs, floodFill, recursion`)

| id | tier/xp | requires | gates | trace demonstrates | blank function (`___`) | mini function |
|---|---|---|---|---|---|---|
| grid-bfs | C/120 | stacks, grids | sewers, oranges | `steps_to(grid, start, goal)` on a 2×3 grid with one wall; ask the queue (as a list of tuples via `{py}`) and the distance at 5 stops | `neighbours(grid, r, c)` returning open in-bounds cells up/down/left/right (2 blanks: bounds test, open test) | `count_reachable(grid, start)` number of open cells reachable from start, including start |
| flood-fill | C/130 | grid-bfs | islands | `fill(grid, r, c, colour)` recursion on a 2×2 grid; ask `grid` after each paint (4 stops) | `fill(grid, r, c, new)` recursive (2 blanks: stop condition, the four recursive calls' target colour test) | `region_size(grid, r, c)` count of cells in the connected region of equal value containing (r, c) |
| recursion | C/120 | trees | letters, perms, safe | `sum_digits(n)` on 123: ask the return at each frame bottom-up (4 stops) | `power(b, e)` with `e >= 0` (2 blanks: base case, recursive step) | `binary_strings(n)` every string of length n over `'0'`/`'1'`, in lexicographic order; `['']` for n = 0 |

Story beats: grid-bfs — the flooded tunnel map, Dax wants to try every corridor; Marguerite hands him a queue of junctions and says "rings, not corridors". flood-fill — the vault floor plan, spilled ink spreading through connected air cells. recursion — a folded note: "read the first line, then hand the rest of the note to someone who reads notes"; Dax refuses to trust a function that calls itself.

- [ ] **Step 1: Write the three node files and reference solutions** per the Global Constraints, following `src/data/training/two-pointers.js` and `trees.js`.
- [ ] **Step 2: Register** in `index.js`.
- [ ] **Step 3: Validate and prove.** `npm run check` → `✓ 23 training nodes look good`; `npm test` → `… 44 training drills …, all reference solutions pass`; `npm run build`.
- [ ] **Step 4: Browser check** `grid-bfs` and `recursion` end to end; confirm a C tab appears.
- [ ] **Step 5: Commit** `content(training): C-tier nodes for grid search, flood fill, recursion`.

---

### Task 16: Content batch — B nodes

**Files:**
- Create: `src/data/training/graphs.js`, `topo-order.js`, `intervals.js`, `heaps.js`, `sorting.js`, `enumeration.js`
- Create: `scripts/solutions/training/<same ids>.py`
- Modify: `src/data/training/index.js` (append `graphs, topoOrder, intervals, heaps, sorting, enumeration`)

| id | tier/xp | requires | gates | trace demonstrates | blank function (`___`) | mini function |
|---|---|---|---|---|---|---|
| graphs | B/160 | grid-bfs | clone, bipartite, ladder | `reachable(adj, start)` BFS over a 4-node adjacency list; ask `seen` (as `{py}` set) and the queue (5 stops) | `build_adj(n, edges)` undirected adjacency lists (2 blanks: the two appends) | `hops(adj, s, t)` fewest edges from s to t, `-1` if unreachable, `0` if `s == t` |
| topo-order | B/170 | graphs | topo, alien | Kahn's algorithm over 4 tasks: ask `indeg` list and the queue (5 stops) | `topo(n, edges)` (2 blanks: seeding the queue with zero-indegree nodes, decrementing a neighbour) | `can_finish(n, edges)` True if the dependency graph has no cycle |
| intervals | B/160 | tracking | timetable, meetings | `merge(intervals)` over `[[1,3],[2,4],[6,7]]`: ask the merged list after each step (4 stops) | `total_covered(intervals)` length covered by the union (2 blanks: overlap test, extend end) | `has_overlap(intervals)` True if any two intervals overlap (touching does not count) |
| heaps | B/170 | tracking | heap, meetings, task | `heapq` pushes and pops on `[5, 1, 4]`: ask the heap list after each op (5 stops) | `k_smallest(nums, k)` ascending, using a max-heap of size k via negatives (2 blanks: push negative, pop when over size) | `k_closest(nums, x, k)` the k values closest to x, ascending; ties broken by smaller value |
| sorting | B/180 | merging | counting, sorts, quickselect | `insertion_sort([3, 1, 2])`: ask `nums` after each insert (3 stops) | `partition(nums, lo, hi)` Lomuto with last element as pivot, returns pivot index (2 blanks: comparison, final swap) | `sort_012(nums)` in place, stable not required, no `sorted()`/`.sort()`; returns None |
| enumeration | B/170 | recursion | letters, perms, safe | `subsets([1, 2])` choose/skip recursion: ask `chosen` and the output list (5 stops) | `combos(items, k)` all k-combinations in input order (2 blanks: base case, the take branch) | `letter_cases(s)` every upper/lower variant of a letters-only string, in order (lowercase branch first) |

Story beats: graphs — the informant network drawn on a napkin; Dax follows one thread at a time and gets lost. topo-order — the job's order of operations from Arc III; Marguerite wants the "nothing depends on you" tasks first. intervals — the shift board, overlapping guard shifts. heaps — the short list of most valuable items, kept current as Dax finds more. sorting — the serials, hand-sorted on the table one at a time; Marguerite makes him say why insertion is slow. enumeration — every combination of rooms, choose or skip each.

- [ ] **Step 1: Write the six node files and reference solutions.**
- [ ] **Step 2: Register.**
- [ ] **Step 3: Validate and prove.** `npm run check` → `✓ 29 training nodes look good`; `npm test` → `… 56 training drills …`.
- [ ] **Step 4: Browser check** `heaps` and `topo-order`.
- [ ] **Step 5: Commit** `content(training): B-tier nodes for graphs, topological order, intervals, heaps, sorting, enumeration`.

---

### Task 17: Content batch — A nodes

**Files:**
- Create: `src/data/training/backtracking.js`, `greedy.js`, `weighted-graphs.js`, `union-find.js`, `dp-line.js`, `dp-grid.js`, `dp-choices.js`
- Create: `scripts/solutions/training/<same ids>.py`
- Modify: `src/data/training/index.js` (append `backtracking, greedy, weightedGraphs, unionFind, dpLine, dpGrid, dpChoices`)

| id | tier/xp | requires | gates | trace demonstrates | blank function (`___`) | mini function |
|---|---|---|---|---|---|---|
| backtracking | A/200 | enumeration, flood-fill | safe, wordsearch | `pick(nums, target)` subset-sum search with undo over `[2, 3]`, target 3: ask `chosen` at each choose/undo (5 stops) | `safe_col(cols, row, col)` queens conflict test (2 blanks: same column, same diagonal) | `count_subsets(nums, target)` number of subsets summing to target (nums positive, ≤ 8 items) |
| greedy | A/200 | intervals, heaps | task, jump, timetable, epilogue | `max_events(intervals)` sort by end, take non-overlapping: ask `end` and `count` (5 stops) | `min_coins_greedy(amount, coins)` with canonical coins `[25, 10, 5, 1]` (2 blanks: how many of this coin, remainder) | `kept_shifts(intervals)` list of kept intervals, earliest-end order, touching allowed |
| weighted-graphs | A/220 | graphs, heaps | routes, bellman, mst | Dijkstra over 4 nodes: ask `dist` list and the popped node (5 stops) | `dijkstra(n, adj, src)` (2 blanks: skip a stale pop, relax an edge) | `cheapest(n, edges, s, t)` undirected weighted cost or `-1` |
| union-find | A/220 | graphs | union, mst | `find`/`union` over 5 items: ask `parent` after each union (4 stops) | `find(parent, x)` with path compression (2 blanks: loop test, compression write) | `count_groups(n, pairs)` number of connected groups |
| dp-line | A/220 | recursion | stairs, robber, decode | `fib_table(5)` bottom-up: ask the table after each fill (5 stops) | `climb(n)` ways with steps 1 or 2, bottom-up (2 blanks: base values, recurrence) | `min_cost_climb(cost)` cheapest way to the top, starting at index 0 or 1 |
| dp-grid | A/220 | dp-line, grids | paths, minpath, edit, lcs | `count_paths(2, 3)` table row by row: ask the row after each fill (4 stops) | `min_path(grid)` (2 blanks: first row/column seed, the min recurrence) | `max_path_sum(grid)` moving right or down |
| dp-choices | A/240 | dp-line | coins, wordbreak, lis, knap | `ways(4, [1, 2])` count of ordered ways table: ask the table (5 stops) | `can_make(coins, amount)` reachable-amount table (2 blanks: seed, transition) | `count_combinations(coins, amount)` unordered combinations (coins outer loop) |

Story beats: backtracking — the safe combination, try, fail, back out, try the next; Dax kicks the safe. greedy — the couriers and the shifts, "take the one that ends first". weighted-graphs — cordons with delay prices, cheapest route out. union-find — who talks to whom, one crew or two. dp-line — the fire escape, remembering answers instead of recomputing. dp-grid — the one-way grid of the financial district, a table with two hands. dp-choices — exact change at the border, every amount built from smaller amounts.

- [ ] **Step 1: Write the seven node files and reference solutions.**
- [ ] **Step 2: Register.**
- [ ] **Step 3: Validate and prove.** `npm run check` → `✓ 36 training nodes look good`; `npm test` → `… 70 training drills …`.
- [ ] **Step 4: Browser check** `weighted-graphs` and `dp-line`; confirm the rank reaches A after clearing all lower tiers (seed xp).
- [ ] **Step 5: Commit** `content(training): A-tier nodes for backtracking, greedy, weighted graphs, union-find, and the first DP tables`.

---

### Task 18: Content batch — S nodes

**Files:**
- Create: `src/data/training/knapsack-dp.js`, `two-strings.js`, `monotonic.js`, `caches.js`, `tries.js`, `string-search.js`, `search-the-answer.js`, `interval-dp.js`
- Create: `scripts/solutions/training/<same ids>.py`
- Modify: `src/data/training/index.js` (append `knapsackDp, twoStrings, monotonic, caches, tries, stringSearch, searchTheAnswer, intervalDp`)

| id | tier/xp | requires | gates | trace demonstrates | blank function (`___`) | mini function |
|---|---|---|---|---|---|---|
| knapsack-dp | S/280 | dp-choices | knap, ledger | rolling row over two items, capacity 3: ask the row after each item (3 stops) plus the seed (4 total) | `knap(weights, values, cap)` single row (2 blanks: reverse loop, max update) | `subset_exists(nums, target)` True if some subset sums to target |
| two-strings | S/280 | dp-grid | edit, lcs, regex | `lcs_len('ab', 'b')` table: ask each filled cell (4 stops) | `edit(a, b)` Levenshtein table (2 blanks: match case, mismatch min) | `min_deletions_to_equal(a, b)` deletions from both strings to make them equal |
| monotonic | S/300 | stacks, sliding-window | deque, rain | `next_greater([2, 1, 3])` stack of indices: ask `stack` and `out` (5 stops) | `next_greater(nums)` returning next greater value or `-1` (2 blanks: pop condition, write) | `days_until_warmer(temps)` days to wait for a warmer reading, `0` if none |
| caches | S/300 | hash-maps, linked-lists | lru | LRU by list recency over ops with capacity 2: ask the order list after each op (5 stops) | `memoize(fn)` closure with a dict (2 blanks: cache hit test, store) | `first_evicted(ops, cap)` key evicted first under LRU for a list of `get`/`put` ops, `None` if none evicted |
| tries | S/300 | hash-maps, recursion | trie, ladder | nested-dict `insert` of `'to'`, `'tea'`: ask the root dict after each insert (4 stops, `{py}`) | `has_prefix(root, prefix)` (2 blanks: missing branch test, descend) | `count_with_prefix(words, prefix)` using a trie you build |
| string-search | S/320 | strings, tracking | kmp, palsub | `prefix_table('abab')`: ask the table after each fill (4 stops) | `expand(s, lo, hi)` widen while ends match, return `(lo+1, hi-1)` as a tuple (2 blanks: loop test, the two moves) | `count_occurrences(text, pat)` overlapping occurrences, naive scan allowed |
| search-the-answer | S/340 | binary-search, greedy | epilogue, median | `min_speed(piles, hours)` lo/hi/mid over a small input: ask `mid` and the feasibility result (5 stops) | `feasible(nums, k, limit)` can nums split into ≤ k pieces with max sum ≤ limit (2 blanks: overflow test, piece count) | `sqrt_floor(n)` largest x with `x*x <= n` by binary search, no `math` |
| interval-dp | S/360 | dp-grid | balloons | `is_pal` table for `'aba'` by increasing length: ask cells (4 stops) | `count_pal_substrings(s)` via the table (2 blanks: length-2 case, general case) | `longest_pal_len(s)` via the same table |

Story beats: knapsack-dp — the bag, properly; Dax packs by weight alone. two-strings — two copies of a ledger page, edits between them. monotonic — the camera sweep, the peak that matters is the most recent taller one. caches — the fence's memory, what she forgets first. tries — the code-word rack, shared prefixes share a path. string-search — a fingerprint in the wire tap, a pattern you already half matched. search-the-answer — guess a load, check it, halve. interval-dp — collapsing shell companies, the last one collapsed splits the row.

- [ ] **Step 1: Write the eight node files and reference solutions.**
- [ ] **Step 2: Register.**
- [ ] **Step 3: Validate and prove.** `npm run check` → `✓ 44 training nodes look good`; `npm test` → `… 86 training drills …`.
- [ ] **Step 4: Browser check** `monotonic` and `tries`; confirm seven tabs F–S and rank S at the top of the ladder with `Top of the ladder for now`.
- [ ] **Step 5: Commit** `content(training): S-tier nodes for knapsack, two-string tables, monotonic structures, caches, tries, string search, answer search, interval DP`.

---

## Self-review notes

- Coverage: every Arc III–V gate id appears in at least one node's `gates` list: sewers, islands, oranges, clone, topo, timetable, letters, heap, counting, meetings, sorts, quickselect, perms, safe, task, wordsearch, bipartite, routes, union, mst, bellman, stairs, robber, jump, paths, coins, minpath, decode, lis, wordbreak, knap, rain, edit, deque, lcs, lru, trie, kmp, palsub, ladder, alien, median, regex, balloons, ledger, epilogue.
- Prerequisites reference only nodes that exist by the time each batch lands (C uses D/E/F nodes; B uses C and below; A uses B and below; S uses A and below).
- Counts: 20 + 3 + 6 + 7 + 8 = 44 nodes; drills 38 + 6 + 12 + 14 + 16 = 86.
