import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('hash-maps', {
  tier: 'F', xp: 50, requires: ['loops'], gates: ['twosum', 'anagram', 'firstuniq'],
  title: 'The index card box', algo: 'Dictionaries for lookup',
  steps: [
    explain([
      'Two hundred names on the informant sheet, and Marguerite has forty questions about them. Dax answers each one by starting at the top of the sheet and reading down.',
      'Dax: “Give me the next name. I will find it.”',
      '“You have read that sheet nine times this morning. Eight thousand lines to answer nine questions.”',
    ], { move: 'brute force' }),
    explain([
      'She puts a shoebox of index cards on the table, one name to a card, filed.',
      '“Read the sheet once. Write a card for each name as you go. After that a question costs you one card, not two hundred lines.”',
      '“The box does not care how big the sheet is. That is the whole reason it exists.”',
    ], { move: 'name the waste', code:
`def index_of_first(nums):
    seen = {}
    for i, n in enumerate(nums):
        if n not in seen:
            seen[n] = i
    return seen` }),
    trace(
`def index_of_first(nums):
    seen = {}
    for i, n in enumerate(nums):
        if n not in seen:
            seen[n] = i
    return seen`,
      'index_of_first([4, 7, 4])',
      [
        { line: 5, state: { i: 0, n: 4, seen: { py: '{4: 0}' } }, ask: 'seen', note: 'The first 4 sits at index 0, so that is what goes on its card. The key is the value, the value is where it was found.' },
        { line: 5, state: { i: 1, n: 7, seen: { py: '{4: 0, 7: 1}' } }, ask: 'seen', note: '7 has no card yet, so it gets one. Cards keep the order they were filed in.' },
        { line: 6, state: { i: 2, n: 4, seen: { py: '{4: 0, 7: 1}' } }, ask: 'seen', note: 'The second 4 already has a card, and line 4 guards against overwriting it, so the box is unchanged. Two cards for three values, and the sheet was read once.' },
      ]),
    spot('Dax has a sheet of two hundred informants and a stack of questions, each one asking whether a given name is on the sheet. He reads the sheet from the top for every question. Name the fix.',
      ['Read the sheet backwards', 'Sort the sheet first', 'File every name in a dictionary once, then answer each question with one lookup', 'Ask fewer questions'],
      2, 'Reading backwards is the same work in the other direction. Sorting is closer but still costs a sort up front and a search per question. Fewer questions is not an answer, it is a smaller problem. Build the box once and every question after that costs the same whether the sheet holds two hundred names or two million.'),
    blank('“Fence job. Two serials on this list have to add up to the number she quoted. Give me where they are, not what they are.”',
`def pair_with_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        need = target - n
        if ___:
            return (seen[need], i)
        ___
    return None`,
`check("pair_with_sum([2, 7, 11], 9)", (0, 1))
check("pair_with_sum([3, 2, 4], 6)", (1, 2))
check("pair_with_sum([3, 3], 6)", (0, 1))
check("pair_with_sum([1, 2], 99)", None)
check("pair_with_sum([5], 5)", None)
check("pair_with_sum([], 0)", None)`),
    mini('Write first_repeat(nums) that returns the first value you meet twice while reading nums left to right, or None if every value is different.',
      'File each value as you pass it. The answer is the first value that already has a card when you reach it, so you can stop the moment that happens.',
`check("first_repeat([4, 7, 4, 7])", 4)
check("first_repeat([5, 1, 2, 1, 5])", 1)
check("first_repeat([9, 9])", 9)
check("first_repeat([1, 2, 3])", None)
check("first_repeat([])", None)`),
  ],
})
