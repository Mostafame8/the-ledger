import { ARCS_DATA } from './gates.js'

export const ARCS = ARCS_DATA
export const GATES = ARCS.flatMap(a => a.gates)
export const XP_PER_LEVEL = 200

// [upper bound (exclusive) on cleared gates, title]. 'Nobody' is for zero clears,
// the middle titles split the course evenly, and the last needs every gate cleared.
const MIDDLE = ['Lookout', 'Picklock', 'Systems person', 'Ghost', 'Shadow']
export const TITLES = [
  [1, 'Nobody'],
  ...MIDDLE.map((name, i) => [Math.round((i + 1) * GATES.length / MIDDLE.length), name]),
  [Infinity, 'Keeper of the Ledger'],
]
export function titleFor(cleared) {
  for (const [max, name] of TITLES) if (cleared < max) return name
  return TITLES.at(-1)[1]
}
