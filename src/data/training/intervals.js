import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('intervals', {
  tier: 'B', xp: 160, requires: ['tracking'], gates: ['timetable', 'meetings'],
  tools: ['tool-list'],
  title: 'The shift board', algo: 'Sorting and merging intervals',
  steps: [
    explain([
      'Behind the staff door at Halden Bank there is a corkboard of guard shifts, one card each: on at this minute, off at that one. Nobody typed them up and nobody pinned them in order, and the shifts overlap in ways that only make sense to whoever wrote the rota.',
      'Dax: “I want the quiet stretch. So for every minute of the night I check every card to see if anybody is on the floor.”',
      '“Six hundred minutes against forty cards, and you would do the whole thing again tomorrow when they repin the board. Minutes are not the unit of this problem. The cards are.”',
    ], { move: 'brute force' }),
    explain([
      '“Put the cards in order of when the shift starts. That one move is the trick and everything after it is bookkeeping.”',
      '“Now walk them, holding the block you are building. If the next shift starts at or before the block ends, it is the same unbroken stretch of covered night, so stretch the block’s end — to the later of the two ends, because a short shift can sit entirely inside a long one and must not shrink it.”',
      '“If it starts after the block ends, the floor was empty in between. Close that block and open a new one.”',
      '“Sorted by start, a card can only ever overlap the block in your hand, never one you closed ten cards ago. That is why one pass is enough, and it is why the sort was not optional.”',
    ], { move: 'pick the pattern', code:
`def merge(intervals):
    intervals = sorted(intervals)
    out = []
    for start, end in intervals:
        if out and start <= out[-1][1]:
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out` }),
    trace(
`def merge(intervals):
    intervals = sorted(intervals)
    out = []
    for start, end in intervals:
        if out and start <= out[-1][1]:
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out`,
      'merge([[1, 3], [2, 4], [6, 7]])',
      [
        { line: 8, state: { start: 1, end: 3, out: [[1, 3]] }, ask: 'out', note: 'The first card takes the else branch because there is no block to overlap yet. It goes down exactly as written, and it is a fresh list, not the card itself, so the board on the wall is never edited.' },
        { line: 6, state: { start: 2, end: 4, out: [[1, 4]] }, ask: 'out', note: 'The second shift starts at 2, which is at or before the block’s end of 3, so the floor was never empty. Only the end moves. Note that it moved to max(3, 4) and not simply to 4, which is the line that survives a short shift nested inside a long one.' },
        { line: 8, state: { start: 6, end: 7, out: [[1, 4], [6, 7]] }, ask: 'out', note: '6 is after 4, so minutes 4 to 6 had nobody on the floor. The old block is closed for good and a new one opens. Two blocks now, and the gap between them is the thing Dax spent all night looking for.' },
        { line: 9, state: { start: 6, end: 7, returns: [[1, 4], [6, 7]] }, ask: 'returns', note: 'Three cards in, two stretches out, one pass over them. The pass was cheap; the sort was the price, and you paid it once instead of walking six hundred minutes.' },
      ]),
    spot('Forty guard shifts and Marguerite wants the merged stretches of covered night. Dax sorts the cards by when each shift ends rather than when it starts, then walks them holding one block exactly as before. What breaks?',
      ['Nothing. Merging works from either end as long as you walk every card',
       'A card can now start before the block you are holding, so the block’s start is no longer the earliest minute of the stretch',
       'Sorting by end is slower than sorting by start',
       'It merges correctly but the gaps between the merged blocks come out wrong'],
      1, 'The sort costs the same either way, and if the blocks were right the gaps between them would be too. Sorting by end is genuinely the right move for a different question, the one about keeping as many non-overlapping shifts as you can. Merging leans on one guarantee: everything still to come starts at or after the block in your hand, so the block’s start is settled and only its end can grow. Sort by end and [2, 3] arrives before [1, 10], the block opens at 2, and the merged night claims to begin a minute late.'),
    blank('“Same board, different question. How many minutes of the night are covered at all? Count the covered stretch once, however many guards were standing in it.”',
`def total_covered(intervals):
    blocks = []
    for start, end in sorted(intervals):
        if blocks and ___:
            blocks[-1][1] = ___
        else:
            blocks.append([start, end])
    return sum(end - start for start, end in blocks)`,
`check("total_covered([[1, 3], [2, 4], [6, 7]])", 4)
check("total_covered([[1, 10], [2, 3]])", 9)
check("total_covered([[1, 2], [3, 4]])", 2)
check("total_covered([[5, 6], [1, 2]])", 2)
check("total_covered([[1, 5]])", 4)
check("total_covered([])", 0)`),
    mini('Write has_overlap(intervals) returning True if any two of the shifts are on the floor at the same moment. A shift that ends at the minute another one starts does not count as an overlap, and a board with fewer than two cards can never overlap.',
      'Sort by start and you only ever have to compare a card with the one before it. Strictly before, not at or before, because touching is allowed here.',
`check("has_overlap([[1, 3], [2, 4]])", True)
check("has_overlap([[1, 2], [2, 3]])", False)
check("has_overlap([[1, 2], [5, 6], [3, 4]])", False)
check("has_overlap([[1, 10], [2, 3], [20, 30]])", True)
check("has_overlap([[5, 6], [1, 7]])", True)
check("has_overlap([[1, 2]])", False)
check("has_overlap([])", False)`),
  ],
})
