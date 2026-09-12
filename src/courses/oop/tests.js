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
}
