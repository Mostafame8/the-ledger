// src/scene/line.js
// Kind 'line': a number rail with an integer under every unit, lanes of interval bars behind it
// (first lane farthest), dim tick posts, a glow plate for the span, and pins standing at values.
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'
import { createPin } from './pin.js'

const UNIT = 1.0, LANE_STEP = 0.9, BAR_H = 0.4, FLASH = 0.4

export function createLine(stage) {
  const { THREE, scene } = stage
  const cache = new Map()
  const group = new THREE.Group(); scene.add(group)
  let axis = null, fixed = [], lanes = [], span = null, elapsed = 0
  const pins = new Map()
  const xOf = v => (v - (axis[0] + axis[1]) / 2) * UNIT
  const zOfLane = (i, n) => -(n - i) * LANE_STEP        // lanes behind the rail; first lane farthest

  const freeFixed = () => {
    for (const o of fixed) { group.remove(o); if (o.isMesh) { o.geometry.dispose(); o.material.dispose() } }
    fixed = []
  }
  const freeBars = L => { for (const b of L.bars) { group.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose() } L.bars = [] }
  const freeLanes = () => { for (const L of lanes) { freeBars(L); if (L.label) group.remove(L.label) } lanes = [] }

  function buildRail(r) {
    freeFixed(); axis = r.axis
    const len = (axis[1] - axis[0]) * UNIT + 0.4
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, 0.3), new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.25 }))
    group.add(rail); fixed.push(rail)
    for (let v = axis[0]; v <= axis[1]; v++) {
      const s = new THREE.Sprite(makeText(THREE, cache, String(v), '#6e83a6', 40)); s.scale.set(0.7, 0.35, 1); s.position.set(xOf(v), -0.05, 0.5)
      group.add(s); fixed.push(s)
    }
    for (const v of r.ticks) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), new THREE.MeshStandardMaterial({ color: C.glow, emissive: C.glow, emissiveIntensity: 0.6 }))
      post.position.set(xOf(v), 0.23, 0); group.add(post); fixed.push(post)
    }
    stage.frame({ width: axis[1] - axis[0] + 2, depth: r.lanes.length + 1 })
  }
  function buildLanes(r) {
    freeLanes()
    lanes = r.lanes.map((lane, i) => {
      const z = zOfLane(i, r.lanes.length)
      let label = null
      if (lane.label) { label = new THREE.Sprite(makeText(THREE, cache, lane.label, '#6e83a6', 44)); label.scale.set(1.4, 0.36, 1); label.position.set(xOf(axis[0]) - 1.1, 0.2, z); group.add(label) }
      return { z, label, bars: [] }
    })
  }
  const barMesh = (b, z) => {
    const w = b.to > b.from ? (b.to - b.from) * UNIT : 0.3
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, BAR_H, 0.5), new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.3, roughness: 0.4 }))
    m.position.set((xOf(b.from) + xOf(b.to)) / 2, BAR_H / 2, z)
    return m
  }
  const baseLook = b => { b.mesh.material.emissive.setHex(C.edge); b.mesh.material.emissiveIntensity = 0.3 }

  function update(r, { instant = false } = {}) {
    if (!r || r.kind !== 'line') return
    const snap = instant || stage.reduced
    if (!axis || axis[0] !== r.axis[0] || axis[1] !== r.axis[1] || lanes.length !== r.lanes.length) { buildRail(r); buildLanes(r) }
    r.lanes.forEach((lane, i) => {
      const L = lanes[i]
      const same = L.bars.length === lane.bars.length && L.bars.every((b, k) => b.from === lane.bars[k].from && b.to === lane.bars[k].to)
      if (!same) {
        freeBars(L)
        L.bars = lane.bars.map(b => ({ from: b.from, to: b.to, mesh: barMesh(b, L.z), flashT: 0 }))
        for (const b of L.bars) group.add(b.mesh)
        if (!snap) for (const k of lane.changed) if (L.bars[k]) L.bars[k].flashT = FLASH
      }
    })
    if (span) { group.remove(span); span.geometry.dispose(); span.material.dispose(); span = null }
    if (r.span) {
      const w = (r.span.to - r.span.from) * UNIT + 0.3
      span = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.5), new THREE.MeshBasicMaterial({ color: C.glow, transparent: true, opacity: 0.28 }))
      span.position.set((xOf(r.span.from) + xOf(r.span.to)) / 2, 0.04, 0); group.add(span)
    }
    const seen = new Set()
    for (const p of r.pins) {
      if (!pins.has(p.key)) pins.set(p.key, createPin(stage, group, cache, p.label))
      const pin = pins.get(p.key); seen.add(p.key)
      pin.setLabel(p.label)
      pin.show(new THREE.Vector3(xOf(p.at), 1.5, 0), snap)
    }
    for (const [k, pin] of pins) if (!seen.has(k)) pin.hide()
  }

  const off = stage.onTick(dt => {
    elapsed += dt
    for (const pin of pins.values()) pin.tick(dt, stage.reduced ? 0 : Math.sin(elapsed * 2.2) * 0.04)
    for (const L of lanes) for (const b of L.bars) if (b.flashT > 0) {
      b.flashT = Math.max(0, b.flashT - dt); const k = b.flashT / FLASH
      b.mesh.material.emissive.setHex(C.ok); b.mesh.material.emissiveIntensity = 0.3 + 0.9 * k
      if (b.flashT === 0) baseLook(b)
    }
  })

  function dispose() {
    off?.(); freeLanes(); freeFixed()
    if (span) { group.remove(span); span.geometry.dispose(); span.material.dispose(); span = null }
    for (const p of pins.values()) p.dispose(); pins.clear()
    for (const m of cache.values()) { m.map.dispose(); m.dispose() }
    cache.clear(); scene.remove(group)
  }
  return { update, dispose }
}
