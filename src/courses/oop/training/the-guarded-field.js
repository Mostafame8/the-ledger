import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('the-guarded-field', {
  tier: 'F', xp: 55, requires: ['the-tags-own-moves'], gates: ['guardedprice'],
  tools: ['tool-decorator'],
  title: 'The guarded field', algo: 'Properties',
  steps: [
    explain([
      'Dax has set_price(item, p) that refuses negatives. He also has forty lines across the plan that write item.price = ... straight past it, and one of them writes -3.',
      'Dax: “People should use set_price.” Marguerite: “People should. The manifest is paying the fence for a torch.”',
      '“A check nobody has to remember to call is the only check that runs. Put it behind the dot.”',
    ], { move: 'brute force' }),
    explain([
      '“@property turns a method into a read: item.price runs it. @price.setter turns a second method into the write: item.price = 7 runs that. The dot never changes; what happens behind it does.”',
      '“Write self.price = price in __init__, not self._price, so birth goes through the same door. And a property with no setter is read-only for free.”',
    ], { move: 'pick the pattern', code:
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price          # goes through the setter
    @property
    def price(self):
        return self._price
    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError('price below zero')
        self._price = value
    @property
    def label(self):
        return f"{self.name} @ {self.price}"

i = Item('torch', 5)
i.price = 7          # setter runs
i.price = -1         # ValueError
i.label              # 'torch @ 7'
i.label = 'x'        # AttributeError: can't set attribute` }),
    trace(
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    @property
    def price(self):
        return self._price
    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError('price below zero')
        self._price = value
    @property
    def label(self):
        return f"{self.name} @ {self.price}"

def mark_down(item, n):
    item.price = item.price - n
    return item.label`,
      "mark_down(Item('torch', 5), 2)",
      [
        { line: 12, state: { _price: 5 }, ask: '_price', note: 'self.price = price in __init__ did not write a field called price. It ran the setter, which checked 5 and stored it under _price.' },
        { line: 12, state: { _price: 3 }, ask: '_price', note: 'item.price - n read through the getter, and the assignment went through the same setter. 3 passes the check.' },
        { line: 19, state: { _price: 3, returns: 'torch @ 3' }, ask: 'returns', note: 'label is a read-only property. It reads price, which reads _price.' },
      ]),
    spot('Dax writes self._price = price in __init__ and keeps the setter as written. Item(\'a\', -3) gives…',
      ['ValueError',
       'An Item with price -3, because the check lives in the setter and __init__ walked past it',
       'AttributeError',
       'A price of 0'],
      1, 'The guard only runs when the property is assigned. Writing the backing field directly skips it. __init__ should write self.price = price so birth goes through the door like everyone else.'),
    blank('“Guard the field. The read returns it; the write checks, then stores.”',
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    @property
    def price(self):
        return ___
    @price.setter
    def price(self, value):
        if ___:
            raise ValueError('price below zero')
        ___
    @property
    def label(self):
        return f"{self.name} @ {self.price}"`,
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Item('a', 5).price", 5)
_t_i = Item('a', 5); _t_i.price = 7
check("a good price is stored", _t_i.price, 7)
check("a negative price is refused", _t_raises(lambda: setattr(_t_i, 'price', -1)), 'ValueError')
check("and refused at birth", _t_raises(lambda: Item('a', -3)), 'ValueError')
check("Item('a', 5).label", 'a @ 5')
check("label follows the price", _t_i.label, 'a @ 7')`),
    mini('Write class Vault(capacity) with a load property starting at 0 whose setter raises ValueError when the new load is below 0 or above capacity, a read-only free property returning capacity - load, and put(n) and take(n) that move load through the setter and return self.',
      'put does self.load = self.load + n and take subtracts; the setter is the only place that checks. free has no setter.',
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Vault(10).free", 10)
check("put then load", Vault(10).put(4).load, 4)
check("take", Vault(10).put(4).take(1).load, 3)
check("over capacity is refused", _t_raises(lambda: Vault(10).put(11)), 'ValueError')
check("below zero is refused", _t_raises(lambda: Vault(10).take(1)), 'ValueError')
check("free after moves", Vault(10).put(4).take(1).free, 7)
check("free is read-only", _t_raises(lambda: setattr(Vault(10), 'free', 3)), 'AttributeError')`),
  ],
})
