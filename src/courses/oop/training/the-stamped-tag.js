import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('the-stamped-tag', {
  tier: 'F', xp: 40, requires: [], gates: ['tag'],
  tools: ['tool-dict'],
  title: 'The stamped tag', algo: 'Classes and instances',
  steps: [
    explain([
      'First bag on the bench. Dax writes one dict per item, {\'name\': \'torch\', \'price\': 5}, and a make_item(name, price) function that builds it. Three other places build the dict by hand instead, and one of them spells it \'pric\'.',
      'Dax: “It is a dict. Everyone knows how a dict works.”',
      '“Everyone knows, and everyone does it slightly differently,” Marguerite says. “Every item built the same way, by the same hands, or the keys are your problem forever.”',
    ], { move: 'brute force' }),
    explain([
      '“A class is the stamp. Item(\'torch\', 5) presses out a new tag, and __init__ is what gets written on it. self is the tag in your hand.”',
      '“The dot reaches the fields. a.price is the price on tag a and nobody else\'s. Underneath it is still a dict, vars(a), but nobody has to spell the keys again.”',
    ], { move: 'pick the pattern', code:
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price

a = Item('torch', 5)
b = Item('cutter', 10)
a.name            # 'torch'
b.price           # 10
a.price = 6       # only a changes
vars(a)           # {'name': 'torch', 'price': 6}` }),
    trace(
`class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price

def restock(item, n):
    item.price = item.price + n
    return item.price`,
      "restock(Item('torch', 5), 2)",
      [
        { line: 3, state: { name: 'torch' }, ask: 'name', note: 'Item(...) makes a fresh, empty object and hands it to __init__ as self. Each line writes one field onto it.' },
        { line: 4, state: { name: 'torch', fields: { name: 'torch', price: 5 } }, ask: 'fields', note: 'Two fields written. vars(item) would show exactly this dict.' },
        { line: 7, state: { name: 'torch', fields: { name: 'torch', price: 7 }, price: 7 }, ask: 'price', note: 'Read the field off the tag, add two, write it back onto the same tag. No other tag moves.' },
        { line: 8, state: { name: 'torch', fields: { name: 'torch', price: 7 }, price: 7, returns: 7 }, ask: 'returns', note: 'The tag remembers. Ask it again later and it still says 7.' },
      ]),
    spot('Dax writes class Item with name = \'\' and price = 0 in the class body, no __init__, and then sets Item.price = 5 for the torch. What happens to the cutter?',
      ['Nothing. Each Item has its own price',
       'Every Item now says 5, because the field lives on the class, not on the instance',
       'A TypeError',
       'The cutter keeps 0 because it was made first'],
      1, 'A name assigned in the class body is one shared field on the class. Every instance reads it until it has one of its own. __init__ writing self.price is what gives each tag its own line, and that is the difference between a class attribute and an instance attribute.'),
    blank('“Stamp the tag. Two fields in __init__, one line each.”',
`class Item:
    def __init__(self, name, price):
        ___
        ___`,
`check("Item('torch', 5).name", 'torch')
check("Item('torch', 5).price", 5)
_t_a = Item('a', 2); _t_b = Item('b', 2); _t_a.price = 9
check("two tags keep separate prices", _t_b.price, 2)
check("vars(Item('a', 1))", {'name': 'a', 'price': 1})
check("type(Item('a', 1)).__name__", 'Item')
check("Item('a', 1) is Item('a', 1)", False)`),
    mini('Write class Route(start, end, minutes) storing the three fields under those names, and longest(routes) returning the route with the most minutes.',
      'Three assignments in __init__. longest is max over the list with key=lambda r: r.minutes.',
`_t_r = Route('safehouse', 'bank', 12)
check("the three fields", (_t_r.start, _t_r.end, _t_r.minutes), ('safehouse', 'bank', 12))
_t_rs = [Route('a', 'b', 5), Route('b', 'c', 20), Route('c', 'd', 7)]
check("longest picks the slow road", longest(_t_rs).start, 'b')
check("longest of one", longest([_t_r]).end, 'bank')
check("a tie keeps the first", longest([Route('x', 'y', 3), Route('p', 'q', 3)]).start, 'x')
_t_rs[0].minutes = 99
check("a changed field moves the answer", longest(_t_rs).start, 'a')
check("len(vars(Route('a', 'b', 1)))", 3)`),
  ],
})
