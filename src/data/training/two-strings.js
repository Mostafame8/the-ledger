import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('two-strings', {
  tier: 'S', xp: 280, requires: ['dp-grid'], gates: ['edit', 'lcs', 'regex'],
  title: 'Two copies of the same page', algo: 'Tables over two strings',
  steps: [
    explain([
      'The fence has two copies of one page of the Ledger. Both were transcribed by hand, both were edited afterwards, and they no longer agree. Marguerite wants to know how far apart they are and what they still share.',
      'Dax: “Read them side by side. When they stop agreeing, skip a line on whichever one is wrong and carry on.”',
      '“Whichever one is wrong is the whole question. Skip on the left and the rest lines up one way, skip on the right and it lines up another, and you cannot tell which was cheaper until you have read both to the end. Guess at every disagreement and you are branching, twice per character.”',
    ], { move: 'brute force' }),
    explain([
      '“The district had a junction per street corner and two ways in. This has a box per pair of prefixes — the first i characters of one page against the first j of the other — and the ways in are the moves you are allowed to make.”',
      '“Read the two last characters. If they agree, they cost nothing and pair off, and the answer is whatever the two shorter prefixes gave you. If they disagree, you drop one of them, and there are only two ways to drop one, so the box takes the better of its neighbour above and its neighbour to the left.”',
      '“That is the whole family. Longest shared run, fewest edits, does a pattern cover an entry — same table over the same pairs of prefixes, and only the verb in the box changes. Shared run takes the larger of the two, edits take the smaller and adds one for the edit itself.”',
      '“Fill it row by row and every box you read is already finished: above, to the left, or diagonally back. The empty prefix is row nought and column nought, and it is the one row you write by hand.”',
    ], { move: 'pick the pattern', code:
`def lcs_len(a, b):
    table = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                table[i][j] = table[i - 1][j - 1] + 1
            else:
                table[i][j] = max(table[i - 1][j], table[i][j - 1])
    return table[len(a)][len(b)]` }),
    trace(
`def lcs_len(a, b):
    table = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                table[i][j] = table[i - 1][j - 1] + 1
            else:
                table[i][j] = max(table[i - 1][j], table[i][j - 1])
    return table[len(a)][len(b)]`,
      "lcs_len('ab', 'b')",
      [
        { line: 2, state: { a: 'ab', b: 'b', table: [[0, 0], [0, 0], [0, 0]] }, ask: 'table', note: 'Three rows for the prefixes of the two-character page, two columns for the prefixes of the one-character page. The nought row and the nought column are the empty prefix, and they are noughts for a reason worth saying out loud: nothing is shared with nothing.' },
        { line: 8, state: { a: 'ab', b: 'b', i: 1, j: 1, table: [[0, 0], [0, 0], [0, 0]] }, ask: 'table', note: 'Prefix “a” against prefix “b”. They disagree, so line 8 takes the larger of the box above and the box to the left — both noughts, so a nought goes in. The table looks unchanged and it is not a stall: that box was asked a real question and the honest answer was nothing.' },
        { line: 6, state: { a: 'ab', b: 'b', i: 2, j: 1, table: [[0, 0], [0, 0], [0, 1]] }, ask: 'table', note: 'Prefix “ab” against prefix “b”. The last characters agree, so they pair off and the box reads diagonally back to the empty-against-empty corner, adds one, and writes 1. Note which box it read — not the one above it, the one above and to the left.' },
        { line: 9, state: { a: 'ab', b: 'b', table: [[0, 0], [0, 0], [0, 1]], returns: 1 }, ask: 'returns', note: 'One character shared, and the answer is the far corner: the whole of one page against the whole of the other. Two characters against one cost two boxes; a thousand against a thousand cost a million, which is nothing, against the two-to-the-thousandth branches the guessing would have cost.' },
      ]),
    spot('Marguerite changes the question: not the longest shared run with gaps allowed, but the longest stretch that appears in both copies unbroken. Which is right?',
      ['The same table, but a disagreement writes a nought instead of the better neighbour, and the answer is the largest number anywhere in the table rather than the far corner',
       'The same table read backwards from the far corner, stopping at the first disagreement',
       'The same table, and then divide the corner by the number of gaps it used',
       'A different table entirely, one box per starting position in each copy'],
      0, 'A box in this table means “the best I can do ending exactly here”. With gaps allowed, a disagreement lets you drop a character and keep what you had, which is what the better-neighbour rule does. Unbroken means a disagreement ends the stretch, so the box goes to nought — and because the stretch no longer has to reach the end of both pages, the answer is not in the corner any more, it is wherever the largest box happens to be. Reading the finished table backwards recovers which characters were shared, not a different question. Dividing by gaps is arithmetic on unrelated numbers, and one box per starting position is the same information with the sharing thrown away.'),
    blank('“Now the forged signature. Fewest single-character edits — insert, delete, replace — that turn one string into the other. The empty-prefix row and column are done for you: turning nothing into j characters costs j inserts. Two boxes missing.”',
`def edit(a, b):
    rows, cols = len(a) + 1, len(b) + 1
    table = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        table[i][0] = i
    for j in range(cols):
        table[0][j] = j
    for i in range(1, rows):
        for j in range(1, cols):
            if a[i - 1] == b[j - 1]:
                table[i][j] = ___
            else:
                table[i][j] = ___
    return table[rows - 1][cols - 1]`,
`check("edit('kitten', 'sitting')", 3)
check("edit('flaw', 'lawn')", 2)
check("edit('abc', 'abc')", 0)
check("edit('a', 'b')", 1)
check("edit('', 'abc')", 3)
check("edit('abc', '')", 3)
check("edit('', '')", 0)
check("edit('sunday', 'saturday')", 3)`),
    mini('Write min_deletions_to_equal(a, b) returning the smallest number of character deletions — counting deletions from both strings together — that leaves the two strings identical. Deleting is the only move allowed. Two strings that are already equal need none, and two strings with nothing in common need all of their characters gone.',
      'Whatever survives in both is a shared run with gaps allowed, and everything else is deleted. So count the longest shared run once and work out how many characters that leaves behind on each side.',
`check("min_deletions_to_equal('sea', 'eat')", 2)
check("min_deletions_to_equal('leetcode', 'etco')", 4)
check("min_deletions_to_equal('abc', 'abc')", 0)
check("min_deletions_to_equal('abc', 'def')", 6)
check("min_deletions_to_equal('ab', 'ba')", 2)
check("min_deletions_to_equal('', 'abc')", 3)
check("min_deletions_to_equal('abc', '')", 3)
check("min_deletions_to_equal('', '')", 0)`),
  ],
})
