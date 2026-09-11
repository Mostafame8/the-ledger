// src/scene/grid.js
// Kind 'grid': one or two grids of flat tiles on the floor (row 0 farthest), side by side, each with
// row/column heads or indices and a label; a cursor pin above tile (r, c) of the first grid; gold marks
// by value; lit/dark boolean tiles; green flashes on changed tiles.
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'
import { createPin } from './pin.js'

const GAP = 1.0, TILE = 0.8, H = 0.16, FLASH = 0.4, PAIR_GAP = 1.0

export function createGrid(stage) {
  const { THREE, scene } = stage
  const cache = new Map()
  const root = new THREE.Group(); scene.add(root)
  const tileGeo = new THREE.BoxGeometry(TILE, H, TILE)
  const edgeGeo = new THREE.EdgesGeometry(tileGeo)
  let parts = []            // one per grid entry: { group, tiles, sprites, rows, cols, x0 }
  let shape = '', cursor = null, elapsed = 0
  const xOf = (p, c) => p.x0 + (c - (p.cols - 1) / 2) * GAP
  const zOf = (p, r) => (r - (p.rows - 1) / 2) * GAP          // row 0 farthest (most negative z)

  const free = () => {
    for (const p of parts) {
      for (const t of p.tiles) { p.group.remove(t.mesh, t.edges, t.sprite); t.mesh.material.dispose(); t.edges.material.dispose() }
      for (const s of p.sprites) p.group.remove(s)
      root.remove(p.group)
    }
    parts = []
  }
  const label = (p, text, x, z, color = '#6e83a6') => {
    if (!text) return
    const s = new THREE.Sprite(makeText(THREE, cache, text, color, 44)); s.scale.set(0.9, 0.45, 1); s.position.set(x, 0.1, z)
    p.group.add(s); p.sprites.push(s)
  }
  function build(r) {
    free()
    const widths = r.grids.map(g => Math.max(1, g.cols) * GAP)
    const total = widths.reduce((a, b) => a + b, 0) + (r.grids.length - 1) * PAIR_GAP
    let x = -total / 2
    r.grids.forEach((g, i) => {
      const p = { group: new THREE.Group(), tiles: [], sprites: [], rows: g.rows, cols: g.cols, x0: x + widths[i] / 2 }
      root.add(p.group); parts.push(p)
      for (const tl of g.tiles) {
        const mat = new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.12, roughness: 0.4, metalness: 0.15 })
        const mesh = new THREE.Mesh(tileGeo, mat)
        const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.8 }))
        const sprite = new THREE.Sprite(makeText(THREE, cache, '', '#d7e6ff')); sprite.scale.set(0.9, 0.45, 1)
        mesh.position.set(xOf(p, tl.c), 0, zOf(p, tl.r)); edges.position.copy(mesh.position); sprite.position.set(xOf(p, tl.c), H / 2 + 0.3, zOf(p, tl.r))
        p.group.add(mesh, edges, sprite)
        p.tiles.push({ r: tl.r, c: tl.c, mesh, edges, sprite, text: null, bool: null, marked: false, flashT: 0 })
      }
      const heads = i === 0 ? r.heads : null
      const rh = heads?.rows ?? Array.from({ length: g.rows }, (_, k) => String(k))
      const ch = heads?.cols ?? Array.from({ length: g.cols }, (_, k) => String(k))
      rh.forEach((t, k) => label(p, t, xOf(p, 0) - 0.9, zOf(p, k)))
      ch.forEach((t, k) => label(p, t, xOf(p, k), zOf(p, 0) - 0.9))
      if (g.label) label(p, g.label, p.x0, zOf(p, g.rows - 1) + 0.95, '#9fb3d9')
      x += widths[i] + PAIR_GAP
    })
    const rows = Math.max(1, ...r.grids.map(g => g.rows))
    stage.frame({ width: total / GAP, depth: rows + 1 })
  }
  const at = (p, r, c) => p.tiles.find(t => t.r === r && t.c === c)
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
    const s = r.grids.map(g => `${g.label}|${g.rows}x${g.cols}`).join(';') + '|' + JSON.stringify(r.heads ?? null)
    if (s !== shape) { shape = s; build(r) }
    const snap = instant || stage.reduced
    r.grids.forEach((g, i) => {
      const p = parts[i]
      const changed = new Set(g.changed.map(q => q.join(','))), marks = new Set(g.marks.map(q => q.join(',')))
      for (const tl of g.tiles) {
        const t = at(p, tl.r, tl.c); if (!t) continue
        if (t.text !== tl.text) { t.sprite.material = makeText(THREE, cache, tl.text, '#d7e6ff'); t.text = tl.text }
        t.bool = tl.bool; t.marked = marks.has(`${tl.r},${tl.c}`); look(t)
        if (!snap && changed.has(`${tl.r},${tl.c}`)) t.flashT = FLASH
      }
    })
    if (r.cursor) {
      const p = parts[0]
      cursor ??= createPin(stage, root, cache, r.cursor.label)
      cursor.setLabel(r.cursor.label)
      cursor.show(new THREE.Vector3(xOf(p, r.cursor.c), H / 2 + 1.5, zOf(p, r.cursor.r)), snap)
    } else cursor?.hide()
  }

  const off = stage.onTick(dt => {
    elapsed += dt
    cursor?.tick(dt, stage.reduced ? 0 : Math.sin(elapsed * 2.2) * 0.04)
    for (const p of parts) for (const t of p.tiles) if (t.flashT > 0) {
      t.flashT = Math.max(0, t.flashT - dt)
      const k = t.flashT / FLASH
      t.mesh.material.emissive.setHex(C.ok); t.mesh.material.emissiveIntensity = 0.12 + 0.9 * k
      if (t.flashT === 0) look(t)
    }
  })

  function dispose() {
    off?.(); free(); cursor?.dispose(); cursor = null
    for (const m of cache.values()) { m.map.dispose(); m.dispose() }
    cache.clear(); tileGeo.dispose(); edgeGeo.dispose(); scene.remove(root)
  }
  return { update, dispose }
}
