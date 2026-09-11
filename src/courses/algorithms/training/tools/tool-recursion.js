import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-recursion', {
  xp: 30, title: 'The nested envelopes', algo: 'The call stack',
  steps: [
    explain([
      'The fence never sends an address plainly. It comes as a parcel of envelopes, each one sealed inside the last, and the only way inwards is to open the one in your hands and find another envelope.',
      'Dax: “Cut the lot open on the table and read whichever scrap has the address on it.”',
      '“You do not know how many there are until you reach the one with the address in it. So open one, and hand what is inside to somebody who opens envelopes. Python will hold your place while they work.”',
    ], { code:
`def count_down(n):
    if n == 0:                # the base case first, and it must be reachable
        return 'done'
    return count_down(n - 1)  # a strictly smaller parcel

count_down(3)                 # 'done', four frames stacked and four unstacked

import sys
sys.getrecursionlimit()       # 1000 on a stock build. Frames are not free
count_down(5000)              # RecursionError: maximum recursion depth exceeded`,
      scene: { kind: 'rows', rows: [{ label: 'calls', data: 'calls', init: [], pile: true, at: ['n'] }],
        states: [{ n: 2, calls: [2] }, { n: 1, calls: [2, 1] }, { n: 0, calls: [2, 1, 0] }, { n: 2, calls: [2] }] } }),
    explain([
      '“Every call gets a frame: its own n, its own place in the code, stacked on the frame that called it. Three envelopes open at once means three frames open at once, and no frame can see inside another one.”',
      '“The last frame opened is the first to answer, and its answer travels back out through every frame still waiting, in reverse. It is the tray of plates from the stack drill again, except Python holds the tray for you and never lets you touch it.”',
      '“Write the answer that involves no asking first, and make sure the step reaches it. Miss either and the stack grows until Python gives up: RecursionError, at a thousand frames or so.”',
      '“Depth is what costs you, not the work. A parcel a thousand deep needs a thousand frames standing at once, however little each one is holding.”',
    ]),
    trace(
`def count_down(n):
    if n == 0:
        return 'done'
    return count_down(n - 1)`,
      'count_down(2)',
      [
        { line: 2, state: { n: 2, calls: [2] }, ask: 'n', note: 'One frame open, holding the parcel it was handed. Line 2 asks whether this is the last envelope and it is not, so line 4 will ask somebody else.' },
        { line: 2, state: { n: 1, calls: [2, 1] }, ask: 'n', note: 'A second frame with its own n, and a smaller parcel. The first frame is still open, parked on line 4, waiting for an answer it cannot work out itself.' },
        { line: 3, state: { n: 0, calls: [2, 1, 0], returns: 'done' }, ask: 'returns', note: 'Three frames stacked now, and only this one answers without asking anybody. That is the base case, and it is the only reason the stack ever shrinks.' },
        { line: 4, state: { n: 2, calls: [2], returns: 'done' }, ask: 'returns', note: '“done” came back up through the n = 1 frame and then through this one, the first frame opened and the last to close. Three frames in, three frames out, and none of them ever saw another frame’s n.' },
      ], { scene: { kind: 'rows', rows: [{ label: 'calls', data: 'calls', init: [], pile: true, at: ['n'] }] } }),
    blank('“One more parcel. The fence writes the address on a tape, backwards. Peel the first letter off, hand the rest to somebody who reads tapes, and stick your letter on the end of whatever comes back. Say what an empty tape reads as, or the asking never stops.”',
`def unwind(tape):
    if tape == '':
        return ___
    return unwind(tape[1:]) + ___`,
`check("unwind('abc')", 'cba')
check("unwind('ab')", 'ba')
check("unwind('a')", 'a')
check("unwind('')", '')
check("unwind('halden')", 'nedlah')
check("first four letters back off a sixty-letter tape", lambda: unwind('ab' * 30)[:4], 'baba')`),
  ],
})
