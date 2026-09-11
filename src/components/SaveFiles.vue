<script setup>
import { ref } from 'vue'
import { useStore } from '../store.js'
const s = useStore()
const draft = ref('')
const create = () => { s.newSave(draft.value); draft.value = '' }
const rename = slot => {
  const name = prompt('New name for this save file:', slot.name)
  if (name !== null) s.renameSave(slot.id, name)
}
const when = ts => new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

// Export: hand the browser a .json download. Import: read a picked file and add it as a new save.
const err = ref(null)
const picker = ref(null)
const download = slot => {
  const out = s.exportSave(slot.id)
  if (!out) return
  const url = URL.createObjectURL(new Blob([out.text], { type: 'application/json' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `ledger-${out.name.replace(/[^\w-]+/g, '_')}.json` })
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const pick = () => { err.value = null; picker.value?.click() }
const imported = async e => {
  const f = e.target.files?.[0]
  e.target.value = ''
  if (!f) return
  try { err.value = s.importSave(await f.text()) }
  catch { err.value = 'Could not read that file.' }
}
</script>

<template>
  <div class="veil" @click.self="s.closeSaves">
    <section class="sys quest saves" role="dialog" aria-modal="true" aria-labelledby="saves-title">
      <div class="sys-title"><i></i> Save files</div>
      <div class="body">
        <h2 id="saves-title">Who's on the job?</h2>
        <p class="algo" v-if="s.saves.value.length">Pick a file to keep going, or start a new one. Files live in this browser.</p>
        <p class="algo" v-else>No files yet. Give the systems person a name and start one.</p>

        <ul class="save-list" v-if="s.saves.value.length">
          <li v-for="slot in s.saves.value" :key="slot.id" class="save" :class="{ current: slot.id === s.currentSave.value?.id }">
            <div class="save-main">
              <b class="save-name">{{ slot.name }}</b>
              <span class="save-meta">
                {{ s.summary(slot).title }} · Level {{ s.summary(slot).level }} · {{ s.summary(slot).gates }} gates ·
                rank <span class="rank-letter" :class="s.summary(slot).rank">{{ s.summary(slot).rank }}</span> · {{ s.summary(slot).lessons }} lessons
              </span>
              <small class="save-when">Last played {{ when(slot.updated) }}</small>
            </div>
            <div class="row save-actions">
              <button class="btn" @click="s.loadSave(slot.id)">{{ slot.id === s.currentSave.value?.id ? 'Continue' : 'Load' }}</button>
              <button class="btn ghost" @click="rename(slot)">Rename</button>
              <button class="btn ghost" @click="download(slot)" title="Download this save as a .json file">Export</button>
              <button class="btn ghost danger" @click="s.deleteSave(slot.id)">Delete</button>
            </div>
          </li>
        </ul>

        <form class="row save-new" @submit.prevent="create">
          <label class="dim" for="save-name">New file</label>
          <input id="save-name" v-model="draft" maxlength="24" placeholder="Your name" autocomplete="off">
          <button class="btn" type="submit">Start</button>
          <button class="btn ghost" type="button" @click="pick" title="Add a save exported from another browser">Import file…</button>
          <input ref="picker" type="file" accept=".json,application/json" hidden @change="imported">
        </form>
        <p v-if="err" class="save-err" role="alert">{{ err }}</p>

        <div class="row" v-if="s.currentSave.value">
          <button class="btn ghost" type="button" @click="s.closeSaves">Back</button>
          <span class="dim">Esc closes</span>
        </div>
      </div>
    </section>
  </div>
</template>
