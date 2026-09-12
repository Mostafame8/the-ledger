import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('one-radio', {
  tier: 'E', xp: 70, requires: ['order-window'], gates: ['oneradio'],
  tools: ['tool-class'],
  title: 'One radio', algo: 'Singleton',
  steps: [
    explain([
      'Two radios on one channel talked over each other for eleven seconds at Halden. Dax\'s fix is to pass the one radio into every function, forty deep.',
      'Dax: “Or a global.” “A global anyone can overwrite is how you got two radios.”',
    ], { move: 'brute force' }),
    explain([
      '“One object, built on the first ask, remembered on the class, handed back to everyone after. Radio.get() is the only door. And give the tests a reset, or they will all share last night\'s frequency.”',
      '“Use this sparingly. One radio is a fact about the job. One of most things is a habit you will regret when the tests want two.”',
    ], { move: 'pick the pattern', code:
`class Radio:
    _instance = None

    def __init__(self):
        self.freq = None

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset(cls):
        cls._instance = None

Radio.get() is Radio.get()   # True` }),
    trace(
`class Radio:
    _instance = None

    def __init__(self):
        self.freq = None

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset(cls):
        cls._instance = None

def check_channel():
    Radio.reset()
    a = Radio.get()
    a.freq = 446
    b = Radio.get()
    return (a is b, b.freq)`,
      'check_channel()',
      [
        { line: 19, state: { freq: null }, ask: 'freq', note: 'After reset nothing is remembered, so get() builds the first radio. Its freq starts as None.' },
        { line: 20, state: { freq: 446 }, ask: 'freq', note: 'a is the remembered radio, so tuning a tunes the one radio there is.' },
        { line: 21, state: { freq: 446, same: true }, ask: 'same', note: 'The second get() finds _instance already set and hands back the same object. Nothing was built.' },
        { line: 22, state: { freq: 446, same: true, returns: { py: '(True, 446)' } }, ask: 'returns', note: 'b sees the frequency a set, because b is a. One channel, one radio, no arguments passed forty deep.' },
      ]),
    spot('Two Radio() calls, two objects, one channel. Where does the second radio come from?',
      ['From the class attribute',
       'From the plain constructor: Radio() always builds a fresh one, so anything that bypasses get() gets its own radio and its own frequency',
       'From reset()',
       'From the garbage collector'],
      1, 'The single instance lives behind get(); the constructor still makes objects for anyone who calls it. Route every caller through get(), or make the constructor itself hand back the shared one. That is a singleton, and its weak point.'),
    blank('“One config for the whole run. Build it on the first ask, remember it, forget it on reset.”',
`class Config:
    _instance = None

    def __init__(self):
        self.values = {}

    @classmethod
    def get(cls):
        if ___:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset(cls):
        ___`,
`Config.reset()
check("Config.get() is Config.get()", True)
Config.get().values['mode'] = 'quiet'
check("values are shared", Config.get().values, {'mode': 'quiet'})
_t_old = Config.get()
Config.reset()
check("reset forgets the values", Config.get().values, {})
check("and gives a new object", Config.get() is _t_old, False)`),
    mini('Write class Counter with a class method shared() that returns the one shared counter (built on the first call), a method bump() that adds one and returns the new count, and a class method reset() that forgets the shared counter. Counter.shared().bump() from two places counts together, while a plain Counter() counts on its own.',
      'Same shape as the radio: a class attribute for the instance, shared() checks and builds, bump works on self.count starting from zero.',
`Counter.reset()
check("first bump", Counter.shared().bump(), 1)
check("second bump from elsewhere", Counter.shared().bump(), 2)
check("one object", Counter.shared() is Counter.shared(), True)
Counter.reset()
check("reset starts over", Counter.shared().bump(), 1)
check("a fresh Counter() is its own", Counter().bump(), 1)`),
  ],
})
