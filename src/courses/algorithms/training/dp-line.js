import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('dp-line', {
  tier: 'A', xp: 220, requires: ['recursion'], gates: ['stairs', 'robber', 'decode'],
  tools: ['tool-list'],
  title: 'The fire escape', algo: 'Building a table along a line',
  steps: [
    explain([
      'The fire escape on the north face has twenty-eight steps and a rusted handrail. Dax can take them one at a time or two at a time, and Marguerite wants to know how many different ways there are up — not the fastest way, the count.',
      'Dax: “Ways up twenty-eight is ways up twenty-seven plus ways up twenty-six. I can write that. It calls itself, which you taught me.”',
      '“It is correct and it will sit there for a minute and a half. Ask it for twenty-seven and it asks for twenty-six, and the other branch asks for twenty-six as well, and neither of them tells the other. You will compute ways up eleven about a hundred thousand times.”',
    ], { move: 'brute force' }),
    explain([
      '“Every note you ever unfolded was shorter than the last, so nothing was ever asked twice. Here the notes overlap. That is the whole difference, and it is the signal to stop recursing and start writing things down.”',
      '“Turn it round. Instead of starting at twenty-eight and asking downward, start at nought and fill upward. One box per step, filled in order, and every box you need is already filled before you reach the one that needs it.”',
      '“No stack, no repeats, one pass. And you can read the whole working afterwards, which you cannot do with recursion, so a wrong answer tells you where it went wrong.”',
      '“Fibonacci is the smallest honest example, and the stairs turn out to be it wearing overalls. Watch the boxes fill.”',
    ], { move: 'pick the pattern', code:
`def fib_table(n):
    table = [0] * (n + 1)
    table[1] = 1
    for i in range(2, n + 1):
        table[i] = table[i - 1] + table[i - 2]
    return table[n]`,
      scene: { kind: 'cells', data: 'table', init: [0, 0, 0, 0, 0, 0], pointers: ['i'],
        states: [{ table: [0, 1, 0, 0, 0, 0] }, { i: 2, table: [0, 1, 1, 0, 0, 0] }, { i: 3, table: [0, 1, 1, 2, 0, 0] }, { i: 4, table: [0, 1, 1, 2, 3, 0] }, { i: 5, table: [0, 1, 1, 2, 3, 5] }] },
    }),
    trace(
`def fib_table(n):
    table = [0] * (n + 1)
    table[1] = 1
    for i in range(2, n + 1):
        table[i] = table[i - 1] + table[i - 2]
    return table[n]`,
      'fib_table(5)',
      [
        { line: 3, state: { n: 5, table: [0, 1, 0, 0, 0, 0] }, ask: 'table', note: 'Six boxes for the numbers nought to five, and only the two smallest are answers you know without asking anybody. Those are the base cases, and a table always starts by writing them in by hand.' },
        { line: 5, state: { n: 5, i: 2, table: [0, 1, 1, 0, 0, 0] }, ask: 'table', note: 'The first computed box, and both of its inputs were already sitting there. Nothing recursed and nothing was asked twice; the order of the loop guaranteed it.' },
        { line: 5, state: { n: 5, i: 3, table: [0, 1, 1, 2, 0, 0] }, ask: 'table', note: 'Box 3 reads boxes 2 and 1, both filled a moment ago. The two boxes still holding nought are not answers yet, and the loop will not read them until it has written them — which is the only discipline a table has.' },
        { line: 5, state: { n: 5, i: 4, table: [0, 1, 1, 2, 3, 0] }, ask: 'table', note: 'Four boxes filled, each one reading the two behind it. The recursive version would by now have called itself nine times to get here, and five of those calls would have been repeats.' },
        { line: 5, state: { n: 5, i: 5, table: [0, 1, 1, 2, 3, 5] }, ask: 'table', note: 'Five ways, and the table is the working. Ask for twenty-eight and it is twenty-seven additions in a row rather than a third of a million calls — and asking for a thousand costs a thousand additions, which recursion could never survive.' },
      ],
      { scene: { kind: 'cells', data: 'table', init: [0, 0, 0, 0, 0, 0], pointers: ['i'] } }),
    spot('Marguerite changes the question: each step has a rusted patch on it that costs Dax something to stand on, and she wants the cheapest way up rather than the number of ways. Which line of the table changes?',
      ['The size of the table, because a cost problem needs one box per step per possible cost',
       'The order of the loop, because costs have to be filled from the top down',
       'The box, from a count to the cheapest total that reaches this step, and the recurrence, from adding the two behind it to taking the smaller of them plus this step’s cost',
       'Nothing changes. Count the ways and multiply by the average cost of a step'],
      2, 'The table is the same shape and it fills in the same direction, because what a box needs is still the two boxes behind it. What changes is what a box means and what you do with the two you read. Counting adds them; costing takes the better of them and pays for where you are standing. Multiplying an average by a count is not an answer to anything. And a box per step per cost is the shape you need when the thing you are tracking is a budget, which this is not.'),
    blank('“The stairs, then, as a table. Ways up n taking one step or two, and it has to answer n of a thousand without complaint. Write the two base boxes and the recurrence.”',
`def climb(n):
    if n < 2:
        return 1
    ways = [0] * (n + 1)
    ways[0], ways[1] = ___
    for i in range(2, n + 1):
        ways[i] = ___
    return ways[n]`,
`check("climb(0)", 1)
check("climb(1)", 1)
check("climb(2)", 2)
check("climb(3)", 3)
check("climb(4)", 5)
check("climb(10)", 89)
check("climb(30)", 1346269)`),
    mini('Write min_cost_climb(cost) where cost[i] is what standing on step i costs. You may start on step 0 or step 1 without paying for the ground, and from a step you may climb one or two. Return the cheapest total paid to get past the last step. cost has at least two entries.',
      'One box per step plus one for the top, holding the cheapest total that reaches it. The top is reached from either of the last two steps, and reaching a step means paying for it.',
`check("min_cost_climb([10, 15, 20])", 15)
check("min_cost_climb([1, 100, 1, 1, 1, 100, 1, 1, 100, 1])", 6)
check("min_cost_climb([0, 0])", 0)
check("min_cost_climb([5, 1])", 1)
check("min_cost_climb([1, 2])", 1)
check("min_cost_climb([1, 2, 3, 4])", 4)
check("min_cost_climb([2, 2, 2, 2, 2])", 4)`),
  ],
})
