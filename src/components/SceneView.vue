<script setup>
// The table: a lazy Three.js view of one scene descriptor at one state. Falls back to nothing
// (v-if="ok") when three cannot load or WebGL is unavailable, leaving the step exactly as before.
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { resolve } from '../scene/model.js'
const props = defineProps({ scene: { type: Object, required: true }, state: { type: Object, default: () => ({}) } })
const host = ref(null)
const ok = ref(true)
let stage = null, cells = null, prev = null, dead = false

onMounted(async () => {
  try {
    const { createStage } = await import('../scene/stage.js')
    const [{ createCells }, { createRows }, { createGrid }, { createLine }] = await Promise.all([
      import('../scene/cells.js'), import('../scene/rows.js'), import('../scene/grid.js'), import('../scene/line.js')])
    if (dead) return
    stage = await createStage(host.value)
    if (dead) { stage.dispose(); stage = null; return }
    prev = resolve(props.scene, props.state, null)
    const make = { cells: createCells, rows: createRows, grid: createGrid, line: createLine }
    cells = (make[prev?.kind] ?? createCells)(stage)
    if (prev) cells.update(prev, { instant: true })
    stage.start()
  } catch (e) {
    if (import.meta.env.DEV) console.warn('The table could not open (no WebGL?):', e)
    ok.value = false
  }
})
watch(() => [props.scene, props.state], ([scene, state]) => {
  if (!cells) return
  const r = resolve(scene, state, prev)
  if (!r) return
  cells.update(r)
  prev = r
})
onBeforeUnmount(() => { dead = true; cells?.dispose(); stage?.dispose(); cells = stage = null })
</script>

<template>
  <div v-if="ok" class="table" aria-hidden="true">
    <div class="table-cap"><i></i> The table <small>drag to turn · wheel to zoom</small></div>
    <div ref="host" class="table-host"></div>
  </div>
</template>
