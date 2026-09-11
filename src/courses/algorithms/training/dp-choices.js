import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('dp-choices', {
  tier: 'A', xp: 240, requires: ['dp-line'], gates: ['coins', 'wordbreak', 'lis', 'knap'],
  tools: ['tool-list'],
  title: 'Exact change at the border', algo: 'Tables over choices',
  steps: [
    explain([
      'The man on the border gate takes cash and gives no change. The crew has notes in two denominations and the toll is a fixed number. Marguerite wants to know in how many orders the notes can be counted out to make it exactly.',
      'Dax: “Every possible handful, then. Count them out and see which ones land on the number.”',
      '“The handfuls are unbounded — you may hand over the same denomination as often as you like — so there is no list of them to walk. And you already know what happens next: the handful for forty and the handful for thirty-five both go through the handful for thirty.”',
    ], { move: 'brute force' }),
    explain([
      '“The fire escape had one choice at each box: one step or two. This has one choice per denomination, and the box is not a step any more, it is an amount. One box per amount from nought up to the toll.”',
      '“Ways to make an amount is the sum, over every note you could hand over last, of the ways to make what was left before it. Nought has exactly one way: hand over nothing. That box is not zero, it is one, and getting it wrong makes every other box zero.”',
      '“Fill upward and every amount you read is smaller than the one you are writing, so it is already finished. Same discipline as the line, one more loop inside it.”',
      '“Watch what the inner loop counts. Handing over a five then a ten and handing over a ten then a five are two different fills of the same box, so this version counts orders. Counting sets of notes instead is the same table with the loops swapped, and that is the exercise at the end.”',
    ], { move: 'pick the pattern', code:
`def ways(amount, coins):
    table = [0] * (amount + 1)
    table[0] = 1
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                table[a] += table[a - c]
    return table[amount]`,
      scene: { kind: 'cells', data: 'table', init: [0, 0, 0, 0, 0], pointers: ['a'],
        states: [{ table: [1, 0, 0, 0, 0] }, { a: 1, table: [1, 1, 0, 0, 0] }, { a: 2, table: [1, 1, 2, 0, 0] }, { a: 3, table: [1, 1, 2, 3, 0] }, { a: 4, table: [1, 1, 2, 3, 5] }] },
    }),
    trace(
`def ways(amount, coins):
    table = [0] * (amount + 1)
    table[0] = 1
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                table[a] += table[a - c]
    return table[amount]`,
      'ways(4, [1, 2])',
      [
        { line: 3, state: { amount: 4, table: [1, 0, 0, 0, 0] }, ask: 'table', note: 'Five boxes, one per amount from nought to four, and the only one you can fill without thinking is the first. One way to pay nothing: hand over nothing. Every other box will be built out of this 1.' },
        { line: 7, state: { amount: 4, a: 1, c: 1, table: [1, 1, 0, 0, 0] }, ask: 'table', note: 'Amount 1 can only end with a 1, and before that note there was nothing left to pay, so it reads box 0 and finds the 1. The 2 was skipped by line 6 because you cannot hand over a 2 towards a toll of 1.' },
        { line: 7, state: { amount: 4, a: 2, c: 2, table: [1, 1, 2, 0, 0] }, ask: 'table', note: 'Box 2 was filled twice. Ending with a 1 read box 1 and added 1; ending with a 2 read box 0 and added another. Two orders, and this is the stop where += earns its keep — the box accumulates across the denominations rather than being assigned.' },
        { line: 7, state: { amount: 4, a: 3, c: 2, table: [1, 1, 2, 3, 0] }, ask: 'table', note: 'Ending with a 1 brought 2 from box 2, ending with a 2 brought 1 from box 1. Three orders for 3, and every box it read was finished before the loop arrived here.' },
        { line: 7, state: { amount: 4, a: 4, c: 2, table: [1, 1, 2, 3, 5] }, ask: 'table', note: 'Five orders to pay a toll of four in ones and twos. Four amounts, eight additions, and the table is the working — which is the only reason anyone believes the answer. A toll of a thousand costs two thousand additions.' },
      ],
      { scene: { kind: 'cells', data: 'table', init: [0, 0, 0, 0, 0], pointers: ['a'] } }),
    spot('The border man changes his mind: he wants the fewest notes rather than the number of orders, and the crew is carrying threes and fives. Which of these is right?',
      ['Hand over the largest note that fits, then repeat with what is left',
       'The same table, one box per amount, but the box holds the fewest notes reaching that amount and each denomination proposes one plus the box for the remainder, keeping the smallest',
       'The same table counting orders, then divide the toll by the number of orders',
       'Count the orders and take the shortest one, which means recording every order as it is built'],
      1, 'Largest note first is the till trick and it does not survive these denominations: a toll of nine takes a five and then cannot be finished, while three threes pay it exactly. Dividing by a count of orders is arithmetic on unrelated numbers. Recording every order works and it also throws away the whole point, because the orders are what the table was invented to avoid writing down. What changes is only what a box means — fewest notes rather than how many orders — and how the denominations are combined: smallest of one-plus-the-remainder rather than a sum. Same shape, same direction, different verb.'),
    blank('“Simpler question first, and the honest one at a border: can the toll be paid at all. One box per amount holding True or False.”',
`def can_make(coins, amount):
    reach = [False] * (amount + 1)
    reach[0] = ___
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and reach[a - c]:
                ___
                break
    return reach[amount]`,
`check("can_make([3, 5], 8)", True)
check("can_make([3, 5], 4)", False)
check("can_make([2], 7)", False)
check("can_make([2], 8)", True)
check("can_make([1], 0)", True)
check("can_make([6, 9], 11)", False)
check("can_make([], 0)", True)`),
    mini('Write count_combinations(coins, amount) returning how many different sets of notes add up to amount, where a set is counted once no matter what order it is handed over in. Every denomination may be used as often as you like, and coins holds distinct positive values. An amount of 0 has one answer: the empty set.',
      'Same boxes, and the swap is which loop is outside. Take the denominations one at a time and let each of them sweep every amount, so a set is only ever built with its denominations in the one fixed order.',
`check("count_combinations([1, 2], 4)", 3)
check("count_combinations([1, 2, 5], 5)", 4)
check("count_combinations([2], 3)", 0)
check("count_combinations([2], 4)", 1)
check("count_combinations([1], 0)", 1)
check("count_combinations([], 0)", 1)
check("count_combinations([2, 3, 5], 10)", 4)`),
  ],
})
