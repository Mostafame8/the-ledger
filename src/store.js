import { ref, computed, watch } from 'vue'
import { runTests, runtime, warm } from './runner.js'
import { COURSES, courseById, DEFAULT_COURSE } from './courses/index.js'
import { rankFor, rankProgress, isOpen } from './training/progress.js'

import { SAVES_KEY, LEGACY_KEY, migrateLegacy, upgradeFile, createSlot, selectSlot, deleteSlot, renameSlot, writeSlot, currentSlot, exportSlot, parseImport, importSlot } from './saves.js'

// ── Save files ───────────────────────────────────────────────────────────────────
// All slots live under SAVES_KEY. The pre-slot save under LEGACY_KEY migrates into slot 1 once.
const readJson = k => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
const loadFile = () => {
  const f = readJson(SAVES_KEY)
  const file = f && Array.isArray(f.slots) ? { current: f.current ?? null, slots: f.slots } : migrateLegacy(readJson(LEGACY_KEY), Date.now())
  return upgradeFile(file)
}
const persistFile = f => { try { localStorage.setItem(SAVES_KEY, JSON.stringify(f)) } catch {} }

const file = ref(loadFile())
persistFile(file.value)   // a fresh migration must land in storage even if nothing changes this visit
const currentSave = computed(() => currentSlot(file.value))
const saves = computed(() => [...file.value.slots].sort((a, b) => b.updated - a.updated))
const savesOpen = ref(false)   // the save-file screen; forced open while no slot is selected

// ── Courses ──────────────────────────────────────────────────────────────────────
// One slot holds a block per course. The live refs below hold the active course's block.
const courseId = ref(DEFAULT_COURSE)
const course = computed(() => courseById(courseId.value) ?? COURSES[0])
const T = computed(() => course.value.training)          // { NODES, NODE_BY_ID, TOOLS, TOOL_BY_ID, TIERS }
const zeroStats = keys => Object.fromEntries(keys.map(k => [k, 0]))
const coursesOpen = ref(false)             // the course screen, opened from the Status window
const courseChosen = ref(true)             // false on a fresh slot until the learner picks a job
const courseScreen = computed(() => coursesOpen.value || (!!currentSave.value && !courseChosen.value))
const openCourses = () => { coursesOpen.value = true }
const closeCourses = () => { if (courseChosen.value) coursesOpen.value = false }

const freshTraining = () => ({ xp: 0, nodes: {}, tools: {}, active: null, code: {}, tab: null })

const player = ref({ name: 'Hunter', xp: 0, stats: zeroStats(course.value.stats) })
const cleared = ref([])
const notes = ref({})
const active = ref(null)
const flash = ref(null)   // text to show in the level-up overlay, or null

// ── Training room ────────────────────────────────────────────────────────────────
const mode = ref('heist')
const training = ref(freshTraining())
const setMode = m => { mode.value = m === 'training' ? 'training' : 'heist' }

// Lessons and tools share one lookup and one progress-record accessor.
const itemById = id => T.value.NODE_BY_ID[id] ?? T.value.TOOL_BY_ID[id] ?? null
const progressMap = id => T.value.TOOL_BY_ID[id] ? training.value.tools : training.value.nodes

const trainingXp = computed(() => training.value.xp)
const trainingRank = computed(() => rankFor(training.value.xp, T.value.NODES))
const trainingProgress = computed(() => rankProgress(training.value.xp, T.value.NODES))
const nodesCleared = computed(() => T.value.NODES.filter(n => training.value.nodes[n.id]?.cleared).length)
const toolsCleared = computed(() => T.value.TOOLS.filter(t => training.value.tools[t.id]?.cleared).length)
const kitXp = computed(() => T.value.TOOLS.filter(t => training.value.tools[t.id]?.cleared).reduce((sum, t) => sum + t.xp, 0))
const nodeState = id => {
  const rec = progressMap(id)[id]
  if (rec?.cleared) return 'cleared'
  if (T.value.TOOL_BY_ID[id]) return 'open'
  const n = T.value.NODE_BY_ID[id]
  return n && isOpen(n, training.value.nodes, training.value.tools) ? 'open' : 'locked'
}

