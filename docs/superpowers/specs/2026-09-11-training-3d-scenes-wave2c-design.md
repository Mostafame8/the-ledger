# Training room — 3D scenes, wave 2c: dicts, graphs, trees, the call stack

Date: 2026-09-11
Status: approved, not yet implemented (branch training-3d-wave2c)
Builds on: wave 1 (`cells`), wave 2a (`at`, `pile`, `chain`, `rows`), wave 2b (`grid`, `line`)

## Purpose

Twelve items still have no picture on the table: the two dictionary lessons and the dict tool,
the three graph items, the three tree items (binary trees, the tree-node tool, tries), the two
recursion items and the two-grid table tool. This wave adds two kinds, `graph` and `tree`,
extends `cells` with a dict form and `grid` with a side-by-side pair, and gives recursion a
call-stack pile using the existing `rows` kind. It also adds one content-model rule, the twin
value, so a trace can keep its Python answer text and still hand the table a drawable value.

## Non-goals

- No camera auto-motion; no story-prop skins. Same as before.
- No parsing of Python text. The table never reads a `py` string; where a picture needs a
  set, an int-keyed dict, a tuple or `inf`, the frame carries a `val` beside `py`.
- No dedicated dict or call-stack renderer. A dict is a row of blocks with key text; a call
  stack is a pile.
- No auto layout for graphs. Positions are authored.
- No composing two kinds in one scene (a tree next to a pile, say). `trees` shows the tree
  and leaves `returns` to the state panel.
- No per-lesson camera work.

## Content model

### Twin values

A state value in a trace frame or an explain state may be `{ py: '…', val: <literal> }`.
Answers keep reading `py` through `pyLiteral`, which already returns `v.py` and ignores the
rest. The table reads `val` when it is present and the plain value otherwise, through one
helper, `valueOf(v)`, that every resolver uses. `val` is a JS literal in the same dialect as
any other state value (arrays, objects, numbers, strings, `null`, and `{ py }` elements for
things like `inf`).

Examples: `seen: { py: '{0, 1, 2}', val: [0, 1, 2] }`,
`store: { py: '{1: 1}', val: { 1: 1 } }`,
`dist: { py: '[0, 1, 4, inf]', val: [0, 1, 4, { py: 'inf' }] }`,
`root: { py: "{'t': {'o': {'#': True}}}", val: { t: { o: { '#': true } } } }`.

### Kind `cells` — dict form

`data` may be a literal object or a state key whose value is a plain object (`init: {}`).
The row shows one block per entry in entry order, the key's text where the index sprite sits
and the value's text on top. `at`, `marks`, `pile`, `chain` and `labels` work as on a list
row; `pointers` and `ranges` are rejected on a dict row because there are no indices. On a
dict row `at` also matches a block whose key equals the value's text, so `at: ['ch']` pins the
letter's card. A block that appeared since the previous stop flashes; a block whose value
changed flashes.

Entry order is JavaScript's: integer-like keys ascending, then string keys in insertion
order. This is fine for every use in this wave (the `caches` store's order is carried by the
`order` lane).

### Kind `graph`

```js
scene: {
  kind: 'graph',
  adj: [[1, 2], [0, 3], [0], [1]]            // per node: neighbour indices …
     | [[[1, 1], [2, 4]], [[0, 1], [2, 2]], …] // … or [neighbour, weight] pairs …
     | 'adj',                                  // … or a state key (needs init)
  init: [[], [], [], []],
  pos: [[0, 0], [2, 0], [0, 2], [2, 2]],       // one [x, z] per node in floor units; required
  names: ['ana', 'boyd', 'cal', 'dee'],        // optional node text; default is the index
  directed: false,                             // arrows when true; undirected edges are merged (u < v)
  at: ['node', 'nxt'],                         // pins on nodes; the key's value is a node index
  marks: ['seen'],                             // keys whose value is a list of node indices → gold nodes
  badges: 'dist',                              // key whose value is a list indexed by node → text under each node
  labels: { node: 'here', nxt: 'next' },
  states: [...],                               // explain only
}
```

Rules:

- The node count is `pos.length`. `adj` (literal or `init`) has exactly that many entries.
  Every neighbour is an int in `0..n-1`; a weight is an int. Mixing plain neighbours and
  pairs inside one graph is rejected.
- Undirected: an edge appearing from both ends draws once. Directed: each entry is an arrow.
- `at` keys pin a node when the value is an int in range; hidden when missing or `None`.
- When two `at` pins stand on adjacent nodes, that edge glows (the relaxation edge, the
  BFS step).
- `marks` values are lists of node indices; each listed node turns gold. A missing key
  marks nothing.
- `badges` is one key whose value is a list of length `n`; entry `i` is drawn under node `i`
  through `cellText`. Missing key: no badges.
- Edges added since the previous stop flash. A change in node count rebuilds.

### Kind `tree`

