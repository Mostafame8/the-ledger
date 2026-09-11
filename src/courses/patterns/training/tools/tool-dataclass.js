import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-dataclass', {
  xp: 30, title: 'The stamped form', algo: 'Dataclass',
  steps: [
    explain([
      'Every part in the catalogue needs a name, a cost and a list of tags. Dax writes __init__, __repr__ and __eq__ by hand for each one: twelve lines of nothing per part.',
      '“Stamp the form,” Marguerite says. “@dataclass reads the field list and writes those three for you. You write what the part is. Python writes the plumbing.”',
      '“Careful with lists. A default list on the class line is one list shared by every part. field(default_factory=list) hands each part its own.”',
    ], { code:
`from dataclasses import dataclass, field

@dataclass
class Part:
    name: str
    cost: int = 0
    tags: list = field(default_factory=list)

p = Part('blade', 40)
p                        # Part(name='blade', cost=40, tags=[])
p == Part('blade', 40)   # True, field by field
p.tags.append('sharp')
Part('blade').tags       # [], its own list` }),
    explain([
      '“The field list is the contract. The types are labels, not locks: Python does not check them, readers do.”',
      '“Fields with defaults come after fields without. frozen=True makes the form read-only, so a part cannot be changed after stamping and can sit in a set.”',
      '“Reach for a dataclass whenever a class is mostly fields. When it is mostly behaviour, write the class by hand and keep the dataclass for the record it carries.”',
    ]),
    trace(
`from dataclasses import dataclass, field

@dataclass
class Part:
    name: str
    cost: int = 0
    tags: list = field(default_factory=list)

def order():
    p = Part('blade', 40)
    q = Part('blade', 40)
    same = p == q
    p.tags.append('sharp')
    return q.tags`,
      'order()',
      [
        { line: 10, state: { p: { py: "Part(name='blade', cost=40, tags=[])" } }, ask: 'p', note: 'The generated __init__ took name and cost, left tags to its factory, and the generated __repr__ prints every field by name.' },
        { line: 12, state: { p: { py: "Part(name='blade', cost=40, tags=[])" }, q: { py: "Part(name='blade', cost=40, tags=[])" }, same: true }, ask: 'same', note: 'The generated __eq__ compares field by field. Two separate stampings with the same fields are equal.' },
        { line: 13, state: { p: { py: "Part(name='blade', cost=40, tags=['sharp'])" }, q: { py: "Part(name='blade', cost=40, tags=[])" }, same: true }, ask: 'p', note: 'The tag lands on p only. default_factory built a fresh list for each part instead of one list shared by all.' },
        { line: 14, state: { p: { py: "Part(name='blade', cost=40, tags=['sharp'])" }, q: { py: "Part(name='blade', cost=40, tags=[])" }, same: true, returns: [] }, ask: 'returns', note: 'q never saw the append. With a plain [] default, both parts would have shown sharp.' },
      ]),
    blank('“Stamp it. One decorator line, one factory for the list.”',
`from dataclasses import dataclass, field

___
class Part:
    name: str
    cost: int = 0
    tags: list = ___`,
`check("repr(Part('blade', 40))", "Part(name='blade', cost=40, tags=[])")
check("Part('blade').cost", 0)
check("Part('blade', 40) == Part('blade', 40)", True)
check("Part('blade', 40) == Part('blade', 41)", False)
check("Part('a').tags is not Part('b').tags", True)
check("Part('blade', 40, ['sharp']).tags", ['sharp'])`),
  ],
})
