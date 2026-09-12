# Reference solutions for lesson bolt-on. Blocks: "# === <node-id>/<step-index>".

# === bolt-on/4
class Rules:
    def __init__(self):
        self.rules = []
    def add(self, name, test):
        self.rules.append((name, test))
    def apply(self, value):
        for name, test in self.rules:
            if test(value):
                return name
        return 'none'

# === bolt-on/5
class Pipeline:
    def __init__(self):
        self.steps = []
    def add(self, step):
        self.steps.append(step)
    def run(self, value):
        for step in self.steps:
            value = step(value)
        return value
