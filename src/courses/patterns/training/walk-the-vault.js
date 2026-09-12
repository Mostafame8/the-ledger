import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('walk-the-vault', {
  tier: 'A', xp: 220, requires: ['parts-not-bloodlines'], gates: ['roombyroom'],
  tools: ['tool-generator', 'tool-dunder'],
  title: 'Walk the vault', algo: 'Iterator',
  steps: [
    explain([
      'The vault plan is a list of rooms, some locked. To find the first locked door Dax builds the full list of room names, then the full list of locked ones, then takes the first. On a plan with a million rooms he waits.',
      'Dax: “Lists are fast.” “Lists you did not need are not fast. They are just finished.”',
    ], { move: 'brute force' }),
    explain([
      '“Make the vault walkable: __iter__ with a yield inside hands out one room at a time. A for loop, list(), in and sorted() all work on it. Then a generator over that walk keeps only the open rooms, and a search stops at the first hit without building anything.”',
      '“Walking is lazy by design. The reader decides how far to go.”',
    ], { move: 'pick the pattern', code:
`class Vault:
    def __init__(self, rooms):
        self.rooms = rooms          # [(name, locked)]
    def __iter__(self):
        for name, _locked in self.rooms:
            yield name

def open_rooms(vault):
    for name, locked in vault.rooms:
        if not locked:
            yield name

v = Vault([('lobby', False), ('cage', True), ('exit', False)])
list(v)               # ['lobby', 'cage', 'exit']
list(open_rooms(v))   # ['lobby', 'exit']` }),
    trace(
`class Vault:
    def __init__(self, rooms):
        self.rooms = rooms
    def __iter__(self):
        for name, _locked in self.rooms:
            yield name

def open_rooms(vault):
    for name, locked in vault.rooms:
        if not locked:
            yield name

def first_open(vault):
    for name in open_rooms(vault):
        return name
    return None`,
      "first_open(Vault([('cage', True), ('lobby', False), ('exit', False)]))",
      [
        { line: 9, state: { name: 'cage', locked: true }, ask: 'name', note: 'first_open asked the generator for one room. The generator woke up and looked at the first pair.' },
        { line: 10, state: { name: 'cage', locked: true }, ask: 'locked', note: 'Locked, so no yield. The loop moves on without handing anything out.' },
        { line: 11, state: { name: 'lobby', locked: false }, ask: 'name', note: 'The lobby is open, so the generator yields it and freezes right here.' },
        { line: 15, state: { name: 'lobby', returns: 'lobby' }, ask: 'returns', note: 'first_open returns on the first room it was handed. The exit was never looked at. On a million rooms, that is the difference.' },
      ]),
    spot('Dax builds the full room list to find the first locked door. The vault has a million rooms and the first locked one is room three. What did the walk cost?',
      ['Three rooms, either way',
       'A million rooms and a million-entry list, where a walk that yields one room at a time and stops at the first hit costs three',
       'Nothing, lists are free',
       'It depends on the lock'],
      1, 'Building everything first pays for everything. Yielding one at a time lets the reader stop early, and most readers stop early. That is an iterator, and a generator is the cheapest way to write one.'),
    blank('“A deck you can walk. firsts takes the first n cards and stops.”',
`class Deck:
    def __init__(self, cards):
        self.cards = cards
    def __iter__(self):
        for card in self.cards:
            ___

def firsts(deck, n):
    out = []
    for card in deck:
        if len(out) == n:
            ___
        out.append(card)
    return out`,
`check("list(Deck(['A', 'K', 'Q']))", ['A', 'K', 'Q'])
check("firsts(Deck(['A', 'K', 'Q']), 2)", ['A', 'K'])
check("firsts(Deck(['A']), 5)", ['A'])
check("firsts(Deck([]), 3)", [])
check("'K' in Deck(['A', 'K'])", True)
check("firsts(Deck(['A', 'K', 'Q']), 0)", [])`),
    mini('Write class Log built with a list of (level, text) pairs stored as log.entries, whose __iter__ yields the texts in order. Then errors(log), a generator yielding the texts whose level is "error"; first_error(log) returning the first such text or None without building a list; and count_levels(log) returning a dict from level to how many entries hold it, built in one walk.',
      '__iter__ yields the text of each pair. errors filters on the level. first_error loops over errors(log) and returns on the first. count_levels uses dict.get(level, 0) + 1.',
`_t_l = Log([('info', 'boot'), ('error', 'no key'), ('info', 'retry'), ('error', 'no door')])
check("list(_t_l)", ['boot', 'no key', 'retry', 'no door'])
check("list(errors(_t_l))", ['no key', 'no door'])
check("first_error(_t_l)", 'no key')
check("first_error(Log([('info', 'fine')]))", None)
check("count_levels(_t_l)", {'info': 2, 'error': 2})
check("type(errors(_t_l)).__name__", 'generator')`),
  ],
})