```js
scene: {
  kind: 'tree',
  data: { val: 1, left: { val: 2 }, right: { val: 3 } }   // a binary node …
      | { t: { o: { '#': true } } }                       // … or a map node …
      | 'root',                                           // … or a state key (needs init)
  init: {},
  at: ['root.val', 'ch'],       // pins by node-text match, same rule as `at` on cells
  marks: ['found'],             // keys whose value's text matches node text → gold nodes
  labels: { 'root.val': 'here' },
  states: [...],
}
```

Rules:

- A node is either a **binary node**, an object with a `val` key and optional `left` and
  `right` (each a node or `null`), or a **map node**, any other object whose keys are child
  labels and whose values are child nodes. A child whose value is `true` (the `'#'` end mark)
  is not drawn; it lights its parent gold.
- Node text: `cellText(val)` for a binary node; the key it hangs from for a map node. The
  root of a map tree has no key and shows `·`.
- Each node has an id, its path from the root: `''` for the root, `L`/`R` steps for binary
  children (`'L.R'`), the key for map children (`'t.o'`). Ids are stable while the tree
  grows, so a node keeps its block and new nodes flash.
- Layout is automatic: a leaf is one unit wide, a node is as wide as its children together
  and sits centred above them, one level per unit down from the root. The whole tree is
  centred on the table.
- Depth at most 6, nodes at most 31.
- `at` and `marks` match by text against every node; each match gets a pin or gold, as
  wave 2a's `at` on rows does.

### Kind `grid` — side-by-side pair

```js
scene: { kind: 'grid', grids: [{ label: 'good', data: 'good', init: [[0, 0, 0], [0, 0, 0]] },
                                { label: 'bad',  data: 'bad',  init: [[0, 0, 0], [0, 0, 0]] }] }
```

`grids` has one or two entries with unique labels; each has the wave-2b `data`/`init` rules.
Grids sit left and right with a label sprite in front of each. The single form (top-level
`data`) stays and is sugar for one unlabelled entry. `cursor` and `heads` are allowed only
in the single form; `marks` apply to every grid. `data` and `grids` together are rejected.

### The call stack

No new kind. `recursion` and `tool-recursion` frames gain a `calls` key holding the
arguments of the frames on the stack, bottom first (`[123, 12, 1]`). The scene is a `rows`
pile:

```js
scene: { kind: 'rows', rows: [{ label: 'calls', data: 'calls', init: [], pile: true, at: ['n'] }] }
```

The pin sits on the frame being entered on the way down and on the frame returning on the
way up. The pile rises, then falls.

### Which items get scenes

| item | scene |
|---|---|
| `frequency` | cells dict `tally`, init `{}`, at `ch` |
| `tool-dict` | cells dict `counts`, init `{}`, at `n` |
| `caches` | rows: `store` dict (twin val), `order` lane with at `key` |
| `graphs` | graph, adj literal, pos square, at `node nxt`, marks `seen` (twin val) |
| `weighted-graphs` | graph, weighted adj literal, at `node nxt`, badges `dist` (twin val with `{ py: 'inf' }`) |
| `tool-graph` | graph, adj key `adj`, init four empty lists, at `u v` |
| `trees` | tree literal 1/2/3, at `root.val` |
| `tool-tree-node` | tree literal halden/vaults/floor, at `who under` |
| `tries` | tree key `root`, init `{}`, twin val nested object, at `ch` |
| `recursion` | rows pile `calls`, at `n`; frames gain `calls` |
| `tool-recursion` | rows pile `calls`, at `n`; frames gain `calls` |
| `tool-table` | grid pair `good`, `bad` |

Twelve items. Every item also gets an explain-step loop of two to five states on its
code-bearing explain. `graphs`'s queue, `weighted-graphs`'s heap and the `py` text of every
twin value stay in the state panel only.

Content edits to existing frames are additive: a `val` beside an existing `py`, or a new
`calls` key. No `ask`, no `py` text and no reference solution changes.

### Resolution

`valueOf(v)` returns `v.val` when `v` is an object carrying `py` and `val`, else `v`. Every
resolver reads state values through it.

- `resolveRow` on a dict row returns the wave-2a shape with `key` on each cell:
  `cells: [{ index, text, key }]`; `changed` by position.
- `resolveGraph(scene, state, prev)` → `{ kind: 'graph', directed, nodes: [{ i, name, pos,
  badge, marked }], edges: [{ u, v, w, glow, changed }], pins: [{ key, node, label }],
  source }`.
- `resolveTree(scene, state, prev)` → `{ kind: 'tree', nodes: [{ id, text, x, depth, end,
  parent }], pins: [{ key, id, label }], marks: [id], changed: [id], width, height, source }`.
- `resolveGrid` returns `{ kind: 'grid', grids: [{ label, rows, cols, tiles, changed, source }],
  cursor, marks, heads }`; the single form yields one entry. The renderer reads `grids` only.
