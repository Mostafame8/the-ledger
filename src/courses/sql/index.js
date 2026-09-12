import { ARCS_DATA } from './gates.js'
import { TESTS } from './tests.js'

// Each gate carries its Python tests (a string run after the learner's query is wrapped as
// __sql, then harness.py + fixture + harness_sql.py; see src/sqlwrap.js).
export const ARCS = ARCS_DATA.map(a => ({ ...a, gates: a.gates.map(g => ({ ...g, tests: TESTS[g.id] })) }))
export const GATES = ARCS.flatMap(a => a.gates)
export const XP_PER_LEVEL = 200

// [upper bound (exclusive) on cleared gates, title]. 'Nobody' for zero clears, the middle
// titles split the course evenly, the last needs every gate cleared.
const MIDDLE = ['Runner', 'Teller', 'Auditor', 'Examiner', 'Forensic']
export const TITLES = [
  [1, 'Nobody'],
  ...MIDDLE.map((name, i) => [Math.round((i + 1) * GATES.length / MIDDLE.length), name]),
  [Infinity, 'Master of the Books'],
]
export function titleFor(cleared) {
  for (const [max, name] of TITLES) if (cleared < max) return name
  return TITLES.at(-1)[1]
}
