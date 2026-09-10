// src/scene/row.js
// One row of blocks — a lane, a standing pile, or a chain with arrows — plus its pins, range plates,
// gold marks, change flashes and an optional label. cells.js draws one; rows.js composes several.
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'
import { createPin } from './pin.js'

export { makeText }
export const GAP = 1.0, CHAIN_GAP = 1.5, PILE_STEP = 0.9, SIZE = 0.8
const FLASH = 0.4
const PIN_BASE = SIZE / 2 + 1.5

// Camera-fitting size of a resolved row, in cell units (width) and pile cells (height).
export function extentOf(r) {
  if (r.pile) return { width: 1.6, height: Math.max(1, r.cells.length) }
  return { width: r.cells.length * (r.chain ? CHAIN_GAP : GAP), height: 1 }
}

export function createRow(stage, parent, { label = null } = {}) {
  const { THREE } = stage
  const cache = new Map()
  const group = new THREE.Group(); parent.add(group)
  const boxGeo = new THREE.BoxGeometry(SIZE, SIZE, SIZE)
  const edgeGeo = new THREE.EdgesGeometry(boxGeo)
  const arrowGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.42, 10)
  const headGeo = new THREE.ConeGeometry(0.09, 0.2, 12)
  const cells = []         // { mesh, edges, valueSprite, indexSprite, text, flashT, marked }
  const arrows = []        // meshes between chained blocks (shaft + head per gap, one shared material per gap)
  const pins = new Map()   // key -> { group, sprite, beam, tip, from, to, t, label }
  const rangeMeshes = []
  let count = -1, pile = false, chain = false, elapsed = 0
  let labelSprite = null

  const gap = () => (chain ? CHAIN_GAP : GAP)
  // Position of cell i: along x for a lane/chain, up y for a pile (index 0 at the bottom).
  const posOf = (i, n) => pile ? new THREE.Vector3(0, i * PILE_STEP, 0) : new THREE.Vector3((i - (n - 1) / 2) * gap(), 0, 0)

  const freeCells = () => {
    for (const c of cells) { group.remove(c.mesh, c.edges, c.valueSprite, c.indexSprite); c.mesh.material.dispose(); c.edges.material.dispose() }
    cells.length = 0
    for (const a of arrows) { group.remove(a.shaft, a.head); a.mat.dispose() }
    arrows.length = 0
  }

  function buildCells(n) {
    freeCells()
    for (let i = 0; i < n; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.12, roughness: 0.35, metalness: 0.2 })
      const mesh = new THREE.Mesh(boxGeo, mat)
      const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.8 }))
      const valueSprite = new THREE.Sprite(makeText(THREE, cache, '', '#d7e6ff')); valueSprite.scale.set(1.1, 0.55, 1)
      const indexSprite = new THREE.Sprite(makeText(THREE, cache, String(i), '#6e83a6', 40)); indexSprite.scale.set(0.8, 0.4, 1)
      const p = posOf(i, n)
      mesh.position.copy(p); edges.position.copy(p)
      if (pile) {
        valueSprite.position.set(p.x, p.y, SIZE / 2 + 0.3)                  // on the front face
        indexSprite.position.set(p.x - SIZE / 2 - 0.35, p.y, 0)              // beside the left face
      } else {
        valueSprite.position.set(p.x, SIZE / 2 + 0.36, 0)
        indexSprite.position.set(p.x, -SIZE / 2 + 0.02, SIZE / 2 + 0.42)
      }
      group.add(mesh, edges, valueSprite, indexSprite)
      cells.push({ mesh, edges, valueSprite, indexSprite, text: null, flashT: 0, marked: false })
    }
    if (chain) for (let i = 0; i < n - 1; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: C.violet, emissive: C.violet, emissiveIntensity: 0.9 })
      const shaft = new THREE.Mesh(arrowGeo, mat); shaft.rotation.z = -Math.PI / 2
      const head = new THREE.Mesh(headGeo, mat); head.rotation.z = -Math.PI / 2
      const mid = (posOf(i, n).x + posOf(i + 1, n).x) / 2
      shaft.position.set(mid - 0.08, 0, 0); head.position.set(mid + 0.2, 0, 0)
      group.add(shaft, head); arrows.push({ shaft, head, mat })
    }
    if (labelSprite) { group.remove(labelSprite); labelSprite = null }
    if (label) {
      labelSprite = new THREE.Sprite(makeText(THREE, cache, label, '#6e83a6', 44)); labelSprite.scale.set(1.6, 0.42, 1)
      if (pile) labelSprite.position.set(0, Math.max(n, 1) * PILE_STEP + 0.2, 0)
      else labelSprite.position.set(posOf(0, n).x - gap() * 0.5 - 0.9, 0.1, 0)
      group.add(labelSprite)
    }
    count = n
  }

  function pinFor(key) {
    if (!pins.has(key)) pins.set(key, createPin(stage, group, cache, key))
    return pins.get(key)
  }
  // Where a pin for cell i sits: above a lane cell; pointing in from the right of a pile cell.
  const pinTarget = (i, n) => {
    const p = posOf(i, n)
    return pile ? new THREE.Vector3(1.1, p.y, 0) : new THREE.Vector3(p.x, PIN_BASE, 0)
  }

  function baseLook(cell) {
    cell.mesh.material.emissive.setHex(cell.marked ? C.gold : C.edge)
    cell.mesh.material.emissiveIntensity = cell.marked ? 0.75 : 0.12
    cell.edges.material.color.setHex(cell.marked ? C.gold : C.edge)
  }

  function update(r, { instant = false } = {}) {
    if (!r) return
    const reshape = !!r.pile !== pile || !!r.chain !== chain
    pile = !!r.pile; chain = !!r.chain
    const rebuilt = reshape || r.cells.length !== count
    if (rebuilt) buildCells(r.cells.length)
    const snap = instant || stage.reduced
    r.cells.forEach((c, i) => {
      const cell = cells[i]
      if (cell.text !== c.text) { cell.valueSprite.material = makeText(THREE, cache, c.text, '#d7e6ff'); cell.text = c.text }
      cell.marked = r.marks.includes(i)
      baseLook(cell)
      if (!snap && r.changed.includes(i)) cell.flashT = FLASH
    })
    const seen = new Set(), onCell = new Map(), reps = new Map()
    for (const p of r.pointers) {
      const n = (reps.get(p.key) ?? 0) + 1; reps.set(p.key, n)
      const id = n === 1 ? p.key : `${p.key}#${n}`
      const pin = pinFor(id); seen.add(id)
      pin.group.rotation.z = pile ? -Math.PI / 2 : 0
      pin.setLabel(p.label)
      pin.show(pinTarget(p.index, count), snap || rebuilt)
      const k = onCell.get(p.index) ?? 0; onCell.set(p.index, k + 1)
      pin.stack(k)
    }
    for (const [key, pin] of pins) if (!seen.has(key)) pin.hide()
    for (const m of rangeMeshes) { group.remove(m); m.geometry.dispose(); m.material.dispose() }
    rangeMeshes.length = 0
    if (!pile) for (const g of r.ranges) {
      const w = (g.to - g.from) * gap() + SIZE + 0.24
      const plate = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, SIZE + 0.3),
        new THREE.MeshBasicMaterial({ color: C.glow, transparent: true, opacity: 0.22 }))
      plate.position.set((posOf(g.from, count).x + posOf(g.to, count).x) / 2, -SIZE / 2 - 0.02, 0)
      group.add(plate); rangeMeshes.push(plate)
    }
  }

  const off = stage.onTick(dt => {
    elapsed += dt
    for (const pin of pins.values()) pin.tick(dt, (!stage.reduced && !pile) ? Math.sin(elapsed * 2.2) * 0.04 : 0)
    for (const cell of cells) {
      if (cell.flashT > 0) {
        cell.flashT = Math.max(0, cell.flashT - dt)
        const k = cell.flashT / FLASH
        cell.mesh.material.emissive.setHex(C.ok); cell.mesh.material.emissiveIntensity = 0.12 + 0.9 * k
        if (cell.flashT === 0) baseLook(cell)
      }
    }
  })

  const setPosition = (x, z) => { group.position.set(x, 0, z) }

  function dispose() {
    off?.()
    for (const m of rangeMeshes) { group.remove(m); m.geometry.dispose(); m.material.dispose() }
    rangeMeshes.length = 0
    freeCells()
    for (const p of pins.values()) p.dispose()
    pins.clear()
    for (const mat of cache.values()) { mat.map.dispose(); mat.dispose() }
    cache.clear()
    boxGeo.dispose(); edgeGeo.dispose(); arrowGeo.dispose(); headGeo.dispose()
    parent.remove(group)
  }

  return { update, setPosition, dispose }
}
