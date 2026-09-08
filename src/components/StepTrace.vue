<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../store.js'
import { pyLiteral, sameLiteral } from '../data/training/answers.js'
const props = defineProps({ step: { type: Object, required: true } })
const s = useStore()

const total = props.step.frames.length
const k = ref(s.satisfied.value ? total : 0)          // frames answered so far
const typed = ref('')
const wrong = ref(false)
const done = computed(() => k.value >= total)
const frame = computed(() => props.step.frames[Math.min(k.value, total - 1)])
const lines = computed(() => props.step.code.split('\n'))
const label = k => k === 'returns' ? 'return value' : k
const shown = computed(() => Object.entries(frame.value.state)
  .map(([name, v]) => ({ name, text: name === frame.value.ask && !done.value ? '?' : pyLiteral(v) })))

function submit() {
  if (done.value) return
  if (sameLiteral(typed.value, frame.value.state[frame.value.ask])) {
    k.value += 1; typed.value = ''; wrong.value = false
    if (done.value) s.answer(true)
  } else {
    wrong.value = true
  }
}
</script>

<template>
  <div class="mission">
    <h4>Trace it by hand</h4>
    <p>Call: <code>{{ step.input }}</code>. At each stop, type the value of the highlighted variable exactly as Python would print it.</p>
  </div>
  <div class="trace">
    <pre class="trace-code"><div v-for="(l, i) in lines" :key="i" :class="{ hl: i + 1 === frame.line }"><span class="ln" aria-hidden="true">{{ i + 1 }}</span>{{ l }}</div></pre>
    <div class="trace-side">
      <div class="dim">Stop {{ Math.min(k + 1, total) }} of {{ total }} · after line {{ frame.line }}</div>
      <div class="state">
        <div v-for="v in shown" :key="v.name" class="var" :class="{ ask: v.name === frame.ask && !done }">
          <span>{{ label(v.name) }}</span><code>{{ v.text }}</code>
        </div>
      </div>
      <form v-if="!done" class="ans" @submit.prevent="submit">
        <label>Value of <code>{{ label(frame.ask) }}</code></label>
        <input v-model="typed" autocomplete="off" spellcheck="false" autofocus placeholder="e.g. 3, 'ab', [1, 2], True, None">
        <button class="btn" type="submit">Check</button>
      </form>
      <p v-if="wrong" class="why">✗ It is <code>{{ pyLiteral(frame.state[frame.ask]) }}</code>. {{ frame.note }} Type it to continue.</p>
      <p v-else-if="k > 0 && !done" class="why ok">✓ {{ step.frames[k - 1].note }}</p>
      <p v-if="done" class="done-note">Trace complete. {{ step.frames[total - 1].note }}</p>
    </div>
  </div>
</template>
