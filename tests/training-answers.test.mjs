import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pyLiteral, normalize, sameLiteral } from '../src/data/training/answers.js'

test('pyLiteral renders JS values as Python source', () => {
  assert.equal(pyLiteral(3), '3')
  assert.equal(pyLiteral(-2.5), '-2.5')
  assert.equal(pyLiteral(true), 'True')
  assert.equal(pyLiteral(false), 'False')
  assert.equal(pyLiteral(null), 'None')
  assert.equal(pyLiteral('ab'), "'ab'")
  assert.equal(pyLiteral([1, 2, 'x']), "[1, 2, 'x']")
  assert.equal(pyLiteral({ a: 1, b: [2] }), "{'a': 1, 'b': [2]}")
  assert.equal(pyLiteral({ py: '(1, 3)' }), '(1, 3)')
})

test('normalize ignores whitespace and quote style', () => {
  assert.equal(normalize(' [1,  2 ] '), '[1,2]')
  assert.equal(normalize('"ab"'), "'ab'")
  assert.equal(normalize('( 1 , 3 )'), '(1,3)')
})

test('sameLiteral compares typed text to an authored value', () => {
  assert.equal(sameLiteral('4', 4), true)
  assert.equal(sameLiteral(' 4 ', 4), true)
  assert.equal(sameLiteral('5', 4), false)
  assert.equal(sameLiteral('true', true), false)   // Python spelling required
  assert.equal(sameLiteral('True', true), true)
  assert.equal(sameLiteral('[1,2]', [1, 2]), true)
  assert.equal(sameLiteral('"hi"', 'hi'), true)
  assert.equal(sameLiteral('(1,3)', { py: '(1, 3)' }), true)
  assert.equal(sameLiteral('', 0), false)
})
