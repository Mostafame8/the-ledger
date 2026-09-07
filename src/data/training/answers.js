// Turns authored JS values into Python literal text and compares learner input to them.
export function pyLiteral(v) {
  if (v && typeof v === 'object' && !Array.isArray(v) && 'py' in v) return v.py
  if (v === null || v === undefined) return 'None'
  if (v === true) return 'True'
  if (v === false) return 'False'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  if (Array.isArray(v)) return `[${v.map(pyLiteral).join(', ')}]`
  return `{${Object.entries(v).map(([k, x]) => `${pyLiteral(k)}: ${pyLiteral(x)}`).join(', ')}}`
}

// Whitespace never matters; single and double quotes are interchangeable.
export function normalize(text) {
  return String(text).replace(/\s+/g, '').replace(/"/g, "'")
}

export function sameLiteral(typed, expected) {
  const t = normalize(typed)
  return t.length > 0 && t === normalize(pyLiteral(expected))
}
