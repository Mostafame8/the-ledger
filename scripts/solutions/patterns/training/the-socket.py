# Reference solutions for lesson the-socket. Blocks: "# === <node-id>/<step-index>".

# === the-socket/4
class Report:
    def __init__(self, store):
        self.store = store
    def save(self, text):
        self.store.put(text)
        return len(text)

class MemoryStore:
    def __init__(self):
        self.items = []
    def put(self, text):
        self.items.append(text)

# === the-socket/5
class Greeter:
    def __init__(self, clock):
        self.clock = clock
    def greet(self, name):
        part = 'morning' if self.clock.hour() < 12 else 'evening'
        return f"Good {part}, {name}"

class FixedClock:
    def __init__(self, hour):
        self._hour = hour
    def hour(self):
        return self._hour
