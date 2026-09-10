# Training room — 3D scenes, wave 2b: the grid floor and the number line

Date: 2026-09-10
Status: approved in brainstorm, awaiting implementation plan
Builds on: wave 1 (`cells`) and wave 2a (`at`, `pile`, `chain`, `rows`)

## Purpose

Two shapes remain that blocks in a row cannot show: a 2-D table (grids, flood fill, grid BFS,
the LCS and palindrome tables) and a stretch of numbers with intervals on it (merging
intervals, the greedy event pick, binary search over an answer range). This wave adds two
kinds, `grid` and `line`, and puts scenes on nine more items. Dicts, graphs and trees stay
for wave 2c.

## Non-goals

- No camera auto-motion; no story-prop skins. Same as before.
- No drawing of Python-text state (`grid-bfs`'s `queue` is `{ py: '…' }` and stays off the
  table; the cursor alone tells the story).
- The `tool-table` armoury drill holds two grids at once (`good`, `bad`); it waits for a
  multi-grid layout and is not part of this wave.
- No per-lesson camera work.

## Content model

### Kind `grid`

```js
scene: {
  kind: 'grid',
  data: [[0, 0, 0], [0, 1, 0]] | 'grid' | 'table',   // literal 2-D list, or a state key (needs init)
  init: [[0, 0], [0, 0]],                             // the grid before the first frame
  cursor: ['r', 'c'],                                 // optional: two state keys, a pin above tile (r, c)
  marks: ['v'],                                       // optional: gold tiles whose text equals the value
  heads: { rows: ['', 'a', 'b'], cols: ['', 'b'] },   // optional: literal head texts along the left and top
  labels: { r: 'row', c: 'col' },                     // optional caption words for the cursor keys
  states: [...],                                      // explain only
}
```

Rules:

- `data` is a rectangular 2-D list (every row the same length) or a state key with a
  rectangular `init`. The key rule is wave 2a's (identifier, or `init` present). If a frame
  lacks the key the previous grid stays.
- Tiles are flat blocks on the floor. A tile's text is `cellText` of its value with two
  exceptions: `True` draws as a lit gold tile with no text and `False` as a dark tile with no
  text, so boolean tables read as a pattern.
- `cursor` names exactly two keys (row, column). Both must be present and integers within
  the grid for the pin to show; a missing or `None` key hides it. Values are range-checked
  by the validator: `0 ≤ r < rows`, `0 ≤ c < cols` wherever both keys appear in a frame.
- `marks` light every tile whose text equals the value (same rule as cells).
- `heads.rows` has exactly `rows` entries, `heads.cols` exactly `cols`; dim sprites sit
  left of each row and above each column. Empty strings draw nothing.
- Row indices sit left of the grid and column indices above it when `heads` is absent.

### Kind `line`

```js
scene: {
  kind: 'line',
  axis: [0, 12],                                      // integer ends of the number line
  lanes: [                                            // 0–2 lanes of interval bars (omit for a bare axis)
    { label: 'events', bars: [[1, 4], [2, 3], [3, 5], [5, 6]] },      // literal pairs
    { label: 'kept',   bars: 'out', init: [] },                        // state key of pairs
  ],
  ticks: [3, 6, 7, 11],                               // optional: literal dim markers on the axis
  span: ['s', 'e'],                                   // optional: two keys, a lit stretch of the axis
  pins: ['lo', 'hi', 'mid'],                          // optional: keys whose VALUE is a position on the axis
  labels: { lo: 'low', hi: 'high' },                  // optional captions for pins and span keys
  states: [...],                                      // explain only
}
```

Rules:

- `axis` is `[a, b]` with integers `a < b`. Every literal bar, tick, and every pin/span value
  the validator sees must lie within `[a, b]`.
- A lane's `bars` is a literal list of `[start, end]` pairs (`start ≤ end`) or a state key
  with an `init` list of pairs. Lanes stack front to back (first farthest), each with a label
  sprite at its left. A bar is a slim block from `start` to `end` on the lane; bars of one
  lane that changed since the previous stop flash.
- `span` is two keys; when both are present and integers, the stretch between them glows on
  the axis (a wave-1 range plate, on the axis lane).
- `pins` are keys whose values are axis positions; the pin stands on the axis at that value.
  Hidden when missing or `None`.
- `ticks` are literal dim markers with their number beneath.

### Which items get scenes

`grid` (5): `grids` (`[[1, 2], [3, 4]]`, marks `v`), `flood-fill` (`grid`, init
`[[0, 0], [0, 0]]`, cursor `r c`), `grid-bfs` (`[[0, 0, 0], [0, 1, 0]]`, cursor `r c`),
`two-strings` (`table`, init 3×2 zeros, cursor `i j`, heads rows `['', 'a', 'b']` cols
`['', 'b']`), `interval-dp` (`table`, init 3×3 false, cursor `i j`, heads rows and cols
`['a', 'b', 'a']`).

