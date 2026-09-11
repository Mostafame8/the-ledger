import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-dict', {
  xp: 30, title: 'The rolodex', algo: 'Dict',
  steps: [
    explain([
      'Marguerite slides a rolodex across the table. Every card carries a name and one number, and the cards sit in no order you would recognise.',
      'Dax: “Then I flip through until the name comes up. Two hundred cards, worst case, and I can flip fast.”',
      '“You do not flip. You say the name and the drawer hands you the card. That is the entire reason it exists.”',
    ], { code:
`book = {'fence': '0141', 'dax': '0770'}
book['fence']              # '0141'
book['driver'] = '0288'    # files a new card
book['dax'] = '0771'       # overwrites the number on the old card
'driver' in book           # True
book['mole']               # KeyError. There is no such card
book.get('mole')           # None instead of a crash
book.get('mole', '0000')   # '0000', the default you named
len(book)                  # 3
for name, num in book.items(): ...`,
      scene: { kind: 'cells', data: 'counts', init: {}, at: ['n'], states: [{ n: 'dax', counts: { dax: 1 } }, { n: 'fence', counts: { dax: 1, fence: 1 } }, { n: 'dax', counts: { dax: 2, fence: 1 } }] } }),
    explain([
      '“Say a name and the drawer goes straight to the card. Reading, writing and asking in cost one move each, near enough, and the size of the book does not come into it.”',
      '“The price is that a missing name is a KeyError, not a shrug. get(name) hands back None, and get(name, 0) hands back the default you chose, which is how every tally you will ever write begins.”',
      '“A key has to be something that cannot change under you: a tape, a number, a tuple. A crate cannot be a key. And the cards stay in the order you filed them, which is not an order that means anything.”',
    ]),
    trace(
`def tally(names):
    counts = {}
    for n in names:
        counts[n] = counts.get(n, 0) + 1
    return counts['dax']`,
      "tally(['dax', 'fence', 'dax'])",
      [
        { line: 4, state: { n: 'dax', counts: { dax: 1 } }, ask: 'counts', note: 'No card for dax yet, so get handed back the default 0 and we filed a card reading 1. No check, no branch.' },
        { line: 4, state: { n: 'fence', counts: { dax: 1, fence: 1 } }, ask: 'counts', note: 'A second name, a second card. The dax card was not disturbed and nothing was searched to find that out.' },
        { line: 4, state: { n: 'dax', counts: { dax: 2, fence: 1 } }, ask: 'counts', note: 'dax comes round again. This time get finds the card, so 1 becomes 2 and the card is written over. The order of the cards is filing order, not count order.' },
        { line: 5, state: { n: 'dax', counts: { dax: 2, fence: 1 }, returns: 2 }, ask: 'returns', note: 'Three names read, three moves spent. Dax would have flipped through the whole book for each one.' },
      ], { scene: { kind: 'cells', data: 'counts', init: {}, at: ['n'] } }),
    blank('“Two hands on the rolodex. One gives me the number for a name and hands back nothing at all when there is no card, no crash. One files a card, over the top of any card already under that name.”',
`def number_for(book, name):
    return ___

def file_card(book, name, number):
    ___
    return book`,
`check("number_for({'fence': '0141'}, 'fence')", '0141')
check("number_for({'fence': '0141'}, 'mole')", None)
check("number_for({}, 'mole')", None)
check("file_card({}, 'driver', '0288')", {'driver': '0288'})
check("file_card({'dax': '0770'}, 'dax', '0771')", {'dax': '0771'})
check("file_card({'dax': '0770'}, 'fence', '0141')", {'dax': '0770', 'fence': '0141'})`),
  ],
})
