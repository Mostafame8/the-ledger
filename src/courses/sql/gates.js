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
{ name:'Arc II — Who talks to whom', sub:'Six tables that only mean something when you put two of them side by side.', gates:[
  g('badgeowners','E',60,'join','Whose badge','INNER JOIN',
    ['The badge log is honest and useless: a staff id, a door, a time. The fence does not know who staff id 5 is, and she is not going to learn.',
     'Dax opens both sheets side by side and starts typing names into the badge rows by hand. Eleven rows in, he types the wrong one.',
     '“Two tables, one wire between them,” Marguerite says. “The badge carries a staff id. The staff table is keyed by that id. Say so, once, and the names arrive.”'],
    'Return every badge swipe with the staff member\'s name: three columns named name, door and at, any order. Stretch: keep only the swipes that went in.',
    'JOIN staff ON staff.id = badges.staff_id. Give each table a short alias so you can say which id you mean; a swipe whose staff id matches nobody drops out, which is what INNER means.',
`-- three of the seventeen rows
('Ines Marr', 'vault', '2026-03-02 08:55')
('Tomas Reed', 'lobby', '2026-03-02 07:30')
('Otto Kline', 'server-room', '2026-03-02 23:15')`),
  g('emptyaccounts','E',70,'join','Accounts nobody touched','LEFT JOIN … IS NULL',
    ['“Three of these accounts have never moved a penny,” the fence says. “Those are the ones I want. Nobody watches a dead account.”',
     'Dax looks for them by reading the transfer sheet and crossing account numbers off a list on the back of his hand. He crosses one off twice and misses another.',
     '“Keep every account, wire the transfers on beside them, then keep the ones where nothing arrived,” Marguerite says. “The empty seat is the answer.”'],
    'Return every account that has never sent and never received a transfer: two columns named id and holder, any order. Stretch: the same for accounts that have never sent but have received.',
    'A LEFT JOIN keeps every row on the left even when the right side has nothing to offer, filling the gap with blanks. Then WHERE the right side IS NULL keeps only the gaps. Match on either end of the transfer.'),
  g('chainofcommand','D',90,'join','Who reports to whom','Self join',
    ['The staff table points at itself: every row carries the id of the person above it. One row points at nobody.',
     'Dax draws the tree on the back of a takeaway menu, gets two branches crossed, and declares that the head of security reports to a teller.',
     '“The table meets itself,” Marguerite says. “Two copies, two names, one wire between them. Call one of them the manager and the answer reads like a sentence.”'],
    'Return every staff member who has a manager, beside that manager\'s name: two columns named name and manager, alphabetical by name. Order matters. Stretch: include the one with no manager, showing the word none instead.',
    'JOIN staff m ON m.id = s.manager_id, with s and m two aliases for the same table. The person at the top has no manager id, so this join quietly leaves them out.',
`-- the first three of eleven rows
('Ana Petrov', 'Ruth Ash')
('Bo Lund', 'Tomas Reed')
('Ines Marr', 'Halden Voss')`),
  g('threeway','D',100,'join','Both ends of the wire','Two joins with aliases',
    ['A transfer row has two account numbers on it and no names at all. The fence wants both ends spelled out.',
     'Dax says he will just look each number up as he goes. Fourteen rows, twenty-eight lookups, and he is already asking what account 9 was.',
     '“Same table, twice, two different jobs,” Marguerite says. “One copy is the sender, one is the receiver. Name them that and stop thinking about it.”'],
    'Return every transfer with both holders\' names: four columns named id, sender, receiver and amount, ordered by id. Order matters. Stretch: only the transfers where both ends sit in the same branch.',
    'Join accounts twice under two aliases, one on from_acct and one on to_acct, and alias the two holder columns apart. Nothing is dropped: every transfer points at real accounts.'),
]},
];
export const ARCS_DATA = ARCS;
