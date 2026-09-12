import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('put-them-in-order', {
  tier: 'D', xp: 95, requires: ['same-or-equal'], gates: ['inorder'],
  tools: ['tool-tuple'],
  title: 'Put them in order', algo: 'Ordering',
  steps: [
    explain([
      'The fence reads prices low to high, ties by name. Dax passes key=lambda i: (i.price, i.name) to five sorts and two mins across the plan, and one of the seven says i.pric.',
      'Dax: “Seven is not many.” Marguerite: “Seven is six too many.”',
      '“The item knows what comes before it. Say it once, on the class, and every sort in the building agrees.”',
    ], { move: 'brute force' }),
    explain([
      '“__lt__ is the one question sorted, min and max ask. Compare tuples and the tie-break comes free: (price, name) against (price, name).”',
      '“Write __eq__ and __lt__, put @functools.total_ordering above the class, and it writes >, <= and >= for you. NotImplemented for strangers, as before.”',
    ], { move: 'pick the pattern', code:
`import functools

@functools.total_ordering
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def _key(self):
        return (self.price, self.name)
    def __eq__(self, other):
        return self._key() == other._key() if isinstance(other, Item) else NotImplemented
    def __lt__(self, other):
        return self._key() < other._key() if isinstance(other, Item) else NotImplemented

sorted([Item('x', 9), Item('y', 1), Item('z', 1)])   # y, z, x
Item('a', 5) >= Item('a', 5)                         # True, from total_ordering` }),
    trace(
`import functools

@functools.total_ordering
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def _key(self):
        return (self.price, self.name)
    def __eq__(self, other):
        return self._key() == other._key() if isinstance(other, Item) else NotImplemented
    def __lt__(self, other):
        return self._key() < other._key() if isinstance(other, Item) else NotImplemented

c = min([Item('x', 9), Item('y', 1), Item('z', 1)]).name`,
      'c',
      [
        { line: 13, state: { keys: { py: "((1, 'y'), (9, 'x'))" } }, ask: 'keys', note: 'min holds x and meets y. It asks y < x, which becomes a tuple comparison of the two keys.' },
        { line: 13, state: { keys: { py: "((1, 'y'), (9, 'x'))" }, returns: true }, ask: 'returns', note: '1 < 9 settles it in the first seat. y is the new smallest.' },
        { line: 13, state: { keys: { py: "((1, 'z'), (1, 'y'))" }, returns: true }, ask: 'keys', note: 'Now z against y. Same price, so the tuple moves to the second seat.' },
        { line: 13, state: { keys: { py: "((1, 'z'), (1, 'y'))" }, returns: false }, ask: 'returns', note: "'z' < 'y' is False. y keeps its place." },
        { line: 15, state: { keys: { py: "((1, 'z'), (1, 'y'))" }, returns: false, c: 'y' }, ask: 'c', note: 'min never needed a key function. The item carried its own.' },
      ]),
    spot('Dax writes __lt__ only: no total_ordering, no __gt__. Item(\'b\', 7) > Item(\'a\', 5) gives…',
      ['TypeError: > is not supported',
       'True, because Python tries the reflected Item(\'a\', 5) < Item(\'b\', 7) when __gt__ is missing',
       'False',
       'NotImplemented'],
      1, 'Python reflects a missing > into the other side\'s <. That covers > and < from one method, but <= and >= still need their own, which is what total_ordering writes for you.'),
    blank('“Price first, then name. Two methods; the decorator writes the rest.”',
`import functools

@functools.___
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def _key(self):
        return ___
    def __eq__(self, other):
        return self._key() == other._key() if isinstance(other, Item) else NotImplemented
    def __lt__(self, other):
        return ___ if isinstance(other, Item) else NotImplemented`,
`check("Item('a', 5) < Item('b', 7)", True)
check("a tie on price breaks on name", Item('a', 5) < Item('b', 5), True)
check("Item('b', 7) > Item('a', 5)", True)
check("Item('a', 5) <= Item('a', 5)", True)
check("[i.name for i in sorted([Item('x', 9), Item('y', 1), Item('z', 5)])]", ['y', 'z', 'x'])
check("max([Item('x', 9), Item('y', 1)]).name", 'x')`),
    mini('Write @functools.total_ordering class Version(text) that parses \'1.2.10\' into a tuple of ints stored in parts, is ordered and equal by that tuple, and has __repr__ returning Version(\'1.2.10\'). Then newest(versions) returning the newest version\'s text.',
      'parts = tuple(int(p) for p in text.split(\'.\')). Compare parts in __eq__ and __lt__; newest is max(versions).text.',
`check("Version('1.2.10') > Version('1.2.9')", True)
check("Version('1.2') == Version('1.2')", True)
check("[v.text for v in sorted([Version('2.0'), Version('1.10'), Version('1.9')])]", ['1.9', '1.10', '2.0'])
check("newest([Version('1.9.9'), Version('2'), Version('1.10')])", '2')
check("Version('2') >= Version('1.9.9')", True)
check("repr(Version('1.2.10'))", "Version('1.2.10')")`),
  ],
})
