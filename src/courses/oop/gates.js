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
{ name:'Arc II — The roster', sub:'Who was on the job, and what they are owed. Dax has a dict per person and an if per role.', gates:[
  g('roles','E',60,'kin','Roles on the roster','Inheritance and overriding',
    ['The fence pays the crew by role. Ten percent to a body, fifteen to the driver, five to whoever stood in the rain and watched.',
     'Dax has if role == \'driver\' in three places, and a fourth where he typed \'Driver\' and the lookout got paid like a wheelman.',
     '“Each role knows its own rate,” Marguerite says. “Write the cut once, on the parent, and let it ask. Whoever the child is, the sum is the same.”'],
    'Write class Member(name) with rate() returning 10 and cut(total) returning total * self.rate() // 100. Then class Driver(Member) with rate() returning 15 and class Lookout(Member) with rate() returning 5; neither redefines cut. Then payout(members, total) returning a list of (name, cut) tuples in roster order. Stretch: add a fourth role without touching cut or payout.',
    'cut lives on Member only. When a Driver calls it, self is the Driver, so self.rate() finds the child\'s 15. The parent never needs to know the children exist.',
`Driver('dax').rate()             # 15
Driver('dax').cut(1000)          # 150
Lookout('vera').cut(1000)        # 50
payout([Member('m'), Driver('d')], 1000)   # [('m', 100), ('d', 150)]`),
  g('upline','E',70,'kin','Call up the line','super()',
    ['Driver needs everything Member has, plus a vehicle. Dax copies Member\'s __init__ into Driver, line for line, and adds one. A week later Member grows a field and Driver does not.',
     '“Two copies drift,” Marguerite says. “Do not copy the parent. Call up the line: super() hands you the parent\'s version of whatever you are standing in.”',
     'Dax: “And the log?” “Same move. Do your part, call up, hand back what the parent handed you.”'],
    'Write class Member(name) storing name and jobs = [], with log(job) appending job and returning the new count. Then class Driver(Member) taking (name, vehicle): its __init__ calls the parent __init__ through super() and stores vehicle; its log(job) calls the parent log with f"{job}:{self.vehicle}" and returns what the parent returns. Stretch: a Lookout(Member) taking (name, post) whose log records f"{job}@{post}", both super() calls one line each.',
    'super().__init__(name) runs Member\'s __init__ on this same self, so name and jobs appear without Driver writing them. super().log(...) is the parent\'s log, still appending to this self\'s list.'),
  g('stub','D',90,'kin','The empty chair','Abstract stubs',
    ['There is a chair at the table for a role nobody has filled yet. Dax\'s Role.describe() returns None, and the roster prints a blank line where the safecracker should be.',
     '“An empty chair should shout when someone sits in it,” Marguerite says. “The parent names the move and refuses to make it. The children make it or they are not children.”',
     'Dax: “And the count?” “Ask each thing whether it is a Role. Not whether it is a Driver, not whether it has a describe. Whether it is one of ours.”'],
    'Write class Role with describe() raising NotImplementedError. Then class Driver(Role) whose describe() returns \'drives\' and class Lookout(Role) whose describe() returns \'watches\'. Then roster(roles) returning the list of descriptions, and count_roles(things) returning how many items in a mixed list are Role instances. Stretch: make Role an abc.ABC with describe an abstractmethod so Role() itself cannot be built.',
    'raise NotImplementedError in the parent is the stub. isinstance(x, Role) is True for Driver and Lookout too, because they are Roles; that is the whole point of the family line.',
`Driver().describe()              # 'drives'
Role().describe()                # NotImplementedError
roster([Driver(), Lookout()])    # ['drives', 'watches']
count_roles([Driver(), 'x', 3])  # 1`),
  g('twoparents','D',100,'kin','Two parents','Multiple inheritance and MRO',
    ['Heavy drives and carries. Dax writes who() by hand for every combination: driver, armed, armed driver, and a fourth he has not thought of yet.',
     '“Stack the parts,” Marguerite says. “A Wheels part that adds wheels to whatever who() it is standing on. An Armed part that adds armed. Put them in front of Member and let Python chain them.”',
     'Dax: “In what order?” “Python decides, and it will tell you what it decided. Read __mro__ before you guess.”'],
    'Write class Member(name) with who() returning name. Then class Wheels with who() returning super().who() + \', wheels\' and class Armed with who() returning super().who() + \', armed\'. Then class Driver(Wheels, Member) and class Heavy(Armed, Wheels, Member), both with empty bodies. Heavy(\'h\').who() must be \'h, wheels, armed\'. Stretch: add a third part, predict Heavy.__mro__ before running, then check.',
    'super() inside Wheels does not mean "Wheels\'s parent". It means "the next class after Wheels in this object\'s __mro__". For Heavy that chain is Armed, Wheels, Member, so Armed\'s text lands last.'),
]},
{ name:'Arc III — The count', sub:'Two torches are one line. The fence sorts by price and counts by hand; the manifest has to agree with her.', gates:[
  g('sameorequal','D',95,'protocol','Same or equal','Equality and hashing',
    ['Two torches, from two bags, one line on the manifest. Dax puts both in a set to dedupe and the set keeps both, because his Item has no idea what equal means.',
     '“Same thing, or an equal thing?” Marguerite says. “Two objects are never the same object. Whether they are equal is yours to decide. Decide, and tell the set.”',
     '“And when you tell it, tell it twice: what equal means, and what hash means. They have to agree, or the set lies.”'],
    'Write class Item(name, price) with __eq__ comparing (name, price) when the other side is an Item and returning NotImplemented otherwise, and __hash__ returning hash((name, price)). Then distinct(items) returning how many different items are in a list. Stretch: keep __eq__ but set __hash__ = None and see which of these tests break.',
    'Equal items must hash equal, and hashing the same tuple you compare is the easiest way to keep that promise. NotImplemented, not False, lets Python try the other side.'),
  g('inorder','C',120,'protocol','Put them in order','Ordering',
    ['The fence reads prices low to high, ties by name. Dax passes key=lambda i: i.price to every sorted() and min() in the file, and forgets the tie-break in two of them.',
     '“If the item knows what comes before it,” Marguerite says, “sorted needs nothing from you. One rule, on the class, and every sort in the building agrees.”',
     'Dax: “I write six comparison methods?” “You write two. functools.total_ordering writes the other four.”'],
    'Write class Item(name, price) with __eq__ and __lt__ ordering by price then name, decorated with functools.total_ordering so >, <= and >= follow. Then by_price(items) returning the names in sorted order and cheapest(items) returning the cheapest item. Stretch: make sorted(items, reverse=True) keep equal prices in their original order.',
    'Compare tuples: (self.price, self.name) < (other.price, other.name) gives you the tie-break for free. total_ordering needs __eq__ and one of the four to build the rest.'),
  g('countandreach','C',130,'protocol','Count and reach','Sequence protocol',
    ['len(bag) blows up on Dax\'s Bag. bag[0] blows up. \'torch\' in bag walks every item and compares against a string, and returns False, because an Item is not a string.',
     '“A bag you cannot count is not a bag,” Marguerite says. “Three answers: how many, which one, and is it here. Give them and the bag behaves like every list in the building.”',
     'Dax: “Slices too?” “A slice arrives as a slice object. Hand it to the list underneath and hand back what comes out.”'],
    'Write class Item(name, price), and class Bag with add(item), __len__, __getitem__ accepting an int (negatives too) or a slice (returning a list), and __contains__ answering to an item name string. Stretch: make for item in bag work without writing __iter__, and say why it does.',
    '__getitem__ can pass its argument straight to the inner list; int and slice both work there and IndexError comes out on its own. __contains__ walks the items and compares name to the string it was given.'),
  g('walkthebag','C',140,'protocol','Walk the bag','Iteration protocol',
    ['The fence wants to walk the room one item at a time, and Dax hands her bag.items. She sorts it in place. The manifest order is gone.',
     '“Hand her a walker, not the shelf,” Marguerite says. “iter(bag) gives out a fresh walker. Each walker remembers where it is and says StopIteration when it is done.”',
     'Dax: “Two people walking at once?” “Two walkers. The bag does not move.”'],
    'Write class Bag with add(item) and __iter__ returning a BagWalk. Then class BagWalk(items) with __iter__ returning self and __next__ returning the next item\'s name in insertion order, raising StopIteration at the end. Then names(bag) returning list(bag). Stretch: rewrite Bag.__iter__ as a generator with yield and delete BagWalk.',
    'BagWalk keeps an index. __next__ reads the item at the index, moves the index on, and raises StopIteration when the index runs off the end. Bag.__iter__ builds a new BagWalk every time it is asked.'),
]},
];
export const ARCS_DATA = ARCS;
