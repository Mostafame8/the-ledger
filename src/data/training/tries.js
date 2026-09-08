import { node, explain, trace, spot, blank, mini } from './node.js'

export default node('tries', {
  tier: 'S', xp: 300, requires: ['hash-maps', 'recursion'], gates: ['trie', 'ladder'],
  title: 'The code-word rack', algo: 'Prefix trees',
  steps: [
    explain([
      'Two hundred thousand code words on the fence’s list. Dax radios in the first few letters of one and wants every word that starts that way, before he has finished saying it.',
      'Dax: “Read down the list. Keep the ones that start with what I said.”',
      '“Two hundred thousand comparisons per fragment, and you will send twenty fragments a minute. Look at what the comparisons repeat: half that list starts with the same letter, and you check that letter again for every single word.”',
    ], { move: 'brute force' }),
    explain([
      '“Words that start the same should share the reading of the part they share. So stop storing words and store letters, one step per letter, and let two words that begin alike walk the same steps until they part.”',
      '“A step is a dictionary from a letter to the step after it. The rack starts as one empty dictionary. Inserting a word walks it letter by letter, making a step where one is missing, and marks the end of the word when it runs out of letters — because “to” being on the list is not the same as “to” merely being the start of “toll”.”',
      '“Now a fragment is not a search at all. It is a walk: one dictionary lookup per letter of the fragment, and the fragment is a dead end the moment a letter is missing. The length of the list stopped mattering the day you built the rack.”',
      '“The end mark needs a key no letter can collide with. A hash is the usual choice, and it holds True so a step can be asked plainly whether a word ends there.”',
    ], { move: 'pick the pattern', code:
`END = '#'

def build(words):
    root = {}
    for word in words:
        node = root
        for ch in word:
            if ch not in node:
                node[ch] = {}
            node = node[ch]
        node[END] = True
    return root` }),
    trace(
`END = '#'

def build(words):
    root = {}
    for word in words:
        node = root
        for ch in word:
            if ch not in node:
                node[ch] = {}
            node = node[ch]
        node[END] = True
    return root`,
      "build(['to', 'tea'])",
      [
        { line: 4, state: { root: { py: '{}' } }, ask: 'root', note: 'The rack before anything is on it: one empty dictionary. Every word on the list will hang off this one object, and nothing about the list is stored anywhere else.' },
        { line: 11, state: { word: 'to', root: { py: "{'t': {'o': {'#': True}}}" } }, ask: 'root', note: 'One word in, two steps deep, and the mark at the bottom says a word ends here. Read it as a path rather than a nest: t, then o, then stop.' },
        { line: 9, state: { word: 'tea', ch: 'e', root: { py: "{'t': {'o': {'#': True}, 'e': {}}}" } }, ask: 'root', note: 'The moment the rack branches. The e is a step after the t, not a second entry beside it — the walk had already moved into the t dictionary before it looked for the e, so the t step now has two ways out. The shared letter was read once and is stored once, which is the whole saving.' },
        { line: 11, state: { word: 'tea', root: { py: "{'t': {'o': {'#': True}, 'e': {'a': {'#': True}}}}" } }, ask: 'root', note: 'Both words on the rack in five dictionaries instead of two strings, and the t is not duplicated. That is the trade: more objects, and a fragment now costs its own length rather than the length of the list.' },
      ]),
    spot('Dax will ask, thousands of times a night, how many code words start with a given fragment. The rack is built once. Which answers a fragment fastest?',
      ['Walk the fragment down the rack, then collect every word beneath it into a list and take the length of the list',
       'Keep a count on every step, raised as each word is inserted past it, so a fragment is one walk down and one number read',
       'Put every word in a dictionary and look the fragment up in it',
       'Scan the list of words for each question and count the ones that start with the fragment'],
      1, 'A dictionary of whole words answers “is this exactly a word”, which is a different question — the fragment is not in it. Scanning is the thing the rack was built to replace. Collecting the words beneath is right and it does more work than the question needs: the answer is a single number, and the collecting costs one step per matching word, thousands of times a night. Counting on the way in is paid once per word at build time and never again, and the fragment then costs its own length and nothing else. Note what it does not do: it does not store the words twice, it stores one integer per step.'),
    blank('“Half of the useful part. Given a rack and a fragment, say whether anything on the rack starts that way. Two lines missing: the dead end, and the step forward.”',
`def has_prefix(root, prefix):
    node = root
    for ch in prefix:
        if ___:
            return False
        ___
    return True`,
`_t_root = {'t': {'o': {'#': True}, 'e': {'a': {'#': True}}}}
check("has_prefix(_t_root, 'te')", True)
check("has_prefix(_t_root, 'tea')", True)
check("has_prefix(_t_root, 'ted')", False)
check("has_prefix(_t_root, 'a')", False)
check("has_prefix(_t_root, '')", True)
check("has_prefix({}, 'a')", False)
check("has_prefix({}, '')", True)`),
    mini("Write count_with_prefix(words, prefix) returning how many of the words in words begin with prefix. Build a rack from the words first and answer from the rack — a repeated word counts once for each time it appears in the list, and every word begins with the empty prefix.",
      'Raise a count on each step you walk through as you insert a word, so a step knows how many words passed through it. Then the answer is the count on the step the prefix lands on, and 0 if the prefix runs off the rack.',
`check("count_with_prefix(['to', 'tea', 'ted', 'ten', 'a'], 'te')", 3)
check("count_with_prefix(['to', 'tea', 'ted', 'ten', 'a'], 't')", 4)
check("count_with_prefix(['dog', 'do', 'door'], 'do')", 3)
check("count_with_prefix(['to', 'tea'], 'teas')", 0)
check("count_with_prefix(['a', 'a', 'b'], 'a')", 2)
check("count_with_prefix(['abc'], '')", 1)
check("count_with_prefix([], 'a')", 0)`),
  ],
})
