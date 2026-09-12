# Reference solutions for lesson same-or-equal. Blocks: "# === <node-id>/<step-index>".

# === same-or-equal/4
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

# === same-or-equal/5
class Coord:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __eq__(self, other):
        if not isinstance(other, Coord):
            return NotImplemented
        return (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))
    def __repr__(self):
        return f"Coord({self.x}, {self.y})"

def visited(path):
    return len(set(path))
