import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('one-job', {
  tier: 'F', xp: 40, requires: [], gates: ['onejob'],
  tools: ['tool-class'],
  title: 'The one-job rule', algo: 'Single responsibility',
  steps: [
    explain([
      'One crate of stock on the bench. Dax has a Crate class that counts what is in it, prices it, prints the receipt, and warms the kettle while it waits.',
      'Dax: “It works. Everything the crate needs is in one place.”',
      '“Everything the crate needs, and everything the receipt needs, and everything the kettle needs,” Marguerite says. “When the fence changes the receipt, why does the count get nervous?”',
    ], { move: 'brute force' }),
    explain([
      '“One part, one reason to change. The book only remembers lines and sums them. The printout only reads a book and formats it. Change the paper and the book never hears.”',
      '“The test of a part is a sentence: this thing does X. If you need an and, you have two things.”',
    ], { move: 'pick the pattern', code:
`class Book:
    def __init__(self):
        self.lines = []
    def add(self, item, price):
        self.lines.append((item, price))
        return self
    def total(self):
        return sum(p for _, p in self.lines)

def render(book):
    out = [f"{item}  {price}" for item, price in book.lines]
    return out + [f"total  {book.total()}"]` }),
    trace(
`class Book:
    def __init__(self):
        self.lines = []
    def add(self, item, price):
        self.lines.append((item, price))
        return self
    def total(self):
        return sum(p for _, p in self.lines)

def render(book):
    out = [f"{item}  {price}" for item, price in book.lines]
    return out + [f"total  {book.total()}"]`,
      "render(Book().add('torch', 5).add('tape', 2))",
      [
        { line: 5, state: { lines: { py: "[('torch', 5)]" } }, ask: 'lines', note: 'add appends one pair and hands the book back so the next add can chain. The book knows nothing about printing.' },
        { line: 5, state: { lines: { py: "[('torch', 5), ('tape', 2)]" } }, ask: 'lines', note: 'Second add, second pair. Still just a list of what went in.' },
        { line: 8, state: { lines: { py: "[('torch', 5), ('tape', 2)]" }, total: 7 }, ask: 'total', note: 'total is the only sum the book knows. render asked for it; the book did not volunteer a format.' },
        { line: 11, state: { lines: { py: "[('torch', 5), ('tape', 2)]" }, total: 7, out: ['torch  5', 'tape  2'] }, ask: 'out', note: 'render reads the pairs and formats them. Change the two spaces to a tab and only this line moves.' },
        { line: 12, state: { lines: { py: "[('torch', 5), ('tape', 2)]" }, total: 7, out: ['torch  5', 'tape  2'], returns: ['torch  5', 'tape  2', 'total  7'] }, ask: 'returns', note: 'One book, one printout, and a change to either leaves the other alone.' },
      ]),
    spot('Dax\'s Crate class counts stock, prices it and prints the receipt. The fence changes the receipt format. What breaks first?',
      ['Nothing. The receipt code is in its own method, so only that method changes',
       'The whole class is under the knife: an edit to printing sits next to the count and the prices, and a slip there breaks stock you never meant to touch',
       'Only the kettle',
       'The count, because receipts and counts share a list'],
      1, 'The method boundary is not the problem; the class boundary is. Every edit reopens the one file that holds everything, and everything in it is at risk. Two parts with one reason to change each, and the receipt edit cannot reach the count. That is single responsibility.'),
    blank('“Split the stock room. Stock only counts. low_report only reads.”',
`class Stock:
    def __init__(self):
        self.counts = {}
    def add(self, item, n):
        self.counts[item] = ___
    def count(self, item):
        return self.counts.get(item, 0)

def low_report(stock, threshold):
    return [item for item, n in stock.counts.items() if ___]`,
`_t_s = Stock(); _t_s.add('tape', 3); _t_s.add('tape', 2); _t_s.add('torch', 1)
check("count adds up", _t_s.count('tape'), 5)
check("an unknown item counts zero", _t_s.count('drill'), 0)
check("low_report lists what is under the line", low_report(_t_s, 2), ['torch'])
check("the line is exclusive", low_report(_t_s, 5), ['torch'])
check("everything low", sorted(low_report(_t_s, 10)), ['tape', 'torch'])
check("low_report(Stock(), 3)", [])`),
    mini('Write class Roster with add(name, role) and by_role(role) returning the names holding that role in the order added, keeping its (name, role) pairs in a list called people. Then, outside the class, write headcount(roster) returning a dict from role to how many names hold it. Roster keeps people; headcount only reads.',
      'Roster stores (name, role) pairs in roster.people. headcount walks that list and counts with a dict. Neither knows how the other formats anything.',
`_t_r = Roster(); _t_r.add('Dax', 'muscle'); _t_r.add('Vera', 'driver'); _t_r.add('Sol', 'muscle')
check("by_role keeps the order added", _t_r.by_role('muscle'), ['Dax', 'Sol'])
check("a role nobody holds", _t_r.by_role('pilot'), [])
check("headcount counts per role", headcount(_t_r), {'muscle': 2, 'driver': 1})
check("headcount(Roster())", {})
_t_r.add('Vera', 'muscle')
check("a name can hold two roles", headcount(_t_r)['muscle'], 3)`),
  ],
})
