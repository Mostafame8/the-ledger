import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('bolt-on', {
  tier: 'F', xp: 45, requires: ['one-job'], gates: ['bolton'],
  tools: ['tool-class'],
  title: 'Bolt-on, never saw-off', algo: 'Open/closed',
  steps: [
    explain([
      'The safehouse alarm is a steel box with a lid. Dax adds a sensor by unscrewing the lid, finding the one function that checks everything, and adding another elif.',
      'Dax: “It is one line. What could it break?” “The sensors already in there, every time. And you have opened that box nine times this month.”',
    ], { move: 'brute force' }),
    explain([
      '“Build a rail. The box holds a list of checks. Adding a sensor means appending to the list from outside. The function that runs the checks never changes again, because it never knew what a sensor looked for.”',
      '“Open for adding, shut for editing. If a feature request makes you edit a function that already works, ask whether it should have been a list.”',
    ], { move: 'pick the pattern', code:
`class Checks:
    def __init__(self):
        self.items = []
    def add(self, name, test):
        self.items.append((name, test))
    def run(self, x):
        return [name for name, test in self.items if test(x)]

c = Checks()
c.add('big', lambda x: x > 5)
c.add('even', lambda x: x % 2 == 0)
c.run(7)      # ['big']
c.run(8)      # ['big', 'even']` }),
    trace(
`class Checks:
    def __init__(self):
        self.items = []
    def add(self, name, test):
        self.items.append((name, test))
    def run(self, x):
        return [name for name, test in self.items if test(x)]

def wire(x):
    c = Checks()
    c.add('big', lambda v: v > 5)
    c.add('even', lambda v: v % 2 == 0)
    return c.run(x)`,
      'wire(7)',
      [
        { line: 11, state: { names: ['big'] }, ask: 'names', note: 'One check on the rail. add only stores a name and a function; it does not run anything.' },
        { line: 12, state: { names: ['big', 'even'] }, ask: 'names', note: 'A second check bolted on from outside. Nothing inside Checks changed.' },
        { line: 7, state: { x: 7, names: ['big', 'even'], hits: ['big'] }, ask: 'hits', note: 'run walks the rail and asks each test about 7. big says yes, even says no. run has no idea what either test means.' },
        { line: 13, state: { x: 7, names: ['big', 'even'], hits: ['big'], returns: ['big'] }, ask: 'returns', note: 'Add a third sensor tomorrow and run is not touched. That is the whole point of the rail.' },
      ]),
    spot('Every new sensor means opening trip() and adding an elif. Which change keeps trip() shut for good?',
      ['Move the elif chain into its own function so trip() stays short',
       'Hold the sensors in a list and have trip() walk it; new sensors append from outside and trip() is never edited again',
       'Add a comment above the chain listing the sensors',
       'Write one subclass of Alarm per sensor'],
      1, 'Moving the chain moves the problem; the moved function still gets opened per sensor. A subclass per sensor cannot combine them. The list is the rail: the behaviour that varies lives in data, and the code that runs it stays closed. Open for extension, closed for modification.'),
    blank('“First rule that fires wins. Nothing fires, say none.”',
`class Rules:
    def __init__(self):
        self.rules = []
    def add(self, name, test):
        self.rules.append((name, test))
    def apply(self, value):
        for name, test in self.rules:
            if ___:
                return name
        return ___`,
`_t_r = Rules(); _t_r.add('neg', lambda v: v < 0); _t_r.add('big', lambda v: v > 100)
check("first matching rule wins", _t_r.apply(-4), 'neg')
check("a later rule", _t_r.apply(500), 'big')
check("nothing fires", _t_r.apply(50), 'none')
check("Rules().apply(1)", 'none')
_t_r.add('any', lambda v: True)
check("added from outside, no edit to apply", _t_r.apply(50), 'any')`),
    mini('Write class Pipeline with add(step), where a step is a one-argument function, and run(value) that feeds the value through every step in the order added and returns the result. run with no steps returns the value unchanged.',
      'Keep the steps in a list. run loops, replacing value with step(value) each time. New behaviour is a new step, never a new branch.',
`check("Pipeline().run(3)", 3)
_t_p = Pipeline(); _t_p.add(lambda v: v + 1); _t_p.add(lambda v: v * 10)
check("steps run in order", _t_p.run(3), 40)
_t_q = Pipeline(); _t_q.add(lambda v: v * 10); _t_q.add(lambda v: v + 1)
check("order matters", _t_q.run(3), 31)
_t_p.add(str)
check("a step added later joins the end", _t_p.run(3), '40')
_t_s = Pipeline(); _t_s.add(str.strip); _t_s.add(str.upper)
check("works on strings too", _t_s.run('  go  '), 'GO')`),
  ],
})
