import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('rotation', {
  tier: 'E', xp: 60, requires: ['arrays-in-place'], gates: ['rotate'],
  tools: ['tool-list'],
  title: 'The rota, shifted', algo: 'Rotation by reversal',
  steps: [
    explain([
      'Halden shifts the guard rota every Monday: the last k names move to the front and everyone else slides back. Marguerite wants the shifted rota written on the same sheet, because the sheet is the one she stole and she has to put it back.',
      'Dax: “Lift the last name off, write it at the front, push everyone down one. Do that k times.”',
      '“Each of those k moves walks the whole sheet. Fourteen names shifted by ten is a hundred and forty writes for a job that needs twenty-eight.”',
    ], { move: 'brute force' }),
    explain([
      '“Reversing a stretch of the sheet in place costs one swap per pair and not a line of paper more. So reverse three times.”',
      '“Reverse the whole rota. The last k names are now at the front, backwards, and the rest are behind them, also backwards. Reverse the first k, then reverse the rest, and both halves come out the right way round.”',
      '“Three reversals, one sheet, no copy. Draw it once on a napkin and it stops being a trick.”',
    ], { move: 'pick the pattern', code:
`def reverse_range(nums, i, j):
    while i < j:
        nums[i], nums[j] = nums[j], nums[i]
        i += 1
        j -= 1` }),
    trace(
`def reverse_range(nums, i, j):
    while i < j:
        nums[i], nums[j] = nums[j], nums[i]
        i += 1
        j -= 1`,
      'reverse_range([1, 2, 3, 4, 5], 0, 4)',
      [
        { line: 3, state: { i: 0, j: 4, nums: [5, 2, 3, 4, 1] }, ask: 'nums', note: 'The two ends trade places in one statement. i and j have not moved yet; that happens on the next two lines.' },
        { line: 3, state: { i: 1, j: 3, nums: [5, 4, 3, 2, 1] }, ask: 'nums', note: 'Second swap, one step in from each end. Two swaps have already reversed four of the five names.' },
        { line: 5, state: { i: 2, j: 2, nums: [5, 4, 3, 2, 1] }, ask: 'nums', note: 'The hands have met on the middle name, which never needed to move. i is no longer under j, so the loop stops and the sheet is reversed in two swaps.' },
      ]),
    spot('The rota must shift right by k, on the sheet itself, with no second sheet and no room to build one. Dax has his k pops and pushes ready. What replaces them?',
      ['Reverse the whole sheet, then reverse the first k names, then reverse the rest',
       'Sort the names and the shift falls out of the ordering',
       'Build nums[-k:] + nums[:-k] and hand that back',
       'Swap the first k names with the last k names'],
      0, 'Sorting has nothing to do with the question and destroys the rota order you were asked to shift. The slice is correct but it allocates exactly the second sheet you were told you do not have. Swapping the first k with the last k only lands right when k is half the rota, and leaves the middle in the wrong place otherwise. Three reversals, one sheet.'),
    blank('“Three reversals. I have written the reverser for you; you tell me which stretch each pass covers. k may be larger than the rota, and the rota may be empty. Change the sheet and hand nothing back.”',
`def reverse_range(nums, i, j):
    while i < j:
        nums[i], nums[j] = nums[j], nums[i]
        i += 1
        j -= 1

def rotate_right(nums, k):
    n = len(nums)
    if n == 0:
        return None
    k = k % n
    reverse_range(nums, ___)
    reverse_range(nums, ___)
    reverse_range(nums, ___)
    return None`,
`check("rotate_right([1, 2, 3, 4, 5, 6, 7], 3)", lambda: inplace(rotate_right, [1, 2, 3, 4, 5, 6, 7], 3), [5, 6, 7, 1, 2, 3, 4])
check("rotate_right([1, 2], 3)", lambda: inplace(rotate_right, [1, 2], 3), [2, 1])
check("rotate_right([1, 2, 3], 0)", lambda: inplace(rotate_right, [1, 2, 3], 0), [1, 2, 3])
check("rotate_right([1, 2, 3], 3)", lambda: inplace(rotate_right, [1, 2, 3], 3), [1, 2, 3])
check("rotate_right([7], 5)", lambda: inplace(rotate_right, [7], 5), [7])
check("rotate_right([], 2)", lambda: inplace(rotate_right, [], 2), [])
check("rotate_right returns None", lambda: rotate_right([1, 2], 1), None)`),
    mini('Write rotate_left_string(s, k) returning s rotated left by k places, so rotate_left_string("abcdef", 2) is "cdefab". k may be larger than the string, and the string may be empty. Marguerite: “A string does not bend, so tonight you may cut and paste. The reversal is for the sheet, not for the word, and you should be able to say why.”',
      'Rotating left by k puts the character at index k first. Fold k down against the length before you do anything, then work out where the single cut falls.',
`check("rotate_left_string('abcdef', 2)", 'cdefab')
check("rotate_left_string('abc', 3)", 'abc')
check("rotate_left_string('abc', 4)", 'bca')
check("rotate_left_string('abcd', 0)", 'abcd')
check("rotate_left_string('x', 1)", 'x')
check("rotate_left_string('', 3)", '')`),
  ],
})
