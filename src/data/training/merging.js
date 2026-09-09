import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('merging', {
  tier: 'E', xp: 70, requires: ['two-pointers'], gates: ['merge', 'mergell'],
  tools: ['tool-list'],
  title: 'Two informants, one timeline', algo: 'Merging sorted lists',
  steps: [
    explain([
      'Two informants watched the loading bay from different windows, and each wrote down the times a van pulled in. Two lists, and each one is already in order, because each of them wrote as it happened.',
      'Dax: “Stack them together and sort the pile.”',
      '“You would be paying to learn something you were handed for free. Both halves are already in order. Sorting throws that away and then buys it back.”',
    ], { move: 'brute force' }),
    explain([
      '“A finger on the front of each list. Whichever time is earlier goes out first, and only that finger steps forward. Nothing else moves, nothing gets compared twice.”',
      '“When one list runs dry the other is already in order, so tip the rest of it straight into the timeline without looking at it.”',
      '“Every entry is read once. Two lists in, one timeline out, and you never sorted anything.”',
    ], { move: 'pick the pattern', code:
`def merge(a, b):
    i, j = 0, 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i])
            i += 1
        else:
            out.append(b[j])
            j += 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out`,
      scene: { kind: 'rows', rows: [
        { label: 'a', data: [1, 4], pointers: ['i'] },
        { label: 'b', data: [2, 3], pointers: ['j'] },
        { label: 'out', data: 'out', init: [] },
      ], states: [{ i: 0, j: 0, out: [] }, { i: 1, j: 0, out: [1] }, { i: 1, j: 1, out: [1, 2] }, { i: 1, j: 2, out: [1, 2, 3] }, { i: 2, j: 2, out: [1, 2, 3, 4] }] },
    }),
    trace(
`def merge(a, b):
    i, j = 0, 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i])
            i += 1
        else:
            out.append(b[j])
            j += 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out`,
      'merge([1, 4], [2, 3])',
      [
        { line: 6, state: { i: 0, j: 0, out: [1] }, ask: 'out', note: 'Both fingers are at the front. 1 is not after 2, so the first list gives up its entry. i steps forward on the next line, not this one.' },
        { line: 9, state: { i: 1, j: 0, out: [1, 2] }, ask: 'out', note: 'Now the fronts are 4 and 2. The second list is earlier, so it goes out and its finger is the one that will move.' },
        { line: 9, state: { i: 1, j: 1, out: [1, 2, 3] }, ask: 'out', note: '4 against 3: the second list wins again. Two entries out of the same list in a row is normal; the fingers do not take turns.' },
        { line: 11, state: { i: 1, j: 2, out: [1, 2, 3, 4] }, ask: 'out', note: 'The second list is spent, so the loop stops and the tail of the first list is tipped out whole. Line 12 then adds nothing, because b has nothing left.' },
      ],
      { scene: { kind: 'rows', rows: [
        { label: 'a', data: [1, 4], pointers: ['i'] },
        { label: 'b', data: [2, 3], pointers: ['j'] },
        { label: 'out', data: 'out', init: [] },
      ] } }),
    spot('Two sorted sighting logs, ten thousand entries each. Dax joins them into one list of twenty thousand and calls sorted() on it. Name the waste.',
      ['There is none. sorted() is written in C and cannot be beaten',
       'Sorting rediscovers an order you were handed. Walking the two fronts and taking the earlier one costs one pass over each list instead of a sort of the whole pile',
       'The joining is the expensive part. Sort each list first, then join them',
       'The logs should be filed in a dictionary keyed by timestamp'],
      1, 'Sorting the pile does more work than the answer needs no matter how fast the sort is written, because it compares entries whose order you already knew. Sorting each half again is work on lists that are already sorted. A dictionary keyed by timestamp gives you lookup, which nobody asked for, and no order at all. One pass down each list is the floor: you have to read every entry once, and this reads every entry exactly once.'),
    blank('“Same shape, your hands this time. Compare the two fronts, and when one list runs out do not loop over what is left of the other.”',
`def merge_sorted(a, b):
    i, j = 0, 0
    out = []
    while i < len(a) and j < len(b):
        if ___:
            out.append(a[i])
            i += 1
        else:
            out.append(b[j])
            j += 1
    ___
    return out`,
`check("merge_sorted([1, 4], [2, 3])", [1, 2, 3, 4])
check("merge_sorted([1, 2], [3, 4])", [1, 2, 3, 4])
check("merge_sorted([3, 4], [1, 2])", [1, 2, 3, 4])
check("merge_sorted([1, 1], [1])", [1, 1, 1])
check("merge_sorted([], [1, 2])", [1, 2])
check("merge_sorted([5], [])", [5])
check("merge_sorted([], [])", [])`),
    mini('Write merge_three(a, b, c) returning one sorted list holding everything from three lists that are each already sorted. Merge two at a time; sorted() and .sort() are off the table. Any of the three may be empty.',
      'You already have the two-list merge. Write it as its own function, merge the first two lists, then merge that result with the third.',
`check("merge_three([1, 4], [2, 3], [0, 5])", [0, 1, 2, 3, 4, 5])
check("merge_three([1, 2], [1, 2], [1, 2])", [1, 1, 1, 2, 2, 2])
check("merge_three([], [3], [1, 2])", [1, 2, 3])
check("merge_three([9], [8], [7])", [7, 8, 9])
check("merge_three([1], [], [])", [1])
check("merge_three([], [], [])", [])`),
  ],
})
