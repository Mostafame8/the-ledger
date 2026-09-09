import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyFile, migrateLegacy, createSlot, selectSlot, deleteSlot, renameSlot, writeSlot, currentSlot, cleanName } from '../src/saves.js'

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
  assert.equal(doc.version, 1)
  assert.deepEqual(doc.slot, f.slots[0])
})

test('parseImport: round-trips an export into a slot with a fresh id, same name and data', () => {
  const f = migrateLegacy(legacy, T0)
  const r = parseImport(exportSlot(f.slots[0]), T1)
  assert.equal(r.ok, true)
  assert.notEqual(r.slot.id, f.slots[0].id)
  assert.equal(r.slot.name, 'Hunter')
  assert.deepEqual(r.slot.data, legacy)
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
