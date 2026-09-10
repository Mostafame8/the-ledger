// src/scene/pin.js
// The violet pin: a beam with a glowing tip and a label sprite, tweened between targets over 300 ms.
// Shared by rows (above a cell / beside a pile cell), grids (above a tile) and lines (on the rail).
import { COLORS as C } from './stage.js'
import { makeText } from './text.js'

export const TWEEN = 0.3
const ease = t => 1 - Math.pow(1 - t, 3)

export function createPin(stage, parent, cache, label) {
  const { THREE } = stage
  const pinGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.1, 12)
  const tipGeo = new THREE.ConeGeometry(0.11, 0.26, 16)
  const g = new THREE.Group()
  const beam = new THREE.Mesh(pinGeo, new THREE.MeshStandardMaterial({ color: C.violet, emissive: C.violet, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 }))
  beam.position.y = 0.55
  const tip = new THREE.Mesh(tipGeo, new THREE.MeshStandardMaterial({ color: C.violet, emissive: C.violet, emissiveIntensity: 1.2 }))
  tip.rotation.x = Math.PI; tip.position.y = -0.13
  const sprite = new THREE.Sprite(makeText(THREE, cache, label, '#c9b8ff', 44)); sprite.scale.set(1.9, 0.5, 1); sprite.position.y = 1.35
  g.add(beam, tip, sprite)
  g.visible = false
  parent.add(g)
  const from = new THREE.Vector3(), to = new THREE.Vector3()
  let t = 1, text = label
  return {
    group: g, sprite,
    get visible() { return g.visible },
    setLabel(l) { if (l !== text) { sprite.material = makeText(THREE, cache, l, '#c9b8ff', 44); text = l } },
    stack(k) { sprite.position.y = 1.35 + k * 0.5 },
    // Move to `target`: snap when hidden or asked to, else start a tween from the current position.
    show(target, snap) {
      if (!g.visible || snap) { to.copy(target); from.copy(target); t = 1; g.position.copy(target) }
      else if (!to.equals(target)) { from.copy(g.position); to.copy(target); t = 0 }
      g.visible = true
    },
    hide() { g.visible = false },
    // Advance the tween; when idle, `bob` (a y offset, 0 to disable) gives the gentle float.
    tick(dt, bob = 0) {
      if (t < 1) { t = Math.min(1, t + dt / TWEEN); g.position.lerpVectors(from, to, ease(t)) }
      else if (bob) g.position.y = to.y + bob
    },
    dispose() { parent.remove(g); beam.material.dispose(); tip.material.dispose(); pinGeo.dispose(); tipGeo.dispose() },
  }
}
