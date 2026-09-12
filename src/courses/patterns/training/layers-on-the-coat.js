import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('layers-on-the-coat', {
  tier: 'D', xp: 95, requires: ['parts-not-bloodlines'], gates: ['layers', 'wrappedhand'],
  tools: ['tool-closure'],
  title: 'Layers on the coat', algo: 'Decorator',
  steps: [
    explain([
      'One coat, a lining if the wind is up, plates if the guard is nervous. Dax has a class per combination and a fourth on the way: LinedArmouredCoat, ArmouredLinedCoat, and he is not sure those are different.',
      'Dax: “They are different if the order matters.” “Then you have a rule about order and no place to put it.”',
    ], { move: 'brute force' }),
    explain([
      '“Each layer wraps any coat, adds its bit, and is itself a coat. Stack them in whatever order the night needs. Three layers are three small classes, not seven combinations.”',
      '“The same trick works on functions: a wrapper takes a function and hands back a function that does a little extra and then calls the original. Same shape in, same shape out.”',
    ], { move: 'pick the pattern', code:
`class Coat:
    def warmth(self): return 1
    def describe(self): return 'coat'

class Lined:
    def __init__(self, inner): self.inner = inner
    def warmth(self): return self.inner.warmth() + 2
    def describe(self): return 'lined ' + self.inner.describe()

class Armoured:
    def __init__(self, inner): self.inner = inner
    def warmth(self): return self.inner.warmth() + 1
    def describe(self): return 'armoured ' + self.inner.describe()

Lined(Armoured(Coat())).describe()   # 'lined armoured coat'
Lined(Armoured(Coat())).warmth()     # 4` }),
    trace(
`class Coat:
    def warmth(self): return 1
    def describe(self): return 'coat'

class Lined:
    def __init__(self, inner): self.inner = inner
    def warmth(self): return self.inner.warmth() + 2
    def describe(self): return 'lined ' + self.inner.describe()

class Armoured:
    def __init__(self, inner): self.inner = inner
    def warmth(self): return self.inner.warmth() + 1
    def describe(self): return 'armoured ' + self.inner.describe()

def dress():
    c = Lined(Armoured(Coat()))
    return (c.warmth(), c.describe())`,
      'dress()',
      [
        { line: 2, state: { coat: 1 }, ask: 'coat', note: 'warmth() on the outer layer asks inward until it reaches the bare coat, which answers 1.' },
        { line: 12, state: { coat: 1, armoured: 2 }, ask: 'armoured', note: 'The plates layer adds one to whatever it wraps. It never asked what it was wrapping.' },
        { line: 7, state: { coat: 1, armoured: 2, lined: 4 }, ask: 'lined', note: 'The lining adds two on the way back out. Three layers, one number, and the order is just how they were stacked.' },
        { line: 8, state: { lined: 4, describe: 'lined armoured coat' }, ask: 'describe', note: 'describe walks the same way: each layer prefixes its word to whatever the inner one says.' },
        { line: 17, state: { lined: 4, describe: 'lined armoured coat', returns: { py: "(4, 'lined armoured coat')" } }, ask: 'returns', note: 'Swap the stacking and you get armoured lined coat with the same two classes. No matrix of subclasses.' },
      ]),
    spot('LinedArmouredCoat and ArmouredLinedCoat both exist as classes. A third layer, Hooded, arrives. How many new classes does the tree need?',
      ['One: Hooded',
       'Every combination that includes a hood: HoodedLined, HoodedArmoured, HoodedLinedArmoured and their orderings, a dozen or so',
       'None, hoods are not coats',
       'Two'],
      1, 'A class per combination grows like the combinations do. One Hooded wrapper that takes any coat is one class forever, and the order lives in how you stack it at the call site. That is a decorator.'),
    blank('“A wrapper that counts calls. It takes a function, hands back a function, and the original never knows.”',
`def counted(fn):
    def inner(*args):
        ___
        return ___
    inner.calls = 0
    return inner`,
`@counted
def _t_add(a, b): return a + b
check("the wrapper returns the value", _t_add(2, 3), 5)
check("and counted one call", _t_add.calls, 1)
_t_add(1, 1); _t_add(1, 1)
check("three calls so far", _t_add.calls, 3)
@counted
def _t_hi(): return 'hi'
check("each wrapped function has its own count", _t_hi.calls, 0)
check("no-argument functions work", _t_hi(), 'hi')`),
    mini('Write shout(fn), returning a wrapper that calls fn and returns its string upper-cased, and twice(fn), returning a wrapper that calls fn two times and returns the second result. Both take and return functions of zero or one argument, and they stack: shout(twice(f)) works.',
      'Each wrapper is def inner(*args): ... return inner. shout transforms the result; twice calls fn(*args) twice and keeps the last.',
`check("shout(lambda: 'go')()", 'GO')
check("shout(lambda s: s + '!')('run')", 'RUN!')
_t_n = []
def _t_tick(): _t_n.append(1); return len(_t_n)
check("twice calls it twice and keeps the second", twice(_t_tick)(), 2)
check("stacked", shout(twice(lambda: 'ok'))(), 'OK')
check("twice on a one-argument function", twice(lambda x: x * 2)(4), 8)`),
  ],
})
