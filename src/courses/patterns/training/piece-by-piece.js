import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('piece-by-piece', {
  tier: 'E', xp: 65, requires: ['one-job'], gates: ['rigbuilder'],
  tools: ['tool-dataclass'],
  title: 'The rig, piece by piece', algo: 'Builder',
  steps: [
    explain([
      'The rig gets ordered over three phone calls, and Dax\'s Rig takes eleven arguments. Every caller passes ten Nones to set the eleventh, and nobody remembers which position is silent.',
      'Dax: “I will write it down.” “You will write it down eleven times.”',
    ], { move: 'brute force' }),
    explain([
      '“Take the order one piece at a time. Each call sets one thing and hands the order back, so the calls chain. build() at the end turns the order into the rig. Callers name what they set and skip what they do not.”',
      '“The rig itself stays simple. The order form is where the defaults and the chaining live.”',
    ], { move: 'pick the pattern', code:
`from dataclasses import dataclass

@dataclass
class Rig:
    battery: int = 20
    blade: str = 'steel'
    silent: bool = False

class RigBuilder:
    def __init__(self):
        self._battery, self._blade, self._silent = 20, 'steel', False
    def battery(self, n):
        self._battery = n
        return self
    def blade(self, name):
        self._blade = name
        return self
    def silent(self):
        self._silent = True
        return self
    def build(self):
        return Rig(self._battery, self._blade, self._silent)

RigBuilder().battery(40).silent().build()
# Rig(battery=40, blade='steel', silent=True)` }),
    trace(
`from dataclasses import dataclass

@dataclass
class Rig:
    battery: int = 20
    blade: str = 'steel'
    silent: bool = False

class RigBuilder:
    def __init__(self):
        self._battery, self._blade, self._silent = 20, 'steel', False
    def battery(self, n):
        self._battery = n
        return self
    def blade(self, name):
        self._blade = name
        return self
    def silent(self):
        self._silent = True
        return self
    def build(self):
        return Rig(self._battery, self._blade, self._silent)

def order():
    b = RigBuilder().battery(40).silent()
    return b.build()`,
      'order()',
      [
        { line: 13, state: { battery: 40, blade: 'steel', silent: false }, ask: 'battery', note: 'battery(40) writes one field on the order form and hands the form back, which is what lets .silent() follow on the same line.' },
        { line: 19, state: { battery: 40, blade: 'steel', silent: true }, ask: 'silent', note: 'silent() flips one flag. blade was never mentioned, so it keeps its default. No Nones anywhere.' },
        { line: 22, state: { battery: 40, blade: 'steel', silent: true, rig: { py: "Rig(battery=40, blade='steel', silent=True)" } }, ask: 'rig', note: 'build() reads the form and makes the rig in one call. The rig class itself is three plain fields.' },
        { line: 26, state: { rig: { py: "Rig(battery=40, blade='steel', silent=True)" }, returns: { py: "Rig(battery=40, blade='steel', silent=True)" } }, ask: 'returns', note: 'Two named calls said exactly what changed. Compare that to Rig(40, None, None, True, None).' },
      ]),
    spot('Rig(20, "steel", False, None, None, None, True): which argument is silent?',
      ['The third, False',
       'Nobody can tell without opening Rig, and that is the complaint: positional Nones hide which piece is which, where a chain of named calls says it out loud',
       'The last, True',
       'The first'],
      1, 'You had to guess, and so does every reader. Named, chained setters carry the meaning at the call site and skip what they do not set. That is what a builder buys you.'),
    blank('“An order form for the kitchen. Each call sets one thing and hands the form back. build makes the dict.”',
`class OrderBuilder:
    def __init__(self):
        self._item, self._qty = None, 1
    def item(self, name):
        self._item = name
        ___
    def qty(self, n):
        self._qty = n
        return self
    def build(self):
        return ___`,
`check("OrderBuilder().item('tape').build()", {'item': 'tape', 'qty': 1})
check("OrderBuilder().item('tape').qty(3).build()", {'item': 'tape', 'qty': 3})
check("chain order does not matter", OrderBuilder().qty(2).item('torch').build(), {'item': 'torch', 'qty': 2})
_t_b = OrderBuilder().item('x')
check("item hands the form back", _t_b.item('y') is _t_b, True)
check("OrderBuilder().build()", {'item': None, 'qty': 1})`),
    mini('Write class LetterBuilder with chainable to(name), line(text) (callable many times) and signed(name), and build() returning one string: "Dear <to>," then each line on its own line, then "— <signed>", all joined with newlines. A letter with no to() is addressed to "whoever"; no signed() signs "nobody".',
      'Keep the recipient, a list of lines and the signature as fields with defaults. build joins ["Dear x,"] + lines + ["— y"] with a newline.',
`check("LetterBuilder().to('Vera').line('Bring the van.').signed('M').build()", 'Dear Vera,\\nBring the van.\\n— M')
check("two lines", LetterBuilder().to('Dax').line('a').line('b').signed('M').build(), 'Dear Dax,\\na\\nb\\n— M')
check("defaults", LetterBuilder().build(), 'Dear whoever,\\n— nobody')
check("order of calls is free", LetterBuilder().signed('M').to('Sol').build(), 'Dear Sol,\\n— M')
_t_l = LetterBuilder()
check("every setter hands the builder back", _t_l.to('a') is _t_l and _t_l.line('x') is _t_l and _t_l.signed('s') is _t_l, True)`),
  ],
})
