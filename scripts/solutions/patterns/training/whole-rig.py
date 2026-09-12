# Reference solutions for lesson whole-rig. Blocks: "# === <node-id>/<step-index>".

# === whole-rig/4
class Shop:
    def __init__(self):
        self.kinds, self.ears = {}, {}
    def register(self, kind, cls):
        self.kinds[kind] = cls
    def on(self, event, fn):
        self.ears.setdefault(event, []).append(fn)
    def emit(self, event, payload):
        fns = self.ears.get(event, [])
        for fn in fns:
            fn(payload)
        return len(fns)
    def sell(self, kind):
        item = self.kinds[kind]()
        self.emit('sold', item)
        return item

# === whole-rig/5
class Dispatch:
    def __init__(self):
        self.roles, self.ears, self.strategy = {}, {}, None
    def register(self, role, cls):
        self.roles[role] = cls
    def assign(self, role):
        member = self.roles[role]()
        self.emit('assigned', member)
        return member
    def on(self, event, fn):
        self.ears.setdefault(event, []).append(fn)
    def emit(self, event, payload):
        fns = self.ears.get(event, [])
        for fn in fns:
            fn(payload)
        return len(fns)
    def route(self, strategy):
        self.strategy = strategy
    def send(self, city):
        return self.strategy.path(city)

class Straight:
    def path(self, city):
        return f"{city} direct"
