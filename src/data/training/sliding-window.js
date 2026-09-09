import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('sliding-window', {
  tier: 'D', xp: 90, requires: ['two-pointers', 'tracking'], gates: ['window', 'minsub'],
  tools: ['tool-list', 'tool-string'],
  title: 'Three seconds of tape', algo: 'Sliding window',
  steps: [
    explain([
      'The lobby camera keeps a rolling window of tape and nothing more: the last three seconds, then the oldest second is written over. Marguerite has the crossing counts second by second and wants the three seconds in which the most people walked the floor.',
      'Dax: “Add up every three in a row. There are only a few hundred seconds of it.”',
      '“Three additions a window, and you are about to do it for every second of tape. Now make it a sixty-second window and tell me again how small the job is.”',
    ], { move: 'brute force' }),
    explain([
      '“Two windows sitting next to each other share everything but their two ends. One second drops off the left, one second joins on the right. All the middle you are adding up again has not changed since the last time you added it up.”',
      '“So do not rebuild. Add the newcomer, subtract the leaver, and the total is correct again. One addition and one subtraction per step, whether the window is three seconds or six hundred.”',
      '“You have both halves of this already: two hands on the same list, and one number in your pocket for the best so far. Build the first window the slow way, once, and after that the window slides.”',
    ], { move: 'name the waste', code:
`def max_window_sum(nums, k):
    s = sum(nums[:k])
    best = s
    for r in range(k, len(nums)):
        s += nums[r] - nums[r - k]
        if s > best:
            best = s
    return best`,
      scene: { kind: 'cells', data: [2, 1, 5, 1, 3], pointers: ['r'], ranges: [{ end: 'r', width: 3 }],
        states: [{ r: 2 }, { r: 3 }, { r: 4 }] },
    }),
    trace(
`def max_window_sum(nums, k):
    s = sum(nums[:k])
    best = s
    for r in range(k, len(nums)):
        s += nums[r] - nums[r - k]
        if s > best:
            best = s
    return best`,
      'max_window_sum([2, 1, 5, 1, 3], 3)',
      [
        { line: 2, state: { s: 8 }, ask: 's', note: 'The first window is the only one you pay full price for: 2 + 1 + 5. Everything after this is one addition and one subtraction.' },
        { line: 3, state: { s: 8, best: 8 }, ask: 'best', note: 'The best so far is the only window you have seen. Starting best at zero would be wrong here, because crossing counts could all be negative in some other list.' },
        { line: 5, state: { r: 3, s: 7, best: 8 }, ask: 's', note: 'The window slid to seconds 1, 2 and 3. nums[3] is 1 and joins; nums[0] is 2 and leaves. 8 + 1 - 2 is 7, and the shared 1 and 5 in the middle were never touched.' },
        { line: 5, state: { r: 4, s: 9, best: 8 }, ask: 's', note: 'Slide again: 3 joins, 1 leaves, so 7 + 3 - 1 is 9. Note that best is still 8 on this line; the comparison has not happened yet.' },
        { line: 7, state: { r: 4, s: 9, best: 9 }, ask: 'best', note: '9 beats 8, so the pocket number moves. Three windows, five additions in total instead of nine, and the gap only widens as the window grows.' },
      ],
      { scene: { kind: 'cells', data: [2, 1, 5, 1, 3], pointers: ['r'], ranges: [{ end: 'r', width: 3 }] } }),
    spot('Ninety seconds of crossing counts, and Marguerite wants the busiest stretch of exactly ten consecutive seconds. Dax is adding up each ten-second stretch from scratch. Name the waste.',
      ['There is none. Each stretch is a different stretch and has to be added up',
       'Nine of the ten seconds are shared with the stretch before it, so add the second joining on the right, subtract the one leaving on the left, and each step costs two operations instead of ten',
       'Sort the seconds and take the ten largest',
       'File every second in a dictionary first, then read the stretches off it'],
      1, 'The ten largest seconds almost certainly are not next to each other, and the question asks for ten in a row, so sorting answers a different question. A dictionary gives you lookup by second, which nobody asked for, and it costs a pass over the tape to build. And the stretches really are different stretches, but they overlap by nine tenths: paying for that overlap ten times is the waste.'),
    blank('“Same window, and now it changes size as it goes. Here is a run of camera IDs across the floor, one letter each. Give me the length of the longest stretch with no ID appearing twice. seen holds the last position each ID was seen at.”',
`def longest_no_repeat(s):
    seen = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ___:
            left = seen[ch] + 1
        seen[ch] = right
        ___
    return best`,
`check("longest_no_repeat('abcabcbb')", 3)
check("longest_no_repeat('bbbbb')", 1)
check("longest_no_repeat('pwwkew')", 3)
check("longest_no_repeat('tmmzuxt')", 5)
check("longest_no_repeat('abcde')", 5)
check("longest_no_repeat('a')", 1)
check("longest_no_repeat('')", 0)`),
    mini('Write count_windows_over(nums, k, limit) returning how many stretches of exactly k consecutive values in nums have a sum strictly greater than limit. Slide the window; do not add each stretch up from scratch. If nums holds fewer than k values there is no such stretch, so return 0.',
      'Build the first k the slow way and count it if it qualifies. After that each step adds the value joining on the right, subtracts the one leaving on the left, and asks the same question again.',
`check("count_windows_over([2, 1, 5, 1, 3], 3, 7)", 2)
check("count_windows_over([1, 2, 3, 4], 2, 4)", 2)
check("count_windows_over([4, 4, 4], 1, 3)", 3)
check("count_windows_over([1, 1, 1], 2, 5)", 0)
check("count_windows_over([10], 1, 0)", 1)
check("count_windows_over([1, 2], 5, 0)", 0)
check("count_windows_over([], 1, 0)", 0)`),
  ],
})
