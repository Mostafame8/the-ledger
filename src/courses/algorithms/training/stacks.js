import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('stacks', {
  tier: 'E', xp: 70, requires: ['arrays-in-place'], gates: ['parens'],
  tools: ['tool-stack'],
  title: 'The latch on the server cage', algo: 'Stacks',
  steps: [
    explain([
      'The server cage in the basement has a latch panel. You feed it a card punched with open marks and close marks, and it opens only if every close mark answers the open mark still waiting for it.',
      'Dax: “Count them. Same number of opens as closes, the latch lifts.”',
      '“Then a card that closes before it opens would pass, and it does not. Order is the entire question.”',
    ], { move: 'brute force' }),
    explain([
      '“Read the card left to right. An open mark is a promise you are still holding, so put it down on a pile. A close mark answers whatever is on top of the pile, so take that one off.”',
      '“A close mark with an empty pile is a lie. Marks left on the pile at the end are promises nobody answered. Either way the latch stays shut.”',
      '“Last thing on is the first thing off. A list you only ever touch at the end does this for free.”',
    ], { move: 'pick the pattern', code:
`def balanced(s):
    stack = []
    for c in s:
        if c == '(':
            stack.append(c)
        else:
            if not stack:
                return False
            stack.pop()
    return not stack`,
      scene: { kind: 'rows', rows: [
        { label: 'card', data: '(()' },
        { label: 'pile', data: 'stack', init: [], pile: true },
      ], states: [{ stack: ['('] }, { stack: ['(', '('] }, { stack: ['('] }] },
    }),
    trace(
`def balanced(s):
    stack = []
    for c in s:
        if c == '(':
            stack.append(c)
        else:
            if not stack:
                return False
            stack.pop()
    return not stack`,
      "balanced('(()')",
      [
        { line: 5, state: { c: '(', stack: ['('] }, ask: 'stack', note: 'The first mark is an open, so it goes on the pile as one unanswered promise.' },
        { line: 5, state: { c: '(', stack: ['(', '('] }, ask: 'stack', note: 'A second open. Two promises held, and the newest sits at the end of the list, which is the top of the pile.' },
        { line: 9, state: { c: ')', stack: ['('] }, ask: 'stack', note: 'The close mark answers the top promise and pops it. The older open is still down there, still waiting.' },
        { line: 10, state: { c: ')', stack: ['('], returns: false }, ask: 'returns', note: 'The card ran out with one promise still on the pile, so the latch stays shut. Equal counts would have said yes; the pile says no.' },
      ],
      { scene: { kind: 'rows', rows: [
        { label: 'card', data: '(()' },
        { label: 'pile', data: 'stack', init: [], pile: true },
      ] } }),
    spot('Dax wants to check the latch card by counting: as many close marks as open marks means the cage opens. Where does that fall down?',
      ['Nowhere. With one shape of mark, equal counts is exactly the condition',
       'A card that reads close then open has equal counts and never opens the latch, because a close can arrive with nothing waiting',
       'It is too slow. Counting has to read the whole card',
       'It only fails once the panel takes three shapes of mark'],
      1, 'Counting reads the card once, so speed is not the complaint. And the failure is not about having three shapes: close-then-open is one shape, balanced by count, and still nonsense. Counts are blind to order, which is the only thing the latch cares about, and a pile is what remembers order for you.'),
    blank('“Now the real panel. Three shapes of mark, and a close only answers an open of its own shape.”',
`def matching(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for c in s:
        if ___:
            stack.append(c)
        else:
            if not stack or ___:
                return False
    return not stack`,
`check("matching('()[]{}')", True)
check("matching('([{}])')", True)
check("matching('(]')", False)
check("matching('([)]')", False)
check("matching(']')", False)
check("matching('(')", False)
check("matching('')", True)`),
    mini('Write undo_sequence(ops) that replays a string of keystrokes. A # deletes the last kept character if there is one and does nothing at all if there is not; every other character is kept. Return the kept characters joined into one string, so undo_sequence("ab#c") is "ac" and undo_sequence("a##c") is "c".',
      'The kept characters are the pile: push what you keep, pop when a # arrives, and pop nothing when the pile is already empty. Join the pile at the end.',
`check("undo_sequence('ab#c')", 'ac')
check("undo_sequence('a##c')", 'c')
check("undo_sequence('abc')", 'abc')
check("undo_sequence('a#b#c#')", '')
check("undo_sequence('###')", '')
check("undo_sequence('')", '')`),
  ],
})
