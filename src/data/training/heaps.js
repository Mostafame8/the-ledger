import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('heaps', {
  tier: 'B', xp: 170, requires: ['tracking'], gates: ['heap', 'meetings', 'task'],
  tools: ['tool-heap'],
  title: 'The short list', algo: 'Heaps',
  steps: [
    explain([
      'Dax is walking the vault in his head, naming things and what each one is worth. The bag holds two. He wants, at every moment, the two best things named so far, and he is going to keep naming things.',
      'Dax: “Every time I say a number, sort the whole list again and read the top two off it.”',
      '“You said four hundred numbers last time. That is four hundred sorts of a list that keeps growing, to answer a question about two of them. You are paying for the order of every item you were never going to carry.”',
    ], { move: 'brute force' }),
    explain([
      '“You do not need the list in order. You need one thing out of it: the worse of the two you are holding, because that is the only one a newcomer has to beat.”',
      '“That is what a heap is. A list that keeps one promise and no more — whatever sits at the front is the smallest thing in it. Nothing else is promised, so the rest sits in whatever order the promise permitted, and it will look shuffled to you.”',
      '“Pushing is cheap and taking the front is cheap, and they are cheap precisely because the promise is small. Hold two, push the newcomer, and if you are suddenly holding three, throw the front away. The front is the worst of them, by the promise.”',
      '“heapq does this to an ordinary Python list. Read the list afterwards and you will swear it is unsorted. It is. It is a tree lying down: every item smaller than the two beneath it, and no opinion at all about left against right.”',
    ], { move: 'pick the pattern', code:
`import heapq

def two_largest(nums):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > 2:
            heapq.heappop(heap)
    return sorted(heap, reverse=True)` }),
    trace(
`import heapq

def two_largest(nums):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > 2:
            heapq.heappop(heap)
    return sorted(heap, reverse=True)`,
      'two_largest([5, 1, 4])',
      [
        { line: 6, state: { x: 5, heap: [5] }, ask: 'heap', note: 'One item, and it is trivially the smallest thing in the list, so the promise holds without any work. Nothing is thrown away yet: the bag is not full.' },
        { line: 6, state: { x: 1, heap: [1, 5] }, ask: 'heap', note: 'A push drops the newcomer on the end of the list and then walks it up past any parent bigger than it. 1 is smaller than 5, so it climbed to the front. The list now reads front-first, not sorted-first — the difference has not shown yet with only two items.' },
        { line: 6, state: { x: 4, heap: [1, 5, 4] }, ask: 'heap', note: 'Here is the difference. 4 landed as the second child of 1, compared itself with its parent, found 1 smaller and stopped. It never met the 5, and it never had to: the promise only ever concerns a parent and its children, which is exactly why a push is cheap.' },
        { line: 8, state: { x: 4, heap: [4, 5] }, ask: 'heap', note: 'Three items is one too many, so the front goes. Popping lifts the last item into the hole and walks it back down, which leaves [4, 5] — still not sorted by luck, just legal. The 1 was the worst of the three and it is the one that left.' },
        { line: 9, state: { x: 4, heap: [4, 5], returns: [5, 4] }, ask: 'returns', note: 'Two hundred more numbers would each cost one push and one pop of a two-item list, not a sort of two hundred. The last line sorts two things because a heap was never sorted, and sorting two things is not a cost worth naming.' },
      ]),
    spot('Ten thousand items come past one at a time, and at the end Marguerite wants the twenty most valuable. Which of these holds the least and does the least?',
      ['Keep all ten thousand, sort them at the end, read off the top twenty',
       'Push all ten thousand into one heap and take twenty off the front at the end',
       'Keep the twenty in a plain list held in order, inserting each newcomer into its place',
       'Keep a heap of the twenty best so far with the worst of them at the front: push each newcomer, and drop the front whenever you are holding twenty-one'],
      3, 'Sorting ten thousand to keep twenty pays for the order of nine thousand nine hundred and eighty items nobody will carry, and it cannot answer anything until the last item is in. One heap of ten thousand has the same appetite for memory and the same ten thousand pushes. Inserting into a list of twenty is respectable until you count the shifting along it does on every insert. Twenty in a heap, worst at the front: one comparison rejects a dud, the memory never grows, and the answer is correct at every moment rather than only at the end.'),
    blank('“Turn it round. The k smallest values this time, in order, and you are still only allowed to hold k of them. A heap hands you its smallest, so store the negatives and its front becomes the largest thing you are holding — the one to throw out.”',
`import heapq

def k_smallest(nums, k):
    heap = []
    for x in nums:
        ___
        if len(heap) > k:
            ___
    return sorted(-v for v in heap)`,
`check("k_smallest([5, 1, 4, 2], 2)", [1, 2])
check("k_smallest([3, 1, 2], 3)", [1, 2, 3])
check("k_smallest([4, 4, 1], 2)", [1, 4])
check("k_smallest([-1, -5, 3], 2)", [-5, -1])
check("k_smallest([7], 1)", [7])
check("k_smallest([9, 8, 7, 6], 0)", [])`),
    mini('Write k_closest(nums, x, k) returning the k values from nums that sit closest to x, in ascending order. When two values are the same distance from x, the smaller value wins. Hold at most k of them at a time.',
      'The thing you sort by is not the value, it is how far the value is from x, with the value itself as the tie-breaker. A heap can hold a pair as easily as a number, as long as the part you want it to judge comes first.',
`check("k_closest([1, 2, 3, 4, 5], 3, 2)", [2, 3])
check("k_closest([1, 2, 3, 4, 5], 3, 3)", [2, 3, 4])
check("k_closest([1, 3], 2, 1)", [1])
check("k_closest([2, 4, 6, 8], 5, 2)", [4, 6])
check("k_closest([1, 2, 3], 10, 2)", [2, 3])
check("k_closest([4], 0, 1)", [4])
check("k_closest([1, 2, 3], 2, 0)", [])`),
  ],
})
