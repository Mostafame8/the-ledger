import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-dunder', {
  xp: 30, title: 'The badge that prints itself', algo: 'Dunder methods',
  steps: [
    explain([
      'Dax builds a Crew class and then writes crew_len(crew), crew_equal(a, b) and crew_print(crew): three helpers for questions Python already knows how to ask.',
      '“Python asks with double underscores,” Marguerite says. “len(crew) calls __len__. crew == other calls __eq__. print calls __repr__. Answer the question in the shape it is asked.”',
      '“Fill the dunders and every built-in that already works on a list works on your crew: len, in, for, ==, print. No helpers, no manual.”',
    ], { code:
`class Crew:
    def __init__(self, names):
        self.names = list(names)
    def __repr__(self):
        return f"Crew({self.names!r})"
    def __len__(self):
        return len(self.names)
    def __eq__(self, other):
        return isinstance(other, Crew) and self.names == other.names
    def __iter__(self):
        return iter(self.names)
    def __call__(self, name):
        self.names.append(name)

c = Crew(['Dax'])
c('Vera')                     # __call__: Crew(['Dax', 'Vera'])
len(c)                        # 2
'Vera' in c                   # True, through __iter__
c == Crew(['Dax', 'Vera'])    # True` }),
    explain([
      '“__repr__ first, always. It is what you see in a traceback and at the prompt. __eq__ decides what same means; without it two crews with the same names are strangers, because the default compares identity.”',
      '“__iter__ hands the for loop something to walk. Once it exists, in, list(), sorted() and unpacking all arrive free.”',
      '“__call__ makes the object usable like a function. Rare. Use it when the object really is one action with settings attached.”',
    ]),
    trace(
`class Crew:
    def __init__(self, names):
        self.names = list(names)
    def __repr__(self):
        return f"Crew({self.names!r})"
    def __len__(self):
        return len(self.names)
    def __eq__(self, other):
        return isinstance(other, Crew) and self.names == other.names
    def __iter__(self):
        return iter(self.names)

def muster(names, extra):
    c = Crew(names)
    c.names.append(extra)
    n = len(c)
    same = c == Crew(['Dax', 'Vera'])
    return sorted(c)`,
      "muster(['Dax'], 'Vera')",
      [
        { line: 14, state: { c: { py: "Crew(['Dax'])" } }, ask: 'c', note: '__init__ copies the names into a fresh list, and __repr__ is what you see when you look at c.' },
        { line: 16, state: { c: { py: "Crew(['Dax', 'Vera'])" }, n: 2 }, ask: 'n', note: 'len(c) is Python asking __len__. The crew answers with the length of its own list.' },
        { line: 17, state: { c: { py: "Crew(['Dax', 'Vera'])" }, n: 2, same: true }, ask: 'same', note: '== calls __eq__, which compares the two name lists. Two different objects, same names, so True. Without __eq__ this would be False.' },
        { line: 18, state: { c: { py: "Crew(['Dax', 'Vera'])" }, n: 2, same: true, returns: ['Dax', 'Vera'] }, ask: 'returns', note: 'sorted walks whatever __iter__ hands it. The crew never wrote a sort; it only said how to be walked.' },
      ]),
    blank('“Three answers: how long, what counts as the same, and how to be walked.”',
`class Crew:
    def __init__(self, names):
        self.names = list(names)
    def __repr__(self):
        return f"Crew({self.names!r})"
    def __len__(self):
        return ___
    def __eq__(self, other):
        return isinstance(other, Crew) and ___
    def __iter__(self):
        return ___`,
`check("len(Crew(['Dax', 'Vera']))", 2)
check("Crew(['Dax']) == Crew(['Dax'])", True)
check("Crew(['Dax']) == Crew(['Vera'])", False)
check("list(Crew(['Dax', 'Vera']))", ['Dax', 'Vera'])
check("repr(Crew(['Dax']))", "Crew(['Dax'])")
check("'Dax' in Crew(['Dax', 'Vera'])", True)
check("len(Crew([]))", 0)`),
  ],
})
