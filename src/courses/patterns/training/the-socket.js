import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('the-socket', {
  tier: 'F', xp: 50, requires: ['stand-in'], gates: ['socket'],
  tools: ['tool-abstract'],
  title: 'The socket', algo: 'Interface segregation and dependency inversion',
  steps: [
    explain([
      'Halden went wrong the moment the burner died, because Dax\'s Alarm built its own Bell inside __init__ and rang it directly. No phone, no alarm, and no way to test it without a real bell.',
      'Dax: “The alarm needs a bell. So it makes one.” “The alarm needs something that rings. Who makes it is not the alarm\'s business.”',
    ], { move: 'brute force' }),
    explain([
      '“Hand the alarm its bell through the door. Anything with ring(msg) fits the socket: the real bell, the radio, a fake that only writes down what it heard. The alarm depends on the shape of the socket, not on a brand of bell.”',
      '“Keep the socket small. An alarm that needs ring() should not be handed a thing with forty methods and told to ignore thirty-nine.”',
    ], { move: 'pick the pattern', code:
`class Alarm:
    def __init__(self, bell):
        self.bell = bell
    def fire(self, where):
        msg = f"ALARM {where}"
        self.bell.ring(msg)
        return msg

class FakeBell:
    def __init__(self):
        self.rung = []
    def ring(self, msg):
        self.rung.append(msg)

bell = FakeBell()
Alarm(bell).fire('door')   # 'ALARM door'
bell.rung                  # ['ALARM door']` }),
    trace(
`class Alarm:
    def __init__(self, bell):
        self.bell = bell
    def fire(self, where):
        msg = f"ALARM {where}"
        self.bell.ring(msg)
        return msg

class FakeBell:
    def __init__(self):
        self.rung = []
    def ring(self, msg):
        self.rung.append(msg)

def drill():
    bell = FakeBell()
    alarm = Alarm(bell)
    said = alarm.fire('door')
    return bell.rung`,
      'drill()',
      [
        { line: 5, state: { msg: 'ALARM door', rung: [] }, ask: 'msg', note: 'fire builds the message. The bell has not been touched yet; its list is still empty.' },
        { line: 6, state: { msg: 'ALARM door', rung: ['ALARM door'] }, ask: 'rung', note: 'self.bell.ring(msg) goes to whatever was plugged in. Tonight that is the fake, so the message lands in its list instead of on the street.' },
        { line: 18, state: { msg: 'ALARM door', rung: ['ALARM door'], said: 'ALARM door' }, ask: 'said', note: 'The alarm returns what it sent. It never learned what kind of bell it was holding.' },
        { line: 19, state: { said: 'ALARM door', rung: ['ALARM door'], returns: ['ALARM door'] }, ask: 'returns', note: 'The test reads the fake\'s list. Swap in the real radio on the night and drill() is the only thing that changes.' },
      ]),
    spot('Alarm builds its own Bell inside __init__. Why can the tests not hear it ring?',
      ['Because bells are silent in tests',
       'Because nothing outside Alarm can reach the bell it made, so nothing can swap in a fake that records the ring; the dependency points the wrong way',
       'Because ring() returns None',
       'Because the test forgot to import Bell'],
      1, 'What a class builds for itself, nobody else can replace. Pass the bell in and the alarm depends on a shape, not a brand; a fake with the same shape fits the socket and the test can read what was rung. That is dependency inversion, and keeping the socket to one method is interface segregation.'),
    blank('“Report saves through whatever store it was handed. MemoryStore keeps a list.”',
`class Report:
    def __init__(self, store):
        self.store = store
    def save(self, text):
        ___
        return len(text)

class MemoryStore:
    def __init__(self):
        self.items = []
    def put(self, text):
        ___`,
`_t_m = MemoryStore(); _t_r = Report(_t_m)
check("save returns the length", _t_r.save('vault plan'), 10)
check("the store kept it", _t_m.items, ['vault plan'])
_t_r.save('exit')
check("two saves, in order", _t_m.items, ['vault plan', 'exit'])
class _t_Count:
    def __init__(self): self.n = 0
    def put(self, text): self.n += 1
_t_c = _t_Count(); Report(_t_c).save('a'); Report(_t_c).save('b')
check("any store with put() fits", _t_c.n, 2)
check("MemoryStore().items", [])`),
    mini('Write class Greeter built with a clock, any object whose hour() returns 0 to 23. greet(name) returns "Good morning, <name>" when the hour is below 12 and "Good evening, <name>" otherwise. Also write class FixedClock built with an hour, whose hour() returns it. Greeter never builds a clock itself.',
      'Store the clock. greet asks self.clock.hour() and picks the string. The tests hand in their own clock, so the shape is all that matters.',
`check("Greeter(FixedClock(9)).greet('Dax')", 'Good morning, Dax')
check("Greeter(FixedClock(12)).greet('Dax')", 'Good evening, Dax')
check("Greeter(FixedClock(23)).greet('Vera')", 'Good evening, Vera')
check("FixedClock(7).hour()", 7)
class _t_Clock:
    def __init__(self): self.h = 0
    def hour(self): self.h += 6; return self.h
_t_g = Greeter(_t_Clock())
check("the clock is asked every time", [_t_g.greet('x'), _t_g.greet('x')], ['Good morning, x', 'Good evening, x'])`),
  ],
})
