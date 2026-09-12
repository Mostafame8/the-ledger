import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('other-doors-in', {
  tier: 'B', xp: 160, requires: ['the-family-line'], gates: ['fromline'],
  tools: ['tool-decorator'],
  title: 'Other doors in', algo: 'classmethod and staticmethod',
  steps: [
    explain([
      'The fence sends her list as text: torch,5 on one line, cutter,10 on the next. Dax parses it in six places, three of them strip the spaces differently, and Stolen(Item) gets a plain Item back from the one parser that exists.',
      'Dax: “It is a two-line split. Who needs a function for that?” Marguerite: “Six of you, apparently.”',
      '“Give the class its own door for text. Whichever class you knock on is the class you get.”',
    ], { move: 'brute force' }),
    explain([
      '“@classmethod hands the method the class, as cls, instead of an instance. cls(...) builds whichever class was asked, so a child gets the door without writing it.”',
      '“@staticmethod hands the method nothing at all. It is a plain function that lives at the class\'s address because that is where it belongs. Both are decorators, the same shape as @property.”',
    ], { move: 'pick the pattern', code:
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    @staticmethod
    def parse_price(text):
        return float(text) if '.' in text else int(text)
    @classmethod
    def from_line(cls, line):
        name, price = line.split(',')
        return cls(name.strip(), cls.parse_price(price.strip()))

class Stolen(Item):
    pass

Item.from_line('torch, 5').price          # 5
type(Stolen.from_line('a,1')).__name__    # 'Stolen'
Item.parse_price('2.50')                  # 2.5, no instance needed` }),
    trace(
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    @staticmethod
    def parse_price(text):
        return float(text) if '.' in text else int(text)
    @classmethod
    def from_line(cls, line):
        name, price = line.split(',')
        return cls(name.strip(), cls.parse_price(price.strip()))

class Stolen(Item):
    pass

s = Stolen.from_line(' tape , 2.5 ')`,
      "(type(s).__name__, s.name, s.price)",
      [
        { line: 10, state: { cls_name: 'Stolen' }, ask: 'cls_name', note: 'The door was knocked on Stolen, so cls is Stolen, even though from_line is written on Item.' },
        { line: 10, state: { cls_name: 'Stolen', name: ' tape ' }, ask: 'name', note: 'split first, strip after. The raw piece still has its spaces here.' },
        { line: 7, state: { cls_name: 'Stolen', name: ' tape ', returns: 2.5 }, ask: 'returns', note: 'parse_price reached through cls. No self, no cls in its own seats: a plain function at the class\'s address.' },
        { line: 16, state: { cls_name: 'Stolen', name: ' tape ', returns: { py: "('Stolen', 'tape', 2.5)" } }, ask: 'returns', note: 'cls(...) built a Stolen. The child got the door for free.' },
      ]),
    spot('Dax writes from_line as a plain method, def from_line(self, line), and calls Item.from_line(\'a,1\'). Result?',
      ['An Item',
       'TypeError: a missing argument, because a plain method wants an instance in its first seat and none was given',
       'A string',
       'It works only when called on Stolen'],
      1, 'A door you knock on without an instance has to be a classmethod or a staticmethod. A plain method called through the class is the bare function, and its first seat is empty.'),
    blank('“A door for text on the class, and a helper that needs neither class nor instance.”',
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    @___
    def parse_price(text):
        return float(text) if '.' in text else int(text)
    @___
    def from_line(cls, line):
        name, price = line.split(',')
        return ___

class Stolen(Item):
    pass`,
`check("Item.from_line('torch,5').name", 'torch')
check("Item.from_line('torch, 5').price", 5)
check("Item.parse_price('5')", 5)
check("Item.parse_price('5.50')", 5.5)
check("type(Stolen.from_line('a,1')).__name__", 'Stolen')
check("Item.parse_price('7')", 7)`),
    mini('Write class Temp(celsius) with a classmethod from_f(cls, f) building from Fahrenheit ((f - 32) * 5 / 9), a staticmethod valid(c) returning c >= -273.15, and a read-only property f returning Fahrenheit (celsius * 9 / 5 + 32). Then class Reading(Temp) with a class attribute note = \'field\' and nothing else.',
      'from_f returns cls(...) so Reading.from_f makes a Reading. valid takes only the number. f is @property.',
`check("Temp.from_f(212).celsius", 100.0)
check("Temp(100).f", 212.0)
check("Temp.valid(-300)", False)
check("Temp.valid(0)", True)
check("type(Reading.from_f(32)).__name__", 'Reading')
check("Reading.from_f(32).celsius", 0.0)`),
  ],
})
