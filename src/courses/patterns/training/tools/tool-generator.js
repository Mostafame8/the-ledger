import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-generator', {
  xp: 30, title: 'The ticket roll', algo: 'Generator',
  steps: [
    explain([
      'The ticket machine at the depot prints one number at a time. Dax wants tickets(n) to build the whole list first, even when the roll is a billion long and the crew needs three.',
      '“yield hands out one ticket and holds its place,” Marguerite says. “Ask again with next() and it picks up where it stopped. Nothing is built until it is asked for.”',
      '“A function with yield in it does not run when you call it. It returns a generator, a paused function. for pulls from it one at a time and stops when it runs dry.”',
    ], { code:
`def tickets(n):
    k = 1
    while k <= n:
        yield k
        k += 1

g = tickets(3)
next(g)            # 1
next(g)            # 2
list(g)            # [3], the rest of the roll
next(g)            # StopIteration: the roll is empty
tickets(10**9)     # returns at once; nothing printed yet` }),
    explain([
      '“Laziness is the point. A generator over a billion tickets costs one integer of memory. sum, any, zip and for all read it one at a time.”',
      '“One pass only. Once a generator is drained it stays drained; call the function again for a fresh roll.”',
      '“Use one when you produce a sequence and the reader may stop early, or the sequence is too big to hold. It is also how __iter__ gets written in one line: a yield inside it.”',
    ]),
    trace(
`def tickets(n):
    k = 1
    while k <= n:
        yield k
        k += 1

def pull():
    g = tickets(2)
    first = next(g)
    second = next(g)
    try:
        next(g)
    except StopIteration:
        return (first, second, 'empty')`,
      'pull()',
      [
        { line: 9, state: { k: 1, first: 1 }, ask: 'first', note: 'tickets(2) did nothing until next() asked. Then it ran to the first yield with k at 1, handed it out, and froze there.' },
        { line: 10, state: { k: 2, first: 1, second: 2 }, ask: 'second', note: 'The second next() wakes it after the yield: k += 1, the while test passes, and it yields 2 and freezes again.' },
        { line: 13, state: { k: 3, first: 1, second: 2, error: 'StopIteration' }, ask: 'error', note: 'The third next() wakes it, k becomes 3, the while fails, the function ends. A finished generator raises StopIteration.' },
        { line: 14, state: { k: 3, first: 1, second: 2, error: 'StopIteration', returns: { py: "(1, 2, 'empty')" } }, ask: 'returns', note: 'Two tickets pulled, one empty roll caught. A for loop would have caught the StopIteration for you and just stopped.' },
      ]),
    blank('“Two rolls. One hands out k and holds its place. One hands out the even numbers up to a limit.”',
`def tickets(n):
    k = 1
    while k <= n:
        ___
        k += 1

def evens(limit):
    for k in range(0, limit + 1, 2):
        ___`,
`check("list(tickets(3))", [1, 2, 3])
check("next(tickets(5))", 1)
check("list(tickets(0))", [])
check("list(evens(6))", [0, 2, 4, 6])
check("sum(evens(10))", 30)
check("type(tickets(1)).__name__", 'generator')`),
  ],
})
