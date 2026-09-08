<script setup>
import { useStore } from '../store.js'
import { editorKeydown } from '../editor.js'
import TestResults from './TestResults.vue'
const props = defineProps({ step: { type: Object, required: true } })
const s = useStore()
const onKey = e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); s.runStepTests(); return }
  editorKeydown(e)
}
const runLabel = () => {
  if (s.stepRun.value?.status !== 'running') return 'Run tests'
  return s.runtime.value === 'loading' ? 'Loading Python…' : 'Running…'
}
const brief = () => props.step.type === 'blank' ? props.step.intro : props.step.mission
</script>

<template>
  <div class="mission">
    <h4>{{ step.type === 'blank' ? 'Fill the blanks' : 'Mini mission' }}</h4>
    <p :class="{ voice: brief().startsWith('“') }">{{ brief() }}</p>
    <p v-if="step.type === 'blank'" class="dim">Replace every <code>___</code>. Everything else is already right.</p>
  </div>
  <details v-if="step.hint"><summary>Marguerite's note (hint)</summary><p>{{ step.hint }}</p></details>
  <label>
    <div class="editor-label">Your Python (saved locally) <small>Tab / Shift+Tab indent · Ctrl+Enter runs tests</small></div>
    <textarea class="editor" v-model="s.stepCode.value" spellcheck="false" autocapitalize="off" autocomplete="off"
      wrap="off" placeholder="# write your Python here" @keydown="onKey"></textarea>
  </label>
  <div class="row">
    <button class="btn" :disabled="s.stepRun.value?.status === 'running'" @click="s.runStepTests">{{ runLabel() }}</button>
    <span v-if="s.satisfied.value" class="done-note">Passed. Marguerite nods once.</span>
    <span v-else-if="s.runtime.value === 'loading'" class="dim">First run downloads the Python runtime (about 10 MB).</span>
    <span v-else-if="s.runtime.value === 'failed'" class="dim">Python could not load. Check the network and try again.</span>
  </div>
  <TestResults v-if="s.stepRun.value?.status === 'done'" :run="s.stepRun.value" success="Every check passed." />
</template>
