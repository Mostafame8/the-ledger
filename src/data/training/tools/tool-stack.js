import { tool, explain, trace, blank } from '../node.js'

export default tool('tool-stack', {
  xp: 30, title: 'The tray of plates', algo: 'Stack',
  steps: [
    explain([
      'Marguerite lays the forged papers out on a diner tray, one on top of the last, in the order the crew will need them.',
      'Dax reaches for the bottom sheet. “This one first. It went down first.”',
      '“Pull that and the rest come down with it. A tray gives you the top sheet and nothing else. That is not a fault in the tray, that is what a tray is.”',
    ], { code:
`tray = []
tray.append('papers')   # put one on top
tray.append('badge')    # ['papers', 'badge'], badge on top
tray[-1]                # 'badge', look at the top and take nothing
tray.pop()              # 'badge', off the tray and into your hand
len(tray)               # 1
if tray: ...            # an empty tray is falsy
tray.pop()
tray.pop()              # IndexError. Ask before you take`,
      scene: { kind: 'cells', data: 'tray', init: [], pile: true, marks: ['taken'],
        states: [{ tray: [] }, { tray: ['papers'] }, { tray: ['papers', 'badge'] }, { taken: 'badge', tray: ['papers'] }] },
    }),
    explain([
      '“It is a crate you only ever touch at the back. append puts a sheet on, pop takes the top sheet off, tray[-1] reads the top without taking it. One move each, always.”',
      '“Last on, first off. Any time the thing you need next is the most recent thing you saw, this is the tool: unanswered brackets, the last move you want to undo, the frames of a running function.”',
      '“Never pop an empty tray. Check if tray first, because a pop with nothing there raises IndexError and takes the whole run down with it.”',
    ]),
    trace(
`def serve(tray):
    tray.append('papers')
    tray.append('badge')
    taken = tray.pop()
    return tray[-1]`,
      'serve([])',
      [
        { line: 2, state: { tray: ['papers'] }, ask: 'tray', note: 'The papers go on an empty tray. The end of the list is the top of the tray, and that never changes.' },
        { line: 3, state: { tray: ['papers', 'badge'] }, ask: 'tray', note: 'The badge goes on top of the papers. The papers are still there and still reachable, just not yet.' },
        { line: 4, state: { taken: 'badge', tray: ['papers'] }, ask: 'taken', note: 'pop hands back the sheet that went on last, not the one that went on first. Two pushes and a pop, and the badge is what comes off.' },
        { line: 5, state: { taken: 'badge', tray: ['papers'], returns: 'papers' }, ask: 'returns', note: 'tray[-1] reads the new top and leaves it on the tray, so the tray is still one deep when the function ends.' },
      ],
      { scene: { kind: 'cells', data: 'tray', init: [], pile: true, marks: ['taken'] } }),
    blank('“Two hands on the tray. One reads me the top sheet without taking it, and an empty tray has no top sheet. One puts a sheet on.”',
`def peek(tray):
    if not tray:
        return None
    return ___

def put(tray, sheet):
    ___
    return tray`,
`check("peek(['papers', 'badge'])", 'badge')
check("peek(['papers'])", 'papers')
check("peek([])", None)
check("peek leaves the sheet on the tray", lambda: inplace(peek, ['papers', 'badge']), ['papers', 'badge'])
check("put([], 'papers')", ['papers'])
check("put(['papers'], 'badge')", ['papers', 'badge'])`),
  ],
})
