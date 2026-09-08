<script setup>
defineProps({ run: { type: Object, required: true }, success: { type: String, default: 'Every check passed.' } })
</script>

<template>
  <div class="tests" aria-live="polite">
    <div class="tests-head" :class="{ ok: run.passed }">
      {{ run.passed ? success
        : run.error && !run.results.length ? 'Your code did not run.'
        : `${run.results.filter(t => !t.ok).length} of ${run.results.length} checks failed.` }}
    </div>
    <pre v-if="run.error" class="err">{{ run.error }}</pre>
    <div v-for="(t, i) in run.results" :key="i" class="t" :class="t.ok ? 'ok' : 'bad'">
      <b>{{ t.ok ? '✓' : '✗' }}</b>
      <div>
        <code>{{ t.label }}</code>
        <div v-if="!t.ok" class="diff"><span>got</span><code>{{ t.got }}</code><span>want</span><code>{{ t.want }}</code></div>
      </div>
    </div>
    <details v-if="run.stdout"><summary>Printed output</summary><pre>{{ run.stdout }}</pre></details>
  </div>
</template>
