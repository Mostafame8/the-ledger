<script setup>
import { computed } from 'vue'
import { depthOf } from '../training/progress.js'
import { useStore } from '../store.js'
const s = useStore()
const T = computed(() => s.course.value.training)
const BLURBS = computed(() => s.course.value.tierBlurbs)

const tiers = computed(() => T.value.TIERS.filter(t => T.value.NODES.some(n => n.tier === t)))
const tabs = computed(() => ['kit', ...tiers.value])
const sealed = tier => tier !== 'kit' && !T.value.NODES.some(n => n.tier === tier && s.nodeState(n.id) !== 'locked')

// Lessons in the selected tier, shallow prerequisites first (stable sort keeps file order).
const rows = computed(() => T.value.NODES.filter(n => n.tier === s.trainingTab.value)
  .sort((a, b) => depthOf(a, T.value.NODE_BY_ID) - depthOf(b, T.value.NODE_BY_ID)))
const needsLessons = n => n.requires.filter(id => s.nodeState(id) !== 'cleared').map(id => T.value.NODE_BY_ID[id].title).join(', ')
const needsTools = n => (n.tools || []).filter(id => s.nodeState(id) !== 'cleared').map(id => T.value.TOOL_BY_ID[id]?.algo ?? id).join(', ')
const used = n => n.gates.length ? 'used in ' + n.gates.length + ' gate' + (n.gates.length === 1 ? '' : 's') : 'used in every gate'
const label = n => ({ cleared: 'trained', locked: 'sealed', open: '+' + n.xp + ' xp' })[s.nodeState(n.id)]
const kitLabel = t => s.nodeState(t.id) === 'cleared' ? 'trained' : '+' + t.xp + ' xp'
</script>

<template>
  <main class="sys tree">
    <div class="sys-title"><i></i> Training room</div>
    <div class="body">
      <nav class="tabs" role="tablist" aria-label="Armoury and tiers">
        <button v-for="t in tabs" :key="t" role="tab" class="tab"
          :class="{ active: t === s.trainingTab.value, sealed: sealed(t) }"
          :aria-selected="t === s.trainingTab.value"
          :title="t === 'kit' ? 'Armoury: the tools' : 'Tier ' + t + ': ' + s.tierProgress(t).total + ' lesson' + (s.tierProgress(t).total === 1 ? '' : 's')"
          @click="s.setTrainingTab(t)">
          <template v-if="t === 'kit'">
            <b>Armoury</b>
            <small>{{ s.toolsCleared.value }} / {{ T.TOOLS.length }}</small>
          </template>
          <template v-else>
            <b>{{ t }}</b>
            <small>{{ s.tierProgress(t).done }} / {{ s.tierProgress(t).total }}</small>
          </template>
        </button>
      </nav>
      <Transition name="swap" mode="out-in">
      <div class="pane" :key="s.trainingTab.value">
      <div class="arc" :class="{ sealed: sealed(s.trainingTab.value) }">
        <template v-if="s.trainingTab.value === 'kit'">
          <span>Armoury</span>
          <small>What the crew carries.</small>
        </template>
        <template v-else>
          <span>Tier <span class="rank-letter" :class="s.trainingTab.value">{{ s.trainingTab.value }}</span></span>
          <small v-if="BLURBS[s.trainingTab.value]">{{ BLURBS[s.trainingTab.value] }}</small>
        </template>
      </div>
      <template v-if="s.trainingTab.value === 'kit'">
        <button v-for="t in T.TOOLS" :key="t.id" class="gate lesson-row" @click="s.openNode(t.id)">
          <div class="kit-badge">tool</div>
          <div>
            <h3>{{ t.title }}</h3>
            <p>{{ t.algo }}</p>
          </div>
          <span class="tag" :class="{ done: s.nodeState(t.id) === 'cleared' }">{{ kitLabel(t) }}</span>
        </button>
      </template>
      <template v-else>
        <button v-for="n in rows" :key="n.id" class="gate lesson-row"
          :disabled="s.nodeState(n.id) === 'locked'" @click="s.openNode(n.id)">
          <div class="rank" :class="n.tier">{{ n.tier }}</div>
          <div>
            <h3>{{ n.title }}</h3>
            <p>{{ n.algo }}</p>
            <div class="chips" v-if="n.tools?.length">
              <span v-for="tid in n.tools" :key="tid" class="chip" :class="{ locked: s.nodeState(tid) !== 'cleared' }">{{ T.TOOL_BY_ID[tid]?.algo ?? tid }}</span>
            </div>
            <small class="needs">{{ used(n) }}<template v-if="s.nodeState(n.id) === 'locked'"><template v-if="needsLessons(n)"> &middot; needs: <b>{{ needsLessons(n) }}</b></template><template v-if="needsTools(n)"> &middot; {{ needsLessons(n) ? 'tools: ' : 'needs tools: ' }}<b>{{ needsTools(n) }}</b></template></template></small>
          </div>
          <span class="tag" :class="{ done: s.nodeState(n.id) === 'cleared', locked: s.nodeState(n.id) === 'locked' }">{{ label(n) }}</span>
        </button>
      </template>
      </div>
      </Transition>
    </div>
  </main>
</template>
