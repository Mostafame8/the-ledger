import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('table-meets-itself', {
  tier: 'E', xp: 80, requires: ['keep-the-empty'], gates: ['chainofcommand', 'threeway'],
  tools: ['tool-table'],
  title: 'The table meets itself', algo: 'Self join',
  steps: [
    explain([
      'The staff table points at itself: every row carries the id of the person above it, and one row points at nobody at all.',
      'Dax draws the tree on a napkin, crosses two branches, and announces that the head of security reports to a teller.',
      '“It is one table doing two jobs,” Marguerite says. “Take two copies, call one of them the manager, and wire the second onto the first by the id it already carries.”',
    ], { move: 'brute force' }),
    explain([
      '“A table can be joined to itself as long as the two copies have different names. s is the person, m is their manager, and the ON says m.id = s.manager_id.”',
      '“Every column then has to say which copy it came from, because both copies have a name column. That is the whole trick: the aliases do the thinking.”',
    ], { move: 'pick the pattern', code:
`SELECT s.name, m.name AS boss
FROM staff s
JOIN staff m ON m.id = s.manager_id
WHERE s.id = 12;
-- ('Ana Petrov', 'Ruth Ash')` }),
    trace(
`SELECT s.name, m.name AS boss
FROM staff s
JOIN staff m ON m.id = s.manager_id
WHERE s.dept = 'security'`,
      'the query above',
      [
        { line: 2, state: { rows: 12 }, ask: 'rows', note: 'Twelve staff rows on the bench as the left-hand copy.' },
        { line: 3, state: { rows: 12, paired: 11 }, ask: 'paired', note: 'Eleven find a manager. The one at the top carries no manager id, so this join leaves them out.' },
        { line: 4, state: { rows: 12, paired: 11, returns: { py: "[('Tomas Reed', 'Halden Voss'), ('Otto Kline', 'Tomas Reed'), ('Ruth Ash', 'Otto Kline'), ('Ana Petrov', 'Ruth Ash')]" } }, ask: 'returns', note: 'Four security staff, each beside the person above them, and the chain reads straight down the column.' },
      ]),
    spot('Dax writes SELECT name, name FROM staff JOIN staff ON id = manager_id. What goes wrong first?',
      ['Nothing; SQLite works out which copy is which',
       'Every column name is ambiguous — with no aliases, name and id could come from either copy',
       'A table cannot be joined to itself',
       'It returns twelve rows of the same name twice'],
      1, 'Both copies bring the same column names, so the query cannot say which one it means. Give the copies aliases and every reference becomes unambiguous.'),
    blank('“Everyone whose manager works in the vault: the person, and the manager.”',
`SELECT s.name, m.name AS boss FROM staff s JOIN staff ___ ON ___ = s.manager_id WHERE m.dept = 'vault'`,
`check_cols("two columns, name then boss", ['name', 'boss'])
check_query("the people who answer to the vault", "SELECT s.name, m.name AS boss FROM staff s JOIN staff m ON m.id = s.manager_id WHERE m.dept = 'vault'")
check_query("a new hire under Ines Marr", "SELECT s.name, m.name AS boss FROM staff s JOIN staff m ON m.id = s.manager_id WHERE m.dept = 'vault'",
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', 'tellers', '2026-01-01', 2);")
check("three pairs on the shipped dump", lambda: len(learner()), 3)
check("Kit Ferro answers to Priya Nand", lambda: ('Kit Ferro', 'Priya Nand') in learner(), True)
check("every manager named here works in the vault", lambda: all(b in [r[0] for r in rows("SELECT name FROM staff WHERE dept = 'vault'")] for _, b in learner()), True)
check("the man at the top is not on the left", lambda: all(n != 'Halden Voss' for n, _ in learner()), True)`),
    mini('Return every staff member beside their manager, printing the word nobody for the one at the top — coalesce(m.name, \'nobody\'). Two columns named name and boss, by id. Order matters.',
      'The inner join drops the person with no manager, so keep the left copy whole instead and fill the gap. Two aliases, one of them optional.',
`check_cols("two columns, name then boss", ['name', 'boss'])
check_query("the whole line of command", "SELECT s.name, COALESCE(m.name, 'nobody') AS boss FROM staff s LEFT JOIN staff m ON m.id = s.manager_id ORDER BY s.id", ordered=True)
check_query("a second person at the top", "SELECT s.name, COALESCE(m.name, 'nobody') AS boss FROM staff s LEFT JOIN staff m ON m.id = s.manager_id ORDER BY s.id", ordered=True,
            extra="INSERT INTO staff VALUES (99, 'Vela Ord', 'board', '2026-01-01', NULL);")
check("twelve rows on the shipped dump", lambda: len(learner()), 12)
check("Halden Voss answers to nobody", lambda: learner()[0], ('Halden Voss', 'nobody'))
check("Ana Petrov answers to Ruth Ash", lambda: ('Ana Petrov', 'Ruth Ash') in learner(), True)
check("only one nobody in the building", lambda: sum(1 for _, b in learner() if b == 'nobody'), 1)`),
  ],
})
