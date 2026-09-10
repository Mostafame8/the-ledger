// src/scene/grid.js
// Kind 'grid': flat tiles on the floor (row 0 farthest), row/column heads or indices, a cursor pin
// above tile (r, c), gold marks by value, lit/dark boolean tiles, green flashes on changed tiles.
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'
import { createPin } from './pin.js'

const GAP = 1.0, TILE = 0.8, H = 0.16, FLASH = 0.4

export function createGrid(stage) {
  const { THREE, scene } = stage
  const cache = new Map()
  const group = new THREE.Group(); scene.add(group)
  const tileGeo = new THREE.BoxGeometry(TILE, H, TILE)
  const edgeGeo = new THREE.EdgesGeometry(tileGeo)
  let tiles = [], heads = [], rows = -1, cols = -1, headsKey = '', cursor = null, elapsed = 0
  const xOf = c => (c - (cols - 1) / 2) * GAP
  const zOf = r => (r - (rows - 1) / 2) * GAP          // row 0 farthest (most negative z)

  const free = () => {
    for (const t of tiles) { group.remove(t.mesh, t.edges, t.sprite); t.mesh.material.dispose(); t.edges.material.dispose() }
    tiles = []
    for (const s of heads) group.remove(s)
    heads = []
  }
  const head = (text, x, z) => {
    if (!text) return
    const s = new THREE.Sprite(makeText(THREE, cache, text, '#6e83a6', 44)); s.scale.set(0.8, 0.4, 1); s.position.set(x, 0.1, z)
    group.add(s); heads.push(s)
  }
  function build(r) {
    free(); rows = r.rows; cols = r.cols
    for (const tl of r.tiles) {
      const mat = new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.12, roughness: 0.4, metalness: 0.15 })
      const mesh = new THREE.Mesh(tileGeo, mat)
      const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.8 }))
      const sprite = new THREE.Sprite(makeText(THREE, cache, '', '#d7e6ff')); sprite.scale.set(0.9, 0.45, 1)
      mesh.position.set(xOf(tl.c), 0, zOf(tl.r)); edges.position.copy(mesh.position); sprite.position.set(xOf(tl.c), H / 2 + 0.3, zOf(tl.r))
      group.add(mesh, edges, sprite)
      tiles.push({ r: tl.r, c: tl.c, mesh, edges, sprite, text: null, bool: null, marked: false, flashT: 0 })
    }
    const rh = r.heads?.rows ?? Array.from({ length: rows }, (_, i) => String(i))
    const ch = r.heads?.cols ?? Array.from({ length: cols }, (_, j) => String(j))
    rh.forEach((t, i) => head(t, xOf(0) - 0.9, zOf(i)))
    ch.forEach((t, j) => head(t, xOf(j), zOf(0) - 0.9))
    stage.frame({ width: cols, depth: rows + 1 })
  }
  const at = (r, c) => tiles.find(t => t.r === r && t.c === c)
  function look(t) {
    const gold = t.marked || t.bool === true, dark = t.bool === false
    t.mesh.material.color.setHex(dark ? 0x070b16 : C.panel)
    t.mesh.material.emissive.setHex(gold ? C.gold : C.edge)
    t.mesh.material.emissiveIntensity = gold ? 0.75 : dark ? 0.04 : 0.12
    t.edges.material.color.setHex(gold ? C.gold : C.edge)
    t.edges.material.opacity = dark ? 0.3 : 0.8
    t.sprite.visible = t.bool === null
  }

  function update(r, { instant = false } = {}) {
    if (!r || r.kind !== 'grid') return
    const hk = JSON.stringify(r.heads ?? null)
    if (r.rows !== rows || r.cols !== cols || hk !== headsKey) { headsKey = hk; build(r) }
    const snap = instant || stage.reduced
    const changed = new Set(r.changed.map(p => p.join(','))), marks = new Set(r.marks.map(p => p.join(',')))
    for (const tl of r.tiles) {
      const t = at(tl.r, tl.c); if (!t) continue
      if (t.text !== tl.text) { t.sprite.material = makeText(THREE, cache, tl.text, '#d7e6ff'); t.text = tl.text }
      t.bool = tl.bool; t.marked = marks.has(`${tl.r},${tl.c}`); look(t)
      if (!snap && changed.has(`${tl.r},${tl.c}`)) t.flashT = FLASH
    }
    if (r.cursor) {
      cursor ??= createPin(stage, group, cache, r.cursor.label)
      cursor.setLabel(r.cursor.label)
      cursor.show(new THREE.Vector3(xOf(r.cursor.c), H / 2 + 1.5, zOf(r.cursor.r)), snap)
    } else cursor?.hide()
  }

  const off = stage.onTick(dt => {
    elapsed += dt
    cursor?.tick(dt, stage.reduced ? 0 : Math.sin(elapsed * 2.2) * 0.04)
    for (const t of tiles) if (t.flashT > 0) {
      t.flashT = Math.max(0, t.flashT - dt)
      const k = t.flashT / FLASH
      t.mesh.material.emissive.setHex(C.ok); t.mesh.material.emissiveIntensity = 0.12 + 0.9 * k
      if (t.flashT === 0) look(t)
    }
  })

  function dispose() {
    off?.(); free(); cursor?.dispose(); cursor = null
    for (const m of cache.values()) { m.map.dispose(); m.dispose() }
    cache.clear(); tileGeo.dispose(); edgeGeo.dispose(); scene.remove(group)
  }
  return { update, dispose }
}
