import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('walk-the-bag', {
  tier: 'C', xp: 120, requires: ['count-and-reach'], gates: ['walkthebag'],
  tools: ['tool-function'],
  title: 'Walk the bag', algo: 'Iteration protocol',
  steps: [
    explain([
      'The fence wants to walk the bag one item at a time, at her own pace. Dax hands her bag.items. She sorts it in place to read it by price, and the manifest order is gone.',
      'Dax: “She was only supposed to look.” Marguerite: “You gave her the shelf.”',
      '“Hand her a walker, not the shelf. A walker remembers where it is, says the next thing when asked, and says stop when it is done. The bag never moves.”',
    ], { move: 'brute force' }),
    explain([
      '“iter(bag) calls __iter__, which hands back a fresh walker. next(walker) calls its __next__: the next item, or StopIteration when there is none. A walker\'s own __iter__ returns itself, so for can treat it like anything else.”',
      '“Once you have written one of those by hand, yield is the short spelling. A def with yield in it is a walker Python builds for you.”',
    ], { move: 'pick the pattern', code:
`class Bag:
    def __init__(self):
        self._items = []
    def add(self, item):
        self._items.append(item)
        return self
    def __iter__(self):
        return BagWalk(self._items)

class BagWalk:
    def __init__(self, items):
        self._items = items
        self._i = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self._i >= len(self._items):
            raise StopIteration
        item = self._items[self._i]
        self._i += 1
        return item

b = Bag().add('torch').add('cutter')
list(b)               # ['torch', 'cutter']
w = iter(b); next(w)  # 'torch'
list(w)               # ['cutter'], the walker remembers where it is
list(b)               # ['torch', 'cutter'], the bag does not move

class Bag2(Bag):
    def __iter__(self):          # the same walker as a generator
        for item in self._items:
            yield item` }),
    trace(
`class Bag:
    def __init__(self):
        self._items = []
    def add(self, item):
        self._items.append(item)
        return self
    def __iter__(self):
        return BagWalk(self._items)

class BagWalk:
    def __init__(self, items):
        self._items = items
        self._i = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self._i >= len(self._items):
            raise StopIteration
        item = self._items[self._i]
        self._i += 1
        return item

w = iter(Bag().add('a').add('b'))
first = next(w)
rest = list(w)`,
      '(first, rest)',
      [
        { line: 8, state: { walker_i: 0 }, ask: 'walker_i', note: 'iter(bag) ran __iter__, which built a fresh BagWalk standing at position 0.' },
        { line: 21, state: { walker_i: 1, returns: 'a' }, ask: 'returns', note: 'next(w) ran __next__ once: read position 0, moved to 1, handed back the item.' },
        { line: 18, state: { walker_i: 2, returns: 'a', raises: 'StopIteration' }, ask: 'raises', note: 'list(w) kept calling __next__. It got b, moved to 2, and the next call ran off the end and raised.' },
        { line: 25, state: { walker_i: 2, returns: 'a', raises: 'StopIteration', rest: ['b'] }, ask: 'rest', note: 'list heard StopIteration and stopped. The walker had already given away a, so only b remained.' },
      ]),
    spot('Dax makes Bag.__iter__ return self and puts __next__ on Bag itself, with a _i counter. He runs list(bag) twice. The second time…',
      ['The same list as the first time',
       'An empty list, because the bag is its own walker and its position stayed at the end',
       'A TypeError: Bag is not iterable',
       'The list, reversed'],
      1, 'A walker is used up as it walks. If the bag is its own walker there is only one position, and once it has run off the end every later loop sees nothing. iter() handing back a fresh walker each time is the whole point of splitting the two.'),
    blank('“A fresh walker per iter, and a walker that knows when it is done.”',
`class Bag:
    def __init__(self):
        self._items = []
    def add(self, item):
        self._items.append(item)
        return self
    def __iter__(self):
        return ___

class BagWalk:
    def __init__(self, items):
        self._items = items
        self._i = 0
    def __iter__(self):
        return self
    def __next__(self):
        if ___:
            raise StopIteration
        item = self._items[self._i]
        ___
        return item`,
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("list(Bag())", [])
_t_b = Bag().add('torch').add('cutter')
check("items in insertion order", list(_t_b), ['torch', 'cutter'])
_t_w = iter(_t_b); next(_t_w)
check("a second walker starts fresh", (list(_t_w), list(_t_b)), (['cutter'], ['torch', 'cutter']))
check("an empty walk stops at once", _t_raises(lambda: next(iter(Bag()))), 'StopIteration')
_t_v = iter(_t_b)
check("iter(walker) is the walker", iter(_t_v) is _t_v, True)
check("sum(1 for _ in _t_b)", 2)`),
    mini('Write class Countdown(n) whose __iter__ is a generator yielding n, n-1, ..., 1, and class Pairs(items) whose __iter__ yields (items[i], items[i+1]) for every neighbouring pair. Then total_gaps(values) returning the sum of b - a over Pairs(values).',
      'A def with yield in it is the walker. Countdown loops range(n, 0, -1); Pairs loops range(len(items) - 1). total_gaps is a sum over the pairs.',
`check("list(Countdown(3))", [3, 2, 1])
check("list(Countdown(0))", [])
check("list(Pairs([1, 4, 9]))", [(1, 4), (4, 9)])
check("list(Pairs([7]))", [])
check("total_gaps([1, 4, 9])", 8)
_t_c = Countdown(2)
check("two walks of one Countdown are both full", (list(_t_c), list(_t_c)), ([2, 1], [2, 1]))`),
  ],
})
