import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('the-attribute-trap', {
  tier: 'A', xp: 220, requires: ['the-gatekeeper'], gates: ['attributetrap'],
  tools: ['tool-dict'],
  title: 'The attribute trap', algo: 'Attribute hooks',
  steps: [
    explain([
      'The fence\'s records have fields nobody planned for: provenance, a buyer\'s nickname, a colour. Dax reaches for record[\'whatever\'], wraps that in .get, wraps that in a function called field_of.',
      'Dax: “The dict has everything.” Marguerite: “And the dot has nothing. Let the dot fall through to the dict, and log every hand that writes.”',
    ], { move: 'brute force' }),
    explain([
      '“__getattr__ runs only when the normal lookup fails. It is the safety net under the dot, not the door. Answer from the dict, or raise AttributeError so hasattr and getattr-with-default still work.”',
      '“__setattr__ runs on every assignment, including the ones in __init__. So the fields the hook itself needs are planted underneath it with object.__setattr__, or the hook trips over its own feet.”',
    ], { move: 'pick the pattern', code:
`class Record:
    def __init__(self, **fields):
        object.__setattr__(self, '_data', dict(fields))
        object.__setattr__(self, '_log', [])
    def __getattr__(self, name):
        if name.startswith('_'):
            raise AttributeError(name)
        try:
            return self._data[name]
        except KeyError:
            raise AttributeError(f"no field {name!r}") from None
    def __setattr__(self, name, value):
        self._data[name] = value
        self._log.append((name, value))
    def changes(self):
        return list(self._log)

r = Record(name='torch')
r.name                # 'torch', via __getattr__
r.price = 5           # via __setattr__, logged
r.changes()           # [('price', 5)]
hasattr(r, 'zzz')     # False, because the miss raised AttributeError` }),
    trace(
`class Record:
    def __init__(self, **fields):
        object.__setattr__(self, '_data', dict(fields))
        object.__setattr__(self, '_log', [])
    def __getattr__(self, name):
        if name.startswith('_'):
            raise AttributeError(name)
        try:
            return self._data[name]
        except KeyError:
            raise AttributeError(f"no field {name!r}") from None
    def __setattr__(self, name, value):
        self._data[name] = value
        self._log.append((name, value))
    def changes(self):
        return list(self._log)

r = Record(name='torch')
r.price = 5
p = r.price
missing = hasattr(r, 'zzz')`,
      '(p, missing, r.changes())',
      [
        { line: 3, state: { _data: { name: 'torch' } }, ask: '_data', note: 'Planted with object.__setattr__, so the hook below is not tripped. _data now sits in the instance __dict__.' },
        { line: 13, state: { _data: { name: 'torch', price: 5 } }, ask: '_data', note: 'r.price = 5 hit __setattr__. The dict took the field and the log grew by one pair.' },
        { line: 9, state: { _data: { name: 'torch', price: 5 }, returns: 5 }, ask: 'returns', note: 'r.price missed the normal lookup, since only _data and _log are in __dict__, so __getattr__ answered from the dict.' },
        { line: 11, state: { _data: { name: 'torch', price: 5 }, returns: 5, raises: 'AttributeError' }, ask: 'raises', note: 'zzz is not in the dict. Raising AttributeError, not KeyError, is what lets hasattr say False instead of crashing.' },
        { line: 21, state: { _data: { name: 'torch', price: 5 }, returns: 5, raises: 'AttributeError', result: { py: "(5, False, [('price', 5)])" } }, ask: 'result', note: 'Read through the dot, missing handled properly, one write on the log.' },
      ]),
    spot('Dax writes self._data = dict(fields) in __init__ instead of object.__setattr__(self, \'_data\', ...). Result?',
      ['Works the same',
       'RecursionError: the assignment hits __setattr__, which reads self._data, which is not there yet, so __getattr__ runs, which reads self._data, and so on',
       'A KeyError on the first read',
       '_data becomes a class attribute shared by every Record'],
      1, 'Every self.x = ... goes through __setattr__, including the one that was meant to create the dict the hook writes into. The fields the hooks depend on must be planted underneath them with object.__setattr__.'),
    blank('“Fall through to the dict on a miss; log every write. Plant the two fields the hooks need underneath them.”',
`class Record:
    def __init__(self, **fields):
        ___
        ___
    def __getattr__(self, name):
        if name.startswith('_'):
            raise AttributeError(name)
        try:
            return ___
        except KeyError:
            raise AttributeError(f"no field {name!r}") from None
    def __setattr__(self, name, value):
        self._data[name] = value
        ___
    def changes(self):
        return list(self._log)`,
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Record(name='torch').name", 'torch')
check("a missing field refuses properly", _t_raises(lambda: Record().zzz), 'AttributeError')
_t_r = Record(name='torch'); _t_r.price = 5
check("set then read", _t_r.price, 5)
check("changes()", _t_r.changes(), [('price', 5)])
check("hasattr(Record(), 'zzz')", False)
check("Record(a=1)._data", {'a': 1})`),
    mini('Write class Frozen(**fields) that answers obj.name from a dict planted with object.__setattr__, raises AttributeError for a missing field, and whose __setattr__ raises TypeError(\'frozen\') for any assignment after construction. Then thaw(frozen) returning a plain dict copy of its fields.',
      'Plant _data in __init__ with object.__setattr__. __getattr__ answers from it or raises AttributeError. __setattr__ is a single raise. thaw returns dict(frozen._data).',
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
_t_f = Frozen(name='torch', price=5)
check("read through the dot", _t_f.name, 'torch')
check("a missing field", _t_raises(lambda: _t_f.zzz), 'AttributeError')
check("any write is refused", _t_raises(lambda: setattr(_t_f, 'price', 6)), 'TypeError')
_t_copy = thaw(_t_f)
check("thaw copies the fields", _t_copy, {'name': 'torch', 'price': 5})
_t_copy['price'] = 99
check("the copy is a copy", _t_f.price, 5)
check("hasattr(Frozen(a=1), 'b')", False)`),
  ],
})
