import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('enumeration', {
  tier: 'B', xp: 170, requires: ['recursion'], gates: ['letters', 'perms', 'safe'],
  tools: ['tool-recursion', 'tool-list'],
  title: 'Every room, in or out', algo: 'Enumerating every subset',
  steps: [
    explain([
      'Marguerite has the second-floor plan out and eleven rooms marked in pencil. She wants every possible set of rooms to visit so she can strike them off one at a time: all eleven, none of them, the second and the seventh, everything between.',
      'Dax: “Eleven rooms, so eleven loops. Each loop says in or out and the innermost one writes the set down.”',
      '“Write your eleven loops and then she pencils in a twelfth room. Nested loops need the count before you start typing, and the count is the one thing this job never gives you in advance.”',
    ], { move: 'brute force' }),
    explain([
      '“Take the rooms one at a time. Stand at the first: either it is in the set or it is not, and both answers leave you facing exactly the same question about the other ten. A question about a shorter list is the folded note again, and you already trust that.”',
      '“So: put the first room in, ask about the rest. Take it back out, ask about the rest again. Two calls one line apart, and eleven rooms come out as two thousand and forty-eight sets with no nested loops anywhere.”',
      '“Carry one list of what you have chosen so far and lend it to both branches. Append before the first call, remove it after — that removal is the whole discipline, and skipping it is how people end up with sets that keep growing.”',
      '“When there are no rooms left to ask about, the list in your hand is one of the answers. Write down a copy of it, not the list itself, because you are about to take that list apart again on the way back out.”',
    ], { move: 'pick the pattern', code:
`def subsets(items):
    out = []

    def walk(i, chosen):
        if i == len(items):
            out.append(list(chosen))
            return
        chosen.append(items[i])
        walk(i + 1, chosen)
        chosen.pop()
        walk(i + 1, chosen)

    walk(0, [])
    return out`,
      scene: { kind: 'rows', rows: [
        { label: 'serials', data: [1, 2], pointers: ['i'] },
        { label: 'chosen', data: 'chosen', init: [], pile: true },
      ], states: [{ i: 0, chosen: [1] }, { i: 2, chosen: [1, 2] }, { i: 1, chosen: [1] }, { i: 0, chosen: [] }, { i: 2, chosen: [] }] },
    }),
    trace(
`def subsets(items):
    out = []

    def walk(i, chosen):
        if i == len(items):
            out.append(list(chosen))
            return
        chosen.append(items[i])
        walk(i + 1, chosen)
        chosen.pop()
        walk(i + 1, chosen)

    walk(0, [])
    return out`,
      'subsets([1, 2])',
      [
        { line: 8, state: { i: 0, chosen: [1], out: [] }, ask: 'chosen', note: 'The take branch commits to room 1 and dives, without ever pausing to consider leaving it out. That consideration is line 11 and it will not happen until everything above it has finished.' },
        { line: 6, state: { i: 2, chosen: [1, 2], out: [[1, 2]] }, ask: 'out', note: 'The bottom of the take-take path: i has run past the end of the rooms, so the list in hand is a finished answer. list(chosen) is a copy. Append chosen itself and every entry in out would be the same list, and that list ends up empty.' },
        { line: 10, state: { i: 1, chosen: [1], out: [[1, 2]] }, ask: 'chosen', note: 'Back up one level and the pop undoes the append. Room 2 is out of the hand again, which is what lets the very next line ask the honest question: what if we skip room 2. One list, borrowed and returned, all the way down and back.' },
        { line: 10, state: { i: 0, chosen: [], out: [[1, 2], [1]] }, ask: 'out', note: 'The whole left half is finished and room 1 has just been put back on the plan. Two sets recorded, both containing room 1, and the hand is empty — which is exactly the state the first call started in, one room further along.' },
        { line: 6, state: { i: 2, chosen: [], out: [[1, 2], [1], [2], []] }, ask: 'out', note: 'The last bottom of all, reached by skipping both rooms, and it records the empty set. That is a legitimate answer and it always arrives last, because the skip branch is the one that waits. Four sets from two rooms, two thousand and forty-eight from eleven, and every one of them written the moment i ran off the end of the plan.' },
      ],
      { scene: { kind: 'rows', rows: [
        { label: 'serials', data: [1, 2], pointers: ['i'] },
        { label: 'chosen', data: 'chosen', init: [], pile: true },
      ] } }),
    spot('Dax writes the room enumerator and it returns the right count — two thousand and forty-eight sets for eleven rooms — but every single one of them is empty. At the bottom he appends the chosen list. What is wrong?',
      ['He is missing the removal after the first call, so the chosen list only ever grows',
       'He should count the rooms first and use that many loops, since recursion cannot know how deep to go',
       'The bottom should append a copy of the chosen list, because the one he appended is the same list every branch borrows and it is empty by the end',
       'Recursion cannot hand back a list of lists; the sets have to be collected in a global'],
      2, 'A missing removal would give him sets that are too big and too many of them, not empty ones. Loops are the thing this replaced, and the recursion knows how deep to go precisely because it stops when the rooms run out. Recursion returns whatever you like. The count being exactly right is the clue: two thousand and forty-eight entries did go in, and they are all the same list — the one he lent to every branch, which by the end has had everything taken back out of it. Write list(chosen) at the bottom and it is fixed.'),
    blank('“Narrower question. Not every set, only the sets of exactly k rooms, and in the order the rooms are written on the plan. Same two branches: take the first room and ask for k - 1 more from the rest, or skip it and ask for k from the rest.”',
`def combos(items, k):
    if k == 0:
        return ___
    if len(items) < k:
        return []
    first, rest = items[0], items[1:]
    with_first = [___ for c in combos(rest, k - 1)]
    without = combos(rest, k)
    return with_first + without`,
`check("combos([1, 2, 3], 2)", [[1, 2], [1, 3], [2, 3]])
check("combos([1, 2, 3], 3)", [[1, 2, 3]])
check("combos([1, 2, 3], 0)", [[]])
check("combos([1, 2], 3)", [])
check("combos(['a', 'b', 'c'], 1)", [['a'], ['b'], ['c']])
check("combos([], 0)", [[]])
check("len(combos([1, 2, 3, 4, 5], 3))", 10)`),
    mini("Write letter_cases(s) returning every way the letters of s can be written in upper or lower case, as a list. s holds lowercase letters only. Take the lowercase branch first at every letter, so letter_cases('ab') gives ['ab', 'aB', 'Ab', 'AB'], and letter_cases('') gives [''].",
      'Two branches per letter instead of in-or-out: the letter as it stands, or the letter shouted. The variants of a shorter string come back once and then get a lowercase letter stuck on the front of each, then an uppercase one.',
`check("letter_cases('a')", ['a', 'A'])
check("letter_cases('ab')", ['ab', 'aB', 'Ab', 'AB'])
check("letter_cases('abc')", ['abc', 'abC', 'aBc', 'aBC', 'Abc', 'AbC', 'ABc', 'ABC'])
check("letter_cases('')", [''])
check("letter_cases('xyz')[0]", 'xyz')
check("letter_cases('xyz')[-1]", 'XYZ')
check("len(letter_cases('abcde'))", 32)`),
  ],
})