// Selected training tier tab. Defaults to the Armoury while no tool is cleared, else the
// first populated tier holding an uncleared node.
const populatedTiers = computed(() => T.value.TIERS.filter(t => T.value.NODES.some(n => n.tier === t)))
const defaultTrainingTab = () => {
  if (toolsCleared.value === 0) return 'kit'
  const tiers = populatedTiers.value
  const t = tiers.find(t => T.value.NODES.some(n => n.tier === t && !training.value.nodes[n.id]?.cleared))
  return t ?? tiers[tiers.length - 1]
}
const validTrainingTab = t => t === 'kit' || populatedTiers.value.includes(t)
const trainingTab = ref(defaultTrainingTab())
const setTrainingTab = t => { trainingTab.value = t }
const tierProgress = tier => {
  const nodes = T.value.NODES.filter(n => n.tier === tier)
  return { done: nodes.filter(n => training.value.nodes[n.id]?.cleared).length, total: nodes.length }
}

const activeNode = computed(() => training.value.active ? itemById(training.value.active) : null)
const stepIndex = computed(() => {
  const n = activeNode.value
  if (!n) return 0
  return Math.min(progressMap(n.id)[n.id]?.step ?? 0, n.steps.length - 1)
})
const activeStep = computed(() => activeNode.value ? activeNode.value.steps[stepIndex.value] : null)
const satisfied = ref(false)       // current step answered correctly (or needs no answer)
const stepRun = ref(null)          // last test run for a code step, same shape as `run`

