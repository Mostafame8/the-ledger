import { ref, computed, watch } from 'vue'
import { ARCS, GATES, XP_PER_LEVEL, titleFor } from './data/index.js'
import { runTests, runtime, warm } from './runner.js'
import { NODES, NODE_BY_ID, TIERS } from './data/training/index.js'
import { rankFor, rankProgress, isOpen } from './data/training/progress.js'

const KEY = 'ledger-save-v2'
const fresh = () => ({ name: 'Hunter', xp: 0, stats: { logic: 0, speed: 0, memory: 0 } })
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {} }

const saved = load()
const player = ref(saved.player || fresh())
const cleared = ref(saved.cleared || [])
const notes = ref(saved.notes || {})
const active = ref(null)
const flash = ref(null)   // text to show in the level-up overlay, or null

// ── Training room ────────────────────────────────────────────────────────────────
const freshTraining = () => ({ xp: 0, nodes: {}, active: null, code: {}, tab: null })
const mode = ref(saved.mode === 'training' ? 'training' : 'heist')
const training = ref({ ...freshTraining(), ...(saved.training || {}) })
const setMode = m => { mode.value = m === 'training' ? 'training' : 'heist' }

const trainingXp = computed(() => training.value.xp)
const trainingRank = computed(() => rankFor(training.value.xp, NODES))
const trainingProgress = computed(() => rankProgress(training.value.xp, NODES))
const nodesCleared = computed(() => NODES.filter(n => training.value.nodes[n.id]?.cleared).length)
const nodeState = id => training.value.nodes[id]?.cleared ? 'cleared' : NODE_BY_ID[id] && isOpen(NODE_BY_ID[id], training.value.nodes) ? 'open' : 'locked'

// Selected training tier tab. Defaults to the first populated tier holding an uncleared node.
const populatedTiers = TIERS.filter(t => NODES.some(n => n.tier === t))
const defaultTrainingTab = () => {
  const t = populatedTiers.find(t => NODES.some(n => n.tier === t && !training.value.nodes[n.id]?.cleared))
  return t ?? populatedTiers[populatedTiers.length - 1]
}
const trainingTab = ref(populatedTiers.includes(training.value.tab) ? training.value.tab : defaultTrainingTab())
const setTrainingTab = t => { trainingTab.value = t }
const tierProgress = tier => {
  const nodes = NODES.filter(n => n.tier === tier)
  return { done: nodes.filter(n => training.value.nodes[n.id]?.cleared).length, total: nodes.length }
}

const activeNode = computed(() => training.value.active ? NODE_BY_ID[training.value.active] ?? null : null)
const stepIndex = computed(() => {
  const n = activeNode.value
  if (!n) return 0
  return Math.min(training.value.nodes[n.id]?.step ?? 0, n.steps.length - 1)
})
const activeStep = computed(() => activeNode.value ? activeNode.value.steps[stepIndex.value] : null)
const satisfied = ref(false)       // current step answered correctly (or needs no answer)
const stepRun = ref(null)          // last test run for a code step, same shape as `run`

function enterStep() {
  if (training.value.active && !NODE_BY_ID[training.value.active]) training.value.active = null
  const st = activeStep.value
  const cleared = !!(activeNode.value && training.value.nodes[activeNode.value.id]?.cleared)
  satisfied.value = !st || st.type === 'explain' || cleared
  stepRun.value = null
}
function openNode(id) {
  if (!NODE_BY_ID[id] || nodeState(id) === 'locked') return
  const rec = (training.value.nodes[id] ||= { step: 0, cleared: false })
  if (rec.cleared) rec.step = 0            // review from the top
  training.value.active = id
  enterStep()
  if (NODE_BY_ID[id].steps.some(st => st.tests)) warm()
}
function closeNode() { training.value.active = null }
function answer(ok) { if (ok) satisfied.value = true }
function next() {
  const n = activeNode.value
  if (!n || !satisfied.value) return
  const rec = training.value.nodes[n.id]
  if (rec.step + 1 >= n.steps.length) { finishNode(n); return }
  rec.step += 1
  enterStep()
}
function back() {
  const n = activeNode.value
  const rec = n && training.value.nodes[n.id]
  if (!rec || rec.step === 0) return
  rec.step -= 1
  enterStep()
}
function finishNode(n) {
  const rec = training.value.nodes[n.id]
  if (!rec.cleared) {
    rec.cleared = true
    const before = trainingRank.value
    training.value.xp += n.xp
    showFlash(trainingRank.value !== before ? `Rank ${trainingRank.value}` : 'Lesson cleared')
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
const tab = ref(Number.isInteger(saved.tab) && saved.tab >= 0 && saved.tab < ARCS.length ? saved.tab : defaultTab())
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
function reset() {
  if (!confirm('Wipe the save and start the heist and the training over?')) return
  player.value = fresh(); cleared.value = []; notes.value = {}; active.value = null; tab.value = 0
  training.value = freshTraining(); mode.value = 'heist'
  trainingTab.value = defaultTrainingTab()
}

enterStep()   // resume: initialise `satisfied` for a persisted `training.active` on load

watch([player, cleared, notes, tab, mode, training, trainingTab], () => save({
  player: player.value, cleared: cleared.value, notes: notes.value, tab: tab.value,
  mode: mode.value, training: { ...training.value, tab: trainingTab.value },
}), { deep: true })
window.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); closeNode() } })

export function useStore() {
  return { player, cleared, notes, active, flash, gate, level, xpInLevel, xpPct, xpPerLevel: XP_PER_LEVEL,
    clearedCount, title, statList, isDone, isLocked, arcOpen, arcProgress, tab, setTab, open, close, clear, reset,
    run, runtime, test,
    mode, setMode, training, trainingXp, trainingRank, trainingProgress, nodesCleared, nodeState,
    trainingTab, setTrainingTab, tierProgress,
    activeNode, stepIndex, activeStep, satisfied, openNode, closeNode, answer, next, back,
    stepCode, stepRun, runStepTests }
}
