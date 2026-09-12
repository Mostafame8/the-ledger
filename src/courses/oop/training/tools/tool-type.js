import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-type', {
  xp: 30, title: 'What it is', algo: 'Type',
  steps: [
    explain([
      'Dax finds the numbers in a mixed list with str(x).isdigit(). It misses the negatives, the floats, and the day someone puts True in the list.',
      '“Ask a thing what it is,” Marguerite says. “Every value knows its class. Every class knows its parents. And the class of a class is type.”',
      '“isinstance follows the family line. type(x) is Item asks for the exact class and nothing under it.”',
    ], { code:
`type(5)                    # <class 'int'>
type(5).__name__           # 'int'
(5).__class__ is int       # True

isinstance(5, int)         # True
isinstance(True, int)      # True: bool is a child of int
isinstance('5', (int, float))   # False, either type in the tuple would do
issubclass(bool, int)      # True

class Item: pass
type(Item) is type         # True: classes are made by type
type(Item()) is Item       # True
Item.__name__              # 'Item'` }),
    explain([
      '“bool under int is the classic surprise. True + True is 2. When it matters, test for bool before int.”',
      '“A tuple of types in isinstance means any of them. Cheaper than a chain of ors, and it reads.”',
      '“type is a class whose instances are classes. Hold that thought for the last arc.”',
    ]),
    trace(
`def kind(x):
    if isinstance(x, bool):
        return 'flag'
    if isinstance(x, int):
        return 'count'
    return type(x).__name__

k1 = kind(True)
k2 = kind(3)
k3 = kind('a')`,
      '(k1, k2, k3)',
      [
        { line: 3, state: { k1: 'flag' }, ask: 'k1', note: 'bool is checked first. Swap the two ifs and True would be a count.' },
        { line: 5, state: { k1: 'flag', k2: 'count' }, ask: 'k2', note: '3 is not a bool, so the first if is skipped; it is an int, so the second answers.' },
        { line: 6, state: { k1: 'flag', k2: 'count', k3: 'str' }, ask: 'k3', note: 'No branch matched. The class name itself is the answer.' },
      ]),
    blank('“Sort a mixed bag into ints, strs and the rest. Remember what True is.”',
`def sort_out(things):
    out = {'int': [], 'str': [], 'other': []}
    for x in things:
        if ___:
            out['int'].append(x)
        elif ___:
            out['str'].append(x)
        else:
            out['other'].append(x)
    return out`,
`check("sort_out([1, 'a', 2.5])", {'int': [1], 'str': ['a'], 'other': [2.5]})
check("sort_out([])", {'int': [], 'str': [], 'other': []})
check("sort_out([True])['int']", [True])
check("sort_out([None, [], 'b'])['other']", [None, []])
check("sort_out([3, 1, 2])['int']", [3, 1, 2])
class _t_S(str): pass
check("a child of str is still a str", sort_out([_t_S('x')])['str'], ['x'])`),
  ],
})
