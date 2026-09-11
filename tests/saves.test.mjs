import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyFile, migrateLegacy, createSlot, selectSlot, deleteSlot, renameSlot, writeSlot, currentSlot, cleanName, upgradeData, upgradeFile } from '../src/saves.js'

const T0 = 1_000, T1 = 2_000
const legacy = { player: { name: 'Hunter', xp: 120, stats: { logic: 1, speed: 2, memory: 0 } }, cleared: ['a', 'b'], notes: {}, tab: 0 }

test('emptyFile: no slots, nothing selected', () => {
  assert.deepEqual(emptyFile(), { current: null, slots: [] })
})

test('cleanName: trims, caps length, falls back to Hunter', () => {
  assert.equal(cleanName('  Mostafa  '), 'Mostafa')
  assert.equal(cleanName(''), 'Hunter')
  assert.equal(cleanName(null), 'Hunter')
  assert.equal(cleanName('x'.repeat(50)).length, 24)
})

test('migrateLegacy: old single save becomes slot 1, selected, named after its player', () => {
  const f = migrateLegacy(legacy, T0)
  assert.equal(f.slots.length, 1)
  const s = f.slots[0]
  assert.equal(f.current, s.id)
  assert.equal(s.name, 'Hunter')
  assert.equal(s.created, T0)
  assert.equal(s.updated, T0)
  assert.deepEqual(s.data, legacy)
})

test('migrateLegacy: nothing to migrate gives an empty file', () => {
  assert.deepEqual(migrateLegacy(null, T0), emptyFile())
  assert.deepEqual(migrateLegacy({}, T0), emptyFile())
})

test('createSlot: adds a named empty slot, selects it, does not touch others', () => {
  const f0 = migrateLegacy(legacy, T0)
  const { file: f1, id } = createSlot(f0, ' Mostafa ', T1)
  assert.equal(f1.slots.length, 2)
  assert.equal(f1.current, id)
  assert.notEqual(id, f0.slots[0].id)
  const s = f1.slots.find(s => s.id === id)
  assert.equal(s.name, 'Mostafa')
  assert.equal(s.created, T1)
  assert.equal(s.data, null)                 // fresh slot: store builds a fresh game
  assert.deepEqual(f0.slots[0], f1.slots[0])  // immutability of the other slot
  assert.equal(f0.slots.length, 1)             // input untouched
})

test('selectSlot: switches current only to an existing id', () => {
  const f0 = migrateLegacy(legacy, T0)
  const { file: f1, id } = createSlot(f0, 'B', T1)
  const first = f0.slots[0].id
  assert.equal(selectSlot(f1, first).current, first)
  assert.equal(selectSlot(f1, 'nope').current, id)
})

test('deleteSlot: removes the slot; deleting the current one leaves nothing selected', () => {
  const f0 = migrateLegacy(legacy, T0)
  const { file: f1, id } = createSlot(f0, 'B', T1)
  const first = f0.slots[0].id
  const f2 = deleteSlot(f1, first)
  assert.deepEqual(f2.slots.map(s => s.id), [id])
  assert.equal(f2.current, id)
  const f3 = deleteSlot(f2, id)
  assert.deepEqual(f3, emptyFile())
  assert.equal(f1.slots.length, 2)   // input untouched
})

test('renameSlot: renames the slot and the player inside its data', () => {
  const f0 = migrateLegacy(legacy, T0)
  const id = f0.slots[0].id
  const f1 = renameSlot(f0, id, ' Dax ')
  assert.equal(f1.slots[0].name, 'Dax')
  assert.equal(f1.slots[0].data.player.name, 'Dax')
  assert.equal(f0.slots[0].name, 'Hunter')   // input untouched
})

test('writeSlot: stores data and bumps updated', () => {
  const f0 = migrateLegacy(legacy, T0)
  const id = f0.slots[0].id
  const data = { ...legacy, cleared: ['a', 'b', 'c'] }
  const f1 = writeSlot(f0, id, data, T1)
  assert.deepEqual(f1.slots[0].data, data)
  assert.equal(f1.slots[0].updated, T1)
  assert.equal(f0.slots[0].updated, T0)
})

test('currentSlot: the selected slot or null', () => {
  assert.equal(currentSlot(emptyFile()), null)
  const f = migrateLegacy(legacy, T0)
  assert.equal(currentSlot(f).id, f.current)
  assert.equal(currentSlot({ current: 'gone', slots: f.slots }), null)
})

// ── Export / import ──────────────────────────────────────────────────────────────
import { exportSlot, parseImport, importSlot } from '../src/saves.js'

test('exportSlot: a labelled JSON document carrying the whole slot', () => {
  const f = migrateLegacy(legacy, T0)
  const doc = JSON.parse(exportSlot(f.slots[0]))
  assert.equal(doc.format, 'ledger-save')
  assert.equal(doc.version, 2)
  assert.deepEqual(doc.slot, f.slots[0])
})

