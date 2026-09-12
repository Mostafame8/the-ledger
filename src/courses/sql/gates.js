// Gate content for the sql course. One object per gate; see CLAUDE.md for the voice and schema.
// The learner writes one SELECT statement per gate against the fixture in fixture.sql.
const g = (id, rank, xp, stat, title, algo, story, mission, hint, code) => ({ id, rank, xp, stat, title, algo, story, mission, hint, code });

const ARCS = [
{ name:'Arc I — The dump', sub:'Six tables off Halden\'s server, and a fence who will not read a spreadsheet.', gates:[
  g('pullnames','F',40,'filter','Names off the list','SELECT, WHERE, ORDER BY',
    ['The dump came out of Halden\'s server in six tables. The fence wants one thing first: who has vault access.',
     'Dax opens staff in a spreadsheet, sorts by department, and starts highlighting rows with the mouse. He misses one, then highlights a teller by mistake.',
     '“Ask the table,” Marguerite says. “It knows how to answer. Say which columns, say which rows, say what order. Three words and it is done.”'],
    'Return name and dept of every staff member in the vault department, alphabetical by name, as two columns named name and dept. Order matters. Stretch: make the same query work for a department name typed in any case.',
    'SELECT picks the columns, FROM names the table, WHERE keeps the rows you want, ORDER BY lines them up. Text goes in single quotes.',
`-- expected rows, in this order
('Ines Marr', 'vault')
('Kit Ferro', 'vault')
('Priya Nand', 'vault')`),
  g('bigmoves','F',45,'filter','The big moves','ORDER BY DESC, LIMIT',
    ['“The five biggest transfers,” the fence says. “Biggest first. I do not want the sixth.”',
     'Dax sorts the spreadsheet by amount, scrolls to the bottom because it sorted the wrong way, then screenshots a block of rows and counts them twice.',
     '“Sort, then take five,” Marguerite says. “Say both, in that order, and say which way is up.”'],
    'Return id and amount of the five largest transfers, largest first, as two columns named id and amount. Order matters. Stretch: the five smallest transfers that are still above 10,000.',
    'ORDER BY amount DESC puts the biggest on top. LIMIT 5 keeps the first five of whatever order you asked for, so the order clause has to come first in your head.'),
  g('nightdoors','F',45,'filter','Doors after dark','DISTINCT and ranges',
    ['Which doors opened after dark. The fence asks it like it is one question, and it is.',
     'Dax filters the badges spreadsheet to the late rows, then reads down the door column with his finger, saying each name and trying to remember if he has said it already.',
     '“Distinct is a word,” Marguerite says. “Use it. And the clock is text here, so ask for the time and compare it as text.”'],
    'Return each distinct door that was swiped at or after 22:00 or before 06:00, as one column named door, in any order. Stretch: add how many night swipes each door had.',
    'time(at) pulls the clock out of the timestamp as \'HH:MM:SS\', and text compares in order, so time(at) >= \'22:00\' works. Two conditions joined with OR, then DISTINCT on the column.',
`-- expected rows, any order
('lobby',)
('loading-bay',)
('server-room',)`),
  g('howmany','F',50,'shape','How many','COUNT with a filter',
    ['“How many personal accounts,” the fence says. Not which. How many.',
     'Dax filters the accounts spreadsheet to personal and counts the rows with his finger. He gets five, then four, then five.',
     '“The table can count,” Marguerite says. “Ask for one number, and give the number a name so she knows what she is looking at.”'],
    'Return one row with one column named n: how many accounts are of kind personal. Stretch: one row per kind, with its count.',
    'COUNT(*) counts the rows WHERE lets through. AS n names the column. One row comes back because there is one count.'),
]},
];
export const ARCS_DATA = ARCS;
