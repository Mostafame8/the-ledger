import { ref, computed, watch } from 'vue'
import { ARCS, GATES, XP_PER_LEVEL, titleFor } from './courses/algorithms/index.js'
import { runTests, runtime, warm } from './runner.js'
import { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS } from './courses/algorithms/training/index.js'
import { rankFor, rankProgress, isOpen } from './training/progress.js'

import { SAVES_KEY, LEGACY_KEY, migrateLegacy, createSlot, selectSlot, deleteSlot, renameSlot, writeSlot, currentSlot, exportSlot, parseImport, importSlot } from './saves.js'

// ── Save files ───────────────────────────────────────────────────────────────────
// All slots live under SAVES_KEY. The pre-slot save under LEGACY_KEY migrates into slot 1 once.
const readJson = k => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
const loadFile = () => {
  const f = readJson(SAVES_KEY)
  if (f && Array.isArray(f.slots)) return { current: f.current ?? null, slots: f.slots }
  return migrateLegacy(readJson(LEGACY_KEY), Date.now())
}
const persistFile = f => { try { localStorage.setItem(SAVES_KEY, JSON.stringify(f)) } catch {} }

const file = ref(loadFile())
persistFile(file.value)   // a fresh migration must land in storage even if nothing changes this visit
const currentSave = computed(() => currentSlot(file.value))
const saves = computed(() => [...file.value.slots].sort((a, b) => b.updated - a.updated))
const savesOpen = ref(false)   // the save-file screen; forced open while no slot is selected

const fresh = (name = 'Hunter') => ({ name, xp: 0, stats: { logic: 0, speed: 0, memory: 0 } })
const freshTraining = () => ({ xp: 0, nodes: {}, tools: {}, active: null, code: {}, tab: null })

const player = ref(fresh())
const cleared = ref([])
const notes = ref({})
const active = ref(null)
const flash = ref(null)   // text to show in the level-up overlay, or null

// ── Training room ────────────────────────────────────────────────────────────────
const mode = ref('heist')
const training = ref(freshTraining())
const setMode = m => { mode.value = m === 'training' ? 'training' : 'heist' }

// Lessons and tools share one lookup and one progress-record accessor.
const ITEM_BY_ID = { ...NODE_BY_ID, ...TOOL_BY_ID }
const progressMap = id => TOOL_BY_ID[id] ? training.value.tools : training.value.nodes

const trainingXp = computed(() => training.value.xp)
const trainingRank = computed(() => rankFor(training.value.xp, NODES))
const trainingProgress = computed(() => rankProgress(training.value.xp, NODES))
const nodesCleared = computed(() => NODES.filter(n => training.value.nodes[n.id]?.cleared).length)
const toolsCleared = computed(() => TOOLS.filter(t => training.value.tools[t.id]?.cleared).length)
const kitXp = computed(() => TOOLS.filter(t => training.value.tools[t.id]?.cleared).reduce((sum, t) => sum + t.xp, 0))
const nodeState = id => {
  const rec = progressMap(id)[id]
  if (rec?.cleared) return 'cleared'
  if (TOOL_BY_ID[id]) return 'open'
  return NODE_BY_ID[id] && isOpen(NODE_BY_ID[id], training.value.nodes, training.value.tools) ? 'open' : 'locked'
}

// Selected training tier tab. Defaults to the Armoury while no tool is cleared, else the
// first populated tier holding an uncleared node.
const populatedTiers = TIERS.filter(t => NODES.some(n => n.tier === t))
const defaultTrainingTab = () => {
  if (toolsCleared.value === 0) return 'kit'
  const t = populatedTiers.find(t => NODES.some(n => n.tier === t && !training.value.nodes[n.id]?.cleared))
  return t ?? populatedTiers[populatedTiers.length - 1]
}
const validTrainingTab = t => t === 'kit' || populatedTiers.includes(t)
const trainingTab = ref(defaultTrainingTab())
const setTrainingTab = t => { trainingTab.value = t }
const tierProgress = tier => {
  const nodes = NODES.filter(n => n.tier === tier)
  return { done: nodes.filter(n => training.value.nodes[n.id]?.cleared).length, total: nodes.length }
}

const activeNode = computed(() => training.value.active ? ITEM_BY_ID[training.value.active] ?? null : null)
const stepIndex = computed(() => {
  const n = activeNode.value
  if (!n) return 0
  return Math.min(progressMap(n.id)[n.id]?.step ?? 0, n.steps.length - 1)
})
const activeStep = computed(() => activeNode.value ? activeNode.value.steps[stepIndex.value] : null)
const satisfied = ref(false)       // current step answered correctly (or needs no answer)
const stepRun = ref(null)          // last test run for a code step, same shape as `run`

