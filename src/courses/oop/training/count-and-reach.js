import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('count-and-reach', {
  tier: 'D', xp: 100, requires: ['the-tags-own-moves'], gates: ['countandreach'],
  tools: ['tool-tuple'],
  title: 'Count and reach', algo: 'Sequence protocol',
  steps: [
    explain([
      'Dax\'s Bag has a public .items list and everyone reaches in: len(bag.items), bag.items[0], x in bag.items. He renames items to contents and forty lines break before lunch.',
      'Dax: “Then nobody renames anything.” Marguerite: “Then nobody improves anything.”',
      '“Answer the three questions yourself. How many. Which one. Is it here. Then the bag behaves like every list in the building and nobody needs to know what is inside.”',
    ], { move: 'brute force' }),
    explain([
      '“__len__ answers len(bag). __getitem__ answers bag[i], and if you hand its argument straight to the inner list, negatives, slices and IndexError all come free. __contains__ answers in.”',
      '“One more thing for free: with __getitem__ alone, for item in bag works. Python counts from 0 and stops at the first IndexError.”',
    ], { move: 'pick the pattern', code:
`class Bag:
    def __init__(self):
        self._items = []
    def add(self, item):
        self._items.append(item)
        return self
    def __len__(self):
        return len(self._items)
    def __getitem__(self, i):
        return self._items[i]
    def __contains__(self, name):
        return any(it.name == name for it in self._items)

b = Bag().add(Item('torch', 5)).add(Item('cutter', 10))
len(b)              # 2
b[-1].name          # 'cutter'
b[0:1]              # a list of one Item
'torch' in b        # True
[it.name for it in b]   # ['torch', 'cutter'], no __iter__ needed` }),
    trace(
`class Item:
    def __init__(self, name): self.name = name

class Bag:
    def __init__(self):
        self._items = []
    def add(self, item):
        self._items.append(item)
        return self
    def __getitem__(self, i):
        return self._items[i]

names = [it.name for it in Bag().add(Item('a')).add(Item('b'))]`,
      'names',
      [
        { line: 11, state: { i: 0 }, ask: 'i', note: 'No __iter__ on Bag, so for falls back to asking bag[0], bag[1], ... in turn.' },
        { line: 11, state: { i: 1 }, ask: 'i', note: 'Second ask. The inner list answers with the second item.' },
        { line: 11, state: { i: 2, raises: 'IndexError' }, ask: 'raises', note: 'Third ask runs off the end. The list raises IndexError, for hears it, and the loop ends cleanly.' },
        { line: 13, state: { i: 2, raises: 'IndexError', names: ['a', 'b'] }, ask: 'names', note: 'Two names collected before the stop.' },
      ]),
    spot('Dax writes a __getitem__ that returns None past the end instead of letting IndexError out. for it in bag now…',
      ['Stops at the end as before',
       'Never stops, because for waits for IndexError and None is just another value',
       'Raises TypeError',
       'Skips the last item'],
      1, 'The sequence protocol ends a loop on IndexError. Swallow it and every for over the bag runs forever, yielding None. Let the inner list raise.'),
    blank('“Count, reach, answer to a name. Hand the index to the list and let it do the work.”',
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price

class Bag:
    def __init__(self):
        self._items = []
    def add(self, item):
        self._items.append(item)
        return self
    def __len__(self):
        return ___
    def __getitem__(self, i):
        return ___
    def __contains__(self, name):
        return ___`,
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("len(Bag())", 0)
_t_b = Bag().add(Item('torch', 5)).add(Item('cutter', 10)).add(Item('tape', 2))
check("len after three adds", len(_t_b), 3)
check("bag[0]", _t_b[0].name, 'torch')
check("bag[-1]", _t_b[-1].name, 'tape')
check("a slice is a list of two", len(_t_b[0:2]), 2)
check("'torch' in bag, 'x' in bag", ('torch' in _t_b, 'x' in _t_b), (True, False))
check("past the end", _t_raises(lambda: _t_b[5]), 'IndexError')`),
    mini('Write class Shelf(width) holding up to width items: put(item) raises ValueError when the shelf is full and returns self otherwise. Give it __len__, __getitem__ and __contains__ (by item name). Then names(shelf) returning every item\'s name using a plain for loop over the shelf itself.',
      'The same three methods over an inner list. names loops for item in shelf, never over the list directly; the fallback to __getitem__ makes that work.',
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
class _t_I:
    def __init__(self, name): self.name = name
_t_s = Shelf(3).put(_t_I('torch')).put(_t_I('cutter'))
check("len(shelf)", len(_t_s), 2)
check("a full shelf refuses", _t_raises(lambda: Shelf(1).put(_t_I('a')).put(_t_I('b'))), 'ValueError')
check("shelf[1].name", _t_s[1].name, 'cutter')
check("'torch' in shelf", 'torch' in _t_s, True)
check("names(shelf)", names(_t_s), ['torch', 'cutter'])
check("len(shelf[0:2])", len(_t_s[0:2]), 2)`),
  ],
})
