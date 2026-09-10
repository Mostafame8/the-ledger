import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('interval-dp', {
  tier: 'S', xp: 360, requires: ['dp-grid'], gates: ['balloons'],
  tools: ['tool-table'],
  title: 'Which one goes last', algo: 'Tables over ranges',
  steps: [
    explain([
      'A row of shell companies on the fence’s sheet, each with a number beside it. Collapse one and the row closes up, so the two companies that were its neighbours become each other’s neighbours, and what a collapse is worth depends on who was standing next to it at the time.',
      'Dax: “Collapse the biggest first and work down.”',
      '“Biggest first is a guess and it loses on this sheet. And your honest version — try every order — is every order of the whole row, which for twenty companies is more orders than there are seconds in the age of the city.”',
    ], { move: 'brute force' }),
    explain([
      '“Stop asking which one goes first. Asking that gets you nowhere, because collapsing the first one welds the two halves of the row together and whatever happens on the left then changes what the right is worth.”',
      '“Ask which one goes last in a stretch instead, and the stretch falls apart cleanly. If a company is the last one standing in some stretch, everything else in that stretch was already gone before it, so its neighbours at that moment are the two companies just outside the stretch — fixed, known, nothing to do with the order. And the two sides of it never interfered with each other at all.”',
      '“So the box is a stretch, not a position: two hands, a left end and a right end. Its value is the best over every choice of which company in it went last, and each choice reads two smaller stretches.”',
      '“Fill by increasing length, because every stretch a box reads is shorter than the box itself. That is the ordering rule, and it is the only new thing here — the district filled row by row, this fills length by length. The example below is the simplest question of that shape: is this stretch a mirror of itself.”',
    ], { move: 'pick the pattern', code:
`def is_pal_table(s):
    n = len(s)
    table = [[False] * n for _ in range(n)]
    for i in range(n):
        table[i][i] = True
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if length == 2:
                table[i][j] = s[i] == s[j]
            else:
                table[i][j] = s[i] == s[j] and table[i + 1][j - 1]
    return table`, scene: { kind: 'grid', data: 'table', init: [[false, false, false], [false, false, false], [false, false, false]], cursor: ['i', 'j'], heads: { rows: ['a', 'b', 'a'], cols: ['a', 'b', 'a'] },
      states: [{ i: 0, table: [[true, false, false], [false, false, false], [false, false, false]] }, { i: 2, table: [[true, false, false], [false, true, false], [false, false, true]] }, { i: 1, j: 2, table: [[true, false, false], [false, true, false], [false, false, true]] }, { i: 0, j: 2, table: [[true, false, true], [false, true, false], [false, false, true]] }] } }),
    trace(
`def is_pal_table(s):
    n = len(s)
    table = [[False] * n for _ in range(n)]
    for i in range(n):
        table[i][i] = True
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if length == 2:
                table[i][j] = s[i] == s[j]
            else:
                table[i][j] = s[i] == s[j] and table[i + 1][j - 1]
    return table`,
      "is_pal_table('aba')",
      [
        { line: 5, state: { s: 'aba', n: 3, i: 0, table: [[true, false, false], [false, false, false], [false, false, false]] }, ask: 'table', note: 'The first stretch of length one, marked True. Row is the left end, column is the right end, so the diagonal is every single character, and a single character is a mirror of itself with nothing to check. Half the table below the diagonal is never written at all — a left end past a right end is not a stretch.' },
        { line: 5, state: { s: 'aba', n: 3, i: 2, table: [[true, false, false], [false, true, false], [false, false, true]] }, ask: 'table', note: 'The whole diagonal now, one True per character, and nothing else touched. Those are the length-one stretches and they are the floor the longer ones stand on.' },
        { line: 10, state: { s: 'aba', n: 3, length: 2, i: 1, j: 2, table: [[true, false, false], [false, true, false], [false, false, true]] }, ask: 'table', note: 'Both stretches of length two are done and both wrote False: “ab” is not a mirror and neither is “ba”. The table looks unchanged and it is not a stall — two real questions were asked and the answer to both was no. Length two is its own case because there is nothing between the ends to look up.' },
        { line: 12, state: { s: 'aba', n: 3, length: 3, i: 0, j: 2, table: [[true, false, true], [false, true, false], [false, false, true]] }, ask: 'table', note: 'The only stretch of length three. Its ends agree, so it asks the box for what is between them — the single b, already True on the diagonal — and writes True. Three characters, six boxes, and each one was answered in constant time because everything it needed was already finished.' },
      ], { scene: { kind: 'grid', data: 'table', init: [[false, false, false], [false, false, false], [false, false, false]], cursor: ['i', 'j'], heads: { rows: ['a', 'b', 'a'], cols: ['a', 'b', 'a'] } } }),
    spot('Back to the shell companies. Dax accepts that trying every order is hopeless and proposes a table over stretches, deciding for each stretch which company in it is collapsed first. What is wrong with first, and what is right?',
      ['Nothing is wrong with first; it is the same table read from the other end',
       'First is wrong because the stretch has to be filled by decreasing length instead, and that ordering cannot be done with two loops',
       'First is wrong because collapsing a company in the middle joins its two neighbours, so the two halves are no longer independent; last is right because everything else in the stretch is already gone, its neighbours are the fixed ends just outside the stretch, and the two sides never touch',
       'Both are wrong; the row must be padded with a 1 at each end and then the biggest value taken first'],
      2, 'Collapse a company first and the row closes around it, so what the left half is worth from then on depends on what the right half did — the two halves are welded together and neither can be looked up on its own. Collapse it last and the picture inverts: both sides finished independently, and the neighbours it is finally worth something against are the two companies just outside the stretch, which never move. Padding the row with a 1 at each end is a real and necessary trick — it lets the outermost stretch have neighbours — but it is bookkeeping, not the idea, and biggest-first is still a guess with or without it. The filling order is by increasing length in either version, so that is not the flaw.'),
    blank('“The mirrored stretches, counted. How many stretches of this string read the same both ways, counting every stretch separately even when two of them look alike. Two boxes missing: the length-two case, and the general one.”',
`def count_pal_substrings(s):
    n = len(s)
    table = [[False] * n for _ in range(n)]
    total = 0
    for i in range(n):
        table[i][i] = True
        total += 1
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if length == 2:
                table[i][j] = ___
            else:
                table[i][j] = ___
            if table[i][j]:
                total += 1
    return total`,
`check("count_pal_substrings('abc')", 3)
check("count_pal_substrings('aaa')", 6)
check("count_pal_substrings('aba')", 4)
check("count_pal_substrings('abba')", 6)
check("count_pal_substrings('aabaa')", 9)
check("count_pal_substrings('a')", 1)
check("count_pal_substrings('')", 0)`),
    mini('Write longest_pal_len(s) returning the length of the longest stretch of s that reads the same both ways, and 0 for the empty string. Build the same table over stretches and read the answer off it.',
      'Every box already says whether its stretch is a mirror. Fill by increasing length as before and keep the largest length whose box came out True.',
`check("longest_pal_len('babad')", 3)
check("longest_pal_len('cbbd')", 2)
check("longest_pal_len('forgeeksskeegfor')", 10)
check("longest_pal_len('abcba')", 5)
check("longest_pal_len('aaaa')", 4)
check("longest_pal_len('a')", 1)
check("longest_pal_len('')", 0)`),
  ],
})
