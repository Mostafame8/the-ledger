<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { NODES, NODE_BY_ID } from '../data/training/index.js'
import { depthOf } from '../data/training/progress.js'
import { useStore } from '../store.js'
const s = useStore()

// Columns per populated tier; within a column, shallow prerequisites first (stable sort keeps file order).
const columns = computed(() => {
  const tiers = [...new Set(NODES.map(n => n.tier))]
  return tiers.map(tier => ({ tier, nodes: NODES.filter(n => n.tier === tier).sort((a, b) => depthOf(a, NODE_BY_ID) - depthOf(b, NODE_BY_ID)) }))
})
const needs = n => n.requires.map(id => NODE_BY_ID[id].title).join(', ')
const label = n => ({ cleared: 'trained', locked: 'sealed', open: '+' + n.xp + ' xp' })[s.nodeState(n.id)]

// Prerequisite lines: measured from the rendered cards, redrawn on resize.
const root = ref(null)
const cards = new Map()
const setCard = (id, el) => { if (el) cards.set(id, el); else cards.delete(id) }
const links = ref([])
function measure() {
  if (!root.value) return
  const box = root.value.getBoundingClientRect()
  const out = []
  for (const n of NODES) for (const r of n.requires) {
    const a = cards.get(r)?.getBoundingClientRect(), b = cards.get(n.id)?.getBoundingClientRect()
    if (!a || !b) continue
    if (Math.abs(a.left - b.left) < 1) {
      // Same tier column: route the link vertically, prerequisite's bottom to dependent's top.
      out.push({ x1: a.left + a.width / 2 - box.left, y1: a.bottom - box.top, x2: b.left + b.width / 2 - box.left, y2: b.top - box.top })
    } else {
      out.push({ x1: a.right - box.left, y1: a.top + a.height / 2 - box.top, x2: b.left - box.left, y2: b.top + b.height / 2 - box.top })
    }
  }
  links.value = out
}
let ro = null
onMounted(() => { measure(); ro = new ResizeObserver(measure); ro.observe(root.value) })
onBeforeUnmount(() => ro?.disconnect())
watch(() => s.training.value.nodes, () => nextTick(measure), { deep: true })
</script>

<template>
  <main class="sys tree">
    <div class="sys-title"><i></i> Training room</div>
    <div class="body tree-body" ref="root">
      <svg class="links" aria-hidden="true">
        <line v-for="(l, i) in links" :key="i" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" />
      </svg>
      <section v-for="col in columns" :key="col.tier" class="tier">
        <div class="tier-head"><span class="rank" :class="col.tier">{{ col.tier }}</span><small>{{ col.nodes.length }} lessons</small></div>
        <button v-for="n in col.nodes" :key="n.id" class="node" :class="s.nodeState(n.id)"
          :ref="el => setCard(n.id, el)" :disabled="s.nodeState(n.id) === 'locked'"
          :title="s.nodeState(n.id) === 'locked' ? 'Needs: ' + needs(n) : ''" @click="s.openNode(n.id)">
          <h3>{{ n.title }}</h3>
          <p>{{ n.algo }}</p>
          <small>{{ n.gates.length ? 'used in ' + n.gates.length + ' gate' + (n.gates.length === 1 ? '' : 's') : 'used in every gate' }}</small>
          <span class="tag" :class="{ done: s.nodeState(n.id) === 'cleared', locked: s.nodeState(n.id) === 'locked' }">{{ label(n) }}</span>
        </button>
      </section>
    </div>
  </main>
</template>
