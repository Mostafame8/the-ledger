import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wrapSql, bundleSql } from '../src/sqlwrap.js'

test('wrapSql wraps plain text as a raw triple-quoted Python string', () => {
  assert.equal(wrapSql('SELECT 1'), "__sql = r'''SELECT 1'''")
})

test('wrapSql survives a triple quote inside the text', () => {
  // Python concatenates adjacent literals: r'''SELECT ''' "'''" r'''x''' "'''" r'''''' == "SELECT '''x'''"
  assert.equal(wrapSql("SELECT '''x'''"), `__sql = r'''SELECT ''' "'''" r'''x''' "'''" r''''''`)
})

test('wrapSql of empty text is an empty statement', () => {
  assert.equal(wrapSql(''), "__sql = r''''''")
})

test('bundleSql puts the fixture between the two harnesses', () => {
  const b = bundleSql('H', 'CREATE TABLE t (x);', 'S')
  assert.equal(b, "H\n__fixture = r'''CREATE TABLE t (x);'''\nS")
})

test('bundleSql refuses a fixture containing a triple quote', () => {
  assert.throws(() => bundleSql('H', "x '''", 'S'), /triple quote/)
})
