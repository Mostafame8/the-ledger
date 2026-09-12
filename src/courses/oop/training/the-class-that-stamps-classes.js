import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('the-class-that-stamps-classes', {
  tier: 'S', xp: 300, requires: ['the-attribute-trap', 'two-parents'], gates: ['selfregister', 'manifest'],
  tools: ['tool-type'],
  title: 'The class that stamps classes', algo: 'Metaclasses and init_subclass',
  steps: [
    explain([
      'New kinds of loot every week: cash, stones, bonds, a painting nobody wants to say out loud. Dax keeps a dict of kind name to class and updates it by hand. One week he forgets, and the fence asks what a "gem" is.',
      'Dax: “I will add it to the dict.” Marguerite: “You will add it to the dict the week after you forget, every time.”',
      '“A kind signs itself in the moment it is defined. The parent watches its children being born.”',
    ], { move: 'brute force' }),
    explain([
      '“__init_subclass__ runs on the parent once per new child, with the child as cls and any keywords from the class line. Write the child into a dict on the base and the book is never edited by hand.”',
      '“The class statement itself is a call: type(name, bases, namespace). type is a class whose instances are classes. When the book must be written before the class exists, you subclass type and step in at __new__.”',
    ], { move: 'pick the pattern', code:
`class Entry:
    kinds = {}
    def __init_subclass__(cls, kind=None, **kw):
        super().__init_subclass__(**kw)
        Entry.kinds[kind or cls.__name__.lower()] = cls
    @classmethod
    def build(cls, kind, *args):
        return cls.kinds[kind](*args)

class Cash(Entry):
    def __init__(self, amount): self.amount = amount

class Gem(Entry, kind='stone'):
    def __init__(self, amount): self.amount = amount

Entry.kinds                          # {'cash': Cash, 'stone': Gem}
type(Entry.build('stone', 3)).__name__   # 'Gem'

Bond = type('Bond', (Entry,), {})    # the class statement, spelled out
'bond' in Entry.kinds                # True: __init_subclass__ ran for it too

class Counted(type):                 # a class whose instances are classes
    made = 0
    def __new__(mcls, name, bases, ns):
        Counted.made += 1
        return super().__new__(mcls, name, bases, ns)

class A(metaclass=Counted): pass
class B(metaclass=Counted): pass
Counted.made                         # 2` }),
    trace(
`class Entry:
    kinds = {}
    def __init_subclass__(cls, kind=None, **kw):
        super().__init_subclass__(**kw)
        Entry.kinds[kind or cls.__name__.lower()] = cls
    @classmethod
    def build(cls, kind, *args):
        return cls.kinds[kind](*args)

class Cash(Entry):
    def __init__(self, amount): self.amount = amount

class Gem(Entry, kind='stone'):
    def __init__(self, amount): self.amount = amount

Bond = type('Bond', (Entry,), {})
book = sorted(Entry.kinds)`,
      'book',
      [
        { line: 5, state: { key: 'cash' }, ask: 'key', note: 'class Cash(Entry) finished building, and __init_subclass__ ran on Entry with cls = Cash and no keyword. The name, lowered, is the key.' },
        { line: 5, state: { key: 'stone' }, ask: 'key', note: 'kind=\'stone\' in the class line arrived as the kind argument. The keyword never reaches the class body.' },
        { line: 5, state: { key: 'bond' }, ask: 'key', note: 'type(...) is the class statement spelled out. The hook does not care which spelling made the child.' },
        { line: 17, state: { key: 'bond', book: ['bond', 'cash', 'stone'] }, ask: 'book', note: 'Three kinds signed in. Nobody edited the dict.' },
      ]),
    spot('Dax writes cls.kinds[key] = cls inside __init_subclass__ instead of Entry.kinds[key] = cls. Where do grandchildren land?',
      ['In Entry.kinds, since reading cls.kinds falls through to the one dict on Entry and mutates it in place',
       'In a fresh dict on the grandchild',
       'Nowhere; the line raises',
       'TypeError: cls has no kinds'],
      0, 'Reading cls.kinds is an attribute lookup that falls through the family line to the dict on Entry, and the item assignment mutates that same dict. Only cls.kinds = {} would make a private copy. It is the mirror of the class-counter trap: know whether you are reading and mutating or assigning.'),
    blank('“The parent signs each child into the book as it is born.”',
`class Entry:
    kinds = {}
    def __init_subclass__(cls, kind=None, **kw):
        ___
        ___
    @classmethod
    def build(cls, kind, *args):
        return ___

class Cash(Entry):
    def __init__(self, amount): self.amount = amount

class Gem(Entry, kind='stone'):
    def __init__(self, amount): self.amount = amount`,
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Entry.kinds['cash'] is Cash", True)
check("Entry.kinds['stone'] is Gem", True)
check("'entry' in Entry.kinds", False)
check("type(Entry.build('cash', 5)).__name__", 'Cash')
check("an unknown kind", _t_raises(lambda: Entry.build('air')), 'KeyError')
class _t_Bond(Entry):
    def __init__(self, amount): self.amount = amount
check("a new child signs itself in", Entry.kinds.get('_t_bond') is _t_Bond, True)`),
    mini('Write class Named(type) whose __new__(mcls, name, bases, ns) adds ns[\'label\'] = name.lower() before calling super().__new__(mcls, name, bases, ns). Then class Loot(metaclass=Named) with an empty body and class Cash(Loot) with an empty body, and labels(*classes) returning the list of their label attributes.',
      'ns is the class body dict. Write into it, then hand everything up to type. Every class Named builds, children included, gets its own label.',
`check("Loot.label", 'loot')
check("Cash.label", 'cash')
check("type(Loot).__name__", 'Named')
check("labels(Loot, Cash)", ['loot', 'cash'])
check("isinstance(Cash, Named)", True)
check("Cash().label", 'cash')`),
  ],
})
