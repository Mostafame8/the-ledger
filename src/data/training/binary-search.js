import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('binary-search', {
  tier: 'E', xp: 80, requires: ['tracking'], gates: ['halden', 'firstbad', 'rotsearch'],
  tools: ['tool-list'],
  title: 'The numbered boxes', algo: 'Binary search',
  steps: [
    explain([
      'Halden keeps deposit boxes in a wall, a thousand of them, ordered by the serial stamped inside. Marguerite needs the box holding one particular serial. Opening a box takes eleven seconds and leaves a scratch on the plate.',
      'Dax: “Box one. Then box two. I will get there.”',
      '“Nine hundred scratches and three hours of it. The guard is back in twenty minutes.”',
    ], { move: 'brute force' }),
    explain([
      '“The wall is in order, and you keep refusing to spend that. Open the box in the middle. If the serial inside is too low, every box left of it is too low as well, and you never touch any of them again.”',
      '“One look throws away half the wall. Ten looks walks a thousand boxes. Twenty walks a million, and the guard never knows you were there.”',
      '“Carry two numbers: the lowest box still worth opening and the highest. Squeeze them together until they cross.”',
    ], { move: 'name the waste', code:
`def find(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
      scene: { kind: 'cells', data: [1, 3, 5, 7, 9, 11], pointers: ['lo', 'hi', 'mid'], ranges: [['lo', 'hi']],
        states: [{ lo: 0, hi: 5 }, { lo: 0, hi: 5, mid: 2 }, { lo: 3, hi: 5 }, { lo: 3, hi: 5, mid: 4 }] },
    }),
    trace(
`def find(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
      'find([1, 3, 5, 7, 9, 11], 9)',
      [
        { line: 2, state: { lo: 0, hi: 5 }, ask: 'hi', note: 'The window starts as the whole wall, and hi is the last index, not the length. Six boxes means indices 0 through 5.' },
        { line: 4, state: { lo: 0, hi: 5, mid: 2 }, ask: 'mid', note: 'Integer division puts the probe at 2, the left of the two middles. Either middle works; be consistent.' },
        { line: 8, state: { lo: 3, hi: 5, mid: 2 }, ask: 'lo', note: 'Box 2 holds 5, which is under 9, so 9 cannot be at index 2 or to its left. lo jumps past mid and three boxes are gone in one look.' },
        { line: 4, state: { lo: 3, hi: 5, mid: 4 }, ask: 'mid', note: 'The window is now indices 3 to 5, so the probe lands at 4.' },
        { line: 6, state: { lo: 3, hi: 5, mid: 4, returns: 4 }, ask: 'returns', note: 'Box 4 holds 9. Two openings for six boxes, and the same two openings would have handled seven.' },
      ],
      { scene: { kind: 'cells', data: [1, 3, 5, 7, 9, 11], pointers: ['lo', 'hi', 'mid'], ranges: [['lo', 'hi']] } }),
    spot('A thousand boxes in serial order, and opening one is the expensive part. You need the single box holding one serial. Which plan costs the fewest openings?',
      ['Open the middle box, throw away the half that cannot hold the serial, and repeat',
       'Open every second box, then back up one when you overshoot',
       'Open all thousand once and file the serials in a dictionary, then look the serial up',
       'Open from both ends inward until the two hands meet'],
      0, 'Every second box is still five hundred openings and it can step straight over the one you want. The dictionary costs all thousand up front to answer one question, and you would have to pay it again next week when the wall changes. Two hands inward is the whole wall in the worst case. Only halving turns a thousand boxes into ten openings.'),
    blank('“Same wall, different question. The lobby camera firmware went bad at some version and stayed bad, so this list is False while it was fine and True from the fault onward. Give me the first index that is True, or -1 if none of it is.”',
`def first_true(flags):
    lo, hi = 0, len(flags) - 1
    ans = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if ___:
            ans = mid
            ___
        else:
            lo = mid + 1
    return ans`,
`check("first_true([False, False, True, True])", 2)
check("first_true([False, True])", 1)
check("first_true([True, True])", 0)
check("first_true([True])", 0)
check("first_true([False, False])", -1)
check("first_true([False])", -1)
check("first_true([])", -1)`),
    mini('Write insert_position(nums, target) returning the index of target in the sorted list nums, or, if it is not there, the index it would have to be inserted at to keep nums sorted. insert_position([1, 3, 5, 6], 2) is 1 and insert_position([1, 3, 5, 6], 7) is 4. Use the halving search, not a scan, and no bisect module.',
      'Squeeze lo and hi as usual, but stop asking whether you have found it. Let hi be one past the window instead of inside it, and when the window closes to nothing, lo is standing on the answer.',
`check("insert_position([1, 3, 5, 6], 5)", 2)
check("insert_position([1, 3, 5, 6], 2)", 1)
check("insert_position([1, 3, 5, 6], 7)", 4)
check("insert_position([1, 3, 5, 6], 0)", 0)
check("insert_position([2], 2)", 0)
check("insert_position([], 5)", 0)`),
  ],
})
