# Reference solutions for lesson the-guarded-field. Blocks: "# === <node-id>/<step-index>".

# === the-guarded-field/4
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

# === the-guarded-field/5
class Vault:
    def __init__(self, capacity):
        self.capacity = capacity
        self._load = 0
    @property
    def load(self):
        return self._load
    @load.setter
    def load(self, value):
        if value < 0 or value > self.capacity:
            raise ValueError('load out of range')
        self._load = value
    @property
    def free(self):
        return self.capacity - self.load
    def put(self, n):
        self.load = self.load + n
        return self
    def take(self, n):
        self.load = self.load - n
        return self
