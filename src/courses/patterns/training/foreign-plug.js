import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('foreign-plug', {
  tier: 'D', xp: 90, requires: ['the-socket'], gates: ['foreignplug'],
  tools: ['tool-abstract'],
  title: 'The foreign plug', algo: 'Adapter',
  steps: [
    explain([
      'The fence sold the crew a metric tape. Every hand on the job asks inches(). Dax\'s answer is to open forty hands and add: if it is the metric one, divide by 2.54.',
      'Dax: “It is one line each.” “It is forty lines, and the next tape from the fence adds forty more.”',
    ], { move: 'brute force' }),
    explain([
      '“Wrap the foreign thing in a plug that speaks the crew\'s shape. The plug holds the tape, answers inches(), and does the division once. The tape is untouched, the hands are untouched, and the plug is ten lines.”',
      '“A plug converts; it does not add features. If you find yourself giving the plug new powers, that is a different job.”',
    ], { move: 'pick the pattern', code:
`class MetricTape:
    def __init__(self, cm):
        self.cm = cm
    def read_cm(self):
        return self.cm

class TapeAdapter:
    def __init__(self, tape):
        self.tape = tape
    def inches(self):
        return self.tape.read_cm() / 2.54

class Ruler:
    def __init__(self, inches):
        self._in = inches
    def inches(self):
        return self._in

def longest(tools):
    return max(t.inches() for t in tools)` }),
    trace(
`class MetricTape:
    def __init__(self, cm):
        self.cm = cm
    def read_cm(self):
        return self.cm

class TapeAdapter:
    def __init__(self, tape):
        self.tape = tape
    def inches(self):
        return self.tape.read_cm() / 2.54

class Ruler:
    def __init__(self, inches):
        self._in = inches
    def inches(self):
        return self._in

def longest(tools):
    return max(t.inches() for t in tools)`,
      'longest([TapeAdapter(MetricTape(254)), Ruler(12)])',
      [
        { line: 5, state: { cm: 254 }, ask: 'cm', note: 'longest asked the plug for inches(); the plug asked the tape the only question the tape knows.' },
        { line: 11, state: { cm: 254, inches: { py: '100.0' } }, ask: 'inches', note: 'The division lives here and nowhere else. 254 centimetres, one plug, 100.0 inches.' },
        { line: 17, state: { cm: 254, inches: 12 }, ask: 'inches', note: 'The ruler already speaks inches. longest cannot tell the ruler from the plugged tape, and does not need to.' },
        { line: 20, state: { returns: { py: '100.0' } }, ask: 'returns', note: 'max over two inches() answers. The tape never changed; the hands never changed; the plug did the talking.' },
      ]),
    spot('The crew\'s hands call open("4417") and the fence\'s safe has crack(4417). Who changes?',
      ['The safe: rewrite crack to take strings',
       'The hands: forty calls become crack(int(code))',
       'Neither: a small plug takes the safe, answers open(code) and calls crack(int(code)) inside, so both sides keep their shape',
       'Python: use a type hint'],
      2, 'You cannot change what the fence sold you, and you should not reopen forty hands for a conversion. The plug is the one place the two shapes meet. That is an adapter.'),
    blank('“The safe speaks numbers. The hands speak strings. One plug between them.”',
`class OldSafe:
    def crack(self, code_int):
        return code_int == 4417

class SafeAdapter:
    def __init__(self, old):
        self.old = old
    def open(self, code):
        try:
            number = ___
        except ValueError:
            return False
        return ___`,
`check("SafeAdapter(OldSafe()).open('4417')", True)
check("SafeAdapter(OldSafe()).open('0000')", False)
check("SafeAdapter(OldSafe()).open('abcd')", False)
check("OldSafe().crack(4417)", True)
class _t_Spy:
    def __init__(self): self.seen = []
    def crack(self, n): self.seen.append(n); return False
_t_s = _t_Spy(); SafeAdapter(_t_s).open('12')
check("the plug hands the safe a number", _t_s.seen, [12])`),
    mini('Write class Celsius built with a value, with c() returning it; class Fahrenheit built with a value, with f() returning it; class AsCelsius built with a Fahrenheit reading, exposing c() that converts it ((f - 32) * 5 / 9, rounded to 1 decimal); and coldest(readings) returning the lowest c() across any objects that answer c().',
      'AsCelsius holds the Fahrenheit reading and converts inside c(). coldest never checks a class; it asks c() and takes the min.',
`check("Celsius(20).c()", 20)
check("Fahrenheit(212).f()", 212)
check("AsCelsius(Fahrenheit(212)).c()", 100.0)
check("AsCelsius(Fahrenheit(50)).c()", 10.0)
check("coldest([Celsius(20), AsCelsius(Fahrenheit(32)), Celsius(5)])", 0.0)
check("coldest([Celsius(-3)])", -3)`),
  ],
})
