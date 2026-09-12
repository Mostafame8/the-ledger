import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('stand-in', {
  tier: 'F', xp: 50, requires: ['one-job'], gates: ['standin'],
  tools: ['tool-class', 'tool-abstract'],
  title: 'The stand-in', algo: 'Liskov substitution',
  steps: [
    explain([
      'A duffel bag of locks from the fence, three makes. Dax writes count_open with a branch per make, and a fourth branch that says TODO dial lock.',
      'Dax: “The hand has to know what it is holding.” “Then every new lock teaches every hand. There are forty hands.”',
    ], { move: 'brute force' }),
    explain([
      '“Give every lock the same shape: open(key) answers True or False. A hand that takes a Lock takes any Lock, and never asks which. The stand-in has to keep the promise, though: same question, same kind of answer, no surprises.”',
      '“A subclass that raises where the base returned False is not a stand-in. It is a trap wearing the uniform.”',
    ], { move: 'pick the pattern', code:
`class Door:
    def open(self, key):
        return False

class KeyDoor(Door):
    def __init__(self, key):
        self.key = key
    def open(self, key):
        return key == self.key

class CodeDoor(Door):
    def __init__(self, code):
        self.code = code
    def open(self, key):
        return str(key) == self.code

def count_open(doors, key):
    return sum(1 for d in doors if d.open(key))` }),
    trace(
`class Door:
    def open(self, key):
        return False

class KeyDoor(Door):
    def __init__(self, key):
        self.key = key
    def open(self, key):
        return key == self.key

class CodeDoor(Door):
    def __init__(self, code):
        self.code = code
    def open(self, key):
        return str(key) == self.code

def count_open(doors, key):
    return sum(1 for d in doors if d.open(key))`,
      "count_open([KeyDoor('a'), CodeDoor('1'), Door()], 'a')",
      [
        { line: 9, state: { door: { py: 'KeyDoor' }, opened: true }, ask: 'opened', note: 'The hand asked open(\'a\') and the key door compared it to its own key. True, one for the count.' },
        { line: 15, state: { door: { py: 'CodeDoor' }, opened: false }, ask: 'opened', note: 'Same question to the code door. str(\'a\') is not \'1\', so False. It answered in the same shape, which is all the hand needs.' },
        { line: 3, state: { door: { py: 'Door' }, opened: false }, ask: 'opened', note: 'The plain door keeps the base promise: it answers False rather than raising or returning None.' },
        { line: 18, state: { returns: 1 }, ask: 'returns', note: 'Three doors, one hand, no branches. Add a dial lock with the same open(key) and count_open never hears about it.' },
      ]),
    spot('Dax\'s CodeDoor.open() raises TypeError when the key is a string instead of a number. count_open runs over the bag. What happens?',
      ['count_open skips it and moves on',
       'The whole count blows up on the first code door, because a stand-in that raises where the others answer False has broken the promise the hand relied on',
       'It returns the right count, because raising counts as not opened',
       'Only the code door is miscounted'],
      1, 'The hand does not catch anything, because a Door never raised. Substitution is a promise about behaviour, not just method names: same call, same kind of answer. Fix the door, not the hand.'),
    blank('“Every sensor answers read(). The base says zero. hottest asks each one and never checks the make.”',
`class Sensor:
    def read(self):
        return 0

class Thermo(Sensor):
    def __init__(self, value):
        self.value = value
    def read(self):
        return ___

def hottest(sensors):
    return ___`,
`check("Sensor().read()", 0)
check("Thermo(21).read()", 21)
check("hottest([Thermo(21), Thermo(30), Sensor()])", 30)
check("hottest([Sensor()])", 0)
class _t_Gauge(Sensor):
    def read(self): return 99
check("any stand-in with read() joins in", hottest([Thermo(5), _t_Gauge()]), 99)
check("isinstance(Thermo(1), Sensor)", True)`),
    mini('Write class Note built with a string, with text() returning it; class Shout(Note) whose text() returns the string upper-cased; and read_all(notes) returning every text() joined with " / ". read_all must work for any object that answers text(), never checking its class.',
      'Shout only overrides text(); it keeps __init__ from Note. read_all is one join over n.text() for each note.',
`check("Note('go').text()", 'go')
check("Shout('go').text()", 'GO')
check("read_all([Note('go'), Shout('now')])", 'go / NOW')
check("read_all([])", '')
class _t_Whisper:
    def text(self): return '...'
check("anything with text() reads", read_all([Note('a'), _t_Whisper()]), 'a / ...')
check("isinstance(Shout('x'), Note)", True)`),
  ],
})
