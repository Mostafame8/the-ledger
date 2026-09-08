import { tool, explain, trace, blank } from '../node.js'

export default tool('tool-heap', {
  xp: 30, title: 'The priority drawer', algo: 'Heap',
  steps: [
    explain([
      'Marguerite drops the night’s jobs into a drawer, each one with a price written on it. The drawer only ever has to answer one question: what is the cheapest thing in here.',
      'Dax: “Sort the drawer. Then the cheapest is on top and I read it off.”',
      '“You will drop nine more jobs in before midnight, and you would sort it nine more times. You are paying for the order of every job you were never going to look at. The drawer does not need to be in order. It needs a front.”',
    ], { code:
`import heapq

drawer = [5, 2]
heapq.heapify(drawer)       # [2, 5], the smallest at the front
heapq.heappush(drawer, 3)   # [2, 5, 3], and 2 is still at the front
drawer[0]                   # 2, read the front and take nothing
heapq.heappop(drawer)       # 2, off the front and into your hand
drawer                      # [3, 5]. Only the front was ever promised
len(drawer)                 # 2
heapq.heappop([])           # IndexError. Ask before you take` }),
    explain([
      '“It is an ordinary crate. heapq keeps one promise about it and no more: whatever sits at drawer[0] is the smallest thing in the drawer. Read the rest and it will look shuffled to you, because it is.”',
      '“heappush drops one in, heappop takes the front one out, and each costs a handful of moves rather than a walk. Double the drawer and you pay one more step. Reading drawer[0] costs nothing at all.”',
      '“Smallest first, always. If you want the largest out front, push the price with a minus in front of it and take the minus off when it comes back.”',
      '“So never index anything but the front, never sort it and expect it to stay sorted, and never pop an empty drawer. That is an IndexError, same as the tray of plates.”',
    ]),
    trace(
`import heapq

def sift(drawer):
    heapq.heappush(drawer, 5)
    heapq.heappush(drawer, 2)
    first = heapq.heappop(drawer)
    return drawer[0]`,
      'sift([4, 9])',
      [
        { line: 4, state: { drawer: [4, 9, 5] }, ask: 'drawer', note: 'The drawer arrived keeping its promise, 4 at the front, and pushing 5 did not disturb that. 5 landed on the back because nothing required it to move.' },
        { line: 5, state: { drawer: [2, 4, 5, 9] }, ask: 'drawer', note: '2 is cheaper than everything in there, so it had to end up at the front, and 4 and 9 shifted to let it. Three items moved, not a sort: only the path from the back to the front gets touched.' },
        { line: 6, state: { first: 2, drawer: [4, 9, 5] }, ask: 'first', note: 'heappop hands back the front, which is the smallest by the promise. Then the drawer closed up behind it and 4 is at the front again.' },
        { line: 7, state: { first: 2, drawer: [4, 9, 5], returns: 4 }, ask: 'returns', note: 'Look at that drawer: 4, 9, 5. Out of order to your eye and perfectly correct, because the only thing ever promised is drawer[0]. Dax would have sorted it three times to learn the same number.' },
      ]),
    blank('“Two hands on the drawer. One drops a job in and leaves the promise intact. One reads me the cheapest job without taking it, and an empty drawer has no cheapest job.”',
`import heapq

def add_job(drawer, price):
    ___
    return drawer

def cheapest(drawer):
    if not drawer:
        return None
    return ___`,
`check("add_job([], 5)", [5])
check("add_job([2, 5], 3)", [2, 5, 3])
check("add_job([5], 2)", [2, 5])
check("cheapest([2, 5, 3])", 2)
check("cheapest([5])", 5)
check("cheapest([])", None)
check("cheapest takes nothing out", lambda: inplace(cheapest, [2, 5, 3]), [2, 5, 3])`),
  ],
})
