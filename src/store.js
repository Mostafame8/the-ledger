import { ref, computed, watch } from 'vue'
import { ARCS, GATES, XP_PER_LEVEL, titleFor } from './data/index.js'
import { runTests, runtime, warm } from './runner.js'

const KEY = 'ledger-save-v2'
const fresh = () => ({ name: 'Hunter', xp: 0, stats: { logic: 0, speed: 0, memory: 0 } })
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {} }

const saved = load()
const player = ref(saved.player || fresh())
const cleared = ref(saved.cleared || [])
const notes = ref(saved.notes || {})
const active = ref(null)
const flash = ref(false)

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
  if (level.value > before) { flash.value = true; setTimeout(() => { flash.value = false }, 1900) }
}
function reset() {
  if (!confirm('Wipe the save and start the heist over?')) return
  player.value = fresh(); cleared.value = []; notes.value = {}; active.value = null; tab.value = 0
}

watch([player, cleared, notes, tab], () => save({ player: player.value, cleared: cleared.value, notes: notes.value, tab: tab.value }), { deep: true })
window.addEventListener('keydown', e => { if (e.key === 'Escape') close() })

export function useStore() {
  return { player, cleared, notes, active, flash, gate, level, xpInLevel, xpPct, xpPerLevel: XP_PER_LEVEL,
    clearedCount, title, statList, isDone, isLocked, arcOpen, arcProgress, tab, setTab, open, close, clear, reset,
    run, runtime, test }
}
