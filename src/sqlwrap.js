// Pure helpers for the SQL runner. The learner's statement travels to the Python worker as a raw
// string; the SQL harness reads it back as __sql. Shared by runner.js and scripts/test-solutions.mjs.

// A ''' inside the text would end the raw string early: close, splice a plain "'''", reopen. A
// trailing ' or \ would run into the closing delimiter, so the statement always ends with a
// newline — SQLite ignores it.
export function wrapSql(text) {
  return `__sql = r'''${String(text).split("'''").join(`''' "'''" r'''`)}\n'''`
}

// harness.py, then the fixture as __fixture, then harness_sql.py, all in one namespace.
export function bundleSql(harness, fixture, harnessSql) {
  if (fixture.includes("'''")) throw new Error('fixture.sql may not contain a triple quote')
  return `${harness}\n__fixture = r'''${fixture}'''\n${harnessSql}`
}
