import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('the-tags-own-moves', {
  tier: 'F', xp: 45, requires: ['the-stamped-tag'], gates: ['worth'],
  tools: ['tool-function'],
  title: 'The tag\'s own moves', algo: 'Methods and self',
  steps: [
    explain([
      'Dax has worth(item) and label(item) as loose functions in a file called utils. When Item grows a qty field, three copies of worth in three files disagree about whether to multiply.',
      'Dax: “I will grep for them.” Marguerite: “You will grep for them this week.”',
      '“A move that only makes sense with an item belongs to the item. Put it in the class and there is one copy, and it always knows which tag it is holding.”',
    ], { move: 'brute force' }),
    explain([
      '“A method is a function written inside the class. i.worth() is Item.worth(i): Python puts the tag in the first seat, and that seat is called self.”',
      '“A method that changes the tag can hand the tag back. Then the next call chains straight on: i.restock(3).worth().”',
    ], { move: 'pick the pattern', code:
`class Item:
    def __init__(self, name, price, qty=1):
        self.name = name
        self.price = price
        self.qty = qty
    def worth(self):
        return self.price * self.qty
    def restock(self, n):
        self.qty += n
        return self

i = Item('torch', 5, 2)
i.worth()             # 10
i.restock(3).worth()  # 25
Item.worth(i)         # 25, the same call spelled long` }),
    trace(
`class Item:
    def __init__(self, name, price, qty=1):
        self.name = name
        self.price = price
        self.qty = qty
    def worth(self):
        return self.price * self.qty
    def restock(self, n):
        self.qty += n
        return self`,
      "Item('torch', 5, 2).restock(3).worth()",
      [
        { line: 9, state: { qty: 5 }, ask: 'qty', note: 'restock is handed the tag as self. self.qty += 3 reads 2 off it and writes 5 back.' },
        { line: 10, state: { qty: 5, returns_self: true }, ask: 'returns_self', note: 'It hands the same tag back. Without this line the result would be None and .worth() on None would blow up.' },
        { line: 7, state: { qty: 5, returns_self: true, returns: 25 }, ask: 'returns', note: 'worth reads price and qty off the tag it was handed. 5 times 5.' },
      ]),
    spot('Dax writes def worth(): return price * qty inside the class, with no self. Calling i.worth() gives…',
      ['25',
       'TypeError: worth() takes 0 positional arguments but 1 was given, because the instance is always passed in first',
       'NameError only, since price is not defined',
       '0'],
      1, 'Python always hands the instance to a method as its first argument. A def with no seat for it fails before the body runs. self is not a keyword, it is that first seat, and every method needs one.'),
    blank('“Give the bag its moves. add hands the bag back so calls chain; total asks each item for its worth.”',
`class Bag:
    def __init__(self):
        self.items = []
    def add(self, item):
        self.items.append(item)
        return ___
    def total(self):
        return sum(___ for i in self.items)`,
`class _t_I:
    def __init__(self, w): self.w = w
    def worth(self): return self.w
check("Bag().total()", 0)
check("chained adds total up", Bag().add(_t_I(5)).add(_t_I(15)).total(), 20)
check("add hands the bag back", type(Bag().add(_t_I(1))).__name__, 'Bag')
_t_b = Bag().add(_t_I(1)).add(_t_I(2))
check("len(_t_b.items)", 2)
_t_b.add(_t_I(10))
check("total after a third add", _t_b.total(), 13)
_t_x = _t_I(1); _t_c = Bag().add(_t_x); _t_x.w = 50
check("total asks the item each time", _t_c.total(), 50)`),
    mini('Write class Counter(start=0) with tick() adding one and returning self, reset() setting the count back to start and returning self, and value() returning the count.',
      'Store start and the running count in __init__. Every method that changes the count returns self so calls chain.',
`check("Counter().value()", 0)
check("three ticks", Counter().tick().tick().tick().value(), 3)
check("reset goes back to start", Counter().tick().tick().reset().value(), 0)
check("Counter(5).tick().value()", 6)
check("reset after ticks returns to start", Counter(5).tick().tick().reset().value(), 5)
_t_a = Counter(); _t_b = Counter(); _t_a.tick()
check("two counters are independent", (_t_a.value(), _t_b.value()), (1, 0))`),
  ],
})
