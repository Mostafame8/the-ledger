import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('open-and-close', {
  tier: 'C', xp: 130, requires: ['the-guarded-field'], gates: ['sealedbag'],
  tools: ['tool-exception'],
  title: 'Open and close', algo: 'Context managers',
  steps: [
    explain([
      'The bag gets zipped when the fence walks out. Dax zips it on the last line of the function. The night the function raised halfway through, the bag stayed open on the table until morning.',
      'Dax: “I will put the zip in a finally.” Marguerite: “In every function that opens a bag? You will miss one.”',
      '“Open, do the work, and let the close happen whether or not you remembered it. That is what with is for, and your Bag can be the thing after with.”',
    ], { move: 'brute force' }),
    explain([
      '“with Bag() as b: calls __enter__ and binds what it returns to b. When the block ends, however it ends, __exit__(exc_type, exc, tb) runs. Return False and an error keeps climbing. Return True only to swallow it on purpose.”',
      '“contextlib.contextmanager turns a def with one yield into the same shape: everything before the yield is the open, everything after is the close.”',
    ], { move: 'pick the pattern', code:
`class Bag:
    def __init__(self):
        self.items = []
        self.sealed = False
    def add(self, item):
        if self.sealed:
            raise RuntimeError('bag is sealed')
        self.items.append(item)
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        self.sealed = True
        return False

with Bag() as b:
    b.add('torch')
b.sealed              # True
b.add('cutter')       # RuntimeError

try:
    with Bag() as c:
        raise ValueError('mid-meeting')
except ValueError:
    c.sealed          # True: sealed on the way out, error still climbed` }),
    trace(
`class Bag:
    def __init__(self):
        self.items = []
        self.sealed = False
    def add(self, item):
        if self.sealed:
            raise RuntimeError('bag is sealed')
        self.items.append(item)
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        self.sealed = True
        return False

def meeting():
    try:
        with Bag() as b:
            b.add('torch')
            raise ValueError('x')
    except ValueError:
        return (b.sealed, b.items)`,
      'meeting()',
      [
        { line: 10, state: { sealed: false }, ask: 'sealed', note: '__enter__ ran and handed the bag to b. Nothing is sealed yet.' },
        { line: 8, state: { sealed: false, items: ['torch'] }, ask: 'items', note: 'Inside the block the bag is open and takes the item.' },
        { line: 12, state: { sealed: true, items: ['torch'] }, ask: 'sealed', note: 'The raise left the block. Before anything else happens, __exit__ runs with the ValueError in exc_type, and seals the bag.' },
        { line: 13, state: { sealed: true, items: ['torch'], returns: false }, ask: 'returns', note: 'False means not handled. The ValueError carries on climbing to the except.' },
        { line: 21, state: { sealed: true, items: ['torch'], returns: { py: "(True, ['torch'])" } }, ask: 'returns', note: 'Sealed, item kept, error caught where it should be. All three at once.' },
      ]),
    spot('Dax\'s __exit__ returns True so the meeting never crashes. A KeyError raised inside the block now…',
      ['Still climbs out to the caller',
       'Is swallowed silently, because a truthy return from __exit__ means handled',
       'Becomes a RuntimeError',
       'Prevents the bag from sealing'],
      1, '__exit__\'s return value is the one place a context manager can eat an exception. Any truthy return says handled and the error vanishes, whatever its type. Return False unless swallowing a specific error is the job, and then check exc_type first.'),
    blank('“Open hands back the bag. Close seals it and lets errors climb.”',
`class Bag:
    def __init__(self):
        self.items = []
        self.sealed = False
    def add(self, item):
        if self.sealed:
            raise RuntimeError('bag is sealed')
        self.items.append(item)
    def __enter__(self):
        return ___
    def __exit__(self, exc_type, exc, tb):
        ___
        return ___`,
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
def _t_inside():
    with Bag() as b:
        b.add('torch')
        return (b.sealed, list(b.items))
def _t_after():
    with Bag() as b:
        b.add('torch')
    return (b.sealed, list(b.items))
def _t_error():
    try:
        with Bag() as b:
            raise ValueError('mid-meeting')
    except ValueError:
        return b.sealed
check("inside the block the bag is open and takes items", _t_inside(), (False, ['torch']))
check("after the block the bag is sealed and keeps its items", _t_after(), (True, ['torch']))
_t_b = Bag()
with _t_b: pass
check("a sealed bag refuses", _t_raises(lambda: _t_b.add('x')), 'RuntimeError')
check("an error inside still seals and still climbs", _t_error(), True)
check("Bag().__exit__(None, None, None)", False)
check("Bag().sealed", False)`),
    mini('Write class Timer as a context manager: __enter__ records time.perf_counter() in start and returns self; __exit__ stores elapsed = perf_counter() - start and returns False. Also write class Muted whose __enter__ returns self and whose __exit__ returns True only when exc_type is ValueError, so a ValueError inside the block is swallowed and anything else climbs.',
      'import time at the top. Muted.__exit__ is one line: return exc_type is ValueError. Neither class needs an __init__.',
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
def _t_timed():
    with Timer() as t:
        sum(range(1000))
    return t
_t_t = _t_timed()
check("elapsed is measured", _t_t.elapsed >= 0, True)
check("elapsed is a float", type(_t_t.elapsed).__name__, 'float')
check("start was recorded", _t_t.start <= _t_t.start + _t_t.elapsed, True)
def _t_mute_value():
    with Muted():
        raise ValueError('quiet')
def _t_mute_key():
    with Muted():
        raise KeyError('loud')
check("a ValueError is swallowed", _t_raises(_t_mute_value), None)
check("a KeyError still climbs", _t_raises(_t_mute_key), 'KeyError')
check("Muted().__exit__(None, None, None)", False)`),
  ],
})
