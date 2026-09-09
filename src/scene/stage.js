// src/scene/stage.js
// Renderer, camera, lights, floor and orbit for "the table". Browser only; loads three lazily so
// heist mode never downloads it. One stage per mounted SceneView.

let mods = null
export function preload() {
  mods ??= Promise.all([import('three'), import('three/examples/jsm/controls/OrbitControls.js')])
    .then(([THREE, oc]) => ({ THREE, OrbitControls: oc.OrbitControls }))
  return mods
}

export const COLORS = { panel: 0x0c162e, edge: 0x3fa9ff, glow: 0x7fd4ff, violet: 0x8b5cf6, ok: 0x5ef0b0, gold: 0xffb454, faint: 0x2a3b5e, grid: 0x172542 }
const C = COLORS

export async function createStage(host) {
  const { THREE, OrbitControls } = await preload()
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  // Probe for WebGL ourselves so three.js's own WebGLRenderer never gets to console.error the failure.
  const probe = document.createElement('canvas')
  const gl = probe.getContext('webgl2') || probe.getContext('webgl')
  if (!gl) throw new Error('The table needs WebGL, which this browser does not provide.')
  gl.getExtension('WEBGL_lose_context')?.loseContext()

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  scene.add(new THREE.HemisphereLight(0x9fc8ff, 0x0a1020, 1.1))
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(4, 8, 6); scene.add(key)
  const grid = new THREE.GridHelper(24, 24, C.faint, C.grid); grid.position.y = -0.5; scene.add(grid)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.enableDamping = true
  controls.minDistance = 3
  controls.maxDistance = 24
  controls.maxPolarAngle = Math.PI * 0.49
  controls.autoRotate = !reduced
  controls.autoRotateSpeed = 1.5           // one turn in ~40 s

  // Framed a bit further back and aimed above the row so pin label sprites clear the canvas top.
  function frameCells(count) {
    const span = Math.max(count, 3)
    const dist = span * 1.0 + 4
    camera.position.set(dist * 0.3, dist * 0.55, dist * 0.9)
    controls.target.set(0, 0.6, 0)
    controls.update()
  }

  function resize() {
    const w = host.clientWidth, h = host.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize); ro.observe(host); resize()

  // Render loop: only while running, on screen, and the tab is visible.
  const ticks = new Set()
  let raf = 0, running = false, onScreen = true
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen && running && !raf) loop() }, { threshold: 0 }); io.observe(host)
  const onVis = () => { if (running && !document.hidden && !raf) loop() }
  document.addEventListener('visibilitychange', onVis)
  let last = performance.now()
  function loop(now = performance.now()) {
    raf = 0
    if (!running || document.hidden) return
    const dt = Math.min(0.1, (now - last) / 1000); last = now
    if (!onScreen) return
    for (const fn of ticks) fn(dt, now)
    controls.update(dt)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(loop)
  }
  const start = () => { if (running) return; running = true; last = performance.now(); loop() }
  const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0 }

  function dispose() {
    stop()
    ro.disconnect(); io.disconnect()
    document.removeEventListener('visibilitychange', onVis)
    controls.dispose()
    scene.traverse(o => {
      o.geometry?.dispose?.()
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
      for (const m of mats) { m.map?.dispose?.(); m.dispose?.() }
    })
    renderer.dispose()
    renderer.domElement.remove()
  }

  return { THREE, scene, camera, renderer, controls, reduced, frameCells, onTick: fn => ticks.add(fn), start, stop, dispose }
}
