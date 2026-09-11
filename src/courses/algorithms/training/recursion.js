import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('recursion', {
  tier: 'C', xp: 120, requires: ['trees'], gates: ['letters', 'perms', 'safe'],
  tools: ['tool-recursion'],
  title: 'The folded note', algo: 'Recursion',
  steps: [
    explain([
      'The fence sends instructions on a strip of paper folded into a stack of squares. One line per fold. Somewhere down the stack is a fold that says stop, and there is no way to know which one until you get there.',
      'Dax: “How many folds? Tell me and I will write a loop. Or five loops, one per fold, I do not care.”',
      '“You will not know until you reach the one that says stop, so there is no number to write your loops around. Read the first line, do what it says, then hand the rest of the note to somebody who reads notes.”',
    ], { move: 'brute force' }),
    explain([
      'Dax: “The somebody is the same function. It calls itself. I do not trust a thing that calls itself.”',
      '“You trusted it on the org chart. Under any name hangs a smaller chart, so you asked the chart. Under any fold lies a shorter note, so you ask the note. It is one idea wearing a different coat.”',
      '“Two lines make it work. An answer for the shortest possible note that involves no asking at all, and a step that makes the note strictly shorter before it asks. Leave out the first and it asks forever. Leave out the second and it asks forever.”',
      '“Everything else people say about recursion is decoration. Add the digits of a number and you can see both lines from across the room.”',
    ], { move: 'pick the pattern', code:
`def sum_digits(n):
    if n == 0:
        return 0
    return n % 10 + sum_digits(n // 10)`,
      scene: { kind: 'rows', rows: [{ label: 'calls', data: 'calls', init: [], pile: true, at: ['n'] }],
        states: [{ n: 123, calls: [123] }, { n: 12, calls: [123, 12] }, { n: 1, calls: [123, 12, 1] }, { n: 0, calls: [123, 12, 1, 0] }, { n: 123, calls: [123] }] } }),
    trace(
`def sum_digits(n):
    if n == 0:
        return 0
    return n % 10 + sum_digits(n // 10)`,
      'sum_digits(123)',
      [
        { line: 3, state: { n: 0, calls: [123, 12, 1, 0], returns: 0 }, ask: 'returns', note: 'Nothing comes back at all until the note runs out. 123 asked 12, which asked 1, which asked 0, and only here does a line answer without asking anybody. An empty note adds up to nought.' },
        { line: 4, state: { n: 1, calls: [123, 12, 1], returns: 1 }, ask: 'returns', note: 'This is the frame that asked about 0. It takes the 0 it was handed, adds its own last digit, 1 % 10, and answers 1. It knows nothing about 12 or 123; it was only ever asked one question.' },
        { line: 4, state: { n: 12, calls: [123, 12], returns: 3 }, ask: 'returns', note: 'Its own last digit is 2, and the shorter note came back 1. Notice the addition happens on the way back up: three frames were opened before a single sum was worked out.' },
        { line: 4, state: { n: 123, calls: [123], returns: 6 }, ask: 'returns', note: '3 plus the 3 from below. Four frames, four subtractions of one digit, and not one loop. The stack of paperwork was the counting; when it unwinds, the answer is the last thing left.' },
      ], { scene: { kind: 'rows', rows: [{ label: 'calls', data: 'calls', init: [], pile: true, at: ['n'] }] } }),
    spot('Dax writes his own digit adder: take the last digit, add it to whatever the same function says about the rest. He runs it and Python answers with a wall of red about a recursion depth. What did he leave out?',
      ['A loop. Recursion cannot add a list of numbers up on its own',
       'A line that answers the smallest note outright, without asking anybody, so the asking has somewhere to stop',
       'A larger recursion limit, which is what the red wall is asking him for',
       'A box of answers he has already worked out, so the same note is never read twice'],
      1, 'Recursion adds numbers perfectly well; that is what the last line does. Raising the limit buys him a taller wall and the same crash, because nothing in his code was ever going to stop. And a box of remembered answers pays off when the same question is asked twice, which never happens here: every note is shorter than the last, all the way down to the one nobody answered.'),
    blank('“Your turn. b to the power of e, e is nought or more, and no ** and no pow(). Two lines, the two lines.”',
`def power(b, e):
    if e == 0:
        return ___
    return ___`,
`check("power(2, 3)", 8)
check("power(3, 4)", 81)
check("power(5, 1)", 5)
check("power(7, 0)", 1)
check("power(-2, 3)", -8)
check("power(0, 5)", 0)
check("power(0, 0)", 1)`),
    mini("Write binary_strings(n) returning every string of length n made of the characters '0' and '1', as a list in lexicographic order. binary_strings(0) returns [''], the list holding one empty string.",
      'A string of length n is a first character with a string of length n - 1 behind it. Ask for the shorter strings once, then put a 0 in front of each of them, then a 1.',
`check("binary_strings(0)", [''])
check("binary_strings(1)", ['0', '1'])
check("binary_strings(2)", ['00', '01', '10', '11'])
check("binary_strings(3)", ['000', '001', '010', '011', '100', '101', '110', '111'])
check("len(binary_strings(5))", 32)
check("binary_strings(4)[0]", '0000')
check("binary_strings(4)[-1]", '1111')`),
  ],
})
