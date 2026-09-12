# Reference solutions for lesson undo-button. Blocks: "# === <node-id>/<step-index>".

# === undo-button/4
class Append:
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
        self.done.append(cmd)
    def undo(self, log):
        if not self.done:
            return
        cmd = self.done.pop()
        cmd.undo(log)

# === undo-button/5
class SetCell:
    def __init__(self, row, col, value):
        self.row, self.col, self.value = row, col, value
        self.old = None
    def do(self, grid):
        self.old = grid[self.row][self.col]
        grid[self.row][self.col] = self.value
    def undo(self, grid):
        grid[self.row][self.col] = self.old

class Sheet:
    def __init__(self, grid):
        self.grid = grid
        self.done = []
    def run(self, cmd):
        cmd.do(self.grid)
        self.done.append(cmd)
    def undo(self):
        if not self.done:
            return
        self.done.pop().undo(self.grid)
