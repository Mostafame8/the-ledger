// src/scene/cells.js
// Kind 'cells': one row at the origin. Re-frames the camera when the row's shape changes.
import { createRow, extentOf } from './row.js'

export function createCells(stage) {
  const row = createRow(stage, stage.scene)
  let shape = ''
  return {
    update(r, opts) {
      if (!r || r.kind !== 'cells') return
      const s = `${r.pile}|${r.chain}|${r.cells.length}`
      if (s !== shape) { shape = s; const e = extentOf(r); stage.frame({ width: e.width, height: e.height }) }
      row.update(r, opts)
    },
    dispose: () => row.dispose(),
  }
}