function enterStep() {
  if (training.value.active && !itemById(training.value.active)) training.value.active = null
  const st = activeStep.value
  const cleared = !!(activeNode.value && progressMap(activeNode.value.id)[activeNode.value.id]?.cleared)
  satisfied.value = !st || st.type === 'explain' || cleared
  stepRun.value = null
}
function openNode(id) {
  if (!itemById(id) || nodeState(id) === 'locked') return
  const map = progressMap(id)
  const rec = (map[id] ||= { step: 0, cleared: false })
  if (rec.cleared) rec.step = 0            // review from the top
  training.value.active = id
  enterStep()
  if (itemById(id).steps.some(st => st.tests)) warm()
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
    if (T.value.TOOL_BY_ID[n.id]) {
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

const gate = computed(() => active.value === null ? null : course.value.gates[active.value])
const xpPerLevel = computed(() => course.value.xpPerLevel)
const level = computed(() => Math.floor(player.value.xp / xpPerLevel.value))
const xpInLevel = computed(() => player.value.xp % xpPerLevel.value)
const xpPct = computed(() => xpInLevel.value / xpPerLevel.value * 100)
const clearedCount = computed(() => cleared.value.length)
const title = computed(() => course.value.titleFor(clearedCount.value))
const statList = computed(() => course.value.stats
  .map(k => ({ key: k, label: k[0].toUpperCase() + k.slice(1), value: player.value.stats[k] ?? 0 })))

const isDone = id => cleared.value.includes(id)
const isLocked = g => { const gates = course.value.gates; const i = gates.indexOf(g); return i > 0 && !isDone(gates[i - 1].id) }
const arcOpen = arc => !isLocked(arc.gates[0])
const arcProgress = arc => arc.gates.filter(g => isDone(g.id)).length

// Selected arc tab. Defaults to the arc holding the next uncleared gate.
const defaultTab = () => { const arcs = course.value.arcs; const i = arcs.findIndex(a => a.gates.some(g => !isDone(g.id))); return i === -1 ? arcs.length - 1 : i }
const validTab = t => Number.isInteger(t) && t >= 0 && t < course.value.arcs.length
const tab = ref(defaultTab())
const setTab = i => { tab.value = i }
const open = g => { if (isLocked(g)) return; active.value = course.value.gates.indexOf(g); run.value = null; if (g.tests) warm() }
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
  player.value.stats[g.stat] = (player.value.stats[g.stat] ?? 0) + 1
  if (level.value > before) showFlash(`Level ${level.value}`)
}
// ── Save files: load a slot's course block into the live refs, write it back ─────
const block = () => ({
  xp: player.value.xp, stats: player.value.stats, cleared: cleared.value, notes: notes.value,
  tab: tab.value, mode: mode.value, training: { ...training.value, tab: trainingTab.value },
})
// The whole slot payload: name, active course, every course block with the live one refreshed.
const snapshot = data => ({
  player: { name: player.value.name },
  course: courseChosen.value ? courseId.value : null,
  courses: { ...(data?.courses || {}), [courseId.value]: block() },
})
// Fill every live ref from a slot's data (null = a fresh game named after the slot). Picks the
// slot's last course, or the default. The watcher then writes the normalised snapshot back,
// which also stamps "last played".
function applyData(data, name) {
  courseChosen.value = !!courseById(data?.course)
  courseId.value = courseChosen.value ? data.course : DEFAULT_COURSE
  applyBlock(data, name)
}
// Switch the live refs to another course's block. The watcher has already persisted the
// current block after every change, so nothing is flushed here.
function selectCourse(id) {
  if (!courseById(id) || !currentSave.value) return
  if (id !== courseId.value || !courseChosen.value) {
    courseId.value = id
    courseChosen.value = true
    applyBlock(currentSave.value.data, currentSave.value.name)
  }
  coursesOpen.value = false
}
function applyBlock(data, name) {
  const b = data?.courses?.[courseId.value] || {}
  player.value = { name: data?.player?.name ?? name ?? 'Hunter', xp: b.xp ?? 0, stats: { ...zeroStats(course.value.stats), ...(b.stats || {}) } }
  cleared.value = b.cleared || []
  notes.value = b.notes || {}
  active.value = null
  run.value = null
  mode.value = b.mode === 'training' ? 'training' : 'heist'
  training.value = { ...freshTraining(), ...(b.training || {}) }
  tab.value = validTab(b.tab) ? b.tab : defaultTab()
  trainingTab.value = validTrainingTab(training.value.tab) ? training.value.tab : defaultTrainingTab()
  enterStep()   // initialise `satisfied` for a persisted `training.active`
}
function commitFile(f) { file.value = f; persistFile(f) }

// One-line cards. `courseSummary` reads one course's block; `summary` reads the slot's last course.
function courseSummary(slot, id) {
  const c = courseById(id)
  const b = slot?.data?.courses?.[id]
  const N = c.training.NODES
  const lessons = N.filter(n => b?.training?.nodes?.[n.id]?.cleared).length
  const tools = Object.values(b?.training?.tools || {}).filter(t => t?.cleared).length
  const started = !!b && ((b.xp || 0) > 0 || (b.cleared || []).length > 0 || (b.training?.xp || 0) > 0 || lessons > 0 || tools > 0)
  return {
    id, title: c.title, algo: c.algo, started,
    level: Math.floor((b?.xp || 0) / c.xpPerLevel),
    gates: (b?.cleared || []).length, gatesTotal: c.gates.length,
    rank: rankFor(b?.training?.xp || 0, N),
    lessons, lessonsTotal: N.length,
  }
}
function summary(slot) {
  const id = courseById(slot.data?.course) ? slot.data.course : DEFAULT_COURSE
  return { ...courseSummary(slot, id), jobs: Object.keys(slot.data?.courses || {}).length }
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
  if (wasCurrent) { applyData(null, 'Hunter'); courseChosen.value = true; savesOpen.value = true }
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

watch([player, cleared, notes, tab, mode, training, trainingTab, courseId], () => {
  if (!file.value.current) return
  commitFile(writeSlot(file.value, file.value.current, snapshot(currentSave.value?.data), Date.now()))
}, { deep: true })
window.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); closeNode(); closeSaves(); closeCourses() } })

export function useStore() {
  return { player, cleared, notes, active, flash, gate, level, xpInLevel, xpPct, xpPerLevel,
    clearedCount, title, statList, isDone, isLocked, arcOpen, arcProgress, tab, setTab, open, close, clear,
    run, runtime, test,
    course, courseId, courses: COURSES, courseSummary, courseScreen, courseChosen, openCourses, closeCourses, selectCourse,
    saves, currentSave, savesOpen, openSaves, closeSaves, newSave, loadSave, deleteSave, renameSave, summary, exportSave, importSave,
    mode, setMode, training, trainingXp, trainingRank, trainingProgress, nodesCleared, nodeState,
    toolsCleared, kitXp, trainingTab, setTrainingTab, tierProgress,
    activeNode, stepIndex, activeStep, satisfied, openNode, closeNode, answer, next, back,
    stepCode, stepRun, runStepTests }
}
