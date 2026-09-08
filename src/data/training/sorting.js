import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('sorting', {
  tier: 'B', xp: 180, requires: ['merging'], gates: ['counting', 'sorts', 'quickselect'],
  tools: ['tool-list'],
  title: 'Serials on the table', algo: 'Insertion sort and partitioning',
  steps: [
    explain([
      'A hundred and twenty notes face up on the training room table, serials showing, because the buyer counts in order or she does not count. Dax picks them up one at a time and slides each into the run he has already built, shunting the bigger ones along to make room.',
      'Dax: “This works. I did a hundred and twenty of them.”',
      '“It works, and it is why you were still at this table at four in the morning. Say out loud what you did. For every note you shifted every note bigger than it one place along. The ones at the far end got shifted a hundred times each.”',
    ], { move: 'brute force' }),
    explain([
      '“The shifting is the work, and the shifting is why sorting by hand costs the square of the pile. Two informants’ timelines merged in a single pass because both halves arrived in order. A pile off a table has no such gift, so the order has to be earned.”',
      '“Two ways to earn it, and both replace shunting with a cut. Halve the pile, order each half, then merge the halves — which is the one-pass move you already know, standing on top of itself. Or pick one note, throw everything smaller to its left and everything bigger to its right, and that note is now in its final place and never moves again.”',
      '“Learn the second cut properly. It is also how you find the twentieth most valuable note without ever putting the pile in order.”',
      '“But first watch the shunting, closely, so you know what you are buying your way out of.”',
    ], { move: 'name the waste', code:
`def insertion_sort(nums):
    for i in range(1, len(nums)):
        x = nums[i]
        j = i - 1
        while j >= 0 and nums[j] > x:
            nums[j + 1] = nums[j]
            j -= 1
        nums[j + 1] = x
    return nums` }),
    trace(
`def insertion_sort(nums):
    for i in range(1, len(nums)):
        x = nums[i]
        j = i - 1
        while j >= 0 and nums[j] > x:
            nums[j + 1] = nums[j]
            j -= 1
        nums[j + 1] = x
    return nums`,
      'insertion_sort([3, 1, 2])',
      [
        { line: 8, state: { i: 1, x: 1, j: -1, nums: [1, 3, 2] }, ask: 'nums', note: 'The 1 was lifted out and held in x, the 3 was shunted one place right, and j walked off the front of the list, which is what tells you the note belongs at position 0. The first two notes are in order and the third has not been touched.' },
        { line: 6, state: { i: 2, x: 2, j: 1, nums: [1, 3, 3] }, ask: 'nums', note: 'Caught mid-shunt. There are two 3s because the 2 was lifted into x first, leaving a hole that the 3 was copied into rather than swapped with. Nothing is lost: the original 2 is safe in x and is about to be written into the hole.' },
        { line: 8, state: { i: 2, x: 2, j: 0, nums: [1, 2, 3] }, ask: 'nums', note: 'j stopped at 0 because 1 is not bigger than 2, so the walk left ended early. Three notes cost three shunts; a hundred and twenty of them, badly ordered, cost about seven thousand. That is the curve Marguerite is pointing at.' },
      ]),
    spot('A hundred thousand staff badges, each carrying a clearance level from 0 to 9, and Marguerite wants them grouped by level with the badge order inside a level left exactly as it was. Dax reaches for the note-shunting routine. What should he reach for instead?',
      ['Insertion, one badge at a time, since a hundred thousand badges are nearly in order anyway',
       'Count how many badges hold each of the ten levels, turn those counts into a starting position per level, then make one pass placing each badge into its block',
       'Pick a badge, throw the lower levels to its left and the higher to its right, and repeat on each side',
       'Compare badges in neighbouring pairs and swap, stopping early on the first pass that swaps nothing'],
      1, 'The pile is not nearly in order, and even if it were, insertion still pays for every shunt. Partitioning around a badge orders a hundred thousand things by comparing them with each other, which is work you never have to do when the keys are ten numbers you could simply count — and the usual partition cheerfully reorders badges that share a level, which the buyer forbade. Bubbling neighbouring pairs is insertion sort with worse manners. Ten counts, ten running totals, one placing pass: no badge is ever compared with another badge at all.'),
    blank('“The cut, on its own. Take the last note in the stretch as the pivot, walk the rest, and keep everything at or below the pivot packed at the left. Then drop the pivot into the gap and tell me the position it landed in.”',
`def partition(nums, lo, hi):
    pivot = nums[hi]
    i = lo
    for j in range(lo, hi):
        if ___:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
    ___
    return i`,
`check("partition([2, 8, 7, 1, 3, 5, 6, 4], 0, 7)", 3)
check("inplace(partition, [2, 8, 7, 1, 3, 5, 6, 4], 0, 7)", [2, 1, 3, 4, 7, 5, 6, 8])
check("partition([3, 1, 2], 0, 2)", 1)
check("inplace(partition, [3, 1, 2], 0, 2)", [1, 2, 3])
check("partition([5, 4, 3, 2, 1], 0, 4)", 0)
check("partition([1, 2, 3], 0, 2)", 2)
check("partition([1], 0, 0)", 0)`),
    mini('Write sort_012(nums) that puts a list holding only the values 0, 1 and 2 into order, in place, and returns None. No sorted() and no .sort(), and do not build a second list.',
      'Three values means three regions and two walls to keep. It is the cut from the blank done twice over, with one pass and one finger.',
`check("inplace(sort_012, [2, 0, 1, 2, 0])", [0, 0, 1, 2, 2])
check("inplace(sort_012, [2, 1, 0])", [0, 1, 2])
check("inplace(sort_012, [1, 1, 0, 2, 1, 0, 2])", [0, 0, 1, 1, 1, 2, 2])
check("inplace(sort_012, [0, 0, 0])", [0, 0, 0])
check("inplace(sort_012, [1])", [1])
check("inplace(sort_012, [])", [])
check("sort_012([1, 0])", None)`),
  ],
})
