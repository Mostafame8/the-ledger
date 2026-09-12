import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('two-parents', {
  tier: 'E', xp: 80, requires: ['call-up-the-line'], gates: ['twoparents'],
  tools: ['tool-type'],
  title: 'Two parents', algo: 'Multiple inheritance and MRO',
  steps: [
    explain([
      'Heavy drives and carries. Dax writes who() by hand for Driver, for Armed, for ArmedDriver, and for a fourth class where the armed part is mentioned first. Four strings, four places to get a comma wrong.',
      'Dax: “It is only four.” Marguerite: “It is four today.”',
      '“Stack the parts and let Python chain them. Each part says its word and calls on.”',
    ], { move: 'brute force' }),
    explain([
      '“A part is a small class with one who() that adds its word and calls super().who(). List the parts before the base: class Heavy(Armed, Wheels, Member).”',
      '“super() does not mean my parent. It means the next class in this object\'s __mro__. Read Heavy.__mro__ before you guess the order, and it will tell you.”',
    ], { move: 'pick the pattern', code:
`class Member:
    def __init__(self, name): self.name = name
    def who(self): return self.name

class Wheels:
    def who(self): return super().who() + ', wheels'

class Armed:
    def who(self): return super().who() + ', armed'

class Heavy(Armed, Wheels, Member): pass

Heavy('h').who()                     # 'h, wheels, armed'
[c.__name__ for c in Heavy.__mro__]  # ['Heavy', 'Armed', 'Wheels', 'Member', 'object']` }),
    trace(
`class Member:
    def __init__(self, name): self.name = name
    def who(self): return self.name

class Wheels:
    def who(self): return super().who() + ', wheels'

class Armed:
    def who(self): return super().who() + ', armed'

class Heavy(Armed, Wheels, Member): pass

w = Heavy('h').who()`,
      'w',
      [
        { line: 9, state: { next: 'Wheels' }, ask: 'next', note: 'Heavy has no who, so Armed\'s runs first. Its super() looks past Armed in Heavy\'s __mro__ and finds Wheels, not object.' },
        { line: 6, state: { next: 'Member' }, ask: 'next', note: 'Wheels\' super() looks past Wheels in the same list and finds Member.' },
        { line: 3, state: { next: 'Member', returns: 'h' }, ask: 'returns', note: 'Member answers with the name. The chain now unwinds.' },
        { line: 6, state: { next: 'Member', returns: 'h, wheels' }, ask: 'returns', note: 'Wheels adds its word to what came back.' },
        { line: 13, state: { next: 'Member', returns: 'h, wheels', w: 'h, wheels, armed' }, ask: 'w', note: 'Armed adds last, because it ran first. The order in the class line is the order of the words, reversed.' },
      ]),
    spot('Dax writes class Heavy(Wheels, Armed, Member) instead. Heavy(\'h\').who() is…',
      ['\'h, wheels, armed\', the order does not matter',
       '\'h, armed, wheels\', because the chain runs in __mro__ order and the first-listed part speaks last',
       'TypeError: two parents both define who',
       '\'h\', because only the base has a name'],
      1, 'The MRO follows the class line left to right. Each part appends its word after the ones behind it in the chain, so swapping the parts swaps the words. Read __mro__ and the answer is written down.'),
    blank('“Two parts, one base. Each part adds its word and calls on; Heavy lists them in front of Member.”',
`class Member:
    def __init__(self, name): self.name = name
    def who(self): return self.name

class Wheels:
    def who(self): return ___ + ', wheels'

class Armed:
    def who(self): return ___ + ', armed'

class Heavy(___): pass`,
`class _t_Driver(Wheels, Member): pass
check("Heavy('h').who()", 'h, wheels, armed')
check("a part on its own", _t_Driver('d').who(), 'd, wheels')
check("Member('m').who()", 'm')
check("[c.__name__ for c in Heavy.__mro__]", ['Heavy', 'Armed', 'Wheels', 'Member', 'object'])
check("isinstance(Heavy('h'), Armed)", True)
check("type(Heavy('h')).__name__", 'Heavy')`),
    mini('Write class Base with tags() returning []; parts Loud, Fast and Quiet, each with tags() returning super().tags() plus its own word (\'loud\', \'fast\', \'quiet\'); and build(*parts) that makes a class on the spot with type(\'Rig\', parts + (Base,), {}) and returns a fresh instance\'s tags().',
      'type(name, bases, dict) builds a class the way the class statement does. parts arrives as a tuple already, so add (Base,) to it.',
`check("build(Loud, Fast)", ['fast', 'loud'])
check("build(Fast, Loud)", ['loud', 'fast'])
check("build()", [])
check("build(Quiet)", ['quiet'])
check("build(Loud, Fast, Quiet)", ['quiet', 'fast', 'loud'])
check("build(Loud) == build(Loud)", True)`),
  ],
})
