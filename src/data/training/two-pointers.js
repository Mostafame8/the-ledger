import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('two-pointers', {
  tier: 'F', xp: 60, requires: ['arrays-in-place'], gates: ['palin', 'squares', 'rmdup', 'twoptr'],
  tools: ['tool-list', 'tool-string'],
  title: 'Two hands on the rope', algo: 'Two pointers',
  steps: [
    explain([
      'The fence sent a sorted list of serials and a number. Marguerite wants two serials that add up to it.',
      'Dax: “Check every pair. Done.”',
      '“Ten thousand serials. That is fifty million pairs. Sit down.”',
    ], { move: 'brute force' }),
    explain([
      '“The list is sorted. Put one hand on the smallest and one on the largest. Add them.”',
      '“Too big? The big hand moves left. Too small? The small hand moves right. Every move throws away a whole row of pairs we never have to check.”',
      '“Two hands, one pass. That is the whole trick, and you will use it in a dozen shapes.”',
    ], { move: 'name the waste', code:
`def pair_sum_sorted(nums, target):
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return (i, j)
        if s < target:
            i += 1
        else:
            j -= 1
    return None` }),
    trace(
`def pair_sum_sorted(nums, target):
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return (i, j)
        if s < target:
            i += 1
        else:
            j -= 1
    return None`,
      'pair_sum_sorted([1, 3, 4, 6, 9], 9)',
      [
        { line: 2, state: { i: 0, j: 4 }, ask: 'j', note: 'j starts on the last index, len(nums) - 1.' },
        { line: 4, state: { i: 0, j: 4, s: 10 }, ask: 's', note: 'nums[0] + nums[4] is 1 + 9.' },
        { line: 10, state: { i: 0, j: 3, s: 10 }, ask: 'j', note: '10 is more than 9, so the big hand moves left.' },
        { line: 4, state: { i: 0, j: 3, s: 7 }, ask: 's', note: 'nums[0] + nums[3] is 1 + 6.' },
        { line: 8, state: { i: 1, j: 3, s: 7 }, ask: 'i', note: '7 is less than 9, so the small hand moves right.' },
        { line: 6, state: { i: 1, j: 3, s: 9, returns: { py: '(1, 3)' } }, ask: 'returns', note: '3 + 6 is 9. Return the pair of indices.' },
      ]),
    spot('A sorted list of timestamps. Find whether any two are exactly one hour apart. Which pattern?',
      ['Two pointers walking inward or in step', 'A stack', 'Count every timestamp in a dictionary', 'Try every pair'],
      0, 'Sorted input plus a condition on a pair: two hands. Here both move the same direction, but it is the same idea.'),
    blank('“Finish it. A passphrase reads the same both ways or the fence does not answer. Letters only, already lowercase.”',
`def is_mirror(s):
    i, j = 0, len(s) - 1
    while ___:
        if s[i] != s[j]:
            return False
        ___
    return True`,
`check("is_mirror('abba')", True)
check("is_mirror('abcba')", True)
check("is_mirror('abca')", False)
check("is_mirror('')", True)
check("is_mirror('x')", True)
check("is_mirror('ab')", False)`),
    mini('Write reverse_in_place(nums) that reverses the list in place using two pointers and returns None. No slicing, no reversed(), no .reverse().',
      'One hand at each end. Swap, then both hands step inward until they meet.',
`check("reverse_in_place([1, 2, 3, 4])", lambda: inplace(reverse_in_place, [1, 2, 3, 4]), [4, 3, 2, 1])
check("reverse_in_place([1, 2, 3])", lambda: inplace(reverse_in_place, [1, 2, 3]), [3, 2, 1])
check("reverse_in_place([])", lambda: inplace(reverse_in_place, []), [])
check("reverse_in_place([7])", lambda: inplace(reverse_in_place, [7]), [7])
check("reverse_in_place returns None", lambda: reverse_in_place([1, 2]), None)`),
  ],
})
