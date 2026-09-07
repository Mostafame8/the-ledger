<script setup>
import { ARCS, GATES } from './data/index.js'
import { NODES } from './data/training/index.js'
import { useStore } from './store.js'
import StatusWindow from './components/StatusWindow.vue'
import GateList from './components/GateList.vue'
import QuestWindow from './components/QuestWindow.vue'
import SkillTree from './components/SkillTree.vue'
const s = useStore()
</script>

<template>
  <div class="wrap">
    <header class="top">
      <h1>The <span>Ledger</span></h1>
      <p v-if="s.mode.value === 'heist'">A heist in {{ ARCS.length }} arcs and {{ GATES.length }} gates. Every gate needs a trick. Every trick is an algorithm.</p>
      <p v-else>{{ NODES.length }} lessons in a back room. Marguerite teaches the trick before the gate demands it.</p>
    </header>
    <StatusWindow />
    <template v-if="s.mode.value === 'heist'">
      <GateList />
      <QuestWindow v-if="s.gate.value" />
    </template>
    <template v-else>
      <SkillTree />
    </template>
    <div v-if="s.flash.value" class="levelup"><div>{{ s.flash.value }}</div></div>
  </div>
</template>
