import { tool, explain, trace, blank } from '../../../../training/node.js'

export default tool('tool-queue', {
  xp: 30, title: 'The teller line', algo: 'Queue (deque)',
  steps: [
    explain([
      'Halden Bank runs one line for all four tellers. First through the door is first served, and nobody at the back moves until the front does.',
      'Dax: “Crate. Join on the end, take from index nought. Same thing.”',
      '“pop(0) walks every single person in that line up one step. Twelve people, fine. Twelve hundred and you are the queue.”',
    ], { code:
`from collections import deque

line = deque(['ana', 'boyd'])
line.append('cass')     # joins the back
line.popleft()          # 'ana', served and gone from the front
line[0]                 # 'boyd', who is next without serving them
len(line)               # 2
if line: ...            # an empty line is falsy
list(line)              # ['boyd', 'cass'], front to back
deque()                 # an empty line`,
      scene: { kind: 'cells', data: 'list(line)', init: ['ana', 'boyd'], marks: ['first'],
        states: [{ 'list(line)': ['ana', 'boyd'] }, { 'list(line)': ['ana', 'boyd', 'cass'] }, { first: 'ana', 'list(line)': ['boyd', 'cass'] }, { first: 'ana', 'list(line)': ['boyd', 'cass', 'dov'] }] },
    }),
    explain([
      '“append puts one on the back, popleft takes one off the front, and both are one move however long the line runs. That is the whole reason the thing exists.”',
      '“First in, first out. When you want everything one step away before anything two steps away, the line is what holds that order for you and you never have to think about it.”',
      '“It is not a crate. Reaching into the middle by number costs a walk from one end, so only ever index the ends. And popleft on an empty line raises IndexError, same as the tray of plates.”',
    ]),
    trace(
`from collections import deque

def serve(line):
    line.append('cass')
    first = line.popleft()
    line.append('dov')
    return list(line)`,
      "serve(deque(['ana', 'boyd']))",
      [
        { line: 4, state: { 'list(line)': ['ana', 'boyd', 'cass'] }, ask: 'list(line)', note: 'cass joins the back, behind the two already waiting. A deque prints as deque([...]), so we look at it through list() instead.' },
        { line: 5, state: { first: 'ana', 'list(line)': ['boyd', 'cass'] }, ask: 'first', note: 'popleft serves the front of the line, which is the one who joined first. ana was there before either of the others.' },
        { line: 6, state: { first: 'ana', 'list(line)': ['boyd', 'cass', 'dov'] }, ask: 'list(line)', note: 'dov joins the back while boyd is still at the front. Neither end disturbs the other, and neither cost more than one move.' },
        { line: 7, state: { first: 'ana', 'list(line)': ['boyd', 'cass', 'dov'], returns: ['boyd', 'cass', 'dov'] }, ask: 'returns', note: 'Front to back, in the order they will be served. On a crate that same popleft would have shifted every remaining name along by one.' },
      ],
      { scene: { kind: 'cells', data: 'list(line)', init: ['ana', 'boyd'], marks: ['first'] } }),
    blank('“Two hands on the line. One puts a name on the back. One tells me who is next without serving them, and an empty line has nobody next.”',
`from collections import deque

def join_line(line, name):
    ___
    return list(line)

def next_up(line):
    if not line:
        return None
    return ___`,
`check("join_line(deque(['ana']), 'boyd')", ['ana', 'boyd'])
check("join_line(deque(), 'ana')", ['ana'])
check("next_up(deque(['ana', 'boyd']))", 'ana')
check("next_up(deque(['ana']))", 'ana')
check("next_up(deque())", None)
def _t_peeked(names):
    q = deque(names)
    next_up(q)
    return list(q)
check("next_up serves nobody", lambda: _t_peeked(['ana', 'boyd']), ['ana', 'boyd'])`),
  ],
})
