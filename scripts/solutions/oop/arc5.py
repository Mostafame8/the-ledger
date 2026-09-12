# Reference solutions for Arc V of the oop course. One block per gate, introduced by "# === <id>".
# Run with npm test. These exist to prove the tests, not to be shown to learners.

# === typedfield
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

# === attributetrap
class Record:
    def __init__(self, **fields):
        object.__setattr__(self, '_data', dict(fields))
        object.__setattr__(self, '_log', [])
    def __getattr__(self, name):
        if name.startswith('_'):
            raise AttributeError(name)
        try:
            return self._data[name]
        except KeyError:
            raise AttributeError(f"no field {name!r}") from None
    def __setattr__(self, name, value):
        self._data[name] = value
        self._log.append((name, value))
    def changes(self):
        return list(self._log)

# === selfregister
class Entry:
    kinds = {}
    def __init_subclass__(cls, kind=None, **kw):
        super().__init_subclass__(**kw)
        Entry.kinds[kind or cls.__name__.lower()] = cls
    @classmethod
    def build(cls, kind, *args):
        return cls.kinds[kind](*args)

class Cash(Entry):
    def __init__(self, amount):
        self.amount = amount

class Gem(Entry, kind='stone'):
    def __init__(self, amount):
        self.amount = amount

# === manifest
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

class Line:
    price = Positive()
    qty = Positive()
    def __init__(self, name, price, qty):
        self.name = name
        self.price = price
        self.qty = qty
    @property
    def worth(self):
        return self.price * self.qty
    def __eq__(self, other):
        if not isinstance(other, Line):
            return NotImplemented
        return (self.name, self.price, self.qty) == (other.name, other.price, other.qty)
    def __hash__(self):
        return hash((self.name, self.price, self.qty))
    def __repr__(self):
        return f"Line({self.name!r}, {self.price}, {self.qty})"

class Manifest:
    def __init__(self):
        self.items = []
        self.sealed = False
    def add(self, line):
        if self.sealed:
            raise RuntimeError('manifest is sealed')
        self.items.append(line)
    def __len__(self):
        return len(self.items)
    def __getitem__(self, i):
        return self.items[i]
    def __iter__(self):
        return iter(self.items)
    def __contains__(self, name):
        return any(l.name == name for l in self.items)
    def total(self):
        return sum(l.worth for l in self.items)
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        self.sealed = True
        return False
    @classmethod
    def from_lines(cls, text):
        m = cls()
        for row in text.splitlines():
            if not row.strip():
                continue
            name, price, qty = (p.strip() for p in row.split(','))
            m.add(Line(name, int(price), int(qty)))
        return m
