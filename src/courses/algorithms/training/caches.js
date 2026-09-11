import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('caches', {
  tier: 'S', xp: 300, requires: ['hash-maps', 'linked-lists'], gates: ['lru'],
  tools: ['tool-dict', 'tool-linked-node'],
  title: 'What the fence forgets', algo: 'Caching and eviction',
  steps: [
    explain([
      'The fence keeps her contacts in her head and never more than a handful. Use a name and it goes to the front of her mind; give her a new one when she is full and something has to go.',
      'Dax: “She keeps the useful ones. Whoever she likes.”',
      '“She keeps whoever she used most recently, which is not the same thing and is the only rule that can be written down. The part nobody writes down properly is which name leaves, and if you keep the names in a list and hunt through it for the one to promote, every use of a contact costs you the length of the list.”',
    ], { move: 'brute force' }),
    explain([
      '“Two questions, and they want two different structures. What is the value for this name — that is a dictionary, and it is instant. Which name has been unused longest — a dictionary cannot answer that at all, because a dictionary has no idea what order anything arrived in.”',
      '“So keep both. A dictionary for the values, and an order beside it, most recently used at the back. A use pulls the name out of the order and puts it at the back. A new name when the order is full drops whatever sits at the front, and drops it from the dictionary too, because a value nobody can reach is a leak.”',
      '“Written with a plain list the order is honest and slow: pulling a name out of the middle of a list shifts everything after it. That is the version below and it is the one to think in. The constant-time version keeps the same order as a chain of notes where each note knows its neighbours on both sides, and has the dictionary point straight at the notes — so the name to promote is two snips and a pin, with nothing searched.”',
      '“The same trick is worth having in the small: a function that remembers what it was asked. Same dictionary, no eviction at all, and it turns the fire escape from a tree of repeated calls into one answer per question.”',
    ], { move: 'pick the pattern', code:
`def run(ops, cap):
    store = {}
    order = []
    for kind, key, val in ops:
        if kind == 'get':
            if key in store:
                order.remove(key)
                order.append(key)
        else:
            if key in store:
                order.remove(key)
            elif len(order) == cap:
                del store[order.pop(0)]
            store[key] = val
            order.append(key)
    return order`,
      scene: { kind: 'rows', rows: [{ label: 'store', data: 'store', init: {}, at: ['key'] }, { label: 'order', data: 'order', init: [], at: ['key'] }],
        states: [{ key: 1, store: { 1: 1 }, order: [1] }, { key: 2, store: { 1: 1, 2: 2 }, order: [1, 2] }, { key: 1, store: { 1: 1, 2: 2 }, order: [2, 1] }, { key: 3, store: { 1: 1, 3: 3 }, order: [1, 3] }] } }),
    trace(
`def run(ops, cap):
    store = {}
    order = []
    for kind, key, val in ops:
        if kind == 'get':
            if key in store:
                order.remove(key)
                order.append(key)
        else:
            if key in store:
                order.remove(key)
            elif len(order) == cap:
                del store[order.pop(0)]
            store[key] = val
            order.append(key)
    return order`,
      "run([('put', 1, 1), ('put', 2, 2), ('get', 1, None), ('put', 3, 3), ('get', 2, None)], 2)",
      [
        { line: 15, state: { cap: 2, key: 1, store: { py: '{1: 1}', val: { 1: 1 } }, order: [1] }, ask: 'order', note: 'First name in. Room for two, so nothing is evicted, and the name goes to the back of the order because it was just used. Front is oldest, back is newest — fix that in your head now, because every line below depends on which end is which.' },
        { line: 15, state: { cap: 2, key: 2, store: { py: '{1: 1, 2: 2}', val: { 1: 1, 2: 2 } }, order: [1, 2] }, ask: 'order', note: 'Second name in and she is now full. Name 1 sits at the front, which makes it the one on the way out, and nothing has been evicted yet only because the capacity was exactly reached rather than exceeded.' },
        { line: 8, state: { cap: 2, key: 1, store: { py: '{1: 1, 2: 2}', val: { 1: 1, 2: 2 } }, order: [2, 1] }, ask: 'order', note: 'A use of name 1. The dictionary did not change at all — the value was already there — but the order flipped, and that is the entire point of this step. Name 2 is now at the front and name 1 is safe.' },
        { line: 15, state: { cap: 2, key: 3, store: { py: '{1: 1, 3: 3}', val: { 1: 1, 3: 3 } }, order: [1, 3] }, ask: 'order', note: 'A new name with no room. Line 13 took the front of the order — name 2 — and deleted it from the dictionary in the same breath, then name 3 went in at the back. Had the use on the previous step not happened, name 1 would have been the one forgotten.' },
        { line: 6, state: { cap: 2, key: 2, store: { py: '{1: 1, 3: 3}', val: { 1: 1, 3: 3 } }, order: [1, 3] }, ask: 'order', note: 'A use of name 2, which she no longer has. The test on line 6 fails, nothing is promoted, and the order is untouched — a miss must never reorder anything, or a name nobody can reach would keep pushing real names out.' },
      ], { scene: { kind: 'rows', rows: [{ label: 'store', data: 'store', init: {}, at: ['key'] }, { label: 'order', data: 'order', init: [], at: ['key'] }] } }),
    spot('Marguerite times the list version and it costs the length of the order on every single use. Which fix actually makes a use constant time?',
      ['Store each name next to its position in the order, so the position can be looked up instead of searched for',
       'Keep the order sorted by last-used time and sort it again before each eviction',
       'A dictionary from name to a link in a doubly linked list: the dictionary finds the link in one step and the link unhooks itself from its two neighbours in another',
       'Only tidy the order when the cache is full, and until then let names appear in it more than once'],
      2, 'Positions look promising and they are a trap: pull one name out of the middle and every position after it is wrong, so the fix costs exactly what it was meant to save. Sorting is worse than searching. Letting duplicates pile up means the front of the order is no longer trustworthy — you would have to check each front entry against the dictionary and discard stale ones, which is a real technique but it does not give you a constant bound per use. What does is a structure where removing from the middle needs no search: a link knows its own neighbours, so unhooking it is two assignments, and the dictionary is what gets you to the link without walking.'),
    blank('“Now the small version — the one with no eviction. memoize takes a one-argument function and hands back a function that behaves identically and never computes the same answer twice. Two lines missing.”',
`def memoize(fn):
    seen = {}

    def wrapped(n):
        if ___:
            return seen[n]
        result = fn(n)
        ___
        return result

    return wrapped`,
`_t_calls = []


def _t_slow(n):
    _t_calls.append(n)
    return n * n


_t_fast = memoize(_t_slow)
check("_t_fast(4)", 16)
check("_t_fast(4)", 16)
check("_t_fast(5)", 25)
check("_t_fast(5)", 25)
check("len(_t_calls)", 2)
check("_t_fast(0)", 0)
check("len(_t_calls)", 3)`),
    mini("Write first_evicted(ops, cap) returning the first key the fence forgets, or None if she never has to forget anything. ops is a list of tuples: ('put', key) stores or refreshes a key, ('get', key) uses it. A put of a key she already holds refreshes it and evicts nothing; a put of a new key when she is holding cap of them evicts the one unused longest. A get of a key she does not hold changes nothing.",
      'You never need the values, only the order, so keep one list of keys with the most recently used at the back. Return the moment the first key is dropped off the front.',
`check("first_evicted([('put', 1), ('put', 2), ('get', 1), ('put', 3)], 2)", 2)
check("first_evicted([('put', 1), ('put', 2), ('put', 3)], 2)", 1)
check("first_evicted([('put', 1), ('put', 1), ('put', 2), ('put', 3)], 2)", 1)
check("first_evicted([('get', 9), ('put', 1), ('put', 2), ('put', 3)], 2)", 1)
check("first_evicted([('put', 5), ('put', 6)], 1)", 5)
check("first_evicted([('put', 1), ('put', 2)], 2)", None)
check("first_evicted([], 2)", None)`),
  ],
})
