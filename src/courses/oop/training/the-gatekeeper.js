import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('the-gatekeeper', {
  tier: 'A', xp: 200, requires: ['the-guarded-field', 'other-doors-in'], gates: ['typedfield'],
  tools: ['tool-decorator'],
  title: 'The gatekeeper', algo: 'Descriptors',
  steps: [
    explain([
      'Four fields on the entry must be positive. Dax writes the same property setter four times, twelve lines each, and the fourth has a typo that lets zero through.',
      'Dax: “I copied it exactly.” Marguerite: “Exactly three times.”',
      '“One gatekeeper, hired once, stands at every door you name. The class says price = Positive() and qty = Positive(), and both doors are guarded by the same twelve lines.”',
    ], { move: 'brute force' }),
    explain([
      '“An object with __get__ and __set__ placed on the class becomes the door for that name. Every read of e.price runs __get__; every write runs __set__. __set_name__ tells it, once, which name it guards.”',
      '“It keeps nothing itself. It stores the value on the instance under a private name, so two entries have two prices and one gatekeeper. @property is a gatekeeper Python wrote for you.”',
    ], { move: 'pick the pattern', code:
`class Positive:
    def __set_name__(self, owner, name):
        self.private = '_' + name
    def __get__(self, obj, owner):
        if obj is None:
            return self
        return getattr(obj, self.private)
    def __set__(self, obj, value):
        if not value > 0:
            raise ValueError(f"{self.private[1:]} must be positive")
        setattr(obj, self.private, value)

class Entry:
    price = Positive()
    qty = Positive()
    def __init__(self, price, qty):
        self.price = price
        self.qty = qty

e = Entry(5, 2)
e.price               # 5, through __get__
e.qty = 0             # ValueError, through __set__
vars(e)               # {'_price': 5, '_qty': 2}
type(Entry.price)     # Positive: asked on the class, obj is None` }),
    trace(
`class Positive:
    def __set_name__(self, owner, name):
        self.private = '_' + name
    def __get__(self, obj, owner):
        if obj is None:
            return self
        return getattr(obj, self.private)
    def __set__(self, obj, value):
        if not value > 0:
            raise ValueError(f"{self.private[1:]} must be positive")
        setattr(obj, self.private, value)

class Entry:
    price = Positive()
    qty = Positive()
    def __init__(self, price, qty):
        self.price = price
        self.qty = qty

e = Entry(5, 2)
e.qty = 3
snap = vars(e)`,
      'snap',
      [
        { line: 3, state: { private: '_price' }, ask: 'private', note: '__set_name__ ran while Entry was being built, once for price and once for qty. Each gatekeeper learned its own door.' },
        { line: 11, state: { private: '_price', stored: { _price: 5 } }, ask: 'stored', note: 'self.price = price in __init__ is not a plain write. It ran __set__, which checked 5 and put it on the instance as _price.' },
        { line: 11, state: { private: '_price', stored: { _price: 5, _qty: 3 } }, ask: 'stored', note: 'e.qty = 3 is the same door through the other gatekeeper: check, then store under _qty.' },
        { line: 22, state: { private: '_price', stored: { _price: 5, _qty: 3 }, snap: { _price: 5, _qty: 3 } }, ask: 'snap', note: 'The instance holds only the private names. price and qty live on the class, as gatekeepers.' },
      ]),
    spot('Dax writes self.value = value inside Positive.__set__, storing on the gatekeeper instead of on obj. Two entries then…',
      ['Keep separate prices, as before',
       'Share one price, because there is one Positive per class, not one per instance',
       'Raise AttributeError on every read',
       'Cannot be built at all'],
      1, 'A descriptor is a class-level object; every instance of Entry goes through the same one. Per-instance state has to live on obj, under the private name. Store it on self and the last entry written wins for everyone.'),
    blank('“One gatekeeper for every positive field. Learn the name, check the value, store it on the instance.”',
`class Positive:
    def __set_name__(self, owner, name):
        ___
    def __get__(self, obj, owner):
        if obj is None:
            return self
        return getattr(obj, self.private)
    def __set__(self, obj, value):
        if ___:
            raise ValueError('must be positive')
        ___

class Entry:
    price = Positive()
    qty = Positive()
    def __init__(self, price, qty):
        self.price = price
        self.qty = qty`,
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Entry(5, 2).price", 5)
check("zero is refused", _t_raises(lambda: setattr(Entry(5, 2), 'price', 0)), 'ValueError')
check("and refused at birth", _t_raises(lambda: Entry(-1, 1)), 'ValueError')
_t_a = Entry(5, 2); _t_b = Entry(7, 3); _t_a.price = 9
check("two entries keep separate values", (_t_a.price, _t_b.price), (9, 7))
check("type(Entry.price).__name__", 'Positive')
check("'_price' in vars(Entry(5, 2))", True)`),
    mini('Write class Typed(kind), a gatekeeper whose __set__ raises TypeError unless isinstance(value, kind), storing under \'_\' + name; and class Line with name = Typed(str), qty = Typed(int) and __init__(name, qty) assigning both.',
      'Save kind in __init__. Then the same three methods as Positive, with isinstance in place of the > 0 check.',
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Line('torch', 2).name", 'torch')
check("Line('torch', 2).qty", 2)
check("a number where a name should be", _t_raises(lambda: Line(5, 2)), 'TypeError')
check("a string where a count should be", _t_raises(lambda: setattr(Line('a', 1), 'qty', 'x')), 'TypeError')
check("a bool is an int", Line('a', True).qty, True)
check("vars(Line('a', 1))", {'_name': 'a', '_qty': 1})`),
  ],
})
