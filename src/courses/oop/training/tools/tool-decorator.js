import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-decorator', {
  xp: 30, title: 'The wrapper', algo: 'Decorator',
  steps: [
    explain([
      'Dax pastes the same three logging lines into the top of every function. When the log format changes he misses two of them.',
      '“A decorator is a function that takes your function and hands back a wrapped one,” Marguerite says. “The @ is just f = wrap(f), written above the door.”',
      '“functools.wraps copies the name and docstring across, so the wrapped function still answers to its own name in a traceback.”',
    ], { code:
`import functools

def counted(fn):
    @functools.wraps(fn)
    def inner(*args, **kwargs):
        inner.calls += 1
        return fn(*args, **kwargs)
    inner.calls = 0
    return inner

@counted
def worth(price, qty=1):
    return price * qty

worth(5); worth(5, 2)
worth.calls                # 2
worth.__name__             # 'worth', thanks to wraps` }),
    explain([
      '“Without wraps, every wrapped function is called inner and every traceback lies to you.”',
      '“@property, @classmethod and @staticmethod are decorators too. That is why they sit above a def: they take the function and hand back something else.”',
      '“A decorator with arguments is one more layer: a function that returns a decorator. Same shape, one deeper.”',
    ]),
    trace(
`def counted(fn):
    def inner(*args):
        inner.calls += 1
        return fn(*args)
    inner.calls = 0
    return inner

@counted
def twice(x):
    return 2 * x

a = twice(3)
b = twice(4)`,
      'twice.calls',
      [
        { line: 9, state: { twice: { py: '<function inner>' } }, ask: 'twice', note: 'The @ line ran counted(twice) and rebound the name twice to inner. calls starts at 0.' },
        { line: 12, state: { twice: { py: '<function inner>' }, calls: 1, a: 6 }, ask: 'calls', note: 'Calling twice calls inner. inner bumps its own counter, then hands the arguments to the real function.' },
        { line: 13, state: { twice: { py: '<function inner>' }, calls: 2, a: 6, b: 8 }, ask: 'calls', note: 'Second call, second tick. The counter lives on inner, not on the original.' },
      ]),
    blank('“Log the name of every wrapped function that runs, then let it run.”',
`LOG = []

def logged(fn):
    def inner(*args, **kwargs):
        ___
        return ___
    return inner`,
`LOG.clear()
@logged
def _t_f(x): return x + 1
@logged
def _t_g(): return 'g'
@logged
def _t_h(a): return a
check("_t_f(1)", 2)
check("LOG after one call", list(LOG), ['_t_f'])
check("_t_g()", 'g')
check("LOG after two calls", list(LOG), ['_t_f', '_t_g'])
check("keyword arguments pass through", _t_h(a=1), 1)
check("len(LOG)", 3)`),
  ],
})
