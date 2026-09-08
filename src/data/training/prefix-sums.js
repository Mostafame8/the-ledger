import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('prefix-sums', {
  tier: 'D', xp: 90, requires: ['loops'], gates: ['prefix', 'product', 'kadane'],
  title: 'The margin column', algo: 'Prefix sums',
  steps: [
    explain([
      'The Ledger keeps a page for bribes, one line a month, and the fence asks the same shape of question all evening. What went out between March and July. Then between May and June. Then the first four months, then March to July again because she was not listening.',
      'Dax: “Add up the months she names. Every time she names some.”',
      '“Forty questions, ten months each. You will add the same March to the same April forty times over, and one of those times you will get it wrong.”',
    ], { move: 'brute force' }),
    explain([
      '“Walk the page once and write a running total down the margin. Nothing, then the first month, then the first two, and on down. Every line of the margin means the same thing: everything above you.”',
      '“Now March through July is the margin at July minus the margin just above March. One subtraction, however many months she names, and the page has not changed since you did the walk.”',
      '“Start the margin with a zero. It is not decoration. It gives the first month something to subtract from, which is an if statement you now never have to write.”',
    ], { move: 'name the waste', code:
`def prefix(nums):
    pre = [0]
    for n in nums:
        pre.append(pre[-1] + n)
    return pre


def range_sum(pre, i, j):
    return pre[j] - pre[i]` }),
    trace(
`def prefix(nums):
    pre = [0]
    for n in nums:
        pre.append(pre[-1] + n)
    return pre


def range_sum(pre, i, j):
    return pre[j] - pre[i]`,
      'range_sum(prefix([3, 1, 4]), 1, 3)',
      [
        { line: 4, state: { n: 3, pre: [0, 3] }, ask: 'pre', note: 'The margin opened with a zero, and the first month adds 3 to it. pre[1] means the total of the first one month.' },
        { line: 4, state: { n: 1, pre: [0, 3, 4] }, ask: 'pre', note: 'pre[-1] is the line above, 3, plus this month, 1. Each append reads exactly one earlier line, so the whole margin costs one pass.' },
        { line: 4, state: { n: 4, pre: [0, 3, 4, 8] }, ask: 'pre', note: 'Three months in, four lines of margin. pre[k] is always the total of the first k months, and pre[0] being 0 is what keeps that sentence true at the top of the page.' },
        { line: 9, state: { pre: [0, 3, 4, 8], i: 1, j: 3, returns: 5 }, ask: 'returns', note: 'pre[3] is the first three months, pre[1] is the first one, so the difference is months 1 and 2: 1 + 4. This range_sum takes the far end exclusive, which is why the drill below, whose ends are both included, needs a + 1.' },
      ]),
    spot('The fence will ask about a hundred different month ranges on the same page, and nobody is writing on the page while she asks. Which plan?',
      ['Add up the months in each range as she asks it. A hundred small sums',
       'Walk the page once writing a running total down the margin, then answer each range with one subtraction',
       'Sort the months by amount so the large ones are easy to find',
       'Keep only the total of the whole page and scale it by how many months she named'],
      1, 'Sorting throws away the month order, and the month order is the only thing the question is about. Scaling the whole total is an average wearing a suit; months are not equal and she will notice. Adding each range up does give the right answer, but it pays for the same March over and over. One pass to build the margin, then every answer costs one subtraction no matter how many months it spans.'),
    blank('“Your hands. Same page, and she has written the questions down this time: pairs of months, and both ends of each pair are included.”',
`def range_sum_query(nums, queries):
    pre = [0]
    for n in nums:
        ___
    out = []
    for i, j in queries:
        out.append(___)
    return out`,
`check("range_sum_query([3, 1, 4, 1, 5], [(0, 2), (1, 3), (4, 4)])", [8, 6, 5])
check("range_sum_query([1, 2, 3], [(0, 2)])", [6])
check("range_sum_query([2, -1, 3], [(0, 1), (1, 2)])", [1, 2])
check("range_sum_query([7], [(0, 0), (0, 0)])", [7, 7])
check("range_sum_query([1, 2], [])", [])
check("range_sum_query([], [])", [])`),
    mini('Write equilibrium_index(nums) returning the first index i where everything before i sums to the same total as everything after i, or -1 if no index does. The value sitting at i belongs to neither side. Do not sum a slice inside the loop.',
      'Total the page once. Then walk it carrying the left total: the right total is the whole total minus the left total minus the value you are standing on.',
`check("equilibrium_index([1, 7, 3, 6, 5, 6])", 3)
check("equilibrium_index([-1, 2, -1])", 1)
check("equilibrium_index([5, 0])", 0)
check("equilibrium_index([1, 2, 3])", -1)
check("equilibrium_index([0])", 0)
check("equilibrium_index([])", -1)`),
  ],
})
