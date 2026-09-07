<script setup>
import { ARCS } from '../data/index.js'
import { useStore } from '../store.js'
const s = useStore()
</script>

<template>
  <main class="sys gates">
    <div class="sys-title"><i></i> Gates detected</div>
    <div class="body">
      <template v-for="arc in ARCS" :key="arc.name">
        <div class="arc" :class="{ sealed: !s.arcOpen(arc) }">
          <span>{{ arc.name }}</span><small>{{ arc.sub }}</small>
        </div>
        <button v-for="g in arc.gates" :key="g.id" class="gate" :disabled="s.isLocked(g)" @click="s.open(g)">
          <div class="rank" :class="g.rank">{{ g.rank }}</div>
          <div><h3>{{ g.title }}</h3><p>{{ g.algo }}</p></div>
          <span class="tag" :class="{ done: s.isDone(g.id), locked: s.isLocked(g) }">
            {{ s.isDone(g.id) ? 'cleared' : s.isLocked(g) ? 'sealed' : '+' + g.xp + ' xp' }}
          </span>
        </button>
      </template>
    </div>
  </main>
</template>
