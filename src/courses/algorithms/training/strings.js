import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('strings', {
  tier: 'F', xp: 40, requires: ['loops'], gates: ['reverse', 'palin'],
  tools: ['tool-string'],
  title: 'The passphrase note', algo: 'Scanning a string',
  steps: [
    explain([
      'Dax writes his notes backwards, on the theory that anyone who lifts his notebook will give up. The fence sent a passphrase and he has copied it down the same way, with the punctuation in.',
      'Dax: “It reads the same both ways. That is the whole point of it. So it does not matter.”',
      '“It reads the same both ways once you take out the commas and drop the capitals. Right now it reads as nothing at all.”',
    ], { move: 'brute force' }),
    explain([
      '“A string is a list of characters that will not let you change one. That is the only rule you need for today.”',
      '“So you walk it. One character at a time, keep an index if you need to know where you are, and build the answer somewhere else.”',
      '“s[i] is the character at position i. s[a:b] is everything from a up to but not including b. The second half of that sentence is where people lose an hour.”',
    ], { move: 'name the waste', code:
`def first_word(s):
    i = 0
    while i < len(s) and s[i] != ' ':
        i += 1
    return s[:i]`,
      scene: { kind: 'cells', data: 'ok go', pointers: ['i'], states: [{ i: 0 }, { i: 1 }, { i: 2 }] },
    }),
    trace(
`def first_word(s):
    i = 0
    while i < len(s) and s[i] != ' ':
        i += 1
    return s[:i]`,
      "first_word('ok go')",
      [
        { line: 2, state: { s: 'ok go', i: 0 }, ask: 'i', note: 'The scanner starts on the first character, position 0.' },
        { line: 4, state: { s: 'ok go', i: 1 }, ask: 'i', note: "s[0] is 'o', not a space, so the scanner steps forward one." },
        { line: 4, state: { s: 'ok go', i: 2 }, ask: 'i', note: "s[1] is 'k', so it steps again. s[2] is the space, so the while condition fails and the loop stops here." },
        { line: 5, state: { s: 'ok go', i: 2, returns: 'ok' }, ask: 'returns', note: 'The slice s[:2] takes positions 0 and 1 and stops before position 2, so the space is left out. A slice never includes its end index.' },
      ],
      { scene: { kind: 'cells', data: 'ok go', pointers: ['i'] } }),
    spot('The fence sends the passphrase padded with punctuation and mixed case. You have to decide whether it reads the same both ways. What comes first?',
      ['Reverse the whole string and compare it with the original', 'Walk it once, keeping only the characters that count, then compare', 'Sort the characters and compare', 'Count each letter and compare the counts'],
      1, 'Sorting and counting both throw away the order, and the order is the entire question: “ab” and “ba” have identical letters and identical counts. Reversing does answer the question, but only after the commas and capitals are gone, and stripping them is the pass you have to write either way.'),
    blank('“Strip the note down to what the fence actually said. Letters and digits, nothing else, all lowercase.”',
`def only_letters(s):
    out = []
    for ch in s:
        if ___:
            out.append(___)
    return ''.join(out)`,
`check("only_letters('A man, a plan')", 'amanaplan')
check("only_letters('No. 7!')", 'no7')
check("only_letters('AbC')", 'abc')
check("only_letters('...')", '')
check("only_letters('')", '')`),
    mini("Write count_vowels(s) that returns how many of a, e, i, o and u are in s, counting capitals as the same letter.",
      'One pass, one counter. Fold the case once per character instead of listing ten letters to test against.',
`check("count_vowels('Halden')", 2)
check("count_vowels('Marguerite')", 5)
check("count_vowels('AEIOU')", 5)
check("count_vowels('rhythm')", 0)
check("count_vowels('')", 0)`),
  ],
})
