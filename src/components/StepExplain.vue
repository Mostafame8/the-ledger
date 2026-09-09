<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { normalize } from '../scene/model.js'
import SceneView from './SceneView.vue'
const props = defineProps({ step: { type: Object, required: true } })
// Explain scenes loop through `states` every 1.6 s (a single state just sits still).
const scene = computed(() => props.step.scene ? normalize(props.step.scene) : null)
const tick = ref(0)
let timer = null
onMounted(() => {
  if ((scene.value?.states.length ?? 0) > 1) timer = setInterval(() => { tick.value += 1 }, 1600)
})
onBeforeUnmount(() => clearInterval(timer))
const state = computed(() => scene.value ? scene.value.states[tick.value % scene.value.states.length] : {})
</script>

<template>
  <div class="story">
    <p v-for="(line, k) in step.lines" :key="k" :class="{ voice: line.startsWith('“') }">{{ line }}</p>
  </div>
  <SceneView v-if="scene" :scene="scene" :state="state" />
  <pre v-if="step.code">{{ step.code }}</pre>
</template>
