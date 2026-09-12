# Reference solutions for lesson mood-of-the-mark. Blocks: "# === <node-id>/<step-index>".

# === mood-of-the-mark/4
class Green:
    name = 'green'
    def next(self): return Amber()

class Amber:
    name = 'amber'
    def next(self): return Red()

class Red:
    name = 'red'
    def next(self): return Green()

class Light:
    def __init__(self):
        self.state = Green()
    def step(self):
        self.state = self.state.next()
    @property
    def colour(self):
        return self.state.name

# === mood-of-the-mark/5
class Locked:
    name = 'locked'
    def coin(self, turnstile):
        return Unlocked()
    def push(self, turnstile):
        return self

class Unlocked:
    name = 'unlocked'
    def coin(self, turnstile):
        return self
    def push(self, turnstile):
        return Locked()

class Turnstile:
    def __init__(self):
        self.state = Locked()
        self.log = []
    def _move(self, new_state):
        if new_state.name != self.state.name:
            self.log.append(new_state.name)
        self.state = new_state
    def coin(self):
        self._move(self.state.coin(self))
    def push(self):
        self._move(self.state.push(self))
    @property
    def state_name(self):
        return self.state.name
