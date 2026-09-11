import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('tracking', {
  tier: 'E', xp: 60, requires: ['loops'], gates: ['stocks', 'majority'],
  tools: [],
  title: 'The ticker on the bar', algo: 'Tracking a running best',
  steps: [
    explain([
      'The fence has a laptop open on the bar, one line per day: what the diamonds fetched that day. Marguerite wants one buy and one sell after it, for the most money.',
      'Dax: “Try every pair of days. Buy on the first, sell on the second, keep the biggest number.”',
      '“Three hundred days is forty-five thousand pairs. Three thousand days is four and a half million. The list only ever gets longer.”',
    ], { move: 'brute force' }),
    explain([
      '“You are asking the same question over and over. Standing on day nine you do not need every earlier day. You need one of them: the cheapest you have already walked past.”',
      '“So carry it. One number for the cheapest day so far, one for the best profit so far, and read the list once, left to right, updating both as you pass.”',
      '“Two numbers in your pocket instead of a table on the wall. Everything you throw away, you were never going to use.”',
    ], { move: 'name the waste', code:
`def best_profit(prices):
    low = prices[0]
    best = 0
    for p in prices:
        if p < low:
            low = p
        if p - low > best:
            best = p - low
    return best`,
      scene: { kind: 'cells', data: [7, 1, 5, 3, 6], marks: ['p', 'low'],
        states: [{ p: 7, low: 7 }, { p: 1, low: 1 }, { p: 5, low: 1 }, { p: 3, low: 1 }, { p: 6, low: 1 }] },
    }),
    trace(
`def best_profit(prices):
    low = prices[0]
    best = 0
    for p in prices:
        if p < low:
            low = p
        if p - low > best:
            best = p - low
    return best`,
      'best_profit([7, 1, 5, 3, 6])',
      [
        { line: 2, state: { low: 7 }, ask: 'low', note: 'The cheapest day so far can only be the first day, because it is the only one you have seen.' },
        { line: 3, state: { low: 7, best: 0 }, ask: 'best', note: 'Best profit starts at zero. Refusing to trade is always allowed, so no answer is ever worse than nothing.' },
        { line: 6, state: { p: 1, low: 1, best: 0 }, ask: 'low', note: 'Day two is 1, cheaper than 7, so the pocket number drops. The old 7 is gone and you will never need it again.' },
        { line: 8, state: { p: 5, low: 1, best: 4 }, ask: 'best', note: 'Selling at 5 against the cheapest day so far makes 4, better than nothing, so best moves up.' },
        { line: 7, state: { p: 3, low: 1, best: 4 }, ask: 'low', note: 'Day four is 3. It is dearer than 1, so the cheapest day does not move, and selling at 3 makes only 2, so best does not move either.' },
        { line: 9, state: { p: 6, low: 1, best: 5 }, ask: 'best', note: 'Day five sells at 6 against the 1, which is 5. One pass, two numbers, and the answer falls out at the end.' },
      ],
      { scene: { kind: 'cells', data: [7, 1, 5, 3, 6], marks: ['p', 'low'] } }),
    spot('A month of nightly takings, in order. Marguerite wants the largest drop from any day to a later day. Dax is drawing a grid of every day against every day after it. What is he carrying that he does not need?',
      ['Nothing. Every pair really has to be compared',
       'The grid. One number for the highest day seen so far is enough, because the largest drop ending today can only start at the highest earlier day',
       'The order of the days. Sort them first and it becomes one pass',
       'The takings themselves. Only how many days there are matters'],
      1, 'Sorting destroys the one thing the question depends on, which day came first, so it cannot be the answer. The count of days tells you nothing about money. And the grid is exactly the waste: for each day there is only one earlier day worth subtracting from, the highest one, and you can carry that as you walk.'),
    blank('“Warm-up before the ticker. Give me the running high: for each day, the best price seen up to and including that day.”',
`def running_max(nums):
    if not nums:
        return []
    best = nums[0]
    out = []
    for n in nums:
        ___
        out.append(best)
    return out`,
`check("running_max([3, 1, 4, 1, 5])", [3, 3, 4, 4, 5])
check("running_max([5, 4, 3])", [5, 5, 5])
check("running_max([2, 2, 2])", [2, 2, 2])
check("running_max([-3, -1, -2])", [-3, -1, -1])
check("running_max([7])", [7])
check("running_max([])", [])`),
    mini('Write longest_run(nums) returning the length of the longest stretch of equal values sitting next to each other. [1, 1, 2, 2, 2, 3] gives 3, and an empty list gives 0. One pass, and do not build a list of the runs.',
      'Carry two numbers: how long the run you are standing in is, and the longest run you have seen. The first resets to 1 the moment a value differs from the one before it.',
`check("longest_run([1, 1, 2, 2, 2, 3])", 3)
check("longest_run([5, 5, 1, 5, 5, 5])", 3)
check("longest_run([4, 4])", 2)
check("longest_run([1, 2, 3])", 1)
check("longest_run([9])", 1)
check("longest_run([])", 0)`),
  ],
})
