<script setup>
import { useStore } from '../store.js'
import { editorKeydown } from '../editor.js'
const s = useStore()
const onKey = e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (s.gate.value.tests) s.test(s.gate.value); return }
  editorKeydown(e)
}
const runLabel = () => {
  if (s.run.value?.status !== 'running') return 'Run tests'
  return s.runtime.value === 'loading' ? 'Loading Python…' : 'Running…'
}
</script>

<template>
  <div class="veil" @click.self="s.close">
    <section class="sys quest" role="dialog" aria-modal="true">
      <div class="sys-title"><i></i> Quest window</div>
      <div class="body">
        <h2>{{ s.gate.value.title }}</h2>
        <div class="algo">Gate rank {{ s.gate.value.rank }} · {{ s.gate.value.algo }}</div>
        <div class="story">
          <p v-for="(line, k) in s.gate.value.story" :key="k" :class="{ voice: line.startsWith('“') }">{{ line }}</p>
        </div>
        <div class="mission">
          <h4>Mission</h4>
          <p>{{ s.gate.value.mission }}</p>
          <pre v-if="s.gate.value.code">{{ s.gate.value.code }}</pre>
        </div>
        <details v-if="s.gate.value.hint"><summary>Marguerite's note (hint)</summary><p>{{ s.gate.value.hint }}</p></details>
        <label>
          <div class="editor-label">Your solution (saved locally) <small>Tab / Shift+Tab indent · Ctrl+Enter runs tests</small></div>
          <textarea class="editor" v-model="s.notes.value[s.gate.value.id]" spellcheck="false" autocapitalize="off" autocomplete="off"
            wrap="off" placeholder="# write your Python here" @keydown="onKey"></textarea>
        </label>
        <div class="row">
          <template v-if="s.gate.value.tests">
            <button class="btn" :disabled="s.run.value?.status === 'running'" @click="s.test(s.gate.value)">{{ runLabel() }}</button>
            <span v-if="s.isDone(s.gate.value.id)" class="done-note">Cleared. The guard never knew you were there.</span>
            <span v-else-if="s.runtime.value === 'loading'" class="dim">First run downloads the Python runtime (about 10 MB).</span>
            <span v-else-if="s.runtime.value === 'failed'" class="dim">Python could not load. Check the network and try again.</span>
          </template>
          <template v-else>
            <button v-if="!s.isDone(s.gate.value.id)" class="btn" @click="s.clear(s.gate.value)">Report gate cleared</button>
            <span v-else class="done-note">Cleared. The guard never knew you were there.</span>
          </template>
          <button class="btn ghost" @click="s.close">Close window</button>
        </div>
        <div v-if="s.run.value?.status === 'done'" class="tests" aria-live="polite">
          <div class="tests-head" :class="{ ok: s.run.value.passed }">
            {{ s.run.value.passed ? 'Every check passed. Gate cleared.'
              : s.run.value.error && !s.run.value.results.length ? 'Your code did not run.'
              : `${s.run.value.results.filter(t => !t.ok).length} of ${s.run.value.results.length} checks failed.` }}
          </div>
          <pre v-if="s.run.value.error" class="err">{{ s.run.value.error }}</pre>
          <div v-for="(t, i) in s.run.value.results" :key="i" class="t" :class="t.ok ? 'ok' : 'bad'">
            <b>{{ t.ok ? '✓' : '✗' }}</b>
            <div>
              <code>{{ t.label }}</code>
              <div v-if="!t.ok" class="diff"><span>got</span><code>{{ t.got }}</code><span>want</span><code>{{ t.want }}</code></div>
            </div>
          </div>
          <details v-if="s.run.value.stdout"><summary>Printed output</summary><pre>{{ s.run.value.stdout }}</pre></details>
        </div>
      </div>
    </section>
  </div>
</template>
