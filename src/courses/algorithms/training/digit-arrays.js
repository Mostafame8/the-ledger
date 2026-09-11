import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('digit-arrays', {
  tier: 'F', xp: 50, requires: ['loops'], gates: ['plusone'],
  tools: ['tool-list'],
  title: 'The locker counter', algo: 'Digits as a list',
  steps: [
    explain([
      'The left-luggage lockers at the station have a mechanical counter on the door, one wheel per digit. Marguerite books locker 199 and turns the wheel one click.',
      'The last wheel rolls from 9 to 0. It drags the middle wheel from 9 to 0, and that one drags the first wheel from 1 to 2.',
      'Dax: “It broke.”',
      '“It carried. Three wheels, one click, and every wheel that hit zero pushed the one on its left.”',
    ], { move: 'brute force' }),
    explain([
      '“The serials on the Ledger pages are too long for one number, so we hold them the way the door does: one digit per slot, left to right.”',
      '“Adding one starts at the right end, not the left. A slot takes the carry, keeps what fits in ten, and passes the rest on. When nothing is left to pass, you stop.”',
      '“If the carry survives past the first slot, the number grew a digit. That is the only time the list gets longer.”',
    ], { move: 'name the waste', code:
`def add_one(digits):
    carry = 1
    i = len(digits) - 1
    while i >= 0 and carry:
        total = digits[i] + carry
        digits[i] = total % 10
        carry = total // 10
        i -= 1
    if carry:
        digits.insert(0, 1)
    return digits`,
      scene: { kind: 'cells', data: 'digits', init: [1, 9, 9], pointers: ['i'],
        states: [{ i: 2, digits: [1, 9, 9] }, { i: 2, digits: [1, 9, 0] }, { i: 1, digits: [1, 0, 0] }, { i: 0, digits: [2, 0, 0] }, { i: -1, digits: [2, 0, 0] }] },
    }),
    trace(
`def add_one(digits):
    carry = 1
    i = len(digits) - 1
    while i >= 0 and carry:
        total = digits[i] + carry
        digits[i] = total % 10
        carry = total // 10
        i -= 1
    if carry:
        digits.insert(0, 1)
    return digits`,
      'add_one([1, 9, 9])',
      [
        { line: 2, state: { carry: 1 }, ask: 'carry', note: 'Adding one is just a carry of one arriving at the rightmost wheel.' },
        { line: 6, state: { i: 2, total: 10, digits: [1, 9, 0] }, ask: 'digits', note: '9 + 1 is 10. The wheel keeps 10 % 10, which is 0, and the ten has to go somewhere else.' },
        { line: 6, state: { i: 1, total: 10, digits: [1, 0, 0] }, ask: 'digits', note: 'The carry arrived at the middle wheel, which was also a 9, so it does the same thing and passes another carry left.' },
        { line: 7, state: { i: 0, total: 2, carry: 0, digits: [2, 0, 0] }, ask: 'carry', note: 'The first wheel was a 1, so total is 2 and it fits. 2 // 10 is 0, the carry dies, and the while condition fails on the next check.' },
        { line: 11, state: { i: -1, carry: 0, digits: [2, 0, 0] }, ask: 'digits', note: 'No carry survived the leftmost slot, so nothing is inserted and the list stays three long. 199 rolled to 200.' },
      ],
      { scene: { kind: 'cells', data: 'digits', init: [1, 9, 9], pointers: ['i'] } }),
    spot('A locker number is held as a list of single digits and you have to add one to it, keeping it a list of digits. Where does the work start?',
      ['At the leftmost digit, carrying rightward', 'At the rightmost digit, carrying leftward', 'Add one to every digit', 'Sort the digits, then add one to the largest'],
      1, 'A carry runs the way the wheels turn: the rightmost slot takes the one, and anything over nine pushes into the slot on its left. Adding one to every digit of 199 gives 2, 10, 10, which is not a number. Sorting throws away the place values, so the digits stop meaning anything. And a carry travelling rightward runs off the end of the list with nowhere to land.'),
    blank('“Small one. Read the wheels back to me as an ordinary number, left to right.”',
`def to_number(digits):
    n = 0
    for d in digits:
        n = ___
    return n`,
`check("to_number([1, 9, 9])", 199)
check("to_number([1, 0, 0, 7])", 1007)
check("to_number([4])", 4)
check("to_number([0])", 0)
check("to_number([])", 0)`),
    mini('Write to_digits(n) that takes a whole number of zero or more and returns its digits as a list, left to right. to_digits(0) is [0].',
      'The rightmost digit is n % 10, and n // 10 throws it away. That gives you the digits backwards, so deal with the order at the end. Zero needs its own answer, because the loop never runs.',
`check("to_digits(199)", [1, 9, 9])
check("to_digits(1007)", [1, 0, 0, 7])
check("to_digits(10)", [1, 0])
check("to_digits(7)", [7])
check("to_digits(0)", [0])`),
  ],
})
