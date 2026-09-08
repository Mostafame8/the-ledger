import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('monotonic', {
  tier: 'S', xp: 300, requires: ['stacks', 'sliding-window'], gates: ['deque', 'rain'],
  tools: ['tool-stack'],
  title: 'The tallest thing still standing', algo: 'Monotonic stack',
  steps: [
    explain([
      'The lobby camera writes one motion reading a second and the sheet is hours long. For every reading Marguerite wants the next reading after it that is higher — the moment security would have looked up.',
      'Dax: “Take a reading, walk forward until you find a bigger one, write it down. Next reading, same again.”',
      '“That is the whole sheet for every second of the sheet, and on a quiet night — readings drifting down all evening — it is the worst case every single time. Look at what your walk forward does: for reading after reading it steps over the same flat stretch and learns the same nothing.”',
    ], { move: 'brute force' }),
    explain([
      '“Turn it round. Walk the sheet once, forward, and at each new reading ask which of the earlier readings this one answers. It answers every reading still waiting that is shorter than it — and it answers them in order, most recent first.”',
      '“So keep the ones still waiting on a stack, and here is the part that makes it cheap: they are always in decreasing order. A reading that arrives taller knocks off every shorter one and answers it on the way past. A reading that arrives shorter simply joins the pile and waits.”',
      '“That is why nobody looks at anything twice. Each reading is pushed once and popped once. Whatever is left on the stack at the end never found anything taller, and those are the ones that get the minus one.”',
      '“Hold indices on the stack, not readings. The answer has to be written into the right slot of the output, and an index is the only thing that knows which slot that is.”',
    ], { move: 'pick the pattern', code:
`def next_greater(nums):
    out = [-1] * len(nums)
    stack = []
    for i in range(len(nums)):
        while stack and nums[stack[-1]] < nums[i]:
            out[stack.pop()] = nums[i]
        stack.append(i)
    return out` }),
    trace(
`def next_greater(nums):
    out = [-1] * len(nums)
    stack = []
    for i in range(len(nums)):
        while stack and nums[stack[-1]] < nums[i]:
            out[stack.pop()] = nums[i]
        stack.append(i)
    return out`,
      'next_greater([2, 1, 3])',
      [
        { line: 7, state: { nums: [2, 1, 3], i: 0, out: [-1, -1, -1], stack: [0] }, ask: 'stack', note: 'The first reading has nothing behind it to answer, so the while loop does not run and the 2 joins the pile as index 0. Indices on the stack, not readings — remember that when you read the condition on line 5.' },
        { line: 7, state: { nums: [2, 1, 3], i: 1, out: [-1, -1, -1], stack: [0, 1] }, ask: 'stack', note: 'The 1 is shorter than the 2 already waiting, so it answers nothing and joins the pile behind it. Two waiting, and their readings run 2 then 1 — decreasing, which is the invariant the whole method rests on.' },
        { line: 6, state: { nums: [2, 1, 3], i: 2, out: [-1, 3, -1], stack: [0] }, ask: 'out', note: 'The 3 arrives and starts clearing the pile from the top. Index 1 was holding a 1, the 3 beats it, and the answer for slot 1 is written and index 1 is gone for good. The stack is back to just index 0.' },
        { line: 6, state: { nums: [2, 1, 3], i: 2, out: [3, 3, -1], stack: [] }, ask: 'out', note: 'Same reading, second pop: the 3 also beats the 2 at index 0, so slot 0 gets a 3 too. One arrival paid off two waiting readings, and both of them were answered by the first taller thing that came along, which is exactly the definition.' },
        { line: 8, state: { nums: [2, 1, 3], out: [3, 3, -1], stack: [2], returns: [3, 3, -1] }, ask: 'returns', note: 'Index 2 is still on the stack at the end, so nothing taller ever came and its slot keeps the minus one it was seeded with. Three readings, three pushes, two pops — and on a sheet of a million the count is a million pushes and at most a million pops, no matter how the readings drift.' },
      ]),
    spot('Marguerite only cares about the peak reading in each span of k consecutive seconds, and she wants all of them. Which is the least work?',
      ['Keep a heap of the readings in the span, pushing the new one and popping the old one each time the span moves',
       'Recompute the peak of each span from its k readings, but stop early once a reading beats the previous peak',
       'Keep indices in a queue in decreasing order of reading: drop from the front when the front falls out of the span, drop from the back while the back is smaller than the arriving reading, and the front is the peak',
       'Sort each span and take the last value'],
      2, 'Same discipline as the stack, one extra rule. Decreasing order means the front is the peak; a smaller reading arriving cannot ever be the peak while the one in front of it survives, so it may be dropped from the back on sight. The only new thing a span brings is that the peak can expire, and expiry always happens at the front, which is why this needs a queue open at both ends rather than a stack. A heap gets the right answer but cannot delete the reading that left the span without hunting for it, so it carries stale readings and pays a log for every push. Early stopping does not change that recomputing each span is k readings. Sorting each span is worse than recomputing it.'),
    blank('“Write it out. Two pieces missing: the test that says this arrival answers the reading on top of the pile, and the line that pays it off.”',
`def next_greater(nums):
    out = [-1] * len(nums)
    stack = []
    for i in range(len(nums)):
        while stack and ___:
            ___
        stack.append(i)
    return out`,
`check("next_greater([2, 1, 3])", [3, 3, -1])
check("next_greater([1, 2, 3])", [2, 3, -1])
check("next_greater([3, 2, 1])", [-1, -1, -1])
check("next_greater([1, 3, 2, 4])", [3, 4, 4, -1])
check("next_greater([2, 2, 3])", [3, 3, -1])
check("next_greater([5])", [-1])
check("next_greater([])", [])`),
    mini('Write days_until_warmer(temps) returning, for each reading in temps, how many places forward you must look to find a strictly warmer reading. Put a 0 where no later reading is warmer. The answer is a list the same length as temps.',
      'The same single pass over the same pile of indices. The only difference is what gets written into the slot: not the warmer reading itself but the distance between the two indices.',
`check("days_until_warmer([73, 74, 75, 71, 69, 72, 76, 73])", [1, 1, 4, 2, 1, 1, 0, 0])
check("days_until_warmer([30, 40, 50, 60])", [1, 1, 1, 0])
check("days_until_warmer([30, 60, 90])", [1, 1, 0])
check("days_until_warmer([3, 1, 2])", [0, 1, 0])
check("days_until_warmer([5, 5, 5])", [0, 0, 0])
check("days_until_warmer([5])", [0])
check("days_until_warmer([])", [])`),
  ],
})
