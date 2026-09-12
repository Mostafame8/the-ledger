# Reference solutions for lesson walk-the-bag. Blocks: "# === <node-id>/<step-index>".

# === walk-the-bag/4
class Bag:
    def __init__(self):
        self._items = []
    def add(self, item):
        self._items.append(item)
        return self
    def __iter__(self):
        return BagWalk(self._items)

class BagWalk:
    def __init__(self, items):
        self._items = items
        self._i = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self._i >= len(self._items):
            raise StopIteration
        item = self._items[self._i]
        self._i += 1
        return item

# === walk-the-bag/5
class Countdown:
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        for k in range(self.n, 0, -1):
            yield k

class Pairs:
    def __init__(self, items):
        self.items = items
    def __iter__(self):
        for i in range(len(self.items) - 1):
            yield (self.items[i], self.items[i + 1])

def total_gaps(values):
    return sum(b - a for a, b in Pairs(values))
