import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('the-family-line', {
  tier: 'E', xp: 60, requires: ['the-tags-own-moves'], gates: ['roles'],
  tools: ['tool-exception'],
  title: 'The family line', algo: 'Inheritance and overriding',
  steps: [
    explain([
      'The roster. Dax has a Member class, and a Driver class that is Member copied line for line with one number changed. Then cut gets a rounding fix, and Driver does not.',
      'Dax: “I will remember to change both.” Marguerite: “You did not remember the first time.”',
      '“A driver is a member. Say so once, in the class line, and write only what differs.”',
    ], { move: 'brute force' }),
    explain([
      '“class Driver(Member) puts Member behind Driver. Anything Driver does not define, Python looks up on Member. Anything Driver defines again replaces the parent\'s version for drivers.”',
      '“The parent\'s cut calls self.rate(). self is a Driver, so it finds the driver\'s rate. One cut, every rate.”',
      '“You have made this shape already. class Sealed(RuntimeError) in the armoury was a child with nothing in it but a name.”',
    ], { move: 'pick the pattern', code:
`class Member:
    def __init__(self, name):
        self.name = name
    def rate(self):
        return 10
    def cut(self, total):
        return total * self.rate() // 100

class Driver(Member):
    def rate(self):
        return 15

Driver('dax').cut(1000)           # 150: cut is Member's, rate is Driver's
isinstance(Driver('dax'), Member) # True` }),
    trace(
`class Member:
    def __init__(self, name):
        self.name = name
    def rate(self):
        return 10
    def cut(self, total):
        return total * self.rate() // 100

class Driver(Member):
    def rate(self):
        return 15

c = Driver('dax').cut(1000)`,
      'c',
      [
        { line: 3, state: { name: 'dax' }, ask: 'name', note: 'Driver has no __init__ of its own, so Member\'s runs, on the Driver. The name lands on the driver.' },
        { line: 7, state: { name: 'dax', rate: 15 }, ask: 'rate', note: 'cut is Member\'s method, but self is a Driver. self.rate() looks on Driver first and finds 15.' },
        { line: 13, state: { name: 'dax', rate: 15, c: 150 }, ask: 'c', note: '1000 times 15 over 100. One cut, written once, using whichever rate the child brought.' },
      ]),
    spot('Dax makes Driver by copying Member and changing rate. Later, cut gains a call to round(). Which is true?',
      ['Both classes get the fix, because Python links classes with the same method names',
       'Only Member gets it; Driver\'s copy still truncates, and nothing tells you',
       'Python warns about the duplicate method',
       'Driver breaks with a TypeError'],
      1, 'Copies drift in silence. With inheritance, class Driver(Member), there is exactly one cut and every child uses it; the child only writes what it overrides.'),
    blank('“One parent, two children. Each child answers describe in its own way; greet is written once.”',
`class Guard:
    def __init__(self, name):
        self.name = name
    def greet(self):
        return f"{self.name}: {self.describe()}"
    def describe(self):
        return 'stands'

class Runner(___):
    def describe(self):
        return 'runs'

class Watcher(___):
    def describe(self):
        return 'watches'`,
`check("Runner('r').greet()", 'r: runs')
check("Watcher('w').greet()", 'w: watches')
check("Guard('g').greet()", 'g: stands')
check("isinstance(Runner('r'), Guard)", True)
check("the parent sets the name", Runner('r').name, 'r')
check("issubclass(Watcher, Guard)", True)`),
    mini('Write class Fee(amount) with charge(total) returning total + amount, class Percent(Fee) whose charge(total) returns total + total * amount // 100, and apply(fees, total) that runs every fee in order and returns the final total.',
      'Only charge differs between the two, so Percent writes only charge. apply loops over the fees and reassigns total each time.',
`check("Fee(5).charge(100)", 105)
check("Percent(10).charge(100)", 110)
check("apply runs fees in order", apply([Fee(5), Percent(10)], 100), 115)
check("apply([], 7)", 7)
check("isinstance(Percent(1), Fee)", True)
check("apply([Percent(50), Percent(50)], 100)", 225)`),
  ],
})
