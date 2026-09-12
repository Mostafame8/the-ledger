# Reference solutions for Arc III of the oop course. One block per gate, introduced by "# === <id>".
# Run with npm test. These exist to prove the tests, not to be shown to learners.

# === sameorequal
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def __eq__(self, other):
        if not isinstance(other, Item):
            return NotImplemented
        return (self.name, self.price) == (other.name, other.price)
    def __hash__(self):
        return hash((self.name, self.price))

def distinct(items):
    return len(set(items))

# === inorder
import functools

@functools.total_ordering
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def __eq__(self, other):
        if not isinstance(other, Item):
            return NotImplemented
        return (self.price, self.name) == (other.price, other.name)
    def __lt__(self, other):
        if not isinstance(other, Item):
            return NotImplemented
        return (self.price, self.name) < (other.price, other.name)

def by_price(items):
    return [i.name for i in sorted(items)]

def cheapest(items):
    return min(items)

# === countandreach
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price

class Bag:
    def __init__(self):
        self.items = []
    def add(self, item):
        self.items.append(item)
    def __len__(self):
        return len(self.items)
    def __getitem__(self, i):
        return self.items[i]
    def __contains__(self, name):
        return any(i.name == name for i in self.items)

# === walkthebag
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price

class BagWalk:
    def __init__(self, items):
        self.items = items
        self.i = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.i >= len(self.items):
            raise StopIteration
        item = self.items[self.i]
        self.i += 1
        return item.name

class Bag:
    def __init__(self):
        self.items = []
    def add(self, item):
        self.items.append(item)
    def __iter__(self):
        return BagWalk(self.items)

def names(bag):
    return list(bag)
