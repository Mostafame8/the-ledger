import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-exception', {
  xp: 30, title: 'The alarm that climbs', algo: 'Exception',
  steps: [
    explain([
      'Dax returns -1 when something goes wrong. Three calls later the -1 is in a total, and the total is on the manifest.',
      '“An error is a thing you raise,” Marguerite says. “It climbs the call stack until someone catches it, and it carries its own name. Nobody adds it to a total by accident.”',
      '“Your own error is a class with nothing in it. The name is the payload. Put it under a built-in so old code that catches the parent still catches yours.”',
    ], { code:
`class Sealed(RuntimeError):
    pass

def add(bag, item):
    if bag['sealed']:
        raise Sealed('bag is sealed')
    bag['items'].append(item)

bag = {'sealed': True, 'items': []}
try:
    add(bag, 'torch')
except Sealed as e:
    print(type(e).__name__, e)      # Sealed bag is sealed
except RuntimeError:
    print('some other runtime error')

try:
    add(bag, 'torch')
except RuntimeError:
    print('caught by the parent')   # a Sealed is a RuntimeError too` }),
    explain([
      '“except X matches X and every class below it. So order the clauses from specific to general, or the general one eats everything.”',
      '“raise on its own, inside an except, throws the same error on upward. Catch, note, re-throw.”',
      '“Catching Exception to keep a program quiet is how a -1 gets onto a manifest. Catch the one you mean.”',
    ]),
    trace(
`class Sealed(RuntimeError):
    pass

def add(bag, item):
    if bag['sealed']:
        raise Sealed('sealed')
    bag['items'].append(item)

def safe_add(bag, item):
    try:
        add(bag, item)
        return True
    except Sealed:
        return False

ok = safe_add({'sealed': True, 'items': []}, 'torch')`,
      'ok',
      [
        { line: 5, state: { sealed: true }, ask: 'sealed', note: 'The bag is sealed, so the branch is taken.' },
        { line: 6, state: { sealed: true, raised: 'Sealed' }, ask: 'raised', note: 'raise leaves add at once. The append on the next line never runs.' },
        { line: 13, state: { sealed: true, raised: 'Sealed', caught: 'Sealed' }, ask: 'caught', note: 'The error climbed out of add into safe_add and met a matching except. return True was skipped.' },
        { line: 14, state: { sealed: true, raised: 'Sealed', caught: 'Sealed', ok: false }, ask: 'ok', note: 'The except branch answers instead.' },
      ]),
    blank('“Raise your own error when the bag is sealed, and catch only that one.”',
`class Sealed(RuntimeError):
    pass

def add(bag, item):
    if bag['sealed']:
        ___
    bag['items'].append(item)

def safe_add(bag, item):
    try:
        add(bag, item)
        return True
    except ___:
        return False`,
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
_t_b = {'sealed': False, 'items': []}
check("an open bag takes the item", safe_add(_t_b, 'a'), True)
check("and keeps it", _t_b['items'], ['a'])
_t_s = {'sealed': True, 'items': []}
check("a sealed bag refuses", safe_add(_t_s, 'a'), False)
check("and stays empty", _t_s['items'], [])
check("issubclass(Sealed, RuntimeError)", True)
check("an unrelated error is not swallowed", _t_raises(lambda: safe_add({'sealed': False}, 'a')), 'KeyError')`),
  ],
})
