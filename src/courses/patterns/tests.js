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

foreignplug: `check("OldSafe().crack(4417)", True)
check("SafeAdapter(OldSafe()).open('4417')", True)
check("SafeAdapter(OldSafe()).open('0000')", False)
check("SafeAdapter(OldSafe()).open('abcd')", False)
class _t_New:
    def __init__(self, code): self.code = code
    def open(self, code): return code == self.code
check("open_all over adapters and a native safe", open_all([SafeAdapter(OldSafe()), _t_New('4417'), _t_New('9')], '4417'), 2)
check("open_all([], '4417')", 0)
class _t_Spy:
    def __init__(self): self.opens = 0; self.cracks = 0
    def open(self, code): self.opens += 1; return False
    def crack(self, code): self.cracks += 1; return False
_t_spy = _t_Spy(); open_all([_t_spy], '1')
check("open_all calls open, never crack", (_t_spy.opens, _t_spy.cracks), (1, 0))`,

layers: `check("Coat().warmth()", 1)
check("Coat().describe()", 'coat')
check("Lined(Coat()).warmth()", 3)
check("Lined(Coat()).describe()", 'lined coat')
check("Armoured(Lined(Coat())).describe()", 'armoured lined coat')
check("Lined(Armoured(Coat())).warmth()", 4)
check("Lined(Lined(Coat())).describe()", 'lined lined coat')
class _t_Vest:
    def warmth(self): return 10
    def describe(self): return 'vest'
check("layers accept any coat-shaped thing", Armoured(_t_Vest()).describe(), 'armoured vest')`,

frontdesk: `check("Job().run()", ['camera looping', 'guard busy', 'vault open'])
check("Vault().unlock()", 'vault open')
check("Guard().distract()", 'guard busy')
check("Camera().loop()", 'camera looping')
_t_j = Job()
check("run twice, same result", _t_j.run() == _t_j.run(), True)
check("two jobs, same plan", Job().run() == Job().run(), True)`,

wrappedhand: `_t_log = []
@logged(_t_log)
def _t_cut(a, b): return a + b
check("logged returns the value", _t_cut(3, 4), 7)
check("logged wrote the call", _t_log, ['_t_cut(3,4)'])
_t_cut(1, 2)
check("two calls, two lines", len(_t_log), 2)
_t_tries = []
@retry(3)
def _t_flaky(): _t_tries.append(1); return 'ok' if len(_t_tries) >= 2 else None
check("retry returns the first real result", _t_flaky(), 'ok')
check("and stopped as soon as it had one", len(_t_tries), 2)
_t_n = []
@retry(3)
def _t_never(): _t_n.append(1); return None
check("retry gives up with None", _t_never(), None)
check("after exactly times tries", len(_t_n), 3)`,

threeways: `check("Sewer().path('bank')", 'bank -> sewer')
check("Rooftop().path('bank')", 'bank -> rooftop')
check("Cab().path('bank')", 'bank -> cab')
_t_e = Escape(Sewer())
check("go delegates to the route", _t_e.go('bank'), 'bank -> sewer')
_t_e.switch(Cab())
check("switch then go uses the new route", _t_e.go('bank'), 'bank -> cab')
class _t_Boat:
    def path(self, start): return start + ' -> boat'
_t_e.switch(_t_Boat())
check("any route-shaped thing works", _t_e.go('pier'), 'pier -> boat')
check("switch returns nothing", Escape(Sewer()).switch(Rooftop()), None)`,

hearthewire: `check("Tripwire().trip('fence')", 0)
_t_heard = []
_t_w = Tripwire()
_t_w.subscribe(lambda where: _t_heard.append('driver:' + where))
check("one subscriber is called", _t_w.trip('fence'), 1)
check("with the place", _t_heard, ['driver:fence'])
_t_second = _t_w.subscribe(lambda where: _t_heard.append('lookout:' + where))
_t_heard.clear(); _t_w.trip('gate')
check("two hear it in order", _t_heard, ['driver:gate', 'lookout:gate'])
_t_w.unsubscribe(_t_second)
check("unsubscribe removes one", _t_w.trip('gate'), 1)
_t_w.unsubscribe(lambda where: None)
check("unsubscribing a stranger is safe", _t_w.trip('gate'), 1)
_t_fn = lambda where: None
check("subscribe returns the callback", Tripwire().subscribe(_t_fn) is _t_fn, True)`,

