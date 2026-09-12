import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-dict', {
  xp: 30, title: 'The loose bag', algo: 'Dict',
  steps: [
    explain([
      'Dax\'s item is a dict. Every field is a string key, and every string key is a thing you can misspell at two in the morning.',
      '“A dict is where attributes live before they have a home,” Marguerite says. “Learn its moves, because every object keeps one underneath.”',
      '“Square brackets for a key you know is there. get for a key that might not be, with the answer you want if it is missing. And the same three moves, spelled getattr and setattr and vars, work on any object.”',
    ], { code:
`item = {'name': 'torch', 'price': 5}
item['price']              # 5
item.get('qty', 1)         # 1, no KeyError
'qty' in item              # False
item['qty'] = 2
list(item)                 # ['name', 'price', 'qty']

class Item: pass
i = Item()
i.name = 'torch'
vars(i)                    # {'name': 'torch'}
getattr(i, 'qty', 1)       # 1
setattr(i, 'qty', 2)
i.__dict__                 # {'name': 'torch', 'qty': 2}` }),
    explain([
      '“obj.name is obj.__dict__[\'name\'], with a fallback up to the class when the instance does not have it. The dot is a dict lookup wearing a suit.”',
      '“getattr and setattr are the dot spelled as a function, for names you only know at run time. vars(obj) hands you the dict itself.”',
      '“So a dict you can read is an object you can read. Nothing in this room is more mysterious than that.”',
    ]),
    trace(
`def label(d):
    name = d.get('name', '?')
    qty = d.get('qty', 1)
    d['seen'] = True
    return f"{name} x{qty}"`,
      "label({'name': 'torch'})",
      [
        { line: 2, state: { name: 'torch' }, ask: 'name', note: 'The key is there, so get returns its value. The default is never looked at.' },
        { line: 3, state: { name: 'torch', qty: 1 }, ask: 'qty', note: 'No qty key. get hands back the default, 1, and leaves the dict exactly as it was.' },
        { line: 4, state: { name: 'torch', qty: 1, d: { name: 'torch', seen: true } }, ask: 'd', note: 'Writing a new key grows the dict. This is the move setattr makes on an object.' },
        { line: 5, state: { name: 'torch', qty: 1, d: { name: 'torch', seen: true }, returns: 'torch x1' }, ask: 'returns', note: 'The label is built from what was read, missing key and all.' },
      ]),
    blank('“Read an object like a dict. describe(obj) returns every field as key=value, sorted by key.”',
`def describe(obj):
    fields = ___
    return sorted(f"{k}={v}" for k, v in ___)`,
`class _t_P: pass
_t_p = _t_P(); _t_p.b = 2; _t_p.a = 1
check("two fields, sorted by key", describe(_t_p), ['a=1', 'b=2'])
check("an empty object", describe(_t_P()), [])
_t_p.c = 3
check("a field added later shows up", describe(_t_p), ['a=1', 'b=2', 'c=3'])
_t_q = _t_P(); _t_q.name = 'torch'
check("values print plain, no quotes", describe(_t_q), ['name=torch'])
class _t_Q:
    z = 0
_t_r = _t_Q(); _t_r.a = 1
check("class attributes are not the object's own fields", describe(_t_r), ['a=1'])`),
  ],
})
