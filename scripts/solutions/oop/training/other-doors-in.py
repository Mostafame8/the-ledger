# Reference solutions for lesson other-doors-in. Blocks: "# === <node-id>/<step-index>".

# === other-doors-in/4
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

class Stolen(Item):
    pass

# === other-doors-in/5
class Temp:
    def __init__(self, celsius):
        self.celsius = celsius
    @classmethod
    def from_f(cls, f):
        return cls((f - 32) * 5 / 9)
    @staticmethod
    def valid(c):
        return c >= -273.15
    @property
    def f(self):
        return self.celsius * 9 / 5 + 32

class Reading(Temp):
    note = 'field'
