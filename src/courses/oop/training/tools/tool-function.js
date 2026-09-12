import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-function', {
  xp: 30, title: 'A move with no owner', algo: 'Function',
  steps: [
    explain([
      'Dax\'s worth(d) takes a dict and reads its keys. It is a move with no owner, and it goes wherever the dict goes.',
      '“A function is a value,” Marguerite says. “You can hand it round, store it in a dict, call it later. A method is the same function with the object already sitting in its first seat.”',
      '“Star gathers what is left over into a tuple. Double star gathers the names into a dict. And a star on the way in spreads a sequence back out into arguments.”',
    ], { code:
`def worth(item, qty=1):
    return item['price'] * qty

f = worth                  # no call: the function itself
f({'price': 5}, 3)         # 15
moves = {'worth': worth}
moves['worth']({'price': 2})   # 2

def spread(*args, **kwargs):
    return args, kwargs
spread(1, 2, k=3)          # ((1, 2), {'k': 3})

class Item:
    def __init__(self, price): self.price = price
    def worth(self, qty=1): return self.price * qty
i = Item(5)
g = i.worth                # bound: i is already the first argument
g(3)                       # 15
Item.worth(i, 3)           # 15, the same call spelled long` }),
    explain([
      '“i.worth is a bound method: the function worth plus one saved argument, i. Call it with the rest and Python puts i in front.”',
      '“self is not magic. It is that saved seat. Item.worth(i, 3) and i.worth(3) are the same call spelled two ways.”',
      '“Once a function is a value, wrapping one in another is a short step. That is the next tool.”',
    ]),
    trace(
`def bind(fn, *pre):
    def inner(*rest):
        return fn(*pre, *rest)
    return inner

def add(a, b, c):
    return a + b + c

add5 = bind(add, 5)
r = add5(1, 2)`,
      'r',
      [
        { line: 9, state: { add5: { py: '<function inner>' } }, ask: 'add5', note: 'bind returns inner, a function that remembers fn and pre = (5,). Nothing has been added yet.' },
        { line: 3, state: { add5: { py: '<function inner>' }, pre: { py: '(5,)' }, rest: { py: '(1, 2)' } }, ask: 'rest', note: 'The saved seat comes first, the new arguments after. fn(*pre, *rest) is add(5, 1, 2).' },
        { line: 10, state: { add5: { py: '<function inner>' }, pre: { py: '(5,)' }, rest: { py: '(1, 2)' }, r: 8 }, ask: 'r', note: 'add ran once with all three seats filled.' },
      ]),
    blank('“Bind the first arguments now, take the rest later.”',
`def bind(fn, *pre):
    def inner(*rest):
        return ___
    return inner`,
`check("bind(lambda a, b: a - b, 10)(3)", 7)
check("bind(max, 0)(-5)", 0)
check("bind(lambda: 'x')()", 'x')
check("bind(lambda a, b, c: (a, b, c), 1, 2)(3)", (1, 2, 3))
_t_f = bind(lambda a, b: a * b, 4)
check("a bound function answers the same twice", (_t_f(2), _t_f(2)), (8, 8))
check("type(bind(len)).__name__", 'function')`),
  ],
})