function enterStep() {
  if (training.value.active && !ITEM_BY_ID[training.value.active]) training.value.active = null
  const st = activeStep.value
  const cleared = !!(activeNode.value && progressMap(activeNode.value.id)[activeNode.value.id]?.cleared)
  satisfied.value = !st || st.type === 'explain' || cleared
  stepRun.value = null
}
function openNode(id) {
  if (!ITEM_BY_ID[id] || nodeState(id) === 'locked') return
  const map = progressMap(id)
  const rec = (map[id] ||= { step: 0, cleared: false })
  if (rec.cleared) rec.step = 0            // review from the top
  training.value.active = id
  enterStep()
  if (ITEM_BY_ID[id].steps.some(st => st.tests)) warm()
}
function closeNode() { training.value.active = null }
function answer(ok) { if (ok) satisfied.value = true }
function next() {
  const n = activeNode.value
  if (!n || !satisfied.value) return
  const rec = progressMap(n.id)[n.id]
  if ((rec.step ?? 0) + 1 >= n.steps.length) { finishItem(n); return }
  rec.step = (rec.step ?? 0) + 1
  enterStep()
}
function back() {
  const n = activeNode.value
  const rec = n && progressMap(n.id)[n.id]
  if (!rec || (rec.step ?? 0) === 0) return
  rec.step = (rec.step ?? 0) - 1
  enterStep()
}
function finishItem(n) {
  const rec = progressMap(n.id)[n.id]
  if (!rec.cleared) {
    rec.cleared = true
    if (TOOL_BY_ID[n.id]) {
      showFlash('Tool unlocked')
    } else {
      const before = trainingRank.value
      training.value.xp += n.xp
      showFlash(trainingRank.value !== before ? `Rank ${trainingRank.value}` : 'Lesson cleared')
    }
  }
  training.value.active = null
}

const codeKey = () => `${activeNode.value.id}/${stepIndex.value}`
const stepCode = computed({
  get: () => {
    const st = activeStep.value
    if (!st) return ''
    return training.value.code[codeKey()] ?? (st.type === 'blank' ? st.template : '')
  },
  set: v => { if (activeNode.value) training.value.code[codeKey()] = v },
})
async function runStepTests() {
  const st = activeStep.value
  if (!st?.tests || stepRun.value?.status === 'running') return
  const key = codeKey()
  stepRun.value = { status: 'running' }
  const r = await runTests(stepCode.value, st.tests)
  if (!activeNode.value || codeKey() !== key) return   // learner moved on; drop the stale result
  const passed = !r.error && r.results.length > 0 && r.results.every(t => t.ok)
  stepRun.value = { status: 'done', passed, ...r }
  if (passed) answer(true)
}

let flashTimer = null
function showFlash(text) { clearTimeout(flashTimer); flash.value = text; flashTimer = setTimeout(() => { flash.value = null }, 1900) }

const gate = computed(() => active.value === null ? null : GATES[active.value])
const level = computed(() => Math.floor(player.value.xp / XP_PER_LEVEL))
const xpInLevel = computed(() => player.value.xp % XP_PER_LEVEL)
const xpPct = computed(() => xpInLevel.value / XP_PER_LEVEL * 100)
const clearedCount = computed(() => cleared.value.length)
const title = computed(() => titleFor(clearedCount.value))
const statList = computed(() => ['logic', 'speed', 'memory']
  .map(k => ({ key: k, label: k[0].toUpperCase() + k.slice(1), value: player.value.stats[k] })))

const isDone = id => cleared.value.includes(id)
const isLocked = g => { const i = GATES.indexOf(g); return i > 0 && !isDone(GATES[i - 1].id) }
const arcOpen = arc => !isLocked(arc.gates[0])
const arcProgress = arc => arc.gates.filter(g => isDone(g.id)).length

// Selected arc tab. Defaults to the arc holding the next uncleared gate.
const defaultTab = () => { const i = ARCS.findIndex(a => a.gates.some(g => !isDone(g.id))); return i === -1 ? ARCS.length - 1 : i }
const validTab = t => Number.isInteger(t) && t >= 0 && t < ARCS.length
const tab = ref(defaultTab())
const setTab = i => { tab.value = i }
const open = g => { if (isLocked(g)) return; active.value = GATES.indexOf(g); run.value = null; if (g.tests) warm() }
const close = () => { active.value = null }

// Last test run for the open gate: null | { status: 'running' } | { status: 'done', passed, results, stdout, error }
const run = ref(null)
async function test(g) {
  if (run.value?.status === 'running') return
  run.value = { status: 'running' }
  const r = await runTests(notes.value[g.id] || '', g.tests)
  const passed = !r.error && r.results.length > 0 && r.results.every(t => t.ok)
  run.value = { status: 'done', passed, ...r }
  if (passed) clear(g)
}

