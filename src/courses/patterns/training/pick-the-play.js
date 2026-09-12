import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('pick-the-play', {
  tier: 'C', xp: 120, requires: ['the-socket', 'bolt-on'], gates: ['threeways'],
  tools: ['tool-abstract'],
  title: 'Pick the play', algo: 'Strategy',
  steps: [
    explain([
      'Three ways out of the bank, and the choice is made at nine when someone looks at the street. Dax\'s Escape has an if per route, and a fourth branch he wrote at 3 a.m. and does not trust.',
      'Dax: “The escape has to know the routes.” “The escape has to know that a route answers path(start). Which one is tonight\'s problem, not the escape\'s.”',
    ], { move: 'brute force' }),
    explain([
      '“Each way out is its own small object with one method. The escape holds one of them and delegates. At nine, swap the object. The escape never learns a route by name, so a fourth route is a fourth class and nothing else.”',
      '“Behaviour that varies goes in a part you can swap. The thing that uses it stays put.”',
    ], { move: 'pick the pattern', code:
`class Sewer:
    def path(self, start): return f"{start} -> sewer"
class Rooftop:
    def path(self, start): return f"{start} -> rooftop"

class Escape:
    def __init__(self, route):
        self.route = route
    def go(self, start):
        return self.route.path(start)
    def switch(self, route):
        self.route = route

e = Escape(Sewer())
e.go('bank')          # 'bank -> sewer'
e.switch(Rooftop())
e.go('bank')          # 'bank -> rooftop'` }),
    trace(
`class Sewer:
    def path(self, start): return f"{start} -> sewer"
class Rooftop:
    def path(self, start): return f"{start} -> rooftop"

class Escape:
    def __init__(self, route):
        self.route = route
    def go(self, start):
        return self.route.path(start)
    def switch(self, route):
        self.route = route

def nine_pm():
    e = Escape(Sewer())
    first = e.go('bank')
    e.switch(Rooftop())
    return (first, e.go('bank'))`,
      'nine_pm()',
      [
        { line: 8, state: { route: { py: 'Sewer()' } }, ask: 'route', note: 'The escape is handed a route and keeps it. It does not look inside.' },
        { line: 16, state: { route: { py: 'Sewer()' }, first: 'bank -> sewer' }, ask: 'first', note: 'go() asks whatever route it holds for path(start). Tonight that is the sewer.' },
        { line: 12, state: { route: { py: 'Rooftop()' }, first: 'bank -> sewer' }, ask: 'route', note: 'Nine o\'clock. switch replaces the part. No if was touched, no escape was rewritten.' },
        { line: 18, state: { route: { py: 'Rooftop()' }, first: 'bank -> sewer', returns: { py: "('bank -> sewer', 'bank -> rooftop')" } }, ask: 'returns', note: 'Same escape, same go(), a different answer because a different part sits inside it.' },
      ]),
    spot('Escape has an if per route and a fourth branch nobody trusts. The street changes at nine. What should change with it?',
      ['The if chain, by hand, at nine',
       'Only the route object the escape holds: swap it and go() follows, because the escape depends on the shape path(start), not on any route by name',
       'The bank',
       'The crew'],
      1, 'The varying part is a swappable object with one method; the escape is the stable part that uses it. That is a strategy, and swapping at runtime is exactly what it is for.'),
    blank('“A sorter that takes its rule as a part. Swap the rule, keep the sorter.”',
`class Sorter:
    def __init__(self, rule):
        ___
    def run(self, items):
        return ___

def by_len(s):
    return len(s)

def by_last(s):
    return s[-1]`,
`check("Sorter(by_len).run(['ccc', 'a', 'bb'])", ['a', 'bb', 'ccc'])
check("Sorter(by_last).run(['ab', 'ca', 'bc'])", ['ca', 'ab', 'bc'])
check("Sorter(lambda x: -x).run([1, 3, 2])", [3, 2, 1])
check("Sorter(by_len).run([])", [])
_t_s = Sorter(by_len)
check("the rule is kept as a part", _t_s.rule is by_len, True)`),
    mini('Write class Pricer built with a policy, a function from price to price; charge(price) returns policy(price); set_policy(fn) swaps the policy. Also write two policies as plain functions: half(p) returning p / 2 and plus_tax(p) returning p * 1.2 rounded to 2 decimals.',
      'Pricer stores the function and calls it in charge. set_policy replaces it. The policies know nothing about Pricer.',
`check("half(10)", 5.0)
check("plus_tax(10)", 12.0)
check("plus_tax(9.99)", 11.99)
_t_p = Pricer(half)
check("charge applies the policy", _t_p.charge(20), 10.0)
_t_p.set_policy(plus_tax)
check("swap the policy, keep the pricer", _t_p.charge(20), 24.0)
check("any function works", Pricer(lambda p: 0).charge(99), 0)`),
  ],
})
