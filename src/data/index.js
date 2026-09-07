import { ARCS_DATA } from './gates.js'

export const ARCS = ARCS_DATA
export const GATES = ARCS.flatMap(a => a.gates)
export const XP_PER_LEVEL = 200

export const TITLES = [
  [0, 'Nobody'], [8, 'Lookout'], [17, 'Picklock'], [25, 'Systems person'],
  [30, 'Ghost'], [36, 'Shadow'], [Infinity, 'Keeper of the Ledger'],
]
export function titleFor(cleared) {
  for (const [max, name] of TITLES) if (cleared < max) return name
  return TITLES.at(-1)[1]
}
