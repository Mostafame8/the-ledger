import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('shared-ink-own-name', {
  tier: 'F', xp: 50, requires: ['the-stamped-tag'], gates: ['sharedink'],
  tools: ['tool-dict'],
  title: 'Shared ink, own name', algo: 'Class vs instance attributes',
  steps: [
    explain([
      'Serial numbers. Dax keeps made = 0 at the top of the file and writes global made inside Tag.__init__. Then a second file imports Tag, and the serials restart at HB001 because the second file has its own made.',
      'Dax: “I will keep the counter in one file.” Marguerite: “You already have a place that every tag shares. It is called the class.”',
    ], { move: 'brute force' }),
    explain([
      '“A name assigned in the class body lives on the class. One copy, and every tag can read it. A name assigned on self lives on that tag alone.”',
      '“Reading self.x looks at the tag first, then the class. Writing self.x always writes on the tag. So Tag.made += 1 moves the shared count, and self.made += 1 would quietly make a private copy.”',
    ], { move: 'name the waste', code:
`class Tag:
    made = 0
    prefix = 'HB'
    def __init__(self, name):
        self.name = name
        Tag.made += 1
        self.serial = f"{self.prefix}{Tag.made:03d}"

a = Tag('torch'); b = Tag('cutter')
a.serial, b.serial      # ('HB001', 'HB002')
a.made, Tag.made        # (2, 2), the same number read two ways
vars(a)                 # {'name': 'torch', 'serial': 'HB001'}
b.prefix = 'X'          # only b now has its own prefix
Tag('c').serial         # 'HB003'` }),
    trace(
`class Tag:
    made = 0
    prefix = 'HB'
    def __init__(self, name):
        self.name = name
        Tag.made += 1
        self.serial = f"{self.prefix}{Tag.made:03d}"

Tag.made = 0
a = Tag('a')
b = Tag('b')`,
      '(a.serial, b.serial, Tag.made)',
      [
        { line: 6, state: { made: 1 }, ask: 'made', note: 'Tag.made reads the shared count off the class and writes it back to the class. No tag owns it.' },
        { line: 7, state: { made: 1, serial: 'HB001' }, ask: 'serial', note: 'self.prefix finds nothing on the tag, so it falls through to the class and reads HB. The serial is written on this tag.' },
        { line: 6, state: { made: 2, serial: 'HB001' }, ask: 'made', note: 'Second tag, same pad. The count carries on from where the first left it.' },
        { line: 7, state: { made: 2, serial: 'HB002' }, ask: 'serial', note: 'Own name, own serial, shared ink.' },
        { line: 11, state: { made: 2, serial: 'HB002', returns: { py: "('HB001', 'HB002', 2)" } }, ask: 'returns', note: 'Two tags, two serials, one count.' },
      ]),
    spot('Dax writes self.made += 1 instead of Tag.made += 1. After two tags, Tag.made is…',
      ['2',
       '0, because self.made += 1 reads the class value then writes a new field on the instance',
       '1',
       'AttributeError'],
      1, 'Augmented assignment is a read then a write. The read falls through to the class and finds 0; the write lands on the instance as its own made = 1. The class never moves, and every tag is HB001.'),
    blank('“One pad, many tags. Move the shared count; write the serial on the tag.”',
`class Tag:
    made = 0
    prefix = 'HB'
    def __init__(self, name):
        self.name = name
        ___
        self.serial = ___`,
`Tag.made = 0
_t_a = Tag('torch')
check("first serial", _t_a.serial, 'HB001')
_t_b = Tag('cutter')
check("second serial", _t_b.serial, 'HB002')
check("Tag.made", 2)
check("read through a tag, it is the shared count", _t_a.made, 2)
check("'made' in vars(Tag('x'))", False)
check("two tags keep separate names", (_t_a.name, _t_b.name), ('torch', 'cutter'))`),
    mini('Write class Radio(freq) with a class attribute channels = {}; each Radio registers itself as channels[freq] = self when built. Give it a method clear() that empties the shared dict. Then write a plain function on_air() returning sorted(Radio.channels).',
      'Radio.channels[freq] = self in __init__. clear must empty Radio.channels in place (clear() on the dict), not assign self.channels = {}, or the class never hears.',
`Radio(0).clear()
_t_a = Radio(7); _t_b = Radio(3)
check("two channels registered", on_air(), [3, 7])
_t_second = Radio(7)
check("the same freq twice keeps the latest", Radio.channels[7] is _t_second, True)
check("the dict is shared", _t_a.channels is _t_b.channels, True)
_t_a.clear()
check("clear empties the shared dict", Radio.channels, {})
check("on_air() after clear", on_air(), [])
Radio(1)
check("registering after clear works", on_air(), [1])`),
  ],
})
