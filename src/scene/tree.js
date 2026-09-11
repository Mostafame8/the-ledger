// src/scene/tree.js
// Kind 'tree': node blocks laid out by resolveTree (root at the top, one level per 1.5 units, leaves 1.0
// apart), rods from each node to its parent, gold on end-marked or marked nodes, violet pins coming in
// from the front, green flashes on new nodes.
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'
import { createPin } from './pin.js'

const SIZE = 0.8, LEVEL = 1.5, UNIT = 1.0, ROD = 0.05, FLASH = 0.4

export function createTree(stage) {
  const { THREE, scene } = stage
  const cache = new Map()
  const group = new THREE.Group(); scene.add(group)
  const boxGeo = new THREE.BoxGeometry(SIZE, SIZE, SIZE)
  const edgeGeo = new THREE.EdgesGeometry(boxGeo)
  const nodes = new Map()          // id -> { mesh, edges, sprite, rod, text, gold, flashT }
  const pins = new Map()
  let shape = '', width = 0, height = 0

  const posOf = n => new THREE.Vector3((n.x - width / 2) * UNIT, (height - 1 - n.depth) * LEVEL, 0)
  const free = id => {
    const nd = nodes.get(id); if (!nd) return
    group.remove(nd.mesh, nd.edges, nd.sprite); nd.mesh.material.dispose(); nd.edges.material.dispose()
    if (nd.rod) { group.remove(nd.rod); nd.rod.geometry.dispose(); nd.rod.material.dispose() }
    nodes.delete(id)
  }
  const freeAll = () => { for (const id of [...nodes.keys()]) free(id) }

  function add(n, r) {
    const p = posOf(n)
    const mesh = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.12, roughness: 0.35, metalness: 0.2 }))
    const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.8 }))
    mesh.position.copy(p); edges.position.copy(p)
    const sprite = new THREE.Sprite(makeText(THREE, cache, n.text, '#d7e6ff')); sprite.scale.set(1.1, 0.55, 1); sprite.position.set(p.x, p.y, SIZE / 2 + 0.3)
    group.add(mesh, edges, sprite)
    let rod = null
    if (n.parent !== null) {
      const q = posOf(r.nodes.find(m => m.id === n.parent))
      const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy)
      rod = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.1, len - SIZE * 0.9), ROD, ROD), new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.35 }))
      rod.position.set((p.x + q.x) / 2, (p.y + q.y) / 2, 0); rod.rotation.z = Math.atan2(dy, dx)
      group.add(rod)
    }
    nodes.set(n.id, { mesh, edges, sprite, rod, text: n.text, gold: false, flashT: 0 })
  }
  const look = nd => {
    nd.mesh.material.emissive.setHex(nd.gold ? C.gold : C.edge); nd.mesh.material.emissiveIntensity = nd.gold ? 0.75 : 0.12
    nd.edges.material.color.setHex(nd.gold ? C.gold : C.edge)
  }

  function update(r, { instant = false } = {}) {
    if (!r || r.kind !== 'tree') return
    const s = `${r.width}|${r.height}|${r.nodes.map(n => n.id + '@' + n.x).join(',')}`
    const rebuilt = s !== shape
    if (rebuilt) {
      shape = s; width = r.width; height = r.height
      freeAll()
      for (const n of r.nodes) add(n, r)
      stage.frame({ width: Math.max(3, width), height: height + 1 })
      // A tree hangs on the wall, so look at it from the front rather than from above.
      const t = stage.controls.target, d = stage.camera.position.distanceTo(t)
      t.y = ((height - 1) * LEVEL) / 2 + 0.2
      stage.camera.position.set(t.x + d * 0.15, t.y + d * 0.28, t.z + d * 0.95)
      stage.controls.update()
    }
    const snap = instant || stage.reduced
    for (const n of r.nodes) {
      const nd = nodes.get(n.id)
      if (nd.text !== n.text) { nd.sprite.material = makeText(THREE, cache, n.text, '#d7e6ff'); nd.text = n.text }
      nd.gold = n.end || r.marks.includes(n.id); look(nd)
      if (!snap && r.changed.includes(n.id)) nd.flashT = FLASH
    }
    const seen = new Set(), reps = new Map(), onNode = new Map()
    for (const p of r.pins) {
      const k = (reps.get(p.key) ?? 0) + 1; reps.set(p.key, k)
      const id = k === 1 ? p.key : `${p.key}#${k}`
      if (!pins.has(id)) pins.set(id, createPin(stage, group, cache, id))
      const pin = pins.get(id); seen.add(id)
      pin.group.rotation.x = Math.PI / 2                        // point in from the front
      pin.setLabel(p.label)
      const n = r.nodes.find(m => m.id === p.id), t = posOf(n); t.z = SIZE / 2 + 0.2
      pin.show(t, snap || rebuilt)
      const c = onNode.get(p.id) ?? 0; onNode.set(p.id, c + 1); pin.stack(c)
    }
    for (const [id, pin] of pins) if (!seen.has(id)) pin.hide()
  }

  const off = stage.onTick(dt => {
    for (const pin of pins.values()) pin.tick(dt, 0)
    for (const nd of nodes.values()) if (nd.flashT > 0) {
      nd.flashT = Math.max(0, nd.flashT - dt)
      nd.mesh.material.emissive.setHex(C.ok); nd.mesh.material.emissiveIntensity = 0.12 + 0.9 * (nd.flashT / FLASH)
      if (nd.flashT === 0) look(nd)
    }
  })

  function dispose() {
    off?.(); freeAll()
    for (const p of pins.values()) p.dispose()
    pins.clear()
    for (const m of cache.values()) { m.map.dispose(); m.dispose() }
    cache.clear(); boxGeo.dispose(); edgeGeo.dispose(); scene.remove(group)
  }
  return { update, dispose }
}
