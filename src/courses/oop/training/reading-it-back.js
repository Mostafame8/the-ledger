import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('reading-it-back', {
  tier: 'F', xp: 50, requires: ['the-stamped-tag'], gates: ['readback'],
  tools: ['tool-function'],
  title: 'Reading it back', algo: 'repr and str',
  steps: [
    explain([
      'Dax prints the bag and gets a column of <Item object at 0x7f3a...>. His fix is a show(item) function that prints the fields, which he forgets to call in the one place it matters.',
      'Dax: “I know which one is the torch. It is the third one.”',
      '“Python already asks the object how to print itself,” Marguerite says. “Every time. You are the only one not answering.”',
    ], { move: 'brute force' }),
    explain([
      '“Two answers. __repr__ is for us: exact, and if you can manage it, something eval could rebuild. __str__ is for the fence: plain.”',
      '“print and f-strings ask for str. A list asks each member for repr. If you only write __repr__, str falls back to it, so write __repr__ first.”',
    ], { move: 'pick the pattern', code:
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def __repr__(self):
        return f"Item({self.name!r}, {self.price})"
    def __str__(self):
        return f"{self.name} @ {self.price}"

i = Item('torch', 5)
repr(i)           # "Item('torch', 5)"
str(i)            # 'torch @ 5'
[i]               # [Item('torch', 5)]
print(i)          # torch @ 5` }),
    trace(
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def __repr__(self):
        return f"Item({self.name!r}, {self.price})"
    def __str__(self):
        return f"{self.name} @ {self.price}"

def line(items):
    return ', '.join(str(i) for i in items)`,
      "line([Item('a', 1), Item(\"b's\", 2)])",
      [
        { line: 8, state: { returns: 'a @ 1' }, ask: 'returns', note: 'str(i) reaches for __str__. Plain text, no quotes around the name.' },
        { line: 8, state: { returns: "b's @ 2" }, ask: 'returns', note: 'Second item, same reading. The apostrophe in the name is just a character here.' },
        { line: 11, state: { returns: "a @ 1, b's @ 2" }, ask: 'returns', note: 'join glues the two plain readings.' },
        { line: 6, state: { returns: "a @ 1, b's @ 2", repr_b: "Item(\"b's\", 2)" }, ask: 'repr_b', note: 'Had this been a list, each member would print with repr instead. !r picks double quotes so the apostrophe survives, and eval could rebuild it.' },
      ]),
    spot('Dax defines only __str__. He prints a list of three items and sees [<Item object at 0x...>, <Item object at 0x...>, ...]. Why?',
      ['Lists call repr on their members, and no __repr__ was written',
       '__str__ needs a decorator to work inside lists',
       'Lists cannot hold objects with custom printing',
       'print ignores __str__ when given a list'],
      0, 'Containers show their members with repr, never str. Define __repr__ first; str falls back to it when __str__ is missing, but repr never falls back to str.'),
    blank('“Two readings for a tag. Exact for us, plain for the fence.”',
`class Tag:
    def __init__(self, name, serial):
        self.name = name
        self.serial = serial
    def __repr__(self):
        return ___
    def __str__(self):
        return ___`,
`check("repr(Tag('torch', 'HB001'))", "Tag('torch', 'HB001')")
check("str(Tag('torch', 'HB001'))", 'HB001 torch')
check("eval(repr(Tag('torch', 'HB001'))).serial", 'HB001')
check("repr([Tag('a', 'X1')])", "[Tag('a', 'X1')]")
check("f\\"{Tag('torch', 'HB001')}\\"", 'HB001 torch')
check("repr(Tag(\\"bad 'un\\", 'X2'))", "Tag(\\"bad 'un\\", 'X2')")`),
    mini('Write class Money(pence) with __repr__ returning Money(250), __str__ returning £2.50 (pounds, always two decimal digits), and add(other) returning a new Money holding the sum.',
      'str is f"£{self.pence // 100}.{self.pence % 100:02d}". add builds and returns a fresh Money; neither original changes.',
`check("repr(Money(250))", 'Money(250)')
check("str(Money(250))", '£2.50')
check("str(Money(5))", '£0.05')
check("Money(250).add(Money(75)).pence", 325)
_t_a = Money(100); _t_b = Money(1); _t_c = _t_a.add(_t_b)
check("add leaves both originals alone", (_t_a.pence, _t_b.pence), (100, 1))
check("str(Money(1000))", '£10.00')`),
  ],
})
