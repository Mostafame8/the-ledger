// Keyboard behaviour that makes a plain <textarea> tolerable for Python.
// Tab indents (a block if several lines are selected), Shift+Tab dedents,
// Enter keeps the current indent and adds one level after a trailing colon,
// Backspace inside leading whitespace eats a whole indent level.
const TAB = '    '

export function editorKeydown(e) {
  const ta = e.target
  const v = ta.value, a = ta.selectionStart, b = ta.selectionEnd
  const lineStart = v.lastIndexOf('\n', a - 1) + 1

  // Write the new text back through the DOM so v-model picks it up, then restore the caret.
  const set = (text, start, end = start) => {
    ta.value = text
    ta.setSelectionRange(start, end)
    ta.dispatchEvent(new Event('input', { bubbles: true }))
  }

  if (e.key === 'Tab') {
    e.preventDefault()
    const multiLine = a !== b && v.slice(a, b).includes('\n')
    if (e.shiftKey || multiLine) {
      const selEnd = b > a && v[b - 1] === '\n' ? b - 1 : b
      const nl = v.indexOf('\n', selEnd)
      const blockEnd = nl === -1 ? v.length : nl
      const lines = v.slice(lineStart, blockEnd).split('\n')
      const out = lines.map(l => e.shiftKey ? l.replace(/^ {1,4}/, '') : TAB + l).join('\n')
      set(v.slice(0, lineStart) + out + v.slice(blockEnd), lineStart, lineStart + out.length)
    } else {
      set(v.slice(0, a) + TAB + v.slice(b), a + TAB.length)
    }
    return
  }

  if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
    e.preventDefault()
    const line = v.slice(lineStart, a)
    let indent = line.match(/^[ \t]*/)[0]
    if (line.trimEnd().endsWith(':')) indent += TAB
    set(v.slice(0, a) + '\n' + indent + v.slice(b), a + 1 + indent.length)
    return
  }

  if (e.key === 'Backspace' && a === b && a > lineStart) {
    const before = v.slice(lineStart, a)
    if (/^ +$/.test(before)) {
      e.preventDefault()
      const n = before.length % TAB.length || TAB.length
      set(v.slice(0, a - n) + v.slice(a), a - n)
    }
  }
}
