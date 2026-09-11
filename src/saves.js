// Save files. Pure functions over a plain "file" object; the store owns storage.
//   file = { current: <slot id | null>, slots: [ { id, name, created, updated, data } ] }
//   data = null for a fresh slot, or version 2:
//     { player: { name }, course: <course id | null>, courses: { <course id>: block } }
//     block = { xp, stats, cleared, notes, tab, mode, training }
//   Version 1 data (everything at the top level, xp and stats inside player) is upgraded on read.
// Every function returns a new file and leaves its input untouched.

export const SAVES_KEY = 'ledger-saves-v1'
export const LEGACY_KEY = 'ledger-save-v2'
export const DEFAULT_NAME = 'Hunter'
const MAX_NAME = 24

// This module stays free of src/courses so it is pure and cheap to test.
export const DEFAULT_COURSE = 'algorithms'
const V1_STATS = { logic: 0, speed: 0, memory: 0 }

// Pure. null stays null; version 2 is returned as is (unknown course blocks kept); version 1 is wrapped.
export function upgradeData(data) {
  if (data === null || data === undefined) return null
  if (data.courses && typeof data.courses === 'object') return data
  if (!data.player || typeof data.player !== 'object') return data   // not ours; validData rejects it
  const p = data.player
  const block = {
    xp: p.xp ?? 0,
    stats: p.stats ?? { ...V1_STATS },
    cleared: data.cleared ?? [],
    notes: data.notes ?? {},
    tab: data.tab ?? null,
    mode: data.mode === 'training' ? 'training' : 'heist',
    training: data.training ?? null,
  }
  return { player: { name: p.name }, course: DEFAULT_COURSE, courses: { [DEFAULT_COURSE]: block } }
}

export const upgradeFile = file => ({ ...file, slots: file.slots.map(s => ({ ...s, data: upgradeData(s.data) })) })

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

// ── Export / import: move a slot between browsers as a small JSON document ───────
const FORMAT = 'ledger-save'
export const VERSION = 2

export const exportSlot = slot => JSON.stringify({ format: FORMAT, version: VERSION, slot }, null, 2)

// A slot is either fresh (data null) or carries a player record. Anything else is not ours.
const validData = d => d === null || (d && typeof d === 'object' && d.player && typeof d.player === 'object')

// Returns { ok: true, slot } with a fresh id (so it never collides with a local slot), or { ok: false, error }.
export function parseImport(text, now) {
  let doc
  try { doc = JSON.parse(text) } catch { return { ok: false, error: 'That is not a Ledger save file (unreadable JSON).' } }
  if (!doc || doc.format !== FORMAT || !doc.slot || typeof doc.slot !== 'object') {
    return { ok: false, error: 'That is not a Ledger save file.' }
  }
  const s = doc.slot
  const data = upgradeData(s.data === undefined ? null : s.data)
  if (!validData(data)) return { ok: false, error: 'That save file has no player in it.' }
  const created = Number.isFinite(s.created) ? s.created : now
  const updated = Number.isFinite(s.updated) ? s.updated : created
  return { ok: true, slot: { id: newId(now), name: cleanName(s.name ?? data?.player?.name), created, updated, data } }
}

export function importSlot(file, slot) {
  return { current: slot.id, slots: [...file.slots, slot] }
}
