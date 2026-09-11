import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-class', {
  xp: 30, title: 'The blank badge', algo: 'Class',
  steps: [
    explain([
      'Dax keeps a badge as a dict, {\'name\': \'Dax\', \'clearance\': 2}, and a pile of loose functions that take a badge and poke at its keys.',
      '“Which of those functions belong to the badge?” Marguerite asks. “All of them.” “Then put them with it. A class is the badge and the things a badge can do, in one place.”',
      '“Badge(\'Dax\', 2) stamps a new one. The dot reaches its fields and its moves. Nothing else in the room needs to know what a badge is made of.”',
    ], { code:
`class Badge:
    def __init__(self, name, clearance):
        self.name = name
        self.clearance = clearance
    def can_enter(self, level):
        return self.clearance >= level
    def __repr__(self):
        return f"Badge({self.name!r}, {self.clearance})"

b = Badge('Dax', 2)
b.name            # 'Dax'
b.can_enter(3)    # False
b.clearance += 1
b.can_enter(3)    # True` }),
    explain([
      '“self is the badge in your hand. __init__ runs once per stamping and writes the fields onto that badge. Every method is a plain function handed the badge first, so b.can_enter(3) is Badge.can_enter(b, 3).”',
      '“Fields live on the instance, not the class. Two badges, two clearances. Change one and the other never hears about it.”',
      '“__repr__ is how a badge prints. Write it early. A class you cannot read in a traceback is a class you cannot debug.”',
    ]),
    trace(
`class Badge:
    def __init__(self, name, clearance):
        self.name = name
        self.clearance = clearance
    def can_enter(self, level):
        return self.clearance >= level
    def __repr__(self):
        return f"Badge({self.name!r}, {self.clearance})"

def check_in(name, level):
    b = Badge(name, 2)
    b.clearance += 1
    return b.can_enter(level)`,
      "check_in('Dax', 3)",
      [
        { line: 11, state: { b: { py: "Badge('Dax', 2)" } }, ask: 'b', note: 'Badge(name, 2) runs __init__ on a fresh instance. Two fields written, and __repr__ shows them the way the code would.' },
        { line: 12, state: { b: { py: "Badge('Dax', 3)" }, clearance: 3 }, ask: 'clearance', note: 'b.clearance += 1 reads the field off this badge, adds one, and writes it back to the same badge. The class itself never changes.' },
        { line: 13, state: { b: { py: "Badge('Dax', 3)" }, clearance: 3, returns: true }, ask: 'returns', note: 'can_enter is handed b as self, compares 3 >= 3, and the badge that was refused a line ago now gets through.' },
      ]),
    blank('“Stamp the badge. Two fields in __init__, one comparison in can_enter.”',
`class Badge:
    def __init__(self, name, clearance):
        ___
        ___
    def can_enter(self, level):
        return ___`,
`check("Badge('Dax', 2).name", 'Dax')
check("Badge('Dax', 2).clearance", 2)
check("Badge('Dax', 2).can_enter(2)", True)
check("Badge('Dax', 2).can_enter(3)", False)
_t_x = Badge('Dax', 2); _t_y = Badge('Vera', 5); _t_x.clearance = 1
check("two badges keep separate clearances", _t_y.clearance, 5)
check("type(Badge('a', 1)).__name__", 'Badge')`),
  ],
})