- Previous-source fallback as in wave 2a, per grid entry and per key.

## Rendering

### Files

```
src/scene/
  model.js     valueOf; dict rows; resolveGraph; resolveTree; grid pair
  validate.js  twin-value, dict-row, graph, tree and pair rules
  row.js       key sprite in place of the index sprite on dict rows
  grid.js      one group per grid entry, side by side, label sprite in front of each
  graph.js     createGraph(stage): node blocks at pos, edge rods, weight sprites, badges, pins, marks, glow, flashes
  tree.js      createTree(stage): node blocks by layout, rods to parents, pins, end-lit nodes, flashes
src/components/SceneView.vue  dispatch map gains graph, tree
```

### Look

- Dict row: as a list row; the key's text (dim, small) replaces the index under each block.
- Graph: node blocks of the row `SIZE` at `pos`, name sprite on top, badge sprite beneath
  the front face. Edges are `0.05` rods lying on the floor between block centres; a weight
  sprite sits at the midpoint; directed edges end in a cone. Marked nodes go gold-emissive;
  the active edge takes the glow colour. New edges flash. Camera:
  `frame({ width: xExtent + 1, depth: zExtent + 1 })`.
- Tree: root at the top, levels `1.1` apart in y, leaves `1.0` apart in x, centred. Rods
  from each node to its parent. Map nodes show their key; `'#'`-lit nodes glow gold. Pins
  hang above matched nodes. Camera: `frame({ width: leaves, height: depth + 1 })` with the
  target raised to the tree's middle.
- Grid pair: grids `1.0` apart along x, label sprite in front of each, one camera frame over
  both.
- No auto-orbit. Reduced motion snaps.

### Behaviour

- Node count, adjacency shape, tree shape or grid size change → rebuild; pins slide; new
  edges, nodes and tiles flash.
- Disposal frees every rod, block, sprite and pin.
- Explain loops, the WebGL fallback and trace-step masking carry over unchanged: a stop that
  asks for a key hides only that key's pin, mark or badge for that stop.

## Validation (`scripts/check-training.mjs`)

- Twin value: `val` appears only beside `py`; `val` itself never carries `py`. Checked on
  every frame and explain state, whether or not a scene is present.
- Dict rows: a literal object, or a key whose `init` is an object; `pointers`/`ranges`
  rejected; a frame whose value for the key is an array on a dict row (or an object on a
  list row) names the frame.
- Graph: `pos` is a list of `[x, z]` int pairs; `adj` length equals `pos.length`; every
  neighbour in range; weights ints; no mixing of plain and weighted entries; `names` length
  equals node count; `at` values in range wherever present; `marks` values lists of in-range
  ints; `badges` value has length `n` wherever present; every referenced key appears in some
  frame or state; `labels` ⊆ `at`.
- Tree: every node is a binary node or a map node; a node with `val` and other non-`left`/
  `right` keys is rejected; map keys are non-empty and contain no whitespace; depth ≤ 6, nodes ≤ 31; `data` key needs
  `init`; `at`/`marks` keys appear somewhere; `labels` ⊆ `at ∪ marks`.
- Grid pair: 1–2 entries, unique labels, each rectangular; `cursor` or `heads` with `grids`
  rejected; `data` and `grids` together rejected.
- Calls pile: no new rule; the wave-2a pile rules cover it.

## Testing

- Model: `valueOf` unwraps and passes plain values through; dict row entries carry keys and
  growth is flagged as changed; graph nodes and edges from a literal and from a key,
  undirected merge, weights, pins, marks, badges, active-edge glow, changed edges; tree layout
  for a three-node binary tree and a two-word trie, stable ids across growth, end-lit parent,
  pins by text; grid pair from `grids` and single-form equivalence.
- Validator: `val` without `py` rejected; `pos` length mismatch; neighbour out of range;
  `badges` of the wrong length names the frame; a node with both `val` and a map key; three
  grids rejected; `cursor` with `grids`.
- Reference solutions: `recursion` and `tool-recursion` frames change only by an added key;
  `npm test` still proves every drill.
- Browser: `frequency` (dict grows, key text), `graphs` (seen turns gold, pin hops, edge
  glows), `weighted-graphs` (badges fall from `inf`), `tool-graph` (edges appear with
  flashes), `tries` (a branch grows), `trees` (the pin walks the tree), `recursion` (the pile
  rises, then the pin falls), `tool-table` (both `bad` tiles light), reduced motion, no console
  errors, the heist screen makes no scene request.

## Rollout

1. Engine, TDD each step: `valueOf` and dict rows in `model.js` and `row.js`; graph model,
   validator and `graph.js`; tree model, validator and `tree.js`; grid pair; SceneView
   dispatch.
2. Content: twelve items with explain loops. Reference solutions untouched.
3. Docs: CLAUDE.md scene bullet, this spec's status, a browser check on the production
   build. Commit, no push.
