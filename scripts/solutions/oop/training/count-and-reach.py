# Reference solutions for lesson count-and-reach. Blocks: "# === <node-id>/<step-index>".

# === count-and-reach/4
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price

class Bag:
    def __init__(self):
        self._items = []
    def add(self, item):
        self._items.append(item)
        return self
    def __len__(self):
        return len(self._items)
    def __getitem__(self, i):
        return self._items[i]
    def __contains__(self, name):
        return any(it.name == name for it in self._items)

# === count-and-reach/5
class Shelf:
    def __init__(self, width):
        self.width = width
        self._items = []
    def put(self, item):
        if len(self._items) >= self.width:
            raise ValueError('shelf is full')
        self._items.append(item)
        return self
    def __len__(self):
        return len(self._items)
    def __getitem__(self, i):
        return self._items[i]
    def __contains__(self, name):
        return any(it.name == name for it in self._items)

def names(shelf):
    out = []
    for item in shelf:
        out.append(item.name)
    return out
