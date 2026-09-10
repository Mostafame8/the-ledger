import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('greedy', {
  tier: 'A', xp: 200, requires: ['intervals', 'heaps'], gates: ['task', 'jump', 'timetable', 'epilogue'],
  tools: ['tool-list'],
  title: 'Take the one that ends first', algo: 'Greedy choices',
  steps: [
    explain([
      'The fence has eleven couriers offering to move things for her tonight, each one free for a fixed window and no other. One courier at a time, one van. She wants the most jobs done, not the longest job or the best paid.',
      'Dax: “Eleven windows. Try every combination of them, throw out the ones that clash, keep the biggest set that is left.”',
      '“Two thousand combinations for eleven couriers, and four million for twenty-two. She books thirty a night. There is a rule here and it fits on a beer mat.”',
    ], { move: 'brute force' }),
    explain([
      '“Take the courier who finishes earliest. Not the shortest window, not the earliest to start — the earliest to finish, because finishing early is the only thing that buys you room for the next one.”',
      '“Then forget everything that overlaps what you just took, and ask the same question of what remains. Sort once by end time and one pass down the list does it: hold the time you are free again, and take anything that starts at or after it.”',
      '“This is a bargain and you should know what you paid. One pass, no table, no memory of the choices — and no way back. If the rule is wrong for your problem, one pass down the list will not notice; it will just hand you a wrong answer confidently.”',
      '“Earliest finish is provable here. Whatever the best possible schedule is, swapping its first booking for the earliest-finishing one cannot make it worse, and you can keep doing that swap all the way down. Say that sentence out loud before you ever trust a rule that never looks back.”',
    ], { move: 'pick the pattern', code:
`def max_events(intervals):
    order = sorted(intervals, key=lambda iv: iv[1])
    count = 0
    end = 0
    for s, e in order:
        if s >= end:
            count += 1
            end = e
    return count`, scene: { kind: 'line', axis: [0, 7], lanes: [{ label: 'events', bars: [[1, 4], [2, 3], [3, 5], [5, 6]] }], span: ['s', 'e'], pins: ['end'],
      states: [{ s: 2, e: 3, end: 3 }, { s: 1, e: 4, end: 3 }, { s: 3, e: 5, end: 5 }, { s: 5, e: 6, end: 6 }] } }),
    trace(
`def max_events(intervals):
    order = sorted(intervals, key=lambda iv: iv[1])
    count = 0
    end = 0
    for s, e in order:
        if s >= end:
            count += 1
            end = e
    return count`,
      'max_events([[1, 4], [2, 3], [3, 5], [5, 6]])',
      [
        { line: 8, state: { s: 2, e: 3, count: 1, end: 3 }, ask: 'end', note: 'The sort put [2, 3] first because it finishes soonest, so it is taken first even though [1, 4] starts earlier. end is now the hour the van is free again, and it is the only thing the rest of the pass remembers.' },
        { line: 6, state: { s: 1, e: 4, count: 1, end: 3 }, ask: 'count', note: '[1, 4] starts at 1, which is before 3, so the test fails and the courier is dropped without a second thought. He was the earliest to start and it bought him nothing.' },
        { line: 8, state: { s: 3, e: 5, count: 2, end: 5 }, ask: 'end', note: '3 is exactly when the van comes free, and >= lets a booking begin the moment the last one ends. Had the test been a strict >, this courier would have been refused for touching rather than overlapping.' },
        { line: 7, state: { s: 5, e: 6, count: 3, end: 5 }, ask: 'count', note: 'Third booking accepted, and end has not moved yet — the count goes up first and the free time follows on the next line. Three of the four windows fit, which is the most that could.' },
        { line: 8, state: { s: 5, e: 6, count: 3, end: 6 }, ask: 'end', note: 'One sort and one pass. No combination of couriers was ever written down, nothing was reconsidered, and the answer is provably the best — because of the swapping argument, not because it came out right on this input.' },
      ], { scene: { kind: 'line', axis: [0, 7], lanes: [{ label: 'events', bars: [[1, 4], [2, 3], [3, 5], [5, 6]] }], span: ['s', 'e'], pins: ['end'] } }),
    spot('The fence changes the question: the couriers now quote a fee each, and she wants the most money rather than the most jobs, still one van. Which rule does she use?',
      ['Sort by fee, highest first, and take any courier whose window is still free',
       'Sort by end time and take the earliest finisher, as before; the fees do not change which windows fit',
       'Sort by fee divided by the length of the window and take the best rate first',
       'No greedy rule is safe here. Work along the windows by end time and keep, for each one, the best total achievable up to it — either you take it and add the best total from before its start, or you skip it'],
      3, 'Highest fee first breaks on one fat courier who blocks three lean ones worth more together, and best-rate-first breaks the same way with extra arithmetic. Earliest finish maximises the count, which was a different question; the most jobs and the most money are not the same schedule. There is no beer-mat rule for this one. It needs the choices remembered — take it or leave it, best of the two — which is a table, and a table is the next technique rather than this one. Knowing which of these two a problem is is most of the skill.'),
    blank('“Where the rule does hold: change out of a till. Twenty-fives, tens, fives and ones, biggest first, and you cannot beat it. Take as many of each coin as fit and carry what is left.”',
`def min_coins_greedy(amount, coins):
    used = 0
    for c in coins:
        take = ___
        used += take
        amount = ___
    return used`,
`check("min_coins_greedy(30, [25, 10, 5, 1])", 2)
check("min_coins_greedy(0, [25, 10, 5, 1])", 0)
check("min_coins_greedy(99, [25, 10, 5, 1])", 9)
check("min_coins_greedy(41, [25, 10, 5, 1])", 4)
check("min_coins_greedy(1, [25, 10, 5, 1])", 1)
check("min_coins_greedy(63, [25, 10, 5, 1])", 6)
check("min_coins_greedy(100, [25, 10, 5, 1])", 4)`),
    mini('The fence wants the actual shift list this time, not a headcount. Write kept_shifts(intervals) returning the intervals you keep, as [start, end] pairs, in the order you took them — no two kept ones may overlap, though touching is fine: one may start exactly when another ends. An empty list gives an empty list.',
      'Same rule as always: sort by end time and walk once, holding the time you are free again. This time hold onto the interval itself when you take it, not just a count.',
`check("kept_shifts([[1, 3], [2, 4], [3, 5]])", [[1, 3], [3, 5]])
check("kept_shifts([[1, 2], [2, 3], [3, 4]])", [[1, 2], [2, 3], [3, 4]])
check("kept_shifts([[1, 10], [2, 3], [4, 5]])", [[2, 3], [4, 5]])
check("kept_shifts([])", [])
check("kept_shifts([[5, 6]])", [[5, 6]])
check("kept_shifts([[1, 4], [1, 4], [1, 4]])", [[1, 4]])
check("kept_shifts([[0, 1], [1, 2], [0, 2]])", [[0, 1], [1, 2]])`),
  ],
})
