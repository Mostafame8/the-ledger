import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('bits', {
  tier: 'F', xp: 40, requires: ['loops'], gates: ['xor'],
  tools: [],
  title: 'The odd key', algo: 'XOR and bit tests',
  steps: [
    explain([
      'Marguerite empties a tray of key blanks onto the table. Every serial was cut twice, one for the crew and one for the drop, except one that was cut once by mistake.',
      'Dax: “I lay them all out in pairs and see which one is lonely.”',
      '“There are four hundred blanks and this table seats two. Try again without the table.”',
    ], { move: 'brute force' }),
    explain([
      '“A serial is a number, and a number is a row of bits. Xor compares two rows bit by bit and keeps only the places where they disagree.”',
      '“So a number xor itself is nothing at all, and nothing xor a number is that number back. Pairs erase themselves.”',
      '“Fold the whole tray into one running total with xor. Every twin cancels its partner on the way through, and what is left in your hand is the odd key.”',
    ], { move: 'name the waste', code:
`def fold_xor(nums):
    acc = 0
    for n in nums:
        acc ^= n
    return acc`,
      scene: { kind: 'cells', data: [3, 5, 3], marks: ['n'], states: [{ n: 3 }, { n: 5 }, { n: 3 }] },
    }),
    trace(
`def fold_xor(nums):
    acc = 0
    for n in nums:
        acc ^= n
    return acc`,
      'fold_xor([3, 5, 3])',
      [
        { line: 4, state: { n: 3, acc: 3 }, ask: 'acc', note: 'acc started at 0, and 0 disagrees with 3 in exactly the bits 3 has set, so 0 xor 3 is 3.' },
        { line: 4, state: { n: 5, acc: 6 }, ask: 'acc', note: '3 is 011 and 5 is 101. They agree only in the last bit, so that bit drops and the other two stay: 110, which is 6.' },
        { line: 5, state: { n: 3, acc: 5 }, ask: 'acc', note: 'The second 3 cancels the first: 110 xor 011 is 101, which is 5. The pair is gone and the odd key is what is left.' },
      ],
      { scene: { kind: 'cells', data: [3, 5, 3], marks: ['n'] } }),
    spot('Four hundred key blanks. Every serial was cut exactly twice except one. You get one pass over the tray and no room for a second list. Name the move.',
      ['Sort the tray and walk it in pairs', 'Xor every serial together and read what survives', 'Tally every serial in a dictionary and find the one that counts one', 'Compare every serial against every other serial'],
      1, 'Sorting rearranges the tray and costs more than the single pass you were given. A tally is exactly the second list you do not have room for. Every serial against every other is four hundred squared for a question one pass answers. Xor runs once and remembers nothing but a single number.'),
    blank('“Bit zero of any number is the ones column, so it is one when the number is odd. Ask for that column and nothing else.”',
`def is_odd(n):
    return ___ == 1`,
`check("is_odd(3)", True)
check("is_odd(7)", True)
check("is_odd(1)", True)
check("is_odd(4)", False)
check("is_odd(10)", False)
check("is_odd(0)", False)`),
    mini('Write count_ones(n) that takes a whole number of zero or more and returns how many of its bits are set to one.',
      'The lowest bit is n & 1, and n >> 1 slides the next one down into its place. Keep sliding until nothing is left.',
`check("count_ones(7)", 3)
check("count_ones(8)", 1)
check("count_ones(255)", 8)
check("count_ones(1023)", 10)
check("count_ones(1)", 1)
check("count_ones(0)", 0)`),
  ],
})
