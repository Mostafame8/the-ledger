import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('arrays-in-place', {
  tier: 'F', xp: 50, requires: ['loops'], gates: ['zeros', 'rmdup'],
  tools: ['tool-list'],
  title: 'The SIM tray', algo: 'In-place writing with a write pointer',
  steps: [
    explain([
      'The SIM tray from the phone job is back on the table: forty slots, and most of them empty. Marguerite wants the live cards packed at the front, same order.',
      'Dax: “Easy. Second tray. I pick the good ones out of this one and lay them in that one.”',
      '“There is no second tray. There is this tray, and there is a man downstairs who will search you on the way out.”',
    ], { move: 'brute force' }),
    explain([
      '“Two fingers on the same tray. One reads, one writes. The reader walks every slot; the writer only moves when something worth keeping lands under it.”',
      '“The writer is always behind the reader, so you never overwrite a card you have not read yet. When the reader is done, everything from the writer on is dead space.”',
      '“Blank the dead space and hand me the tray. Same tray.”',
    ], { move: 'name the waste', code:
`def fill_front(nums):
    w = 0
    for r in range(len(nums)):
        if nums[r] != 0:
            nums[w] = nums[r]
            w += 1
    while w < len(nums):
        nums[w] = 0
        w += 1
    return nums`,
      scene: { kind: 'cells', data: 'nums', init: [0, 4, 0, 7], pointers: ['r', 'w'], labels: { r: 'reader', w: 'writer' },
        states: [{ r: 0, w: 0, nums: [0, 4, 0, 7] }, { r: 1, w: 1, nums: [4, 4, 0, 7] }, { r: 3, w: 2, nums: [4, 7, 0, 7] }, { r: 3, w: 4, nums: [4, 7, 0, 0] }] },
    }),
    trace(
`def fill_front(nums):
    w = 0
    for r in range(len(nums)):
        if nums[r] != 0:
            nums[w] = nums[r]
            w += 1
    while w < len(nums):
        nums[w] = 0
        w += 1
    return nums`,
      'fill_front([0, 4, 0, 7])',
      [
        { line: 2, state: { w: 0 }, ask: 'w', note: 'The write finger starts at the front of the tray. Nothing has been kept yet.' },
        { line: 6, state: { r: 1, w: 1, nums: [4, 4, 0, 7] }, ask: 'w', note: 'Slot 0 was empty and skipped. The 4 at slot 1 was copied down to slot 0, so the next keeper goes to slot 1. The stale 4 left behind does not matter; it has already been read.' },
        { line: 6, state: { r: 3, w: 2, nums: [4, 7, 0, 7] }, ask: 'w', note: 'Slot 2 was empty. The 7 was copied to slot 1. Two keepers written, so the write finger sits at 2.' },
        { line: 9, state: { r: 3, w: 3, nums: [4, 7, 0, 7] }, ask: 'w', note: 'The reader is finished, so the tail pass blanks slot 2. It already held 0, so the tray looks unchanged, but the write finger still steps on.' },
        { line: 10, state: { r: 3, w: 4, nums: [4, 7, 0, 0] }, ask: 'nums', note: 'The last write blanks slot 3, which was the stale 7. Keepers in order, blanks behind them, one tray.' },
      ],
      { scene: { kind: 'cells', data: 'nums', init: [0, 4, 0, 7], pointers: ['r', 'w'], labels: { r: 'reader', w: 'writer' } } }),
    spot('A tray of card serials with blanks scattered through it. You need the real serials packed at the front in the same order, and you may not allocate a second list. Which move?',
      ['Build a new list of the keepers and return it', 'A read pointer and a write pointer walking the same list', 'Sort the list so the blanks fall to the end', 'Delete each blank from the list as you find it'],
      1, 'A new list is exactly the thing you were told you cannot have. Sorting scrambles the order you were told to keep. Deleting inside a loop shifts every item after it down one, so you pay for each blank twice and the shift makes you skip the item that slid into the hole. One reader, one writer, one pass.'),
    blank('“Warm-up. Swap the first card with the last one. In the tray, not in a copy of it, and hand nothing back.”',
`def swap_ends(nums):
    if len(nums) < 2:
        return None
    ___
    return None`,
`check("swap_ends([1, 2, 3])", lambda: inplace(swap_ends, [1, 2, 3]), [3, 2, 1])
check("swap_ends([4, 5, 6, 7])", lambda: inplace(swap_ends, [4, 5, 6, 7]), [7, 5, 6, 4])
check("swap_ends([1, 2])", lambda: inplace(swap_ends, [1, 2]), [2, 1])
check("swap_ends([9])", lambda: inplace(swap_ends, [9]), [9])
check("swap_ends([])", lambda: inplace(swap_ends, []), [])
check("swap_ends returns None", lambda: swap_ends([1, 2]), None)`),
    mini('Write move_negatives_back(nums) that rearranges nums so every value below zero sits after every value zero or above. Both groups keep their original order. Change the list in place and return None. Marguerite, grudgingly: “Tonight you may use one small side tray for the negatives, but the positives move with the same one-finger write pointer, in order, on the original tray.”',
      'Two passes over one tray: walk once writing the positives forward with the pointer, then lay the set-aside negatives into the slots left behind.',
`check("move_negatives_back([1, -2, 3, -4])", lambda: inplace(move_negatives_back, [1, -2, 3, -4]), [1, 3, -2, -4])
check("move_negatives_back([0, -1, 0])", lambda: inplace(move_negatives_back, [0, -1, 0]), [0, 0, -1])
check("move_negatives_back([5, 6])", lambda: inplace(move_negatives_back, [5, 6]), [5, 6])
check("move_negatives_back([-1, -2])", lambda: inplace(move_negatives_back, [-1, -2]), [-1, -2])
check("move_negatives_back([])", lambda: inplace(move_negatives_back, []), [])
check("move_negatives_back returns None", lambda: move_negatives_back([1, -1]), None)`),
  ],
})
