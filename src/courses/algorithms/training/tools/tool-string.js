import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-string', {
  xp: 30, title: 'The paper tape', algo: 'String',
  steps: [
    explain([
      'The fence writes on paper tape. One serial per strip, printed end to end, no spaces and no gaps.',
      'Dax takes a pen to a strip and scratches a character out. “Wrong digit. Fixed.”',
      '“You cannot fix a tape. Nobody can. You read pieces off it and you print a new one, and the old strip goes in the fire.”',
    ], { code:
`tape = 'HB4417'
tape[0]                 # 'H'
tape[-1]                # '7'
tape[2:4]               # '44', a new tape
len(tape)               # 6
'44' in tape            # True
tape.lower()            # 'hb4417', and tape is still 'HB4417'
list(tape)              # ['H', 'B', '4', '4', '1', '7']
''.join(['H', 'B'])     # 'HB'
tape[0] = 'X'           # TypeError. A tape does not take corrections`,
      scene: { kind: 'cells', data: 'HB4417', ranges: [[0, 1], [2, 5]] },
    }),
    explain([
      '“A tape is frozen the moment it is printed. Every method that looks like a change hands you a new tape and leaves the old one exactly as it was.”',
      '“So growing a tape one character at a time with + prints a whole fresh strip on every pass of the loop. Collect the characters in a crate and join them once at the end.”',
      '“Reading is cheap. One character by number is one move. A slice costs a move for every character it copies, and so does in, and so does join.”',
    ]),
    trace(
`def relabel(tape):
    head = tape[:2]
    body = tape[2:]
    out = ''.join([head.lower(), '-', body])
    return tape`,
      "relabel('HB4417')",
      [
        { line: 2, state: { head: 'HB' }, ask: 'head', note: 'A slice from the start up to but not including index 2. Two characters, on a new tape of their own.' },
        { line: 3, state: { head: 'HB', body: '4417' }, ask: 'body', note: 'Leave the end off a slice and it runs to the end of the tape. The two slices together cover the original and neither one is the original.' },
        { line: 4, state: { head: 'HB', body: '4417', out: 'hb-4417' }, ask: 'out', note: 'lower() printed a new strip, and join glued three strips into a fourth. Four tapes exist now and not one of them was edited.' },
        { line: 5, state: { head: 'HB', body: '4417', out: 'hb-4417', returns: 'HB4417' }, ask: 'returns', note: 'The tape we were handed is untouched. Nothing in that function could have changed it even by accident.' },
      ],
      { scene: { kind: 'cells', data: 'HB4417', ranges: [[0, 1], [2, 5]] } }),
    blank('“Two hands on the tape. One reads me the first character, and an empty strip has no first character. One takes a crate of pieces and prints them as a single strip, no separator.”',
`def head_char(tape):
    if not tape:
        return None
    return ___

def stitch(pieces):
    return ___`,
`check("head_char('HB4417')", 'H')
check("head_char('7')", '7')
check("head_char('')", None)
check("stitch(['HB', '44', '17'])", 'HB4417')
check("stitch(['H'])", 'H')
check("stitch([])", '')`),
  ],
})
