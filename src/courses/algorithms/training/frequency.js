import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('frequency', {
  tier: 'F', xp: 50, requires: ['hash-maps'], gates: ['anagram', 'firstuniq', 'majority'],
  tools: ['tool-dict'],
  title: 'The badge letters', algo: 'Counting with a dictionary',
  steps: [
    explain([
      'Halden staff badges spell the holder’s department in a scramble, and the forger has sent back two strings that are supposed to be the same department.',
      'Dax: “Shuffle the first one every way there is until it matches the second.”',
      '“Ten letters is three and a half million shuffles. Eleven is forty million. You will still be here when the vault reseals.”',
    ], { move: 'brute force' }),
    explain([
      '“Shuffling changes the order. So stop looking at the order and look at what survives it: how many of each letter there are.”',
      '“One pass, one box of cards. For each letter, look up its card and add one. If the letter has no card yet, it starts at zero.”',
      '“Two tallies that match, two badges that match. One pass each, and no shuffling at all.”',
    ], { move: 'name the waste', code:
`def counts(s):
    tally = {}
    for ch in s:
        tally[ch] = tally.get(ch, 0) + 1
    return tally`, scene: { kind: 'cells', data: 'tally', init: {}, at: ['ch'], states: [{ ch: 'a', tally: { a: 1 } }, { ch: 'b', tally: { a: 1, b: 1 } }, { ch: 'a', tally: { a: 2, b: 1 } }] } }),
    trace(
`def counts(s):
    tally = {}
    for ch in s:
        tally[ch] = tally.get(ch, 0) + 1
    return tally`,
      "counts('aba')",
      [
        { line: 4, state: { ch: 'a', tally: { a: 1 } }, ask: 'tally', note: "'a' has no card, so tally.get('a', 0) hands back the fallback 0, and one is added to that." },
        { line: 4, state: { ch: 'b', tally: { a: 1, b: 1 } }, ask: 'tally', note: "'b' is new too, so it starts the same way. Cards keep the order they were first filed in." },
        { line: 5, state: { ch: 'a', tally: { a: 2, b: 1 } }, ask: 'tally', note: "The second 'a' finds its card at 1 and makes it 2. Its place in the box does not change, only the number on it." },
      ], { scene: { kind: 'cells', data: 'tally', init: {}, at: ['ch'] } }),
    spot('Two badge strings. Are they the same letters in a different order? Dax wants to try every rearrangement of the first one and compare.',
      ['Try every rearrangement', 'Reverse one of them and compare', 'Count each letter in both and compare the two tallies', 'Compare them character by character'],
      2, 'Every rearrangement is factorial work for a question one pass answers. Reversing and comparing straight through both test the order, and the order is precisely what a scramble is allowed to change: “ab” and “ba” would both fail. The tally is the part the scrambling cannot touch.'),
    blank('“Two badge strings. Same letters, any order, or the forger is off the crew.”',
`def is_anagram(a, b):
    def tally(s):
        t = {}
        for ch in s:
            t[ch] = ___
        return t
    return ___`,
`check("is_anagram('listen', 'silent')", True)
check("is_anagram('ab', 'ba')", True)
check("is_anagram('ab', 'abb')", False)
check("is_anagram('rat', 'car')", False)
check("is_anagram('aab', 'abb')", False)
check("is_anagram('', '')", True)`),
    mini('Write most_common(nums) that returns the value appearing most often in nums. If two values tie, return the smaller one. nums holds at least one value.',
      'Tally first, then walk the tally instead of the list. Deciding the tie is easier if you visit the keys in order.',
`check("most_common([1, 2, 2, 3])", 2)
check("most_common([9, 1, 1, 9, 3])", 1)
check("most_common([4, 4, 7, 7])", 4)
check("most_common([-2, -2, 5])", -2)
check("most_common([5])", 5)`),
  ],
})