takeitback: `check("Move(1, 2).do((0, 0))", (1, 2))
check("Move(1, 2).undo((1, 2))", (0, 0))
_t_r = Recorder()
_t_p = _t_r.run(Move(1, 0), (0, 0))
_t_p = _t_r.run(Move(0, 5), _t_p)
check("two moves recorded", _t_p, (1, 5))
_t_p = _t_r.undo(_t_p)
check("undo reverses the last move", _t_p, (1, 0))
check("undo with an empty history leaves pos alone", Recorder().undo((3, 3)), (3, 3))
_t_p = _t_r.redo(_t_p)
check("redo re-applies it", _t_p, (1, 5))
check("nothing left to redo", _t_r.redo(_t_p), (1, 5))
_t_p = _t_r.undo(_t_p); _t_p = _t_r.run(Move(2, 2), _t_p)
check("a new run after undo clears redo", _t_r.redo(_t_p), (3, 2))`,

wireboard: `check("Bus().emit('door', 1)", 0)
_t_got = []
_t_bus = Bus()
_t_bus.on('door', lambda p: _t_got.append(('door', p)))
_t_bus.on('vault', lambda p: _t_got.append(('vault', p)))
check("emit reaches one kind", _t_bus.emit('door', 'open'), 1)
check("and only that kind", _t_got, [('door', 'open')])
_t_bus.on('door', lambda p: _t_got.append(('door2', p)))
_t_got.clear(); _t_bus.emit('door', 'shut')
check("two on one kind, in order", _t_got, [('door', 'shut'), ('door2', 'shut')])
_t_fn = lambda p: _t_got.append(('street', p))
_t_bus.on('street', _t_fn); _t_bus.off('street', _t_fn)
check("off removes the subscriber", _t_bus.emit('street', 'quiet'), 0)
check("other kinds unaffected", _t_bus.emit('vault', 'code'), 1)`,

readtheroom: `_t_m = Mark()
check("a fresh mark is calm", _t_m.mood, 'calm')
check("calm talk", _t_m.talk(), 'small talk')
_t_m.nudge()
check("one nudge makes him wary", (_t_m.mood, _t_m.talk()), ('wary', 'short answers'))
_t_m.nudge()
check("two nudges and he is alarmed", (_t_m.mood, _t_m.talk()), ('alarmed', 'calls it in'))
_t_m.nudge()
check("alarmed stays alarmed", _t_m.mood, 'alarmed')
check("Calm().next().name", 'wary')
check("Alarmed().next().name", 'alarmed')`,

runsheet: `check("VaultJob().run()", ['gear checked', 'vault emptied', 'wiped down'])
check("SafehouseJob().run()", ['keys copied', 'files copied', 'wiped down'])
def _t_raises(thunk):
    try:
        thunk()
    except Exception as e:
        return type(e).__name__
    return None
check("the bare sheet cannot run", _t_raises(lambda: Job().run()), 'NotImplementedError')
check("cleanup is shared", VaultJob().cleanup() == SafehouseJob().cleanup(), True)
_t_v = VaultJob()
check("run twice, same sheet", _t_v.run() == _t_v.run(), True)
class _t_Quick(Job):
    def execute(self): return 'in and out'
check("a new job only writes its middle line", _t_Quick().run(), ['gear checked', 'in and out', 'wiped down'])`,

roombyroom: `_t_v = Vault([('lobby', False), ('cage', True), ('safe', True), ('exit', False)])
check("list(_t_v)", ['lobby', 'cage', 'safe', 'exit'])
check("list(open_rooms(_t_v))", ['lobby', 'exit'])
check("first_locked(_t_v)", 'cage')
check("first_locked(Vault([('lobby', False)]))", None)
check("list(Vault([]))", [])
check("walking twice gives the same rooms", list(_t_v) == list(_t_v), True)
check("type(open_rooms(_t_v)).__name__", 'generator')`,

wholerig: `class _t_Driver:
    pass
class _t_Route:
    def path(self, city): return city + ' -> harbour'
_t_c = Crew()
_t_c.register('driver', _t_Driver)
_t_hired = []
_t_c.on('hired', lambda who: _t_hired.append(type(who).__name__))
_t_d = _t_c.hire('driver')
check("hire builds the registered class", type(_t_d).__name__, '_t_Driver')
check("hiring tells the wire", _t_hired, ['_t_Driver'])
def _t_raises(thunk):
    try:
        thunk()
    except Exception as e:
        return type(e).__name__
    return None
check("an unknown role raises KeyError", _t_raises(lambda: _t_c.hire('pilot')), 'KeyError')
_t_c.plan(_t_Route())
check("go follows the planned route", _t_c.go('bank'), 'bank -> harbour')
class _t_Other:
    def path(self, city): return city + ' -> airstrip'
_t_c.plan(_t_Other())
check("a new plan, a new way out", _t_c.go('bank'), 'bank -> airstrip')
check("an event nobody asked for is silence", _t_c.emit('rain', None), 0)
check("two crews are independent", _t_raises(lambda: Crew().hire('driver')), 'KeyError')`,
}
