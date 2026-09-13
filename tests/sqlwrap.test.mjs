import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wrapSql, bundleSql } from '../src/sqlwrap.js'

test('wrapSql wraps plain text as a raw triple-quoted Python string', () => {
  assert.equal(wrapSql('SELECT 1'), "__sql = r'''SELECT 1\n'''")
})

test('wrapSql survives a triple quote inside the text', () => {
  // Python concatenates adjacent literals: r'''SELECT ''' "'''" r'''x''' "'''" r'''\n''' == "SELECT '''x'''\n"
  assert.equal(wrapSql("SELECT '''x'''"), `__sql = r'''SELECT ''' "'''" r'''x''' "'''" r'''\n'''`)
})

test('wrapSql of empty text is an empty statement', () => {
  assert.equal(wrapSql(''), "__sql = r'''\n'''")
})

test('wrapSql of a statement ending in an apostrophe has no run of four or more consecutive apostrophes', () => {
  const wrapped = wrapSql("SELECT 1 WHERE 'a' = 'a'")
  assert.ok(!/''''+/.test(wrapped), `expected no run of 4+ apostrophes in: ${wrapped}`)
})

test('wrapSql of a statement ending in a backslash does not end the raw string in a backslash', () => {
  const wrapped = wrapSql('SELECT 1 -- trailing\\')
  assert.ok(wrapped.endsWith("\n'''"), `expected wrap to end with a newline before the closing quotes: ${wrapped}`)
})

test('bundleSql puts the fixture between the two harnesses', () => {
  const b = bundleSql('H', 'CREATE TABLE t (x);', 'S')
  assert.equal(b, "H\n__fixture = r'''CREATE TABLE t (x);'''\nS")
})

test('bundleSql refuses a fixture containing a triple quote', () => {
  assert.throws(() => bundleSql('H', "x '''", 'S'), /triple quote/)
})
