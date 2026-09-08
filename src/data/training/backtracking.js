import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('backtracking', {
  tier: 'A', xp: 200, requires: ['enumeration', 'flood-fill'], gates: ['safe', 'wordsearch'],
  tools: ['tool-recursion', 'tool-list'],
  title: 'Try it, back out, try the next', algo: 'Backtracking',
  steps: [
    explain([
      'The safe in the manager’s office takes six digits and swallows them silently. There is a rule, though: no digit twice, and every neighbouring pair has to add to a prime. That leaves a few thousand codes out of a million.',
      'Dax: “Then write down all million, cross off the ones that break the rule, and try what is left.”',
      '“You will spend the night writing down 049823 and its nine hundred thousand cousins, and you will cross off every one of them because 0 and 4 add to four. The rule broke at the second digit. You wrote four more digits anyway.”',
    ], { move: 'brute force' }),
    explain([
      '“Every subset was in or out, one room at a time, and you took both branches. This is the same walk with one line added: before you dive, ask whether the thing you just chose is still legal. If it is not, do not dive. Turn round.”',
      '“That line is the whole technique. A million codes become a few thousand visits, because a dead second digit kills nine hundred thousand codes you never wrote.”',
      '“You still carry one list and you still put back what you took. Choose, dive, undo — and the undo has to happen whether the dive found something or nothing, or the list you are carrying stops being the truth.”',
      '“Subset sums first, since the legality test there is arithmetic you can see. Find one subset that hits the target exactly, and stop the moment you overshoot.”',
    ], { move: 'pick the pattern', code:
`def pick(nums, target):
    chosen = []

    def walk(i, total):
        if total == target:
            return True
        if i == len(nums) or total > target:
            return False
        chosen.append(nums[i])
        if walk(i + 1, total + nums[i]):
            return True
        chosen.pop()
        return walk(i + 1, total)

    return chosen if walk(0, 0) else None` }),
    trace(
`def pick(nums, target):
    chosen = []

    def walk(i, total):
        if total == target:
            return True
        if i == len(nums) or total > target:
            return False
        chosen.append(nums[i])
        if walk(i + 1, total + nums[i]):
            return True
        chosen.pop()
        return walk(i + 1, total)

    return chosen if walk(0, 0) else None`,
      'pick([2, 3], 3)',
      [
        { line: 9, state: { i: 0, total: 0, chosen: [2] }, ask: 'chosen', note: 'The first choice is always taken on faith. 2 goes in the hand, the running total is about to become 2, and nothing yet says whether that was a good idea.' },
        { line: 9, state: { i: 1, total: 2, chosen: [2, 3] }, ask: 'chosen', note: 'One level down, 3 joins it. The next call arrives with total 5, which is past the target, so line 7 turns it away without looking at anything else. That refusal is the pruning.' },
        { line: 12, state: { i: 1, total: 2, chosen: [2] }, ask: 'chosen', note: 'The dive failed, so the pop undoes the append and 3 leaves the hand. This is the moment the technique is named after. Skip this line and the hand keeps everything it ever touched.' },
        { line: 12, state: { i: 0, total: 0, chosen: [] }, ask: 'chosen', note: 'Both branches below 2 are exhausted, so 2 comes back out too. The hand is empty and the walk is standing exactly where it started, one room further along the list. Nothing has leaked.' },
        { line: 9, state: { i: 1, total: 0, chosen: [3] }, ask: 'chosen', note: 'The skip branch, and this time 3 is picked with nothing beside it. The next call arrives with total 3, line 5 answers True, and the True runs all the way up untouched. The hand still holds [3], which is why the answer is readable at the top.' },
      ]),
    spot('Eight queens on eight rows, one queen per row, no two attacking. Dax lists every way to put eight queens on sixty-four squares and checks each list for attacks. Which of these does the least work?',
      ['His way, but check the attacks as you build each list rather than at the end',
       'Place a queen in row 0, then row 1, and so on; before each placement check it against the queens already placed, and if it conflicts try the next column instead of going deeper',
       'Put a queen in every row first, then slide the ones that conflict sideways until nothing conflicts',
       'Sort the columns by how many queens they already hold and fill the emptiest first'],
      1, 'Four billion lists of eight squares is the number he is choosing between, and most of them put two queens on one row. One queen per row by construction cuts that to sixteen million arrangements before any checking happens at all. Checking as you build is the right instinct but it is the second half of the answer, not the first: the placement has to be row by row for there to be a partial arrangement worth checking. Sliding conflicts sideways is a different animal entirely and it can wander forever without ever proving there is no solution. Sorting columns by occupancy answers nothing, because in a legal arrangement every column holds nought or one.'),
    blank('“The legality test on its own, since that is the line the whole thing hangs from. cols[r] is the column of the queen in row r, and every row below row is still empty. Say whether a queen at (row, col) is safe.”',
`def safe_col(cols, row, col):
    for r in range(row):
        if ___:
            return False
        if ___:
            return False
    return True`,
`check("safe_col([], 0, 0)", True)
check("safe_col([0], 1, 0)", False)
check("safe_col([0], 1, 1)", False)
check("safe_col([0], 1, 2)", True)
check("safe_col([1, 3], 2, 0)", True)
check("safe_col([1, 3], 2, 3)", False)
check("safe_col([1, 3], 2, 2)", False)`),
    mini('Write count_subsets(nums, target) returning how many subsets of nums add up to target exactly. Every number in nums is positive and there are at most eight of them. The empty subset counts, and its sum is 0.',
      'Choose or skip each number, exactly as before, but count the successes instead of stopping at the first one. Overshooting the target is still a dead branch, so turn round the moment the running total passes it.',
`check("count_subsets([2, 3], 3)", 1)
check("count_subsets([1, 2, 3], 3)", 2)
check("count_subsets([1, 1, 1], 2)", 3)
check("count_subsets([5], 5)", 1)
check("count_subsets([5], 3)", 0)
check("count_subsets([1, 2, 3], 0)", 1)
check("count_subsets([1, 2, 3, 4, 5], 5)", 3)`),
  ],
})
