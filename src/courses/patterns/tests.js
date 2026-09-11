// Python tests per gate, keyed by gate id. Each string runs after the learner's code and
// src/harness.py in the same namespace. Use check(...) from the harness:
//   check("expr", expected)               evaluates expr, compares
//   check(label, thunk_or_value, expected) for in-place work, helpers, or multi-step setups
// Only the main mission is tested, never the stretch. Helper names start with _t_ so they
// cannot collide with a learner's own names. Run `npm test` to prove the tests against
// scripts/solutions/patterns/*.py.
export const TESTS = {
onejob: `check("Tally().total()", 0)
_t_a = Tally(); _t_a.add('torch', 5); _t_a.add('cutter', 10)
check("total after two adds", _t_a.total(), 15)
check("receipt(Tally())", ['total  0'])
check("receipt of two items", receipt(_t_a), ['torch  5', 'cutter  10', 'total  15'])
_t_b = Tally(); _t_b.add('tape', 2); _t_b.add('tape', 2)
check("the same item twice keeps both lines", receipt(_t_b), ['tape  2', 'tape  2', 'total  4'])
_t_a.add('jammer', 30)
check("total after three adds", _t_a.total(), 45)`,

bolton: `check("Alarm().trip({'door': True})", [])
_t_a = Alarm()
_t_a.add('door', lambda e: e.get('door', False))
check("one sensor fires", _t_a.trip({'door': True}), ['door'])
check("one sensor stays quiet", _t_a.trip({'door': False}), [])
_t_a.add('window', lambda e: e.get('window', False))
check("two fire in the order added", _t_a.trip({'door': True, 'window': True}), ['door', 'window'])
_t_b = Alarm(); _t_b.add('loud', lambda e: True); _t_b.add('quiet', lambda e: False); _t_b.add('louder', lambda e: True)
check("a silent sensor between two loud ones", _t_b.trip({}), ['loud', 'louder'])
check("only the names differ between events", _t_b.trip({'x': 1}), ['loud', 'louder'])`,

standin: `check("Lock().open('x')", False)
check("KeyLock('A7').open('A7')", True)
check("KeyLock('A7').open('B2')", False)
check("CodeLock('4417').open(4417)", True)
check("open_all([KeyLock('A7'), CodeLock('A7'), Lock(), KeyLock('B2')], 'A7')", 2)
check("open_all([], 'k')", 0)
check("isinstance(KeyLock('a'), Lock)", True)`,

socket: `check("Log().sent", [])
_t_log = Log(); _t_d = Dispatcher(_t_log)
check("alert returns the string it sent", _t_d.alert('door'), 'ALERT: door')
_t_d.alert('window')
check("the log kept both, in order", _t_log.sent, ['ALERT: door', 'ALERT: window'])
class _t_Counter:
    def __init__(self): self.n = 0
    def send(self, text): self.n += 1
_t_c = _t_Counter(); _t_dc = Dispatcher(_t_c); _t_dc.alert('a'); _t_dc.alert('b'); _t_dc.alert('c')
check("a counting channel plugs straight in", _t_c.n, 3)
check("empty text still sends", Dispatcher(Log()).alert(''), 'ALERT: ')
_t_log2 = Log(); Dispatcher(_t_log2).alert('x')
check("a fresh log holds one line", _t_log2.sent, ['ALERT: x'])`,

rigfactory: `_t_f = RigFactory()
check("kind names pick the class", [type(_t_f.make(k)).__name__ for k in ('cutter', 'torch', 'jammer')], ['Cutter', 'Torch', 'Jammer'])
check("each rig uses its own way", [_t_f.make(k).use() for k in ('cutter', 'torch', 'jammer')], ['cutting', 'burning', 'jamming'])
def _t_raises(thunk):
    try:
        thunk()
    except Exception as e:
        return type(e).__name__
    return None
check("an unknown kind raises ValueError", _t_raises(lambda: _t_f.make('drill')), 'ValueError')
check("wrong case is unknown too", _t_raises(lambda: _t_f.make('Cutter')), 'ValueError')
check("two makes give two rigs", _t_f.make('torch') is _t_f.make('torch'), False)
check("Cutter().use()", 'cutting')`,

rigbuilder: `check("RigBuilder().build().describe()", 'steel blade, 20Ah, loud')
check("RigBuilder().battery(40).blade('diamond').silent().build().describe()", 'diamond blade, 40Ah, silent')
check("order of calls does not matter", RigBuilder().silent().blade('diamond').battery(40).build().describe(), 'diamond blade, 40Ah, silent')
_t_b = RigBuilder().battery(60)
check("build twice gives the same description", _t_b.build().describe() == _t_b.build().describe(), True)
check("silent flips only the flag", RigBuilder().silent().build().battery, 20)
check("battery is stored as a number", RigBuilder().battery(40).build().battery, 40)`,

oneradio: `Radio.reset()
check("Radio.get() is Radio.get()", True)
Radio.get().tune(446.0)
check("tuning shows through another get", Radio.get().freq, 446.0)
Radio.get().tune(462.5)
check("the last tune wins", Radio.get().freq, 462.5)
_t_old = Radio.get()
Radio.reset()
check("reset forgets the frequency", Radio.get().freq, None)
check("reset gives a different object", Radio.get() is _t_old, False)
Radio.reset(); Radio.reset()
check("reset twice is safe", Radio.get().freq, None)`,

catalogue: `_t_cat = Catalogue()
@_t_cat.register('cutter')
class _t_Cutter:
    def __init__(self, blade='steel'): self.blade = blade
@_t_cat.register('torch')
class _t_Torch:
    def __init__(self, fuel=10): self.fuel = fuel
check("kinds are sorted", _t_cat.kinds(), ['cutter', 'torch'])
check("build returns the registered class", type(_t_cat.build('torch')).__name__, '_t_Torch')
check("keyword args reach the constructor", _t_cat.build('cutter', blade='diamond').blade, 'diamond')
def _t_raises(thunk):
    try:
        thunk()
    except Exception as e:
        return type(e).__name__
    return None
check("an unknown kind raises KeyError", _t_raises(lambda: _t_cat.build('drill')), 'KeyError')
class _t_Plain:
    pass
check("the decorator hands the class back unchanged", _t_cat.register('plain')(_t_Plain) is _t_Plain, True)
check("two catalogues are independent", Catalogue().kinds(), [])`,
}
