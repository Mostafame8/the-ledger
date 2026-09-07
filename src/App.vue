<script setup>
import { ARCS, GATES } from './data/index.js'
import { useStore } from './store.js'
import StatusWindow from './components/StatusWindow.vue'
import GateList from './components/GateList.vue'
import QuestWindow from './components/QuestWindow.vue'
const s = useStore()
</script>

<template>
  <div class="wrap">
    <header class="top">
      <h1>The <span>Ledger</span></h1>
      <p>A heist in {{ ARCS.length }} arcs and {{ GATES.length }} gates. Every gate needs a trick. Every trick is an algorithm.</p>
    </header>
    <StatusWindow />
    <GateList />
    <QuestWindow v-if="s.gate.value" />
    <div v-if="s.flash.value" class="levelup"><div>{{ s.flash.value }}</div></div>
  </div>
</template>
