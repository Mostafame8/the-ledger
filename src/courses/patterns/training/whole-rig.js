import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('whole-rig', {
  tier: 'S', xp: 300, requires: ['order-window', 'tripwire', 'pick-the-play', 'undo-button'], gates: ['wholerig'],
  tools: ['tool-dunder'],
  title: 'The whole rig', algo: 'Combining patterns',
  steps: [
    explain([
      'The last sheet of the season, one line long: hire by role, tell everyone when someone joins, plan a route, go. Dax reads it as three jobs from three nights and starts three classes.',
      'Dax: “Three shapes, three classes.” “Three shapes, one object. You have built every one of them this month.”',
    ], { move: 'brute force' }),
    explain([
      '“A table of roles is the window. A list of ears per event is the wire. One slot for the route is the swappable part. The crew object holds all three and stays small, because each shape is already small.”',
      '“The point of knowing the shapes is not naming them. It is seeing three of them on one sheet and not flinching.”',
    ], { move: 'pick the pattern', code:
`class Crew:
    def __init__(self):
        self.roles, self.ears, self.route = {}, {}, None
    def register(self, role, cls):
        self.roles[role] = cls
    def hire(self, role):
        member = self.roles[role]()
        self.emit('hired', member)
        return member
    def on(self, event, fn):
        self.ears.setdefault(event, []).append(fn)
    def emit(self, event, payload):
        fns = self.ears.get(event, [])
        for fn in fns:
            fn(payload)
        return len(fns)
    def plan(self, strategy):
        self.route = strategy
    def go(self, city):
        return self.route.path(city)` }),
    trace(
`class Crew:
    def __init__(self):
        self.roles, self.ears, self.route = {}, {}, None
    def register(self, role, cls):
        self.roles[role] = cls
    def hire(self, role):
        member = self.roles[role]()
        self.emit('hired', member)
        return member
    def on(self, event, fn):
        self.ears.setdefault(event, []).append(fn)
    def emit(self, event, payload):
        fns = self.ears.get(event, [])
        for fn in fns:
            fn(payload)
        return len(fns)
    def plan(self, strategy):
        self.route = strategy
    def go(self, city):
        return self.route.path(city)

class Driver:
    pass
class Harbour:
    def path(self, city): return city + ' -> harbour'

def season():
    hired = []
    c = Crew()
    c.register('driver', Driver)
    c.on('hired', lambda who: hired.append(type(who).__name__))
    c.hire('driver')
    c.plan(Harbour())
    return (hired, c.go('bank'))`,
      'season()',
      [
        { line: 5, state: { roles: ['driver'] }, ask: 'roles', note: 'One row in the table: the window now knows how to make a driver. Nothing built yet.' },
        { line: 11, state: { roles: ['driver'], ears: ['hired'] }, ask: 'ears', note: 'One ear on the wire for the hired event. The crew holds a function and knows nothing else about it.' },
        { line: 15, state: { roles: ['driver'], ears: ['hired'], hired: ['Driver'] }, ask: 'hired', note: 'hire built a Driver through the table and emit told the wire. The ear wrote the name down. Window and wire, one call.' },
        { line: 18, state: { hired: ['Driver'], route: { py: 'Harbour()' } }, ask: 'route', note: 'plan drops a route into the swappable slot. The crew never spelled Harbour anywhere.' },
        { line: 34, state: { hired: ['Driver'], route: { py: 'Harbour()' }, returns: { py: "(['Driver'], 'bank -> harbour')" } }, ask: 'returns', note: 'go asked the route. Three shapes on one sheet, and each one is a few lines you have already written.' },
      ]),
    spot('One object: hire by role, tell everyone when someone joins, plan a route, go. Which three shapes are in it?',
      ['Factory, observer, strategy',
       'Singleton, adapter, facade',
       'Builder, iterator, state',
       'Command, template method, decorator'],
      0, 'A table from role to class you order from is the factory. A list of listeners told on an event is the observer. One swappable route with a path() is the strategy. Three small shapes, one small class.'),
    blank('“A shop: register a kind, sell it, and tell whoever asked.”',
`class Shop:
    def __init__(self):
        self.kinds, self.ears = {}, {}
    def register(self, kind, cls):
        self.kinds[kind] = cls
    def on(self, event, fn):
        self.ears.setdefault(event, []).append(fn)
    def emit(self, event, payload):
        fns = self.ears.get(event, [])
        for fn in fns:
            fn(payload)
        return len(fns)
    def sell(self, kind):
        item = ___
        ___
        return item`,
`class _t_Torch:
    pass
_t_s = Shop(); _t_s.register('torch', _t_Torch)
_t_sold = []
_t_s.on('sold', lambda item: _t_sold.append(type(item).__name__))
check("sell builds the registered class", type(_t_s.sell('torch')).__name__, '_t_Torch')
check("and tells the wire", _t_sold, ['_t_Torch'])
def _t_raises(thunk):
    try:
        thunk()
    except Exception as e:
        return type(e).__name__
    return None
check("an unknown kind", _t_raises(lambda: _t_s.sell('drill')), 'KeyError')
check("emit with no ears", _t_s.emit('rain', 1), 0)
_t_s.sell('torch')
check("every sale is announced", len(_t_sold), 2)`),
    mini('Write class Dispatch with register(role, cls); assign(role) that builds an instance of the registered class (KeyError for an unknown role), emits "assigned" with it and returns it; on(event, fn) and emit(event, payload) returning how many were told; route(strategy) storing a route object; and send(city) returning strategy.path(city). Also write class Straight with path(city) returning "<city> direct". Dispatch never names a member class or a route class.',
      'It is the crew with different names: a dict of roles, a dict of lists for ears, one slot for the route. Straight is the only class Dispatch never mentions.',
`class _t_Runner:
    pass
_t_d = Dispatch(); _t_d.register('runner', _t_Runner)
_t_got = []
_t_d.on('assigned', lambda who: _t_got.append(type(who).__name__))
check("assign builds the role", type(_t_d.assign('runner')).__name__, '_t_Runner')
check("and announces it", _t_got, ['_t_Runner'])
def _t_raises(thunk):
    try:
        thunk()
    except Exception as e:
        return type(e).__name__
    return None
check("unknown role", _t_raises(lambda: _t_d.assign('pilot')), 'KeyError')
_t_d.route(Straight())
check("send follows the route", _t_d.send('bank'), 'bank direct')
class _t_Loop:
    def path(self, city): return city + ' loop'
_t_d.route(_t_Loop())
check("swap the route", _t_d.send('bank'), 'bank loop')
check("Straight().path('x')", 'x direct')`),
  ],
})
