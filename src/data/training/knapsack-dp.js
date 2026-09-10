import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('knapsack-dp', {
  tier: 'S', xp: 280, requires: ['dp-choices'], gates: ['knap', 'ledger'],
  tools: ['tool-list'],
  title: 'What the bag will carry', algo: 'One-row knapsack',
  steps: [
    explain([
      'One bag, a weight limit, and a table of things worth different amounts. Each thing goes in whole or stays behind — no halves, no seconds. Marguerite wants the most valuable bag the limit allows.',
      'Dax: “Lightest first. Keep packing until it will not close.”',
      '“Lightest first sold the border toll and it does not survive here either. Three light things worth a pound each lose to one heavy thing worth ten. And the honest version of your plan — try every combination — is two to the twenty on the sheet in front of you.”',
    ], { move: 'brute force' }),
    explain([
      '“The border table had one box per amount and every denomination could be spent again. This has a limit and a list of things, and each thing gets exactly one chance. So the box is a capacity and the sweep is a thing: take the items one at a time and let each of them pass over every capacity once.”',
      '“What a box holds is the best value for that capacity using only the items you have already offered. Offering the next item asks one question per box: is the bag better with it or without it. Without it is the number already sitting there. With it is the item’s value plus the box for the capacity left over.”',
      '“One row is enough, as it was on the one-way streets — but the direction matters now for a different reason. Sweep the capacities downward and every box you read is still the row from before this item, so the item is offered once. Sweep upward and you read boxes this same item has already improved, which quietly hands the item back to itself.”',
      '“The row starts all noughts: no items offered yet, nothing worth anything at any capacity.”',
    ], { move: 'pick the pattern', code:
`def knap(weights, values, cap):
    row = [0] * (cap + 1)
    for i in range(len(weights)):
        for c in range(cap, weights[i] - 1, -1):
            row[c] = max(row[c], values[i] + row[c - weights[i]])
    return row[cap]`,
      scene: { kind: 'rows', rows: [
        { label: 'weights', data: [1, 2], pointers: ['i'] },
        { label: 'values', data: [1, 3], pointers: ['i'] },
        { label: 'row', data: 'row', init: [], pointers: ['c'] },
      ], states: [{ row: [0, 0, 0, 0] }, { i: 0, c: 1, row: [0, 1, 1, 1] }, { i: 1, c: 2, row: [0, 1, 3, 4] }] },
    }),
    trace(
`def knap(weights, values, cap):
    row = [0] * (cap + 1)
    for i in range(len(weights)):
        for c in range(cap, weights[i] - 1, -1):
            row[c] = max(row[c], values[i] + row[c - weights[i]])
    return row[cap]`,
      'knap([1, 2], [1, 3], 3)',
      [
        { line: 2, state: { weights: [1, 2], values: [1, 3], cap: 3, row: [0, 0, 0, 0] }, ask: 'row', note: 'Four boxes, one per capacity from nought to three. Nothing offered yet, so every bag is worth nought — including the bag with room for three, which is the one the answer will come out of.' },
        { line: 5, state: { weights: [1, 2], values: [1, 3], cap: 3, i: 0, c: 1, row: [0, 1, 1, 1] }, ask: 'row', note: 'The first item weighs 1 and is worth 1, and this is the row after it has passed over capacities 3, 2 and 1 in that order. One item cannot fill a bag twice, so every capacity that fits it is worth exactly 1 and capacity nought is untouched.' },
        { line: 5, state: { weights: [1, 2], values: [1, 3], cap: 3, i: 1, c: 2, row: [0, 1, 3, 4] }, ask: 'row', note: 'The second item weighs 2 and is worth 3. At capacity 3 it read row[1], which still held the 1 from the previous item and had not yet been touched this pass — 3 plus 1 is 4, better than the 1 that was there. At capacity 2 it read row[0] and wrote 3. Downward is what kept row[1] honest.' },
        { line: 6, state: { weights: [1, 2], values: [1, 3], cap: 3, row: [0, 1, 3, 4], returns: 4 }, ask: 'returns', note: 'Both items in the bag, weight 3, value 4. Two items and four capacities cost six comparisons; twenty items and a limit of a thousand cost twenty thousand, which is a blink, against the million million the combinations would have cost.' },
      ],
      { scene: { kind: 'rows', rows: [
        { label: 'weights', data: [1, 2], pointers: ['i'] },
        { label: 'values', data: [1, 3], pointers: ['i'] },
        { label: 'row', data: 'row', init: [], pointers: ['c'] },
      ] } }),
    spot('Dax rewrites the inner sweep as range(weights[i], cap + 1) — capacities climbing instead of falling. The code runs and the numbers come out too big. What has he actually written?',
      ['A version that reads boxes still holding noughts, so the answer comes back too small rather than too large',
       'The same answer with one extra pass over the row per item',
       'The unlimited-supply question: reading a box this item has already improved lets the item be packed again and again',
       'A version that needs the items sorted by weight before it is correct'],
      2, 'Climbing means that when the sweep reaches capacity c it has already written capacity c minus the weight, this item included. So the box it reads is not the row from before the item — it is a row that already contains the item, and adding the item again is legal. That is exactly the border toll, where a denomination could be handed over as often as you liked, and it is why the numbers come out high rather than low. Nothing about ordering the items fixes it, and there is no extra pass: the loop runs the same number of times, it just answers a different question.'),
    blank('“Write it. Two pieces missing: which way the capacities are swept, and the choice made at each box.”',
`def knap(weights, values, cap):
    row = [0] * (cap + 1)
    for i in range(len(weights)):
        w, v = weights[i], values[i]
        for c in ___:
            row[c] = ___
    return row[cap]`,
`check("knap([1, 2], [1, 3], 3)", 4)
check("knap([1, 3, 4, 5], [1, 4, 5, 7], 7)", 9)
check("knap([3, 4, 5], [30, 50, 60], 8)", 90)
check("knap([1, 2, 3], [6, 10, 12], 5)", 22)
check("knap([2], [5], 1)", 0)
check("knap([], [], 5)", 0)
check("knap([4], [9], 0)", 0)`),
    mini('Write subset_exists(nums, target) returning True if some subset of nums adds up exactly to target, and False otherwise. nums holds non-negative whole numbers and target is non-negative. The empty subset counts, so a target of 0 is always reachable.',
      'The same row, but a box holds True or False rather than a value: can this total be hit with the items offered so far. Seed the box for nought and sweep the totals downward for each item.',
`check("subset_exists([3, 34, 4, 12, 5, 2], 9)", True)
check("subset_exists([3, 34, 4, 12, 5, 2], 30)", False)
check("subset_exists([1, 2, 5], 4)", False)
check("subset_exists([7], 7)", True)
check("subset_exists([2, 4], 0)", True)
check("subset_exists([], 0)", True)
check("subset_exists([], 3)", False)`),
  ],
})
