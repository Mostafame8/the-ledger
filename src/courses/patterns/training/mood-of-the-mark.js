import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('mood-of-the-mark', {
  tier: 'B', xp: 170, requires: ['pick-the-play'], gates: ['readtheroom'],
  tools: ['tool-abstract'],
  title: 'The mood of the mark', algo: 'State',
  steps: [
    explain([
      'The mark at the bar has three moods, and the play has to read them. Dax\'s Mark has a mood string and an if on it in six methods. A fourth mood means six edits and a bug in two of them.',
      'Dax: “It is just a string.” “It is a string that six methods have opinions about.”',
    ], { move: 'brute force' }),
    explain([
      '“Make each mood an object. The mood knows how the mark talks and which mood comes next. The mark holds the current one and asks it. Change the mood by swapping the object. No ifs in the mark, ever.”',
      '“This is the swappable-part idea again, except the part swaps itself: each mood decides its own successor.”',
    ], { move: 'pick the pattern', code:
`class Calm:
    name = 'calm'
    def talk(self): return 'small talk'
    def next(self): return Wary()

class Wary:
    name = 'wary'
    def talk(self): return 'short answers'
    def next(self): return Alarmed()

class Alarmed:
    name = 'alarmed'
    def talk(self): return 'calls it in'
    def next(self): return Alarmed()

class Mark:
    def __init__(self):
        self.state = Calm()
    def nudge(self):
        self.state = self.state.next()
    def talk(self):
        return self.state.talk()` }),
    trace(
`class Calm:
    name = 'calm'
    def talk(self): return 'small talk'
    def next(self): return Wary()

class Wary:
    name = 'wary'
    def talk(self): return 'short answers'
    def next(self): return Alarmed()

class Alarmed:
    name = 'alarmed'
    def talk(self): return 'calls it in'
    def next(self): return Alarmed()

class Mark:
    def __init__(self):
        self.state = Calm()
    def nudge(self):
        self.state = self.state.next()
    def talk(self):
        return self.state.talk()

def bar():
    m = Mark()
    a = m.talk()
    m.nudge()
    b = m.talk()
    m.nudge()
    return (a, b, m.talk())`,
      'bar()',
      [
        { line: 26, state: { state: { py: 'Calm()' }, a: 'small talk' }, ask: 'a', note: 'The mark starts calm and asks its mood how to talk. The mark itself has no opinion.' },
        { line: 20, state: { state: { py: 'Wary()' }, a: 'small talk' }, ask: 'state', note: 'nudge asks the current mood what comes next and swaps in the answer. Calm decided Wary; the mark just did what it was told.' },
        { line: 28, state: { state: { py: 'Wary()' }, a: 'small talk', b: 'short answers' }, ask: 'b', note: 'Same talk() on the mark, a different answer, because a different mood object is inside.' },
        { line: 20, state: { state: { py: 'Alarmed()' }, a: 'small talk', b: 'short answers' }, ask: 'state', note: 'Wary decided Alarmed. A fourth mood would be a fourth class with its own next(), and Mark would not change.' },
        { line: 30, state: { state: { py: 'Alarmed()' }, returns: { py: "('small talk', 'short answers', 'calls it in')" } }, ask: 'returns', note: 'Three moods, three answers, zero ifs in the mark.' },
      ]),
    spot('Mark has mood == "wary" checks in six methods. A fourth mood arrives. What is the cheapest correct change?',
      ['One new class, if each mood is an object the mark holds and asks: the new mood carries its own talk and its own successor, and the mark is untouched',
       'Six edits, one per method, plus the ones you forget',
       'None',
       'Two edits'],
      0, 'The if-per-method version costs an edit per method per mood. Moods as objects that know their own talk and their own successor put every decision in one place per mood. That is the state pattern.'),
    blank('“A traffic light. Each colour knows the next colour. The light only asks.”',
`class Green:
    name = 'green'
    def next(self): return Amber()

class Amber:
    name = 'amber'
    def next(self): return Red()

class Red:
    name = 'red'
    def next(self): return Green()

class Light:
    def __init__(self):
        self.state = Green()
    def step(self):
        self.state = ___
    @property
    def colour(self):
        return ___`,
`_t_l = Light()
check("starts green", _t_l.colour, 'green')
_t_l.step()
check("then amber", _t_l.colour, 'amber')
_t_l.step()
check("then red", _t_l.colour, 'red')
_t_l.step()
check("and round again", _t_l.colour, 'green')
check("Amber().next().name", 'red')`),
    mini('Write classes Locked and Unlocked for a turnstile, each with a name attribute (the lowercase class name), and coin(turnstile) and push(turnstile) that return the next state: a coin on Locked gives Unlocked, a push on Unlocked gives Locked, and every other move keeps the same state. Then class Turnstile that starts Locked, with coin() and push() that ask the current state for the next one, state_name giving the current name, and a log list that records "unlocked" or "locked" only when the state actually changes.',
      'Each method on Locked and Unlocked returns the next object. Turnstile.coin does self.state = self.state.coin(self) and appends to the log when the name changed. Two states, two methods each, and the only if in Turnstile is the change check.',
`_t_t = Turnstile()
check("starts locked", _t_t.state_name, 'locked')
_t_t.push()
check("a push while locked changes nothing", (_t_t.state_name, _t_t.log), ('locked', []))
_t_t.coin()
check("a coin unlocks", (_t_t.state_name, _t_t.log), ('unlocked', ['unlocked']))
_t_t.coin()
check("a second coin is wasted", (_t_t.state_name, _t_t.log), ('unlocked', ['unlocked']))
_t_t.push()
check("a push locks again", (_t_t.state_name, _t_t.log), ('locked', ['unlocked', 'locked']))
check("Locked().coin(None).name", 'unlocked')`),
  ],
})
