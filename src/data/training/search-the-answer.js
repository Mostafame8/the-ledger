import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('search-the-answer', {
  tier: 'S', xp: 340, requires: ['binary-search', 'greedy'], gates: ['epilogue', 'median'],
  tools: [],
  title: 'Guess the load', algo: 'Binary search on the answer',
  steps: [
    explain([
      'Sacks to be shifted out of the lock-up, and a fixed number of hours before the shift changes. A courier works at one steady rate and takes a whole sack at a time, however light it is. Marguerite wants the slowest rate that still clears the room in time.',
      'Dax: “Start at one sack an hour. If it is not enough, try two. Then three.”',
      '“Your plan is correct and it is a walk. The heaviest sack is eleven, so you will try eleven rates before you are sure, and on a real night the heaviest sack is a number with six digits in it.”',
    ], { move: 'brute force' }),
    explain([
      '“Look at what your walk found out and threw away. A rate that clears the room in time means every faster rate does too, and a rate that does not means no slower rate does either. So the rates that work are the top end of the range in one unbroken run, and what you are looking for is where that run begins.”',
      '“You have halved a run like that before, in the sorted list of serials. Nothing changes except what the halving is done to: not positions in a list, but the answers themselves. Hold a lowest and a highest rate that bracket the boundary, take the rate in the middle, and check it.”',
      '“Checking is a separate job and it must be honest and cheap. At a given rate a sack takes its weight divided by the rate, rounded up, because a courier does not start the next sack early. Add those up and compare with the hours. That is one pass over the sacks.”',
      '“Then the halving is the same discipline as the serials: when the middle rate works, it might be the answer, so keep it as the new highest; when it fails, the answer is strictly above it. The two ends close and meet on the boundary, and the whole thing costs one pass per halving.”',
    ], { move: 'pick the pattern', code:
`def min_speed(piles, hours):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        need = 0
        for p in piles:
            need += (p + mid - 1) // mid
        if need <= hours:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      scene: { kind: 'cells', data: [3, 6, 7, 11], marks: ['p'], states: [{ p: 3 }, { p: 6 }, { p: 7 }, { p: 11 }] },
    }),
    trace(
`def min_speed(piles, hours):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        need = 0
        for p in piles:
            need += (p + mid - 1) // mid
        if need <= hours:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      'min_speed([3, 6, 7, 11], 8)',
      [
        { line: 4, state: { piles: [3, 6, 7, 11], hours: 8, lo: 1, hi: 11, mid: 6 }, ask: 'mid', note: 'The bracket runs from 1 — a courier must do something — to 11, the heaviest sack, because no rate above that clears the room any faster. The middle of that bracket is where the first guess goes.' },
        { line: 7, state: { piles: [3, 6, 7, 11], hours: 8, lo: 1, hi: 11, mid: 6, need: 6, p: 11 }, ask: 'need', note: 'One pass over the sacks at a rate of 6: the 3 takes an hour, the 6 takes an hour, the 7 takes two because the leftover 1 still costs a whole hour, and the 11 takes two. Six hours against eight allowed, so the rate works — and every rate above 6 is now known to work without being tried.' },
        { line: 4, state: { piles: [3, 6, 7, 11], hours: 8, lo: 1, hi: 6, mid: 3 }, ask: 'mid', note: 'The top of the bracket came down to 6 rather than 5, because 6 itself is still a candidate for the slowest rate that works. Half the range is gone on one pass, and the new middle is 3.' },
        { line: 7, state: { piles: [3, 6, 7, 11], hours: 8, lo: 1, hi: 6, mid: 3, need: 10, p: 11 }, ask: 'need', note: 'At a rate of 3 the sacks take 1, 2, 3 and 4 hours. Ten against eight, so this rate fails and so does every rate below it — which is why line 11 moves the bottom of the bracket to one above the middle rather than to the middle.' },
        { line: 12, state: { piles: [3, 6, 7, 11], hours: 8, lo: 4, hi: 4, returns: 4 }, ask: 'returns', note: 'The ends met at 4. Two more guesses got there — 5 worked, 4 worked — and the whole answer cost four passes over the sacks instead of eleven. A heaviest sack of a million would cost twenty.' },
      ],
      { scene: { kind: 'cells', data: [3, 6, 7, 11], marks: ['p'] } }),
    spot('Dax asks why the halving is even allowed here, since the sacks are not sorted and nobody sorted them. What actually makes it legal?',
      ['Any question whose answer is a number can be halved, as long as the range is known',
       'The sacks must be sorted first, and the code only works on this input by luck',
       'Whether a rate works is decided by one number — the hours needed — and that number never rises as the rate rises, so the rates that work form one unbroken run at the top and there is exactly one boundary to find',
       'Because the check is greedy, and greedy checks always produce a run of working answers'],
      2, 'The order of the sacks is irrelevant: the check adds up every sack, and addition does not care. What matters is a property of the check, not of the input — raise the rate and no sack can take longer, so the hours needed can only fall. That makes the working rates a suffix of the range with a single boundary, and a single boundary is the one thing halving can find. Take that property away and the halving is meaningless: a check that turns from working to failing and back again has several boundaries and the middle guess tells you nothing about which side to keep. Greediness of the check is a coincidence here — plenty of monotone checks are not greedy, and plenty of greedy checks are not monotone.'),
    blank('“Now the check for the couriers instead of the rate. The pages leave in order, each courier takes a consecutive run, and nobody carries more than limit. Say whether limit is survivable with at most k of them. Two pieces missing: the test that starts a new courier, and the verdict.”',
`def feasible(nums, k, limit):
    pieces = 1
    load = 0
    for x in nums:
        if x > limit:
            return False
        if ___:
            pieces += 1
            load = x
        else:
            load += x
    return ___`,
`check("feasible([7, 2, 5, 10, 8], 2, 18)", True)
check("feasible([7, 2, 5, 10, 8], 2, 17)", False)
check("feasible([1, 2, 3, 4, 5], 2, 9)", True)
check("feasible([1, 4, 4], 3, 4)", True)
check("feasible([1, 4, 4], 3, 3)", False)
check("feasible([5], 1, 5)", True)
check("feasible([], 1, 0)", True)`),
    mini('Write sqrt_floor(n) returning the largest whole number x with x * x <= n, for any n of 0 or more. Find it by halving a bracket of candidate answers. Do not import math and do not use ** 0.5.',
      'The candidates run from 0 to n itself, and the property is monotone: if x squared fits then so does everything below x. Halve the bracket and keep the middle when its square fits.',
`check("sqrt_floor(0)", 0)
check("sqrt_floor(1)", 1)
check("sqrt_floor(8)", 2)
check("sqrt_floor(9)", 3)
check("sqrt_floor(15)", 3)
check("sqrt_floor(16)", 4)
check("sqrt_floor(10 ** 12)", 10 ** 6)`),
  ],
})
