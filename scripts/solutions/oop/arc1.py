# Reference solutions for Arc I of the oop course. One block per gate, introduced by "# === <id>".
# Run with npm test. These exist to prove the tests, not to be shown to learners.

# === tag
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price

# === worth
class Item:
    def __init__(self, name, price, qty=1):
        self.name = name
        self.price = price
        self.qty = qty
    def worth(self):
        return self.price * self.qty

class Bag:
    def __init__(self):
        self.items = []
    def add(self, item):
        self.items.append(item)
    def count(self):
        return len(self.items)
    def total(self):
        return sum(i.worth() for i in self.items)

# === readback
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def __repr__(self):
        return f"Item({self.name!r}, {self.price})"
    def __str__(self):
        return f"{self.name} @ {self.price}"

# === sharedink
class Tag:
    made = 0
    prefix = 'HB'
    def __init__(self, name):
        self.name = name
        Tag.made += 1
        self.serial = f"{self.prefix}{Tag.made:03d}"
