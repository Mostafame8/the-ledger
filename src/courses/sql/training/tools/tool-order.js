import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-order', {
  xp: 30, title: 'In this order', algo: 'ORDER BY',
  steps: [
    explain([
      'Dax sorts the staff sheet by hire date, scrolls to what he thinks is the newest, and screenshots the oldest.',
      '“A table has no order,” Marguerite says. “If you do not say ORDER BY, whatever came back came back by accident, and it can come back differently tomorrow.”',
      '“Name the column, then say DESC if you want the top of the pile first. LIMIT takes from whatever order you asked for, so ask first.”',
    ], { code:
`SELECT name, hired FROM staff ORDER BY hired DESC LIMIT 3;
-- ('Ana Petrov', '2023-08-08')
-- ('Bo Lund', '2022-04-04')
-- ('Mira Sol', '2021-01-15')` }),
    explain([
      '“Two keys, comma between: ORDER BY dept, name sorts by department and settles the ties by name. Without the second key the ties fall however they fall.”',
      '“OFFSET skips from the front before LIMIT counts, so LIMIT 3 OFFSET 2 is rows three, four and five.”',
      '“Dates here are text, year first, so text order is date order. That is why the dump was written that way.”',
    ]),
    trace(
`SELECT name, hired
FROM staff
ORDER BY hired DESC
LIMIT 3`,
      'the query above',
      [
        { line: 2, state: { rows: 12 }, ask: 'rows', note: 'Twelve staff rows on the bench, in whatever order the table holds them.' },
        { line: 3, state: { rows: 12, top: { py: "('Ana Petrov', '2023-08-08')" } }, ask: 'top', note: 'DESC on hired puts the newest hire first. Nothing is dropped yet: all twelve are still there, sorted.' },
        { line: 4, state: { rows: 12, top: { py: "('Ana Petrov', '2023-08-08')" }, returns: { py: "[('Ana Petrov', '2023-08-08'), ('Bo Lund', '2022-04-04'), ('Mira Sol', '2021-01-15')]" } }, ask: 'returns', note: 'LIMIT takes three off the top of the order you just asked for.' },
      ]),
    blank('“Skip the two oldest cameras, then take the next three: zone and installed, oldest first.”',
`SELECT zone, installed FROM cameras ORDER BY ___ LIMIT ___ OFFSET ___`,
`check_cols("two columns, zone then installed", ['zone', 'installed'])
check_query("cameras three, four and five by age", "SELECT zone, installed FROM cameras ORDER BY installed LIMIT 3 OFFSET 2", ordered=True)
check("three rows", lambda: len(learner()), 3)
check("the tellers camera comes first", lambda: learner()[0][0], 'tellers')
check("oldest first", lambda: [i for _, i in learner()] == sorted(i for _, i in learner()), True)
check("the two oldest were skipped", lambda: all(i > '2018-01-10' for _, i in learner()), True)`),
  ],
})
