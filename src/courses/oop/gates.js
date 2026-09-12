// Gate content for the oop course. One object per gate; see CLAUDE.md for the voice and schema.
const g = (id, rank, xp, stat, title, algo, story, mission, hint, code) => ({ id, rank, xp, stat, title, algo, story, mission, hint, code });

const ARCS = [
{ name:'Arc I — The bags', sub:'Four duffel bags on the floor. The fence wants a manifest, not a heap.', gates:[
  g('tag','F',40,'shape','The paper tag','Classes and instances',
    ['Four duffel bags from Halden, zipped, on the floor of the room above the laundromat. The fence will not open her chequebook until every item has a line.',
     'Dax tips the first bag out and starts typing: a dict per item, {\'name\': \'torch\', \'price\': 5}, and a list to hold the dicts. By the tenth item he has spelled \'price\' three ways.',
     '“A dict is a bag inside a bag,” Marguerite says. “Give the thing a name it answers to. Item. Then every item is built the same way, and the keys stop being your problem.”'],
    'Write class Item whose __init__(self, name, price) stores both as attributes name and price, so Item(\'torch\', 5).name is \'torch\' and .price is 5. Stretch: give Item a third attribute qty defaulting to 1 without breaking the two-argument call.',
    'The class is the paper tag; __init__ is what gets written on it when the tag is stamped. self is the tag in your hand, and self.name = name writes on that tag only.',
`t = Item('torch', 5)
t.name              # 'torch'
t.price             # 5
type(t).__name__    # 'Item'`),
  g('worth','F',45,'shape','What it is worth','Methods and self',
    ['The fence asks what the second bag is worth. Dax has a function worth(d) that reads d[\'price\'] and another, total(bag), that loops and calls the first. Both live in a different file from the items.',
     '“Two torches, three cutters,” she says down the phone. “Worth is price by count. Who is doing the count?”',
     '“The item knows its own price,” Marguerite says. “Ask it. A method is a function that lives with the thing it describes, and self is the thing.”'],
    'Write class Item(name, price, qty=1) with a method worth() returning price * qty, and class Bag with add(item), count() returning how many items were added, and total() returning the sum of every item\'s worth(). Stretch: make add return the bag so calls chain.',
    'Bag keeps a list. count is its length, total is a sum over item.worth() for each item in it. Bag never reads an item\'s price directly; it asks.'),
  g('readback','F',45,'protocol','Reading it back','repr and str',
    ['The fence reads the manifest back over the phone before she pays. Dax prints the list and gets <Item object at 0x7f3a...> eleven times.',
     '“Which one is the torch?” she asks. Dax does not know either.',
     '“If you cannot read it back, it is not on the manifest,” Marguerite says. “Two readings. One for us, exact enough to rebuild the item. One for her, plain.”'],
    'Write class Item(name, price) with __repr__ returning exactly Item(\'torch\', 5) (the name through !r, the price as is) and __str__ returning torch @ 5. Stretch: give a Bag class a __str__ that prints every item on its own line.',
    'repr is what the interpreter shows and what eval can rebuild; str is what print and f-strings use. Write __repr__ first, and use {self.name!r} so the quotes come out right.',
`t = Item('torch', 5)
repr(t)             # "Item('torch', 5)"
str(t)              # 'torch @ 5'
print(t)            # torch @ 5
[t]                 # [Item('torch', 5)]`),
  g('sharedink','F',50,'shape','Shared ink, own name','Class vs instance attributes',
    ['Every item gets a serial: HB001, HB002, stamped in the same ink from one pad. Dax keeps the counter in a global called n and, twice in one afternoon, forgets to bump it.',
     '“Two items, one serial,” the fence says. “That is not a manifest. That is a receipt for a fight.”',
     '“The pad belongs to the class,” Marguerite says. “Every tag stamps from the same pad, so the count lives on Tag, not on any one tag. The name belongs to the tag.”'],
    'Write class Tag with class attributes made = 0 and prefix = \'HB\'. Tag(name) stores name, adds one to Tag.made (the shared counter, not a copy on the instance) and stores serial as prefix followed by made zero-padded to three digits: \'HB001\', \'HB002\'. Stretch: give one tag its own prefix without changing any other tag\'s.',
    'Tag.made += 1 writes to the class; self.made += 1 would make a private copy and the pad would never move. Read prefix through self so a tag can be given its own later.'),
]},
];
export const ARCS_DATA = ARCS;
