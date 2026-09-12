# Reference solutions for Arc IV of the oop course. One block per gate, introduced by "# === <id>".
# Run with npm test. These exist to prove the tests, not to be shown to learners.

# === guardedprice
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    @property
    def price(self):
        return self._price
    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError('price below zero')
        self._price = value
    @property
    def label(self):
        return f"{self.name} @ {self.price}"

# === fromline
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    @staticmethod
    def parse_price(text):
        return float(text) if '.' in text else int(text)
    @classmethod
    def from_line(cls, line):
        name, price = line.split(',')
        return cls(name.strip(), cls.parse_price(price.strip()))
    @classmethod
    def from_lines(cls, text):
        return [cls.from_line(line) for line in text.splitlines() if line.strip()]

class Stolen(Item):
    pass

# === frozenentry
from dataclasses import dataclass, field

@dataclass(frozen=True, order=True)
class Entry:
    price: int
    name: str
    tags: tuple = field(default_factory=tuple)

def total(entries):
    return sum(e.price for e in entries)

# === sealedbag
class Bag:
    def __init__(self):
        self.items = []
        self.sealed = False
    def add(self, item):
        if self.sealed:
            raise RuntimeError('bag is sealed')
        self.items.append(item)
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        self.sealed = True
        return False
