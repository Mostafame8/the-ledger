import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('the-stamped-form', {
  tier: 'B', xp: 170, requires: ['put-them-in-order'], gates: ['frozenentry'],
  tools: ['tool-tuple'],
  title: 'The stamped form', algo: 'Dataclasses',
  steps: [
    explain([
      'Dax\'s Entry has __init__, __repr__, __eq__, __hash__ and __lt__ written out by hand. Forty lines for three fields, and __eq__ forgot one of them, so two different entries call themselves equal.',
      'Dax: “I wrote them all. What more do you want?” Marguerite: “I want you to have written none of them.”',
      '“A class that is only fields is a form. Name the fields and let Python print the form.”',
    ], { move: 'brute force' }),
    explain([
      '“@dataclass reads the field list and writes __init__, __repr__ and __eq__ for you. order=True adds the comparisons, field by field, in the order you declared them. frozen=True refuses assignment, and a frozen form with __eq__ is hashable for free.”',
      '“Defaults that are built fresh each time go through field(default_factory=...). A tuple default is the sealed pair from the armoury: safe to share because nobody can change it.”',
    ], { move: 'pick the pattern', code:
`from dataclasses import dataclass, field

@dataclass(frozen=True, order=True)
class Entry:
    price: int
    name: str
    tags: tuple = field(default_factory=tuple)

e = Entry(5, 'torch')
e                                  # Entry(price=5, name='torch', tags=())
e == Entry(5, 'torch')             # True
sorted([Entry(9, 'x'), Entry(1, 'y')])[0].name   # 'y'
len({e, Entry(5, 'torch')})        # 1
e.price = 6                        # FrozenInstanceError` }),
    trace(
`from dataclasses import dataclass, field

@dataclass(frozen=True, order=True)
class Entry:
    price: int
    name: str
    tags: tuple = field(default_factory=tuple)

a = Entry(5, 'torch')
b = Entry(5, 'torch', ('hot',))
same = a == b
first = min(a, b).tags`,
      '(same, first)',
      [
        { line: 9, state: { a: { py: "Entry(price=5, name='torch', tags=())" } }, ask: 'a', note: 'The generated __repr__ names every field. The default factory ran and handed tags an empty tuple.' },
        { line: 11, state: { a: { py: "Entry(price=5, name='torch', tags=())" }, same: false }, ask: 'same', note: 'The generated __eq__ compares all three fields. Two match, tags do not.' },
        { line: 12, state: { a: { py: "Entry(price=5, name='torch', tags=())" }, same: false, first: { py: '()' } }, ask: 'first', note: 'order=True compares field by field in declaration order. price ties, name ties, and () sorts before (\'hot\',).' },
        { line: 12, state: { a: { py: "Entry(price=5, name='torch', tags=())" }, same: false, first: { py: '()' }, returns: { py: '(False, ())' } }, ask: 'returns', note: 'Five methods Dax did not write, all agreeing with each other.' },
      ]),
    spot('Dax declares tags: list = [] as a dataclass field. What happens?',
      ['Works; each Entry gets its own empty list',
       'ValueError when the class is built: mutable default not allowed, use field(default_factory=list)',
       'Every Entry shares one list, silently',
       'TypeError, but only when frozen=True'],
      1, 'A plain mutable default would be one list shared by every instance, so dataclasses refuse it at class-creation time. default_factory calls list() once per instance instead.'),
    blank('“Three fields, one decorator, and Python writes the rest.”',
`from dataclasses import dataclass, field

@dataclass(___)
class Entry:
    price: int
    name: str
    tags: tuple = ___

def total(entries):
    return ___`,
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Entry(5, 'torch') == Entry(5, 'torch')", True)
check("sorted([Entry(9, 'x'), Entry(1, 'y')])[0].name", 'y')
check("frozen", _t_raises(lambda: setattr(Entry(1, 'a'), 'price', 2)), 'FrozenInstanceError')
check("len({Entry(1, 'a'), Entry(1, 'a')})", 1)
check("repr(Entry(5, 'torch'))", "Entry(price=5, name='torch', tags=())")
check("total([Entry(1, 'a'), Entry(2, 'b')])", 3)`),
    mini('Write @dataclass(order=True) class Job with fields priority: int, name: str = field(compare=False) and done: bool = field(default=False, compare=False). Then next_up(jobs) returning the name of the lowest-priority job that is not done, or None when every job is done.',
      'compare=False keeps name and done out of both ordering and equality. Filter the undone jobs with a comprehension, then min; guard the empty case.',
`check("name is not compared", Job(1, 'a') == Job(1, 'b'), True)
check("[j.name for j in sorted([Job(3, 'c'), Job(1, 'a'), Job(2, 'b')])]", ['a', 'b', 'c'])
check("next_up skips done jobs", next_up([Job(1, 'a', True), Job(2, 'b'), Job(3, 'c')]), 'b')
check("next_up with everything done", next_up([Job(1, 'a', True)]), None)
check("Job(2, 'x').done", False)
check("repr(Job(2, 'x'))", "Job(priority=2, name='x', done=False)")`),
  ],
})
