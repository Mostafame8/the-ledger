import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('loops', {
  tier: 'F', xp: 40, requires: ['method'], gates: ['fizz'],
  tools: ['tool-list'],
  title: 'Counting on fingers', algo: 'Loops and accumulators',
  steps: [
    explain([
      'Dax has been listening to the bank radio all morning and counting the check-in calls on his fingers. He ran out of fingers somewhere around ten and started again.',
      'Dax: “Nine. Maybe eleven. There were a lot.”',
      '“Nine or eleven is the difference between two guards on that floor and three. Put your hands down.”',
    ], { move: 'brute force' }),
    explain([
      'Marguerite slides a burner phone across the table with a script already open on it.',
      '“One box for the count. One pass over the calls. One rule for what goes in the box. Then you read the box.”',
      '“Your fingers forget. The box does not, and it does not care whether there are nine calls or nine thousand.”',
    ], { move: 'name the waste', code:
`def count_multiples(nums, k):
    count = 0
    for n in nums:
        if n % k == 0:
            count += 1
    return count`,
      scene: { kind: 'cells', data: [3, 5, 6, 7, 9], marks: ['n'], states: [{ n: 3 }, { n: 5 }, { n: 6 }, { n: 7 }, { n: 9 }] },
    }),
    trace(
`def count_multiples(nums, k):
    count = 0
    for n in nums:
        if n % k == 0:
            count += 1
    return count`,
      'count_multiples([3, 5, 6, 7, 9], 3)',
      [
        { line: 2, state: { count: 0 }, ask: 'count', note: 'The box is set down empty before the pass starts. Nothing has been counted yet.' },
        { line: 3, state: { count: 0, n: 3 }, ask: 'n', note: 'The loop hands you one item at a time, starting with the first.' },
        { line: 5, state: { count: 1, n: 3 }, ask: 'count', note: '3 % 3 is 0, so 3 is a multiple and one goes in the box.' },
        { line: 3, state: { count: 1, n: 5 }, ask: 'n', note: 'The loop moves on regardless of what happened inside it. Next item is 5.' },
        { line: 6, state: { count: 3, n: 9 }, ask: 'count', note: '5 and 7 left the box alone. 3, 6 and 9 each added one, so the pass ends at 3.' },
      ],
      { scene: { kind: 'cells', data: [3, 5, 6, 7, 9], marks: ['n'] } }),
    spot('You have a list of radio calls and you want how many came in after midnight. Dax offers to write out one if statement per call. What is wrong with that?',
      ['Nothing, if the list is short', 'The list length changes every shift, so the code has to walk it instead of naming each entry', 'Ifs are slower than loops', 'He should sort the calls first'],
      1, 'The code is written once and the list is different every night, so the number of ifs is never right twice. Speed is not the issue: one loop and one if do exactly the same work as fifty ifs. Sorting costs a rearrangement and answers nothing about how many are past midnight.'),
    blank('“Radio drill. Say the number, except every third call, where you say clear instead. Numbers come back as text so the whole line reads the same.”',
`def every_third(n):
    out = []
    for i in range(1, n + 1):
        if ___:
            out.append('clear')
        else:
            out.append(___)
    return out`,
`check("every_third(3)", ['1', '2', 'clear'])
check("every_third(6)", ['1', '2', 'clear', '4', '5', 'clear'])
check("every_third(1)", ['1'])
check("every_third(0)", [])
check("every_third(9)[-1]", 'clear')`),
    mini('Write count_between(nums, lo, hi) that returns how many values in nums are between lo and hi, counting lo and hi themselves.',
      'One box, one pass, one rule. The rule is a single comparison; Python lets you write both halves of it at once.',
`check("count_between([1, 5, 9], 1, 5)", 2)
check("count_between([1, 5, 9], 2, 8)", 1)
check("count_between([4, 4, 4], 4, 4)", 3)
check("count_between([1, 2, 3], 5, 9)", 0)
check("count_between([-3, 0, 3], -3, 0)", 2)
check("count_between([], 0, 10)", 0)`),
  ],
})
