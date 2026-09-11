<script setup>
import { useStore } from './store.js'
import StatusWindow from './components/StatusWindow.vue'
import GateList from './components/GateList.vue'
import QuestWindow from './components/QuestWindow.vue'
import SkillTree from './components/SkillTree.vue'
import LessonWindow from './components/LessonWindow.vue'
import SaveFiles from './components/SaveFiles.vue'
const s = useStore()
</script>

<template>
  <div class="wrap">
    <header class="top">
      <h1>The <span>Ledger</span></h1>
      <p v-if="s.mode.value === 'heist'">{{ s.course.value.blurbs.heist }}</p>
      <p v-else>{{ s.course.value.blurbs.training }}</p>
    </header>
    <StatusWindow />
    <Transition name="swap" mode="out-in">
      <GateList v-if="s.mode.value === 'heist'" />
      <SkillTree v-else />
    </Transition>
    <Transition name="veil">
      <QuestWindow v-if="s.mode.value === 'heist' && s.gate.value" />
      <LessonWindow v-else-if="s.mode.value !== 'heist' && s.activeNode.value" />
    </Transition>
    <Transition name="veil">
      <SaveFiles v-if="s.savesOpen.value || !s.currentSave.value" />
    </Transition>
    <div v-if="s.flash.value" class="levelup"><div>{{ s.flash.value }}</div></div>
  </div>
</template>
