<script setup>
import { useStore } from '../store.js'
const s = useStore()
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
          <div style="color:var(--dim);margin-bottom:6px">Your solution (saved locally)</div>
          <textarea v-model="s.notes.value[s.gate.value.id]" spellcheck="false" placeholder="# paste your Python here"></textarea>
        </label>
        <div class="row">
          <button v-if="!s.isDone(s.gate.value.id)" class="btn" @click="s.clear(s.gate.value)">Report gate cleared</button>
          <span v-else class="done-note">Cleared. The guard never knew you were there.</span>
          <button class="btn ghost" @click="s.close">Close window</button>
        </div>
      </div>
    </section>
  </div>
</template>
