import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('tripwire', {
  tier: 'C', xp: 130, requires: ['bolt-on'], gates: ['hearthewire', 'wireboard'],
  tools: ['tool-closure'],
  title: 'The tripwire', algo: 'Observer',
  steps: [
    explain([
      'One wire on the back fence. When it trips, the driver, the lookout and the fence all need to know. Dax\'s wire calls each of them by name, and a fourth ear means opening the wire again.',
      'Dax: “The wire has to know who to tell.” “The wire has to know that someone asked to be told. Who they are is their business.”',
    ], { move: 'brute force' }),
    explain([
      '“The wire keeps a list. Anyone who wants the news hands over a function; the wire holds it. When the wire trips, it calls every function in the list with what happened. Add an ear, remove an ear, and the wire never changes.”',
      '“The wire does not wait for answers and does not care what an ear does with the news. One way, in order, everyone.”',
    ], { move: 'pick the pattern', code:
`class Tripwire:
    def __init__(self):
        self.ears = []
    def subscribe(self, fn):
        self.ears.append(fn)
        return fn
    def trip(self, where):
        for fn in self.ears:
            fn(where)
        return len(self.ears)

heard = []
w = Tripwire()
w.subscribe(lambda where: heard.append('driver:' + where))
w.subscribe(lambda where: heard.append('lookout:' + where))
w.trip('gate')      # 2
heard               # ['driver:gate', 'lookout:gate']` }),
    trace(
`class Tripwire:
    def __init__(self):
        self.ears = []
    def subscribe(self, fn):
        self.ears.append(fn)
        return fn
    def trip(self, where):
        for fn in self.ears:
            fn(where)
        return len(self.ears)

def night():
    heard = []
    w = Tripwire()
    w.subscribe(lambda where: heard.append('driver:' + where))
    w.subscribe(lambda where: heard.append('lookout:' + where))
    told = w.trip('gate')
    return (told, heard)`,
      'night()',
      [
        { line: 16, state: { ears: 2, heard: [] }, ask: 'ears', note: 'Two ears signed up. The wire holds two functions and has called neither; heard is still empty.' },
        { line: 9, state: { ears: 2, heard: ['driver:gate'] }, ask: 'heard', note: 'trip walks the list in order. The first function runs and the driver hears the place.' },
        { line: 9, state: { ears: 2, heard: ['driver:gate', 'lookout:gate'] }, ask: 'heard', note: 'Second ear, same news. The wire has no idea what either function did with it.' },
        { line: 17, state: { ears: 2, heard: ['driver:gate', 'lookout:gate'], told: 2 }, ask: 'told', note: 'trip reports how many it told. Add the fence tomorrow with one more subscribe and this becomes 3 without touching the wire.' },
        { line: 18, state: { told: 2, heard: ['driver:gate', 'lookout:gate'], returns: { py: "(2, ['driver:gate', 'lookout:gate'])" } }, ask: 'returns', note: 'The thing that fires and the things that listen never name each other. That is the whole arrangement.' },
      ]),
    spot('The wire calls the driver, the lookout and the fence by name. A fourth ear arrives. Who gets edited?',
      ['The fourth ear',
       'The wire, again, and every time after; where a list of subscribers lets the fourth ear add itself and the wire stays shut',
       'The driver',
       'Nobody, Python handles it'],
      1, 'Naming listeners inside the thing that fires is the tangle. A subscribe list turns it inside out: listeners come to the wire, and the wire only knows it has a list. That is an observer.'),
    blank('“A bell. on() adds an ear, ring() tells them all and says how many heard.”',
`class Bell:
    def __init__(self):
        self.ears = []
    def on(self, fn):
        ___
    def ring(self, msg):
        for fn in self.ears:
            ___
        return len(self.ears)`,
`check("Bell().ring('x')", 0)
_t_h = []
_t_b = Bell()
_t_b.on(lambda m: _t_h.append('a' + m))
_t_b.on(lambda m: _t_h.append('b' + m))
check("ring reaches both, in order", (_t_b.ring('!'), _t_h), (2, ['a!', 'b!']))
_t_b.ring('?')
check("every ring tells everyone", _t_h, ['a!', 'b!', 'a?', 'b?'])
check("on returns nothing", Bell().on(lambda m: None), None)`),
    mini('Write class Ticker with watch(fn) adding a watcher, and set(price) that, only when the price actually changes, calls every watcher with (old, new) and returns True; when the price is unchanged it calls nobody and returns False. The first set() counts as a change from None.',
      'Keep price (start None) and a list of watchers. set compares, and only on a change loops the watchers with the pair and updates the price.',
`_t_seen = []
_t_t = Ticker()
_t_t.watch(lambda old, new: _t_seen.append((old, new)))
check("the first set is a change", _t_t.set(10), True)
check("watchers get old and new", _t_seen, [(None, 10)])
check("the same price again is not news", _t_t.set(10), False)
check("nobody was told", len(_t_seen), 1)
check("a real change", (_t_t.set(12), _t_seen[-1]), (True, (10, 12)))
check("Ticker().set(5)", True)`),
  ],
})