function clear(g) {
  if (isDone(g.id)) return
  const before = level.value
  cleared.value.push(g.id)
  player.value.xp += g.xp
  player.value.stats[g.stat] += 1
  if (level.value > before) showFlash(`Level ${level.value}`)
}
// ── Save files: load a slot into the live refs, write the live refs back ─────────
const snapshot = () => ({
  player: player.value, cleared: cleared.value, notes: notes.value, tab: tab.value,
  mode: mode.value, training: { ...training.value, tab: trainingTab.value },
})
// Fill every live ref from a slot's data (null data = a fresh game named after the slot).
// The watcher then writes the normalised snapshot straight back, which also stamps "last played".
function applyData(data, name) {
  const d = data || {}
  player.value = d.player || fresh(name)
  cleared.value = d.cleared || []
  notes.value = d.notes || {}
  active.value = null
  run.value = null
  mode.value = d.mode === 'training' ? 'training' : 'heist'
  training.value = { ...freshTraining(), ...(d.training || {}) }
  tab.value = validTab(d.tab) ? d.tab : defaultTab()
  trainingTab.value = validTrainingTab(training.value.tab) ? training.value.tab : defaultTrainingTab()
  enterStep()   // initialise `satisfied` for a persisted `training.active`
}
function commitFile(f) { file.value = f; persistFile(f) }

// A one-line card for the save-file list.
function summary(slot) {
  const d = slot.data
  if (!d) return { level: 0, gates: 0, rank: rankFor(0, NODES), lessons: 0 }
  return {
    level: Math.floor((d.player?.xp || 0) / XP_PER_LEVEL),
    gates: (d.cleared || []).length,
    rank: rankFor(d.training?.xp || 0, NODES),
    lessons: NODES.filter(n => d.training?.nodes?.[n.id]?.cleared).length,
  }
}
const openSaves = () => { savesOpen.value = true }
const closeSaves = () => { if (currentSave.value) savesOpen.value = false }
function newSave(name) {
  const { file: f, id } = createSlot(file.value, name, Date.now())
  commitFile(f)
  applyData(null, currentSlot(f).name)
  savesOpen.value = false
  return id
}
function loadSave(id) {
  if (id === file.value.current) { savesOpen.value = false; return }
  const f = selectSlot(file.value, id)
  if (f.current !== id) return
  commitFile(f)
  applyData(currentSlot(f).data, currentSlot(f).name)
  savesOpen.value = false
}
function deleteSave(id) {
  const s = file.value.slots.find(s => s.id === id)
  if (!s || !confirm(`Delete the save file "${s.name}"? The heist and the training in it are gone for good.`)) return
  const wasCurrent = id === file.value.current
  commitFile(deleteSlot(file.value, id))
  if (wasCurrent) { applyData(null); savesOpen.value = true }
}
function renameSave(id, name) {
  commitFile(renameSlot(file.value, id, name))
  if (id === file.value.current) player.value.name = currentSave.value.name
}
// { name, text } for a download, or null for an unknown id.
function exportSave(id) {
  const s = file.value.slots.find(s => s.id === id)
  return s ? { name: s.name, text: exportSlot(s) } : null
}
// Adds the file's slot as a new save and switches to it. Returns an error string, or null on success.
function importSave(text) {
  const r = parseImport(text, Date.now())
  if (!r.ok) return r.error
  const f = importSlot(file.value, r.slot)
  commitFile(f)
  applyData(r.slot.data, r.slot.name)
  savesOpen.value = false
  return null
}

// Resume: load whatever slot was selected; with none, the save screen opens and the refs stay fresh.
if (currentSave.value) applyData(currentSave.value.data, currentSave.value.name)
else { savesOpen.value = true; enterStep() }

watch([player, cleared, notes, tab, mode, training, trainingTab], () => {
  if (!file.value.current) return
  commitFile(writeSlot(file.value, file.value.current, snapshot(), Date.now()))
}, { deep: true })
window.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); closeNode(); closeSaves() } })

export function useStore() {
  return { player, cleared, notes, active, flash, gate, level, xpInLevel, xpPct, xpPerLevel: XP_PER_LEVEL,
    clearedCount, title, statList, isDone, isLocked, arcOpen, arcProgress, tab, setTab, open, close, clear,
    run, runtime, test,
    saves, currentSave, savesOpen, openSaves, closeSaves, newSave, loadSave, deleteSave, renameSave, summary, exportSave, importSave,
    mode, setMode, training, trainingXp, trainingRank, trainingProgress, nodesCleared, nodeState,
    toolsCleared, kitXp, trainingTab, setTrainingTab, tierProgress,
    activeNode, stepIndex, activeStep, satisfied, openNode, closeNode, answer, next, back,
    stepCode, stepRun, runStepTests }
}
