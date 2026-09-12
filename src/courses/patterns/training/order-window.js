import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('order-window', {
  tier: 'E', xp: 60, requires: ['bolt-on'], gates: ['rigfactory', 'catalogue'],
  tools: ['tool-class'],
  title: 'The order window', algo: 'Factory',
  steps: [
    explain([
      'The fence\'s shop has one window, but Dax\'s code has three: Cutter() here, Torch() there, Jammer() in a file nobody opens. Adding a drill means finding all three.',
      'Dax: “They are just constructors.” “They are three places that know how a rig is born. Make it one.”',
    ], { move: 'brute force' }),
    explain([
      '“One window. You say a name; it hands you a rig. Behind the window a table maps names to classes. Adding a rig is one row in the table. Nobody who asks at the window ever changes.”',
      '“The people asking should never spell a class name. If they do, the window is decoration.”',
    ], { move: 'pick the pattern', code:
`class Cutter:
    def use(self): return 'cutting'
class Torch:
    def use(self): return 'burning'

KINDS = {'cutter': Cutter, 'torch': Torch}

def make(kind):
    cls = KINDS.get(kind)
    if cls is None:
        raise ValueError(kind)
    return cls()

make('torch').use()   # 'burning'` }),
    trace(
`class Cutter:
    def use(self): return 'cutting'
class Torch:
    def use(self): return 'burning'

KINDS = {'cutter': Cutter, 'torch': Torch}

def make(kind):
    cls = KINDS.get(kind)
    if cls is None:
        raise ValueError(kind)
    return cls()

def order(names):
    return [make(n).use() for n in names]`,
      "order(['torch', 'cutter'])",
      [
        { line: 9, state: { kind: 'torch', cls: { py: 'Torch' } }, ask: 'cls', note: 'The window looks the name up in the table. It gets a class back, not an object yet.' },
        { line: 4, state: { kind: 'torch', cls: { py: 'Torch' }, use: 'burning' }, ask: 'use', note: 'cls() built the rig and order asked it to use(). order never spelled Torch anywhere.' },
        { line: 9, state: { kind: 'cutter', cls: { py: 'Cutter' } }, ask: 'cls', note: 'Second name, second row in the table. Same window, no branches.' },
        { line: 15, state: { returns: ['burning', 'cutting'] }, ask: 'returns', note: 'Add a drill tomorrow: one row in KINDS, and order() runs it without being touched.' },
      ]),
    spot('Dax added a Drill class and the window still raises ValueError for "drill". What did he forget?',
      ['To restart Python',
       'To add the row drill: Drill to the table the window reads; the class alone is a part on a shelf with no label',
       'To give Drill a use() method',
       'To name the class drill in lowercase'],
      1, 'The window knows rigs by the table, not by scanning for classes. A new class that is not in the table cannot be ordered. That is the whole trade of a factory: one row per kind, and the callers never change.'),
    blank('“One window. Look the name up, hand back a fresh one, complain about strangers.”',
`class Cutter:
    def use(self): return 'cutting'
class Torch:
    def use(self): return 'burning'

KINDS = {'cutter': Cutter, 'torch': Torch}

def make(kind):
    cls = ___
    if cls is None:
        ___
    return cls()`,
`check("make('torch').use()", 'burning')
check("make('cutter').use()", 'cutting')
check("two orders, two rigs", make('torch') is make('torch'), False)
def _t_raises(thunk):
    try:
        thunk()
    except Exception as e:
        return type(e).__name__
    return None
check("a stranger at the window", _t_raises(lambda: make('drill')), 'ValueError')
check("type(make('cutter')).__name__", 'Cutter')`),
    mini('Write class Kitchen with register(name, recipe), where recipe is a zero-argument function that returns a dish; cook(name) calling the recipe for that name and returning the dish, raising KeyError for a name nobody registered; and menu() returning the registered names sorted.',
      'A dict from name to recipe function. cook looks up and calls. menu is sorted(keys). Nothing in Kitchen knows what any dish is.',
`_t_k = Kitchen()
_t_k.register('soup', lambda: 'hot soup'); _t_k.register('bread', lambda: 'warm bread')
check("cook calls the recipe", _t_k.cook('soup'), 'hot soup')
check("menu is sorted", _t_k.menu(), ['bread', 'soup'])
def _t_raises(thunk):
    try:
        thunk()
    except Exception as e:
        return type(e).__name__
    return None
check("an unknown dish", _t_raises(lambda: _t_k.cook('cake')), 'KeyError')
check("Kitchen().menu()", [])
_t_k.register('soup', lambda: 'cold soup')
check("re-registering replaces the recipe", _t_k.cook('soup'), 'cold soup')`),
  ],
})
