<script setup>
import { computed } from 'vue'
import { useStore } from '../store.js'
const s = useStore()
const ARCS = computed(() => s.course.value.arcs)
const arc = computed(() => ARCS.value[s.tab.value])
// 'Arc II — Casing the bank' -> ['Arc II', 'Casing the bank']
const parts = name => name.split(' — ')
</script>

<template>
  <main class="sys gates">
    <div class="sys-title"><i></i> Gates detected</div>
    <div class="body">
      <nav class="tabs" role="tablist" aria-label="Arcs">
        <button v-for="(a, i) in ARCS" :key="a.name" role="tab" class="tab"
          :class="{ active: i === s.tab.value, sealed: !s.arcOpen(a) }"
          :aria-selected="i === s.tab.value" :title="a.name" @click="s.setTab(i)">
          <b>{{ parts(a.name)[0] }}</b>
          <small>{{ s.arcProgress(a) }} / {{ a.gates.length }}</small>
        </button>
      </nav>
      <Transition name="swap" mode="out-in">
        <div class="pane" :key="s.tab.value">
          <div class="arc" :class="{ sealed: !s.arcOpen(arc) }">
            <span>{{ parts(arc.name)[1] }}</span><small>{{ arc.sub }}</small>
          </div>
          <button v-for="g in arc.gates" :key="g.id" class="gate" :disabled="s.isLocked(g)" @click="s.open(g)">
            <div class="rank" :class="g.rank">{{ g.rank }}</div>
            <div><h3>{{ g.title }}</h3><p>{{ g.algo }}</p></div>
            <span class="tag" :class="{ done: s.isDone(g.id), locked: s.isLocked(g) }">
              {{ s.isDone(g.id) ? 'cleared' : s.isLocked(g) ? 'sealed' : '+' + g.xp + ' xp' }}
            </span>
          </button>
        </div>
      </Transition>
    </div>
  </main>
</template>
