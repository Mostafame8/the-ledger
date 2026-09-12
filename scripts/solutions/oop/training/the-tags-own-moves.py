# Reference solutions for lesson the-tags-own-moves. Blocks: "# === <node-id>/<step-index>".

# === the-tags-own-moves/4
class Bag:
    def __init__(self):
        self.items = []
    def add(self, item):
        self.items.append(item)
        return self
    def total(self):
        return sum(i.worth() for i in self.items)

# === the-tags-own-moves/5
class Counter:
    def __init__(self, start=0):
        self.start = start
        self.n = start
    def tick(self):
        self.n += 1
        return self
    def reset(self):
        self.n = self.start
        return self
    def value(self):
        return self.n
