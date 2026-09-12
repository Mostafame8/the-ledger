# Reference solutions for lesson put-them-in-order. Blocks: "# === <node-id>/<step-index>".

# === put-them-in-order/4
import functools

@functools.total_ordering
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def _key(self):
        return (self.price, self.name)
    def __eq__(self, other):
        return self._key() == other._key() if isinstance(other, Item) else NotImplemented
    def __lt__(self, other):
        return self._key() < other._key() if isinstance(other, Item) else NotImplemented

# === put-them-in-order/5
import functools

@functools.total_ordering
class Version:
    def __init__(self, text):
        self.text = text
        self.parts = tuple(int(p) for p in text.split('.'))
    def __eq__(self, other):
        return self.parts == other.parts if isinstance(other, Version) else NotImplemented
    def __lt__(self, other):
        return self.parts < other.parts if isinstance(other, Version) else NotImplemented
    def __repr__(self):
        return f"Version({self.text!r})"

def newest(versions):
    return max(versions).text
