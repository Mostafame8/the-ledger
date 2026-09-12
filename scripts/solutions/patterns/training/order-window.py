# Reference solutions for lesson order-window. Blocks: "# === <node-id>/<step-index>".

# === order-window/4
class Cutter:
    def use(self): return 'cutting'
class Torch:
    def use(self): return 'burning'

KINDS = {'cutter': Cutter, 'torch': Torch}

def make(kind):
    cls = KINDS.get(kind)
    if cls is None:
        raise ValueError(kind)
    return cls()

# === order-window/5
class Kitchen:
    def __init__(self):
        self.recipes = {}
    def register(self, name, recipe):
        self.recipes[name] = recipe
    def cook(self, name):
        return self.recipes[name]()
    def menu(self):
        return sorted(self.recipes)
