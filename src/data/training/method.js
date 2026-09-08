import { node, explain, spot } from './node.js'

export default node('method', {
  tier: 'F', xp: 40, requires: [], gates: [],
  tools: [],
  title: 'The back room', algo: 'The six moves',
  steps: [
    explain([
      'A room above a laundromat. One table, two chairs, a whiteboard someone tried to wipe with coffee. Marguerite is already seated.',
      '“Gates are where you prove it. This is where you learn it. Same crew, no clock, nobody shooting.”',
      '“Every problem I hand you gets the same six moves. Learn the moves and the tricks stop looking like magic.”',
    ]),
    explain([
      '“Move one. Restate. Say the problem back to me in your own words, and name what comes in and what goes out.”',
      '“If you cannot say it, you cannot code it. Half the crew fails here and blames the keyboard.”',
    ], { move: 'restate' }),
    explain([
      '“Move two. Examples. Two small ones you can run in your head, then one ugly one: empty, single item, everything the same.”',
      'Dax: “I just start typing.”',
      '“And I just start finding someone else.”',
    ], { move: 'examples' }),
    explain([
      '“Move three. Brute force. Say the dumbest way that works and what it costs. Dax, you are good at this part.”',
      'Dax: “Check everything against everything.”',
      '“n squared. Sometimes that is fine. Usually it is the thing we are here to beat.”',
    ], { move: 'brute force' }),
    explain([
      '“Move four. Name the waste. Where does the dumb way look at the same thing twice, or recompute what it already knew?”',
      '“Every technique on that whiteboard exists to remove one specific kind of waste. Find the waste and the technique names itself.”',
    ], { move: 'name the waste' }),
    explain([
      '“Move five. Pick the pattern. Sorted input and a pair to find: two pointers. Repeated lookups: a dictionary. Most recent thing first: a stack.”',
      '“You will learn one pattern per lesson in this room. Each lesson ends with a gate it unlocks in your head.”',
    ], { move: 'pick the pattern' }),
    explain([
      '“Move six. Verify. Run your examples through the code by hand before you run them through a machine. The ugly example first.”',
      '“Then, and only then, you press the button.”',
    ], { move: 'verify' }),
    spot('Marguerite slides a problem across the table: a sorted list of badge numbers and a target sum. What is the first thing you do?',
      ['Start the loop', 'Say it back: sorted numbers in, two indices out, or nothing', 'Reach for two pointers', 'Write the tests'],
      1, 'Restate comes first, always. The pattern comes after you know what the waste is.'),
    spot('Dax says: check every pair, it is only n squared. Marguerite asks you to name the waste. What is it?',
      ['The list is too long', 'Once a pair is too big, every pair with a bigger right end is also too big, yet he checks them all', 'Python is slow', 'He forgot the empty list'],
      1, 'The sorted order tells you the answer for whole stretches of pairs at once. Brute force throws that away.'),
    spot('A string of brackets. Is every opener closed in the right order? Which pattern removes the waste of rescanning?',
      ['Two pointers', 'Binary search', 'A stack: the most recent opener is the one that must close next', 'A dictionary of counts'],
      2, 'Counting is not enough: “)(” has matching counts. What matters is the most recent unclosed opener, and a stack remembers exactly that.'),
  ],
})
