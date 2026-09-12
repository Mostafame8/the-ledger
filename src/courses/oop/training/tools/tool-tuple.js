import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-tuple', {
  xp: 30, title: 'The sealed pair', algo: 'Tuple',
  steps: [
    explain([
      'Dax writes a pair as a two-item list, [\'torch\', 5]. Somewhere downstream somebody appends a third thing to it and nobody notices for a week.',
      '“A tuple is a list that has been sealed,” Marguerite says. “Nothing goes in or out. So it can be a dict key, and it can be trusted.”',
      '“Unpack it into names on the way out. And when the seats need names of their own, namedtuple is the smallest class you can make.”',
    ], { code:
`p = ('torch', 5)
p[0]                       # 'torch'
name, price = p            # unpacking
p[1] = 6                   # TypeError: 'tuple' object does not support item assignment

where = {('vault', 2): 'safe', ('vault', 3): 'lockers'}
where[('vault', 3)]        # 'lockers'

from collections import namedtuple
Pair = namedtuple('Pair', 'name price')
q = Pair('torch', 5)
q.name, q.price, q[1]      # ('torch', 5, 5)
q == ('torch', 5)          # True` }),
    explain([
      '“A tuple hashes when everything inside it does. (name, price) is a fine dict key and a fine set member; (name, [price]) is not.”',
      '“Unpacking is the same move inside a loop: for name, price in pairs. A star catches the middle: first, *mid, last = t.”',
      '“One seat: (5,) with the comma. (5) is just five in brackets.”',
    ]),
    trace(
`def swap_ends(t):
    first, *mid, last = t
    out = (last, *mid, first)
    return out`,
      'swap_ends((1, 2, 3, 4))',
      [
        { line: 2, state: { first: 1, mid: [2, 3], last: 4 }, ask: 'mid', note: 'The starred name catches everything between the ends, as a list.' },
        { line: 3, state: { first: 1, mid: [2, 3], last: 4, out: { py: '(4, 2, 3, 1)' } }, ask: 'out', note: 'A star on the way in spreads mid back out, so the new tuple is flat.' },
        { line: 4, state: { first: 1, mid: [2, 3], last: 4, out: { py: '(4, 2, 3, 1)' }, returns: { py: '(4, 2, 3, 1)' } }, ask: 'returns', note: 'Sealed. The caller cannot change a seat by accident.' },
      ]),
    blank('“Seal every (name, price) pair and index it by position.”',
`def index(items):
    return {___: i for i, (name, price) in enumerate(items)}`,
`check("index([('torch', 5), ('cutter', 10)])", {('torch', 5): 0, ('cutter', 10): 1})
check("index([])", {})
check("index([('a', 1)])[('a', 1)]", 0)
check("a repeated pair keeps the last index", index([('a', 1), ('b', 2), ('a', 1)])[('a', 1)], 2)
check("all(type(k) is tuple for k in index([('a', 1), ('b', 2)]))", True)
check("len(index([('a', 1), ('b', 2), ('c', 3)]))", 3)`),
  ],
})
