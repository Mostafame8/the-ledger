import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-list', {
  xp: 30, title: 'The supply crate', algo: 'List',
  steps: [
    explain([
      'Marguerite sets a wooden crate on the table and starts dropping gear into it. Torch, glass cutter, two radios, and room left over.',
      'Dax: “I nailed twelve hooks to the wall for this. One hook, one tool, and I always know which hook.”',
      '“Then we pick up a thirteenth tool and you rebuild the wall. A crate takes what it takes, keeps the order you dropped things in, and counts from zero.”',
    ], { code:
`crate = ['torch', 'cutter']
crate.append('radio')        # ['torch', 'cutter', 'radio']
crate[0]                     # 'torch'
crate[-1]                    # 'radio', the last one
len(crate)                   # 3
crate.pop()                  # 'radio', and the crate is one shorter
crate.insert(0, 'jack')      # ['jack', 'torch', 'cutter']
crate[1:3]                   # ['torch', 'cutter'], a new crate
for item in crate: ...       # in order, front to back`,
      scene: { kind: 'cells', data: 'crate', init: ['torch', 'cutter'],
        states: [{ crate: ['torch', 'cutter'] }, { crate: ['torch', 'cutter', 'radio'] }, { crate: ['jack', 'torch', 'cutter', 'radio'] }, { crate: ['jack', 'torch', 'cutter'] }] },
    }),
    explain([
      '“Reaching in by number is one move, whatever the number. crate[0] and crate[900] cost the same, because the crate knows where every slot sits.”',
      '“The back end is free. append puts one on, pop takes the last one off, and neither cares how much is already in there. Most of what we do lives at that end.”',
      '“The front is not free. insert(0, x) and pop(0) shove every other item along by one, so they cost a move for every item in the crate. Nothing on five. A bill on five thousand.”',
      '“len is free as well. It does not count the gear, it remembers the count.”',
    ]),
    trace(
`def restock(crate):
    crate.append('radio')
    crate.insert(0, 'jack')
    last = crate.pop()
    return len(crate)`,
      "restock(['torch', 'cutter'])",
      [
        { line: 2, state: { crate: ['torch', 'cutter', 'radio'] }, ask: 'crate', note: 'append drops the radio on the back. One move, and nothing else in the crate had to shift.' },
        { line: 3, state: { crate: ['jack', 'torch', 'cutter', 'radio'] }, ask: 'crate', note: 'insert(0, ...) puts the jack at the front, and every other item slid along one slot to make room. That is the expensive one.' },
        { line: 4, state: { last: 'radio', crate: ['jack', 'torch', 'cutter'] }, ask: 'last', note: 'pop with no argument takes the last item off and hands it back. The radio was on the back, so the radio is what you get.' },
        { line: 5, state: { last: 'radio', crate: ['jack', 'torch', 'cutter'], returns: 3 }, ask: 'returns', note: 'Four dropped in, one taken out, three left. Two appends and a pop cost the same whatever the crate holds; the insert at the front did not.' },
      ],
      { scene: { kind: 'cells', data: 'crate', init: ['torch', 'cutter'] } }),
    blank('“Two hands on the crate. One stows a thing on the back, one tells me the newest thing in there without taking it out. An empty crate has no newest thing, so say so.”',
`def stow(crate, item):
    ___
    return crate

def newest(crate):
    if not crate:
        return None
    return ___`,
`check("stow(['torch'], 'radio')", ['torch', 'radio'])
check("stow([], 'jack')", ['jack'])
check("stow works on the crate it was handed", lambda: inplace(stow, ['torch'], 'radio'), ['torch', 'radio'])
check("newest(['torch', 'cutter'])", 'cutter')
check("newest(['torch'])", 'torch')
check("newest([])", None)
check("newest takes nothing out", lambda: inplace(newest, ['torch', 'cutter']), ['torch', 'cutter'])`),
  ],
})
