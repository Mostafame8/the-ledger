# Reference solutions for Arc IV of the patterns course. One block per gate, introduced by "# === <id>".
# Run with npm test. These exist to prove the tests, not to be shown to learners.

# === threeways
class Sewer:
    def path(self, start):
        return f"{start} -> sewer"

class Rooftop:
    def path(self, start):
        return f"{start} -> rooftop"

class Cab:
    def path(self, start):
        return f"{start} -> cab"

class Escape:
    def __init__(self, route):
        self.route = route
    def go(self, start):
        return self.route.path(start)
    def switch(self, route):
        self.route = route

# === hearthewire
class Tripwire:
    def __init__(self):
        self.ears = []
    def subscribe(self, fn):
        self.ears.append(fn)
        return fn
    def unsubscribe(self, fn):
        if fn in self.ears:
            self.ears.remove(fn)
    def trip(self, where):
        for fn in list(self.ears):
            fn(where)
        return len(self.ears)

# === takeitback
class Move:
    def __init__(self, dx, dy):
        self.dx = dx
        self.dy = dy
    def do(self, pos):
        return (pos[0] + self.dx, pos[1] + self.dy)
    def undo(self, pos):
        return (pos[0] - self.dx, pos[1] - self.dy)

class Recorder:
    def __init__(self):
        self.done = []
        self.undone = []
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
    def redo(self, pos):
        if not self.undone:
            return pos
        cmd = self.undone.pop()
        self.done.append(cmd)
        return cmd.do(pos)

# === wireboard
class Bus:
    def __init__(self):
        self.lists = {}
    def on(self, kind, fn):
        self.lists.setdefault(kind, []).append(fn)
    def off(self, kind, fn):
        if fn in self.lists.get(kind, []):
            self.lists[kind].remove(fn)
    def emit(self, kind, payload):
        ears = list(self.lists.get(kind, []))
        for fn in ears:
            fn(payload)
        return len(ears)
