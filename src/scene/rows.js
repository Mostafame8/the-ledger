// src/scene/rows.js
// Kind 'rows': lanes laid front to back (first row farthest), piles standing at the right end of the
// front lane. Re-frames the camera when any row's shape changes.
import { createRow, extentOf } from './row.js'

const LANE_STEP = 1.6, PILE_STEP_X = 1.6

export function createRows(stage) {
  const { THREE } = stage
  const root = new THREE.Group(); stage.scene.add(root)
  let rows = []        // createRow handles, by position
  let shape = ''

  // Place lanes and piles; return the extent for stage.frame.
  function layout(r) {
    const lanes = r.rows.filter(x => !x.pile), piles = r.rows.filter(x => x.pile)
    const widest = Math.max(1, ...lanes.map(x => extentOf(x).width))
    const L = lanes.length
    const frontZ = ((L - 1) / 2) * LANE_STEP
    let lane = 0, pileN = 0
    r.rows.forEach((x, i) => {
      if (x.pile) { rows[i].setPosition(widest / 2 + 1.5 + pileN * PILE_STEP_X, frontZ); pileN++ }
      else { rows[i].setPosition(0, (lane - (L - 1) / 2) * LANE_STEP); lane++ }
    })
    return { width: widest + piles.length * PILE_STEP_X, depth: Math.max(1, L), height: Math.max(1, ...piles.map(x => x.cells.length)) }
  }

  return {
    update(r, opts) {
      if (!r || r.kind !== 'rows') return
      if (rows.length !== r.rows.length) {
        for (const h of rows) h.dispose()
        rows = r.rows.map(x => createRow(stage, root, { label: x.label }))
      }
      const s = r.rows.map(x => `${x.pile}|${x.chain}|${x.cells.length}`).join(';')
      if (s !== shape) { shape = s; stage.frame(layout(r)) }
      r.rows.forEach((x, i) => rows[i].update(x, opts))
    },
    dispose() {
      for (const h of rows) h.dispose()
      rows = []
      stage.scene.remove(root)
    },
  }
}
