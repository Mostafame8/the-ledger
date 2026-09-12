# Reference solutions for lesson tripwire. Blocks: "# === <node-id>/<step-index>".

# === tripwire/4
class Bell:
    def __init__(self):
        self.ears = []
    def on(self, fn):
        self.ears.append(fn)
    def ring(self, msg):
        for fn in self.ears:
            fn(msg)
        return len(self.ears)

# === tripwire/5
class Ticker:
    def __init__(self):
        self.price = None
        self.watchers = []
    def watch(self, fn):
        self.watchers.append(fn)
    def set(self, price):
        if price == self.price:
            return False
        old, self.price = self.price, price
        for fn in self.watchers:
            fn(old, price)
        return True
