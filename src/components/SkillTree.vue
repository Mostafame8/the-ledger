<script setup>
import { computed } from 'vue'
import { NODES, NODE_BY_ID, TIERS } from '../data/training/index.js'
import { depthOf } from '../data/training/progress.js'
import { useStore } from '../store.js'
const s = useStore()

const BLURBS = {
  F: 'Hands on the tools.',
  E: 'Search, stacks, and shape.',
  D: 'Windows, sums, links, trees.',
  C: 'Grids and recursion.',
  B: 'Graphs, heaps, sorting.',
  A: 'Weighted roads and the first tables.',
  S: 'The Ledger itself.',
}

const tiers = TIERS.filter(t => NODES.some(n => n.tier === t))
const sealed = tier => !NODES.some(n => n.tier === tier && s.nodeState(n.id) !== 'locked')

// Lessons in the selected tier, shallow prerequisites first (stable sort keeps file order).
const rows = computed(() => NODES.filter(n => n.tier === s.trainingTab.value)
  .sort((a, b) => depthOf(a, NODE_BY_ID) - depthOf(b, NODE_BY_ID)))
const needs = n => n.requires.map(id => NODE_BY_ID[id].title).join(', ')
const used = n => n.gates.length ? 'used in ' + n.gates.length + ' gate' + (n.gates.length === 1 ? '' : 's') : 'used in every gate'
const label = n => ({ cleared: 'trained', locked: 'sealed', open: '+' + n.xp + ' xp' })[s.nodeState(n.id)]
</script>

<template>
  <main class="sys tree">
    <div class="sys-title"><i></i> Training room</div>
    <div class="body">
      <nav class="tabs" role="tablist" aria-label="Tiers">
        <button v-for="t in tiers" :key="t" role="tab" class="tab"
          :class="{ active: t === s.trainingTab.value, sealed: sealed(t) }"
          :aria-selected="t === s.trainingTab.value"
          :title="'Tier ' + t + ': ' + s.tierProgress(t).total + ' lesson' + (s.tierProgress(t).total === 1 ? '' : 's')"
          @click="s.setTrainingTab(t)">
          <b>{{ t }}</b>
          <small>{{ s.tierProgress(t).done }} / {{ s.tierProgress(t).total }}</small>
        </button>
      </nav>
      <div class="arc" :class="{ sealed: sealed(s.trainingTab.value) }">
        <span>Tier <span class="rank-letter" :class="s.trainingTab.value">{{ s.trainingTab.value }}</span></span>
        <small v-if="BLURBS[s.trainingTab.value]">{{ BLURBS[s.trainingTab.value] }}</small>
      </div>
      <button v-for="n in rows" :key="n.id" class="gate lesson-row"
        :disabled="s.nodeState(n.id) === 'locked'" @click="s.openNode(n.id)">
        <div class="rank" :class="n.tier">{{ n.tier }}</div>
        <div>
          <h3>{{ n.title }}</h3>
          <p>{{ n.algo }}</p>
          <small class="needs">{{ used(n) }}<template v-if="s.nodeState(n.id) === 'locked'"> &middot; needs: <b>{{ needs(n) }}</b></template></small>
        </div>
        <span class="tag" :class="{ done: s.nodeState(n.id) === 'cleared', locked: s.nodeState(n.id) === 'locked' }">{{ label(n) }}</span>
      </button>
    </div>
  </main>
</template>
