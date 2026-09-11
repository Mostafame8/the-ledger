// src/scene/graph.js
// Kind 'graph': node blocks at authored floor positions, edge rods between them (a weight sprite at the
// midpoint, a cone when directed), badge text under each node, gold marks, violet pins on nodes, a glow
// on the edge joining two pinned nodes, green flashes on new edges.
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'
import { createPin } from './pin.js'

const UNIT = 1.0, SIZE = 0.8, ROD = 0.05, FLASH = 0.4, PIN_BASE = SIZE / 2 + 1.5

export function createGraph(stage) {
  const { THREE, scene } = stage
  const cache = new Map()
  const group = new THREE.Group(); scene.add(group)
  const boxGeo = new THREE.BoxGeometry(SIZE, SIZE, SIZE)
  const edgeGeo = new THREE.EdgesGeometry(boxGeo)
  const coneGeo = new THREE.ConeGeometry(0.1, 0.24, 12)
  let nodes = [], edges = new Map(), nodeKey = '', elapsed = 0
  const pins = new Map()
  let centre = { x: 0, z: 0 }
  const at = i => new THREE.Vector3((nodes[i].pos[0] - centre.x) * UNIT, 0, (nodes[i].pos[1] - centre.z) * UNIT)

  const freeNodes = () => {
    for (const nd of nodes) { group.remove(nd.mesh, nd.edges, nd.name, nd.badge); nd.mesh.material.dispose(); nd.edges.material.dispose() }
    nodes = []
  }
  const freeEdge = e => { group.remove(e.rod, e.weight, e.cone); e.rod.geometry.dispose(); e.mat.dispose() }
  const freeEdges = () => { for (const e of edges.values()) freeEdge(e); edges.clear() }

  function buildNodes(r) {
    freeNodes(); freeEdges()
    const xs = r.nodes.map(n => n.pos[0]), zs = r.nodes.map(n => n.pos[1])
    centre = { x: (Math.min(...xs) + Math.max(...xs)) / 2, z: (Math.min(...zs) + Math.max(...zs)) / 2 }
    nodes = r.nodes.map(n => ({ pos: n.pos, mesh: null, edges: null, name: null, badge: null, badgeText: null, marked: false }))
    r.nodes.forEach((n, i) => {
      const nd = nodes[i], p = at(i)
      nd.mesh = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.12, roughness: 0.35, metalness: 0.2 }))
      nd.edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.8 }))
      nd.mesh.position.copy(p); nd.edges.position.copy(p)
      nd.name = new THREE.Sprite(makeText(THREE, cache, n.name, '#d7e6ff')); nd.name.scale.set(1.1, 0.55, 1); nd.name.position.set(p.x, SIZE / 2 + 0.36, p.z)
      nd.badge = new THREE.Sprite(makeText(THREE, cache, '', '#ffb454', 40)); nd.badge.scale.set(0.9, 0.45, 1); nd.badge.position.set(p.x, -SIZE / 2 + 0.02, p.z + SIZE / 2 + 0.42)
      group.add(nd.mesh, nd.edges, nd.name, nd.badge)
    })
    const w = (Math.max(...xs) - Math.min(...xs)) * UNIT + SIZE, d = (Math.max(...zs) - Math.min(...zs)) * UNIT + SIZE
    stage.frame({ width: w + 0.5, depth: d * 0.5 + 1 })
  }

  function addEdge(e, r) {
    const a = at(e.u), b = at(e.v), dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz)
    const mat = new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.35 })
    const rod = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.1, len - SIZE), ROD, ROD), mat)
    rod.position.set((a.x + b.x) / 2, -SIZE / 2 + 0.06, (a.z + b.z) / 2); rod.rotation.y = -Math.atan2(dz, dx)
    const weight = new THREE.Sprite(makeText(THREE, cache, e.w === null ? '' : String(e.w), '#9fb3d9', 40)); weight.scale.set(0.7, 0.35, 1)
    weight.position.set((a.x + b.x) / 2, 0.12, (a.z + b.z) / 2); weight.visible = e.w !== null
    const cone = new THREE.Mesh(coneGeo, mat)
    const k = (len - SIZE / 2 - 0.12) / len
    cone.position.set(a.x + dx * k, -SIZE / 2 + 0.06, a.z + dz * k); cone.rotation.set(0, -Math.atan2(dz, dx), -Math.PI / 2); cone.visible = r.directed
    group.add(rod, weight, cone)
    return { rod, weight, cone, mat, glow: false, flashT: 0 }
  }
  const look = e => { e.mat.emissive.setHex(e.glow ? C.glow : C.edge); e.mat.emissiveIntensity = e.glow ? 1.0 : 0.35 }
  const nodeLook = nd => {
    nd.mesh.material.emissive.setHex(nd.marked ? C.gold : C.edge); nd.mesh.material.emissiveIntensity = nd.marked ? 0.75 : 0.12
    nd.edges.material.color.setHex(nd.marked ? C.gold : C.edge)
  }

  function update(r, { instant = false } = {}) {
    if (!r || r.kind !== 'graph') return
    const nk = JSON.stringify(r.nodes.map(n => [n.name, n.pos]))
    const rebuilt = nk !== nodeKey
    if (rebuilt) { nodeKey = nk; buildNodes(r) }
    const snap = instant || stage.reduced
    r.nodes.forEach((n, i) => {
      const nd = nodes[i]
      const bt = n.badge ?? ''
      if (nd.badgeText !== bt) { nd.badge.material = makeText(THREE, cache, bt, '#ffb454', 40); nd.badgeText = bt }
      nd.marked = n.marked; nodeLook(nd)
    })
    const want = new Set(r.edges.map(e => `${e.u}-${e.v}`))
    for (const [id, e] of edges) if (!want.has(id)) { freeEdge(e); edges.delete(id) }
    for (const e of r.edges) {
      const id = `${e.u}-${e.v}`
      if (!edges.has(id)) edges.set(id, addEdge(e, r))
      const ge = edges.get(id)
      ge.glow = e.glow; look(ge)
      if (!snap && e.changed && !rebuilt) ge.flashT = FLASH
    }
    const seen = new Set(), reps = new Map(), onNode = new Map()
    for (const p of r.pins) {
      const n = (reps.get(p.key) ?? 0) + 1; reps.set(p.key, n)
      const id = n === 1 ? p.key : `${p.key}#${n}`
      if (!pins.has(id)) pins.set(id, createPin(stage, group, cache, id))
      const pin = pins.get(id); seen.add(id)
      pin.setLabel(p.label)
      const t = at(p.node); t.y = PIN_BASE
      pin.show(t, snap || rebuilt)
      const k = onNode.get(p.node) ?? 0; onNode.set(p.node, k + 1); pin.stack(k)
    }
    for (const [id, pin] of pins) if (!seen.has(id)) pin.hide()
  }

  const off = stage.onTick(dt => {
    elapsed += dt
    for (const pin of pins.values()) pin.tick(dt, stage.reduced ? 0 : Math.sin(elapsed * 2.2) * 0.04)
    for (const e of edges.values()) if (e.flashT > 0) {
      e.flashT = Math.max(0, e.flashT - dt)
      e.mat.emissive.setHex(C.ok); e.mat.emissiveIntensity = 0.35 + 0.9 * (e.flashT / FLASH)
      if (e.flashT === 0) look(e)
    }
  })

  function dispose() {
    off?.(); freeEdges(); freeNodes()
    for (const p of pins.values()) p.dispose()
    pins.clear()
    for (const m of cache.values()) { m.map.dispose(); m.dispose() }
    cache.clear(); boxGeo.dispose(); edgeGeo.dispose(); coneGeo.dispose(); scene.remove(group)
  }
  return { update, dispose }
}
