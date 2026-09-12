import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('parts-not-bloodlines', {
  tier: 'F', xp: 55, requires: ['stand-in'], gates: ['standin', 'layers'],
  tools: ['tool-class', 'tool-dataclass'],
  title: 'Parts, not bloodlines', algo: 'Composition over inheritance',
  steps: [
    explain([
      'Dax has a family tree of vans on the whiteboard. Van, DieselVan, SilentDieselVan, ArmouredSilentDieselVan. The fence wants a silent petrol van by Friday.',
      'Dax: “One more subclass.” “One more per combination. You are at eight. Friday makes sixteen.”',
    ], { move: 'brute force' }),
    explain([
      '“A van is not a kind of engine. A van has an engine. Build the van from parts: an engine, a radio, plates or not. Swap a part and the van does not change class; it changes contents.”',
      '“Inherit when the thing is a kind of the other thing and keeps every promise. Assemble from parts when it merely has one.”',
    ], { move: 'pick the pattern', code:
`from dataclasses import dataclass

@dataclass
class Battery:
    amps: int

@dataclass
class Blade:
    kind: str

class Rig:
    def __init__(self, battery, blade):
        self.battery = battery
        self.blade = blade
    def describe(self):
        return f"{self.blade.kind} blade on {self.battery.amps}Ah"

Rig(Battery(40), Blade('diamond')).describe()   # 'diamond blade on 40Ah'` }),
    trace(
`from dataclasses import dataclass

@dataclass
class Battery:
    amps: int

@dataclass
class Blade:
    kind: str

class Rig:
    def __init__(self, battery, blade):
        self.battery = battery
        self.blade = blade
    def describe(self):
        return f"{self.blade.kind} blade on {self.battery.amps}Ah"

def refit(rig, blade):
    rig.blade = blade
    return rig.describe()`,
      "refit(Rig(Battery(40), Blade('steel')), Blade('diamond'))",
      [
        { line: 14, state: { battery: { py: 'Battery(amps=40)' }, blade: { py: "Blade(kind='steel')" } }, ask: 'blade', note: 'The rig is assembled from two parts it was handed. It is not a kind of battery or a kind of blade; it holds one of each.' },
        { line: 19, state: { battery: { py: 'Battery(amps=40)' }, blade: { py: "Blade(kind='diamond')" } }, ask: 'blade', note: 'refit swaps the blade part. Same rig, same class, different contents. No new subclass was born.' },
        { line: 16, state: { battery: { py: 'Battery(amps=40)' }, blade: { py: "Blade(kind='diamond')" }, text: 'diamond blade on 40Ah' }, ask: 'text', note: 'describe reads whatever parts are in the rig right now.' },
        { line: 20, state: { blade: { py: "Blade(kind='diamond')" }, text: 'diamond blade on 40Ah', returns: 'diamond blade on 40Ah' }, ask: 'returns', note: 'Every combination of battery and blade is one Rig with different parts. The whiteboard tree is gone.' },
      ]),
    spot('SilentDieselVan(DieselVan(Van)) exists. The fence wants a silent petrol van. What does inheritance offer?',
      ['A new class SilentPetrolVan(PetrolVan), and another for every new combination, forever',
       'Nothing; vans cannot be silent',
       'Multiple inheritance solves it cleanly',
       'A flag on Van for every feature'],
      0, 'Every combination of engine and silencing is a new leaf, and the tree doubles per feature. Two parts, engine and exhaust, held by one Van, give every combination for free. The flag option turns Van back into the one-job crate. Composition over inheritance.'),
    blank('“A cart has wheels. It is not a kind of wheel.”',
`from dataclasses import dataclass

@dataclass
class Wheel:
    size: int

class Cart:
    def __init__(self):
        self.wheels = []
    def add(self, wheel):
        ___
        return self
    def width(self):
        return ___`,
`check("Cart().width()", 0)
check("Cart().add(Wheel(3)).add(Wheel(4)).width()", 7)
_t_c = Cart(); _t_c.add(Wheel(5))
check("the wheel is kept", _t_c.wheels, [Wheel(5)])
check("Wheel(3) == Wheel(3)", True)
check("isinstance(Cart(), Wheel)", False)`),
    mini('Write class Engine built with power and class Radio built with band. Then class Van built with an engine and a radio, whose spec() returns "<power>hp, <band>". Finally swap_radio(van, radio) returning a new Van with the same engine and the new radio, leaving the old van untouched.',
      'Van stores both parts and reads them in spec(). swap_radio builds Van(van.engine, radio); it never copies fields one by one.',
`_t_v = Van(Engine(120), Radio('vhf'))
check("spec reads both parts", _t_v.spec(), '120hp, vhf')
_t_w = swap_radio(_t_v, Radio('uhf'))
check("the new van has the new radio", _t_w.spec(), '120hp, uhf')
check("the old van is untouched", _t_v.spec(), '120hp, vhf')
check("the engine is shared, not copied", _t_w.engine is _t_v.engine, True)
check("Van(Engine(90), Radio('cb')).spec()", '90hp, cb')`),
  ],
})
