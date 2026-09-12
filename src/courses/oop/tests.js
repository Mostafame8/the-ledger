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
}
