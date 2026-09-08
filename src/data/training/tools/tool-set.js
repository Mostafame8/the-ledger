import { tool, explain, trace, blank } from '../node.js'

export default tool('tool-set', {
  xp: 30, title: 'The blacklist', algo: 'Set',
  steps: [
    explain([
      'The fence keeps a blacklist: plates belonging to people we do not touch, ever, for any money. Marguerite copies it onto a card and hands it over.',
      'Dax: “It is in the crate already. Every car we see, I read down the crate and check.”',
      '“Four hundred plates, every car, every time. A blacklist is not a crate. It is a door that already knows whether you are on the list.”',
    ], { code:
`banned = {'HB44', 'KT19'}
banned.add('LP03')      # now three plates
banned.add('LP03')      # still three; a set holds one of each
'KT19' in banned        # True
'ZZ00' in banned        # False
banned.discard('KT19')  # gone, and no complaint if it was never there
banned.remove('ZZ00')   # KeyError. discard is the quiet one
len(banned)             # 2
set()                   # the empty set. {} is an empty rolodex
set(['a', 'b', 'a'])    # {'a', 'b'}, duplicates collapse` }),
    explain([
      '“Adding, asking in and discarding cost one move each, whatever the size of the list. It is the rolodex with the numbers thrown away and only the names kept.”',
      '“It holds one of each and nothing more, so pouring a crate into a set is how you find out whether anything repeated. If the set comes out shorter than the crate, something did.”',
      '“It keeps no order and it keeps no count. If you need to know which came first, use a crate. If you need to know how many times, use the rolodex.”',
    ]),
    trace(
`def screen(plates):
    seen = set()
    for p in plates:
        if p in seen:
            return p
        seen.add(p)
    return None`,
      "screen(['HB44', 'KT19', 'HB44'])",
      [
        { line: 6, state: { p: 'HB44', 'sorted(seen)': ['HB44'] }, ask: 'sorted(seen)', note: 'The first plate goes in. A set has no order of its own, so we sort it here only to have something printable to look at.' },
        { line: 6, state: { p: 'KT19', 'sorted(seen)': ['HB44', 'KT19'] }, ask: 'sorted(seen)', note: 'Second plate, second entry. Adding cost one move and did not look at the plate already in there.' },
        { line: 4, state: { p: 'HB44', 'p in seen': true, 'sorted(seen)': ['HB44', 'KT19'] }, ask: 'p in seen', note: 'HB44 again. The in test is one move: the set does not read down its contents, it goes straight to where HB44 would have to be.' },
        { line: 5, state: { p: 'HB44', 'sorted(seen)': ['HB44', 'KT19'], returns: 'HB44' }, ask: 'returns', note: 'The repeat is handed straight back. Dax reading down a crate would have cost a move for every plate already seen, on every plate.' },
      ]),
    blank('“Two hands on the blacklist. One says whether a plate is on it. One puts a plate on it, and putting a plate on twice leaves it on once.”',
`def is_banned(banned, plate):
    return ___

def ban(banned, plate):
    ___
    return banned`,
`check("is_banned({'HB44', 'KT19'}, 'KT19')", True)
check("is_banned({'HB44'}, 'ZZ00')", False)
check("is_banned(set(), 'HB44')", False)
check("ban(set(), 'HB44')", {'HB44'})
check("ban({'HB44'}, 'KT19')", {'HB44', 'KT19'})
check("ban({'HB44'}, 'HB44')", {'HB44'})`),
  ],
})
