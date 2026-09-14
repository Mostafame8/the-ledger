import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('climb-the-chain', {
  tier: 'S', xp: 300, requires: ['name-the-result', 'table-meets-itself'], gates: ['reportsto', 'thebooks'],
  tools: ['tool-table'],
  title: 'Climb the chain', algo: 'Recursive CTEs',
  steps: [
    explain([
      'Ana Petrov signs for the loading bay at ten at night. “Who does she answer to,” the fence says, “and who do they answer to, all the way up.”',
      'Dax joins the staff table to itself, which gets him her manager. He joins it again for the manager\'s manager, and again, and stops when the statement will not fit on the screen — with no idea whether he reached the top.',
      '“One more join is one more step,” Marguerite says. “Write the step once and let it keep taking it until there is nowhere left to step.”',
    ], { move: 'brute force' }),
    explain([
      '“WITH RECURSIVE names a walk. The first SELECT is where you start; then UNION ALL; then a second SELECT that joins the table back onto the name you are defining.”',
      '“Each pass works on what the last pass produced. When a pass finds nothing, the walk stops on its own — the row at the top has no manager to step to, so that is where the climb ends.”',
    ], { move: 'pick the pattern', code:
`WITH RECURSIVE up(id, name, manager_id, step) AS (
  SELECT id, name, manager_id, 0 FROM staff WHERE id = 8
  UNION ALL
  SELECT s.id, s.name, s.manager_id, up.step + 1
  FROM staff s JOIN up ON s.id = up.manager_id
)
SELECT name, step FROM up;
-- ('Ruth Ash', 0) ('Otto Kline', 1) ('Tomas Reed', 2) ('Halden Voss', 3)` }),
    trace(
`WITH RECURSIVE up(id, name, manager_id, step) AS (
  SELECT id, name, manager_id, 0 FROM staff WHERE id = 8
  UNION ALL
  SELECT s.id, s.name, s.manager_id, up.step + 1
  FROM staff s JOIN up ON s.id = up.manager_id
)
SELECT name, step FROM up`,
      'the query above',
      [
        { line: 2, state: { start: 'Ruth Ash' }, ask: 'start', note: 'The first SELECT runs once and seeds the walk with a single row: staff id 8, at step 0.' },
        { line: 4, state: { start: 'Ruth Ash', after_two_passes: 3 }, ask: 'after_two_passes', note: 'Each pass steps from what the last pass produced: Ruth Ash to Otto Kline, then Otto Kline to Tomas Reed. Three rows collected so far.' },
        { line: 7, state: { start: 'Ruth Ash', after_two_passes: 3, returns: { py: "[('Ruth Ash', 0), ('Otto Kline', 1), ('Tomas Reed', 2), ('Halden Voss', 3)]" } }, ask: 'returns', note: 'The fourth row is the top of the firm. It carries no manager id, so the next pass finds nothing and the walk stops.' },
      ]),
    spot('Dax seeds the walk with every staff row instead of one, and joins on s.manager_id = up.manager_id by mistake. What is the danger?',
      ['Nothing; it just returns more rows',
       'A step that can reach a row it has already produced never runs out of work, and the walk goes round for ever',
       'SQLite refuses more than one seed row',
       'The walk stops immediately'],
      1, 'The walk ends when a pass produces nothing new. A step that loops back onto its own rows always produces something, so the statement never finishes. Step along the link that only ever goes one way — a child to its parent.'),
    blank('“Ana Petrov is staff id 12. Name everyone on the chain above her, herself included.”',
`WITH RECURSIVE up(id, name, manager_id) AS (
  SELECT id, name, manager_id FROM staff WHERE id = ___
  UNION ALL
  SELECT s.id, s.name, s.manager_id FROM staff s JOIN up ON ___ = up.manager_id
)
SELECT name FROM up`,
`check_cols("one column named name", ['name'])
check_query("Ana Petrov and everyone above her", "WITH RECURSIVE up(id, name, manager_id) AS (SELECT id, name, manager_id FROM staff WHERE id = 12 UNION ALL SELECT s.id, s.name, s.manager_id FROM staff s JOIN up ON s.id = up.manager_id) SELECT name FROM up", ordered=True)
check_query("a new head of the firm adds a step", "WITH RECURSIVE up(id, name, manager_id) AS (SELECT id, name, manager_id FROM staff WHERE id = 12 UNION ALL SELECT s.id, s.name, s.manager_id FROM staff s JOIN up ON s.id = up.manager_id) SELECT name FROM up", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', 'board', '2000-01-01', NULL); UPDATE staff SET manager_id = 99 WHERE id = 1;")
check("five names on the shipped dump", lambda: len(learner()), 5)
check("she is the first of them", lambda: learner()[0], ('Ana Petrov',))
check("the top of the firm is the last", lambda: learner()[-1], ('Halden Voss',))
check("no name twice", lambda: len(learner()) == len(set(learner())), True)`),
    mini('Ines Marr is staff id 2. Return everyone below her, however deep: two columns named name and depth, where her direct reports are depth 1 and their reports depth 2. Build the walk as down(id, name, depth) and leave Ines herself out. Ordered by depth then name. Order matters.',
      'Same shape as the climb with one link turned round: step from a row to the people whose manager id points at it. Seed at depth 0 and drop that row at the end.',
`check_cols("two columns, name then depth", ['name', 'depth'])
check_query("everyone under Ines Marr", "WITH RECURSIVE down(id, name, depth) AS (SELECT id, name, 0 FROM staff WHERE id = 2 UNION ALL SELECT s.id, s.name, down.depth + 1 FROM staff s JOIN down ON s.manager_id = down.id) SELECT name, depth FROM down WHERE depth > 0 ORDER BY depth, name", ordered=True)
check_query("a new hire three steps down", "WITH RECURSIVE down(id, name, depth) AS (SELECT id, name, 0 FROM staff WHERE id = 2 UNION ALL SELECT s.id, s.name, down.depth + 1 FROM staff s JOIN down ON s.manager_id = down.id) SELECT name, depth FROM down WHERE depth > 0 ORDER BY depth, name", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', 'vault', '2026-01-01', 9);")
check("five people under her", lambda: len(learner()), 5)
check("Lena Brack reports to her directly", lambda: ('Lena Brack', 1) in learner(), True)
check("Kit Ferro is two steps down", lambda: ('Kit Ferro', 2) in learner(), True)
check("Ines herself is not in the answer", lambda: all(n != 'Ines Marr' for n, _ in learner()), True)`),
  ],
})
