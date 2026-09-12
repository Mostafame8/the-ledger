# Reference solutions for lesson the-class-that-stamps-classes. Blocks: "# === <node-id>/<step-index>".

# === the-class-that-stamps-classes/4
class Entry:
    kinds = {}
    def __init_subclass__(cls, kind=None, **kw):
        super().__init_subclass__(**kw)
        Entry.kinds[kind or cls.__name__.lower()] = cls
    @classmethod
    def build(cls, kind, *args):
        return cls.kinds[kind](*args)

class Cash(Entry):
    def __init__(self, amount): self.amount = amount

class Gem(Entry, kind='stone'):
    def __init__(self, amount): self.amount = amount

# === the-class-that-stamps-classes/5
class Named(type):
    def __new__(mcls, name, bases, ns):
        ns['label'] = name.lower()
        return super().__new__(mcls, name, bases, ns)

class Loot(metaclass=Named):
    pass

class Cash(Loot):
    pass

def labels(*classes):
    return [c.label for c in classes]
