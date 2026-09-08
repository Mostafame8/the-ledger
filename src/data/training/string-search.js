import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('string-search', {
  tier: 'S', xp: 320, requires: ['strings'], gates: ['kmp', 'palsub'],
  title: 'A word already half heard', algo: 'Prefix tables',
  steps: [
    explain([
      'Hours of characters off the tapped line, and somewhere in them a code word repeats. Every time it does, a payment moved. Marguerite wants every position it starts at.',
      'Dax: “Line the word up at the first character. If it fails, slide it along one and start the word again.”',
      '“Start the word again is the waste, and it is not small. Slide along one and you re-read characters you read a moment ago, so the tape pointer goes backwards — on a bad tape, once for every character of the word, for every character of the tape.”',
    ], { move: 'brute force' }),
    explain([
      '“When the word fails, you are not ignorant. You know exactly which characters of the tape you just matched, because they are the front of the word. So the only question left is how far the word may slide before it could possibly fit again — and that depends on the word alone, not on the tape.”',
      '“Ask it of the word once, before the tape is touched. For each length of the word’s front, how long is the longest stretch that is both a front of it and a back of it. Where the fronts and backs overlap, a slide is allowed to keep that much and carry on; where they do not, the whole thing starts over.”',
      '“Build it by matching the word against itself. Walk the word from its second character with a counter holding how much currently matches, extend the counter when the characters agree, and when they disagree fall the counter back to the answer already written for a shorter front — which is the table using itself, one step behind.”',
      '“With that table in hand the tape pointer never moves backwards. Each character of the tape is read once, and a mismatch costs a fall-back rather than a restart. The same instinct — do not re-read what you already know — runs the mirrored stretches too: from any centre, widen while the ends agree and stop the moment they do not.”',
    ], { move: 'pick the pattern', code:
`def prefix_table(pat):
    table = [0] * len(pat)
    k = 0
    for i in range(1, len(pat)):
        while k and pat[i] != pat[k]:
            k = table[k - 1]
        if pat[i] == pat[k]:
            k += 1
        table[i] = k
    return table` }),
    trace(
`def prefix_table(pat):
    table = [0] * len(pat)
    k = 0
    for i in range(1, len(pat)):
        while k and pat[i] != pat[k]:
            k = table[k - 1]
        if pat[i] == pat[k]:
            k += 1
        table[i] = k
    return table`,
      "prefix_table('abab')",
      [
        { line: 9, state: { pat: 'abab', i: 1, k: 0, table: [0, 0, 0, 0] }, ask: 'table', note: 'Slot 0 is a nought by definition and never changes: a single character has no proper front that is also its back. At slot 1 the front “ab” has none either — b is not a, so k stayed at nought and a nought was written. Nothing has been learned yet, and that is the honest state of it.' },
        { line: 9, state: { pat: 'abab', i: 2, k: 1, table: [0, 0, 1, 0] }, ask: 'table', note: 'The third character is an a, which matches the first, so the counter rose to 1 and slot 2 holds it. Read the claim: the front “aba” ends with one character that is also its beginning. A slide is therefore allowed to keep that one a.' },
        { line: 9, state: { pat: 'abab', i: 3, k: 2, table: [0, 0, 1, 2] }, ask: 'table', note: 'The counter was already 1 from the previous step, the fourth character is a b and the second character is a b, so they agree and the counter rose to 2 without any falling back. The front “abab” ends with “ab”, which is also how it starts.' },
        { line: 10, state: { pat: 'abab', table: [0, 0, 1, 2], returns: [0, 0, 1, 2] }, ask: 'returns', note: 'The word is now carrying its own instructions. Fail on the tape having matched all four characters and the 2 says: keep two, slide by two, do not touch the tape pointer. Four characters, four slots, and the table is built once no matter how long the tape turns out to be.' },
      ]),
    spot('Dax insists his slide-by-one scan is fine because most tapes are nothing like the word. Where is the waste that the table removes?',
      ['The scan compares from the front of the word, and comparing from the back finds mismatches sooner',
       'There is no waste worth the trouble: both do at most the length of the tape times the length of the word',
       'Each slide of one throws away every character already matched, so the tape pointer walks back over characters it has read; the table says how far the word may slide instead, and the tape pointer then never goes backwards',
       'The waste is the copy that each slice of the tape makes, and comparing character by character instead removes it'],
      2, 'Comparing from the back is a different method with its own table and it is not the fix for this. The bound quoted in the second option is exactly the cost being complained about — it is the worst case, reached by tapes of a repeated character, and the table is what removes it. The slice copy is a real cost and it is the small one: dropping it leaves you with the same number of comparisons. The expensive thing is the tape pointer going backwards, and it goes backwards precisely because a slide of one abandons what was already matched. The table converts that knowledge into a legal slide, so every character of the tape is read once and once only.'),
    blank('“The mirrored stretches now, and this is the piece that widens. Given a string and two starting positions, walk the ends apart while they agree, and hand back the widest pair of positions that did agree. Two pieces missing: the test, and the pair of moves.”',
`def expand(s, lo, hi):
    while ___:
        ___
    return (lo + 1, hi - 1)`,
`check("expand('aba', 1, 1)", (0, 2))
check("expand('aba', 0, 0)", (0, 0))
check("expand('abba', 1, 2)", (0, 3))
check("expand('aaa', 1, 2)", (1, 2))
check("expand('ab', 0, 1)", (1, 0))
check("expand('a', 0, 0)", (0, 0))
check("expand('racecar', 3, 3)", (0, 6))`),
    mini('Write count_occurrences(text, pat) returning how many positions of text the string pat starts at, counting overlaps separately, with pat non-empty. A plain left-to-right scan is accepted here; the point is the counting, not the speed.',
      'Every start position from 0 up to the last one where pat still fits. Overlapping counts, so a match does not let you skip ahead by the length of the pattern.',
`check("count_occurrences('aaaa', 'aa')", 3)
check("count_occurrences('abababa', 'aba')", 3)
check("count_occurrences('mississippi', 'issi')", 2)
check("count_occurrences('abc', 'abc')", 1)
check("count_occurrences('abc', 'd')", 0)
check("count_occurrences('aaa', 'aaaa')", 0)
check("count_occurrences('', 'a')", 0)`),
  ],
})
