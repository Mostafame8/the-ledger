<script setup>
import { ref } from 'vue'
import { useStore } from '../store.js'
const props = defineProps({ step: { type: Object, required: true } })
const s = useStore()
const picked = ref(s.satisfied.value ? props.step.answer : null)
const right = () => picked.value === props.step.answer
const pick = i => { picked.value = i; if (i === props.step.answer) s.answer(true) }
</script>

<template>
  <div class="mission">
    <h4>Spot the pattern</h4>
    <p>{{ step.problem }}</p>
  </div>
  <div class="opts">
    <button v-for="(o, i) in step.options" :key="i" class="opt"
      :class="{ right: picked === i && right(), wrong: picked === i && !right() }"
      :disabled="right()" @click="pick(i)">{{ o }}</button>
  </div>
  <p v-if="picked !== null" class="why" :class="{ ok: right() }">{{ right() ? '✓ ' : '✗ Not that one. ' }}{{ step.why }}</p>
</template>