`cells` (1): `dp-grid` (`row`, init `[]`, pointer `c`).

`line` (3): `intervals` (axis `[0, 8]`, lane `given` literal `[[1,3],[2,4],[6,7]]`, lane
`kept` key `out` init `[]`, span `start end`), `greedy` (axis `[0, 7]`, lane `events`
literal, span `s e`, pin `end`), `search-the-answer` (axis `[0, 12]`, ticks `[3, 6, 7, 11]`,
span `lo hi`, pins `lo hi mid`, labels `lo: low, hi: high`, no lanes). `search-the-answer` drops its wave-2a `cells`
scene in favour of the line.

Nine items. Every item also gets an explain-step loop of two to five states on its
code-bearing explain.

### Resolution

`resolve()` returns for `grid`: `{ kind: 'grid', rows, cols, tiles: [{ r, c, text, bool }],
cursor: { r, c, label } | null, marks: [[r, c]...], changed: [[r, c]...], heads, source }`
where `bool` is `true`/`false`/`null`. For `line`: `{ kind: 'line', axis, lanes: [{ label,
bars: [{ from, to }], changed: [index...], source }], ticks, span: { from, to } | null,
pins: [{ key, at, label }] }`. Both honour the previous-source fallback like rows.

## Rendering

### Files

```
src/scene/
  model.js     resolveGrid, resolveLine; resolve() dispatches on kind
  validate.js  gridShape/gridWalk, lineShape/lineWalk
  pin.js       createPin(stage, parent, cache) — the violet pin, shared by row, grid and line
  grid.js      createGrid(stage): tiles, index/head sprites, cursor pin, marks, flashes
  line.js      createLine(stage): axis rail with numbers, lanes of bars, ticks, span plate, pins
src/components/SceneView.vue  dispatch map { cells, rows, grid, line }
```

`row.js` switches to `pin.js` with no visual change.

### Look

- Grid: tiles `0.8 × 0.16 × 0.8` at `1.0` spacing, on the floor plane; text sprite on the
  tile; `True` tiles gold-lit, `False` tiles near-black with a faint edge. The cursor pin
  hangs above tile `(r, c)` and slides between tiles. Row heads/indices sit left, column
  heads/indices above (farther from the camera). Changed tiles flash green. Camera:
  `frame({ width: cols, depth: rows + 1, height: 1 })` from front-high; row 0 is the far row,
  so the grid reads like the printed table.
- Line: an axis rail along x from `axis[0]` to `axis[1]` at `1.0` unit per integer, with a
  number sprite under every integer. Lanes are `0.9` apart along depth, bars are `0.4`-tall
  blocks from `start` to `end` (a zero-length bar is a single `0.3` block). Ticks are small
  dim posts on the rail. The span is a glow plate on the rail. Pins stand on the rail at their
  value. Camera: `frame({ width: axis[1] - axis[0] + 2, depth: lanes + 1 })`.
- No auto-orbit. Reduced motion snaps.

### Behaviour

- A change in grid size, lane count, or axis rebuilds; pins snap; changed tiles/bars flash.
- Disposal releases every tile, bar, sprite and pin.
- Explain loops, WebGL fallback, and the trace-step masking carry over unchanged. Because
  `cursor` and `span` read two keys, a stop that asks for one of them hides the whole cursor
  or span for that stop; the masked merge with the previous frame keeps the picture stable.

## Validation

- `grid`: rectangular `data`/`init`; `cursor` exactly two strings that both appear in some
  frame/state; cursor ints in range wherever both are present; `marks` strings appearing
  somewhere; `heads` lengths equal the grid's dimensions; `labels` ⊆ cursor keys.
- `line`: `axis` two ints ascending; 1–2 lanes with unique labels; bars literal pairs within
  the axis with `start ≤ end`, or a key with `init`; `ticks` ints within the axis; `span`
  exactly two keys appearing somewhere, values within the axis wherever both are present;
  `pins` strings appearing somewhere, values within the axis wherever present;
  `labels` ⊆ `pins ∪ span`.
- Everything else as wave 2a.

## Testing

- Model tests: grid tiles/bool flags, cursor hidden on missing key, marks, changed by
  position, prev fallback; heads passthrough; line bars from literal and key, span/pins
  hidden and shown, changed bars.
- Validator tests: ragged grid rejected; cursor out of range names the frame; heads length
  mismatch; axis descending; bar outside axis; three lanes rejected; span with one key.
- Browser: `flood-fill` (tiles turn from 0 to 5 with flashes; cursor hops), `interval-dp`
  (boolean pattern grows), `two-strings` (heads visible), `intervals` (kept lane grows,
  span moves), `search-the-answer` (three pins narrow in), reduced motion, no console errors.

## Rollout

1. Engine: `pin.js` extraction (row.js unchanged visually), model + validator (TDD),
   `grid.js`, `line.js`, SceneView dispatch.
2. Content: five grids, one cells, three lines.
3. Docs. Wave 2c (dict, graph, tree) in its own spec.
