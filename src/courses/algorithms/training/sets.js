import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('sets', {
  tier: 'F', xp: 40, requires: ['hash-maps'], gates: ['dupes'],
  tools: ['tool-set'],
  title: 'The guest list', algo: 'Sets for membership',
  steps: [
    explain([
      'The bank’s charity evening has a guest list, and the list was typed by three people who never spoke to each other. Some names are on it twice. One of those doubles is our forged invitation.',
      'Dax: “I check name one against every other name, then name two against every other name.”',
      '“Six hundred guests. That is a hundred and eighty thousand comparisons, and you only need the first repeat.”',
    ], { move: 'brute force' }),
    explain([
      '“A dictionary where you never look at the values is a set. Names go in, and the only question you ever ask it is whether a name is already there.”',
      '“Walk the list once. Before you file a name, ask the set whether it has seen it. The moment it says yes, you are done and the rest of the list does not matter.”',
      '“An empty one is set(), not curly brackets. Curly brackets with nothing between them is an empty dictionary, and that has cost people an evening.”',
    ], { move: 'name the waste', code:
`def has_repeat(nums):
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False`,
      scene: { kind: 'cells', data: [2, 5, 2], marks: ['n'], states: [{ n: 2 }, { n: 5 }, { n: 2 }] },
    }),
    trace(
`def has_repeat(nums):
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False`,
      'has_repeat([2, 5, 2])',
      [
        { line: 6, state: { n: 2, seen: { py: '{2}' } }, ask: 'seen', note: 'Line 4 asked the empty set about 2 and got nothing, so line 6 files it. A set prints inside curly brackets with no colons.' },
        { line: 6, state: { n: 5, seen: { py: '{2, 5}' } }, ask: 'seen', note: '5 was not on the list either, so it goes on. A set holds each name once, so filing never has to check anything first.' },
        { line: 5, state: { n: 2, seen: { py: '{2, 5}' }, returns: true }, ask: 'returns', note: 'The second 2 is already there, so line 5 returns and line 6 never runs. One lookup, and the rest of the list is never touched.' },
      ],
      { scene: { kind: 'cells', data: [2, 5, 2], marks: ['n'] } }),
    spot('A guest list with doubles in it. You need to know whether any name appears twice, and you want to stop on the first one you find.',
      ['Compare every name against every other name', 'Sort the list and look at neighbours', 'Walk it once, keeping a set of the names already seen', 'Count every name in a dictionary first, then scan the counts for one above one'],
      2, 'Every name against every other is n squared. Sorting has to read the whole list and rearrange it before it can say anything. Counting first also reads to the end before it starts looking. Only the set answers on the name you are standing on, which is what stopping early means.'),
    blank('“Give me the list with the doubles dropped, everyone in the order they were typed in.”',
`def unique_in_order(nums):
    seen = set()
    out = []
    for n in nums:
        if ___:
            out.append(n)
            ___
    return out`,
`check("unique_in_order([2, 5, 2, 7, 5])", [2, 5, 7])
check("unique_in_order([3, 2, 1])", [3, 2, 1])
check("unique_in_order([0, 0, 1, 0])", [0, 1])
check("unique_in_order([1, 1, 1])", [1])
check("unique_in_order([])", [])`),
    mini('Write common(a, b) that returns a sorted list of the values that appear in both lists, each value once.',
      'Two sets answer this between them: build one from each list and ask what they have in common. Then put the answer in order, because a set has none.',
`check("common([1, 2, 3], [2, 3, 4])", [2, 3])
check("common([9, 4, 7], [7, 9])", [7, 9])
check("common([5, 5, 1], [1, 5])", [1, 5])
check("common([1], [2])", [])
check("common([], [1, 2])", [])`),
  ],
})
