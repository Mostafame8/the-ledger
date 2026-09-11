import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-closure', {
  xp: 30, title: 'The sealed envelope', algo: 'Closure',
  steps: [
    explain([
      'Dax needs a counter for every door on the floor. He makes a global count and a bump() that adds one. Then he needs a second door and copies both.',
      '“Seal the count inside the function that hands out the counter,” Marguerite says. “Each call to make_counter is a fresh envelope. The bump it returns remembers its own envelope and nobody else\'s.”',
      '“A function that remembers the variables around it after its maker has returned. That is a closure. nonlocal is how the inner function writes to the envelope instead of making a local copy.”',
    ], { code:
`def make_counter():
    count = 0
    def bump():
        nonlocal count
        count += 1
        return count
    return bump

a = make_counter()
b = make_counter()
a(); a()      # 1, then 2
b()           # 1: its own envelope` }),
    explain([
      '“Reading an outer variable needs nothing. Writing one needs nonlocal, or Python assumes count = … is a brand new local and complains it was read before assignment.”',
      '“Closures are how you build small configured functions: make_adder(5) is a function that adds five and carries the five with it. Same idea as an object with one method and one field, lighter to write.”',
      '“Use one when a function needs a little private memory or a setting baked in. When the memory grows past two or three things, reach for a class.”',
    ]),
    trace(
`def make_counter():
    count = 0
    def bump():
        nonlocal count
        count += 1
        return count
    return bump

def doors():
    a = make_counter()
    b = make_counter()
    a()
    first = a()
    second = b()
    return (first, second)`,
      'doors()',
      [
        { line: 12, state: { a_count: 1 }, ask: 'a_count', note: 'a() runs bump inside the first envelope. nonlocal count reaches the count sealed there and moves it to 1.' },
        { line: 13, state: { a_count: 2, first: 2 }, ask: 'first', note: 'Same envelope, second bump. The count was remembered between calls even though make_counter finished long ago.' },
        { line: 14, state: { a_count: 2, b_count: 1, first: 2, second: 1 }, ask: 'second', note: 'b came from a separate call to make_counter, so it has its own count, still at zero until now.' },
        { line: 15, state: { a_count: 2, b_count: 1, first: 2, second: 1, returns: { py: '(2, 1)' } }, ask: 'returns', note: 'Two counters, two envelopes, no globals. Each bump only ever touched its own.' },
      ]),
    blank('“Two envelopes. One holds a count that bump writes to. One holds an n that add reads.”',
`def make_counter():
    count = 0
    def bump():
        ___
        count += 1
        return count
    return bump

def make_adder(n):
    def add(x):
        return ___
    return add`,
`_t_c = make_counter()
check("a fresh counter starts at one", _t_c(), 1)
check("and keeps going", _t_c(), 2)
_t_d = make_counter()
check("a second counter has its own envelope", _t_d(), 1)
check("make_adder(5)(10)", 15)
check("make_adder(0)(5)", 5)
_t_add3 = make_adder(3)
check("the adder keeps n after the maker returned", _t_add3(4), 7)`),
  ],
})
