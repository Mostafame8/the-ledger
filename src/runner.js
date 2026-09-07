// Runs a learner's Python against a gate's tests inside the Pyodide worker.
import { ref } from 'vue'
import harness from './harness.py?raw'

export const TIMEOUT_MS = 20_000
// cold: no worker yet · loading: Pyodide downloading · ready · running · failed: could not load
export const runtime = ref('cold')

let worker = null, ready = null, seq = 0
const pending = new Map()

function spawn() {
  worker = new Worker(new URL('./pyworker.js', import.meta.url), { type: 'module' })
  runtime.value = 'loading'
  ready = new Promise((resolve, reject) => {
    worker.onmessage = e => {
      const m = e.data
      if (m.type === 'ready') { runtime.value = 'ready'; resolve(); return }
      if (m.type === 'boot-error') { fail(m.error); reject(new Error(m.error)); return }
      const p = pending.get(m.id)
      if (!p) return
      pending.delete(m.id); clearTimeout(p.timer)
      if (!pending.size) runtime.value = 'ready'
      p.resolve({ results: m.results, stdout: m.stdout, error: tidy(m.error), timedOut: false })
    }
    worker.onerror = e => { const msg = e.message || 'The Python runtime failed to load.'; fail(msg); reject(new Error(msg)) }
  })
  ready.catch(() => {})
}

function fail(message) {
  for (const [, p] of pending) { clearTimeout(p.timer); p.resolve({ results: [], stdout: '', error: message, timedOut: false }) }
  pending.clear()
  worker?.terminate(); worker = null; ready = null
  runtime.value = 'failed'
}

// Pyodide tracebacks start inside its own bootstrap files; keep only the learner's frames.
function tidy(msg) {
  if (!msg) return null
  const lines = msg.trimEnd().split('\n')
  const i = lines.findIndex(l => l.includes('File "<exec>"'))
  return (i === -1 ? lines : ['Traceback (most recent call last):', ...lines.slice(i)]).join('\n')
}

// Start downloading Pyodide early, e.g. when a quest window opens.
export function warm() { if (!worker) spawn() }

export async function runTests(code, tests, timeoutMs = TIMEOUT_MS) {
  if (!worker) spawn()
  try { await ready } catch (err) { return { results: [], stdout: '', error: String(err.message), timedOut: false } }
  const id = ++seq
  runtime.value = 'running'
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      pending.delete(id)
      resolve({ results: [], stdout: '', error: `Stopped after ${timeoutMs / 1000} s with no answer. An infinite loop, or something far too slow.`, timedOut: true })
      fail('The Python runtime was restarted after a timeout.')
      runtime.value = 'cold'
    }, timeoutMs)
    pending.set(id, { resolve, timer })
    worker.postMessage({ id, code, harness, tests })
  })
}
