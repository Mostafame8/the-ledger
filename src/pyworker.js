// Web Worker that hosts Pyodide. Keeping Python off the main thread means an
// infinite loop in a learner's solution can be killed with worker.terminate().
import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs'

const INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
let py = null

const boot = loadPyodide({ indexURL: INDEX_URL })
  .then(p => { py = p; postMessage({ type: 'ready' }) })
  .catch(err => postMessage({ type: 'boot-error', error: String(err?.message || err) }))

self.onmessage = async e => {
  const { id, code, harness, tests } = e.data
  await boot
  if (!py) return
  const out = []
  py.setStdout({ batched: s => out.push(s) })
  py.setStderr({ batched: s => out.push(s) })
  const ns = py.globals.get('dict')()
  let results = [], error = null
  try {
    py.runPython(code, { globals: ns })
    py.runPython(harness, { globals: ns })
    py.runPython(tests, { globals: ns })
    results = JSON.parse(py.runPython('__import__("json").dumps(__results)', { globals: ns }))
  } catch (err) {
    error = String(err?.message || err)
  } finally {
    ns.destroy()
  }
  postMessage({ type: 'result', id, results, stdout: out.join('\n'), error })
}
