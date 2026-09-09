<script setup>
import { computed, watch } from 'vue'
import { useStore } from '../store.js'
import StepExplain from './StepExplain.vue'
import StepSpot from './StepSpot.vue'
import StepTrace from './StepTrace.vue'
import StepCode from './StepCode.vue'
const s = useStore()
const STEP_COMPONENTS = { explain: StepExplain, spot: StepSpot, trace: StepTrace, blank: StepCode, mini: StepCode }
const comp = computed(() => STEP_COMPONENTS[s.activeStep.value?.type] ?? null)
const last = computed(() => s.stepIndex.value === s.activeNode.value.steps.length - 1)
const isTool = computed(() => !s.activeNode.value?.tier)
// Warm the three.js chunk as soon as a lesson with a scene opens, so the trace step never waits.
watch(() => s.activeNode.value?.id, () => {
  if (s.activeNode.value?.steps.some(st => st.scene)) import('../scene/stage.js').then(m => m.preload()).catch(() => {})
}, { immediate: true })
const kicker = { explain: 'Marguerite explains', trace: 'Trace it by hand', spot: 'Spot the pattern', blank: 'Fill the blanks', mini: 'Mini mission' }
</script>

<template>
  <div class="veil">
    <section class="sys quest lesson" role="dialog" aria-modal="true">
      <div class="sys-title"><i></i> Training room</div>
      <div class="body">
        <h2>{{ s.activeNode.value.title }}</h2>
        <div class="algo">
          {{ s.activeNode.value.algo }} · {{ kicker[s.activeStep.value?.type] }} · step {{ s.stepIndex.value + 1 }} of {{ s.activeNode.value.steps.length }}
          <span v-if="s.activeStep.value?.move" class="move">move: {{ s.activeStep.value?.move }}</span>
        </div>
        <div class="dots" aria-hidden="true">
          <i v-for="(st, i) in s.activeNode.value.steps" :key="i" :class="{ done: i < s.stepIndex.value, now: i === s.stepIndex.value }"></i>
        </div>
        <component :is="comp" :key="s.activeNode.value.id + '/' + s.stepIndex.value" :step="s.activeStep.value" />
        <div class="row">
          <button class="btn ghost" :disabled="s.stepIndex.value === 0" @click="s.back">Back</button>
          <button class="btn" :disabled="!s.satisfied.value" @click="s.next">{{ last ? (isTool ? 'Unlock tool' : 'Finish lesson') : 'Next' }}</button>
          <button class="btn ghost" @click="s.closeNode">Close</button>
          <span v-if="!s.satisfied.value" class="dim">Answer to continue.</span>
        </div>
      </div>
    </section>
  </div>
</template>
