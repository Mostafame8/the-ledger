import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('same-or-equal', {
  tier: 'D', xp: 90, requires: ['reading-it-back'], gates: ['sameorequal'],
  tools: ['tool-dict'],
  title: 'Same or equal', algo: 'Equality and hashing',
  steps: [
    explain([
      'Two torches from two bags, one line on the manifest. Dax dedupes with set(items) and gets every duplicate back. He writes __eq__, runs it again, and now the set refuses the items altogether.',
      'Dax: “I told it they are equal.” Marguerite: “You told it half.”',
      '“Tell it what equal means, then tell it what hash means. The set asks both, in that order, and they have to agree.”',
    ], { move: 'brute force' }),
    explain([
      '“Out of the box, == is identity: two objects are equal only if they are the same object. __eq__ replaces that. NotImplemented, not False, for a foreign type, so Python can ask the other side.”',
      '“A set or a dict key needs __hash__ too. Hash the same tuple you compare and the promise keeps itself. Write __eq__ alone and Python sets __hash__ to None on purpose.”',
    ], { move: 'pick the pattern', code:
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def __eq__(self, other):
        if not isinstance(other, Item):
            return NotImplemented
        return (self.name, self.price) == (other.name, other.price)
    def __hash__(self):
        return hash((self.name, self.price))

Item('a', 1) == Item('a', 1)           # True
Item('a', 1) is Item('a', 1)           # False
len({Item('a', 1), Item('a', 1)})      # 1
{Item('a', 1): 'x'}[Item('a', 1)]      # 'x'` }),
    trace(
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def __eq__(self, other):
        if not isinstance(other, Item):
            return NotImplemented
        return (self.name, self.price) == (other.name, other.price)
    def __hash__(self):
        return hash((self.name, self.price))

n = len({Item('a', 1), Item('a', 1), Item('b', 1)})`,
      'n',
      [
        { line: 10, state: { same_hash: true }, ask: 'same_hash', note: 'The two (a, 1) items hash the same tuple, so the set looks in one bucket for both.' },
        { line: 8, state: { same_hash: true, returns: true }, ask: 'returns', note: 'Same bucket, so the set asks __eq__. True: one entry, not two.' },
        { line: 8, state: { same_hash: true, returns: false }, ask: 'returns', note: '(b, 1) against (a, 1). Different tuple, different answer, its own entry.' },
        { line: 12, state: { same_hash: true, returns: false, n: 2 }, ask: 'n', note: 'Three objects, two distinct items.' },
      ]),
    spot('Dax writes __eq__ and no __hash__. {Item(\'a\', 1)} gives…',
      ['A set of one',
       'TypeError: unhashable type, because defining __eq__ alone sets __hash__ to None',
       'A set of two',
       'Works, but lookups are slow'],
      1, 'Python refuses to guess a hash for a class that redefined equality; two equal objects with different hashes would corrupt every set and dict. Define both, and hash the same fields you compare.'),
    blank('“Equal by name and price. Hash the same pair.”',
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def __eq__(self, other):
        if not isinstance(other, Item):
            return NotImplemented
        return ___
    def __hash__(self):
        return ___`,
`check("Item('a', 1) == Item('a', 1)", True)
check("Item('a', 1) == Item('a', 2)", False)
check("Item('a', 1) == 'a'", False)
check("len({Item('a', 1), Item('a', 1), Item('b', 1)})", 2)
check("a fresh equal key finds the entry", {Item('a', 1): 'x'}[Item('a', 1)], 'x')
check("Item('a', 1) != Item('a', 2)", True)`),
    mini('Write class Coord(x, y) that is equal and hashable by (x, y), with __repr__ returning Coord(1, 2), and visited(path) returning how many distinct coords a list holds.',
      'Same three methods as the item: __eq__ with NotImplemented for strangers, __hash__ over the same tuple, __repr__. visited is len(set(path)).',
`check("Coord(1, 2) == Coord(1, 2)", True)
check("len({Coord(1, 2), Coord(1, 2)})", 1)
check("visited([Coord(0, 0), Coord(0, 1), Coord(0, 0), Coord(1, 1)])", 3)
check("repr(Coord(1, 2))", 'Coord(1, 2)')
check("Coord(1, 2) == (1, 2)", False)
check("a dict keyed by coords", {Coord(0, 0): 'start'}[Coord(0, 0)], 'start')`),
  ],
})
