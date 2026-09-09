// Save files. Pure functions over a plain "file" object; the store owns storage.
//   file = { current: <slot id | null>, slots: [ { id, name, created, updated, data } ] }
//   data = the game payload ({ player, cleared, notes, tab, mode, training }) or null for a fresh slot.
// Every function returns a new file and leaves its input untouched.

export const SAVES_KEY = 'ledger-saves-v1'
export const LEGACY_KEY = 'ledger-save-v2'
export const DEFAULT_NAME = 'Hunter'
const MAX_NAME = 24

export const emptyFile = () => ({ current: null, slots: [] })

export const cleanName = raw => {
  const s = String(raw ?? '').trim().slice(0, MAX_NAME)
  return s || DEFAULT_NAME
}

const newId = now => `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const slot = (name, data, now) => ({ id: newId(now), name: cleanName(name), created: now, updated: now, data })

const mapSlot = (file, id, fn) => ({ ...file, slots: file.slots.map(s => s.id === id ? fn(s) : s) })

// The pre-slot save was one object under LEGACY_KEY. It becomes slot 1, selected.
export function migrateLegacy(legacy, now) {
  if (!legacy || typeof legacy !== 'object' || Object.keys(legacy).length === 0) return emptyFile()
  const s = slot(legacy.player?.name, legacy, now)
  return { current: s.id, slots: [s] }
}

export function createSlot(file, name, now) {
  const s = slot(name, null, now)
  return { id: s.id, file: { current: s.id, slots: [...file.slots, s] } }
}

export function selectSlot(file, id) {
  return file.slots.some(s => s.id === id) ? { ...file, current: id } : { ...file }
}

export function deleteSlot(file, id) {
  const slots = file.slots.filter(s => s.id !== id)
  return { current: file.current === id ? null : file.current, slots }
}

export function renameSlot(file, id, name) {
  const clean = cleanName(name)
  return mapSlot(file, id, s => ({
    ...s, name: clean,
    data: s.data ? { ...s.data, player: { ...(s.data.player || {}), name: clean } } : s.data,
  }))
}

export function writeSlot(file, id, data, now) {
  return mapSlot(file, id, s => ({ ...s, data, updated: now }))
}

export const currentSlot = file => file.slots.find(s => s.id === file.current) ?? null
