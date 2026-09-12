# Reference solutions for lesson the-gatekeeper. Blocks: "# === <node-id>/<step-index>".

# === the-gatekeeper/4
class Positive:
    def __set_name__(self, owner, name):
        self.private = '_' + name
    def __get__(self, obj, owner):
        if obj is None:
            return self
        return getattr(obj, self.private)
    def __set__(self, obj, value):
        if not value > 0:
            raise ValueError(f"{self.private[1:]} must be positive")
        setattr(obj, self.private, value)

class Entry:
    price = Positive()
    qty = Positive()
    def __init__(self, price, qty):
        self.price = price
        self.qty = qty

# === the-gatekeeper/5
class Typed:
    def __init__(self, kind):
        self.kind = kind
    def __set_name__(self, owner, name):
        self.private = '_' + name
    def __get__(self, obj, owner):
        if obj is None:
            return self
        return getattr(obj, self.private)
    def __set__(self, obj, value):
        if not isinstance(value, self.kind):
            raise TypeError(f"{self.private[1:]} must be {self.kind.__name__}")
        setattr(obj, self.private, value)

class Line:
    name = Typed(str)
    qty = Typed(int)
    def __init__(self, name, qty):
        self.name = name
        self.qty = qty
