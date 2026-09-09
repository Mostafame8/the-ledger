// src/scene/cells.js
// Draws a Resolved `cells` picture: a row of blocks, pointer pins, lit ranges, gold marks, and a
// green flash on cells whose value changed. Tweens pointer positions over 300 ms.
import { COLORS as C } from './stage.js'

const GAP = 1.0, SIZE = 0.8, TWEEN = 0.3, FLASH = 0.4
const PIN_BASE = SIZE / 2 + 1.5           // y of a pin group's origin above the row
const xOf = (i, n) => (i - (n - 1) / 2) * GAP
const ease = t => 1 - Math.pow(1 - t, 3)

// Canvas text → sprite material. Cached per (text, colour, size) so re-renders never re-rasterise.
function makeText(THREE, cache, text, color, px = 64) {
  const key = `${text}|${color}|${px}`
  if (cache.has(key)) return cache.get(key)
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128
  const g = cv.getContext('2d')
  g.font = `700 ${px}px "Rajdhani", system-ui, sans-serif`
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.shadowColor = color; g.shadowBlur = 12
  g.fillStyle = color; g.fillText(text, 128, 64, 240)
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  cache.set(key, mat)
  return mat
}

export function createCells(stage) {
  const { THREE, scene } = stage
  const cache = new Map()
  const group = new THREE.Group(); scene.add(group)
  const boxGeo = new THREE.BoxGeometry(SIZE, SIZE, SIZE)
  const edgeGeo = new THREE.EdgesGeometry(boxGeo)
  const pinGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.1, 12)
  const tipGeo = new THREE.ConeGeometry(0.11, 0.26, 16)
  const cells = []         // { mesh, edges, valueSprite, indexSprite, text, flashT, marked }
  const pins = new Map()   // key -> { group, sprite, x, fromX, t, label }
  const rangeMeshes = []
  let count = -1, elapsed = 0

  function buildCells(n) {
    for (const c of cells) group.remove(c.mesh, c.edges, c.valueSprite, c.indexSprite)
    cells.length = 0
    for (let i = 0; i < n; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: C.panel, emissive: C.edge, emissiveIntensity: 0.12, roughness: 0.35, metalness: 0.2 })
      const mesh = new THREE.Mesh(boxGeo, mat)
      const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.8 }))
      const valueSprite = new THREE.Sprite(makeText(THREE, cache, '', '#d7e6ff')); valueSprite.scale.set(1.1, 0.55, 1)
      const indexSprite = new THREE.Sprite(makeText(THREE, cache, String(i), '#6e83a6', 40)); indexSprite.scale.set(0.8, 0.4, 1)
      const x = xOf(i, n)
      mesh.position.set(x, 0, 0); edges.position.copy(mesh.position)
      valueSprite.position.set(x, SIZE / 2 + 0.36, 0)
      indexSprite.position.set(x, -SIZE / 2 + 0.02, SIZE / 2 + 0.42)
      group.add(mesh, edges, valueSprite, indexSprite)
      cells.push({ mesh, edges, valueSprite, indexSprite, text: null, flashT: 0, marked: false })
    }
    count = n
    stage.frameCells(n)
  }

  function pinFor(key) {
    if (pins.has(key)) return pins.get(key)
    const g = new THREE.Group()
    const beam = new THREE.Mesh(pinGeo, new THREE.MeshStandardMaterial({ color: C.violet, emissive: C.violet, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 }))
    beam.position.y = 0.55
    const tip = new THREE.Mesh(tipGeo, new THREE.MeshStandardMaterial({ color: C.violet, emissive: C.violet, emissiveIntensity: 1.2 }))
    tip.rotation.x = Math.PI; tip.position.y = -0.13
    const sprite = new THREE.Sprite(makeText(THREE, cache, key, '#c9b8ff', 44)); sprite.scale.set(1.9, 0.5, 1); sprite.position.y = 1.35
    g.add(beam, tip, sprite)
    g.position.y = PIN_BASE
    scene.add(g)
    const p = { group: g, sprite, x: 0, fromX: 0, t: 1, label: key }
    pins.set(key, p)
    return p
  }

  function baseLook(cell) {
    cell.mesh.material.emissive.setHex(cell.marked ? C.gold : C.edge)
    cell.mesh.material.emissiveIntensity = cell.marked ? 0.75 : 0.12
    cell.edges.material.color.setHex(cell.marked ? C.gold : C.edge)
  }

  function update(r, { instant = false } = {}) {
    if (!r) return
    const rebuilt = r.cells.length !== count
    if (rebuilt) buildCells(r.cells.length)
    const snap = instant || stage.reduced
    r.cells.forEach((c, i) => {
      const cell = cells[i]
      if (cell.text !== c.text) { cell.valueSprite.material = makeText(THREE, cache, c.text, '#d7e6ff'); cell.text = c.text }
      cell.marked = r.marks.includes(i)
      baseLook(cell)
      if (!snap && !rebuilt && r.changed.includes(i)) cell.flashT = FLASH
    })
    // Pins: show the ones present, slide them, hide the rest. Stack labels sharing a cell.
    const seen = new Set(), onCell = new Map()
    for (const p of r.pointers) {
      const pin = pinFor(p.key); seen.add(p.key)
      const x = xOf(p.index, count)
      if (pin.label !== p.label) { pin.sprite.material = makeText(THREE, cache, p.label, '#c9b8ff', 44); pin.label = p.label }
      if (!pin.group.visible || snap || rebuilt) { pin.x = pin.fromX = x; pin.t = 1; pin.group.position.x = x }
      else if (pin.x !== x) { pin.fromX = pin.group.position.x; pin.x = x; pin.t = 0 }
      pin.group.visible = true
      const k = onCell.get(p.index) ?? 0; onCell.set(p.index, k + 1)
      pin.sprite.position.y = 1.35 + k * 0.5
    }
    for (const [key, pin] of pins) if (!seen.has(key)) pin.group.visible = false
    // Ranges: thin lit plates under the covered cells.
    for (const m of rangeMeshes) { scene.remove(m); m.geometry.dispose(); m.material.dispose() }
    rangeMeshes.length = 0
    for (const g of r.ranges) {
      const w = (g.to - g.from) * GAP + SIZE + 0.24
      const plate = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, SIZE + 0.3),
        new THREE.MeshBasicMaterial({ color: C.glow, transparent: true, opacity: 0.22 }))
      plate.position.set((xOf(g.from, count) + xOf(g.to, count)) / 2, -SIZE / 2 - 0.02, 0)
      scene.add(plate); rangeMeshes.push(plate)
    }
  }

  stage.onTick(dt => {
    elapsed += dt
    for (const pin of pins.values()) {
      if (pin.t < 1) { pin.t = Math.min(1, pin.t + dt / TWEEN); pin.group.position.x = pin.fromX + (pin.x - pin.fromX) * ease(pin.t) }
      pin.group.position.y = PIN_BASE + Math.sin(elapsed * 2.2) * 0.04
    }
    for (const cell of cells) {
      if (cell.flashT > 0) {
        cell.flashT = Math.max(0, cell.flashT - dt)
        const k = cell.flashT / FLASH
        cell.mesh.material.emissive.setHex(C.ok); cell.mesh.material.emissiveIntensity = 0.12 + 0.9 * k
        if (cell.flashT === 0) baseLook(cell)
      }
    }
  })

  function dispose() {
    for (const m of rangeMeshes) { m.geometry.dispose(); m.material.dispose() }
    for (const mat of cache.values()) { mat.map.dispose(); mat.dispose() }
    boxGeo.dispose(); edgeGeo.dispose(); pinGeo.dispose(); tipGeo.dispose()
    scene.remove(group); for (const p of pins.values()) scene.remove(p.group)
  }

  return { update, dispose }
}
