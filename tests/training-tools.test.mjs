import { test } from 'node:test'
import assert from 'node:assert/strict'
import { COURSES } from '../src/courses/index.js'

const EXPECTED_TOOLS = { algorithms: 12 }

test('each course has the expected tool count', () => {
  for (const c of COURSES) assert.equal(c.training.TOOLS.length, EXPECTED_TOOLS[c.id], `${c.id} tools`)
})

test('every tool id matches tool-<kebab> and does not collide with a lesson id', () => {
  const re = /^tool-[a-z0-9]+(-[a-z0-9]+)*$/
  for (const { training: { NODE_BY_ID, TOOLS } } of COURSES) {
    for (const t of TOOLS) {
      assert.match(t.id, re, `${t.id} should match ${re}`)
      assert.equal(NODE_BY_ID[t.id], undefined, `${t.id} must not collide with a lesson id`)
    }
  }
})

test('no lesson id starts with tool-', () => {
  for (const { training: { NODES } } of COURSES) {
    for (const n of NODES) assert.equal(n.id.startsWith('tool-'), false, `${n.id} looks like a tool id`)
  }
})

test('every lesson tools entry names a real tool', () => {
  for (const { training: { NODES, TOOL_BY_ID } } of COURSES) {
    for (const n of NODES) {
      assert.ok(Array.isArray(n.tools), `${n.id} must have a tools array`)
      for (const t of n.tools) assert.ok(TOOL_BY_ID[t], `${n.id} requires unknown tool ${t}`)
    }
  }
})

test('every tool is required by at least one lesson', () => {
  for (const { training: { NODES, TOOLS } } of COURSES) {
    const required = new Set(NODES.flatMap(n => n.tools || []))
    for (const t of TOOLS) assert.ok(required.has(t.id), `${t.id} is never required by any lesson`)
  }
})
