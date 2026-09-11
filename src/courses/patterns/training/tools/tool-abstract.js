import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-abstract', {
  xp: 30, title: 'The stencil', algo: 'Abstract base class',
  steps: [
    explain([
      'Every rig the crew orders has to answer use(). Dax writes a Rig class whose use() returns None and hopes everyone remembers to override it.',
      '“Hope is not a spec,” Marguerite says. “Cut a stencil. A stencil says what shape a rig must have and refuses to be a rig itself.”',
      '“ABC and @abstractmethod. Try to build the stencil and Python stops you at the door with TypeError. Build a Torch that fills the shape and it goes straight through.”',
    ], { code:
`from abc import ABC, abstractmethod

class Rig(ABC):
    @abstractmethod
    def use(self):
        ...

class Torch(Rig):
    def use(self):
        return 'burning'

Torch().use()   # 'burning'
Rig()           # TypeError: Can't instantiate abstract class Rig` }),
    explain([
      '“The stencil lists the moves every rig must have. A subclass that skips one is still abstract and still refuses to be built. The complaint comes at construction, not at some 3 a.m. call to a method that is not there.”',
      '“isinstance(torch, Rig) is True, so the hand that takes any Rig takes a Torch. That is the whole point: one promised shape, many fillings.”',
      '“Use it when more than one class must answer the same calls and you want the gap found early.”',
    ]),
    trace(
`from abc import ABC, abstractmethod

class Rig(ABC):
    @abstractmethod
    def use(self):
        ...

class Torch(Rig):
    def use(self):
        return 'burning'

def build(kinds):
    made = []
    for kind in kinds:
        try:
            made.append(kind().use())
        except TypeError:
            made.append('refused')
    return made`,
      'build([Torch, Rig])',
      [
        { line: 16, state: { kind: { py: 'Torch' }, made: ['burning'] }, ask: 'made', note: 'Torch fills the stencil, so Torch() builds and use() answers. One rig made.' },
        { line: 17, state: { kind: { py: 'Rig' }, made: ['burning'], error: 'TypeError' }, ask: 'error', note: 'Rig() is the stencil itself. Python refuses at construction with TypeError, before use() is ever reached, and the except catches it.' },
        { line: 19, state: { made: ['burning', 'refused'], returns: ['burning', 'refused'] }, ask: 'returns', note: 'One filled shape, one refused stencil. The gap was found where it was made, not where it would have been used.' },
      ]),
    blank('“Cut the stencil: mark the move every rig must have, then fill it in Torch.”',
`from abc import ABC, abstractmethod

class Rig(ABC):
    ___
    def use(self):
        ...

class Torch(Rig):
    def ___(self):
        return 'burning'`,
`check("Torch().use()", 'burning')
check("issubclass(Torch, Rig)", True)
def _t_raises(thunk):
    try:
        thunk()
    except Exception as e:
        return type(e).__name__
    return None
check("Rig() is refused", _t_raises(lambda: Rig()), 'TypeError')
class _t_Jammer(Rig):
    def use(self): return 'jamming'
check("a second filling of the stencil", _t_Jammer().use(), 'jamming')
check("Rig.__abstractmethods__ == frozenset({'use'})", True)
check("isinstance(Torch(), Rig)", True)`),
  ],
})