test('parseImport: round-trips an export into a slot with a fresh id, same name and data', () => {
  const f = migrateLegacy(legacy, T0)
  const r = parseImport(exportSlot(f.slots[0]), T1)
  assert.equal(r.ok, true)
  assert.notEqual(r.slot.id, f.slots[0].id)
  assert.equal(r.slot.name, 'Hunter')
  assert.deepEqual(r.slot.data, upgradeData(legacy))   // v1 data inside the file is upgraded on import
  assert.equal(r.slot.updated, T0)        // "last played" travels with the file
})

test('parseImport: rejects bad JSON, the wrong format, and a slot without a player', () => {
  assert.equal(parseImport('not json', T1).ok, false)
  assert.equal(parseImport('{"hello":1}', T1).ok, false)
  assert.equal(parseImport(JSON.stringify({ format: 'ledger-save', version: 1, slot: { name: 'x', data: {} } }), T1).ok, false)
  assert.match(parseImport('not json', T1).error, /save file/i)
})

test('parseImport: a fresh (never played) slot exports and imports too', () => {
  const { file: f, id } = createSlot(emptyFile(), 'New', T0)
  const r = parseImport(exportSlot(f.slots.find(s => s.id === id)), T1)
  assert.equal(r.ok, true)
  assert.equal(r.slot.data, null)
})

test('importSlot: appends the slot and selects it, never replacing an existing one', () => {
  const f0 = migrateLegacy(legacy, T0)
  const r = parseImport(exportSlot(f0.slots[0]), T1)
  const f1 = importSlot(f0, r.slot)
  assert.equal(f1.slots.length, 2)
  assert.equal(f1.current, r.slot.id)
  assert.deepEqual(f1.slots[0], f0.slots[0])
  assert.equal(f0.slots.length, 1)
})

// ── Version 2 slot data: one block per course ────────────────────────────────────
const v1 = { player: { name: 'Hunter', xp: 120, stats: { logic: 1, speed: 2, memory: 0 } }, cleared: ['a', 'b'], notes: { a: 'x' }, tab: 1, mode: 'training', training: { xp: 40, nodes: { loops: { step: 0, cleared: true } }, tools: {}, active: null, code: {}, tab: 'F' } }

test('upgradeData: null stays null', () => {
  assert.equal(upgradeData(null), null)
  assert.equal(upgradeData(undefined), null)
})

test('upgradeData: v1 data moves under courses.algorithms, name stays on player', () => {
  const d = upgradeData(v1)
  assert.deepEqual(d.player, { name: 'Hunter' })
  assert.equal(d.course, 'algorithms')
  assert.deepEqual(Object.keys(d.courses), ['algorithms'])
  assert.deepEqual(d.courses.algorithms, {
    xp: 120, stats: { logic: 1, speed: 2, memory: 0 }, cleared: ['a', 'b'], notes: { a: 'x' },
    tab: 1, mode: 'training', training: v1.training,
  })
})

test('upgradeData: v1 data with missing fields gets defaults', () => {
  const d = upgradeData({ player: { name: 'Zed' } })
  assert.deepEqual(d.courses.algorithms, { xp: 0, stats: { logic: 0, speed: 0, memory: 0 }, cleared: [], notes: {}, tab: null, mode: 'heist', training: null })
})

test('upgradeData: v2 data is returned unchanged, unknown course blocks kept', () => {
  const d2 = { player: { name: 'Hunter' }, course: 'sql', courses: { algorithms: { xp: 1 }, sql: { xp: 9 } } }
  assert.equal(upgradeData(d2), d2)
})

test('upgradeFile: every slot upgraded, ids and selection untouched', () => {
  const f0 = migrateLegacy(v1, T0)
  const f1 = upgradeFile(f0)
  assert.equal(f1.current, f0.current)
  assert.equal(f1.slots[0].id, f0.slots[0].id)
  assert.equal(f1.slots[0].data.course, 'algorithms')
  const { file: f2 } = createSlot(f1, 'Fresh', T1)
  assert.equal(upgradeFile(f2).slots[1].data, null)
})

test('parseImport: a version 1 export comes back upgraded', () => {
  const text = JSON.stringify({ format: 'ledger-save', version: 1, slot: { name: 'Old', created: 5, updated: 6, data: v1 } })
  const r = parseImport(text, T1)
  assert.equal(r.ok, true)
  assert.equal(r.slot.data.course, 'algorithms')
  assert.equal(r.slot.data.courses.algorithms.xp, 120)
})

test('exportSlot: writes version 2', () => {
  const s = migrateLegacy(v1, T0).slots[0]
  assert.equal(JSON.parse(exportSlot(s)).version, 2)
})
