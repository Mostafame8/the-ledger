// Python tests per gate, keyed by gate id. Each string runs after the learner's code and
// src/harness.py in the same namespace. Use check(...) from the harness:
//   check("expr", expected)               evaluates expr, compares
//   check(label, thunk_or_value, expected) for in-place work, helpers, or multi-step setups
// An exception inside a check is a failed check, so tests that expect an error wrap it in
// _t_raises(fn), which returns the exception's class name. Only the main mission is tested,
// never the stretch. Helper names start with _t_ so they cannot collide with a learner's own
// names. Run `npm test` to prove the tests against scripts/solutions/oop/*.py.
export const TESTS = {
tag: `check("Item('torch', 5).name", 'torch')
check("Item('torch', 5).price", 5)
check("type(Item('a', 1)).__name__", 'Item')
_t_a = Item('a', 2); _t_b = Item('b', 2); _t_a.price = 9
check("two items keep separate prices", _t_b.price, 2)
check("hasattr(Item('a', 1), 'name')", True)
check("Item('a', 1) is Item('a', 1)", False)`,

worth: `check("Item('torch', 5).worth()", 5)
check("Item('torch', 5, 3).worth()", 15)
check("Bag().total()", 0)
check("Bag().count()", 0)
_t_b = Bag(); _t_b.add(Item('torch', 5)); _t_b.add(Item('cutter', 5, 3))
check("count after two adds", _t_b.count(), 2)
check("total after two adds", _t_b.total(), 20)
_t_c = Bag(); _t_i = Item('tape', 5); _t_c.add(_t_i); _t_c.add(_t_i)
check("the same item added twice counts twice", (_t_c.count(), _t_c.total()), (2, 10))`,

readback: `check("repr(Item('torch', 5))", "Item('torch', 5)")
check("str(Item('torch', 5))", 'torch @ 5')
check("f\\"{Item('torch', 5)}\\"", 'torch @ 5')
check("repr(Item(\\"bad 'un\\", 2))", "Item(\\"bad 'un\\", 2)")
check("eval(repr(Item('torch', 5))).name", 'torch')
check("repr([Item('a', 1)])", "[Item('a', 1)]")
check("str(Item('a', 1)) != repr(Item('a', 1))", True)`,

sharedink: `Tag.made = 0
_t_a = Tag('torch')
check("first serial", _t_a.serial, 'HB001')
_t_b = Tag('cutter')
check("second serial", _t_b.serial, 'HB002')
check("Tag.made", 2)
check("the counter read through an instance is the shared one", _t_a.made, 2)
Tag.prefix = 'X'
check("a new prefix on the class reaches the next tag", Tag('c').serial, 'X003')
Tag.prefix = 'HB'
check("two tags keep separate names", (_t_a.name, _t_b.name), ('torch', 'cutter'))`,

roles: `check("Member('m').rate()", 10)
check("Driver('d').rate()", 15)
check("Lookout('l').rate()", 5)
check("the parent's cut uses the child's rate", Driver('d').cut(1000), 150)
check("isinstance(Driver('d'), Member)", True)
check("payout([Member('m'), Driver('d'), Lookout('l')], 1000)", [('m', 100), ('d', 150), ('l', 50)])
check("payout([], 5)", [])`,

upline: `_t_d = Driver('d', 'van')
check("the parent sets the name", _t_d.name, 'd')
check("the child sets the vehicle", _t_d.vehicle, 'van')
check("jobs start empty", _t_d.jobs, [])
check("log returns the count", _t_d.log('run'), 1)
check("the driver's log carries the vehicle", _t_d.jobs, ['run:van'])
check("second log", _t_d.log('wait'), 2)
_t_m = Member('m')
check("a plain member logs plain", (_t_m.log('x'), _t_m.jobs), (1, ['x']))`,

stub: `def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("the stub shouts", _t_raises(lambda: Role().describe()), 'NotImplementedError')
check("Driver().describe()", 'drives')
check("Lookout().describe()", 'watches')
check("roster([Driver(), Lookout(), Driver()])", ['drives', 'watches', 'drives'])
check("count_roles([Driver(), 'x', Lookout(), 3, None])", 2)
check("issubclass(Driver, Role)", True)
check("count_roles([])", 0)`,

twoparents: `check("Member('m').who()", 'm')
check("Driver('d').who()", 'd, wheels')
check("Heavy('h').who()", 'h, wheels, armed')
check("[c.__name__ for c in Heavy.__mro__]", ['Heavy', 'Armed', 'Wheels', 'Member', 'object'])
check("isinstance(Heavy('h'), Wheels)", True)
check("isinstance(Driver('d'), Armed)", False)
check("Heavy('h').name", 'h')`,

sameorequal: `check("Item('a', 1) == Item('a', 1)", True)
check("Item('a', 1) == Item('a', 2)", False)
check("Item('a', 1) == 'a'", False)
check("Item('a', 1) is Item('a', 1)", False)
check("len({Item('a', 1), Item('a', 1), Item('b', 1)})", 2)
check("distinct([Item('a', 1), Item('a', 1), Item('b', 2)])", 2)
check("a fresh equal key finds the entry", {Item('a', 1): 'x'}[Item('a', 1)], 'x')`,

inorder: `check("Item('a', 5) < Item('b', 7)", True)
check("a tie on price breaks on name", Item('a', 5) < Item('b', 5), True)
check("Item('b', 7) > Item('a', 5)", True)
check("Item('a', 5) <= Item('a', 5)", True)
_t_items = [Item('x', 9), Item('y', 1), Item('z', 5)]
check("by_price", by_price(_t_items), ['y', 'z', 'x'])
check("cheapest", cheapest(_t_items).name, 'y')
check("max follows the same rule", max(_t_items).name, 'x')`,

countandreach: `def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("len(Bag())", 0)
_t_b = Bag()
for _t_i in [Item('torch', 5), Item('cutter', 10), Item('tape', 2)]: _t_b.add(_t_i)
check("len after three adds", len(_t_b), 3)
check("bag[0]", _t_b[0].name, 'torch')
check("bag[-1]", _t_b[-1].name, 'tape')
check("a slice comes back as a list of two", [i.name for i in _t_b[0:2]], ['torch', 'cutter'])
check("'torch' in bag", 'torch' in _t_b, True)
check("'x' in bag", 'x' in _t_b, False)
check("past the end", _t_raises(lambda: _t_b[5]), 'IndexError')`,

walkthebag: `def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("list(Bag())", [])
_t_b = Bag(); _t_b.add(Item('torch', 5)); _t_b.add(Item('cutter', 10))
check("names in insertion order", list(_t_b), ['torch', 'cutter'])
_t_it = iter(_t_b); next(_t_it)
check("a second walker starts fresh", (list(_t_it), list(_t_b)), (['cutter'], ['torch', 'cutter']))
check("an empty walk stops at once", _t_raises(lambda: next(iter(BagWalk([])))), 'StopIteration')
_t_w = iter(_t_b)
check("iter(walker) is the walker", iter(_t_w) is _t_w, True)
check("names(bag)", names(_t_b), ['torch', 'cutter'])
check("sum(1 for _ in _t_b)", 2)`,

guardedprice: `def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Item('a', 5).price", 5)
_t_i = Item('a', 5); _t_i.price = 7
check("a good price is stored", _t_i.price, 7)
check("a negative price is refused", _t_raises(lambda: setattr(_t_i, 'price', -1)), 'ValueError')
check("and refused at birth", _t_raises(lambda: Item('a', -3)), 'ValueError')
check("Item('a', 5).label", 'a @ 5')
check("label follows the price", _t_i.label, 'a @ 7')
check("label is read-only", _t_raises(lambda: setattr(_t_i, 'label', 'x')), 'AttributeError')`,

fromline: `check("Item.from_line('torch,5').name", 'torch')
check("Item.from_line('torch,5').price", 5)
check("Item.parse_price('5')", 5)
check("Item.parse_price('5.50')", 5.5)
_t_items = Item.from_lines('a,1\\n\\n b , 2 \\n')
check("blank lines are skipped", len(_t_items), 2)
check("spaces are stripped", (_t_items[1].name, _t_items[1].price), ('b', 2))
check("type(Stolen.from_line('a,1')).__name__", 'Stolen')`,

frozenentry: `def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Entry(5, 'torch') == Entry(5, 'torch')", True)
check("sorted([Entry(9, 'x'), Entry(1, 'y')])[0].name", 'y')
check("frozen", _t_raises(lambda: setattr(Entry(1, 'a'), 'price', 2)), 'FrozenInstanceError')
check("len({Entry(1, 'a'), Entry(1, 'a')})", 1)
check("repr(Entry(5, 'torch'))", "Entry(price=5, name='torch', tags=())")
check("Entry(1, 'a', ('hot',)).tags", ('hot',))
check("total([Entry(1, 'a'), Entry(2, 'b')])", 3)`,

sealedbag: `def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
def _t_inside():
    with Bag() as b:
        b.add('torch')
        return (b.sealed, list(b.items))
def _t_after():
    with Bag() as b:
        b.add('torch')
    return (b.sealed, list(b.items))
def _t_error():
    try:
        with Bag() as b:
            raise ValueError('mid-meeting')
    except ValueError:
        return b.sealed
check("Bag().sealed", False)
check("inside the block the bag is open and takes items", _t_inside(), (False, ['torch']))
check("after the block the bag is sealed and keeps its items", _t_after(), (True, ['torch']))
_t_b = Bag()
with _t_b: pass
check("a sealed bag refuses", _t_raises(lambda: _t_b.add('x')), 'RuntimeError')
check("an error inside still seals and still climbs", _t_error(), True)
check("Bag().__exit__(None, None, None)", False)`,

typedfield: `def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Entry(5, 2).price", 5)
check("Entry(5, 2).qty", 2)
check("zero is refused", _t_raises(lambda: setattr(Entry(5, 2), 'price', 0)), 'ValueError')
check("and refused at birth", _t_raises(lambda: Entry(-1, 1)), 'ValueError')
_t_a = Entry(5, 2); _t_b = Entry(7, 3); _t_a.price = 9
check("two entries keep separate values", (_t_a.price, _t_b.price), (9, 7))
check("type(Entry.price).__name__", 'Positive')
check("'_price' in vars(Entry(5, 2))", True)`,

attributetrap: `def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Record(name='torch').name", 'torch')
check("a missing field refuses properly", _t_raises(lambda: Record().zzz), 'AttributeError')
_t_r = Record(name='torch'); _t_r.price = 5
check("set then read", _t_r.price, 5)
check("changes()", _t_r.changes(), [('price', 5)])
check("hasattr(Record(), 'zzz')", False)
check("Record(a=1)._data", {'a': 1})
_t_s = Record(); _t_s.x = 1
check("two records keep separate logs", (_t_r.changes(), _t_s.changes()), ([('price', 5)], [('x', 1)]))`,

selfregister: `def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Entry.kinds['cash'] is Cash", True)
check("Entry.kinds['stone'] is Gem", True)
check("'entry' in Entry.kinds", False)
check("type(Entry.build('cash', 5)).__name__", 'Cash')
check("Entry.build('stone', 1).amount", 1)
check("an unknown kind", _t_raises(lambda: Entry.build('air')), 'KeyError')
class _t_Bond(Entry):
    def __init__(self, amount): self.amount = amount
check("a new child signs itself in", Entry.kinds.get('_t_bond') is _t_Bond, True)
class _t_Note(Cash):
    pass
check("a grandchild signs in too", Entry.kinds.get('_t_note') is _t_Note, True)`,

manifest: `def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
_t_m = Manifest.from_lines('torch,5,2\\ncutter,10,1\\n\\n')
check("len(m)", len(_t_m), 2)
check("m.total()", _t_m.total(), 20)
check("[l.name for l in m]", [l.name for l in _t_m], ['torch', 'cutter'])
check("'torch' in m", 'torch' in _t_m, True)
check("m[0].worth", _t_m[0].worth, 10)
check("a zero price is refused", _t_raises(lambda: Line('a', 0, 1)), 'ValueError')
with _t_m: pass
check("the block seals the book", _t_m.sealed, True)
check("a sealed book refuses", _t_raises(lambda: _t_m.add(Line('x', 1, 1))), 'RuntimeError')
check("len({Line('a', 1, 1), Line('a', 1, 1)})", 1)
check("repr(Line('torch', 5, 2))", "Line('torch', 5, 2)")`,
}
