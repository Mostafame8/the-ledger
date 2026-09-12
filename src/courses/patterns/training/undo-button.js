import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('undo-button', {
  tier: 'B', xp: 160, requires: ['pick-the-play'], gates: ['takeitback'],
  tools: ['tool-dataclass'],
  title: 'The undo button', algo: 'Command',
  steps: [
    explain([
      'Dax on the floor plan with the drill cart, moving it square by square. Three moves in he wants the second one back. He kept the last position, so he can undo once, and only the last.',
      'Dax: “I will keep the last two.” “And the third time?”',
    ], { move: 'brute force' }),
    explain([
      '“Make each move an object that knows how to do itself and how to undo itself. Keep the done ones on a stack. Undo pops one and asks it to reverse. Redo is the same idea the other way. The recorder never knows what a move does.”',
      '“Anything you want to queue, log, replay or take back is happier as an object than as a function call that already happened.”',
    ], { move: 'pick the pattern', code:
`from dataclasses import dataclass

@dataclass
class Move:
    dx: int
    dy: int
    def do(self, pos):
        return (pos[0] + self.dx, pos[1] + self.dy)
    def undo(self, pos):
        return (pos[0] - self.dx, pos[1] - self.dy)

class Recorder:
    def __init__(self):
        self.done, self.undone = [], []
    def run(self, cmd, pos):
        self.done.append(cmd)
        self.undone.clear()
        return cmd.do(pos)
    def undo(self, pos):
        if not self.done:
            return pos
        cmd = self.done.pop()
        self.undone.append(cmd)
        return cmd.undo(pos)` }),
    trace(
`from dataclasses import dataclass

@dataclass
class Move:
    dx: int
    dy: int
    def do(self, pos):
        return (pos[0] + self.dx, pos[1] + self.dy)
    def undo(self, pos):
        return (pos[0] - self.dx, pos[1] - self.dy)

class Recorder:
    def __init__(self):
        self.done, self.undone = [], []
    def run(self, cmd, pos):
        self.done.append(cmd)
        self.undone.clear()
        return cmd.do(pos)
    def undo(self, pos):
        if not self.done:
            return pos
        cmd = self.done.pop()
        self.undone.append(cmd)
        return cmd.undo(pos)

def cart():
    r = Recorder()
    p = r.run(Move(1, 0), (0, 0))
    p = r.run(Move(0, 5), p)
    p = r.undo(p)
    return p`,
      'cart()',
      [
        { line: 28, state: { p: { py: '(1, 0)' }, done: 1 }, ask: 'p', note: 'run asks the move to do itself and keeps the move on the done stack. The recorder did not add anything to anything; the move did.' },
        { line: 29, state: { p: { py: '(1, 5)' }, done: 2 }, ask: 'p', note: 'Second move, second entry on the stack. Both moves are still there, in order, ready to be reversed.' },
        { line: 22, state: { cmd: { py: 'Move(dx=0, dy=5)' }, done: 1 }, ask: 'cmd', note: 'undo pops the most recent move. It is an object, so the recorder can hand it the position and ask it to reverse itself.' },
        { line: 30, state: { p: { py: '(1, 0)' }, done: 1, undone: 1 }, ask: 'p', note: 'Move(0, 5).undo subtracts what do added. The first move is still on the stack, so a second undo would work too.' },
        { line: 31, state: { p: { py: '(1, 0)' }, done: 1, undone: 1, returns: { py: '(1, 0)' } }, ask: 'returns', note: 'As many undos as moves, and redo comes free from the undone stack. Saving the last position could never do this.' },
      ]),
    spot('Dax stores the last position so he can undo. He undoes twice. Where is the second one?',
      ['Gone: one saved position is one undo; a stack of move objects, each able to reverse itself, gives as many undos as moves',
       'In the redo list',
       'In the first undo',
       'Python keeps it'],
      0, 'Saving state gives you one step back. Saving the moves themselves, as objects with do and undo, gives you the whole history, plus replay and redo for free. That is a command.'),
    blank('“Each append knows how to undo itself. History keeps them on a stack.”',
`class Append:
    def __init__(self, text):
        self.text = text
    def do(self, log):
        log.append(self.text)
    def undo(self, log):
        log.pop()

class History:
    def __init__(self):
        self.done = []
    def run(self, cmd, log):
        cmd.do(log)
        ___
    def undo(self, log):
        if not self.done:
            return
        cmd = ___
        cmd.undo(log)`,
`_t_log = []; _t_h = History()
_t_h.run(Append('a'), _t_log); _t_h.run(Append('b'), _t_log)
check("two appends", _t_log, ['a', 'b'])
_t_h.undo(_t_log)
check("undo removes the last", _t_log, ['a'])
_t_h.undo(_t_log)
check("and the one before", _t_log, [])
_t_h.undo(_t_log)
check("an empty history is a no-op", _t_log, [])
check("Append('x').text", 'x')`),
    mini('Write class SetCell built with row, col and value, with do(grid) that remembers the old value at grid[row][col] and writes the new one, and undo(grid) that restores the old value. Then class Sheet built with a grid (a list of lists), with run(cmd) applying the command to its grid and remembering it, and undo() reversing the most recent command; undo() with nothing to undo does nothing. Sheet exposes the grid as sheet.grid.',
      'SetCell stores the previous value inside do so undo can put it back. Sheet is History with its own grid: a done stack, run pushes, undo pops and reverses.',
`_t_s = Sheet([[0, 0], [0, 0]])
_t_s.run(SetCell(0, 1, 7))
check("run writes the cell", _t_s.grid, [[0, 7], [0, 0]])
_t_s.run(SetCell(0, 1, 9))
check("a second write over the same cell", _t_s.grid, [[0, 9], [0, 0]])
_t_s.undo()
check("undo restores the earlier value, not zero", _t_s.grid, [[0, 7], [0, 0]])
_t_s.undo(); _t_s.undo()
check("undo past the start does nothing", _t_s.grid, [[0, 0], [0, 0]])
_t_c = SetCell(1, 0, 3); _t_g = [[1, 2], [3, 4]]; _t_c.do(_t_g); _t_c.undo(_t_g)
check("do then undo is a round trip", _t_g, [[1, 2], [3, 4]])`),
  ],
})
